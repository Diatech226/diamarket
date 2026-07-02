import crypto from 'crypto';
import { retrievePayment, sandboxState } from '../../services/checkout-store';
import { normalizePaymentStatus } from '../payments/payment-status';
import { validationError } from '../payments/payment.validation';
import { legacyRefundRepository } from './refund.repository';
import { validateRefundCreate } from './refund.validation';
import type { Refund } from './refund.types';
function id(prefix: string) { return `${prefix}_${crypto.randomBytes(12).toString('hex')}`; }
function now() { return new Date().toISOString(); }
export function createRefund(payload: unknown) {
  const body = validateRefundCreate(payload);
  const payment = retrievePayment(body.paymentId);
  const normalizedStatus = normalizePaymentStatus(payment.status);
  if (normalizedStatus !== 'paid' && normalizedStatus !== 'partially_refunded') throw validationError('Invalid refund payload', { paymentId: 'payment must be paid before refund' });
  const previousRefunded = legacyRefundRepository.listByPaymentId(payment.id).filter((r) => r.status === 'succeeded').reduce((sum, r) => sum + r.amount, 0);
  const amount = body.amount ?? payment.amount - previousRefunded;
  if (amount <= 0 || previousRefunded + amount > payment.amount) throw validationError('Invalid refund payload', { amount: 'refund exceeds paid amount' });
  const timestamp = now();
  const refund: Refund = { id: id('re_test'), paymentId: payment.id, amount, currency: payment.currency, status: 'succeeded', reason: body.reason, metadata: body.metadata ?? {}, createdAt: timestamp, updatedAt: timestamp };
  legacyRefundRepository.create(refund);
  payment.status = previousRefunded + amount === payment.amount ? 'refunded' : 'partially_refunded';
  payment.updatedAt = timestamp;
  sandboxState.payments.set(payment.id, payment);
  return refund;
}
export function getRefund(id: string) { const refund = legacyRefundRepository.findById(id); if (!refund) throw Object.assign(new Error('refund not found'), { status: 404 }); return refund; }
