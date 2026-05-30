import Diapay, { type CheckoutSessionCreateParams, type DiapayOptions, type MarketplacePayoutCreateParams, type MarketplaceSplitPaymentCreateParams, type MarketplaceVendorCreateParams, type PaymentCreateParams, type RequestOptions } from 'diapay-sdk-js';
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

export function createCheckoutSession(payload: CheckoutSessionCreateParams, options?: DiapayOptions & RequestOptions) {
  return client(options).checkout.sessions.create(payload, options);
}

export function refundPayment(paymentId: string, payload: { amount?: number; reason?: string; metadata?: Record<string, string | number | boolean | null> } = {}, options?: DiapayOptions & RequestOptions) {
  return client(options).refundPayment(paymentId, payload, options);
}


export function createMarketplaceVendor(payload: MarketplaceVendorCreateParams, options?: DiapayOptions & RequestOptions) {
  return client(options).marketplace.createVendor(payload, options);
}

export function createMarketplaceSplitPayment(payload: MarketplaceSplitPaymentCreateParams, options?: DiapayOptions & RequestOptions) {
  return client(options).marketplace.splitPayment(payload, options);
}

export function createMarketplacePayout(payload: MarketplacePayoutCreateParams, options?: DiapayOptions & RequestOptions) {
  return client(options).marketplace.createPayout(payload, options);
}

export function verifyWebhook(rawBody: string, signature: string, secret: string) {
  return Diapay.verifyWebhookSignature(rawBody, signature, secret);
}

export default Diapay;
