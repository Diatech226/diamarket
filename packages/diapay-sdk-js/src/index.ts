import * as crypto from 'crypto';

export type DiapayOptions = {
  secretKey: string;
  baseUrl?: string;
};


export type PaymentMethod = 'mobile-money' | 'bank-card' | 'bank-transfer' | 'crypto' | 'mock';
export type PaymentStatus = 'requires_action' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'expired' | 'refunded';

export type ProviderDescriptor = {
  id: string;
  name: string;
  method: PaymentMethod;
  environment: 'test' | 'live';
  capabilities: Array<'payments' | 'refunds' | 'cancellations' | 'webhooks'>;
  currencies: string[];
  countries: string[];
  status: 'ready' | 'degraded' | 'disabled';
  testMode: boolean;
  implementation: 'mock' | 'connector';
  notes?: string;
};

export type PaymentCreateParams = {
  amount: number;
  currency: string;
  method?: PaymentMethod;
  customer?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  phone?: string;
  network?: string;
  cardNumber?: string;
  forceStatus?: 'pending' | 'expired' | 'requires_action' | 'failed';
  [key: string]: unknown;
};

export type PaymentResponse = {
  id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  provider: string;
  providerPaymentId?: string;
  actionRequired?: { type: 'redirect' | 'otp' | 'bank_instructions' | 'wallet_address'; url?: string; message?: string; expiresAt?: string };
  failureCode?: string;
  failureMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type CheckoutSessionCreateParams = {
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  returnUrl?: string;
  customer?: Record<string, unknown>;
  items?: Array<{ name: string; quantity?: number; amount?: number }>;
  metadata?: Record<string, unknown>;
};

export type DiapayWebhookEvent<T = Record<string, unknown>> = {
  id?: string;
  type: string;
  data?: T;
  created?: string;
};

type RequestOptions = RequestInit & { idempotencyKey?: string };

export class Diapay {
  private baseUrl: string;
  private secretKey: string;

  constructor(options: DiapayOptions) {
    this.baseUrl = options.baseUrl ?? 'http://localhost:5100';
    this.secretKey = options.secretKey;
  }

  private headers(options: RequestOptions = {}) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.secretKey}`,
      ...(options.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {}),
      ...options.headers,
    };
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}/api/v1${path}`, { ...options, headers: this.headers(options) });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message ?? data?.message ?? `Diapay API error ${response.status}`);
    return data as T;
  }

  checkout = {
    sessions: {
      create: (payload: CheckoutSessionCreateParams, options?: RequestOptions) => this.createCheckoutSession(payload, options),
      retrieve: (id: string) => this.retrieveCheckoutSession(id),
    },
  };

  async createCheckoutSession(payload: CheckoutSessionCreateParams, options?: RequestOptions) {
    return this.request('/checkout/sessions', { ...options, method: 'POST', body: JSON.stringify(payload) });
  }

  async retrieveCheckoutSession(id: string) {
    return this.request(`/checkout/sessions/${id}`);
  }

  async redirectToCheckout(sessionOrId: string | { id?: string; paymentSessionId?: string; checkoutUrl?: string }) {
    const checkoutUrl = typeof sessionOrId === 'string'
      ? (await this.retrieveCheckoutSession(sessionOrId) as { checkoutUrl: string }).checkoutUrl
      : sessionOrId.checkoutUrl;

    if (!checkoutUrl) throw new Error('checkoutUrl is required to redirect');
    if (typeof window === 'undefined') return checkoutUrl;
    window.location.assign(checkoutUrl);
    return checkoutUrl;
  }

  async createPayment(payload: PaymentCreateParams, options?: RequestOptions) {
    return this.request<PaymentResponse>('/payments', { ...options, method: 'POST', body: JSON.stringify(payload) });
  }

  async retrievePayment(id: string) {
    return this.request<PaymentResponse>(`/payments/${id}`);
  }

  async listPaymentMethods() {
    return this.request<PaymentMethod[]>('/payment-methods');
  }

  async listProviders() {
    return this.request<ProviderDescriptor[]>('/providers');
  }

  async getPayment(id: string) { return this.retrievePayment(id); }
  async refundPayment(id: string, payload: { amount?: number; reason?: string; metadata?: Record<string, unknown> } = {}) { return this.request<PaymentResponse>(`/payments/${id}/refund`, { method: 'POST', body: JSON.stringify(payload) }); }
  async cancelPayment(id: string) { return this.request<PaymentResponse>(`/payments/${id}/cancel`, { method: 'POST' }); }

  static verifyWebhookSignature(rawBody: string, signature: string, secret: string) {
    if (!rawBody || !signature || !secret) return false;
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    const left = Buffer.from(signature);
    const right = Buffer.from(expected);
    return left.length === right.length && crypto.timingSafeEqual(left, right);
  }

  verifyWebhook(rawBody: string, signature: string, secret: string) {
    return Diapay.verifyWebhookSignature(rawBody, signature, secret);
  }
}

export const DiapaySDK = Diapay;
export default Diapay;
