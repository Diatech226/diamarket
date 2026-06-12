import { NextFunction, Request, Response } from 'express';

export const CMS_ROLES = ['admin', 'editor', 'author'] as const;

export function requireCmsRole(req: Request, res: Response, next: NextFunction) {
  const auth = (req as Request & { auth?: { role: string } }).auth;
  if (!auth) return res.status(401).json({ message: 'Unauthorized' });
  if (!CMS_ROLES.includes(auth.role as (typeof CMS_ROLES)[number])) {
    return res.status(403).json({ message: 'Accès refusé au CMS' });
  }
  next();
}
