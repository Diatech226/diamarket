import { sandboxState } from '../../services/checkout-store';
import type { Refund } from './refund.types';

export interface RefundRepository { create(refund: Refund): Refund; findById(id: string): Refund | undefined; listByPaymentId(paymentId: string): Refund[]; }
export const legacyRefundRepository: RefundRepository = {
  create(refund) { sandboxState.refunds.set(refund.id, refund as unknown as Record<string, unknown>); return refund; },
  findById(id) { return sandboxState.refunds.get(id) as unknown as Refund | undefined; },
  listByPaymentId(paymentId) { return Array.from(sandboxState.refunds.values()).filter((r) => r.paymentId === paymentId) as unknown as Refund[]; },
};
