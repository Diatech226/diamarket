import { Router } from 'express';
import { getLedgerTransaction, ledgerErrorHandler, listLedgerAccounts, listLedgerTransactions } from './ledger.controller';
export const ledgerRouter = Router();
ledgerRouter.get('/accounts', listLedgerAccounts);
ledgerRouter.get('/transactions', listLedgerTransactions);
ledgerRouter.get('/transactions/:id', getLedgerTransaction);
ledgerRouter.use(ledgerErrorHandler);
