import * as crypto from 'crypto';

export type DiapayEnvironment = 'test' | 'production';
export type PaymentMethod = 'mobile-money' | 'bank-card' | 'bank-transfer' | 'crypto' | 'mock';
export type PaymentStatus = 'requires_action' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'expired' | 'refunded';
export type RefundStatus = 'pending' | 'succeeded' | 'failed';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type WebhookEventType = 'payment.succeeded' | 'payment.failed' | 'checkout.completed' | 'refund.succeeded' | 'payout.completed' | 'payment.expired' | 'payment.cancelled';

export type DiapayOptions = {
  secretKey: string;
  baseUrl?: string;
  environment?: DiapayEnvironment;
  timeoutMs?: number;
  maxRetries?: number;
};

export type RequestOptions = RequestInit & { idempotencyKey?: string; timeoutMs?: number; maxRetries?: number };
export type Metadata = Record<string, string | number | boolean | null>;

export type CustomerCreateParams = { name?: string; email?: string; phone?: string; metadata?: Metadata };
export type Customer = CustomerCreateParams & { id: string; createdAt: string; updatedAt?: string };

export type PaymentCreateParams = {
  amount: number;
  currency: string;
  method?: PaymentMethod;
  customer?: CustomerCreateParams | string;
  metadata?: Metadata;
  phone?: string;
  network?: string;
  cardNumber?: string;
  walletAddress?: string;
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
  metadata?: Metadata;
  createdAt: string;
  updatedAt: string;
};

export type CheckoutSessionCreateParams = {
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  returnUrl?: string;
  customer?: CustomerCreateParams | string;
  items?: Array<{ name: string; quantity?: number; amount?: number }>;
  metadata?: Metadata;
  expiresAt?: string;
};

export type CheckoutSession = CheckoutSessionCreateParams & {
  id: string;
  paymentSessionId: string;
  checkoutUrl: string;
  status: 'created' | 'open' | 'completed' | 'cancelled' | 'expired';
  createdAt: string;
  updatedAt: string;
};

export type RefundCreateParams = { paymentId: string; amount?: number; reason?: string; metadata?: Metadata };
export type Refund = { id: string; paymentId: string; amount: number; currency: string; status: RefundStatus; reason?: string; metadata?: Metadata; createdAt: string };
export type PayoutCreateParams = { amount: number; currency: string; destination: string; metadata?: Metadata };
export type Payout = PayoutCreateParams & { id: string; status: PayoutStatus; arrivalDate?: string; createdAt?: string };
export type WebhookEndpointCreateParams = { url: string; events?: WebhookEventType[]; description?: string };
export type WebhookEndpoint = WebhookEndpointCreateParams & { id: string; secret: string; status: 'active' | 'disabled'; createdAt: string; updatedAt: string };
export type DiapayWebhookEvent<T = Record<string, unknown>> = { id: string; type: WebhookEventType | string; data: T; created: string };
export type ProviderDescriptor = { id: string; name: string; method: PaymentMethod; environment: DiapayEnvironment | 'live'; capabilities: string[]; currencies: string[]; countries: string[]; status: 'ready' | 'degraded' | 'disabled'; testMode: boolean; implementation: 'mock' | 'connector'; notes?: string };

export class DiapayError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly requestId?: string;
  readonly details?: unknown;

  constructor(message: string, status = 500, code?: string, requestId?: string, details?: unknown) {
    super(message);
    this.name = 'DiapayError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.details = details;
  }
}

function assertSecretKey(secretKey: string) {
  if (!secretKey || !/^sk_(test|live|prod)_/.test(secretKey)) {
    throw new DiapayError('A valid Diapay secret key is required. Use sk_test_* in sandbox or sk_live_* in production.', 401, 'invalid_api_key');
  }
}

function assertAmountCurrency(payload: { amount?: unknown; currency?: unknown }) {
  if (!Number.isInteger(payload.amount) || Number(payload.amount) <= 0) throw new DiapayError('amount must be a positive integer in the smallest currency unit', 400, 'invalid_amount');
  if (typeof payload.currency !== 'string' || payload.currency.length < 3) throw new DiapayError('currency must be an ISO currency code such as XOF, USD or EUR', 400, 'invalid_currency');
}

