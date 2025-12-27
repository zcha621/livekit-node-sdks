import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { withSessionRoute } from '../../../lib/session';
import { query } from '../../../lib/db';

interface AdminUser {
  admin_id: number;
  password_hash: string;
}

async function changePasswordRoute(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { current_password, new_password, admin_id } = req.body;

  // Allow admin to change their own password or another user's password
  const targetAdminId = admin_id || req.session.user.id;

  if (!new_password) {
    return res.status(400).json({ message: 'New password is required' });
  }

  if (new_password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  try {
    // If changing own password, verify current password
    if (targetAdminId === req.session.user.id) {
      if (!current_password) {
        return res.status(400).json({ message: 'Current password is required' });
      }

      // Fetch current password hash
      const users = await query<AdminUser[]>(
        'SELECT admin_id, password_hash FROM admin_users WHERE admin_id = ?',
        [targetAdminId]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const passwordMatch = await bcrypt.compare(current_password, users[0].password_hash);
      
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
    }

    // Hash new password
    const new_password_hash = await bcrypt.hash(new_password, 10);

    // Update password
    await query(
      'UPDATE admin_users SET password_hash = ? WHERE admin_id = ?',
      [new_password_hash, targetAdminId]
    );

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ message: 'Failed to change password' });
  }
}

export default withSessionRoute(changePasswordRoute);
