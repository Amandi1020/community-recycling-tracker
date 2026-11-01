-- DESTRUCTIVE rollback for 001_harden_schema.sql.
-- This removes new tables and columns, including photos, notifications, ratings,
-- reset tokens, audit logs and claim award snapshots. Back up the database first.
-- Only run this if you intentionally want to return to the old schema.

USE recycling_tracker;

DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS collector_ratings;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS listing_photos;

ALTER TABLE claims
  DROP INDEX uq_claims_listing,
  DROP INDEX idx_claims_collector_status,
  DROP COLUMN weight_kg,
  DROP COLUMN points_awarded,
  DROP COLUMN co2_saved;

ALTER TABLE listings
  DROP INDEX idx_listings_status_created,
  DROP INDEX idx_listings_user,
  DROP INDEX idx_listings_category,
  DROP COLUMN updated_at,
  MODIFY COLUMN status ENUM('available', 'claimed', 'collected') NOT NULL DEFAULT 'available';

ALTER TABLE user_badges DROP INDEX uq_user_badges;
ALTER TABLE badges DROP INDEX uq_badges_name;
ALTER TABLE categories DROP INDEX uq_categories_name;

ALTER TABLE users
  DROP INDEX idx_users_role_status,
  DROP INDEX idx_users_district,
  DROP COLUMN updated_at,
  DROP COLUMN password_changed_at,
  DROP COLUMN status;
