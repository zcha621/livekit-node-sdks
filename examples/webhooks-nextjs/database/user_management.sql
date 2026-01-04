-- ============================================
-- User Management Database (Separate from Agent Config)
-- ============================================

-- Create dedicated database for user management
CREATE DATABASE IF NOT EXISTS mira_user_mgmt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mira_user_mgmt;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS user_permissions;
DROP TABLE IF EXISTS admin_users;

-- ============================================
-- Main Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  user_type ENUM('admin', 'normal') DEFAULT 'normal',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT NULL COMMENT 'User ID of the admin who created this account',
  
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_user_type (user_type),
  INDEX idx_is_active (is_active),
  
  FOREIGN KEY (created_by) REFERENCES admin_users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- User Permissions Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_permissions (
  permission_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  permission_name VARCHAR(50) NOT NULL,
  permission_value BOOLEAN DEFAULT TRUE,
  granted_by INT NOT NULL COMMENT 'Admin user ID who granted this permission',
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_user_permission (user_id, permission_name),
  INDEX idx_user_permissions (user_id, permission_name),
  
  FOREIGN KEY (user_id) REFERENCES admin_users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES admin_users(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Password Reset Tokens
-- ============================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_token_hash (token_hash),
  INDEX idx_user_id (user_id),
  INDEX idx_expires (expires_at),
  
  FOREIGN KEY (user_id) REFERENCES admin_users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Available Permissions (Reference)
-- ============================================
-- 1. agent_builder_create     - Create/modify agents in agent builder
-- 2. agent_builder_delete     - Delete agents
-- 3. agent_config_edit        - Edit agent configurations
-- 4. agent_config_delete      - Delete agent configurations
-- 5. livekit_token_create     - Create LiveKit tokens for rooms
-- 6. livekit_room_manage      - Manage LiveKit rooms
-- 7. video_conference_access  - Access video conference features
-- 8. user_management_access   - Manage users and permissions (admin only)

-- ============================================
-- Stored Procedures
-- ============================================

DELIMITER //

-- Check if user has a specific permission
CREATE PROCEDURE sp_check_user_permission(
  IN p_user_id INT,
  IN p_permission_name VARCHAR(50)
)
BEGIN
  DECLARE v_user_type VARCHAR(10);
  
  -- Get user type
  SELECT user_type INTO v_user_type 
  FROM admin_users 
  WHERE user_id = p_user_id AND is_active = TRUE;
  
  -- Admin users have all permissions
  IF v_user_type = 'admin' THEN
    SELECT TRUE as has_permission, 'admin' as source;
  ELSE
    -- Check explicit permissions for normal users
    SELECT 
      COALESCE(MAX(permission_value), FALSE) as has_permission,
      'explicit' as source
    FROM user_permissions
    WHERE user_id = p_user_id AND permission_name = p_permission_name;
  END IF;
END //

-- Get all permissions for a user
CREATE PROCEDURE sp_get_user_permissions(
  IN p_user_id INT
)
BEGIN
  DECLARE v_user_type VARCHAR(10);
  
  SELECT user_type INTO v_user_type 
  FROM admin_users 
  WHERE user_id = p_user_id;
  
  IF v_user_type = 'admin' THEN
    -- Return all possible permissions for admin
    SELECT 
      'agent_builder_create' as permission_name, TRUE as has_permission, 'admin' as source
    UNION ALL SELECT 'agent_builder_delete', TRUE, 'admin'
    UNION ALL SELECT 'agent_config_edit', TRUE, 'admin'
    UNION ALL SELECT 'agent_config_delete', TRUE, 'admin'
    UNION ALL SELECT 'livekit_token_create', TRUE, 'admin'
    UNION ALL SELECT 'livekit_room_manage', TRUE, 'admin'
    UNION ALL SELECT 'video_conference_access', TRUE, 'admin'
    UNION ALL SELECT 'user_management_access', TRUE, 'admin';
  ELSE
    -- Return explicit permissions for normal users
    SELECT 
      permission_name,
      permission_value as has_permission,
      'explicit' as source
    FROM user_permissions
    WHERE user_id = p_user_id;
  END IF;
END //

-- Grant permission to a user (admin only)
CREATE PROCEDURE sp_grant_permission(
  IN p_user_id INT,
  IN p_permission_name VARCHAR(50),
  IN p_granted_by INT
)
BEGIN
  DECLARE v_target_user_type VARCHAR(10);
  
  -- Cannot grant permissions to admin users
  SELECT user_type INTO v_target_user_type
  FROM admin_users
  WHERE user_id = p_user_id;
  
  IF v_target_user_type = 'admin' THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Cannot grant permissions to admin users (they have all permissions)';
  ELSE
    INSERT INTO user_permissions (user_id, permission_name, permission_value, granted_by)
    VALUES (p_user_id, p_permission_name, TRUE, p_granted_by)
    ON DUPLICATE KEY UPDATE 
      permission_value = TRUE,
      granted_by = p_granted_by,
      updated_at = CURRENT_TIMESTAMP;
  END IF;
END //

-- Revoke permission from a user
CREATE PROCEDURE sp_revoke_permission(
  IN p_user_id INT,
  IN p_permission_name VARCHAR(50)
)
BEGIN
  DELETE FROM user_permissions
  WHERE user_id = p_user_id AND permission_name = p_permission_name;
END //

-- Create password reset token
CREATE PROCEDURE sp_create_reset_token(
  IN p_email VARCHAR(100),
  IN p_token_hash VARCHAR(255),
  IN p_expiry_hours INT
)
BEGIN
  DECLARE v_user_id INT;
  
  -- Get user ID from email
  SELECT user_id INTO v_user_id
  FROM admin_users
  WHERE email = p_email AND is_active = TRUE;
  
  IF v_user_id IS NULL THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'User not found or inactive';
  ELSE
    -- Invalidate any existing tokens for this user
    UPDATE password_reset_tokens
    SET is_used = TRUE
    WHERE user_id = v_user_id AND is_used = FALSE;
    
    -- Create new token
    INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
    VALUES (v_user_id, p_token_hash, DATE_ADD(NOW(), INTERVAL p_expiry_hours HOUR));
  END IF;
END //

-- Use password reset token
CREATE PROCEDURE sp_use_reset_token(
  IN p_token_hash VARCHAR(255)
)
BEGIN
  DECLARE v_user_id INT;
  DECLARE v_expires_at TIMESTAMP;
  DECLARE v_is_used BOOLEAN;
  
  -- Get token info
  SELECT user_id, expires_at, is_used
  INTO v_user_id, v_expires_at, v_is_used
  FROM password_reset_tokens
  WHERE token_hash = p_token_hash;
  
  IF v_user_id IS NULL THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Invalid reset token';
  ELSEIF v_is_used THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Reset token already used';
  ELSEIF v_expires_at < NOW() THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Reset token expired';
  ELSE
    -- Mark token as used
    UPDATE password_reset_tokens
    SET is_used = TRUE, used_at = NOW()
    WHERE token_hash = p_token_hash;
    
    -- Return user info
    SELECT user_id, username, email
    FROM admin_users
    WHERE user_id = v_user_id;
  END IF;
END //

DELIMITER ;

-- ============================================
-- Views
-- ============================================
CREATE OR REPLACE VIEW v_user_permissions_summary AS
SELECT 
  u.user_id,
  u.username,
  u.email,
  u.full_name,
  u.user_type,
  u.is_active,
  GROUP_CONCAT(up.permission_name ORDER BY up.permission_name SEPARATOR ', ') as permissions,
  COUNT(up.permission_id) as permission_count
FROM admin_users u
LEFT JOIN user_permissions up ON u.user_id = up.user_id AND up.permission_value = TRUE
GROUP BY u.user_id, u.username, u.email, u.full_name, u.user_type, u.is_active;

-- ============================================
-- Default Admin Account
-- ============================================
-- Password will be set by application
INSERT INTO admin_users (username, password_hash, email, full_name, user_type) 
VALUES (
  'admin', 
  '$2b$10$ufFCUSd6yFK1nqQg9pu95eDCp6Hde5RoArNyk5FSYRVeu6a9aiePu',
  'admin@example.com',
  'System Administrator',
  'admin'
) ON DUPLICATE KEY UPDATE username = username;

-- ============================================
-- Example Normal User
-- ============================================
INSERT INTO admin_users (username, password_hash, email, full_name, user_type, created_by) 
VALUES (
  'viewer', 
  '$2b$10$F3kBj.XG5eVZhkKW5MvF0.RvqE8jTpKEHYhqF0IqXKgJN5w2VxPFy',
  'viewer@example.com',
  'View Only User',
  'normal',
  1
) ON DUPLICATE KEY UPDATE username = username;

-- Grant some permissions to the normal user
INSERT INTO user_permissions (user_id, permission_name, granted_by)
SELECT 
  u.user_id, 
  'livekit_token_create',
  1
FROM admin_users u
WHERE u.username = 'viewer'
ON DUPLICATE KEY UPDATE permission_value = TRUE;

INSERT INTO user_permissions (user_id, permission_name, granted_by)
SELECT 
  u.user_id, 
  'video_conference_access',
  1
FROM admin_users u
WHERE u.username = 'viewer'
ON DUPLICATE KEY UPDATE permission_value = TRUE;

-- ============================================
-- Cleanup Job (Run Periodically)
-- ============================================
-- DELETE FROM password_reset_tokens WHERE expires_at < NOW() OR is_used = TRUE;
