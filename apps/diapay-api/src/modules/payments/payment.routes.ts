import { Router } from 'express';
import { cancelPayment, createPayment, getPayment } from './payment.controller';
export const paymentRouter = Router();
paymentRouter.post('/', createPayment);
paymentRouter.get('/:id', getPayment);
paymentRouter.post('/:id/cancel', cancelPayment);
