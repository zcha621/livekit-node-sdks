import React from 'react';
import { useChangePasswordViewModel } from '../hooks/useChangePasswordViewModel';
import {
  Navigation,
  MessageBanner,
  PasswordForm,
} from '../components/ChangePasswordComponents';
import passwordStyles from '../styles/ChangePassword.module.css';

/**
 * Change Password Page (View Layer)
 * 
 * MVVM Pattern - Pure Presentational Component
 */
export default function ChangePassword() {
  const vm = useChangePasswordViewModel();

  return (
    <div className={passwordStyles.container}>
      <main className={passwordStyles.main}>
        <Navigation onLogout={vm.logout} />

        {vm.message && <MessageBanner message={vm.message} messageType={vm.messageType} />}

        <PasswordForm
          currentPassword={vm.currentPassword}
          newPassword={vm.newPassword}
          confirmPassword={vm.confirmPassword}
          loading={vm.loading}
          onCurrentPasswordChange={vm.setCurrentPassword}
          onNewPasswordChange={vm.setNewPassword}
          onConfirmPasswordChange={vm.setConfirmPassword}
          onSubmit={vm.changePassword}
        />
      </main>
    </div>
  );
}
