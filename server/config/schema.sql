USE recycling_tracker;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('resident', 'collector', 'admin') NOT NULL DEFAULT 'resident',
  district VARCHAR(50) NOT NULL,
  points INT NOT NULL DEFAULT 0,
  level VARCHAR(50) NOT NULL DEFAULT 'Seedling',
  status ENUM('active', 'pending', 'inactive') NOT NULL DEFAULT 'active',
  password_changed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role_status (role, status),
  INDEX idx_users_district (district)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Recyclable categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  points_per_kg INT NOT NULL,
  co2_per_kg FLOAT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Resident listings
CREATE TABLE IF NOT EXISTS listings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  weight_kg FLOAT NOT NULL,
  photo_url VARCHAR(255),
  address VARCHAR(255) NOT NULL,
  available_time VARCHAR(100) NOT NULL,
  status ENUM('available', 'claimed', 'collected', 'cancelled') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_listings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_listings_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_listings_status_created (status, created_at),
  INDEX idx_listings_user (user_id),
  INDEX idx_listings_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Photos are stored in MySQL so the API works on serverless hosts without persistent disks
CREATE TABLE IF NOT EXISTS listing_photos (
  listing_id INT PRIMARY KEY,
  mime_type VARCHAR(100) NOT NULL,
  data LONGBLOB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_listing_photos_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Collector claims
CREATE TABLE IF NOT EXISTS claims (
  id INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT NOT NULL,
  collector_id INT NOT NULL,
  status ENUM('claimed', 'collected') NOT NULL DEFAULT 'claimed',
  claimed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  collected_at TIMESTAMP NULL,
  weight_kg FLOAT NULL,
  points_awarded INT NULL,
  co2_saved FLOAT NULL,
  CONSTRAINT fk_claims_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  CONSTRAINT fk_claims_collector FOREIGN KEY (collector_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_claims_listing (listing_id),
  INDEX idx_claims_collector_status (collector_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Badge definitions
CREATE TABLE IF NOT EXISTS badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NOT NULL,
  icon VARCHAR(100) NOT NULL,
  condition_type VARCHAR(50) NOT NULL,
  condition_value INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Earned badges
CREATE TABLE IF NOT EXISTS user_badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  badge_id INT NOT NULL,
  earned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_badges_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_badges_badge FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_badges (user_id, badge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- In-app notifications
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

-- Admin audit trail. Actor is nullable so logs survive user deletion.
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

-- One rating per collected claim
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

-- Password reset tokens store only SHA-256 hashes
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

-- Seed data is idempotent
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
