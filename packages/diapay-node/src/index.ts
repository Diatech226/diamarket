import Diapay, { type CheckoutSessionCreateParams, type DiapayOptions, type MarketplacePayoutCreateParams, type PaymentCreateParams, type RequestOptions, type SplitPaymentCreateParams, type VendorAccountCreateParams } from 'diapay-sdk-js';
export * from 'diapay-sdk-js';

let defaultClient: Diapay | null = null;

export function createClient(options: DiapayOptions) {
  defaultClient = new Diapay(options);
  return defaultClient;
}

function client(options?: DiapayOptions) {
  if (options) return new Diapay(options);
  if (defaultClient) return defaultClient;
  const secretKey = process.env.DIAPAY_SECRET_KEY;
  if (!secretKey) throw new Error('DIAPAY_SECRET_KEY is required or pass DiapayOptions to the helper');
  defaultClient = new Diapay({ secretKey, baseUrl: process.env.DIAPAY_BASE_URL });
  return defaultClient;
}

export function createPayment(payload: PaymentCreateParams, options?: DiapayOptions & RequestOptions) {
  return client(options).payments.create(payload, options);
}

export function retrievePayment(paymentId: string, options?: DiapayOptions & RequestOptions) {
  return client(options).payments.retrieve(paymentId, options);
}

export function getPayment(paymentId: string, options?: DiapayOptions & RequestOptions) {
  return retrievePayment(paymentId, options);
}

export function cancelPayment(paymentId: string, options?: DiapayOptions & RequestOptions) {
  return client(options).payments.cancel(paymentId, options);
}

export function createCheckoutSession(payload: CheckoutSessionCreateParams, options?: DiapayOptions & RequestOptions) {
  return client(options).checkout.sessions.create(payload, options);
}

export function createRefund(payload: { paymentId: string; amount?: number; reason?: string; metadata?: Record<string, string | number | boolean | null> }, options?: DiapayOptions & RequestOptions) {
  return client(options).refunds.create(payload, options);
}

export function getRefund(refundId: string, options?: DiapayOptions & RequestOptions) {
  return client(options).refunds.retrieve(refundId, options);
}

export function refundPayment(paymentId: string, payload: { amount?: number; reason?: string; metadata?: Record<string, string | number | boolean | null> } = {}, options?: DiapayOptions & RequestOptions) {
  return createRefund({ ...payload, paymentId }, options);
}




export function verifyWebhook(rawBody: string, signature: string, secret: string) {
  return Diapay.verifyWebhookSignature(rawBody, signature, secret);
}

export default Diapay;


export function createMarketplaceVendor(payload: VendorAccountCreateParams, options?: DiapayOptions & RequestOptions) {
  return client(options).marketplace.vendors.create(payload, options);
}

export function createSplitPayment(payload: SplitPaymentCreateParams, options?: DiapayOptions & RequestOptions) {
  return client(options).marketplace.splitPayment(payload, options);
}

export function createMarketplacePayout(payload: MarketplacePayoutCreateParams, options?: DiapayOptions & RequestOptions) {
  return client(options).marketplace.payouts.create(payload, options);
}

export function listProviders(options?: DiapayOptions & RequestOptions) {
  return client(options).listProviders(options);
}

export function getProviderCapabilities(provider: string, options?: DiapayOptions & RequestOptions) {
  return client(options).getProviderCapabilities(provider, options);
}

export function simulateProviderScenario(payload: { scenario: string; amount?: number; currency?: string }, options?: DiapayOptions & RequestOptions) {
  return client(options).simulateProviderScenario(payload, options);
}

export function verifyWebhookSignature(rawBody: string, signatureHeader: string, secret: string) {
  return Diapay.verifyWebhookSignature(rawBody, signatureHeader, secret);
}

export function constructWebhookEvent(rawBody: string, signatureHeader: string, secret: string) {
  return Diapay.constructWebhookEvent(rawBody, signatureHeader, secret);
}

export function listWebhookEndpoints(options?: DiapayOptions & RequestOptions) { return client(options).listWebhookEndpoints(options); }
export function createWebhookEndpoint(payload: { url: string; events?: string[]; description?: string; applicationId?: string }, options?: DiapayOptions & RequestOptions) { return client(options).createWebhookEndpoint(payload, options); }
export function deleteWebhookEndpoint(id: string, options?: DiapayOptions & RequestOptions) { return client(options).deleteWebhookEndpoint(id, options); }
export function listWebhookEvents(options?: DiapayOptions & RequestOptions) { return client(options).listWebhookEvents(options); }

export function expressWebhookMiddleware() {
  return function diapayRawBody(req: any, _res: any, next: any) {
    let data = '';
    req.setEncoding?.('utf8');
    req.on?.('data', (chunk: string) => { data += chunk; });
    req.on?.('end', () => { req.rawBody = data; try { req.body = data ? JSON.parse(data) : {}; } catch { req.body = {}; } next(); });
  };
}
