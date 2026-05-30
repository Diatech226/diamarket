import type { ApiKey, CheckoutSession, Customer, EnvironmentMode, Payment, Payout, Refund, Transaction, UserRole, ProviderDescriptor, WebhookEndpoint, WebhookEvent, WebhookLog } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_DIAPAY_API_URL ?? 'http://localhost:5100';

type ApiOptions = RequestInit & { token?: string };

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Diapay API error ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const diapayApi = {
  getBalance: () => request<{ available: number; pending?: number; currency: string }>('/balance'),
  listTransactions: () => request<Transaction[]>('/transactions'),
  getPayment: (id: string) => request<Payment>(`/payments/${id}`),
  createPayment: (payload: Partial<Payment>) => request<Payment>('/payments', { method: 'POST', body: JSON.stringify(payload) }),
  refundPayment: (id: string) => request<Refund>(`/payments/${id}/refund`, { method: 'POST' }),
  createWebhook: (url: string, events: string[]) => request<{ received: boolean }>('/webhooks', { method: 'POST', body: JSON.stringify({ url, events }) }),
  createPayout: (amount: number, currency: string) => request<Payout>('/payouts', { method: 'POST', body: JSON.stringify({ amount, currency }) }),
  listCheckoutSessions: () => request<CheckoutSession[]>('/checkout/sessions'),
  getCheckoutSession: (id: string) => request<CheckoutSession>(`/checkout/sessions/${id}`),
  listWebhookEvents: () => request<WebhookEvent[]>('/webhook-events'),
  listProviders: () => request<ProviderDescriptor[]>('/providers'),
};

export function maskSecret(secret: string) {
  if (secret.length <= 10) return '••••••••';
  return `${secret.slice(0, 7)}••••••••••••${secret.slice(-4)}`;
}

export const currentUser = {
  name: 'Aïcha Koné',
  email: 'aicha@kora-payments.ci',
  role: 'merchant' as UserRole,
  merchant: 'Kora Payments',
  country: 'Côte d’Ivoire',
  defaultCurrency: 'XOF',
  avatar: 'AK',
};

export const metrics = {
  balance: 18420500,
  pending: 3120000,
  volume: 98240000,
  successRate: 96.8,
  apiRequests: 482910,
  apiErrors: 1240,
  responseTimeMs: 142,
  webhooksSent: 18320,
  paymentsCreated: 9214,
  refunds: 18,
  payouts: 7,
  chart: [42, 58, 51, 72, 68, 81, 96, 88, 104, 118, 111, 130],
};

export const payments: Payment[] = [
  { id: 'pay_9M4xqK', reference: 'INV-2026-4821', customer: 'Mariam Traoré', email: 'mariam@example.com', amount: 125000, currency: 'XOF', status: 'succeeded', method: 'mobile-money', provider: 'Orange Money', createdAt: '2026-05-29T09:12:00Z', refundable: true },
  { id: 'pay_2Jp8cA', reference: 'SUB-2026-118', customer: 'Jean Kouassi', email: 'jean@example.com', amount: 89000, currency: 'XOF', status: 'processing', method: 'bank-card', provider: 'Visa', createdAt: '2026-05-29T08:45:00Z', refundable: false },
  { id: 'pay_7Qv1nD', reference: 'ORD-77420', customer: 'Nana Appiah', email: 'nana@example.com', amount: 520, currency: 'USD', status: 'requires_action', method: 'crypto', provider: 'USDC Polygon', createdAt: '2026-05-28T19:30:00Z', refundable: false },
  { id: 'pay_5Ls0bF', reference: 'INV-2026-4808', customer: 'Seydou Diallo', email: 'seydou@example.com', amount: 430000, currency: 'XOF', status: 'refunded', method: 'bank-transfer', provider: 'Ecobank', createdAt: '2026-05-28T15:05:00Z', refundable: false },
  { id: 'pay_3Ax7mR', reference: 'ORD-77398', customer: 'Fatou Ndiaye', email: 'fatou@example.com', amount: 240000, currency: 'XOF', status: 'failed', method: 'mobile-money', provider: 'MTN MoMo', createdAt: '2026-05-27T11:22:00Z', refundable: false },
];


