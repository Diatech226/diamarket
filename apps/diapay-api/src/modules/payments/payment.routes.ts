import { Router } from 'express';
import { idempotencyMiddleware } from '../idempotency/idempotency.middleware';
import { cancelPayment, createPayment, getPayment } from './payment.controller';
export const paymentRouter = Router();
paymentRouter.post('/', idempotencyMiddleware, createPayment);
paymentRouter.get('/:id', getPayment);
paymentRouter.post('/:id/cancel', idempotencyMiddleware, cancelPayment);
