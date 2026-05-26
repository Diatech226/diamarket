import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { apiRouter } from './routes';
import { errorHandler } from './middlewares/error.middleware';

const rateBucket = new Map<string, { count: number; resetAt: number }>();

export const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});
app.use(cors({ origin: (origin, cb) => cb(null, !origin || /localhost|diamarket/.test(origin)), credentials: true }));
app.use((req, res, next) => {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const current = rateBucket.get(key) || { count: 0, resetAt: now + 15 * 60 * 1000 };
  if (now > current.resetAt) {
    current.count = 0;
    current.resetAt = now + 15 * 60 * 1000;
  }
  current.count += 1;
  rateBucket.set(key, current);
  if (current.count > 300) return res.status(429).json({ message: 'Too many requests' });
  next();
});
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use('/api', apiRouter);
app.use(errorHandler);
