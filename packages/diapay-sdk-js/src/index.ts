import * as crypto from 'crypto';

export type DiapayEnvironment = 'test' | 'production';
export type PaymentMethod = 'mobile-money' | 'bank-card' | 'bank-transfer' | 'crypto' | 'mock';
export type PaymentStatus = 'created' | 'pending' | 'processing' | 'requires_action' | 'succeeded' | 'paid' | 'failed' | 'cancelled' | 'expired' | 'refunded' | 'partially_refunded' | 'disputed' | 'chargeback';
export type RefundStatus = 'created' | 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type WebhookEventType = 'payment.succeeded' | 'payment.paid' | 'payment.failed' | 'checkout.completed' | 'refund.succeeded' | 'payout.completed' | 'payment.expired' | 'payment.cancelled';

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

export type PaymentAttempt = { id: string; paymentId: string; provider: string; method: PaymentMethod; status: PaymentStatus; amount: number; currency: string; providerReference?: string; errorCode?: string; errorMessage?: string; createdAt: string; updatedAt: string };

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
  attempts?: PaymentAttempt[];
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
export type WebhookEndpointCreateParams = { url: string; events?: (WebhookEventType | string)[]; description?: string; applicationId?: string };
export type WebhookEndpoint = WebhookEndpointCreateParams & { id: string; secret?: string; enabled?: boolean; status?: 'active' | 'disabled'; createdAt: string; updatedAt: string };
export type DiapayWebhookEvent<T = Record<string, unknown>> = { id: string; type: WebhookEventType | string; data: T; created?: string; createdAt?: string; livemode?: boolean; merchantId?: string; applicationId?: string };
export type Wallet = { id: string; ownerType: string; ownerId: string; currency: string; availableBalance: number; pendingBalance: number; reservedBalance: number; source?: string };
export type LedgerTransaction = { id: string; type: string; referenceType: string; referenceId: string; currency: string; amount: number; status: string; entries: Array<{ id: string; accountId: string; direction: 'debit' | 'credit'; amount: number; currency: string; posted: boolean }>; createdAt: string; postedAt?: string };

export type Merchant = { id: string; name: string; businessName: string; country: string; defaultCurrency: string; status: string; livemodeEnabled: boolean; createdAt: string; updatedAt: string };
export type MerchantAdmin = { id: string; merchantId: string; email: string; name: string; role: string; status: string; createdAt: string; updatedAt: string };
export type Application = { id: string; merchantId: string; name: string; environment: 'test' | 'live'; status: string; allowedOrigins: string[]; webhookDefaultUrl?: string; createdAt: string; updatedAt: string };
export type ApiKey = { id: string; merchantId: string; applicationId: string; name: string; type: 'public' | 'secret' | 'restricted'; environment: 'test' | 'live'; prefix: string; last4: string; maskedKey: string; scopes: string[]; status: string; createdAt: string; lastUsedAt?: string; revokedAt?: string };
export type ApiKeyCreateParams = { merchantId?: string; applicationId?: string; name?: string; type?: 'public' | 'secret' | 'restricted'; environment?: 'test' | 'live'; scopes?: string[] };
export type ApiKeyCreateResponse = ApiKey & { secret: string };

export type ReportFilters = { environment?: 'test' | 'live'; merchantId?: string; applicationId?: string; currency?: string; from?: string; to?: string; startDate?: string; endDate?: string; page?: number; limit?: number };
export type ReportOverview = { source: string; totalRevenue: number; successfulPayments: number; failedPayments: number; refundAmount: number; webhookFailures: number; apiErrors: number; payments: number };

export type BalanceSummary = { source: string; productionReady: boolean; merchantPendingBalance: number; merchantAvailableBalance: number; platformFees: number; providerClearingBalance: number; refundLiabilities: number };

export type MarketplaceCurrency = 'FCFA' | 'XOF' | 'USD' | 'EUR' | 'USDT';
export type MarketplaceSplitRule = { id?: string; vendorId?: string; walletId?: string; type: 'fixed' | 'percentage' | 'fallback'; amount?: number; percentage?: number; priority?: number; category?: string; description?: string };
export type MarketplaceVendorCreateParams = { businessName: string; country?: string; currencies?: MarketplaceCurrency[]; payoutMethods?: Array<{ type: 'mobile_money' | 'bank_transfer' | 'crypto'; label?: string; currency?: MarketplaceCurrency; country?: string; details?: Record<string, unknown>; active?: boolean }>; commissions?: Array<{ fixedAmount?: number; percentage?: number; category?: string; country?: string; priority?: number; active?: boolean }>; capabilities?: string[] };
export type MarketplaceSplitPaymentCreateParams = { amount: number; currency: MarketplaceCurrency; splits?: MarketplaceSplitRule[]; commission?: { fixedAmount?: number; percentage?: number }; reserveRate?: number; escrow?: boolean; autoRelease?: boolean; autoReleaseAt?: string; metadata?: Metadata };

