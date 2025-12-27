import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { withSessionRoute } from '../../../lib/session';
import { query } from '../../../lib/db';

interface AdminUser {
  admin_id: number;
  username: string;
  password_hash: string;
  email: string;
  full_name: string;
  is_active: boolean;
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
    // Fetch user from database
    const users = await query<AdminUser[]>(
      'SELECT admin_id, username, password_hash, email, full_name, is_active FROM admin_users WHERE username = ? AND is_active = TRUE',
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

    // Update last login timestamp
    await query(
      'UPDATE admin_users SET last_login = NOW() WHERE admin_id = ?',
      [user.admin_id]
    );

    // Set session
    req.session.user = {
      id: user.admin_id,
      username: user.username,
      isAdmin: true,
    };
    await req.session.save();

    return res.status(200).json({ 
      success: true, 
      user: { 
        username: user.username, 
        email: user.email,
        fullName: user.full_name,
        isAdmin: true 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default withSessionRoute(loginRoute);
