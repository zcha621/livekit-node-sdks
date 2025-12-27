/**
 * useAdminUsersViewModel - ViewModel Layer
 * Manages state and business logic for admin users management
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { UserService, AdminUser, CreateUserRequest } from '../services/userService';

interface AdminUsersViewModel {
  // State
  users: AdminUser[];
  loading: boolean;
  message: string;
  messageType: 'success' | 'error';
  showCreateForm: boolean;
  newUser: CreateUserRequest;

  // Actions
  setShowCreateForm: (show: boolean) => void;
  updateNewUserField: (field: keyof CreateUserRequest, value: string) => void;
  createUser: () => Promise<void>;
  toggleUserStatus: (adminId: number, currentStatus: boolean) => Promise<void>;
  deleteUser: (adminId: number) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAdminUsersViewModel(): AdminUsersViewModel {
  const router = useRouter();
  
  // State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    username: '',
    password: '',
    email: '',
    full_name: '',
  });

  // Initialize: Check auth and load users
  useEffect(() => {
    const initialize = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        await loadUsers();
      } catch (error) {
        router.push('/login');
      }
    };

    initialize();
  }, [router]);

  // Private: Load users
  const loadUsers = async () => {
    try {
      const data = await UserService.getUsers();
      setUsers(data);
    } catch (error) {
      showMessage('Error fetching admin users', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Private: Show temporary message
  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  // Public: Update new user field
  const updateNewUserField = useCallback((field: keyof CreateUserRequest, value: string) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
  }, []);

  // Public: Create user
  const createUser = useCallback(async () => {
    if (!newUser.username || !newUser.password || !newUser.email || !newUser.full_name) {
      showMessage('All fields are required', 'error');
      return;
    }

    if (newUser.password.length < 8) {
      showMessage('Password must be at least 8 characters', 'error');
      return;
    }

    try {
      await UserService.createUser(newUser);
      showMessage('User created successfully', 'success');
      setShowCreateForm(false);
      setNewUser({ username: '', password: '', email: '', full_name: '' });
      await loadUsers();
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to create user', 'error');
    }
  }, [newUser]);

  // Public: Toggle user status
  const toggleUserStatus = useCallback(async (adminId: number, currentStatus: boolean) => {
    try {
      await UserService.toggleUserStatus(adminId, !currentStatus);
      showMessage(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
      await loadUsers();
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to update user status', 'error');
    }
  }, []);

  // Public: Delete user
  const deleteUser = useCallback(async (adminId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await UserService.deleteUser(adminId);
      showMessage('User deleted successfully', 'success');
      await loadUsers();
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to delete user', 'error');
    }
  }, []);

  // Public: Logout
  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }, [router]);

  return {
    users,
    loading,
    message,
    messageType,
    showCreateForm,
    newUser,
    setShowCreateForm,
    updateNewUserField,
    createUser,
    toggleUserStatus,
    deleteUser,
    logout,
  };
}
