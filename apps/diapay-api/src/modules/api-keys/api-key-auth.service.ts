import { Request, Response, NextFunction } from 'express';
import { authenticateApiKey } from '../../services/developer-platform-store';
import { DiapayScope, hasScopes } from '../auth/scopes';

declare global {
  namespace Express { interface Request { authContext?: { merchantId: string; applicationId: string; environment: 'test' | 'live'; scopes: string[]; apiKeyId: string; livemode: boolean } } }
}
function extract(req: Request) { const auth = req.header('authorization'); if (auth?.startsWith('Bearer ')) return auth.slice(7); return req.header('x-diapay-secret-key') ?? undefined; }
export function apiKeyAuthMiddleware(requiredScopes: DiapayScope[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    const secret = extract(req);
    if (!secret) return res.status(401).json({ success: false, message: 'API key required', error: { code: 'API_KEY_REQUIRED' } });
    const context = authenticateApiKey(secret);
    if (!context) return res.status(401).json({ success: false, message: 'Invalid API key', error: { code: 'INVALID_API_KEY' } });
    if (!hasScopes(context.scopes, requiredScopes)) return res.status(403).json({ success: false, message: 'Insufficient API key scope', error: { code: 'INSUFFICIENT_SCOPE' } });
    req.authContext = context; next();
  };
}
