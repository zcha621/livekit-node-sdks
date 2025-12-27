import React, { useState, useEffect } from 'react';
import Head from 'next/head';

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

export default function Admin() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [newRoomName, setNewRoomName] = useState('');
  const [tokenRoomName, setTokenRoomName] = useState('');
  const [tokenParticipantName, setTokenParticipantName] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [canPublish, setCanPublish] = useState(true);
  const [canSubscribe, setCanSubscribe] = useState(true);

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
        setGeneratedToken(data.token);
      } else {
        setError(data.error || 'Failed to generate token');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <Head>
        <title>LiveKit Admin Dashboard</title>
      </Head>

      <h1>LiveKit Admin Dashboard</h1>

      {error && (
        <div style={{ padding: '10px', background: '#fee', border: '1px solid #c00', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {/* Create Room */}
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h2>Create Room</h2>
          <form onSubmit={createRoom}>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Room name"
              style={{ padding: '8px', width: '100%', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '8px 16px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Create Room
            </button>
          </form>
        </div>

        {/* Generate Token */}
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h2>Generate Access Token</h2>
          <form onSubmit={generateToken}>
            <input
              type="text"
              value={tokenRoomName}
              onChange={(e) => setTokenRoomName(e.target.value)}
              placeholder="Room name"
              style={{ padding: '8px', width: '100%', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <input
              type="text"
              value={tokenParticipantName}
              onChange={(e) => setTokenParticipantName(e.target.value)}
              placeholder="Participant name"
              style={{ padding: '8px', width: '100%', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                <input
                  type="checkbox"
                  checked={canPublish}
                  onChange={(e) => setCanPublish(e.target.checked)}
                  style={{ marginRight: '5px' }}
                />
                Can Publish
              </label>
              <label style={{ display: 'block' }}>
                <input
                  type="checkbox"
                  checked={canSubscribe}
                  onChange={(e) => setCanSubscribe(e.target.checked)}
                  style={{ marginRight: '5px' }}
                />
                Can Subscribe
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '8px 16px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Generate Token
            </button>
          </form>
          {generatedToken && (
            <div style={{ marginTop: '10px', padding: '10px', background: '#f0f0f0', borderRadius: '4px', wordBreak: 'break-all', fontSize: '12px' }}>
              <strong>Token:</strong>
              <div style={{ marginTop: '5px' }}>{generatedToken}</div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedToken);
                  alert('Token copied to clipboard!');
                }}
                style={{ marginTop: '10px', padding: '4px 8px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Copy Token
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rooms List */}
      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0 }}>Active Rooms ({rooms.length})</h2>
          <button
            onClick={loadRooms}
            disabled={loading}
            style={{ padding: '6px 12px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Refresh
          </button>
        </div>
        {rooms.length === 0 ? (
          <p style={{ color: '#666' }}>No active rooms</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Room Name</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Participants</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Max Participants</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Created</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr
                  key={room.sid}
                  style={{
                    borderBottom: '1px solid #eee',
                    background: selectedRoom === room.name ? '#e3f2fd' : 'transparent',
                  }}
                >
                  <td style={{ padding: '10px' }}>{room.name}</td>
                  <td style={{ padding: '10px' }}>{room.numParticipants}</td>
                  <td style={{ padding: '10px' }}>{room.maxParticipants || 'Unlimited'}</td>
                  <td style={{ padding: '10px' }}>{new Date(room.creationTime * 1000).toLocaleString()}</td>
                  <td style={{ padding: '10px' }}>
                    <button
                      onClick={() => setSelectedRoom(room.name)}
                      style={{ marginRight: '5px', padding: '4px 8px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => deleteRoom(room.name)}
                      style={{ padding: '4px 8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h2>Participants in "{selectedRoom}"</h2>
          {participants.length === 0 ? (
            <p style={{ color: '#666' }}>No participants in this room</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Identity</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>State</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Joined At</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr key={participant.sid} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{participant.identity}</td>
                    <td style={{ padding: '10px' }}>{participant.name || '-'}</td>
                    <td style={{ padding: '10px' }}>{participant.state}</td>
                    <td style={{ padding: '10px' }}>{new Date(participant.joinedAt * 1000).toLocaleString()}</td>
                    <td style={{ padding: '10px' }}>
                      <button
                        onClick={() => removeParticipant(selectedRoom, participant.identity)}
                        style={{ padding: '4px 8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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
