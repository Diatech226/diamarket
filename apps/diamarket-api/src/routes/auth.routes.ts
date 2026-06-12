import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

export const authRouter = Router();
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.get('/session', authController.session);
authRouter.post('/logout', authController.logout);
authRouter.get('/oauth/providers', authController.providers);