export type MarketplaceEscrowActionParams = { escrowId: string; amount?: number; reason?: string };

export type MarketplaceVendor = MarketplaceVendorCreateParams & { id: string; wallet: string; kycStatus: string; createdAt: string; updatedAt: string };
export type MarketplacePayment = { id: string; paymentId: string; merchant: string; amount: number; currency: MarketplaceCurrency; allocations: Array<Record<string, unknown>>; escrowId?: string; timeline: Array<{ type: string; at: string; data?: Record<string, unknown> }>; createdAt: string; updatedAt: string };

export type ProviderDescriptor = { id?: string; provider?: string; name?: string; type?: string; method?: PaymentMethod; methods?: PaymentMethod[]; environment?: DiapayEnvironment | 'live'; mode?: 'sandbox' | 'live'; capabilities?: string[]; currencies: string[]; countries: string[]; status: string; testMode?: boolean; configured?: boolean; implementation?: 'mock' | 'connector'; notes?: string; supportsRefund?: boolean; supportsPartialRefund?: boolean; supportsCancel?: boolean; supportsWebhook?: boolean; supportsAsyncPayment?: boolean };

export type MarketplaceWallet = { id: string; type: 'merchant_wallet' | 'vendor_wallet' | 'platform_wallet' | 'escrow_wallet' | 'reserve_wallet'; balance: number; availableBalance: number; pendingBalance: number; currency: string; status: 'active' | 'frozen' | 'closed'; owner: { id: string; type: string; name?: string }; ledgerEntries: string[]; createdAt: string; updatedAt: string };
export type VendorAccountCreateParams = { businessName: string; country: string; currencies?: string[]; payoutMethods?: Array<{ type: 'mobile_money' | 'bank_transfer' | 'crypto'; label: string; destination: string; currency: string; country?: string; default?: boolean }> };
export type VendorAccount = VendorAccountCreateParams & { id: string; wallet: string; kycStatus: 'not_started' | 'pending' | 'verified' | 'rejected'; capabilities: string[]; commissions: unknown[]; createdAt: string; updatedAt: string };
export type SplitPaymentCreateParams = { amount: number; currency: string; merchantId?: string; paymentId?: string; splits: Array<{ vendorId?: string; walletId?: string; amount?: number; percentage?: number; priority?: number; holdInEscrow?: boolean; fallback?: boolean }>; commission?: { amount?: number; percentage?: number }; diapayFee?: { amount?: number; percentage?: number }; escrow?: { enabled?: boolean; autoReleaseAt?: string } };
export type SplitPayment = { id: string; paymentId: string; merchantId: string; amount: number; currency: string; status: string; allocations: unknown[]; escrowHolds: unknown[]; timeline: unknown[]; createdAt: string; updatedAt: string };
export type MarketplacePayoutCreateParams = { vendorId?: string; walletId?: string; amount: number; currency?: string; method?: 'mobile_money' | 'bank_transfer' | 'crypto'; destination?: string; schedule?: 'manual' | 'automatic' | 'scheduled'; threshold?: number };
export type MarketplaceLedger = { accounts: unknown[]; entries: unknown[]; balanceSnapshots: unknown[] };

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
    create: (payload: RefundCreateParams, options?: RequestOptions) => this.createRefund(payload, options),
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


  marketplace = {
    splitPayment: (payload: SplitPaymentCreateParams, options?: RequestOptions) => { assertAmountCurrency(payload); return this.request<SplitPayment>('/marketplace/split-payment', { ...options, method: 'POST', body: JSON.stringify(payload) }); },
    vendors: {
      create: (payload: VendorAccountCreateParams, options?: RequestOptions) => this.request<VendorAccount>('/marketplace/vendors', { ...options, method: 'POST', body: JSON.stringify(payload) }),
      list: (options?: RequestOptions) => this.request<VendorAccount[]>('/marketplace/vendors', options),
      wallet: (id: string, options?: RequestOptions) => this.request<{ vendor: VendorAccount; wallet: MarketplaceWallet; ledgerEntries: unknown[] }>(`/marketplace/vendors/${id}/wallet`, options),
    },
    payouts: {
      create: (payload: MarketplacePayoutCreateParams, options?: RequestOptions) => { assertAmountCurrency(payload); return this.request<Payout>('/marketplace/payouts', { ...options, method: 'POST', body: JSON.stringify(payload) }); },
      list: (options?: RequestOptions) => this.request<Payout[]>('/marketplace/payouts', options),
    },
    escrow: {
      release: (payload: { escrowId?: string; paymentId?: string; amount?: number }, options?: RequestOptions) => this.request<unknown>('/marketplace/escrow/release', { ...options, method: 'POST', body: JSON.stringify(payload) }),
      refund: (payload: { escrowId?: string; paymentId?: string; amount?: number; reason?: string }, options?: RequestOptions) => this.request<unknown>('/marketplace/escrow/refund', { ...options, method: 'POST', body: JSON.stringify(payload) }),
      list: (options?: RequestOptions) => this.request<unknown[]>('/marketplace/escrow', options),
    },
    wallets: { list: (options?: RequestOptions) => this.request<MarketplaceWallet[]>('/marketplace/wallets', options) },
    ledger: (options?: RequestOptions) => this.request<MarketplaceLedger>('/marketplace/ledger', options),
    analytics: (options?: RequestOptions) => this.request<Record<string, unknown>>('/marketplace/analytics', options),
  };

  wallets = { list: (options?: RequestOptions) => this.listWallets(options), retrieve: (id: string, options?: RequestOptions) => this.getWallet(id, options) };
  ledger = { transactions: { list: (options?: RequestOptions) => this.listLedgerTransactions(options), retrieve: (id: string, options?: RequestOptions) => this.getLedgerTransaction(id, options) } };

  apiKeys = { list: (options?: RequestOptions) => this.listApiKeys(options), create: (payload: ApiKeyCreateParams, options?: RequestOptions) => this.createApiKey(payload, options), revoke: (id: string, options?: RequestOptions) => this.revokeApiKey(id, options) };
  applications = { list: (options?: RequestOptions) => this.listApplications(options), create: (payload: Partial<Application>, options?: RequestOptions) => this.createApplication(payload, options), update: (id: string, payload: Partial<Application>, options?: RequestOptions) => this.updateApplication(id, payload, options) };
  merchantAdmins = { list: (options?: RequestOptions) => this.listMerchantAdmins(options) };

  reports = { overview: (filters?: ReportFilters, options?: RequestOptions) => this.getReportOverview(filters, options), revenue: (filters?: ReportFilters, options?: RequestOptions) => this.getRevenueReport(filters, options), payments: (filters?: ReportFilters, options?: RequestOptions) => this.listPaymentsReport(filters, options), providers: (filters?: ReportFilters, options?: RequestOptions) => this.getProvidersReport(filters, options), webhooks: (filters?: ReportFilters, options?: RequestOptions) => this.getWebhooksReport(filters, options) };

  webhooks = {
    endpoints: {
      create: (payload: WebhookEndpointCreateParams, options?: RequestOptions) => this.createWebhookEndpoint(payload, options),
      list: (options?: RequestOptions) => this.listWebhookEndpoints(options),
      delete: (id: string, options?: RequestOptions) => this.deleteWebhookEndpoint(id, options),
    },
    events: { list: (options?: RequestOptions) => this.listWebhookEvents(options) },
    verify: (rawBody: string, signature: string, secret: string) => verifyWebhookSignature(rawBody, signature, secret),
    constructEvent: (rawBody: string, signature: string, secret: string) => constructWebhookEvent(rawBody, signature, secret),
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
        const contentType = response.headers.get('content-type') ?? '';
        const wantsCsv = String(options.headers instanceof Headers ? options.headers.get('Accept') : (options.headers as Record<string, string> | undefined)?.Accept ?? '').includes('text/csv');
        const data = contentType.includes('text/csv') || wantsCsv ? text : (text ? JSON.parse(text) : null);
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

  async getCheckoutSession(id: string, options?: RequestOptions) { return this.retrieveCheckoutSession(id, options); }

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
  async createRefund(payload: RefundCreateParams, options?: RequestOptions) { return this.request<Refund>('/refunds', { ...options, method: 'POST', body: JSON.stringify(payload) }); }
  async getRefund(id: string, options?: RequestOptions) { return this.request<Refund>(`/refunds/${id}`, options); }
  async refundPayment(id: string, payload: Omit<RefundCreateParams, 'paymentId'> = {}, options?: RequestOptions) { return this.createRefund({ ...payload, paymentId: id }, options); }
  async listPaymentMethods(options?: RequestOptions) { return this.request<PaymentMethod[]>('/payment-methods', options); }
  async listProviders(options?: RequestOptions) { return this.request<ProviderDescriptor[]>('/providers', options); }
  async getProviderCapabilities(provider: string, options?: RequestOptions) { return this.request<ProviderDescriptor>(`/providers/${provider}/capabilities`, options); }
  async simulateProviderScenario(payload: { scenario: string; amount?: number; currency?: string }, options?: RequestOptions) { return this.request<unknown>('/providers/simulate', { ...options, method: 'POST', body: JSON.stringify(payload) }); }
  async listWallets(options?: RequestOptions) { return this.request<Wallet[]>('/wallets', options); }
  async getWallet(id: string, options?: RequestOptions) { return this.request<Wallet>(`/wallets/${id}`, options); }
  async listLedgerTransactions(options?: RequestOptions) { return this.request<LedgerTransaction[]>('/ledger/transactions', options); }
  async getLedgerTransaction(id: string, options?: RequestOptions) { return this.request<LedgerTransaction>(`/ledger/transactions/${id}`, options); }
  async getBalances(options?: RequestOptions) { return this.request<BalanceSummary>('/balances', options); }
  async listApiKeys(options?: RequestOptions) { return this.request<ApiKey[]>('/api-keys', options); }
  async createApiKey(payload: ApiKeyCreateParams, options?: RequestOptions) { return this.request<ApiKeyCreateResponse>('/api-keys', { ...options, method: 'POST', body: JSON.stringify(payload) }); }
  async revokeApiKey(id: string, options?: RequestOptions) { return this.request<ApiKey>(`/api-keys/${id}`, { ...options, method: 'DELETE' }); }
  async listApplications(options?: RequestOptions) { return this.request<Application[]>('/applications', options); }
  async createApplication(payload: Partial<Application>, options?: RequestOptions) { return this.request<Application>('/applications', { ...options, method: 'POST', body: JSON.stringify(payload) }); }
  async updateApplication(id: string, payload: Partial<Application>, options?: RequestOptions) { return this.request<Application>(`/applications/${id}`, { ...options, method: 'PATCH', body: JSON.stringify(payload) }); }
  async listMerchantAdmins(options?: RequestOptions) { return this.request<MerchantAdmin[]>('/merchant-admins', options); }
  async getCurrentMerchant(options?: RequestOptions) { const merchants = await this.request<Merchant[]>('/merchants', options); return merchants[0]; }

  private query(filters: ReportFilters = {}) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) if (value !== undefined) params.set(key, String(value));
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }

  async getReportOverview(filters?: ReportFilters, options?: RequestOptions) { return this.request<{ success: boolean; data: ReportOverview }>(`/reports/overview${this.query(filters)}`, options); }
  async getRevenueReport(filters?: ReportFilters, options?: RequestOptions) { return this.request<{ success: boolean; data: unknown }>(`/reports/revenue${this.query(filters)}`, options); }
  async listPaymentsReport(filters?: ReportFilters, options?: RequestOptions) { return this.request<{ success: boolean; data: unknown }>(`/reports/payments${this.query(filters)}`, options); }
  async getProvidersReport(filters?: ReportFilters, options?: RequestOptions) { return this.request<{ success: boolean; data: unknown }>(`/reports/providers${this.query(filters)}`, options); }
  async getWebhooksReport(filters?: ReportFilters, options?: RequestOptions) { return this.request<{ success: boolean; data: unknown }>(`/reports/webhooks${this.query(filters)}`, options); }
  async exportPaymentsCsv(filters?: ReportFilters, options?: RequestOptions) { return this.request<string>(`/reports/export/payments.csv${this.query(filters)}`, { ...options, headers: { Accept: 'text/csv', ...(options?.headers ?? {}) } }); }
  async exportLedgerCsv(filters?: ReportFilters, options?: RequestOptions) { return this.request<string>(`/reports/export/ledger.csv${this.query(filters)}`, { ...options, headers: { Accept: 'text/csv', ...(options?.headers ?? {}) } }); }
  async listEvents(options?: RequestOptions) { return this.listWebhookEvents(options); }
  async listLogs(options?: RequestOptions) { return this.request<unknown[]>('/logs', options); }

  async listWebhookEndpoints(options?: RequestOptions) { return this.request<WebhookEndpoint[]>('/webhook-endpoints', options); }
  async createWebhookEndpoint(payload: WebhookEndpointCreateParams, options?: RequestOptions) { assertUrl(payload.url, 'url'); return this.request<WebhookEndpoint>('/webhook-endpoints', { ...options, method: 'POST', body: JSON.stringify(payload) }); }
  async deleteWebhookEndpoint(id: string, options?: RequestOptions) { return this.request<{ deleted: boolean; id: string }>(`/webhook-endpoints/${id}`, { ...options, method: 'DELETE' }); }
  async listWebhookEvents(options?: RequestOptions) { return this.request<DiapayWebhookEvent[]>('/webhook-events', options); }
  async getPayment(id: string, options?: RequestOptions) { return this.retrievePayment(id, options); }

  static verifyWebhookSignature(rawBody: string, signature: string, secret: string) {
    if (!rawBody || !signature || !secret) return false;
    const parts = signature.includes(',') ? Object.fromEntries(signature.split(',').map((part)=>part.split('='))) : {};
    const timestamp = parts.t;
    const normalized = parts.v1 ?? (signature.includes('=') ? signature.split('=').pop() ?? signature : signature);
    const signed = timestamp ? `${timestamp}.${rawBody}` : rawBody;
    const expected = crypto.createHmac('sha256', secret).update(signed).digest('hex');
    const left = Buffer.from(normalized);
    const right = Buffer.from(expected);
    return left.length === right.length && crypto.timingSafeEqual(left, right);
  }

  static constructWebhookEvent<T = Record<string, unknown>>(rawBody: string, signatureHeader: string, secret: string): DiapayWebhookEvent<T> { return constructWebhookEvent(rawBody, signatureHeader, secret); }
  verifyWebhook(rawBody: string, signature: string, secret: string) { return Diapay.verifyWebhookSignature(rawBody, signature, secret); }
}

