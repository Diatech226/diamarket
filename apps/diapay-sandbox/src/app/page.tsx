'use client';

import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function pay() {
    setLoading(true);
    setError('');
    const response = await fetch('/api/checkout-session', { method: 'POST' });
    const session = await response.json();
    setLoading(false);
    if (!response.ok) return setError(session?.error?.message ?? 'Création session impossible');
    window.location.assign(session.checkoutUrl);
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
          <h2>Logs webhook reçus</h2>
          <p className="muted">Endpoint de test: <code>/api/sandbox-webhook</code>. Enregistrez-le dans l’API Diapay pour voir les livraisons.</p>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#0f172a', color: '#d1fae5', padding: 16, borderRadius: 18 }}>curl -X POST http://localhost:5100/api/v1/webhooks \
  -H 'Content-Type: application/json' \
  -d '{'{'}"url":"http://localhost:3102/api/sandbox-webhook","events":["checkout.session.completed","payment.succeeded","payment.failed","payment.cancelled","payment.expired"]{'}'}'</pre>
        </section>
      </div>
    </main>
  );
}
