import { NextRequest, NextResponse } from 'next/server';

const logs: Array<{ id: string; signature: string | null; body: unknown; receivedAt: string }> = [];

export async function POST(request: NextRequest) {
  const text = await request.text();
  const entry = { id: `log_${Date.now()}`, signature: request.headers.get('diapay-signature'), body: JSON.parse(text), receivedAt: new Date().toISOString() };
  logs.unshift(entry);
  return NextResponse.json({ received: true, id: entry.id });
}

export async function GET() {
  return NextResponse.json(logs);
}
