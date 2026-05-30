export type UserRole = 'merchant' | 'admin' | 'super_admin';
export type EnvironmentMode = 'test' | 'live';
export type PaymentStatus = 'succeeded' | 'processing' | 'requires_action' | 'failed' | 'refunded' | 'canceled';
export type PaymentMethod = 'mobile-money' | 'bank-card' | 'bank-transfer' | 'crypto' | 'mock';

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

export type CheckoutSessionStatus = 'created' | 'open' | 'completed' | 'cancelled' | 'expired';
export type CheckoutSession = { id: string; merchant: string; payment?: string; amount: number; currency: string; customer?: { name?: string; email?: string }; items: Array<{ name: string; quantity?: number; amount?: number }>; successUrl: string; cancelUrl: string; status: CheckoutSessionStatus; expiresAt: string; metadata: Record<string, unknown>; createdAt: string };
export type WebhookEvent = { id: string; type: string; merchant: string; payload: Record<string, unknown>; attempts: Array<{ id: string; url: string; status: 'pending' | 'delivered' | 'failed'; statusCode?: number }>; createdAt: string };

export type ProviderDescriptor = { id: string; name: string; method: PaymentMethod; environment: EnvironmentMode; capabilities: string[]; currencies: string[]; countries: string[]; status: 'ready' | 'degraded' | 'disabled'; testMode: boolean; implementation: 'mock' | 'connector'; notes?: string };

export type MarketplaceWallet = { id: string; type: 'merchant_wallet' | 'vendor_wallet' | 'platform_wallet' | 'escrow_wallet' | 'reserve_wallet'; owner: string; balance: number; availableBalance: number; pendingBalance: number; currency: string; status: 'active' | 'frozen' | 'closed' };
export type VendorAccount = { id: string; businessName: string; country: string; currencies: string[]; wallet: string; kycStatus: 'not_started' | 'pending' | 'verified' | 'rejected'; capabilities: string[]; commission: string };
export type EscrowHold = { id: string; paymentId: string; vendor: string; amount: number; currency: string; status: 'held' | 'released' | 'refunded' | 'disputed'; autoReleaseAt?: string };
export type LedgerEntry = { id: string; transactionId: string; account: string; direction: 'debit' | 'credit'; type: string; amount: number; currency: string; createdAt: string };
export type CommissionRule = { id: string; scope: string; rule: string; priority: number; active: boolean };
