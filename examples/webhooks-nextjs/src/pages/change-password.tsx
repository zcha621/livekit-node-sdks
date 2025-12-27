import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import passwordStyles from '../styles/ChangePassword.module.css';

export default function ChangePassword() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/user');
      if (!res.ok) {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        showMessage('Password changed successfully! You will be logged out.', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Log out after 2 seconds
        setTimeout(async () => {
          await fetch('/api/auth/logout', { method: 'POST' });
          router.push('/login');
        }, 2000);
      } else {
        showMessage(data.message || 'Failed to change password', 'error');
      }
    } catch (error) {
      showMessage('Error changing password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={passwordStyles.backLink}>
          <Link href="/">
            <a className={passwordStyles.backLinkAnchor}>← Home</a>
          </Link>
        </div>
        <div className={passwordStyles.header}>
          <h1 className={styles.title}>Change Password</h1>
          <div className={passwordStyles.navButtons}>
            <Link href="/agent-config">
              <a className={passwordStyles.navButton}>
                Agent Config
              </a>
            </Link>
            <Link href="/agent-builder">
              <a className={passwordStyles.navButton}>
                Agent Builder
              </a>
            </Link>
            <Link href="/livekit-admin">
              <a className={passwordStyles.navButton}>
                LiveKit Admin
              </a>
            </Link>
            <Link href="/admin-users">
              <a className={passwordStyles.navButton}>
                Admin Users
              </a>
            </Link>
            <button
              onClick={handleLogout}
              className={passwordStyles.logoutButton}
            >
              Logout
            </button>
          </div>
        </div>

        {message && (
          <div className={`${passwordStyles.messageBox} ${messageType === 'success' ? passwordStyles.messageSuccess : passwordStyles.messageError}`}>
            {message}
          </div>
        )}

        <div className={passwordStyles.formCard}>
          <h2 className={passwordStyles.formTitle}>Change Your Password</h2>
          
          <form onSubmit={handleSubmit}>
            <div className={passwordStyles.formGroup}>
              <label className={passwordStyles.formLabel}>
                Current Password *
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={passwordStyles.formInput}
                required
                disabled={loading}
              />
            </div>

            <div className={passwordStyles.formGroup}>
              <label className={passwordStyles.formLabel}>
                New Password * (minimum 8 characters)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={passwordStyles.formInput}
                minLength={8}
                required
                disabled={loading}
              />
            </div>

            <div className={passwordStyles.formGroup}>
              <label className={passwordStyles.formLabel}>
                Confirm New Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${passwordStyles.formInput} ${confirmPassword && newPassword !== confirmPassword ? passwordStyles.formInputError : ''}`}
                minLength={8}
                required
                disabled={loading}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <small className={passwordStyles.validationError}>
                  Passwords do not match
                </small>
              )}
            </div>

            <div className={passwordStyles.requirementsBox}>
              <strong>Password Requirements:</strong>
              <ul className={passwordStyles.requirementsList}>
                <li>At least 8 characters long</li>
                <li>Should include a mix of letters, numbers, and symbols</li>
                <li>Avoid using common words or personal information</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading || Boolean(confirmPassword && newPassword !== confirmPassword)}
              className={passwordStyles.submitButton}
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '14px', color: '#666' }}>
            <p>After changing your password, you will be automatically logged out and need to log in again with your new password.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
