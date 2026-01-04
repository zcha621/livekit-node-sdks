import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { withSessionRoute } from '../../../lib/session';
import { queryUserDb } from '../../../lib/userDb';

interface AdminUser {
  user_id: number;
  username: string;
  password_hash: string;
  email: string;
  full_name: string;
  user_type: 'admin' | 'normal';
  is_active: boolean;
}

interface UserPermission {
  permission_name: string;
}

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  try {
    // Fetch user from USER MANAGEMENT database
    const users = await queryUserDb<AdminUser[]>(
      'SELECT user_id, username, password_hash, email, full_name, user_type, is_active FROM admin_users WHERE username = ? AND is_active = TRUE',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Fetch user permissions (only for normal users)
    let permissions: string[] = [];
    if (user.user_type === 'normal') {
      const userPermissions = await queryUserDb<UserPermission[]>(
        'SELECT permission_name FROM user_permissions WHERE user_id = ? AND permission_value = TRUE',
        [user.user_id]
      );
      permissions = userPermissions.map(p => p.permission_name);
    }

    // Update last login timestamp
    await queryUserDb(
      'UPDATE admin_users SET last_login = NOW() WHERE user_id = ?',
      [user.user_id]
    );

    // Set session
    req.session.user = {
      id: user.user_id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      userType: user.user_type,
      permissions: permissions,
    };
    await req.session.save();

    return res.status(200).json({ 
      success: true, 
      user: { 
        username: user.username, 
        email: user.email,
        fullName: user.full_name,
        userType: user.user_type,
        permissions: permissions
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default withSessionRoute(loginRoute);
