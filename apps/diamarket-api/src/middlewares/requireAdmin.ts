import { NextFunction, Request, Response } from 'express';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = (req as Request & { auth?: { role: string } }).auth;
  if (!auth) return res.status(401).json({ message: 'Non authentifié' });
  if (auth.role !== 'admin') return res.status(403).json({ message: 'Accès admin requis' });
  next();
}