export const checkoutSessions: CheckoutSession[] = [
  { id: 'cs_test_demo1', merchant: 'Kora Payments', payment: 'pay_9M4xqK', amount: 125000, currency: 'XOF', customer: { name: 'Mariam Traoré', email: 'mariam@example.com' }, items: [{ name: 'Facture premium', quantity: 1, amount: 125000 }], successUrl: 'https://merchant.example/success', cancelUrl: 'https://merchant.example/cancel', status: 'completed', expiresAt: '2026-05-29T10:12:00Z', metadata: { orderId: 'INV-2026-4821' }, createdAt: '2026-05-29T09:12:00Z' },
  { id: 'cs_test_demo2', merchant: 'Kora Payments', payment: 'pay_2Jp8cA', amount: 89000, currency: 'XOF', customer: { name: 'Jean Kouassi', email: 'jean@example.com' }, items: [{ name: 'Abonnement', quantity: 1, amount: 89000 }], successUrl: 'https://merchant.example/success', cancelUrl: 'https://merchant.example/cancel', status: 'open', expiresAt: '2026-05-29T11:45:00Z', metadata: { orderId: 'SUB-2026-118' }, createdAt: '2026-05-29T08:45:00Z' },
  { id: 'cs_test_demo3', merchant: 'Kora Payments', amount: 240000, currency: 'XOF', customer: { name: 'Fatou Ndiaye', email: 'fatou@example.com' }, items: [{ name: 'Commande marketplace', quantity: 1, amount: 240000 }], successUrl: 'https://merchant.example/success', cancelUrl: 'https://merchant.example/cancel', status: 'cancelled', expiresAt: '2026-05-27T12:22:00Z', metadata: { orderId: 'ORD-77398' }, createdAt: '2026-05-27T11:22:00Z' },
];

export const webhookEventsData: WebhookEvent[] = [
  { id: 'evt_checkout_1', type: 'checkout.session.completed', merchant: 'Kora Payments', payload: { session: 'cs_test_demo1' }, attempts: [{ id: 'del_checkout_1', url: 'https://api.kora.ci/diapay/webhooks', status: 'delivered', statusCode: 200 }], createdAt: '2026-05-29T09:12:05Z' },
  { id: 'evt_payment_1', type: 'payment.succeeded', merchant: 'Kora Payments', payload: { payment: 'pay_9M4xqK' }, attempts: [{ id: 'del_payment_1', url: 'https://api.kora.ci/diapay/webhooks', status: 'delivered', statusCode: 200 }], createdAt: '2026-05-29T09:12:06Z' },
];

export const transactions: Transaction[] = payments.map((payment, index) => ({ ...payment, fee: Math.round(payment.amount * 0.018), net: Math.round(payment.amount * 0.982), id: `txn_${index + 1420}` }));

export const apiKeys: ApiKey[] = [
  { id: 'key_1', name: 'Backend production', key: 'sk_live_Km28xYa932jjJwKeQp8812', environment: 'live', role: 'merchant', createdAt: '2026-02-14', lastUsed: 'Il y a 2 min', active: true },
  { id: 'key_2', name: 'Sandbox checkout', key: 'sk_test_Bb72nPa118zzLwFqEe4421', environment: 'test', role: 'admin', createdAt: '2026-04-08', lastUsed: 'Hier', active: true },
  { id: 'key_3', name: 'Frontend publishable test', key: 'pk_test_Js81nPa118zzLwFqEe4421', environment: 'test', role: 'merchant', createdAt: '2026-05-20', lastUsed: 'Il y a 10 min', active: true },
  { id: 'key_4', name: 'Legacy mobile app', key: 'sk_live_Rr90pQa551aaTzJmCc3310', environment: 'live', role: 'merchant', createdAt: '2025-11-21', lastUsed: 'Jamais', active: false },
];

export const webhooks: WebhookEndpoint[] = [
  { id: 'wh_1', url: 'https://api.kora.ci/diapay/webhooks', events: ['payment.succeeded', 'payment.failed', 'refund.succeeded'], secret: 'whsec_live_9zXY82bB4mPqL6', status: 'active', successRate: 99.2 },
  { id: 'wh_2', url: 'https://staging.kora.ci/hooks/diapay', events: ['payment.created', 'payout.paid'], secret: 'whsec_test_1aBC77lLpQwE8', status: 'paused', successRate: 91.4 },
];

