import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '2rem' }}>
          <h1 className={styles.title}>Change Password</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/agent-config">
              <a style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>
                Agent Config
              </a>
            </Link>
            <Link href="/agent-builder">
              <a style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>
                Agent Builder
              </a>
            </Link>
            <Link href="/livekit-admin">
              <a style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>
                LiveKit Admin
              </a>
            </Link>
            <Link href="/admin-users">
              <a style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>
                Admin Users
              </a>
            </Link>
            <button
              onClick={handleLogout}
              style={{ padding: '0.5rem 1rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        </div>

        {message && (
          <div style={{
            padding: '1rem',
            marginBottom: '1rem',
            borderRadius: '5px',
            backgroundColor: messageType === 'success' ? '#d4edda' : '#f8d7da',
            color: messageType === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${messageType === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            {message}
          </div>
        )}

        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '2rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          <h2 style={{ marginTop: 0, textAlign: 'center' }}>Change Your Password</h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Current Password *
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
                required
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                New Password * (minimum 8 characters)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
                minLength={8}
                required
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Confirm New Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  borderColor: confirmPassword && newPassword !== confirmPassword ? '#dc3545' : '#ccc'
                }}
                minLength={8}
                required
                disabled={loading}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <small style={{ color: '#dc3545', marginTop: '0.25rem', display: 'block' }}>
                  Passwords do not match
                </small>
              )}
            </div>

            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '4px', fontSize: '14px' }}>
              <strong>Password Requirements:</strong>
              <ul style={{ margin: '0.5rem 0 0 1.5rem', paddingLeft: 0 }}>
                <li>At least 8 characters long</li>
                <li>Should include a mix of letters, numbers, and symbols</li>
                <li>Avoid using common words or personal information</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading || Boolean(confirmPassword && newPassword !== confirmPassword)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: loading ? '#6c757d' : '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
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
