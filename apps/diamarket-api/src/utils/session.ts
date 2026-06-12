import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const SESSION_COOKIE_NAME = 'diamarket_session';
export type SessionUser = { id: string; email: string; name?: string; role: string };

type SessionClaims = SessionUser & { type: 'session' };

const cookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? ('none' as const) : ('lax' as const),
  path: '/',
  maxAge: env.sessionTtlHours * 60 * 60 * 1000,
});

export function createSessionToken(user: SessionUser) {
  return jwt.sign({ ...user, type: 'session' } satisfies SessionClaims, env.authSessionSecret, {
    expiresIn: `${env.sessionTtlHours}h`,
  });
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE_NAME, token, cookieOptions());
}

export function clearSessionCookie(res: Response) {
  const { maxAge: _maxAge, ...options } = cookieOptions();
  res.clearCookie(SESSION_COOKIE_NAME, options);
}

function parseCookies(header?: string) {
  return Object.fromEntries(
    (header ?? '').split(';').map((part) => part.trim()).filter(Boolean).map((part) => {
      const separator = part.indexOf('=');
      return [decodeURIComponent(part.slice(0, separator)), decodeURIComponent(part.slice(separator + 1))];
    }),
  );
}

export function readSession(req: Request): SessionUser | null {
  const bearer = req.header('authorization')?.replace(/^Bearer\s+/i, '');
  const token = bearer || parseCookies(req.header('cookie'))[SESSION_COOKIE_NAME];
  if (!token) return null;
  try {
    const claims = jwt.verify(token, env.authSessionSecret) as SessionClaims;
    return claims.type === 'session' ? { id: claims.id, email: claims.email, name: claims.name, role: claims.role } : null;
  } catch {
    return null;
  }
}
