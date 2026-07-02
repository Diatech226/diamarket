import crypto from 'crypto';
import type { LedgerAccount, LedgerAccountType, LedgerOwnerType, LedgerTransaction } from './ledger.types';
function id(prefix: string) { return `${prefix}_${crypto.randomBytes(10).toString('hex')}`; }
function now() { return new Date().toISOString(); }
const accounts = new Map<string, LedgerAccount>();
const transactions = new Map<string, LedgerTransaction>();
const postedByReference = new Map<string, string>();
function accountKey(ownerType: LedgerOwnerType, ownerId: string, currency: string, accountType: LedgerAccountType) { return `${ownerType}:${ownerId}:${currency}:${accountType}`; }
export const ledgerRepository = {
  ensureAccount(ownerType: LedgerOwnerType, ownerId: string, currency: string, accountType: LedgerAccountType) {
    const key = accountKey(ownerType, ownerId, currency, accountType);
    const existing = accounts.get(key); if (existing) return existing;
    const timestamp = now(); const account: LedgerAccount = { id: id('la_test'), ownerType, ownerId, currency, accountType, balance: 0, createdAt: timestamp, updatedAt: timestamp };
    accounts.set(key, account); return account;
  },
  listAccounts() { return [...accounts.values()]; },
  getAccount(id: string) { return [...accounts.values()].find((a) => a.id === id); },
  saveTransaction(tx: LedgerTransaction) { transactions.set(tx.id, tx); postedByReference.set(`${tx.referenceType}:${tx.referenceId}:${tx.type}`, tx.id); return tx; },
  findByReference(referenceType: string, referenceId: string, type?: string) { const key = type ? `${referenceType}:${referenceId}:${type}` : undefined; return key && postedByReference.has(key) ? transactions.get(postedByReference.get(key)!) : [...transactions.values()].find((t) => t.referenceType === referenceType && t.referenceId === referenceId); },
  listTransactions() { return [...transactions.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)); },
  getTransaction(id: string) { return transactions.get(id); },
  apply(tx: LedgerTransaction) { for (const entry of tx.entries) { const account = [...accounts.values()].find((a) => a.id === entry.accountId); if (!account) continue; account.balance += entry.direction === 'debit' ? entry.amount : -entry.amount; account.updatedAt = now(); } return tx; },
};
export function createLedgerId(prefix: string) { return id(prefix); }
export function ledgerNow() { return now(); }
