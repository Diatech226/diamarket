import { Request, Response } from 'express';
import { sandboxState } from '../../services/checkout-store';
import * as service from './payment.service';
function handle(error: unknown, res: Response) { const e = error as { status?: number; code?: string; details?: unknown; message?: string }; res.status(e.status ?? 500).json({ success: false, message: e.message ?? 'Internal server error', error: { code: e.code ?? (e.status === 404 ? 'NOT_FOUND' : e.status === 400 ? 'VALIDATION_ERROR' : 'API_ERROR'), details: e.details ?? {} } }); }
export const createPayment = async (req: Request, res: Response) => { try { res.status(201).json(await service.createPayment(req.body, sandboxState.resolveMerchant(req.header('authorization') ?? undefined))); } catch (e) { handle(e, res); } };
export const getPayment = (req: Request, res: Response) => { try { res.json(service.getPayment(req.params.id)); } catch (e) { handle(e, res); } };
export const cancelPayment = async (req: Request, res: Response) => { try { res.json(await service.cancelPayment(req.params.id)); } catch (e) { handle(e, res); } };
