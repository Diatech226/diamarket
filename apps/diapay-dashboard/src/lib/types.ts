export type UserRole = 'merchant' | 'admin' | 'super_admin';
export type EnvironmentMode = 'test' | 'live';
export type PaymentStatus = 'succeeded' | 'processing' | 'requires_action' | 'failed' | 'refunded' | 'canceled';
export type PaymentMethod = 'mobile-money' | 'bank-card' | 'bank-transfer' | 'crypto';

export type Payment = {
  id: string;
  reference: string;
  customer: string;
  email: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  provider: string;
  createdAt: string;
  refundable: boolean;
};

export type Transaction = Payment & { fee: number; net: number };
export type ApiKey = { id: string; name: string; key: string; environment: EnvironmentMode; role: UserRole; createdAt: string; lastUsed: string; active: boolean };
export type WebhookEndpoint = { id: string; url: string; events: string[]; secret: string; status: 'active' | 'paused'; successRate: number };
export type WebhookLog = { id: string; endpoint: string; event: string; status: 'delivered' | 'failed' | 'retrying'; createdAt: string; attempts: number };
export type Customer = { id: string; name: string; email: string; country: string; totalSpend: number; payments: number; createdAt: string };
export type Refund = { id: string; paymentId: string; amount: number; currency: string; status: 'succeeded' | 'pending' | 'failed'; reason: string; createdAt: string };
export type Payout = { id: string; amount: number; currency: string; status: 'paid' | 'pending' | 'in_transit' | 'failed'; destination: string; arrivalDate: string };
