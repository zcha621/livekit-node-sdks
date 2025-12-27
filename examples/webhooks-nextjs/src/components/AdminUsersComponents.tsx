/**
 * AdminUsers View Components - Presentational Components
 */

import React from 'react';
import Link from 'next/link';
import adminStyles from '../styles/AdminUsers.module.css';
import { AdminUser, CreateUserRequest } from '../services/userService';

interface NavigationProps {
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onLogout }) => (
  <>
    <div className={adminStyles.backLink}>
      <Link href="/">
        <a className={adminStyles.backLinkAnchor}>← Home</a>
      </Link>
    </div>
    <div className={adminStyles.header}>
      <h1>Admin Users</h1>
      <div className={adminStyles.navLinks}>
        <Link href="/agent-config">
          <a className={adminStyles.navLink}>Agent Config</a>
        </Link>
        <Link href="/agent-builder">
          <a className={adminStyles.navLink}>Agent Builder</a>
        </Link>
        <Link href="/change-password">
          <a className={adminStyles.navLink}>Change Password</a>
        </Link>
        <Link href="/livekit-admin">
          <a className={adminStyles.navLink}>LiveKit Admin</a>
        </Link>
        <button onClick={onLogout} className={adminStyles.logoutButton}>
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
    className={`${adminStyles.message} ${
      messageType === 'success' ? adminStyles.messageSuccess : adminStyles.messageError
    }`}
  >
    {message}
  </div>
);

interface CreateUserFormProps {
  newUser: CreateUserRequest;
  onFieldChange: (field: keyof CreateUserRequest, value: string) => void;
  onCreate: () => void;
  onCancel: () => void;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({
  newUser,
  onFieldChange,
  onCreate,
  onCancel,
}) => (
  <div className={adminStyles.createForm}>
    <h2>Create New Admin User</h2>
    <div className={adminStyles.formGroup}>
      <label className={adminStyles.label}>Username:</label>
      <input
        type="text"
        value={newUser.username}
        onChange={(e) => onFieldChange('username', e.target.value)}
        className={adminStyles.input}
        placeholder="Enter username"
      />
    </div>
    <div className={adminStyles.formGroup}>
      <label className={adminStyles.label}>Password:</label>
      <input
        type="password"
        value={newUser.password}
        onChange={(e) => onFieldChange('password', e.target.value)}
        className={adminStyles.input}
        placeholder="Enter password (min 8 characters)"
      />
    </div>
    <div className={adminStyles.formGroup}>
      <label className={adminStyles.label}>Email:</label>
      <input
        type="email"
        value={newUser.email}
        onChange={(e) => onFieldChange('email', e.target.value)}
        className={adminStyles.input}
        placeholder="Enter email"
      />
    </div>
    <div className={adminStyles.formGroup}>
      <label className={adminStyles.label}>Full Name:</label>
      <input
        type="text"
        value={newUser.full_name}
        onChange={(e) => onFieldChange('full_name', e.target.value)}
        className={adminStyles.input}
        placeholder="Enter full name"
      />
    </div>
    <div className={adminStyles.formActions}>
      <button onClick={onCreate} className={adminStyles.createButton}>
        Create User
      </button>
      <button onClick={onCancel} className={adminStyles.cancelButton}>
        Cancel
      </button>
    </div>
  </div>
);

interface UsersTableProps {
  users: AdminUser[];
  onToggleStatus: (adminId: number, currentStatus: boolean) => void;
  onDelete: (adminId: number) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({ users, onToggleStatus, onDelete }) => (
  <div className={adminStyles.tableContainer}>
    <table className={adminStyles.table}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>Email</th>
          <th>Full Name</th>
          <th>Status</th>
          <th>Last Login</th>
          <th>Created At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.admin_id} className={!user.is_active ? adminStyles.inactiveRow : ''}>
            <td>{user.admin_id}</td>
            <td>{user.username}</td>
            <td>{user.email}</td>
            <td>{user.full_name}</td>
            <td>
              <span
                className={`${adminStyles.statusBadge} ${
                  user.is_active ? adminStyles.statusActive : adminStyles.statusInactive
                }`}
              >
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td>
              {user.last_login
                ? new Date(user.last_login).toLocaleString()
                : 'Never'}
            </td>
            <td>{new Date(user.created_at).toLocaleString()}</td>
            <td>
              <div className={adminStyles.actionButtons}>
                <button
                  onClick={() => onToggleStatus(user.admin_id, user.is_active)}
                  className={adminStyles.toggleButton}
                >
                  {user.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => onDelete(user.admin_id)}
                  className={adminStyles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
