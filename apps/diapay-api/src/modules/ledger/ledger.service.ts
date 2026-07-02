import { ledgerRepository, createLedgerId, ledgerNow } from './ledger.repository';
import { assertBalancedLedgerTransaction } from './ledger-invariants';
import type { CreateLedgerEntryInput, LedgerTransaction, LedgerTransactionType } from './ledger.types';
function feeFor(amount: number) { return Math.round(amount * (Number(process.env.DIAPAY_DEFAULT_FEE_PERCENT ?? '2.5') / 100)); }
function sanitizeMetadata(metadata: Record<string, unknown> = {}) { const forbidden = /secret|token|otp|private|key|card/i; return Object.fromEntries(Object.entries(metadata).filter(([k]) => !forbidden.test(k)).map(([k, v]) => [k, typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || v === null ? v : String(v)])); }
export function createAndPostLedgerTransaction(input: { type: LedgerTransactionType; referenceType: LedgerTransaction['referenceType']; referenceId: string; amount: number; currency: string; entries: CreateLedgerEntryInput[]; metadata?: Record<string, unknown> }) {
  const existing = ledgerRepository.findByReference(input.referenceType, input.referenceId, input.type); if (existing) return existing;
  const timestamp = ledgerNow(); const txId = createLedgerId('lt_test');
  const entries = input.entries.map((entry) => { const account = ledgerRepository.ensureAccount(entry.ownerType, entry.ownerId, input.currency, entry.accountType); return { id: createLedgerId('le_test'), transactionId: txId, accountId: account.id, direction: entry.direction, amount: entry.amount, currency: input.currency, posted: true, createdAt: timestamp, metadata: {} }; });
  assertBalancedLedgerTransaction(entries);
  const tx: LedgerTransaction = { id: txId, type: input.type, referenceType: input.referenceType, referenceId: input.referenceId, currency: input.currency, amount: input.amount, status: 'posted', entries, metadata: sanitizeMetadata(input.metadata), createdAt: timestamp, postedAt: timestamp };
  ledgerRepository.saveTransaction(tx); ledgerRepository.apply(tx); return tx;
}
export function postPaymentCaptureToLedger(payment: { id: string; amount: number; currency: string; merchant?: string; metadata?: Record<string, unknown> }) {
  const merchantId = payment.merchant ?? 'default_merchant'; const fee = feeFor(payment.amount); const merchantNet = payment.amount - fee;
  return createAndPostLedgerTransaction({ type: 'payment_capture', referenceType: 'payment', referenceId: payment.id, amount: payment.amount, currency: payment.currency, metadata: { merchantId, feePercent: Number(process.env.DIAPAY_DEFAULT_FEE_PERCENT ?? '2.5'), ...payment.metadata }, entries: [
    { ownerType: 'provider', ownerId: 'provider_clearing', accountType: 'provider_clearing', direction: 'debit', amount: payment.amount },
    { ownerType: 'merchant', ownerId: merchantId, accountType: 'merchant_pending', direction: 'credit', amount: merchantNet },
    { ownerType: 'platform', ownerId: 'diapay', accountType: 'platform_fees', direction: 'credit', amount: fee },
  ] });
}
export function postRefundToLedger(refund: { id: string; paymentId: string; amount: number; currency: string }, payment: { merchant?: string }) {
  const merchantId = payment.merchant ?? 'default_merchant';
  return createAndPostLedgerTransaction({ type: 'refund', referenceType: 'refund', referenceId: refund.id, amount: refund.amount, currency: refund.currency, metadata: { paymentId: refund.paymentId, merchantId }, entries: [
    { ownerType: 'merchant', ownerId: merchantId, accountType: 'merchant_pending', direction: 'debit', amount: refund.amount },
    { ownerType: 'provider', ownerId: 'provider_clearing', accountType: 'provider_clearing', direction: 'credit', amount: refund.amount },
  ] });
}
export function reverseLedgerTransaction(id: string) { const original = ledgerRepository.getTransaction(id); if (!original) throw Object.assign(new Error('ledger transaction not found'), { status: 404 }); return createAndPostLedgerTransaction({ type: 'adjustment', referenceType: original.referenceType, referenceId: `${original.referenceId}:reversal:${original.id}`, amount: original.amount, currency: original.currency, metadata: { reversedTransactionId: original.id }, entries: original.entries.map((e) => { const account = ledgerRepository.getAccount(e.accountId)!; return { ownerType: account.ownerType, ownerId: account.ownerId, accountType: account.accountType, direction: e.direction === 'debit' ? 'credit' : 'debit', amount: e.amount }; }) }); }
export const ledgerService = { listAccounts: ledgerRepository.listAccounts, listTransactions: ledgerRepository.listTransactions, getTransaction: ledgerRepository.getTransaction, createAndPostLedgerTransaction, reverseLedgerTransaction, postPaymentCaptureToLedger, postRefundToLedger };
