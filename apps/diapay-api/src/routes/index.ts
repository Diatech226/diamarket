import { Router } from 'express';
import { createPayment, getPayment, cancelPayment, refundPayment, listTransactions, listMethods, createWebhook, getBalance, createPayout } from '../controllers/payments';

export const apiRouter = Router();
apiRouter.post('/payments', createPayment);
apiRouter.get('/payments/:id', getPayment);
apiRouter.post('/payments/:id/cancel', cancelPayment);
apiRouter.post('/payments/:id/refund', refundPayment);
apiRouter.post('/webhooks', createWebhook);
apiRouter.get('/transactions', listTransactions);
apiRouter.get('/balance', getBalance);
apiRouter.post('/payouts', createPayout);
apiRouter.get('/payment-methods', listMethods);
