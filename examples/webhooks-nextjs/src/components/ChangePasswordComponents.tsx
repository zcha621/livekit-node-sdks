/**
 * ChangePassword View Components - Presentational Components
 */

import React from 'react';
import Link from 'next/link';
import passwordStyles from '../styles/ChangePassword.module.css';

interface NavigationProps {
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onLogout }) => (
  <>
    <div className={passwordStyles.backLink}>
      <Link href="/">
        <a className={passwordStyles.backLinkAnchor}>← Home</a>
      </Link>
    </div>
    <div className={passwordStyles.header}>
      <h1>Change Password</h1>
      <div className={passwordStyles.navLinks}>
        <Link href="/agent-config">
          <a className={passwordStyles.navLink}>Agent Config</a>
        </Link>
        <Link href="/agent-builder">
          <a className={passwordStyles.navLink}>Agent Builder</a>
        </Link>
        <Link href="/admin-users">
          <a className={passwordStyles.navLink}>Admin Users</a>
        </Link>
        <Link href="/livekit-admin">
          <a className={passwordStyles.navLink}>LiveKit Admin</a>
        </Link>
        <button onClick={onLogout} className={passwordStyles.logoutButton}>
          Logout
        </button>
      </div>
    </div>
  </>
);

interface MessageBannerProps {
  message: string;
  messageType: 'success' | 'error';
}

export const MessageBanner: React.FC<MessageBannerProps> = ({ message, messageType }) => (
  <div
    className={`${passwordStyles.message} ${
      messageType === 'success' ? passwordStyles.messageSuccess : passwordStyles.messageError
    }`}
  >
    {message}
  </div>
);

interface PasswordFormProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  loading: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => void;
}

export const PasswordForm: React.FC<PasswordFormProps> = ({
  currentPassword,
  newPassword,
  confirmPassword,
  loading,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className={passwordStyles.formContainer}>
      <form onSubmit={handleSubmit} className={passwordStyles.form}>
        <div className={passwordStyles.formGroup}>
          <label className={passwordStyles.label} htmlFor="current-password">
            Current Password
          </label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => onCurrentPasswordChange(e.target.value)}
            className={passwordStyles.input}
            placeholder="Enter current password"
            disabled={loading}
          />
        </div>

        <div className={passwordStyles.formGroup}>
          <label className={passwordStyles.label} htmlFor="new-password">
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => onNewPasswordChange(e.target.value)}
            className={passwordStyles.input}
            placeholder="Enter new password (min 8 characters)"
            disabled={loading}
          />
        </div>

        <div className={passwordStyles.formGroup}>
          <label className={passwordStyles.label} htmlFor="confirm-password">
            Confirm New Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            className={passwordStyles.input}
            placeholder="Confirm new password"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className={passwordStyles.submitButton}
          disabled={loading}
        >
          {loading ? 'Changing Password...' : 'Change Password'}
        </button>
      </form>

      <div className={passwordStyles.passwordRequirements}>
        <h3>Password Requirements:</h3>
        <ul>
          <li>At least 8 characters long</li>
          <li>New password must match confirmation</li>
          <li>Cannot be the same as current password</li>
        </ul>
      </div>
    </div>
  );
};
