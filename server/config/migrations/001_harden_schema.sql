-- Additive migration for an existing EcoTrack database.
-- Safe to rerun: tables are created with IF NOT EXISTS and columns/indexes are
-- added only when missing. No existing rows are deleted by this script.
-- Run this before deploying the hardened backend.
--
-- If a UNIQUE index fails, resolve duplicate rows first, then rerun. The script
-- intentionally does not delete duplicates automatically.
--
-- Rollback: 001_harden_schema_rollback.sql (destructive; review before running).

USE recycling_tracker;

DROP PROCEDURE IF EXISTS add_column_if_missing;
DROP PROCEDURE IF EXISTS add_index_if_missing;

DELIMITER //
CREATE PROCEDURE add_column_if_missing(
  IN p_table VARCHAR(64),
  IN p_column VARCHAR(64),
  IN p_definition TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table
      AND COLUMN_NAME = p_column
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN `', p_column, '` ', p_definition);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END//

CREATE PROCEDURE add_index_if_missing(
  IN p_table VARCHAR(64),
  IN p_index VARCHAR(64),
  IN p_definition TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table
      AND INDEX_NAME = p_index
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', p_table, '` ADD ', p_definition);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END//
DELIMITER ;

-- Users: account lifecycle and token invalidation
CALL add_column_if_missing('users', 'status', 'ENUM(''active'', ''pending'', ''inactive'') NOT NULL DEFAULT ''active''');
CALL add_column_if_missing('users', 'password_changed_at', 'TIMESTAMP NULL');
CALL add_column_if_missing('users', 'updated_at', 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
CALL add_index_if_missing('users', 'idx_users_role_status', 'INDEX `idx_users_role_status` (`role`, `status`)');
CALL add_index_if_missing('users', 'idx_users_district', 'INDEX `idx_users_district` (`district`)');

-- Listings: cancellation support and lookup indexes
ALTER TABLE listings
  MODIFY COLUMN status ENUM('available', 'claimed', 'collected', 'cancelled') NOT NULL DEFAULT 'available';
CALL add_column_if_missing('listings', 'updated_at', 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
CALL add_index_if_missing('listings', 'idx_listings_status_created', 'INDEX `idx_listings_status_created` (`status`, `created_at`)');
CALL add_index_if_missing('listings', 'idx_listings_user', 'INDEX `idx_listings_user` (`user_id`)');
CALL add_index_if_missing('listings', 'idx_listings_category', 'INDEX `idx_listings_category` (`category_id`)');

-- Claims: one active claim per listing and immutable award snapshot
CALL add_column_if_missing('claims', 'weight_kg', 'FLOAT NULL');
CALL add_column_if_missing('claims', 'points_awarded', 'INT NULL');
CALL add_column_if_missing('claims', 'co2_saved', 'FLOAT NULL');
CALL add_index_if_missing('claims', 'uq_claims_listing', 'UNIQUE INDEX `uq_claims_listing` (`listing_id`)');
CALL add_index_if_missing('claims', 'idx_claims_collector_status', 'INDEX `idx_claims_collector_status` (`collector_id`, `status`)');

-- Stable seed keys
CALL add_index_if_missing('categories', 'uq_categories_name', 'UNIQUE INDEX `uq_categories_name` (`name`)');
CALL add_index_if_missing('badges', 'uq_badges_name', 'UNIQUE INDEX `uq_badges_name` (`name`)');
CALL add_index_if_missing('user_badges', 'uq_user_badges', 'UNIQUE INDEX `uq_user_badges` (`user_id`, `badge_id`)');

CREATE TABLE IF NOT EXISTS listing_photos (
  listing_id INT PRIMARY KEY,
  mime_type VARCHAR(100) NOT NULL,
  data LONGBLOB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_listing_photos_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  message VARCHAR(500) NOT NULL,
  link VARCHAR(255) NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user_read (user_id, is_read, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actor_id INT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NULL,
  details JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_actor (actor_id),
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS collector_ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  claim_id INT NOT NULL UNIQUE,
  resident_id INT NOT NULL,
  collector_id INT NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ratings_claim FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE,
  CONSTRAINT fk_ratings_resident FOREIGN KEY (resident_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ratings_collector FOREIGN KEY (collector_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_ratings_collector (collector_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_reset_tokens_user_expiry (user_id, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Backfill claim snapshots from the original listing values. Existing collected
-- claims keep their historical listing weight and category coefficients.
UPDATE claims cl
JOIN listings l ON l.id = cl.listing_id
JOIN categories c ON c.id = l.category_id
SET
  cl.weight_kg = COALESCE(cl.weight_kg, l.weight_kg),
  cl.points_awarded = COALESCE(cl.points_awarded, ROUND(l.weight_kg * c.points_per_kg)),
  cl.co2_saved = COALESCE(cl.co2_saved, ROUND(l.weight_kg * c.co2_per_kg, 3))
WHERE cl.weight_kg IS NULL OR cl.points_awarded IS NULL OR cl.co2_saved IS NULL;

-- Idempotent seed refresh
INSERT INTO categories (name, points_per_kg, co2_per_kg) VALUES
  ('Plastic', 10, 1.5),
  ('Paper', 5, 0.9),
  ('E-Waste', 20, 2.0),
  ('Glass', 8, 0.7),
  ('Metal', 15, 1.8)
ON DUPLICATE KEY UPDATE
  points_per_kg = VALUES(points_per_kg),
  co2_per_kg = VALUES(co2_per_kg);

INSERT INTO badges (name, description, icon, condition_type, condition_value) VALUES
  ('First Drop', 'Posted your first recyclable item', '🌱', 'listings_count', 1),
  ('E-Waste Warrior', 'Recycled 5 electronic items', '⚡', 'ewaste_count', 5),
  ('100kg Club', 'Recycled a total of 100kg', '💪', 'total_kg', 100),
  ('Eco Hero', 'Earned 500 points', '🏆', 'points', 500)
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  icon = VALUES(icon),
  condition_type = VALUES(condition_type),
  condition_value = VALUES(condition_value);

DROP PROCEDURE IF EXISTS add_column_if_missing;
DROP PROCEDURE IF EXISTS add_index_if_missing;
