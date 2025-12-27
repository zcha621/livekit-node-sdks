import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';
import styles from '../styles/Meet.module.css';

// Type fix for React 18 compatibility
const LiveKitRoomTyped = LiveKitRoom as any;

// Read LiveKit URL from environment variable
const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880';

export default function Meet() {
  const [token, setToken] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const [rememberToken, setRememberToken] = useState(false);

  // Load saved token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('livekit_token');
    if (savedToken) {
      setToken(savedToken);
      setRememberToken(true);
    }
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Access token is required');
      return;
    }

    try {
      setError('');
      
      // Save token to localStorage if remember is checked
      if (rememberToken) {
        localStorage.setItem('livekit_token', token.trim());
      } else {
        localStorage.removeItem('livekit_token');
      }

      setIsConnected(true);
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  const handleClearToken = () => {
    setToken('');
    localStorage.removeItem('livekit_token');
    setRememberToken(false);
  };

  if (isConnected && token) {
    return (
      <div className={styles.fullScreenContainer}>
        <Head>
          <title>LiveKit Meet</title>
        </Head>
        <LiveKitRoomTyped
          token={token}
          serverUrl={livekitUrl}
          connect={true}
          onDisconnected={handleDisconnect}
          style={{ height: '100%' }}
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoomTyped>
      </div>
    );
  }

  return (
    <div className={styles.meetContainer}>
      <Head>
        <title>Join LiveKit Room</title>
      </Head>

      <div className={styles.formCard}>
        <div className={styles.navigation}>
          <Link href="/">
            <a className={styles.navLink}>← Home</a>
          </Link>
          <Link href="/livekit-admin">
            <a className={styles.navLink}>← Admin Dashboard</a>
          </Link>
        </div>
        <h1 className={styles.formTitle}>
          Join Room
        </h1>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleJoin}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Access Token
            </label>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your LiveKit access token here"
              rows={4}
              className={styles.textarea}
              required
            />
            <small className={styles.helpText}>
              Get a token from the admin dashboard or your backend
            </small>
          </div>

          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              checked={rememberToken}
              onChange={(e) => setRememberToken(e.target.checked)}
            />
            <span>Remember token for next time</span>
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={styles.joinButton}
            >
              Join Room
            </button>
            
            {token && (
              <button
                type="button"
                onClick={handleClearToken}
                className={styles.clearButton}
              >
                Clear
              </button>
            )}
          </div>
        </form>

        <div className={styles.helpText}>
          <a 
            href="/livekit-admin" 
            className={styles.navLink}
          >
            Generate Token in Admin Dashboard →
          </a>
        </div>
      </div>
    </div>
  );
}
