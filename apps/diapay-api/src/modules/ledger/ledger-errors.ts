export class LedgerError extends Error { constructor(message: string, public code: string, public status = 400) { super(message); } }
export const ledgerNotBalancedError = () => new LedgerError('Ledger transaction is not balanced', 'LEDGER_NOT_BALANCED', 400);
