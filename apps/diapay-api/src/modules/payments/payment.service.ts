import crypto from 'crypto';
import { cancelDirectPayment, createDirectPayment, retrievePayment, sandboxState } from '../../services/checkout-store';
import type { Payment } from '../../models/Payment';
import type { PaymentAttempt } from './payment-attempt.model';
import { canTransitionPaymentStatus, normalizePaymentStatus } from './payment-status';
import { validatePaymentCreate, validationError } from './payment.validation';
import { postPaymentCaptureToLedger } from '../ledger/ledger.service';

function id(prefix: string) { return `${prefix}_${crypto.randomBytes(12).toString('hex')}`; }
function now() { return new Date().toISOString(); }
function withAttempt(payment: Payment): Payment & { attempts: PaymentAttempt[] } {
  const existing = (payment as Payment & { attempts?: PaymentAttempt[] }).attempts;
  if (existing?.length) return payment as Payment & { attempts: PaymentAttempt[] };
  const timestamp = payment.createdAt ?? now();
  const attempt: PaymentAttempt = { id: id('pa_test'), paymentId: payment.id, provider: payment.provider, method: payment.method, status: normalizePaymentStatus(payment.status), amount: payment.amount, currency: payment.currency, providerReference: payment.providerPaymentId, providerStatus: payment.providerStatus, errorCode: payment.failureCode, errorMessage: payment.failureMessage, rawProviderResponse: payment.rawProviderResponse, createdAt: timestamp, updatedAt: payment.updatedAt ?? timestamp };
  (payment as Payment & { attempts: PaymentAttempt[] }).attempts = [attempt];
  sandboxState.payments.set(payment.id, payment);
  return payment as Payment & { attempts: PaymentAttempt[] };
}

export async function createPayment(payload: unknown, merchant: string) { const body = validatePaymentCreate(payload); const payment = withAttempt(await createDirectPayment(body, merchant)); if (normalizePaymentStatus(payment.status) === 'paid') postPaymentCaptureToLedger(payment); return payment; }
export function getPayment(id: string) { return withAttempt(retrievePayment(id)); }
export async function cancelPayment(id: string) { const payment = retrievePayment(id); if (!canTransitionPaymentStatus(payment.status, 'cancelled')) throw validationError('Payment status transition is not allowed', { from: payment.status, to: 'cancelled' }); return withAttempt(await cancelDirectPayment(id)); }
