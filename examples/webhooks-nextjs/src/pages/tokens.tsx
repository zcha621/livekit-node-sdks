import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

interface GeneratedToken {
  id: string;
  token: string;
  roomName: string;
  participantName: string;
  canPublish: boolean;
  canSubscribe: boolean;
  generatedAt: number;
  expiresAt: number;
}

// Decode JWT token to get expiry time
const decodeToken = (token: string): { exp?: number; identity?: string } => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return {};
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return {};
  }
};

export default function Tokens() {
  const router = useRouter();
  const [tokens, setTokens] = useState<GeneratedToken[]>([]);
  const [roomName, setRoomName] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [canPublish, setCanPublish] = useState(true);
  const [canSubscribe, setCanSubscribe] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTokens(prev => [...prev]); // Force re-render
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      loadTokens();
    } catch (error) {
      router.push('/login');
    }
  };

  const loadTokens = () => {
    const stored = localStorage.getItem('generated_tokens');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Filter out expired tokens
      const active = parsed.filter((t: GeneratedToken) => t.expiresAt > Date.now());
      setTokens(active);
      if (active.length !== parsed.length) {
        localStorage.setItem('generated_tokens', JSON.stringify(active));
      }
    }
    setLoading(false);
  };

  const generateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !participantName.trim()) {
      showMessage('Room name and participant name are required', 'error');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/token/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: roomName.trim(),
          participantName: participantName.trim(),
          canPublish,
          canSubscribe,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // Decode the token to get actual expiry time
        const decoded = decodeToken(data.token);
        const expiresAt = decoded.exp ? decoded.exp * 1000 : Date.now() + (10 * 60 * 60 * 1000);

        const newToken: GeneratedToken = {
          id: Date.now().toString(),
          token: data.token,
          roomName: data.roomName,
          participantName: data.participantName,
          canPublish,
          canSubscribe,
          generatedAt: Date.now(),
          expiresAt, // Use actual expiry from token
        };

        const updated = [...tokens, newToken];
        setTokens(updated);
        localStorage.setItem('generated_tokens', JSON.stringify(updated));

        showMessage('Token generated successfully!', 'success');
        setRoomName('');
        setParticipantName('');
      } else {
        showMessage(data.error || 'Failed to generate token', 'error');
      }
    } catch (error) {
      showMessage('Error generating token', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    showMessage('Token copied to clipboard!', 'success');
  };

  const deleteToken = (id: string) => {
    const updated = tokens.filter(t => t.id !== id);
    setTokens(updated);
    localStorage.setItem('generated_tokens', JSON.stringify(updated));
    showMessage('Token deleted', 'success');
  };

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const formatCountdown = (expiresAt: number) => {
    const diff = expiresAt - Date.now();
    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1>Loading...</h1>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Access Tokens - LiveKit Admin</title>
        <meta name="description" content="Manage LiveKit access tokens" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px' }}>
          <h1 className={styles.title}>Access Tokens</h1>
          <div>
            <Link href="/agent-config">
              <a style={{ marginRight: '1rem', color: '#0070f3' }}>Agent Config</a>
            </Link>
            <Link href="/livekit-admin">
              <a style={{ marginRight: '1rem', color: '#0070f3' }}>LiveKit Admin</a>
            </Link>
            <Link href="/meet">
              <a style={{ marginRight: '1rem', color: '#0070f3' }}>Join Room</a>
            </Link>
            <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        </div>

        {message && (
          <div style={{
            width: '100%',
            maxWidth: '1200px',
            padding: '1rem',
            marginTop: '1rem',
            backgroundColor: message.includes('success') || message.includes('copied') ? '#d4edda' : '#f8d7da',
            color: message.includes('success') || message.includes('copied') ? '#155724' : '#721c24',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', width: '100%', maxWidth: '1200px', marginTop: '2rem' }}>
          {/* Generate Token Form */}
          <div style={{ border: '1px solid #eaeaea', borderRadius: '10px', padding: '2rem' }}>
            <h2>Generate New Token</h2>
            <form onSubmit={generateToken}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Room Name *
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g., main-room"
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Participant Name *
                </label>
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="e.g., John Doe"
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={canPublish}
                    onChange={(e) => setCanPublish(e.target.checked)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <span>Can Publish (Camera/Mic)</span>
                </label>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={canSubscribe}
                    onChange={(e) => setCanSubscribe(e.target.checked)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <span>Can Subscribe (View/Listen)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={generating}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: generating ? '#ccc' : '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: generating ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                {generating ? 'Generating...' : 'Generate Token'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px', fontSize: '0.875rem' }}>
              <strong>Note:</strong> Token expiry is set on the server (currently 10h). The countdown shows the actual time remaining based on the JWT expiry claim.
            </div>
          </div>

          {/* Tokens List */}
          <div style={{ border: '1px solid #eaeaea', borderRadius: '10px', padding: '2rem' }}>
            <h2>Generated Tokens ({tokens.length})</h2>
            {tokens.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
                No active tokens. Generate one to get started.
              </p>
            ) : (
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {tokens.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      border: '1px solid #d9d9d9',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      backgroundColor: t.expiresAt <= Date.now() ? '#fee' : '#fafafa'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{t.roomName}</strong>
                      <span style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: 'bold',
                        color: t.expiresAt <= Date.now() ? '#c00' : '#28a745'
                      }}>
                        {formatCountdown(t.expiresAt)}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                      Participant: {t.participantName}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                      Permissions: {t.canPublish ? '✓ Publish' : '✗ Publish'} | {t.canSubscribe ? '✓ Subscribe' : '✗ Subscribe'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem' }}>
                      Generated: {formatDateTime(t.generatedAt)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.75rem' }}>
                      Expires: {formatDateTime(t.expiresAt)}
                    </div>
                    <div style={{ 
                      fontFamily: 'monospace', 
                      fontSize: '0.75rem', 
                      background: '#fff',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #e0e0e0',
                      wordBreak: 'break-all',
                      marginBottom: '0.75rem',
                      maxHeight: '60px',
                      overflowY: 'auto'
                    }}>
                      {t.token}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => copyToken(t.token)}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Copy Token
                      </button>
                      <button
                        onClick={() => deleteToken(t.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Powered by LiveKit</p>
      </footer>
    </div>
  );
}
