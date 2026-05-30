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
  'simple-marketplace-payment': { type: 'marketplace_split', variant: 'simple' },
  'multi-vendor-split': { type: 'marketplace_split', variant: 'multi' },
  'escrow-release': { type: 'escrow_release' },
  'automatic-payout': { type: 'marketplace_payout' },
  'vendor-refund': { type: 'vendor_refund' },
  webhook: { type: 'webhook' },
  refund: { type: 'refund' },
  'marketplace-simple-payment': { type: 'marketplace-simple-payment' },
  'marketplace-multi-vendor': { type: 'marketplace-multi-vendor' },
  'marketplace-escrow-release': { type: 'marketplace-escrow-release' },
  'marketplace-auto-payout': { type: 'marketplace-auto-payout' },
  'marketplace-vendor-refund': { type: 'marketplace-vendor-refund' },
};

async function api(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${API_BASE_URL}/api/v1${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SECRET_KEY}` }, body: JSON.stringify(body) });
  return { status: response.status, body: await response.json() };
}

export async function POST(request: NextRequest) {
  const { id } = await request.json();
  const scenario = scenarios[String(id)];
  if (!scenario) return NextResponse.json({ error: 'Unknown sandbox scenario' }, { status: 400 });


  if (scenario.type === 'marketplace-simple-payment') return NextResponse.json(await api('/marketplace/split-payment', { amount: 100000, currency: 'FCFA', escrow: false }));
  if (scenario.type === 'marketplace-multi-vendor') {
    const vendorA = await api('/marketplace/vendors', { businessName: 'Sandbox Vendor A', country: 'CI', currencies: ['FCFA'], payoutMethods: [{ type: 'mobile_money', label: 'Wave A', currency: 'FCFA' }] });
    const vendorB = await api('/marketplace/vendors', { businessName: 'Sandbox Vendor B', country: 'SN', currencies: ['FCFA'], payoutMethods: [{ type: 'bank_transfer', label: 'Bank B', currency: 'FCFA' }] });
    const vendorAId = typeof vendorA.body === 'object' && vendorA.body && 'id' in vendorA.body ? String(vendorA.body.id) : 'vendor_a';
    const vendorBId = typeof vendorB.body === 'object' && vendorB.body && 'id' in vendorB.body ? String(vendorB.body.id) : 'vendor_b';
    return NextResponse.json({ vendorA, vendorB, split: await api('/marketplace/split-payment', { amount: 200000, currency: 'FCFA', splits: [{ type: 'percentage', percentage: 50, vendorId: vendorAId, priority: 1 }, { type: 'percentage', percentage: 35, vendorId: vendorBId, priority: 2 }, { type: 'fallback', priority: 99 }], escrow: true }) });
  }
  if (scenario.type === 'marketplace-escrow-release') {
    const split = await api('/marketplace/split-payment', { amount: 100000, currency: 'FCFA', escrow: true });
    const escrowId = typeof split.body === 'object' && split.body && 'escrowId' in split.body ? String(split.body.escrowId) : '';
    return NextResponse.json({ split, release: await api('/marketplace/escrow/release', { escrowId }) });
  }
  if (scenario.type === 'marketplace-auto-payout') {
    const vendor = await api('/marketplace/vendors', { businessName: 'Auto Payout Vendor', country: 'CI', currencies: ['FCFA'], payoutMethods: [{ type: 'mobile_money', label: 'Orange Money', currency: 'FCFA', details: { phone: '+2250700000000' } }] });
    const vendorId = typeof vendor.body === 'object' && vendor.body && 'id' in vendor.body ? String(vendor.body.id) : '';
    const split = await api('/marketplace/split-payment', { amount: 150000, currency: 'FCFA', splits: [{ type: 'percentage', percentage: 85, vendorId, priority: 1 }, { type: 'fallback', priority: 99 }], escrow: false });
    return NextResponse.json({ vendor, split, payout: await api('/marketplace/payouts', { vendorId, minimumThreshold: 50000 }) });
  }
  if (scenario.type === 'marketplace-vendor-refund') {
    const split = await api('/marketplace/split-payment', { amount: 80000, currency: 'FCFA', escrow: true });
    const escrowId = typeof split.body === 'object' && split.body && 'escrowId' in split.body ? String(split.body.escrowId) : '';
    return NextResponse.json({ split, refund: await api('/marketplace/escrow/refund', { escrowId, amount: 40000, reason: 'sandbox_vendor_refund' }) });
  }

  if (scenario.type === 'payout') return NextResponse.json(await api('/payouts', { amount: 90000, currency: 'XOF', destination: 'sandbox_bank' }));
  if (scenario.type === 'marketplace_split') {
    const vendor = await api('/marketplace/vendors', { businessName: scenario.variant === 'multi' ? 'Sandbox Vendor A' : 'Sandbox Vendor', country: 'CI', currencies: ['XOF'] });
    const vendorId = typeof vendor.body === 'object' && vendor.body && 'id' in vendor.body ? String(vendor.body.id) : undefined;
    const splits = scenario.variant === 'multi' ? [{ vendorId, percentage: 60, holdInEscrow: true }, { label: 'Vendor B fallback wallet', walletId: undefined, percentage: 25, fallback: true }] : [{ vendorId, percentage: 85, holdInEscrow: true }];
    return NextResponse.json({ vendor, split: await api('/marketplace/split-payment', { amount: 100000, currency: 'XOF', splits: splits.filter((split) => split.vendorId || split.walletId), commission: { percentage: 10 }, diapayFee: { percentage: 5 }, escrow: { enabled: true } }) });
  }
  if (scenario.type === 'escrow_release') {
    const vendor = await api('/marketplace/vendors', { businessName: 'Sandbox Release Vendor', country: 'CI', currencies: ['XOF'] });
    const vendorId = typeof vendor.body === 'object' && vendor.body && 'id' in vendor.body ? String(vendor.body.id) : undefined;
    const split = await api('/marketplace/split-payment', { amount: 100000, currency: 'XOF', splits: [{ vendorId, percentage: 85, holdInEscrow: true }], commission: { percentage: 10 }, diapayFee: { percentage: 5 }, escrow: { enabled: true } });
    const escrowId = typeof split.body === 'object' && split.body && 'escrowHolds' in split.body && Array.isArray(split.body.escrowHolds) ? String(split.body.escrowHolds[0]?.id) : undefined;
    return NextResponse.json({ vendor, split, release: await api('/marketplace/escrow/release', { escrowId, amount: 85000 }) });
  }
  if (scenario.type === 'marketplace_payout') {
    const vendor = await api('/marketplace/vendors', { businessName: 'Sandbox Payout Vendor', country: 'CI', currencies: ['XOF'] });
    const vendorId = typeof vendor.body === 'object' && vendor.body && 'id' in vendor.body ? String(vendor.body.id) : undefined;
    const split = await api('/marketplace/split-payment', { amount: 100000, currency: 'XOF', splits: [{ vendorId, percentage: 85 }], commission: { percentage: 10 }, diapayFee: { percentage: 5 } });
    return NextResponse.json({ vendor, split, payout: await api('/marketplace/payouts', { vendorId, amount: 50000, currency: 'XOF', method: 'mobile_money', schedule: 'automatic', threshold: 25000 }) });
  }
  if (scenario.type === 'vendor_refund') {
    const vendor = await api('/marketplace/vendors', { businessName: 'Sandbox Refund Vendor', country: 'CI', currencies: ['XOF'] });
    const vendorId = typeof vendor.body === 'object' && vendor.body && 'id' in vendor.body ? String(vendor.body.id) : undefined;
    const split = await api('/marketplace/split-payment', { amount: 100000, currency: 'XOF', splits: [{ vendorId, percentage: 85, holdInEscrow: true }], commission: { percentage: 10 }, diapayFee: { percentage: 5 }, escrow: { enabled: true } });
    const escrowId = typeof split.body === 'object' && split.body && 'escrowHolds' in split.body && Array.isArray(split.body.escrowHolds) ? String(split.body.escrowHolds[0]?.id) : undefined;
    return NextResponse.json({ vendor, split, refund: await api('/marketplace/escrow/refund', { escrowId, amount: 25000, reason: 'sandbox_vendor_refund' }) });
  }
  if (scenario.type === 'webhook') return NextResponse.json(await api('/webhooks', { url: 'http://localhost:3102/api/sandbox-webhook', events: ['payment.succeeded', 'payment.failed', 'checkout.completed', 'refund.succeeded', 'payout.completed'] }));
  if (scenario.type === 'refund') {
    const payment = await api('/payments', { amount: 25000, currency: 'XOF', method: 'bank-card', cardNumber: '4242424242424242' });
    const paymentId = typeof payment.body === 'object' && payment.body && 'id' in payment.body ? String(payment.body.id) : 'pay_test_missing';
    return NextResponse.json({ payment, refund: await api(`/payments/${paymentId}/refund`, { amount: 10000, reason: 'sandbox_refund' }) });
  }

  return NextResponse.json(await api('/payments', { amount: 25000, currency: 'XOF', metadata: { scenario: id }, ...scenario, type: undefined }));
}
