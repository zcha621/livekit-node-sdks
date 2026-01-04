import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '../../../../../lib/session';
import { queryUserDb } from '../../../../../lib/userDb';

/**
 * API to get permissions for a specific user (admin only)
 * GET /api/admin/users/[userId]/permissions
 */

interface Permission {
  permission_name: string;
  permission_value: boolean;
  granted_at: Date;
  granted_by_username: string;
}

async function userPermissionsRoute(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Only admins can manage permissions
  if (req.session.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ message: 'User ID required' });
  }

  if (req.method === 'GET') {
    try {
      const permissions = await queryUserDb<Permission[]>(`
        SELECT 
          up.permission_name,
          up.permission_value,
          up.granted_at,
          granted_by.username as granted_by_username
        FROM user_permissions up
        JOIN admin_users granted_by ON up.granted_by = granted_by.user_id
        WHERE up.user_id = ?
        ORDER BY up.permission_name
      `, [userId]);
      
      return res.status(200).json(permissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return res.status(500).json({ message: 'Failed to fetch permissions' });
    }
  }

  if (req.method === 'POST') {
    // Grant permission
    try {
      const { permissionName } = req.body;

      if (!permissionName) {
        return res.status(400).json({ message: 'Permission name required' });
      }

      // Check if target user is admin
      const targetUser = await queryUserDb<{user_type: string}[]>(
        'SELECT user_type FROM admin_users WHERE user_id = ?',
        [userId]
      );

      if (targetUser.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (targetUser[0].user_type === 'admin') {
        return res.status(400).json({ message: 'Cannot modify admin permissions' });
      }

      // Grant permission
      await queryUserDb(`
        INSERT INTO user_permissions (user_id, permission_name, permission_value, granted_by)
        VALUES (?, ?, TRUE, ?)
        ON DUPLICATE KEY UPDATE 
          permission_value = TRUE,
          granted_by = ?,
          updated_at = CURRENT_TIMESTAMP
      `, [userId, permissionName, req.session.user.id, req.session.user.id]);

      return res.status(200).json({ success: true, message: 'Permission granted' });
    } catch (error) {
      console.error('Error granting permission:', error);
      return res.status(500).json({ message: 'Failed to grant permission' });
    }
  }

  if (req.method === 'DELETE') {
    // Revoke permission
    try {
      const { permissionName } = req.body;

      if (!permissionName) {
        return res.status(400).json({ message: 'Permission name required' });
      }

      await queryUserDb(
        'DELETE FROM user_permissions WHERE user_id = ? AND permission_name = ?',
        [userId, permissionName]
      );

      return res.status(200).json({ success: true, message: 'Permission revoked' });
    } catch (error) {
      console.error('Error revoking permission:', error);
      return res.status(500).json({ message: 'Failed to revoke permission' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withSessionRoute(userPermissionsRoute);
