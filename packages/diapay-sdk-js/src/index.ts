import * as crypto from 'crypto';

export type DiapayOptions = {
  secretKey: string;
  baseUrl?: string;
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

  async createPayment(payload: Record<string, unknown>, options?: RequestOptions) {
    return this.request('/payments', { ...options, method: 'POST', body: JSON.stringify(payload) });
  }

  async retrievePayment(id: string) {
    return this.request(`/payments/${id}`);
  }

  async getPayment(id: string) { return this.retrievePayment(id); }
  async refundPayment(id: string) { return this.request(`/payments/${id}/refund`, { method: 'POST' }); }
  async cancelPayment(id: string) { return this.request(`/payments/${id}/cancel`, { method: 'POST' }); }

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
