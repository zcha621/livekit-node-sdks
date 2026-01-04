import { NextApiRequest, NextApiResponse } from 'next';
import { SessionData, isAdmin, hasPermission } from './session';

/**
 * Middleware to require specific permission for API routes
 */
export function requirePermission(permission: string) {
  return async (req: NextApiRequest, res: NextApiResponse, next: () => Promise<void>) => {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Admins always have access
    if (isAdmin(req.session as SessionData)) {
      return next();
    }

    // Check if user has the specific permission
    if (!hasPermission(req.session as SessionData, permission)) {
      return res.status(403).json({ 
        message: 'Forbidden: Insufficient permissions',
        requiredPermission: permission
      });
    }

    return next();
  };
}

/**
 * Middleware to require admin access
 */
export function requireAdmin(req: NextApiRequest, res: NextApiResponse, next: () => Promise<void>) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!isAdmin(req.session as SessionData)) {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }

  return next();
}

/**
 * Middleware to require authentication (any user)
 */
export function requireAuth(req: NextApiRequest, res: NextApiResponse, next: () => Promise<void>) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return next();
}

/**
 * Helper to check permission in API routes
 */
export function checkPermission(req: NextApiRequest, permission: string): boolean {
  if (!req.session.user) {
    return false;
  }

  return isAdmin(req.session as SessionData) || hasPermission(req.session as SessionData, permission);
}

/**
 * Helper to check if request is from admin
 */
export function checkAdmin(req: NextApiRequest): boolean {
  if (!req.session.user) {
    return false;
  }

  return isAdmin(req.session as SessionData);
}
