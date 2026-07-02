import { Router } from 'express';
import { createRefund, getRefund } from './refund.controller';
export const refundRouter = Router();
refundRouter.post('/', createRefund);
refundRouter.get('/:id', getRefund);
