/**
 * useLiveKitAdminViewModel - ViewModel Layer
 * Manages state and business logic for LiveKit admin dashboard
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { LiveKitService, Room, Participant, GeneratedToken } from '../services/livekitService';
import { AuthService } from '../services/authService';

interface LiveKitAdminViewModel {
  // State
  rooms: Room[];
  selectedRoom: string | null;
  participants: Participant[];
  tokens: GeneratedToken[];
  loading: boolean;
  error: string;
  newRoomName: string;
  tokenRoomName: string;
  tokenParticipantName: string;
  canPublish: boolean;
  canSubscribe: boolean;

  // Actions
  setNewRoomName: (name: string) => void;
  setTokenRoomName: (name: string) => void;
  setTokenParticipantName: (name: string) => void;
  setCanPublish: (canPublish: boolean) => void;
  setCanSubscribe: (canSubscribe: boolean) => void;
  selectRoom: (roomName: string) => void;
  refreshRooms: () => Promise<void>;
  createRoom: () => Promise<void>;
  deleteRoom: (roomName: string) => Promise<void>;
  removeParticipant: (roomName: string, identity: string) => Promise<void>;
  generateToken: () => Promise<void>;
  copyToken: (token: string) => void;
  deleteToken: (id: string) => void;
  formatCountdown: (expiresAt: number) => string;
  formatDateTime: (timestamp: number) => string;
  logout: () => Promise<void>;
}

export function useLiveKitAdminViewModel(): LiveKitAdminViewModel {
  const router = useRouter();

  // State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tokens, setTokens] = useState<GeneratedToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [tokenRoomName, setTokenRoomName] = useState('');
  const [tokenParticipantName, setTokenParticipantName] = useState('');
  const [canPublish, setCanPublish] = useState(true);
  const [canSubscribe, setCanSubscribe] = useState(true);

  // Initialize: Check auth and load data
  useEffect(() => {
    const initialize = async () => {
      const user = await AuthService.checkAuth();
      if (!user) {
        router.push('/login');
        return;
      }
      
      await loadRooms();
      loadTokens();
    };

    initialize();
  }, [router]);

  // Update token countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTokens(prev => [...prev]); // Force re-render for countdown
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load participants when room is selected
  useEffect(() => {
    if (selectedRoom) {
      loadParticipants(selectedRoom);
      const interval = setInterval(() => loadParticipants(selectedRoom), 5000);
      return () => clearInterval(interval);
    } else {
      setParticipants([]);
    }
  }, [selectedRoom]);

  // Private: Load rooms
  const loadRooms = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await LiveKitService.getRooms();
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  // Private: Load participants
  const loadParticipants = async (roomName: string) => {
    try {
      const data = await LiveKitService.getParticipants(roomName);
      setParticipants(data);
    } catch (err) {
      console.error('Failed to load participants:', err);
    }
  };

  // Private: Load tokens from localStorage
  const loadTokens = () => {
    const stored = LiveKitService.loadTokensFromStorage();
    setTokens(stored);
  };

  // Public: Refresh rooms
  const refreshRooms = useCallback(async () => {
    await loadRooms();
  }, []);

  // Public: Select room
  const selectRoom = useCallback((roomName: string) => {
    setSelectedRoom(roomName);
  }, []);

  // Public: Create room
  const createRoom = useCallback(async () => {
    if (!newRoomName.trim()) return;

    try {
      setLoading(true);
      setError('');
      await LiveKitService.createRoom(newRoomName);
      setNewRoomName('');
      await loadRooms();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  }, [newRoomName]);

  // Public: Delete room
  const deleteRoom = useCallback(async (roomName: string) => {
    if (!confirm(`Delete room "${roomName}"?`)) return;

    try {
      setLoading(true);
      setError('');
      await LiveKitService.deleteRoom(roomName);
      
      if (selectedRoom === roomName) {
        setSelectedRoom(null);
        setParticipants([]);
      }
      
      await loadRooms();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete room');
    } finally {
      setLoading(false);
    }
  }, [selectedRoom]);

  // Public: Remove participant
  const removeParticipant = useCallback(async (roomName: string, identity: string) => {
    if (!confirm(`Remove participant "${identity}"?`)) return;

    try {
      setLoading(true);
      setError('');
      await LiveKitService.removeParticipant(roomName, identity);
      await loadParticipants(roomName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove participant');
    } finally {
      setLoading(false);
    }
  }, []);

  // Public: Generate token
  const generateToken = useCallback(async () => {
    if (!tokenRoomName.trim() || !tokenParticipantName.trim()) return;

    try {
      setLoading(true);
      setError('');
      
      const token = await LiveKitService.generateToken({
        roomName: tokenRoomName,
        participantName: tokenParticipantName,
        canPublish,
        canSubscribe,
      });

      // Decode token to get expiry
      const decoded = LiveKitService.decodeToken(token);
      const expiresAt = decoded.exp ? decoded.exp * 1000 : Date.now() + (10 * 60 * 60 * 1000);

      const newToken: GeneratedToken = {
        id: Date.now().toString(),
        token,
        roomName: tokenRoomName,
        participantName: tokenParticipantName,
        canPublish,
        canSubscribe,
        generatedAt: Date.now(),
        expiresAt,
      };

      const updated = [...tokens, newToken];
      setTokens(updated);
      LiveKitService.saveTokensToStorage(updated);

      // Clear form
      setTokenRoomName('');
      setTokenParticipantName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate token');
    } finally {
      setLoading(false);
    }
  }, [tokenRoomName, tokenParticipantName, canPublish, canSubscribe, tokens]);

  // Public: Copy token
  const copyToken = useCallback((token: string) => {
    navigator.clipboard.writeText(token);
    setError('Token copied to clipboard!');
    setTimeout(() => setError(''), 2000);
  }, []);

  // Public: Delete token
  const deleteToken = useCallback((id: string) => {
    const updated = tokens.filter(t => t.id !== id);
    setTokens(updated);
    LiveKitService.saveTokensToStorage(updated);
  }, [tokens]);

  // Public: Format countdown
  const formatCountdown = useCallback((expiresAt: number): string => {
    const diff = expiresAt - Date.now();
    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  }, []);

  // Public: Format date time
  const formatDateTime = useCallback((timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  }, []);

  // Public: Logout
  const logout = useCallback(async () => {
    await AuthService.logout();
    router.push('/login');
  }, [router]);

  return {
    rooms,
    selectedRoom,
    participants,
    tokens,
    loading,
    error,
    newRoomName,
    tokenRoomName,
    tokenParticipantName,
    canPublish,
    canSubscribe,
    setNewRoomName,
    setTokenRoomName,
    setTokenParticipantName,
    setCanPublish,
    setCanSubscribe,
    selectRoom,
    refreshRooms,
    createRoom,
    deleteRoom,
    removeParticipant,
    generateToken,
    copyToken,
    deleteToken,
    formatCountdown,
    formatDateTime,
    logout,
  };
}