export const webhookLogs: WebhookLog[] = [
  { id: 'del_1', endpoint: 'wh_1', event: 'payment.succeeded', status: 'delivered', createdAt: '2026-05-29 09:12', attempts: 1 },
  { id: 'del_2', endpoint: 'wh_1', event: 'refund.succeeded', status: 'retrying', createdAt: '2026-05-29 08:04', attempts: 2 },
  { id: 'del_3', endpoint: 'wh_2', event: 'payout.paid', status: 'failed', createdAt: '2026-05-28 18:40', attempts: 5 },
];

export const customers: Customer[] = [
  { id: 'cus_1', name: 'Mariam Traoré', email: 'mariam@example.com', country: 'CI', totalSpend: 1840000, payments: 12, createdAt: '2025-12-10' },
  { id: 'cus_2', name: 'Jean Kouassi', email: 'jean@example.com', country: 'CI', totalSpend: 920000, payments: 7, createdAt: '2026-01-19' },
  { id: 'cus_3', name: 'Nana Appiah', email: 'nana@example.com', country: 'GH', totalSpend: 2300, payments: 4, createdAt: '2026-03-02' },
];

export const refunds: Refund[] = [
  { id: 'ref_1', paymentId: 'pay_5Ls0bF', amount: 430000, currency: 'XOF', status: 'succeeded', reason: 'Demande client', createdAt: '2026-05-28' },
  { id: 'ref_2', paymentId: 'pay_8Ry2kL', amount: 65000, currency: 'XOF', status: 'pending', reason: 'Double débit', createdAt: '2026-05-27' },
];

export const payouts: Payout[] = [
  { id: 'po_1', amount: 12500000, currency: 'XOF', status: 'paid', destination: 'Ecobank •••• 4021', arrivalDate: '2026-05-29' },
  { id: 'po_2', amount: 8000000, currency: 'XOF', status: 'in_transit', destination: 'UBA •••• 7110', arrivalDate: '2026-05-31' },
  { id: 'po_3', amount: 2100000, currency: 'XOF', status: 'pending', destination: 'Wave Business', arrivalDate: '2026-06-01' },
];

export const providerDescriptors: ProviderDescriptor[] = [
  { id: 'mock-mobile-money', name: 'Mobile Money Sandbox', method: 'mobile-money', environment: 'test', capabilities: ['payments', 'refunds', 'cancellations', 'webhooks'], currencies: ['XOF', 'GHS', 'NGN'], countries: ['CI', 'SN', 'BJ', 'TG', 'GH', 'NG'], status: 'ready', testMode: true, implementation: 'mock', notes: 'Remplaçable par Orange Money, MTN MoMo, Wave ou Moov.' },
  { id: 'mock-bank-card', name: 'Card Sandbox', method: 'bank-card', environment: 'test', capabilities: ['payments', 'refunds', 'cancellations', 'webhooks'], currencies: ['XOF', 'USD', 'EUR', 'GHS', 'NGN'], countries: ['CI', 'SN', 'BJ', 'TG', 'GH', 'NG', 'FR', 'US'], status: 'ready', testMode: true, implementation: 'mock', notes: 'Prêt pour un acquéreur carte / PSP tokenisé.' },
  { id: 'mock-bank-transfer', name: 'Bank Transfer Sandbox', method: 'bank-transfer', environment: 'test', capabilities: ['payments', 'webhooks'], currencies: ['XOF', 'USD', 'EUR'], countries: ['CI', 'SN', 'BJ', 'TG'], status: 'ready', testMode: true, implementation: 'mock', notes: 'Instructions de virement sandbox sans compte réel.' },
  { id: 'mock-crypto', name: 'Crypto Sandbox', method: 'crypto', environment: 'test', capabilities: ['payments', 'refunds', 'webhooks'], currencies: ['USDC', 'USD', 'EUR'], countries: ['GLOBAL'], status: 'ready', testMode: true, implementation: 'mock', notes: 'Adresse sandbox non réutilisable; aucun wallet réel.' },
];

export const environments: EnvironmentMode[] = ['test', 'live'];

