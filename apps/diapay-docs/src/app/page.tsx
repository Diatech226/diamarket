'use client';

import { useMemo, useState } from 'react';

const sections = [
  ['home', 'Home'], ['quick-start', 'Quick Start'], ['authentication', 'Authentication'], ['checkout', 'Checkout'], ['payments', 'Payments API'], ['refunds', 'Refunds'], ['marketplace', 'Marketplace'], ['wallets', 'Wallets'], ['ledger', 'Ledger'], ['split-payments', 'Split Payments'], ['escrow', 'Escrow'], ['payouts', 'Payouts'], ['mobile-money', 'Mobile Money'], ['crypto', 'Crypto'], ['webhooks', 'Webhooks'], ['reporting', 'Reporting'], ['sdk-js', 'SDK JavaScript'], ['sdk-node', 'SDK Node.js'], ['sandbox', 'Sandbox'], ['errors', 'Error Codes'], ['changelog', 'Changelog'],
] as const;

const endpoints = [
  { name: 'Create payment', method: 'POST', path: '/payments', body: { amount: 125000, currency: 'XOF', method: 'mobile-money', phone: '70000000', metadata: { orderId: 'ORD-1001' } } },
  { name: 'Create checkout session', method: 'POST', path: '/checkout/sessions', body: { amount: 125000, currency: 'XOF', successUrl: 'https://example.com/success', cancelUrl: 'https://example.com/cancel', items: [{ name: 'Pro plan', quantity: 1, amount: 125000 }] } },
  { name: 'Refund payment', method: 'POST', path: '/payments/pay_test_123/refund', body: { amount: 25000, reason: 'requested_by_customer' } },
  { name: 'Create payout', method: 'POST', path: '/payouts', body: { amount: 90000, currency: 'XOF', destination: 'bank_account_001' } },
  { name: 'Marketplace split', method: 'POST', path: '/marketplace/split-payment', body: { amount: 100000, currency: 'XOF', splits: [{ vendorId: 'vnd_123', percentage: 85, holdInEscrow: true }], commission: { percentage: 10 }, diapayFee: { percentage: 5 }, escrow: { enabled: true } } },
  { name: 'Register webhook', method: 'POST', path: '/webhooks', body: { url: 'https://example.com/webhooks/diapay', events: ['payment.succeeded', 'payment.failed'] } },
  { name: 'Reporting overview', method: 'GET', path: '/reports/overview?environment=test&currency=XOF', body: {} },
  { name: 'Marketplace split payment', method: 'POST', path: '/marketplace/split-payment', body: { amount: 100000, currency: 'FCFA', splits: [{ type: 'percentage', percentage: 85, vendorId: 'vendor_123', priority: 1 }, { type: 'fallback', priority: 99 }], commission: { percentage: 10 }, escrow: true } },
  { name: 'Marketplace vendor', method: 'POST', path: '/marketplace/vendors', body: { businessName: 'Kora Fashion', country: 'CI', currencies: ['FCFA'], payoutMethods: [{ type: 'mobile_money', label: 'Wave Business', currency: 'FCFA' }] } },
];

const languages = ['curl', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'Next.js'] as const;
type Language = typeof languages[number];

function snippet(language: Language, endpoint: typeof endpoints[number], apiKey: string) {
  const url = `https://api.diapay.com/api/v1${endpoint.path}`;
  const json = JSON.stringify(endpoint.body, null, 2);
  if (language === 'curl') return `curl -X ${endpoint.method} ${url} \\\n  -H "Authorization: Bearer ${apiKey || 'sk_test_xxx'}" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(endpoint.body)}'`;
  if (language === 'TypeScript') return `import Diapay, { type PaymentCreateParams } from 'diapay-sdk-js';\n\nconst diapay = new Diapay({ secretKey: '${apiKey || 'sk_test_xxx'}' });\nconst payload: PaymentCreateParams = ${json};\nconst result = await diapay.payments.create(payload);`;
  if (language === 'Node.js') return `const { createClient, createPayment } = require('diapay-node');\n\ncreateClient({ secretKey: process.env.DIAPAY_SECRET_KEY });\nconst result = await createPayment(${json});`;
  if (language === 'Express') return `app.post('/pay', async (req, res) => {\n  const payment = await diapay.payments.create(${json});\n  res.json(payment);\n});`;
  if (language === 'Next.js') return `export async function POST() {\n  const payment = await diapay.payments.create(${json});\n  return Response.json(payment);\n}`;
  return `import Diapay from 'diapay-sdk-js';\n\nconst diapay = new Diapay({ secretKey: '${apiKey || 'sk_test_xxx'}' });\nconst result = await diapay.payments.create(${json});`;
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return <div className="code"><button onClick={() => navigator.clipboard.writeText(code).then(() => setCopied(true))}>{copied ? 'Copied' : 'Copy'}</button><pre><code>{code}</code></pre></div>;
}

