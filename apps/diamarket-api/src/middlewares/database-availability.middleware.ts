import { NextFunction, Request, Response } from 'express';
import { getDatabaseStatus } from '../config/db';

export const requireDatabase = (_req: Request, res: Response, next: NextFunction) => {
  const database = getDatabaseStatus();

  if (!database.available) {
    return res.status(503).json({
      message: 'Database unavailable',
      status: database.status,
      details: database.reason
    });
  }

  next();
};
