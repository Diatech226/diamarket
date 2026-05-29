'use client';

import { useEffect, useMemo, useState } from 'react';

type Session = { id: string; merchant: string; amount: number; currency: string; status: string; checkoutUrl: string; successUrl: string; cancelUrl: string; expiresAt: string; items: Array<{ name: string; quantity?: number; amount?: number }> };

const API_BASE_URL = process.env.NEXT_PUBLIC_DIAPAY_API_URL ?? 'http://localhost:5100';

export default function CheckoutPage({ params }: { params: { sessionId: string } }) {
  const [session, setSession] = useState<Session | null>(null);
  const [method, setMethod] = useState('bank-card');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [phone, setPhone] = useState('70000000');
  const [forceStatus, setForceStatus] = useState('');
  const [message, setMessage] = useState('');
  const amount = useMemo(() => session ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: session.currency, maximumFractionDigits: session.currency === 'XOF' ? 0 : 2 }).format(session.amount) : '', [session]);

  useEffect(() => { fetch(`${API_BASE_URL}/api/v1/checkout/sessions/${params.sessionId}`).then((r) => r.json()).then(setSession).catch(() => setMessage('Session introuvable')); }, [params.sessionId]);

  async function complete() {
    setMessage('Simulation en cours…');
    const response = await fetch(`${API_BASE_URL}/api/v1/checkout/sessions/${params.sessionId}/complete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ method, cardNumber, phone, forceStatus: forceStatus || undefined }) });
    const result = await response.json();
    if (!response.ok) return setMessage(result?.error?.message ?? 'Paiement refusé');
    setSession(result.session);
    if (result.payment.status === 'succeeded') window.location.assign(result.session.successUrl);
    else setMessage(`${result.payment.status}: ${result.payment.failureMessage ?? 'scénario sandbox'}`);
  }

  async function cancel() {
    await fetch(`${API_BASE_URL}/api/v1/checkout/sessions/${params.sessionId}/cancel`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    window.location.assign(session?.cancelUrl ?? '/cancel');
  }

  if (!session) return <main className="shell"><section className="card">Chargement du checkout… {message}</section></main>;

  return (
    <main className="shell">
      <div className="grid grid-2">
        <section className="card">
          <span className="pill">Checkout hébergé sécurisé</span>
          <h1>{session.merchant}</h1>
          <div className="row"><span>Statut session</span><strong>{session.status}</strong></div>
          <div className="row"><span>Expire le</span><strong>{new Date(session.expiresAt).toLocaleString('fr-FR')}</strong></div>
          <hr />
          {(session.items?.length ? session.items : [{ name: 'Paiement sandbox', quantity: 1, amount: session.amount }]).map((item) => <div className="row" key={item.name}><span>{item.quantity ?? 1} × {item.name}</span><strong>{amount}</strong></div>)}
          <h2>Total {amount}</h2>
        </section>
        <section className="card">
          <h2>Méthode de paiement test</h2>
          <div className="methods">
            {['bank-card', 'mobile-money', 'crypto'].map((value) => <label className="method" key={value}><input type="radio" checked={method === value} onChange={() => setMethod(value)} />{value}</label>)}
          </div>
          {method === 'bank-card' && <><label>Carte sandbox</label><input className="input" value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} /><p className="muted">Succès: 4242 4242 4242 4242 · Échec: 4000 0000 0000 0002</p></>}
          {method === 'mobile-money' && <><label>Téléphone mobile money</label><input className="input" value={phone} onChange={(event) => setPhone(event.target.value)} /><p className="muted">Succès: 70000000 · Échec: 70000001</p></>}
          {method === 'crypto' && <p className="muted">Simulation USDC sandbox sans transfert réel.</p>}
          <label>Scénario forcé</label><select className="input" value={forceStatus} onChange={(event) => setForceStatus(event.target.value)}><option value="">Automatique</option><option value="pending">Paiement en attente</option><option value="failed">Paiement échoué</option><option value="expired">Paiement expiré</option></select>
          <div className="row" style={{ marginTop: 18 }}><button className="btn btn-primary" onClick={complete}>Payer {amount}</button><button className="btn btn-danger" onClick={cancel}>Annuler</button></div>
          {message && <p className="muted">{message}</p>}
        </section>
      </div>
    </main>
  );
}
