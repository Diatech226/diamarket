'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { cmsService } from '@/services/cms-service';
import type { ApiCollection, OrderAdminItem, OrderStatus, PaymentStatus, ShipmentStatus } from '@/types/cms';

const ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'paid', 'failed', 'cancelled', 'expired', 'refunded'];
const SHIPMENT_STATUSES: ShipmentStatus[] = ['pending', 'created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned', 'cancelled'];

const money = (value?: number, currency = 'FCFA') => `${Number(value || 0).toLocaleString('fr-FR')} ${currency}`;
const person = (value: OrderAdminItem['customer']) => typeof value === 'object' && value ? value.name || value.email || value._id : String(value || '—');

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderAdminItem[]>([]);
  const [selected, setSelected] = useState<OrderAdminItem | null>(null);
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '', status: '', paymentStatus: '', shipmentStatus: '' });
  const [meta, setMeta] = useState<ApiCollection<OrderAdminItem>['meta']>();
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setNotice(null);
    try {
      const response = await cmsService.getOrders(query);
      setOrders(response.data);
      setMeta(response.meta);
    } catch (error) {
      setNotice({ type: 'error', text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { void loadOrders(); }, [loadOrders]);

  const loadDetail = async (id: string) => {
    setAction(`detail:${id}`);
    try {
      const response = await cmsService.getOrder(id);
      setSelected(response.data);
    } catch (error) {
      setNotice({ type: 'error', text: (error as Error).message });
    } finally { setAction(''); }
  };

  const runAction = async (label: string, confirmation: string, callback: () => Promise<unknown>) => {
    if (!window.confirm(confirmation)) return;
    setAction(label);
    setNotice(null);
    try {
      await callback();
      setNotice({ type: 'success', text: 'Action exécutée avec succès.' });
      if (selected?._id) {
        const response = await cmsService.getOrder(selected._id);
        setSelected(response.data);
      }
      await loadOrders();
    } catch (error) {
      setNotice({ type: 'error', text: (error as Error).message });
    } finally { setAction(''); }
  };

  const rows = useMemo(() => orders.map((order) => ({
    id: order._id,
    searchableText: `${order._id} ${person(order.customer)} ${order.status} ${order.paymentStatus} ${order.shipmentStatus}`,
    cells: [
      <button key="id" onClick={() => loadDetail(order._id)} className="font-mono text-xs text-olive-700 underline">{order._id.slice(-8)}</button>,
      person(order.customer),
      <StatusBadge key="status" status={order.status ?? 'pending'} />,
      <StatusBadge key="payment" status={order.paymentStatus ?? 'pending'} />,
      <StatusBadge key="shipment" status={order.shipmentStatus ?? 'pending'} />,
      money(order.totalAmount, order.currency),
      order.paymentMethod ?? order.paymentProvider ?? '—',
      order.createdAt ? new Date(order.createdAt).toLocaleString('fr-FR') : '—',
      <div key="actions" className="flex flex-wrap gap-2">
        <button disabled={!!action} onClick={() => loadDetail(order._id)} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-50">Détail</button>
        <select disabled={!!action} value={order.status ?? 'pending'} onChange={(event) => runAction(`status:${order._id}`, `Confirmer le passage au statut ${event.target.value} ?`, () => cmsService.updateOrderStatus(order._id, event.target.value))} className="rounded-lg border px-2 py-1 text-xs disabled:opacity-50">{ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select>
      </div>,
    ],
  })), [orders, action]);

  return <div className="space-y-6"><PageHeader title="Commandes" subtitle="Gestion admin des commandes, paiements Diapay et livraisons DiaExpress" />
    {notice && <p className={`rounded-xl p-3 text-sm ${notice.type === 'error' ? 'bg-red-500/10 text-red-700' : 'bg-emerald-500/10 text-emerald-700'}`}>{notice.text}</p>}
    <div className="grid gap-3 rounded-2xl border p-4 md:grid-cols-5 dark:border-zinc-800">
      <input value={query.search} onChange={(e) => setQuery({ ...query, page: 1, search: e.target.value })} placeholder="Recherche commande, client, Diapay…" className="rounded-xl border px-3 py-2 text-sm md:col-span-2" />
      <select value={query.status} onChange={(e) => setQuery({ ...query, page: 1, status: e.target.value })} className="rounded-xl border px-3 py-2 text-sm"><option value="">Tous statuts commande</option>{ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
      <select value={query.paymentStatus} onChange={(e) => setQuery({ ...query, page: 1, paymentStatus: e.target.value })} className="rounded-xl border px-3 py-2 text-sm"><option value="">Tous paiements</option>{PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
      <select value={query.shipmentStatus} onChange={(e) => setQuery({ ...query, page: 1, shipmentStatus: e.target.value })} className="rounded-xl border px-3 py-2 text-sm"><option value="">Toutes livraisons</option>{SHIPMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
    </div>
    {loading ? <p>Chargement des commandes…</p> : <><DataTable headers={['Commande', 'Client', 'Statut', 'Paiement', 'Livraison', 'Total', 'Mode paiement', 'Date', 'Actions']} rows={rows} enableBulkActions={false} />{meta && <div className="flex justify-end gap-3 text-sm"><button disabled={query.page <= 1 || loading} onClick={() => setQuery({ ...query, page: query.page - 1 })}>Précédent</button><span>Page {meta.page}/{meta.totalPages} — {meta.total} commandes</span><button disabled={query.page >= meta.totalPages || loading} onClick={() => setQuery({ ...query, page: query.page + 1 })}>Suivant</button></div>}</>}
    {selected && <aside className="rounded-2xl border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">Détail commande {selected._id}</h2><p className="text-sm text-zinc-500">Client : {person(selected.customer)} — Total : {money(selected.totalAmount, selected.currency)}</p></div><button onClick={() => setSelected(null)} className="rounded-lg border px-3 py-2 text-xs">Fermer</button></div><div className="mt-4 grid gap-4 lg:grid-cols-3"><section className="space-y-2 text-sm"><h3 className="font-semibold">Client & livraison</h3><p>{person(selected.customer)}</p><p>{selected.address ? `${selected.address.line1 ?? ''} ${selected.address.city}, ${selected.address.country} — ${selected.address.phone}` : 'Adresse indisponible'}</p><p>Statut commande : <StatusBadge status={selected.status ?? 'pending'} /></p><p>Paiement : <StatusBadge status={selected.paymentStatus ?? 'pending'} /></p><p>Livraison : <StatusBadge status={selected.shipmentStatus ?? 'pending'} /></p></section><section className="space-y-2 text-sm"><h3 className="font-semibold">Paiement & tracking</h3><p>Mode : {selected.paymentMethod ?? selected.paymentProvider ?? '—'}</p><p>Réf. Diapay session : {selected.diapaySessionId ?? '—'}</p><p>Réf. Diapay paiement : {selected.diapayPaymentId ?? '—'}</p><p>Tracking DiaExpress : {selected.shipment?.trackingNumber ?? '—'}</p><div className="flex flex-wrap gap-2 pt-2"><button disabled={!!action} onClick={() => runAction(`payment:${selected._id}`, 'Vérifier le statut paiement ?', () => cmsService.verifyDiapayPayment(selected._id))} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-50">Vérifier paiement</button><button disabled={!!action} onClick={() => runAction(`ship:${selected._id}`, 'Créer une expédition DiaExpress si autorisée ?', () => cmsService.createShipment(selected._id))} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-50">Créer expédition</button><button disabled={!!action} onClick={() => runAction(`sync:${selected._id}`, 'Synchroniser le tracking DiaExpress ?', () => cmsService.syncShipment(selected._id))} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-50">Synchroniser</button><button disabled={!!action || !['pending','confirmed','processing'].includes(selected.status ?? '')} onClick={() => runAction(`cancel:${selected._id}`, 'Annuler cette commande ?', () => cmsService.updateOrderStatus(selected._id, 'cancelled'))} className="rounded-lg border px-3 py-2 text-xs text-red-700 disabled:opacity-50">Annuler</button></div></section><section className="space-y-2 text-sm"><h3 className="font-semibold">Timeline</h3>{[...(selected.paymentEvents ?? []).map((event) => ({ label: `${event.type} (${event.status})`, date: event.receivedAt })), ...(selected.shipment?.history ?? []).map((event) => ({ label: `DiaExpress ${event.status} — ${event.message ?? ''}`, date: event.occurredAt }))].length ? [...(selected.paymentEvents ?? []).map((event) => ({ label: `${event.type} (${event.status})`, date: event.receivedAt })), ...(selected.shipment?.history ?? []).map((event) => ({ label: `DiaExpress ${event.status} — ${event.message ?? ''}`, date: event.occurredAt }))].map((event, index) => <p key={index}>• {event.date ? new Date(event.date).toLocaleString('fr-FR') : '—'} — {event.label}</p>) : <p className="text-zinc-500">Aucun événement enregistré.</p>}</section></div><div className="mt-4 overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="text-left text-zinc-500"><th className="py-2">Produit</th><th>Quantité</th><th>Prix</th><th>Total</th></tr></thead><tbody>{(selected.items ?? []).map((item, index) => <tr key={index} className="border-t"><td className="py-2">{item.name}</td><td>{item.quantity}</td><td>{money(item.unitPrice, selected.currency)}</td><td>{money(item.totalPrice, selected.currency)}</td></tr>)}</tbody></table></div></aside>}
  </div>;
}
