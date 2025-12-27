/**
 * AuthService - Model Layer
 * Handles authentication-related data access and API interactions
 */

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface AuthUser {
  username: string;
  email?: string;
  full_name?: string;
}

export class AuthService {
  /**
   * Check if user is authenticated
   */
  static async checkAuth(): Promise<AuthUser | null> {
    try {
      const response = await fetch('/api/auth/user');
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (error) {
      return null;
    }
  }

  /**
   * Change user password
   */
  static async changePassword(data: ChangePasswordRequest): Promise<void> {
    const response = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to change password');
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' });
  }

  /**
   * Login user
   */
  static async login(username: string, password: string): Promise<void> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Invalid credentials');
    }
  }
}
