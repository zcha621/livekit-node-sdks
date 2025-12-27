import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/LivekitAdmin.module.css';

interface Room {
  sid: string;
  name: string;
  emptyTimeout: number;
  maxParticipants: number;
  creationTime: number;
  numParticipants: number;
}

interface Participant {
  sid: string;
  identity: string;
  name: string;
  state: string;
  joinedAt: number;
}

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

export default function Admin() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tokens, setTokens] = useState<GeneratedToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [newRoomName, setNewRoomName] = useState('');
  const [tokenRoomName, setTokenRoomName] = useState('');
  const [tokenParticipantName, setTokenParticipantName] = useState('');
  const [canPublish, setCanPublish] = useState(true);
  const [canSubscribe, setCanSubscribe] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Update token countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTokens(prev => [...prev]); // Force re-render for countdown
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
      loadRooms();
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
  };

  // Load rooms on mount
  useEffect(() => {
    loadRooms();
  }, []);

  // Load participants when room is selected
  useEffect(() => {
    if (selectedRoom) {
      loadParticipants(selectedRoom);
      const interval = setInterval(() => loadParticipants(selectedRoom), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedRoom]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/rooms/list');
      const data = await response.json();
      if (response.ok) {
        setRooms(data.rooms || []);
      } else {
        setError(data.error || 'Failed to load rooms');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoomName }),
      });
      const data = await response.json();
      if (response.ok) {
        setNewRoomName('');
        loadRooms();
      } else {
        setError(data.error || 'Failed to create room');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (roomName: string) => {
    if (!confirm(`Delete room "${roomName}"?`)) return;

    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/rooms/${encodeURIComponent(roomName)}/delete`, {
        method: 'DELETE',
      });
      if (response.ok) {
        if (selectedRoom === roomName) {
          setSelectedRoom(null);
          setParticipants([]);
        }
        loadRooms();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete room');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async (roomName: string) => {
    try {
      const response = await fetch(`/api/rooms/${encodeURIComponent(roomName)}/participants`);
      const data = await response.json();
      if (response.ok) {
        setParticipants(data.participants || []);
      }
    } catch (err) {
      console.error('Failed to load participants:', err);
    }
  };

  const removeParticipant = async (roomName: string, identity: string) => {
    if (!confirm(`Remove participant "${identity}"?`)) return;

    try {
      setLoading(true);
      setError('');
      const response = await fetch(
        `/api/participants/${encodeURIComponent(roomName)}/${encodeURIComponent(identity)}/remove`,
        { method: 'POST' }
      );
      if (response.ok) {
        loadParticipants(roomName);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to remove participant');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenRoomName.trim() || !tokenParticipantName.trim()) return;

    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/token/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: tokenRoomName,
          participantName: tokenParticipantName,
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
          roomName: tokenRoomName,
          participantName: tokenParticipantName,
          canPublish,
          canSubscribe,
          generatedAt: Date.now(),
          expiresAt,
        };

        const updated = [...tokens, newToken];
        setTokens(updated);
        localStorage.setItem('generated_tokens', JSON.stringify(updated));

        // Clear form
        setTokenRoomName('');
        setTokenParticipantName('');
      } else {
        setError(data.error || 'Failed to generate token');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setError('Token copied to clipboard!');
    setTimeout(() => setError(''), 2000);
  };

  const deleteToken = (id: string) => {
    const updated = tokens.filter(t => t.id !== id);
    setTokens(updated);
    localStorage.setItem('generated_tokens', JSON.stringify(updated));
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

  return (
    <div className={styles.pageContainer}>
      <Head>
        <title>LiveKit Admin Dashboard</title>
      </Head>

      <div className={styles.backLink}>
        <Link href="/">
          <a className={styles.backLinkAnchor}>← Home</a>
        </Link>
      </div>
      <div className={styles.header}>
        <h1>LiveKit Admin Dashboard</h1>
        <div className={styles.navLinks}>
          <Link href="/agent-config">
            <a className={styles.navLink}>Agent Config</a>
          </Link>
          <Link href="/agent-builder">
            <a className={styles.navLink}>Agent Builder</a>
          </Link>
          <Link href="/admin-users">
            <a className={styles.navLink}>Admin Users</a>
          </Link>
          <Link href="/change-password">
            <a className={styles.navLink}>Change Password</a>
          </Link>
          <Link href="/meet">
            <a className={styles.navLink}>Join Room</a>
          </Link>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.twoColumnGrid}>
        {/* Create Room */}
        <div className={styles.card}>
          <h2>Create Room</h2>
          <form onSubmit={createRoom}>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Room name"
              className={styles.inputField}
            />
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              Create Room
            </button>
          </form>
        </div>

        {/* Generate Token */}
        <div className={styles.card}>
          <h2>Generate Access Token</h2>
          <form onSubmit={generateToken}>
            <input
              type="text"
              value={tokenRoomName}
              onChange={(e) => setTokenRoomName(e.target.value)}
              placeholder="Room name"
              className={styles.inputField}
            />
            <input
              type="text"
              value={tokenParticipantName}
              onChange={(e) => setTokenParticipantName(e.target.value)}
              placeholder="Participant name"
              className={styles.inputField}
            />
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={canPublish}
                  onChange={(e) => setCanPublish(e.target.checked)}
                  className={styles.checkbox}
                />
                Can Publish
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={canSubscribe}
                  onChange={(e) => setCanSubscribe(e.target.checked)}
                  className={styles.checkbox}
                />
                Can Subscribe
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              Generate Token
            </button>
          </form>
        </div>
      </div>

      {/* Generated Tokens */}
      <div className={styles.card}>
        <h2>Generated Tokens ({tokens.length})</h2>
        {tokens.length === 0 ? (
          <p className={styles.emptyMessage}>No tokens generated yet. Use the form above to create one.</p>
        ) : (
          <div className={styles.tokensGrid}>
            {tokens.map((t) => (
              <div
                key={t.id}
                className={`${styles.tokenCard} ${t.expiresAt <= Date.now() ? styles.tokenCardExpired : ''}`}
              >
                <div className={styles.tokenHeader}>
                  <strong className={styles.tokenRoomName}>{t.roomName}</strong>
                  <span className={`${styles.tokenCountdown} ${t.expiresAt <= Date.now() ? styles.tokenCountdownExpired : styles.tokenCountdownActive}`}>
                    {formatCountdown(t.expiresAt)}
                  </span>
                </div>
                <div className={styles.tokenParticipant}>
                  Participant: {t.participantName}
                </div>
                <div className={styles.tokenPermissions}>
                  Permissions: {t.canPublish ? '✓ Publish' : '✗ Publish'} | {t.canSubscribe ? '✓ Subscribe' : '✗ Subscribe'}
                </div>
                <div className={styles.tokenTimestamp}>
                  Generated: {formatDateTime(t.generatedAt)}
                </div>
                <div className={styles.tokenTimestamp}>
                  Expires: {formatDateTime(t.expiresAt)}
                </div>
                <div className={styles.tokenValue}>
                  {t.token}
                </div>
                <div className={styles.tokenActions}>
                  <button
                    onClick={() => copyToken(t.token)}
                    className={styles.copyButton}
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => deleteToken(t.id)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rooms List */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Active Rooms ({rooms.length})</h2>
          <button
            onClick={loadRooms}
            disabled={loading}
            className={styles.refreshButton}
          >
            Refresh
          </button>
        </div>
        {rooms.length === 0 ? (
          <p className={styles.emptyMessage}>No active rooms</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Room Name</th>
                <th>Participants</th>
                <th>Max Participants</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr
                  key={room.sid}
                  className={selectedRoom === room.name ? styles.selectedRow : ''}
                >
                  <td>{room.name}</td>
                  <td>{room.numParticipants}</td>
                  <td>{room.maxParticipants || 'Unlimited'}</td>
                  <td>{new Date(room.creationTime * 1000).toLocaleString()}</td>
                  <td>
                    <button
                      onClick={() => setSelectedRoom(room.name)}
                      className={styles.viewButton}
                    >
                      View
                    </button>
                    <button
                      onClick={() => deleteRoom(room.name)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Participants */}
      {selectedRoom && (
        <div className={styles.card}>
          <h2>Participants in "{selectedRoom}"</h2>
          {participants.length === 0 ? (
            <p className={styles.emptyMessage}>No participants in this room</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Identity</th>
                  <th>Name</th>
                  <th>State</th>
                  <th>Joined At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr key={participant.sid}>
                    <td>{participant.identity}</td>
                    <td>{participant.name || '-'}</td>
                    <td>{participant.state}</td>
                    <td>{new Date(participant.joinedAt * 1000).toLocaleString()}</td>
                    <td>
                      <button
                        onClick={() => removeParticipant(selectedRoom, participant.identity)}
                        className={styles.deleteButton}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
