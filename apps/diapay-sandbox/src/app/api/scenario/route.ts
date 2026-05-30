import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.DIAPAY_API_URL ?? 'http://localhost:5100';
const SECRET_KEY = process.env.DIAPAY_SECRET_KEY ?? 'sk_test_sandbox_merchant';

const scenarios: Record<string, Record<string, unknown>> = {
  'payment-success': { type: 'payment', method: 'bank-card', cardNumber: '4242424242424242' },
  'payment-failed': { type: 'payment', method: 'bank-card', cardNumber: '4000000000000002', forceStatus: 'failed' },
  'payment-pending': { type: 'payment', method: 'mobile-money', phone: '70000000', forceStatus: 'pending' },
  'payment-expired': { type: 'payment', method: 'mobile-money', phone: '70000000', forceStatus: 'expired' },
  'mobile-money': { type: 'payment', method: 'mobile-money', phone: '70000000' },
  crypto: { type: 'payment', method: 'crypto' },
  payout: { type: 'payout' },
  webhook: { type: 'webhook' },
  refund: { type: 'refund' },
};

async function api(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${API_BASE_URL}/api/v1${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SECRET_KEY}` }, body: JSON.stringify(body) });
  return { status: response.status, body: await response.json() };
}

export async function POST(request: NextRequest) {
  const { id } = await request.json();
  const scenario = scenarios[String(id)];
  if (!scenario) return NextResponse.json({ error: 'Unknown sandbox scenario' }, { status: 400 });

  if (scenario.type === 'payout') return NextResponse.json(await api('/payouts', { amount: 90000, currency: 'XOF', destination: 'sandbox_bank' }));
  if (scenario.type === 'webhook') return NextResponse.json(await api('/webhooks', { url: 'http://localhost:3102/api/sandbox-webhook', events: ['payment.succeeded', 'payment.failed', 'checkout.completed', 'refund.succeeded', 'payout.completed'] }));
  if (scenario.type === 'refund') {
    const payment = await api('/payments', { amount: 25000, currency: 'XOF', method: 'bank-card', cardNumber: '4242424242424242' });
    const paymentId = typeof payment.body === 'object' && payment.body && 'id' in payment.body ? String(payment.body.id) : 'pay_test_missing';
    return NextResponse.json({ payment, refund: await api(`/payments/${paymentId}/refund`, { amount: 10000, reason: 'sandbox_refund' }) });
  }

  return NextResponse.json(await api('/payments', { amount: 25000, currency: 'XOF', metadata: { scenario: id }, ...scenario, type: undefined }));
}