export default function DeveloperPortal() {
  const [query, setQuery] = useState('');
  const [apiKey, setApiKey] = useState('sk_test_xxx');
  const [endpointIndex, setEndpointIndex] = useState(0);
  const [language, setLanguage] = useState<Language>('curl');
  const [response, setResponse] = useState('');
  const endpoint = endpoints[endpointIndex];
  const code = useMemo(() => snippet(language, endpoint, apiKey), [language, endpoint, apiKey]);
  const visibleSections = sections.filter(([, label]) => label.toLowerCase().includes(query.toLowerCase()));

  function runDemo() {
    setResponse(JSON.stringify({ id: endpoint.path.includes('checkout') ? 'cs_test_123' : 'pay_test_123', status: 'succeeded', mode: 'sandbox', requestId: 'req_test_abc', request: { method: endpoint.method, path: endpoint.path, body: endpoint.body } }, null, 2));
  }

  return <main className="portal">
    <aside className="sidebar"><strong>Diapay Developers</strong><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search docs…" />{visibleSections.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</aside>
    <section className="content" id="home">
      <div className="hero"><p>Stripe-like payments for Africa and global commerce</p><h1>Integrate Diapay in under 10 minutes.</h1><p>Checkout, payments, refunds, payouts, mobile money, crypto, webhooks and TypeScript-first SDKs in one premium developer portal.</p><CodeBlock code={`npm install diapay-sdk-js\n\nconst diapay = new Diapay({ secretKey: 'sk_test_xxx' });\nawait diapay.payments.create({ amount: 125000, currency: 'XOF', method: 'mobile-money' });`} /></div>

      <article id="quick-start"><h2>Quick Start</h2><ol><li>Create a test API key in the dashboard.</li><li>Install <code>diapay-sdk-js</code> or <code>diapay-node</code>.</li><li>Create a payment or checkout session.</li><li>Register a webhook endpoint and verify signatures.</li><li>Switch from <code>sk_test_</code> to <code>sk_live_</code> when approved for production.</li></ol></article>
      <article id="authentication"><h2>Authentication</h2><p>Authenticate every server request with <code>Authorization: Bearer sk_test_xxx</code>. Use publishable keys only in browser checkout and secret keys only on servers.</p></article>
      <article id="checkout"><h2>Checkout</h2><p>Create a hosted Checkout Session to redirect customers to a PCI-light Diapay page.</p><CodeBlock code={snippet('TypeScript', endpoints[1], apiKey)} /></article>
      <article id="payments"><h2>Payments API</h2><p>Use direct payments when you own the UI and want fine-grained provider control.</p><CodeBlock code={snippet('curl', endpoints[0], apiKey)} /></article>
      <article id="refunds"><h2>Refunds</h2><p>Refund full or partial payments with idempotency keys.</p><CodeBlock code={snippet('JavaScript', endpoints[2], apiKey)} /></article>
      <article id="marketplace"><h2>Marketplace</h2><p>Diapay supports Stripe Connect-like marketplace flows: vendor accounts, split payments, platform commissions, escrow, ledger, payouts and multi-currency settlement for XOF, USD, EUR and USDT.</p><CodeBlock code={snippet('TypeScript', endpoints[4], apiKey)} /></article>
      <article id="wallets"><h2>Wallets</h2><p>Internal wallets include <code>merchant_wallet</code>, <code>vendor_wallet</code>, <code>platform_wallet</code>, <code>escrow_wallet</code> and <code>reserve_wallet</code>. Each wallet tracks balance, available balance, pending balance, currency, owner, status and ledger entries.</p></article>
      <article id="ledger"><h2>Ledger</h2><p>The ledger is double-entry and append-only. Collections include <code>ledger_accounts</code>, <code>ledger_entries</code> and <code>balance_snapshots</code>; corrections use <code>refund</code>, <code>reversal</code> or <code>payout</code> entries rather than modifying history.</p></article>
      <article id="split-payments"><h2>Split Payments</h2><p>Use fixed, percentage, multi-vendor, priority and fallback split instructions. A 100,000 FCFA payment can allocate 85,000 to a seller, 10,000 to marketplace commission and 5,000 to Diapay fees.</p></article>
      <article id="escrow"><h2>Escrow</h2><p>Marketplace escrow supports held, released, refunded and disputed states with auto release, manual release and partial release through <code>/marketplace/escrow/release</code> and <code>/marketplace/escrow/refund</code>.</p></article>
      <article id="payouts"><h2>Payouts</h2><p>Move available balance to bank or mobile money destinations and track <code>pending</code>, <code>processing</code>, <code>completed</code> and <code>failed</code>.</p></article>
      <article id="mobile-money"><h2>Mobile Money</h2><p>Sandbox phone <code>70000000</code> succeeds, <code>70000001</code> fails, and forced statuses cover pending and expired flows.</p></article>
      <article id="crypto"><h2>Crypto</h2><p>Crypto sandbox simulates USDC wallet collection without moving real assets.</p></article>
      <article id="webhooks"><h2>Webhooks and idempotency</h2><p>Use <code>Idempotency-Key</code> on checkout sessions, payments, refunds and payment cancellation. Merchant webhooks are signed with <code>DiaPay-Signature: t=timestamp,v1=hmac_sha256(timestamp + '.' + rawBody)</code> and reject stale timestamps.</p><CodeBlock code={`const event = diapay.webhooks.constructEvent(rawBody, signature, process.env.DIAPAY_WEBHOOK_SECRET!);`} /></article>
      <article id="reporting"><h2>Reporting</h2><p>Merchant Dashboard Pro uses reporting endpoints for overview, revenue, payments, providers, webhook monitoring and CSV exports. Use <code>GET /api/v1/reports/overview</code>, <code>/reports/revenue</code>, <code>/reports/payments</code>, <code>/reports/providers</code>, <code>/reports/webhooks</code>, <code>/reports/export/payments.csv</code> and <code>/reports/export/ledger.csv</code>. Filters include environment, application, currency, merchant, date range and pagination. CSV exports never include full secrets, key hashes or tokens.</p><CodeBlock code={`const overview = await diapay.getReportOverview({ environment: 'test', currency: 'XOF' });\nconst csv = await diapay.exportPaymentsCsv({ environment: 'test' });`} /></article>
      <article id="sdk-js"><h2>SDK JavaScript</h2><p>The JS SDK exposes <code>checkout</code>, <code>payments</code>, <code>refunds</code>, <code>payouts</code>, <code>customers</code> and <code>webhooks</code> and <code>reports</code> modules with retries, typed errors and payload validation.</p></article>
      <article id="sdk-node"><h2>SDK Node.js</h2><p>The Node package provides helpers: <code>createPayment()</code>, <code>retrievePayment()</code>, <code>createCheckoutSession()</code>, <code>refundPayment()</code> and <code>verifyWebhook()</code>, <code>getReportOverview()</code> and <code>exportPaymentsCsv()</code>.</p></article>
      <article id="sandbox"><h2>Sandbox</h2><p>Use scenarios <code>success</code>, <code>failed</code>, <code>pending</code>, <code>expired</code>, split multi-vendeurs, escrow release, payout automatique and vendor refund testing.</p></article>
      <article id="errors"><h2>Error Codes</h2><div className="grid"><span><b>invalid_api_key</b> — missing or malformed key.</span><span><b>invalid_amount</b> — amount must be a positive integer.</span><span><b>payment_failed</b> — provider declined the charge.</span><span><b>webhook_delivery_failed</b> — endpoint failed after retries.</span></div></article>
      <article id="changelog"><h2>Changelog</h2><p><b>2026-05-30</b> — Independent Diapay developer platform, SDK modules, playground, code generator and sandbox guides.</p></article>

      <article className="playground"><h2>API Playground & Code Generator</h2><div className="controls"><input value={apiKey} onChange={(event) => setApiKey(event.target.value)} /><select value={endpointIndex} onChange={(event) => setEndpointIndex(Number(event.target.value))}>{endpoints.map((item, index) => <option value={index} key={item.path}>{item.name}</option>)}</select><select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>{languages.map((item) => <option key={item}>{item}</option>)}</select><button onClick={runDemo}>Send Test Request</button></div><h3>Request</h3><CodeBlock code={code} /><h3>Response</h3><CodeBlock code={response || '{\n  "status": "ready",\n  "hint": "Click Send Test Request"\n}'} /></article>
    </section>
  <section><h2>Ledger, wallets and balances</h2><p>Iteration 5 adds double-entry ledger endpoints, wallet views and balance summaries: GET /api/v1/wallets, GET /api/v1/ledger/accounts, GET /api/v1/ledger/transactions and GET /api/v1/balances. Data is still in-memory and not production-ready; no real settlements or payouts are executed.</p></section><section><h2>Provider Adapter Architecture</h2><p>Diapay now exposes provider discovery, explicit mock scenarios, and provider webhook parsing endpoints while preserving /api/v1 compatibility.</p><ul><li>GET /api/v1/providers</li><li>GET /api/v1/providers/:provider/capabilities</li><li>POST /api/v1/providers/simulate</li><li>POST /api/v1/webhooks/providers/:provider</li></ul></section></main>;
}

