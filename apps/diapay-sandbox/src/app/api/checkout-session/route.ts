import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.DIAPAY_API_URL ?? 'http://localhost:5100';
const SECRET_KEY = process.env.DIAPAY_SECRET_KEY ?? 'sk_test_sandbox_merchant';

export async function POST() {
  const response = await fetch(`${API_BASE_URL}/api/v1/checkout/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SECRET_KEY}`,
      'Idempotency-Key': `demo-cart-${Date.now()}`,
    },
    body: JSON.stringify({
      amount: 25000,
      currency: 'XOF',
      merchant: 'Diapay Demo Shop',
      successUrl: 'http://localhost:3102/success',
      cancelUrl: 'http://localhost:3102/cancel',
      customer: { name: 'Client Sandbox', email: 'client@example.com' },
      items: [{ name: 'Produit test Diapay', quantity: 1, amount: 25000 }],
      metadata: { cartId: 'cart_demo_001' },
    }),
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
