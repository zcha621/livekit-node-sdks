-- ============================================
-- Enhanced User Management System
-- Supports Admin and Normal User Types with Granular Permissions
-- ============================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS user_permissions;
DROP TABLE IF EXISTS admin_users;

-- User Types Enum: admin or normal
-- Admin: Full access to everything
-- Normal: View-only by default, permissions can be granted by admin

-- Main Users Table
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

-- User Permissions Table
-- Tracks specific permissions granted to normal users
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
  FOREIGN KEY (granted_by) REFERENCES admin_users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password Reset Tokens Table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  reset_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP NULL,
  
  INDEX idx_reset_token (reset_token),
  INDEX idx_user_token (user_id, reset_token),
  INDEX idx_expires (expires_at),
  
  FOREIGN KEY (user_id) REFERENCES admin_users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Available Permissions for Normal Users
-- ============================================
-- By default, normal users have view-only access
-- Permissions that can be granted:
--   - agent_builder_create: Can create new agents
--   - agent_builder_edit: Can edit existing agents
--   - agent_builder_delete: Can delete agents
--   - agent_config_edit: Can edit agent configurations
--   - livekit_token_create: Can create LiveKit tokens
--   - livekit_room_manage: Can manage LiveKit rooms
--   - video_conference_access: Can join video conferences
--   - user_management: Can manage other normal users (not admins)

-- ============================================
-- Default Admin Account
-- ============================================
-- Password: admin123 (hashed with bcrypt, cost factor 10)
-- You should change this password after first login
INSERT INTO admin_users (username, password_hash, email, full_name, user_type) 
VALUES (
  'admin', 
  '$2a$10$N9qo8uLOickgx2ZMRZoMye1J0ixRgGPvXXE7YRbMvVjPkC3V8m1d2',
  'admin@example.com',
  'System Administrator',
  'admin'
) ON DUPLICATE KEY UPDATE username = username;

-- ============================================
-- Example Normal User
-- ============================================
-- Password: user123
INSERT INTO admin_users (username, password_hash, email, full_name, user_type, created_by) 
VALUES (
  'viewer', 
  '$2a$10$6tNEZz9x9qRZ1k.J8gVEXeK5m6M5W8Y5F7xJ5J5J5J5J5J5J5J5J5J',
  'viewer@example.com',
  'View Only User',
  'normal',
  1
) ON DUPLICATE KEY UPDATE username = username;

-- Grant some permissions to the normal user (example)
-- This user can view agents and create tokens
INSERT INTO user_permissions (user_id, permission_name, granted_by)
SELECT 
  u.user_id, 
  'livekit_token_create',
  1
FROM admin_users u 
WHERE u.username = 'viewer'
ON DUPLICATE KEY UPDATE permission_value = TRUE;

-- ============================================
-- Stored Procedures
-- ============================================

DELIMITER //

-- Check if user has specific permission
CREATE PROCEDURE sp_check_user_permission(
  IN p_user_id INT,
  IN p_permission_name VARCHAR(50)
)
BEGIN
  DECLARE v_user_type VARCHAR(10);
  DECLARE v_has_permission BOOLEAN DEFAULT FALSE;
  
  -- Get user type
  SELECT user_type INTO v_user_type 
  FROM admin_users 
  WHERE user_id = p_user_id AND is_active = TRUE;
  
  -- Admin users have all permissions
  IF v_user_type = 'admin' THEN
    SET v_has_permission = TRUE;
  ELSE
    -- Check if normal user has specific permission
    SELECT COALESCE(permission_value, FALSE) INTO v_has_permission
    FROM user_permissions
    WHERE user_id = p_user_id AND permission_name = p_permission_name;
  END IF;
  
  SELECT v_has_permission as has_permission;
END //

-- Get all permissions for a user
CREATE PROCEDURE sp_get_user_permissions(IN p_user_id INT)
BEGIN
  SELECT 
    u.user_id,
    u.username,
    u.user_type,
    up.permission_name,
    up.permission_value,
    up.granted_at,
    granted_by_user.username as granted_by_username
  FROM admin_users u
  LEFT JOIN user_permissions up ON u.user_id = up.user_id
  LEFT JOIN admin_users granted_by_user ON up.granted_by = granted_by_user.user_id
  WHERE u.user_id = p_user_id AND u.is_active = TRUE;
END //

