import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

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
        <h1 className={styles.title}>
          Admin Login
        </h1>

        <p className={styles.description}>
          Sign in to manage agents and LiveKit configuration
        </p>

        <div className={styles.card} style={{ maxWidth: '400px', width: '100%' }}>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  fontSize: '1rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  fontSize: '1rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            </div>

            {error && (
              <div style={{ 
                color: 'red', 
                marginBottom: '1rem',
                padding: '0.5rem',
                backgroundColor: '#fee',
                borderRadius: '4px',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                backgroundColor: loading ? '#ccc' : '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
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
