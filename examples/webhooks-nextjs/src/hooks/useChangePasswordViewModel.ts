/**
 * useChangePasswordViewModel - ViewModel Layer
 * Manages state and business logic for password change
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { AuthService } from '../services/authService';

interface ChangePasswordViewModel {
  // State
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  message: string;
  messageType: 'success' | 'error';
  loading: boolean;

  // Actions
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  changePassword: () => Promise<void>;
  logout: () => Promise<void>;
}

export function useChangePasswordViewModel(): ChangePasswordViewModel {
  const router = useRouter();

  // State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);

  // Initialize: Check auth
  useEffect(() => {
    const initialize = async () => {
      const user = await AuthService.checkAuth();
      if (!user) {
        router.push('/login');
      }
    };

    initialize();
  }, [router]);

  // Private: Show temporary message
  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  // Public: Change password
  const changePassword = useCallback(async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage('All fields are required', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('New passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 8) {
      showMessage('Password must be at least 8 characters long', 'error');
      return;
    }

    setLoading(true);

    try {
      await AuthService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      showMessage('Password changed successfully! You will be logged out.', 'success');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Logout after 2 seconds
      setTimeout(async () => {
        await AuthService.logout();
        router.push('/login');
      }, 2000);
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : 'Failed to change password',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword, router]);

  // Public: Logout
  const logout = useCallback(async () => {
    await AuthService.logout();
    router.push('/login');
  }, [router]);

  return {
    currentPassword,
    newPassword,
    confirmPassword,
    message,
    messageType,
    loading,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    changePassword,
    logout,
  };
}
