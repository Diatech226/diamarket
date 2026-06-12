import { NextFunction, Request, Response } from 'express';
import { readSession } from '../utils/session';
import { env } from '../config/env';

export type AuthContext = { userId: string; role: string; email?: string; vendorId?: string; marketplacePointId?: string; country?: string };

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = readSession(req);
  const userId = session?.id || (env.allowAuthHeaderBridge ? req.header('x-user-id') : undefined);
  const role = session?.role || (env.allowAuthHeaderBridge ? req.header('x-user-role') : undefined) || 'client';

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  (req as Request & { auth: AuthContext }).auth = {
    userId,
    role,
    email: session?.email,
    vendorId: req.header('x-vendor-id') || undefined,
    marketplacePointId: req.header('x-marketplace-point-id') || undefined,
    country: req.header('x-user-country') || undefined,
  };
  next();
}
