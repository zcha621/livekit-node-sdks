import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { queryUserDb } from '../../../lib/userDb';

/**
 * API endpoint to reset password with a valid token
 */

interface ResetToken {
  user_id: number;
  expires_at: Date;
  is_used: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    // Hash the token to compare with database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Verify token
    const tokens = await queryUserDb<ResetToken[]>(
      `SELECT user_id, expires_at, is_used 
       FROM password_reset_tokens 
       WHERE reset_token = ? AND is_used = FALSE AND expires_at > NOW()`,
      [tokenHash]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const resetToken = tokens[0];

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await queryUserDb(
      'UPDATE admin_users SET password_hash = ?, updated_at = NOW() WHERE user_id = ?',
      [passwordHash, resetToken.user_id]
    );

    // Mark token as used
    await queryUserDb(
      'UPDATE password_reset_tokens SET is_used = TRUE, used_at = NOW() WHERE reset_token = ?',
      [tokenHash]
    );

    return res.status(200).json({ 
      success: true, 
      message: 'Password has been reset successfully' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
