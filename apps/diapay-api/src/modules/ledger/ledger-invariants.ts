import { ledgerNotBalancedError, LedgerError } from './ledger-errors';
import type { LedgerEntry, LedgerTransaction } from './ledger.types';
export function assertBalancedLedgerTransaction(entriesOrTx: LedgerEntry[] | LedgerTransaction) {
  const entries = Array.isArray(entriesOrTx) ? entriesOrTx : entriesOrTx.entries;
  const debit = entries.filter((e) => e.direction === 'debit').reduce((sum, e) => sum + e.amount, 0);
  const credit = entries.filter((e) => e.direction === 'credit').reduce((sum, e) => sum + e.amount, 0);
  if (entries.length < 2 || debit !== credit) throw ledgerNotBalancedError();
}
export function assertPostedEntryImmutable(entry: LedgerEntry) { if (entry.posted) throw new LedgerError('Posted ledger entries are immutable; create a reversal transaction instead', 'LEDGER_ENTRY_IMMUTABLE', 409); }
