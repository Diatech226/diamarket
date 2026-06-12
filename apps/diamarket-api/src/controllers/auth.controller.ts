import { Request, Response } from 'express';
import { env } from '../config/env';
import { User } from '../models/user.model';
import { hashPassword, verifyPassword } from '../utils/password';
import { clearSessionCookie, createSessionToken, readSession, SessionUser, setSessionCookie } from '../utils/session';

const normalizeEmail = (value: unknown) => String(value ?? '').trim().toLowerCase();
const publicUser = (user: { _id: unknown; email?: string | null; name?: string | null; role?: string | null }): SessionUser => ({
  id: String(user._id),
  email: user.email ?? '',
  name: user.name ?? undefined,
  role: user.role ?? env.defaultPublicRole,
});
const establishSession = (res: Response, user: SessionUser, status = 200) => {
  setSessionCookie(res, createSessionToken(user));
  return res.status(status).json({ authenticated: true, user });
};

export const authController = {
  async register(req: Request, res: Response) {
    if (!env.publicRegistrationEnabled) return res.status(403).json({ message: 'Public registration is disabled' });
    if (!env.emailPasswordAuthEnabled) return res.status(403).json({ message: 'Email/password authentication is disabled' });

    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password ?? '');
    const name = String(req.body.name ?? '').trim();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'A valid email is required' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must contain at least 8 characters' });
    if (await User.exists({ email })) return res.status(409).json({ message: 'An account already exists for this email' });

    // Public input never controls the role. Only the server-side normal-role default is used.
    const user = await User.create({ email, name, passwordHash: await hashPassword(password), role: env.defaultPublicRole });
    return establishSession(res, publicUser(user), 201);
  },

  async login(req: Request, res: Response) {
    if (!env.emailPasswordAuthEnabled) return res.status(403).json({ message: 'Email/password authentication is disabled' });
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password ?? '');
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user?.passwordHash || user.disabled || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    return establishSession(res, publicUser(user));
  },

  session(req: Request, res: Response) {
    const user = readSession(req);
    if (!user) return res.status(401).json({ authenticated: false, message: 'Unauthenticated' });
    return res.json({ authenticated: true, user });
  },

  logout(_req: Request, res: Response) {
    clearSessionCookie(res);
    return res.json({ authenticated: false, message: 'Logged out' });
  },

  providers(_req: Request, res: Response) {
    return res.json({ providers: [] });
  },
};
