import { NextFunction, Request, Response } from 'express';
import { AppError } from './AppError';

export function errorMiddleware(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  const appError = error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Internal server error');
  res.status(appError.status).json({
    success: false,
    message: appError.message,
    error: { code: appError.code, details: appError.details },
  });
}
