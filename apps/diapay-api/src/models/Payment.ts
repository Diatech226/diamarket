export type PaymentStatus = 'created' | 'pending' | 'processing' | 'requires_action' | 'succeeded' | 'paid' | 'failed' | 'cancelled' | 'expired' | 'refunded' | 'partially_refunded' | 'disputed' | 'chargeback';
export type PaymentMethod = 'mobile-money' | 'bank-card' | 'bank-transfer' | 'crypto' | 'mock';

export interface Payment {
  id: string;
  sessionId?: string;
  merchant: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  provider: string;
  providerPaymentId?: string;
  actionRequired?: {
    type: 'redirect' | 'otp' | 'bank_instructions' | 'wallet_address';
    url?: string;
    message?: string;
    expiresAt?: string;
  };
  failureCode?: string;
  failureMessage?: string;
  providerStatus?: string;
  rawProviderResponse?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
