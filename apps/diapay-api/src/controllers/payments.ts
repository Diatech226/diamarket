import { Request, Response } from 'express';
import { mockProvider } from '../providers/mock/provider';

export const createPayment = async (req: Request, res: Response) => res.status(201).json(await mockProvider.createPayment(req.body));
export const getPayment = async (req: Request, res: Response) => res.json(await mockProvider.getPayment(req.params.id));
export const cancelPayment = async (req: Request, res: Response) => res.json(await mockProvider.cancelPayment(req.params.id));
export const refundPayment = async (req: Request, res: Response) => res.json(await mockProvider.refundPayment(req.params.id));
export const createWebhook = async (_req: Request, res: Response) => res.status(202).json({ received: true });
export const listTransactions = async (_req: Request, res: Response) => res.json([{ id: 'txn_mock_1', status: 'succeeded' }]);
export const getBalance = async (_req: Request, res: Response) => res.json({ available: 0, currency: 'USD' });
export const createPayout = async (_req: Request, res: Response) => res.status(201).json({ id: 'po_mock_1', status: 'pending' });
export const listMethods = async (_req: Request, res: Response) => res.json(['mobile-money', 'bank-card', 'bank-transfer', 'crypto', 'mock']);
