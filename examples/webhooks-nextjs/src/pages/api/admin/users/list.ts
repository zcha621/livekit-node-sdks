import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '../../../../lib/session';
import { queryUserDb } from '../../../../lib/userDb';

/**
 * API to list all users (admin only)
 */

interface User {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  user_type: 'admin' | 'normal';
  is_active: boolean;
  created_at: Date;
  last_login: Date;
}

async function usersListRoute(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Only admins can list all users
  if (req.session.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }

  if (req.method === 'GET') {
    try {
      const users = await queryUserDb<User[]>(`
        SELECT 
          user_id,
          username,
          email,
          full_name,
          user_type,
          is_active,
          created_at,
          last_login
        FROM admin_users
        WHERE is_active = TRUE
        ORDER BY user_id ASC
      `);
      
      return res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Failed to fetch users' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withSessionRoute(usersListRoute);
