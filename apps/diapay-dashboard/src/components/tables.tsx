import Link from 'next/link';
import { maskSecret } from '../lib/api';
import type { ApiKey, CheckoutSession, Customer, Payment, Payout, Refund, Transaction, WebhookEndpoint, WebhookEvent, WebhookLog } from '../lib/types';
import { Badge, Button, Card, EmptyState, formatMoney } from './ui';

export function PaymentsTable({ rows }: { rows: Payment[] }) {
  if (!rows.length) return <EmptyState title="Aucun paiement" description="Les paiements créés via l’API Diapay apparaîtront ici." />;
  return <Card className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-slate-400"><tr>{['Paiement','Client','Méthode','Montant','Statut','Provider',''].map(h => <th className="pb-4" key={h}>{h}</th>)}</tr></thead><tbody className="divide-y">{rows.map(p => <tr key={p.id}><td className="py-4"><Link className="font-semibold text-ocean" href={`/payments/${p.id}`}>{p.reference}</Link><p className="text-xs text-slate-400">{p.id}</p></td><td>{p.customer}<p className="text-xs text-slate-400">{p.email}</p></td><td>{p.method}</td><td className="font-semibold">{formatMoney(p.amount,p.currency)}</td><td><Badge value={p.status}/></td><td>{p.provider}</td><td>{p.refundable ? <Button variant="secondary">Rembourser</Button> : <span className="text-xs text-slate-400">—</span>}</td></tr>)}</tbody></table></Card>;
}

export function TransactionsTable({ rows }: { rows: Transaction[] }) {
  return <Card className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-slate-400"><tr>{['Transaction','Statut','Méthode','Date','Brut','Frais','Net'].map(h => <th className="pb-4" key={h}>{h}</th>)}</tr></thead><tbody className="divide-y">{rows.map(t => <tr key={t.id}><td className="py-4 font-semibold">{t.id}<p className="text-xs text-slate-400">{t.reference}</p></td><td><Badge value={t.status}/></td><td>{t.method}</td><td>{new Date(t.createdAt).toLocaleDateString('fr-FR')}</td><td>{formatMoney(t.amount,t.currency)}</td><td>{formatMoney(t.fee,t.currency)}</td><td className="font-semibold">{formatMoney(t.net,t.currency)}</td></tr>)}</tbody></table></Card>;
}

export function ApiKeysTable({ rows }: { rows: ApiKey[] }) {
  return <Card className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-slate-400"><tr>{['Nom','Clé secrète masquée','Env.','Rôle','Dernier usage','Statut',''].map(h => <th className="pb-4" key={h}>{h}</th>)}</tr></thead><tbody className="divide-y">{rows.map(k => <tr key={k.id}><td className="py-4 font-semibold">{k.name}<p className="text-xs text-slate-400">Créée {k.createdAt}</p></td><td className="font-mono">{maskSecret(k.key)}</td><td><Badge value={k.environment}/></td><td>{k.role}</td><td>{k.lastUsed}</td><td><Badge value={k.active ? 'active' : 'canceled'}/></td><td><Button variant="danger">Révoquer</Button></td></tr>)}</tbody></table></Card>;
}

export function WebhooksTable({ rows, logs }: { rows: WebhookEndpoint[]; logs: WebhookLog[] }) {
  return <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"><Card>{rows.map(w => <div key={w.id} className="border-b py-4 last:border-0"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold">{w.url}</p><p className="mt-2 font-mono text-xs text-slate-500">Secret: {maskSecret(w.secret)}</p><div className="mt-3 flex flex-wrap gap-2">{w.events.map(e => <span className="rounded-full bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800" key={e}>{e}</span>)}</div></div><Badge value={w.status}/></div><p className="mt-3 text-sm text-slate-500">Taux livraison {w.successRate}%</p></div>)}</Card><Card><h2 className="mb-4 font-semibold">Logs livraison</h2>{logs.map(log => <div key={log.id} className="flex items-center justify-between border-b py-3 last:border-0"><div><p className="text-sm font-semibold">{log.event}</p><p className="text-xs text-slate-400">{log.createdAt} · {log.attempts} tentative(s)</p></div><Badge value={log.status}/></div>)}</Card></div>;
}