export const marketplaceWallets = [
  { id: 'wlt_vendor_1', type: 'vendor_wallet' as const, owner: 'Atelier Baoulé', balance: 85000, availableBalance: 0, pendingBalance: 85000, currency: 'XOF', status: 'active' as const },
  { id: 'wlt_platform_1', type: 'platform_wallet' as const, owner: 'Diamarket', balance: 10000, availableBalance: 10000, pendingBalance: 0, currency: 'XOF', status: 'active' as const },
  { id: 'wlt_fee_1', type: 'merchant_wallet' as const, owner: 'Diapay Fees', balance: 5000, availableBalance: 5000, pendingBalance: 0, currency: 'XOF', status: 'active' as const },
  { id: 'wlt_escrow_1', type: 'escrow_wallet' as const, owner: 'Marketplace Escrow', balance: 85000, availableBalance: 0, pendingBalance: 85000, currency: 'XOF', status: 'active' as const },
  { id: 'wlt_reserve_1', type: 'reserve_wallet' as const, owner: 'Risk Reserve', balance: 1200000, availableBalance: 0, pendingBalance: 1200000, currency: 'XOF', status: 'active' as const },
];

export const vendorAccounts = [
  { id: 'vnd_1', businessName: 'Atelier Baoulé', country: 'CI', currencies: ['XOF', 'EUR', 'USD'], wallet: 'wlt_vendor_1', kycStatus: 'verified' as const, capabilities: ['payments', 'escrow', 'payouts', 'refunds'], commission: '10% marketplace + 5% Diapay' },
  { id: 'vnd_2', businessName: 'Sahel Electronics', country: 'SN', currencies: ['XOF', 'USDT'], wallet: 'wlt_vendor_2', kycStatus: 'pending' as const, capabilities: ['payments', 'escrow'], commission: '8% catégorie électronique' },
  { id: 'vnd_3', businessName: 'Kente Labs', country: 'GH', currencies: ['USD', 'USDT'], wallet: 'wlt_vendor_3', kycStatus: 'verified' as const, capabilities: ['payments', 'payouts', 'multi_currency'], commission: 'Dynamique pays + vendeur' },
];

export const escrowHolds = [
  { id: 'esc_1', paymentId: 'pay_market_1', vendor: 'Atelier Baoulé', amount: 85000, currency: 'XOF', status: 'held' as const, autoReleaseAt: '2026-06-02T10:00:00Z' },
  { id: 'esc_2', paymentId: 'pay_market_2', vendor: 'Sahel Electronics', amount: 420000, currency: 'XOF', status: 'disputed' as const },
  { id: 'esc_3', paymentId: 'pay_market_3', vendor: 'Kente Labs', amount: 150, currency: 'USDT', status: 'released' as const },
];

export const ledgerEntries = [
  { id: 'le_1', transactionId: 'txn_split_1', account: 'Escrow liability', direction: 'credit' as const, type: 'reserve', amount: 85000, currency: 'XOF', createdAt: '2026-05-30T09:00:00Z' },
  { id: 'le_2', transactionId: 'txn_split_1', account: 'Platform revenue', direction: 'credit' as const, type: 'fee', amount: 10000, currency: 'XOF', createdAt: '2026-05-30T09:00:01Z' },
  { id: 'le_3', transactionId: 'txn_split_1', account: 'Diapay fee revenue', direction: 'credit' as const, type: 'fee', amount: 5000, currency: 'XOF', createdAt: '2026-05-30T09:00:02Z' },
  { id: 'le_4', transactionId: 'txn_release_1', account: 'Vendor liability', direction: 'credit' as const, type: 'credit', amount: 85000, currency: 'XOF', createdAt: '2026-05-30T12:30:00Z' },
];

export const commissionRules = [
  { id: 'com_1', scope: 'platform', rule: '10% commission marketplace par défaut', priority: 100, active: true },
  { id: 'com_2', scope: 'vendor', rule: 'Atelier Baoulé: 8% si volume mensuel > 5M XOF', priority: 50, active: true },
  { id: 'com_3', scope: 'country', rule: 'Ghana USD: +1.5% FX settlement', priority: 70, active: true },
  { id: 'com_4', scope: 'category', rule: 'Électronique: commission fixe 2 500 XOF + 6%', priority: 60, active: true },
];

export const marketplaceAnalytics = {
  totalVolume: 98240000,
  commissions: 9840000,
  payoutsCompleted: 22600000,
  vendorBalances: 18420500,
  escrowBalances: 5050000,
  platformRevenue: 12450000,
};
