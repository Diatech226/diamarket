import type { ApiKey, Customer, EnvironmentMode, Payment, Payout, Refund, Transaction, UserRole, WebhookEndpoint, WebhookLog } from './types';

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

export const transactions: Transaction[] = payments.map((payment, index) => ({ ...payment, fee: Math.round(payment.amount * 0.018), net: Math.round(payment.amount * 0.982), id: `txn_${index + 1420}` }));

export const apiKeys: ApiKey[] = [
  { id: 'key_1', name: 'Backend production', key: 'sk_live_Km28xYa932jjJwKeQp8812', environment: 'live', role: 'merchant', createdAt: '2026-02-14', lastUsed: 'Il y a 2 min', active: true },
  { id: 'key_2', name: 'Sandbox checkout', key: 'sk_test_Bb72nPa118zzLwFqEe4421', environment: 'test', role: 'admin', createdAt: '2026-04-08', lastUsed: 'Hier', active: true },
  { id: 'key_3', name: 'Legacy mobile app', key: 'sk_live_Rr90pQa551aaTzJmCc3310', environment: 'live', role: 'merchant', createdAt: '2025-11-21', lastUsed: 'Jamais', active: false },
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

export const environments: EnvironmentMode[] = ['test', 'live'];
