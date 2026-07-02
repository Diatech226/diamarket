import { sandboxState } from '../../services/checkout-store';
import type { Payment } from '../../models/Payment';

export interface PaymentRepository { create(payment: Payment): Payment; findById(id: string): Payment | undefined; update(payment: Payment): Payment; }

export const legacyPaymentRepository: PaymentRepository = {
  create(payment) { sandboxState.payments.set(payment.id, payment); return payment; },
  findById(id) { return sandboxState.payments.get(id); },
  update(payment) { sandboxState.payments.set(payment.id, payment); return payment; },
};
