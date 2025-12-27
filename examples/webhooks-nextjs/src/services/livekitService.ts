/**
 * LiveKitService - Model Layer
 * Handles all LiveKit room and participant operations
 */

export interface Room {
  sid: string;
  name: string;
  emptyTimeout: number;
  maxParticipants: number;
  creationTime: number;
  numParticipants: number;
}

export interface Participant {
  sid: string;
  identity: string;
  name: string;
  state: string;
  joinedAt: number;
}

export interface GeneratedToken {
  id: string;
  token: string;
  roomName: string;
  participantName: string;
  canPublish: boolean;
  canSubscribe: boolean;
  generatedAt: number;
  expiresAt: number;
}

export interface TokenGenerationRequest {
  roomName: string;
  participantName: string;
  canPublish: boolean;
  canSubscribe: boolean;
}

export class LiveKitService {
  /**
   * Fetch all active rooms
   */
  static async getRooms(): Promise<Room[]> {
    const response = await fetch('/api/rooms/list');
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to load rooms');
    }
    return data.rooms || [];
  }

  /**
   * Create a new room
   */
  static async createRoom(name: string): Promise<void> {
    const response = await fetch('/api/rooms/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create room');
    }
  }

  /**
   * Delete a room
   */
  static async deleteRoom(roomName: string): Promise<void> {
    const response = await fetch(`/api/rooms/${encodeURIComponent(roomName)}/delete`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete room');
    }
  }

  /**
   * Get participants in a room
   */
  static async getParticipants(roomName: string): Promise<Participant[]> {
    const response = await fetch(`/api/rooms/${encodeURIComponent(roomName)}/participants`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to load participants');
    }
    return data.participants || [];
  }

  /**
   * Remove a participant from a room
   */
  static async removeParticipant(roomName: string, identity: string): Promise<void> {
    const response = await fetch(
      `/api/participants/${encodeURIComponent(roomName)}/${encodeURIComponent(identity)}/remove`,
      { method: 'POST' }
    );
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to remove participant');
    }
  }

  /**
   * Generate access token
   */
  static async generateToken(request: TokenGenerationRequest): Promise<string> {
    const response = await fetch('/api/token/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate token');
    }
    return data.token;
  }

  /**
   * Decode JWT token
   */
  static decodeToken(token: string): { exp?: number; identity?: string } {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return {};
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return {};
    }
  }

  /**
   * Load tokens from localStorage
   */
  static loadTokensFromStorage(): GeneratedToken[] {
    const stored = localStorage.getItem('generated_tokens');
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Filter out expired tokens
    const active = parsed.filter((t: GeneratedToken) => t.expiresAt > Date.now());
    
    // Update storage if tokens were filtered
    if (active.length !== parsed.length) {
      localStorage.setItem('generated_tokens', JSON.stringify(active));
    }
    
    return active;
  }

  /**
   * Save tokens to localStorage
   */
  static saveTokensToStorage(tokens: GeneratedToken[]): void {
    localStorage.setItem('generated_tokens', JSON.stringify(tokens));
  }
}
