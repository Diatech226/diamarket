import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import { corsMiddleware } from './config/cors';
import { loggerMiddleware } from './config/logger';
import { securityMiddleware } from './config/security';
import { apiRouter } from './routes';
import { errorMiddleware } from './shared/errors/error.middleware';
import { requestIdMiddleware } from './shared/middleware/request-id.middleware';

dotenv.config();

function apiResponseEnvelope(_req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);
  res.json = (body?: unknown) => {
    if (body && typeof body === 'object' && 'success' in body) {
      return originalJson(body);
    }

    if (res.statusCode >= 400) {
      const message = body && typeof body === 'object' && 'error' in body && typeof (body as { error?: { message?: unknown } }).error?.message === 'string'
        ? String((body as { error: { message: string } }).error.message)
        : body && typeof body === 'object' && 'message' in body && typeof (body as { message?: unknown }).message === 'string'
          ? String((body as { message: string }).message)
          : 'Request failed';
      return originalJson({
        success: false,
        message,
        error: {
          code: res.statusCode === 404 ? 'NOT_FOUND' : res.statusCode === 400 ? 'BAD_REQUEST' : 'API_ERROR',
          details: body && typeof body === 'object' ? body : {},
        },
      });
    }

    return originalJson({ success: true, data: body ?? {}, message: 'OK' });
  };
  next();
}

export function createApp() {
  const app = express();
  app.use(requestIdMiddleware);
  app.use(corsMiddleware);
  app.use(securityMiddleware);
  app.use(express.json());
  app.use(loggerMiddleware);
  app.use(apiResponseEnvelope);

  app.get('/health', (_req, res) => res.json({ service: 'diapay-api', status: 'ok' }));

  // Legacy route kept for compatibility during Diapay restructuring.
  app.use('/api/v1', apiRouter);

  app.use(errorMiddleware);
  return app;
}

export const app = createApp();