export function CustomersTable({ rows }: { rows: Customer[] }) {
  return <Card className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-slate-400"><tr>{['Client','Pays','Paiements','Total dépensé','Créé'].map(h => <th className="pb-4" key={h}>{h}</th>)}</tr></thead><tbody className="divide-y">{rows.map(c => <tr key={c.id}><td className="py-4 font-semibold">{c.name}<p className="text-xs text-slate-400">{c.email}</p></td><td>{c.country}</td><td>{c.payments}</td><td>{formatMoney(c.totalSpend, c.country === 'GH' ? 'USD' : 'XOF')}</td><td>{c.createdAt}</td></tr>)}</tbody></table></Card>;
}

export function RefundsTable({ rows }: { rows: Refund[] }) {
  return <Card className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-slate-400"><tr>{['Refund','Paiement','Montant','Statut','Raison','Date'].map(h => <th className="pb-4" key={h}>{h}</th>)}</tr></thead><tbody className="divide-y">{rows.map(r => <tr key={r.id}><td className="py-4 font-semibold">{r.id}</td><td>{r.paymentId}</td><td>{formatMoney(r.amount,r.currency)}</td><td><Badge value={r.status}/></td><td>{r.reason}</td><td>{r.createdAt}</td></tr>)}</tbody></table></Card>;
}

export function PayoutsTable({ rows }: { rows: Payout[] }) {
  return <Card className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-slate-400"><tr>{['Payout','Destination','Montant','Statut','Arrivée estimée'].map(h => <th className="pb-4" key={h}>{h}</th>)}</tr></thead><tbody className="divide-y">{rows.map(p => <tr key={p.id}><td className="py-4 font-semibold">{p.id}</td><td>{p.destination}</td><td>{formatMoney(p.amount,p.currency)}</td><td><Badge value={p.status}/></td><td>{p.arrivalDate}</td></tr>)}</tbody></table></Card>;
}

export function CheckoutSessionsTable({ rows }: { rows: CheckoutSession[] }) {
  if (!rows.length) return <EmptyState title="Aucune session checkout" description="Les sessions créées via Stripe-like Checkout apparaîtront ici." />;
  return <Card className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-slate-400"><tr>{['Session','Marchand','Client','Montant','Statut','Expiration','Paiement'].map(h => <th className="pb-4" key={h}>{h}</th>)}</tr></thead><tbody className="divide-y">{rows.map(s => <tr key={s.id}><td className="py-4"><Link className="font-semibold text-ocean" href={`/checkout-sessions/${s.id}`}>{s.id}</Link><p className="text-xs text-slate-400">{s.items.length} item(s)</p></td><td>{s.merchant}</td><td>{s.customer?.name ?? '—'}<p className="text-xs text-slate-400">{s.customer?.email}</p></td><td className="font-semibold">{formatMoney(s.amount,s.currency)}</td><td><Badge value={s.status}/></td><td>{new Date(s.expiresAt).toLocaleString('fr-FR')}</td><td>{s.payment ?? '—'}</td></tr>)}</tbody></table></Card>;
}

export function WebhookEventsList({ events }: { events: WebhookEvent[] }) {
  return <Card><h2 className="mb-4 font-semibold">Événements webhook liés</h2>{events.map(event => <div key={event.id} className="border-b py-4 last:border-0"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold">{event.type}</p><p className="text-xs text-slate-400">{event.id} · {new Date(event.createdAt).toLocaleString('fr-FR')}</p></div><Badge value={event.attempts.some(a => a.status === 'delivered') ? 'delivered' : 'pending'} /></div><div className="mt-2 flex flex-wrap gap-2">{event.attempts.map(attempt => <span className="rounded-full bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800" key={attempt.id}>{attempt.status} {attempt.statusCode ?? ''}</span>)}</div></div>)}</Card>;
}
