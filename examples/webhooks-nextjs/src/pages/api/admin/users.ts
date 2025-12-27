import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { withSessionRoute } from '../../../lib/session';
import { query } from '../../../lib/db';

interface AdminUser {
  admin_id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  last_login: Date | null;
  created_at: Date;
}

async function adminUsersRoute(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    // List all admin users
    try {
      const users = await query<AdminUser[]>(`
        SELECT 
          admin_id,
          username,
          email,
          full_name,
          is_active,
          last_login,
          created_at
        FROM admin_users
        ORDER BY created_at DESC
      `);
      return res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      return res.status(500).json({ message: 'Failed to fetch admin users' });
    }
  }

  if (req.method === 'POST') {
    // Create new admin user
    const { username, password, email, full_name } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    try {
      // Hash the password
      const password_hash = await bcrypt.hash(password, 10);

      // Insert new admin user
      const result = await query<any>(
        `INSERT INTO admin_users (username, password_hash, email, full_name) 
         VALUES (?, ?, ?, ?)`,
        [username, password_hash, email || null, full_name || null]
      );

      return res.status(201).json({
        success: true,
        message: 'Admin user created successfully',
        admin_id: result.insertId
      });
    } catch (error: any) {
      console.error('Error creating admin user:', error);
      
      // Handle duplicate username error
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Username already exists' });
      }
      
      return res.status(500).json({ message: 'Failed to create admin user' });
    }
  }

  if (req.method === 'PUT') {
    // Update admin user
    const { admin_id, email, full_name, is_active } = req.body;

    if (!admin_id) {
      return res.status(400).json({ message: 'admin_id is required' });
    }

    try {
      await query(
        `UPDATE admin_users 
         SET email = ?, full_name = ?, is_active = ?
         WHERE admin_id = ?`,
        [email || null, full_name || null, is_active !== undefined ? is_active : true, admin_id]
      );

      return res.status(200).json({
        success: true,
        message: 'Admin user updated successfully'
      });
    } catch (error) {
      console.error('Error updating admin user:', error);
      return res.status(500).json({ message: 'Failed to update admin user' });
    }
  }

  if (req.method === 'DELETE') {
    // Delete/deactivate admin user
    const { admin_id } = req.body;

    if (!admin_id) {
      return res.status(400).json({ message: 'admin_id is required' });
    }

    // Prevent self-deletion
    if (admin_id === req.session.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    try {
      // Soft delete by setting is_active to false
      await query(
        'UPDATE admin_users SET is_active = FALSE WHERE admin_id = ?',
        [admin_id]
      );

      return res.status(200).json({
        success: true,
        message: 'Admin user deactivated successfully'
      });
    } catch (error) {
      console.error('Error deactivating admin user:', error);
      return res.status(500).json({ message: 'Failed to deactivate admin user' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withSessionRoute(adminUsersRoute);
