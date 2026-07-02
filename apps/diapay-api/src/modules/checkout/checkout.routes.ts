import { Router } from 'express';
import { idempotencyMiddleware } from '../idempotency/idempotency.middleware';
import { createSession, listSessions, retrieveSession } from './checkout.controller';
export const checkoutRouter = Router();
checkoutRouter.post('/sessions', idempotencyMiddleware, createSession);
checkoutRouter.get('/sessions', listSessions);
checkoutRouter.get('/sessions/:id', retrieveSession);