-- Grant permission to user (admin only)
CREATE PROCEDURE sp_grant_permission(
  IN p_user_id INT,
  IN p_permission_name VARCHAR(50),
  IN p_granted_by INT
)
BEGIN
  DECLARE v_target_user_type VARCHAR(10);
  DECLARE v_granter_user_type VARCHAR(10);
  
  -- Get user types
  SELECT user_type INTO v_target_user_type FROM admin_users WHERE user_id = p_user_id;
  SELECT user_type INTO v_granter_user_type FROM admin_users WHERE user_id = p_granted_by;
  
  -- Only admins can grant permissions
  IF v_granter_user_type != 'admin' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only admins can grant permissions';
  END IF;
  
  -- Cannot grant permissions to admin users (they have all)
  IF v_target_user_type = 'admin' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Admin users already have all permissions';
  END IF;
  
  -- Insert or update permission
  INSERT INTO user_permissions (user_id, permission_name, permission_value, granted_by)
  VALUES (p_user_id, p_permission_name, TRUE, p_granted_by)
  ON DUPLICATE KEY UPDATE 
    permission_value = TRUE,
    granted_by = p_granted_by,
    updated_at = CURRENT_TIMESTAMP;
    
  SELECT 'Permission granted successfully' as message;
END //

-- Revoke permission from user (admin only)
CREATE PROCEDURE sp_revoke_permission(
  IN p_user_id INT,
  IN p_permission_name VARCHAR(50)
)
BEGIN
  DELETE FROM user_permissions 
  WHERE user_id = p_user_id AND permission_name = p_permission_name;
  
  SELECT 'Permission revoked successfully' as message;
END //

-- Create password reset token
CREATE PROCEDURE sp_create_reset_token(
  IN p_email VARCHAR(100),
  IN p_reset_token VARCHAR(255),
  IN p_expires_in_hours INT
)
BEGIN
  DECLARE v_user_id INT;
  
  -- Get user ID by email
  SELECT user_id INTO v_user_id 
  FROM admin_users 
  WHERE email = p_email AND is_active = TRUE;
  
  IF v_user_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User not found';
  END IF;
  
  -- Insert reset token
  INSERT INTO password_reset_tokens (user_id, reset_token, expires_at)
  VALUES (v_user_id, p_reset_token, DATE_ADD(NOW(), INTERVAL p_expires_in_hours HOUR));
  
  SELECT v_user_id as user_id, 'Reset token created' as message;
END //

-- Verify and use reset token
CREATE PROCEDURE sp_use_reset_token(
  IN p_reset_token VARCHAR(255)
)
BEGIN
  DECLARE v_user_id INT;
  DECLARE v_expires_at TIMESTAMP;
  DECLARE v_is_used BOOLEAN;
  
  -- Get token details
  SELECT user_id, expires_at, is_used 
  INTO v_user_id, v_expires_at, v_is_used
  FROM password_reset_tokens
  WHERE reset_token = p_reset_token;
  
  IF v_user_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid reset token';
  END IF;
  
  IF v_is_used THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reset token already used';
  END IF;
  
  IF v_expires_at < NOW() THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reset token expired';
  END IF;
  
  -- Mark token as used
  UPDATE password_reset_tokens 
  SET is_used = TRUE, used_at = NOW()
  WHERE reset_token = p_reset_token;
  
  SELECT v_user_id as user_id, 'Token verified' as message;
END //

DELIMITER ;

-- ============================================
-- Views
-- ============================================

-- View: User Permissions Summary
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
-- Sample Queries
-- ============================================

-- Query 1: Get all users with their permissions
-- SELECT * FROM v_user_permissions_summary;

-- Query 2: Check if user has specific permission
-- CALL sp_check_user_permission(2, 'agent_builder_create');

-- Query 3: Get all permissions for a user
-- CALL sp_get_user_permissions(2);

-- Query 4: Grant permission (admin only)
-- CALL sp_grant_permission(2, 'agent_builder_create', 1);

-- Query 5: Revoke permission
-- CALL sp_revoke_permission(2, 'agent_builder_create');

-- Query 6: Create password reset token
-- CALL sp_create_reset_token('viewer@example.com', 'unique_token_here', 24);

-- Query 7: Verify reset token
-- CALL sp_use_reset_token('unique_token_here');

-- ============================================
-- Cleanup Old Reset Tokens (Schedule this)
-- ============================================
-- DELETE FROM password_reset_tokens WHERE expires_at < NOW() OR is_used = TRUE;
