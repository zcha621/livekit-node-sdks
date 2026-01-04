import { useState } from 'react';
import type { FormEvent } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import loginStyles from '../styles/Login.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [devUrl, setDevUrl] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setDevUrl('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setEmail('');
        
        // Show development URL if available
        if (data.dev_url) {
          setDevUrl(data.dev_url);
        }
      } else {
        setError(data.message || 'Failed to send reset email');
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
        <title>Forgot Password - LiveKit</title>
        <meta name="description" content="Reset your password" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={loginStyles.loginBox}>
          <h1 className={loginStyles.loginTitle}>Forgot Password?</h1>
          <p className={loginStyles.loginSubtitle}>
            Enter your email address and we'll send you a link to reset your password.
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

            {devUrl && (
              <div className={loginStyles.devMessage}>
                <strong>Development Mode:</strong><br />
                <a href={devUrl} className={loginStyles.devLink}>
                  Click here to reset password
                </a>
              </div>
            )}

            <div className={loginStyles.formGroup}>
              <label htmlFor="email" className={loginStyles.label}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className={loginStyles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.email@example.com"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className={loginStyles.loginButton}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
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
