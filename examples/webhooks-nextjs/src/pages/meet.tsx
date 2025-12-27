import React, { useState } from 'react';
import Head from 'next/head';
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';

export default function Meet() {
  const [roomName, setRoomName] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [token, setToken] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !participantName.trim()) {
      setError('Room name and participant name are required');
      return;
    }

    try {
      setError('');
      const response = await fetch('/api/token/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: roomName.trim(),
          participantName: participantName.trim(),
          canPublish: true,
          canSubscribe: true,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
        setIsConnected(true);
      } else {
        setError(data.error || 'Failed to generate token');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
    }
  };

  const handleDisconnect = () => {
    setToken('');
    setIsConnected(false);
  };

  if (isConnected && token) {
    return (
      <div style={{ height: '100vh', width: '100vw' }}>
        <Head>
          <title>{roomName} - LiveKit Meet</title>
        </Head>
        <LiveKitRoom
          token={token}
          serverUrl="ws://localhost:7880"
          connect={true}
          onDisconnected={handleDisconnect}
          style={{ height: '100%' }}
        >
          <>
            <VideoConference />
            <RoomAudioRenderer />
          </>
        </LiveKitRoom>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui'
    }}>
      <Head>
        <title>Join LiveKit Room</title>
      </Head>

      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ marginBottom: '30px', textAlign: 'center', color: '#333' }}>
          Join Room
        </h1>

        {error && (
          <div style={{
            padding: '12px',
            background: '#fee',
            border: '1px solid #c00',
            borderRadius: '6px',
            marginBottom: '20px',
            color: '#c00'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleJoin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
              Room Name
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
              Your Name
            </label>
            <input
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="Enter your name"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Join Room
          </button>
        </form>

        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center',
          fontSize: '14px',
          color: '#666'
        }}>
          <a 
            href="/admin" 
            style={{ color: '#667eea', textDecoration: 'none' }}
          >
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
