import { Request, Response, NextFunction } from 'express';
import { LedgerError } from './ledger-errors';
import { ledgerService } from './ledger.service';
export function listLedgerAccounts(_req: Request, res: Response) { res.json(ledgerService.listAccounts()); }
export function listLedgerTransactions(_req: Request, res: Response) { res.json(ledgerService.listTransactions()); }
export function getLedgerTransaction(req: Request, res: Response) { const tx = ledgerService.getTransaction(req.params.id); if (!tx) return res.status(404).json({ success: false, message: 'Ledger transaction not found', error: { code: 'LEDGER_TRANSACTION_NOT_FOUND' } }); return res.json(tx); }
export function ledgerErrorHandler(err: unknown, _req: Request, res: Response, next: NextFunction) { if (err instanceof LedgerError) return res.status(err.status).json({ success: false, message: err.message, error: { code: err.code } }); next(err); }
