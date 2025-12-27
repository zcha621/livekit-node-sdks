import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import loginStyles from '../styles/Login.module.css';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to agent config page after successful login
        router.push('/agent-config');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Admin Login - LiveKit</title>
        <meta name="description" content="Admin login" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={loginStyles.backLink}>
          <Link href="/">
            <a className={loginStyles.backLinkAnchor}>← Home</a>
          </Link>
        </div>
        <h1 className={styles.title}>
          Admin Login
        </h1>

        <p className={styles.description}>
          Sign in to manage agents and LiveKit configuration
        </p>

        <div className={`${styles.card} ${loginStyles.loginCard}`}>
          <form onSubmit={handleSubmit}>
            <div className={loginStyles.formGroup}>
              <label htmlFor="username" className={loginStyles.formLabel}>
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={loginStyles.formInput}
              />
            </div>

            <div className={loginStyles.formGroup}>
              <label htmlFor="password" className={loginStyles.formLabel}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={loginStyles.formInput}
              />
            </div>

            {error && (
              <div className={loginStyles.errorMessage}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={loginStyles.submitButton}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#666' }}>
            Default credentials: admin / admin123
          </p>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Powered by LiveKit</p>
      </footer>
    </div>
  );
}
