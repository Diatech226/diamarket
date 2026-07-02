import { Request, Response } from 'express';
import * as service from './refund.service';
function handle(error: unknown, res: Response) { const e = error as { status?: number; code?: string; details?: unknown; message?: string }; res.status(e.status ?? 500).json({ success: false, message: e.message ?? 'Internal server error', error: { code: e.code ?? (e.status === 404 ? 'NOT_FOUND' : e.status === 400 ? 'VALIDATION_ERROR' : 'API_ERROR'), details: e.details ?? {} } }); }
export const createRefund = (req: Request, res: Response) => { try { res.status(201).json(service.createRefund(req.body)); } catch (e) { handle(e, res); } };
export const getRefund = (req: Request, res: Response) => { try { res.json(service.getRefund(req.params.id)); } catch (e) { handle(e, res); } };
