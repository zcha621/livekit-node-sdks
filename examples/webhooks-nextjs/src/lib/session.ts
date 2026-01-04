import { getIronSession } from 'iron-session';
import type { SessionOptions } from 'iron-session';
import type { NextApiRequest, NextApiResponse } from 'next';

export const sessionOptions: SessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || 'complex_password_at_least_32_characters_long',
  cookieName: 'livekit_admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

// Session data type
export interface SessionData {
  user?: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    userType: 'admin' | 'normal';
    permissions?: string[];
  };
}

// Helper to check if user is admin
export function isAdmin(session: SessionData): boolean {
  return session.user?.userType === 'admin';
}

// Helper to check if user has specific permission
export function hasPermission(session: SessionData, permission: string): boolean {
  // Admins have all permissions
  if (isAdmin(session)) {
    return true;
  }
  
  // Check if normal user has the specific permission
  return session.user?.permissions?.includes(permission) || false;
}

// Permission constants
export const PERMISSIONS = {
  AGENT_BUILDER_CREATE: 'agent_builder_create',
  AGENT_BUILDER_EDIT: 'agent_builder_edit',
  AGENT_BUILDER_DELETE: 'agent_builder_delete',
  AGENT_CONFIG_EDIT: 'agent_config_edit',
  LIVEKIT_TOKEN_CREATE: 'livekit_token_create',
  LIVEKIT_ROOM_MANAGE: 'livekit_room_manage',
  VIDEO_CONFERENCE_ACCESS: 'video_conference_access',
  USER_MANAGEMENT: 'user_management',
} as const;

// Get session for API routes
export async function getSession(req: NextApiRequest, res: NextApiResponse) {
  return getIronSession<SessionData>(req, res, sessionOptions);
}

// Wrapper for API routes
export function withSessionRoute(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    req.session = await getSession(req, res);
    return handler(req, res);
  };
}

// Extend NextApiRequest type
declare module 'next' {
  interface NextApiRequest {
    session: Awaited<ReturnType<typeof getSession>>;
  }
}
