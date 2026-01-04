import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import loginStyles from '../styles/Login.module.css';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Reset token is missing');
    }
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password has been reset successfully!');
        setNewPassword('');
        setConfirmPassword('');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Reset Password - LiveKit</title>
        <meta name="description" content="Reset your password" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={loginStyles.loginBox}>
          <h1 className={loginStyles.loginTitle}>Reset Password</h1>
          <p className={loginStyles.loginSubtitle}>
            Enter your new password below
          </p>

          <form onSubmit={handleSubmit} className={loginStyles.loginForm}>
            {message && (
              <div className={loginStyles.successMessage}>
                {message}
              </div>
            )}

            {error && (
              <div className={loginStyles.errorMessage}>
                {error}
              </div>
            )}

            <div className={loginStyles.formGroup}>
              <label htmlFor="newPassword" className={loginStyles.label}>
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                className={loginStyles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
                disabled={loading || !token}
              />
            </div>

            <div className={loginStyles.formGroup}>
              <label htmlFor="confirmPassword" className={loginStyles.label}>
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className={loginStyles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Re-enter your password"
                disabled={loading || !token}
              />
            </div>

            <button
              type="submit"
              className={loginStyles.loginButton}
              disabled={loading || !token}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className={loginStyles.loginFooter}>
            <Link href="/login">
              <a className={loginStyles.link}>← Back to Login</a>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
