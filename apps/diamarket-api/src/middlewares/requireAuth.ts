import { NextFunction, Request, Response } from 'express';
import { readSessionResult } from '../utils/session';
import { env } from '../config/env';
import { User } from '../models/user.model';

export type AuthContext = { userId: string; role: string; email?: string; vendorId?: string; marketplacePointId?: string; country?: string };

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const { user: session, error } = readSessionResult(req);
    const bridgeUserId = env.allowAuthHeaderBridge ? req.header('x-user-id') : undefined;
    if (!session && !bridgeUserId) return res.status(401).json({ message: error === 'expired' ? 'Token expiré' : 'Non authentifié' });

    const currentUser = session ? await User.findById(session.id) : null;
    if (session && (!currentUser || currentUser.disabled)) return res.status(401).json({ message: 'Compte introuvable ou désactivé' });

    (req as Request & { auth: AuthContext }).auth = {
      userId: session?.id ?? bridgeUserId!,
      role: currentUser?.role ?? (env.allowAuthHeaderBridge ? req.header('x-user-role') : undefined) ?? 'user',
      email: currentUser?.email ?? session?.email,
      vendorId: req.header('x-vendor-id') || undefined,
      marketplacePointId: req.header('x-marketplace-point-id') || undefined,
      country: req.header('x-user-country') || undefined,
    };
    next();
  } catch (error) {
    next(error);
  }
}
