USE recycling_tracker;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('resident', 'collector', 'admin') DEFAULT 'resident',
  district VARCHAR(50) NOT NULL,
  points INT DEFAULT 0,
  level VARCHAR(50) DEFAULT 'Seedling',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  points_per_kg INT NOT NULL,
  co2_per_kg FLOAT NOT NULL
);

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  weight_kg FLOAT NOT NULL,
  photo_url VARCHAR(255),
  address VARCHAR(255) NOT NULL,
  available_time VARCHAR(100) NOT NULL,
  status ENUM('available', 'claimed', 'collected') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Claims table
CREATE TABLE IF NOT EXISTS claims (
  id INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT NOT NULL,
  collector_id INT NOT NULL,
  status ENUM('claimed', 'collected') DEFAULT 'claimed',
  claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  collected_at TIMESTAMP NULL,
  FOREIGN KEY (listing_id) REFERENCES listings(id),
  FOREIGN KEY (collector_id) REFERENCES users(id)
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  icon VARCHAR(100) NOT NULL,
  condition_type VARCHAR(50) NOT NULL,
  condition_value INT NOT NULL
);

-- User badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  badge_id INT NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (badge_id) REFERENCES badges(id)
);

-- Insert default categories
INSERT INTO categories (name, points_per_kg, co2_per_kg) VALUES
('Plastic', 10, 1.5),
('Paper', 5, 0.9),
('E-Waste', 20, 2.0),
('Glass', 8, 0.7),
('Metal', 15, 1.8);

-- Insert default badges
INSERT INTO badges (name, description, icon, condition_type, condition_value) VALUES
('First Drop', 'Posted your first recyclable item', '🌱', 'listings_count', 1),
('E-Waste Warrior', 'Recycled 5 electronic items', '⚡', 'ewaste_count', 5),
('100kg Club', 'Recycled a total of 100kg', '💪', 'total_kg', 100),
('Eco Hero', 'Earned 500 points', '🏆', 'points', 500);