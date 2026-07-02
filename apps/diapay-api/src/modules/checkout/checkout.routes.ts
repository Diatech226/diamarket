import { Router } from 'express';
import { createSession, listSessions, retrieveSession } from './checkout.controller';
export const checkoutRouter = Router();
checkoutRouter.post('/sessions', createSession);
checkoutRouter.get('/sessions', listSessions);
checkoutRouter.get('/sessions/:id', retrieveSession);
