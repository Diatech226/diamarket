import type { NormalizedPaymentStatus } from './payment-status';
import type { PaymentMethod } from '../../models/Payment';

export interface PaymentAttempt {
  id: string;
  paymentId: string;
  provider: string;
  method: PaymentMethod;
  status: NormalizedPaymentStatus;
  amount: number;
  currency: string;
  providerReference?: string;
  providerStatus?: string;
  errorCode?: string;
  errorMessage?: string;
  rawProviderResponse?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
