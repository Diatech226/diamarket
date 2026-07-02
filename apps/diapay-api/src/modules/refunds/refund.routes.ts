import { Router } from 'express';
import { idempotencyMiddleware } from '../idempotency/idempotency.middleware';
import { createRefund, getRefund } from './refund.controller';
export const refundRouter = Router();
refundRouter.post('/', idempotencyMiddleware, createRefund);
refundRouter.get('/:id', getRefund);
