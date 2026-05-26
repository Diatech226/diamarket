import { NextFunction, Request, Response } from 'express';

export function clerkAuthPlaceholder(req: Request, _res: Response, next: NextFunction) {
  req.headers['x-auth-provider'] = 'clerk-placeholder';
  next();
}
