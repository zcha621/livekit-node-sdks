import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { queryUserDb } from '../../../lib/userDb';

/**
 * API endpoint to request a password reset
 * Generates a reset token and would send email (email sending not implemented here)
 */

interface User {
  user_id: number;
  email: string;
  username: string;
  full_name: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Check if user exists
    const users = await queryUserDb<User[]>(
      'SELECT user_id, email, username, full_name FROM admin_users WHERE email = ? AND is_active = TRUE',
      [email]
    );

    // Always return success message to prevent email enumeration
    if (users.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'If the email exists, a password reset link has been sent.' 
      });
    }

    const user = users[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store reset token in database (expires in 24 hours)
    await queryUserDb(
      `INSERT INTO password_reset_tokens (user_id, reset_token, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
      [user.user_id, tokenHash]
    );

    // In production, send email with reset link here
    // const resetUrl = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;
    // await sendPasswordResetEmail(user.email, resetUrl);
    
    // For development, log the token (REMOVE IN PRODUCTION)
    console.log('=== PASSWORD RESET TOKEN ===');
    console.log(`User: ${user.username} (${user.email})`);
    console.log(`Reset Token: ${resetToken}`);
    console.log(`Reset URL: http://localhost:3000/reset-password?token=${resetToken}`);
    console.log('============================');

    return res.status(200).json({ 
      success: true, 
      message: 'If the email exists, a password reset link has been sent.',
      // Only include token in development
      ...(process.env.NODE_ENV === 'development' && { 
        dev_token: resetToken,
        dev_url: `http://localhost:3000/reset-password?token=${resetToken}`
      })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