function assertUrl(value: unknown, field: string) {
  if (typeof value !== 'string' || !/^https?:\/\//.test(value)) throw new DiapayError(`${field} must be an absolute URL`, 400, 'invalid_url');
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class Diapay {
  private readonly baseUrl: string;
  private readonly secretKey: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(options: DiapayOptions) {
    assertSecretKey(options.secretKey);
    this.baseUrl = (options.baseUrl ?? 'http://localhost:5100').replace(/\/$/, '');
    this.secretKey = options.secretKey;
    this.timeoutMs = options.timeoutMs ?? 20_000;
    this.maxRetries = options.maxRetries ?? 2;
  }

  checkout = {
    sessions: {
      create: (payload: CheckoutSessionCreateParams, options?: RequestOptions) => this.createCheckoutSession(payload, options),
      retrieve: (id: string, options?: RequestOptions) => this.retrieveCheckoutSession(id, options),
      cancel: (id: string, options?: RequestOptions) => this.request<CheckoutSession>(`/checkout/sessions/${id}/cancel`, { ...options, method: 'POST' }),
    },
  };

  payments = {
    create: (payload: PaymentCreateParams, options?: RequestOptions) => this.createPayment(payload, options),
    retrieve: (id: string, options?: RequestOptions) => this.retrievePayment(id, options),
    cancel: (id: string, options?: RequestOptions) => this.cancelPayment(id, options),
  };

  refunds = {
    create: (payload: RefundCreateParams, options?: RequestOptions) => this.refundPayment(payload.paymentId, payload, options),
    retrieve: (id: string, options?: RequestOptions) => this.request<Refund>(`/refunds/${id}`, options),
  };

  payouts = {
    create: (payload: PayoutCreateParams, options?: RequestOptions) => { assertAmountCurrency(payload); return this.request<Payout>('/payouts', { ...options, method: 'POST', body: JSON.stringify(payload) }); },
    retrieve: (id: string, options?: RequestOptions) => this.request<Payout>(`/payouts/${id}`, options),
  };

  customers = {
    create: (payload: CustomerCreateParams, options?: RequestOptions) => this.request<Customer>('/customers', { ...options, method: 'POST', body: JSON.stringify(payload) }),
    retrieve: (id: string, options?: RequestOptions) => this.request<Customer>(`/customers/${id}`, options),
  };

  webhooks = {
    endpoints: {
      create: (payload: WebhookEndpointCreateParams, options?: RequestOptions) => { assertUrl(payload.url, 'url'); return this.request<WebhookEndpoint>('/webhooks', { ...options, method: 'POST', body: JSON.stringify(payload) }); },
      list: (options?: RequestOptions) => this.request<WebhookEndpoint[]>('/webhooks', options),
    },
    verify: (rawBody: string, signature: string, secret: string) => Diapay.verifyWebhookSignature(rawBody, signature, secret),
  };

  private headers(options: RequestOptions = {}) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.secretKey}`,
      'User-Agent': 'diapay-sdk-js/0.1.0',
      ...(options.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {}),
      ...options.headers,
    };
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const retries = options.maxRetries ?? this.maxRetries;
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? this.timeoutMs);
      try {
        const response = await fetch(`${this.baseUrl}/api/v1${path}`, { ...options, headers: this.headers(options), signal: controller.signal });
        const requestId = response.headers.get('x-request-id') ?? undefined;
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
        if (!response.ok) {
          const message = data?.error?.message ?? data?.message ?? `Diapay API error ${response.status}`;
          const error = new DiapayError(message, response.status, data?.error?.code ?? data?.code, requestId, data);
          if (response.status >= 500 && attempt < retries) {
            lastError = error;
          } else {
            throw error;
          }
        } else {
          return data as T;
        }
      } catch (error) {
        lastError = error;
        if (error instanceof DiapayError && error.status < 500) throw error;
        if (attempt >= retries) break;
      } finally {
        clearTimeout(timeout);
      }
      await sleep(250 * 2 ** attempt);
    }

    if (lastError instanceof Error) throw lastError;
    throw new DiapayError('Diapay request failed', 500, 'request_failed', undefined, lastError);
  }

  async createCheckoutSession(payload: CheckoutSessionCreateParams, options?: RequestOptions) {
    assertAmountCurrency(payload);
    assertUrl(payload.successUrl, 'successUrl');
    assertUrl(payload.cancelUrl, 'cancelUrl');
    return this.request<CheckoutSession>('/checkout/sessions', { ...options, method: 'POST', body: JSON.stringify(payload) });
  }

  async retrieveCheckoutSession(id: string, options?: RequestOptions) {
    return this.request<CheckoutSession>(`/checkout/sessions/${id}`, options);
  }

  async redirectToCheckout(sessionOrId: string | { id?: string; paymentSessionId?: string; checkoutUrl?: string }) {
    const checkoutUrl = typeof sessionOrId === 'string' ? (await this.retrieveCheckoutSession(sessionOrId)).checkoutUrl : sessionOrId.checkoutUrl;
    if (!checkoutUrl) throw new DiapayError('checkoutUrl is required to redirect', 400, 'missing_checkout_url');
    if (typeof window === 'undefined') return checkoutUrl;
    window.location.assign(checkoutUrl);
    return checkoutUrl;
  }

  async createPayment(payload: PaymentCreateParams, options?: RequestOptions) {
    assertAmountCurrency(payload);
    return this.request<PaymentResponse>('/payments', { ...options, method: 'POST', body: JSON.stringify(payload) });
  }

  async retrievePayment(id: string, options?: RequestOptions) { return this.request<PaymentResponse>(`/payments/${id}`, options); }
  async cancelPayment(id: string, options?: RequestOptions) { return this.request<PaymentResponse>(`/payments/${id}/cancel`, { ...options, method: 'POST' }); }
  async refundPayment(id: string, payload: Omit<RefundCreateParams, 'paymentId'> = {}, options?: RequestOptions) { return this.request<PaymentResponse>(`/payments/${id}/refund`, { ...options, method: 'POST', body: JSON.stringify(payload) }); }
  async listPaymentMethods(options?: RequestOptions) { return this.request<PaymentMethod[]>('/payment-methods', options); }
  async listProviders(options?: RequestOptions) { return this.request<ProviderDescriptor[]>('/providers', options); }
  async getPayment(id: string, options?: RequestOptions) { return this.retrievePayment(id, options); }

  static verifyWebhookSignature(rawBody: string, signature: string, secret: string) {
    if (!rawBody || !signature || !secret) return false;
    const normalized = signature.includes('=') ? signature.split('=').pop() ?? signature : signature;
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    const left = Buffer.from(normalized);
    const right = Buffer.from(expected);
    return left.length === right.length && crypto.timingSafeEqual(left, right);
  }

  verifyWebhook(rawBody: string, signature: string, secret: string) { return Diapay.verifyWebhookSignature(rawBody, signature, secret); }
}

export const DiapaySDK = Diapay;
export default Diapay;
