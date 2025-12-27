import React from 'react';
import { useAdminUsersViewModel } from '../hooks/useAdminUsersViewModel';
import {
  Navigation,
  MessageBanner,
  CreateUserForm,
  UsersTable,
} from '../components/AdminUsersComponents';
import adminStyles from '../styles/AdminUsers.module.css';

/**
 * Admin Users Page (View Layer)
 * 
 * MVVM Pattern - Pure Presentational Component
 */
export default function AdminUsers() {
  const vm = useAdminUsersViewModel();

  if (vm.loading) {
    return (
      <div className={adminStyles.container}>
        <main className={adminStyles.main}>
          <h1>Loading...</h1>
        </main>
      </div>
    );
  }

  return (
    <div className={adminStyles.container}>
      <main className={adminStyles.main}>
        <Navigation onLogout={vm.logout} />

        {vm.message && <MessageBanner message={vm.message} messageType={vm.messageType} />}

        <div className={adminStyles.createButtonContainer}>
          <button
            onClick={() => vm.setShowCreateForm(!vm.showCreateForm)}
            className={adminStyles.createButton}
          >
            {vm.showCreateForm ? 'Cancel' : '+ Create New Admin User'}
          </button>
        </div>

        {vm.showCreateForm && (
          <CreateUserForm
            newUser={vm.newUser}
            onFieldChange={vm.updateNewUserField}
            onCreate={vm.createUser}
            onCancel={() => vm.setShowCreateForm(false)}
          />
        )}

        <UsersTable
          users={vm.users}
          onToggleStatus={vm.toggleUserStatus}
          onDelete={vm.deleteUser}
        />

        {vm.users.length === 0 && !vm.loading && (
          <p className={adminStyles.emptyMessage}>No admin users found</p>
        )}
      </main>
    </div>
  );
}
