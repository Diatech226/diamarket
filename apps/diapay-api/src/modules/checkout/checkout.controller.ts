import { Request, Response } from 'express';
import * as service from './checkout.service';
function handle(error: unknown, res: Response) { const e = error as { status?: number; code?: string; details?: unknown; message?: string }; res.status(e.status ?? 500).json({ success: false, message: e.message ?? 'Internal server error', error: { code: e.code ?? (e.status === 404 ? 'NOT_FOUND' : e.status === 400 ? 'VALIDATION_ERROR' : 'API_ERROR'), details: e.details ?? {} } }); }
export const createSession = (req: Request, res: Response) => { try { res.status(201).json(service.createSession(req.body, { authorization: req.header('authorization') ?? undefined, 'idempotency-key': req.header('idempotency-key') ?? undefined })); } catch (e) { handle(e, res); } };
export const listSessions = (req: Request, res: Response) => { try { res.json(service.listSessions(req.query.merchant as string | undefined)); } catch (e) { handle(e, res); } };
export const retrieveSession = (req: Request, res: Response) => { try { res.json(service.getSession(req.params.id, req.query.merchant as string | undefined)); } catch (e) { handle(e, res); } };
