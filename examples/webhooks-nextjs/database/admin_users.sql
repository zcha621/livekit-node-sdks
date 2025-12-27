-- Admin users table for storing administrator accounts
CREATE TABLE IF NOT EXISTS admin_users (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  full_name VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin account
-- Password: admin123 (hashed with bcrypt, cost factor 10)
-- You should change this password after first login
INSERT INTO admin_users (username, password_hash, email, full_name) 
VALUES (
  'admin', 
  '$2a$10$N9qo8uLOickgx2ZMRZoMye1J0ixRgGPvXXE7YRbMvVjPkC3V8m1d2',
  'admin@example.com',
  'System Administrator'
) ON DUPLICATE KEY UPDATE username = username;

-- Add an example secondary admin (optional)
-- Password: admin456
INSERT INTO admin_users (username, password_hash, email, full_name) 
VALUES (
  'support', 
  '$2a$10$ZkQeHXN5LqEpPJ0xK9m5COWJFvGx6vTqPqYqXQP5yR8K.OPB1T5Q.',
  'support@example.com',
  'Support Administrator'
) ON DUPLICATE KEY UPDATE username = username;
