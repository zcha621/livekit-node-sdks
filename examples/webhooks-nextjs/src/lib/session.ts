import { getIronSession, IronSessionOptions } from 'iron-session';
import { NextApiRequest, NextApiResponse } from 'next';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { cookies } from 'next/headers';

export const sessionOptions: IronSessionOptions = {
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
    isAdmin: boolean;
  };
}

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