export const DiapaySDK = Diapay;
export default Diapay;

export function createCheckoutSession(client: Diapay, payload: CheckoutSessionCreateParams, options?: RequestOptions) {
  return client.createCheckoutSession(payload, options);
}

export function getCheckoutSession(client: Diapay, id: string, options?: RequestOptions) {
  return client.retrieveCheckoutSession(id, options);
}

export function getPayment(client: Diapay, id: string, options?: RequestOptions) {
  return client.getPayment(id, options);
}

export function refundPayment(client: Diapay, id: string, payload: Omit<RefundCreateParams, 'paymentId'> = {}, options?: RequestOptions) {
  return client.refundPayment(id, payload, options);
}

export function listWallets(client: Diapay, options?: RequestOptions) { return client.listWallets(options); }
export function getWallet(client: Diapay, id: string, options?: RequestOptions) { return client.getWallet(id, options); }
export function listLedgerTransactions(client: Diapay, options?: RequestOptions) { return client.listLedgerTransactions(options); }
export function getLedgerTransaction(client: Diapay, id: string, options?: RequestOptions) { return client.getLedgerTransaction(id, options); }
export function listApiKeys(client: Diapay, options?: RequestOptions) { return client.listApiKeys(options); }
export function createApiKey(client: Diapay, payload: ApiKeyCreateParams, options?: RequestOptions) { return client.createApiKey(payload, options); }
export function revokeApiKey(client: Diapay, id: string, options?: RequestOptions) { return client.revokeApiKey(id, options); }
export function listApplications(client: Diapay, options?: RequestOptions) { return client.listApplications(options); }
export function createApplication(client: Diapay, payload: Partial<Application>, options?: RequestOptions) { return client.createApplication(payload, options); }
export function updateApplication(client: Diapay, id: string, payload: Partial<Application>, options?: RequestOptions) { return client.updateApplication(id, payload, options); }
export function listMerchantAdmins(client: Diapay, options?: RequestOptions) { return client.listMerchantAdmins(options); }
export function getCurrentMerchant(client: Diapay, options?: RequestOptions) { return client.getCurrentMerchant(options); }
export function getBalances(client: Diapay, options?: RequestOptions) { return client.getBalances(options); }

export function verifyWebhookSignature(rawBody: string, signatureHeader: string, secret: string, toleranceSeconds = 300) {
  if (!signatureHeader.includes(',')) return Diapay.verifyWebhookSignature(rawBody, signatureHeader, secret);
  const parts = Object.fromEntries(signatureHeader.split(',').map((part) => {
    const [key, value] = part.split('=');
    return [key, value];
  }));
  const timestamp = Number(parts.t);
  const signature = parts.v1;
  if (!timestamp || !signature || Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) return false;
  const signedPayload = `${timestamp}.${rawBody}`;
  return Diapay.verifyWebhookSignature(signedPayload, signature, secret);
}

export function constructWebhookEvent<T = Record<string, unknown>>(rawBody: string, signatureHeader: string, secret: string): DiapayWebhookEvent<T> {
  if (!verifyWebhookSignature(rawBody, signatureHeader, secret)) throw new DiapayError('Invalid webhook signature', 400, 'INVALID_WEBHOOK_SIGNATURE');
  return JSON.parse(rawBody) as DiapayWebhookEvent<T>;
}
