import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = req.header('x-request-id') ?? `req_${crypto.randomBytes(12).toString('hex')}`;
  res.setHeader('X-Request-Id', requestId);
  next();
}
