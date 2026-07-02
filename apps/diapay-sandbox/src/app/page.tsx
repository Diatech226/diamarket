'use client';

import { useState } from 'react';

const scenarios = [
  { id: 'payment-success', label: 'Paiement réussi', type: 'payment', forceStatus: '' },
  { id: 'payment-failed', label: 'Paiement échoué', type: 'payment', forceStatus: 'failed' },
  { id: 'payment-pending', label: 'Paiement pending', type: 'payment', forceStatus: 'pending' },
  { id: 'payment-expired', label: 'Paiement expiré', type: 'payment', forceStatus: 'expired' },
  { id: 'payment-requires-action', label: 'Action requise', type: 'payment', forceStatus: 'requires_action' },
  { id: 'provider-timeout', label: 'Provider timeout', type: 'payment' },
  { id: 'insufficient-funds', label: 'Fonds insuffisants', type: 'payment' },
  { id: 'refund-success', label: 'Refund success', type: 'refund' },
  { id: 'refund-failed', label: 'Refund failed', type: 'refund' },
  { id: 'refund', label: 'Remboursement', type: 'refund' },
  { id: 'webhook', label: 'Webhook', type: 'webhook' },
  { id: 'payout', label: 'Payout', type: 'payout' },
  { id: 'simple-marketplace-payment', label: 'Marketplace simple', type: 'marketplace' },
  { id: 'multi-vendor-split', label: 'Split multi-vendeurs', type: 'marketplace' },
  { id: 'escrow-release', label: 'Escrow release', type: 'marketplace' },
  { id: 'automatic-payout', label: 'Payout automatique', type: 'marketplace' },
  { id: 'vendor-refund', label: 'Refund vendeur', type: 'marketplace' },
  { id: 'mobile-money', label: 'Mobile Money', type: 'payment', method: 'mobile-money', phone: '70000000' },
  { id: 'crypto', label: 'Crypto', type: 'payment', method: 'crypto' },
  { id: 'marketplace-simple-payment', label: 'Marketplace paiement simple', type: 'marketplace' },
  { id: 'marketplace-multi-vendor', label: 'Split multi-vendeurs', type: 'marketplace' },
  { id: 'marketplace-escrow-release', label: 'Escrow release', type: 'marketplace' },
  { id: 'marketplace-auto-payout', label: 'Payout automatique', type: 'marketplace' },
  { id: 'marketplace-vendor-refund', label: 'Refund vendeur', type: 'marketplace' },
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  async function pay() {
    setLoading(true);
    setError('');
    const response = await fetch('/api/checkout-session', { method: 'POST' });
    const session = await response.json();
    setLoading(false);
    if (!response.ok) return setError(session?.error?.message ?? 'Création session impossible');
    window.location.assign(session.checkoutUrl);
  }

  async function runScenario(id: string) {
    setLoading(true);
    const response = await fetch('/api/scenario', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    const data = await response.json();
    setLoading(false);
    setResult(JSON.stringify(data, null, 2));
  }

  return (
    <main className="shell">
      <div className="grid grid-2">
        <section className="card">
          <span className="pill">Boutique sandbox merchant</span>
          <h1>Produit test Diapay</h1>
          <p className="muted">Crée une Checkout Session côté backend sandbox puis redirige vers le checkout hébergé.</p>
          <div className="row"><strong>Pack API + Checkout</strong><strong>25 000 XOF</strong></div>
          <button className="btn btn-primary" onClick={pay} disabled={loading}>{loading ? 'Création…' : 'Payer avec Diapay'}</button>
          {error && <p style={{ color: '#be123c' }}>{error}</p>}
        </section>
        <section className="card">
          <h2>Scénarios sandbox améliorés</h2>
          <p className="muted">Simulez success, failed, pending, expired, remboursement, webhook, payout, mobile money, crypto et scénarios marketplace (split, escrow, payout auto, refund vendeur) sans argent réel.</p>
          <div className="scenario-grid">{scenarios.map((scenario) => <button key={scenario.id} className="btn btn-secondary" onClick={() => runScenario(scenario.id)}>{scenario.label}</button>)}</div>
        </section>
        <section className="card">
          <h2>Logs webhook reçus</h2>
          <p className="muted">Endpoint de test: <code>/api/sandbox-webhook</code>. Événements: payment.succeeded, payment.failed, checkout.completed, refund.succeeded, payout.completed.</p>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#0f172a', color: '#d1fae5', padding: 16, borderRadius: 18 }}>curl -X POST http://localhost:5100/api/v1/webhooks \
  -H 'Content-Type: application/json' \
  -d '{'{'}"url":"http://localhost:3102/api/sandbox-webhook","events":["payment.succeeded","payment.failed","checkout.completed","refund.succeeded","payout.completed"]{'}'}'</pre>
        </section>
        <section className="card"><h2>Webhook reliability scenarios</h2><p className="muted">Scénarios: provider webhook success, duplicate, failed signature, merchant success, timeout, retry, refund webhook et payment paid webhook. Les résultats affichent event id, signature générée, payload, delivery status, tentatives et résultat final.</p></section>
        <section className="card"><h2>Résultat scénario</h2><pre style={{ whiteSpace: 'pre-wrap', background: '#0f172a', color: '#d1fae5', padding: 16, borderRadius: 18 }}>{result || 'Cliquez un scénario pour voir la réponse sandbox.'}</pre></section>
      </div>
    </main>
  );
}

