/**
 * LiveKit Admin View Components - Presentational Components
 */

import React from 'react';
import Link from 'next/link';
import styles from '../styles/LivekitAdmin.module.css';
import { Room, Participant, GeneratedToken } from '../services/livekitService';

interface NavigationProps {
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onLogout }) => (
  <>
    <div className={styles.backLink}>
      <Link href="/"><a className={styles.backLinkAnchor}>← Home</a></Link>
    </div>
    <div className={styles.header}>
      <h1>LiveKit Admin Dashboard</h1>
      <div className={styles.navLinks}>
        <Link href="/agent-config"><a className={styles.navLink}>Agent Config</a></Link>
        <Link href="/agent-builder"><a className={styles.navLink}>Agent Builder</a></Link>
        <Link href="/admin-users"><a className={styles.navLink}>Admin Users</a></Link>
        <Link href="/change-password"><a className={styles.navLink}>Change Password</a></Link>
        <Link href="/meet"><a className={styles.navLink}>Join Room</a></Link>
        <button onClick={onLogout} className={styles.logoutButton}>Logout</button>
      </div>
    </div>
  </>
);

interface CreateRoomFormProps {
  roomName: string;
  loading: boolean;
  onRoomNameChange: (name: string) => void;
  onCreate: () => void;
}

export const CreateRoomForm: React.FC<CreateRoomFormProps> = ({ roomName, loading, onRoomNameChange, onCreate }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate();
  };

  return (
    <div className={styles.card}>
      <h2>Create Room</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" value={roomName} onChange={(e) => onRoomNameChange(e.target.value)} placeholder="Room name" className={styles.inputField} />
        <button type="submit" disabled={loading} className={styles.submitButton}>Create Room</button>
      </form>
    </div>
  );
};

interface TokenGeneratorProps {
  roomName: string;
  participantName: string;
  canPublish: boolean;
  canSubscribe: boolean;
  loading: boolean;
  onRoomNameChange: (name: string) => void;
  onParticipantNameChange: (name: string) => void;
  onCanPublishChange: (value: boolean) => void;
  onCanSubscribeChange: (value: boolean) => void;
  onGenerate: () => void;
}

export const TokenGenerator: React.FC<TokenGeneratorProps> = (props) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    props.onGenerate();
  };

  return (
    <div className={styles.card}>
      <h2>Generate Access Token</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" value={props.roomName} onChange={(e) => props.onRoomNameChange(e.target.value)} placeholder="Room name" className={styles.inputField} />
        <input type="text" value={props.participantName} onChange={(e) => props.onParticipantNameChange(e.target.value)} placeholder="Participant name" className={styles.inputField} />
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={props.canPublish} onChange={(e) => props.onCanPublishChange(e.target.checked)} className={styles.checkbox} />
            Can Publish
          </label>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={props.canSubscribe} onChange={(e) => props.onCanSubscribeChange(e.target.checked)} className={styles.checkbox} />
            Can Subscribe
          </label>
        </div>
        <button type="submit" disabled={props.loading} className={styles.submitButton}>Generate Token</button>
      </form>
    </div>
  );
};

interface TokensListProps {
  tokens: GeneratedToken[];
  onCopy: (token: string) => void;
  onDelete: (id: string) => void;
  formatCountdown: (expiresAt: number) => string;
  formatDateTime: (timestamp: number) => string;
}

export const TokensList: React.FC<TokensListProps> = ({ tokens, onCopy, onDelete, formatCountdown, formatDateTime }) => (
  <div className={styles.card}>
    <h2>Generated Tokens ({tokens.length})</h2>
    {tokens.length === 0 ? (
      <p className={styles.emptyMessage}>No tokens generated yet. Use the form above to create one.</p>
    ) : (
      <div className={styles.tokensGrid}>
        {tokens.map((t) => (
          <div key={t.id} className={`${styles.tokenCard} ${t.expiresAt <= Date.now() ? styles.tokenCardExpired : ''}`}>
            <div className={styles.tokenHeader}>
              <strong className={styles.tokenRoomName}>{t.roomName}</strong>
              <span className={`${styles.tokenCountdown} ${t.expiresAt <= Date.now() ? styles.tokenCountdownExpired : styles.tokenCountdownActive}`}>
                {formatCountdown(t.expiresAt)}
              </span>
            </div>
            <div className={styles.tokenParticipant}>Participant: {t.participantName}</div>
            <div className={styles.tokenPermissions}>
              Permissions: {t.canPublish ? '✓ Publish' : '✗ Publish'} | {t.canSubscribe ? '✓ Subscribe' : '✗ Subscribe'}
            </div>
            <div className={styles.tokenTimestamp}>Generated: {formatDateTime(t.generatedAt)}</div>
            <div className={styles.tokenTimestamp}>Expires: {formatDateTime(t.expiresAt)}</div>
            <div className={styles.tokenValue}>{t.token}</div>
            <div className={styles.tokenActions}>
              <button onClick={() => onCopy(t.token)} className={styles.copyButton}>Copy</button>
              <button onClick={() => onDelete(t.id)} className={styles.deleteButton}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

interface RoomsListProps {
  rooms: Room[];
  selectedRoom: string | null;
  loading: boolean;
  onRefresh: () => void;
  onSelect: (roomName: string) => void;
  onDelete: (roomName: string) => void;
}

export const RoomsList: React.FC<RoomsListProps> = ({ rooms, selectedRoom, loading, onRefresh, onSelect, onDelete }) => (
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      <h2>Active Rooms ({rooms.length})</h2>
      <button onClick={onRefresh} disabled={loading} className={styles.refreshButton}>Refresh</button>
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
            <tr key={room.sid} className={selectedRoom === room.name ? styles.selectedRow : ''}>
              <td>{room.name}</td>
              <td>{room.numParticipants}</td>
              <td>{room.maxParticipants || 'Unlimited'}</td>
              <td>{new Date(room.creationTime * 1000).toLocaleString()}</td>
              <td>
                <button onClick={() => onSelect(room.name)} className={styles.viewButton}>View</button>
                <button onClick={() => onDelete(room.name)} className={styles.deleteButton}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

interface ParticipantsListProps {
  roomName: string;
  participants: Participant[];
  onRemove: (roomName: string, identity: string) => void;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({ roomName, participants, onRemove }) => (
  <div className={styles.card}>
    <h2>Participants in "{roomName}"</h2>
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
                <button onClick={() => onRemove(roomName, participant.identity)} className={styles.deleteButton}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);
