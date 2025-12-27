/**
 * UserService - Model Layer
 * Handles all admin user-related data access and API interactions
 */

export interface AdminUser {
  admin_id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  full_name: string;
}

export interface UpdateUserRequest {
  email?: string;
  full_name?: string;
  is_active?: boolean;
}

export class UserService {
  /**
   * Fetch all admin users
   */
  static async getUsers(): Promise<AdminUser[]> {
    const response = await fetch('/api/admin/users');
    if (!response.ok) {
      throw new Error('Failed to fetch admin users');
    }
    return response.json();
  }

  /**
   * Create a new admin user
   */
  static async createUser(userData: CreateUserRequest): Promise<void> {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create user');
    }
  }

  /**
   * Update an existing admin user
   */
  static async updateUser(adminId: number, userData: UpdateUserRequest): Promise<void> {
    const response = await fetch(`/api/admin/users/${adminId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update user');
    }
  }

  /**
   * Delete an admin user
   */
  static async deleteUser(adminId: number): Promise<void> {
    const response = await fetch(`/api/admin/users/${adminId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete user');
    }
  }

  /**
   * Toggle user active status
   */
  static async toggleUserStatus(adminId: number, isActive: boolean): Promise<void> {
    await this.updateUser(adminId, { is_active: isActive });
  }
}
