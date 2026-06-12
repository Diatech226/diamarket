import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/requireAuth';

const asyncHandler = (handler: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export const authRouter = Router();
authRouter.post('/register', asyncHandler(authController.register));
authRouter.post('/login', asyncHandler(authController.login));
authRouter.get('/me', requireAuth, asyncHandler(authController.me));
authRouter.get('/session', requireAuth, asyncHandler(authController.me));
authRouter.post('/logout', authController.logout);
authRouter.get('/oauth/providers', authController.providers);
