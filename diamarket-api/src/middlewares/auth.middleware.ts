import { NextFunction, Request, Response } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.header('x-user-id');
  const role = req.header('x-user-role') || 'client';

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: missing x-user-id header' });
  }

  (req as Request & { auth?: { userId: string; role: string } }).auth = { userId, role };
  next();
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as Request & { auth?: { role: string } }).auth;

    if (!auth) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(auth.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
}
