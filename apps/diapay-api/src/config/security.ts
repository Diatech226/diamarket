import { NextFunction, Request, Response } from 'express';

export function securityMiddleware(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
}
