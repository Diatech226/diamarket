'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { cmsService } from '@/services/cms-service';
import type { OrderAdminItem } from '@/types/cms';

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderAdminItem[]>([]);
  const [selected, setSelected] = useState<OrderAdminItem | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    cmsService.getOrders().then(setOrders).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const verifyPayment = async (order: OrderAdminItem) => {
    setMessage('Vérification paiement serveur...');
    try {
      const response = await cmsService.verifyDiapayPayment(order._id) as { data?: OrderAdminItem };
      setSelected(response.data ?? order);
      setMessage('Statut paiement récupéré depuis Diamarket API.');
    } catch {
      setMessage('Impossible de vérifier ce paiement pour le moment.');
    }
  };

  const changeStatus = async (order: OrderAdminItem, status: string) => {
    setMessage('Mise à jour du statut…');
    try {
      await cmsService.updateOrderStatus(order._id, status);
      setOrders(await cmsService.getOrders());
      setMessage('Statut commande mis à jour.');
    } catch (e) {
      setMessage((e as Error).message);
    }
  };

  const rows = orders.map((order) => ({
    id: order._id,
    searchableText: `${order._id} ${order.paymentProvider} ${order.paymentStatus} ${order.diapaySessionId} ${order.diapayPaymentId}`,
    cells: [
      order._id,
      order.status ?? 'pending',
      order.paymentProvider ?? 'cash_on_delivery',
      order.paymentStatus ?? 'unpaid',
      order.diapaySessionId ?? '—',
      order.diapayPaymentId ?? '—',
      <span key={order._id} className='flex gap-2'><button onClick={() => verifyPayment(order)} className='rounded-lg border px-3 py-2 text-xs'>Vérifier paiement</button><select className='rounded-lg border px-2 py-1 text-xs' value={order.status ?? 'pending'} onChange={(e)=>changeStatus(order,e.target.value)}>{['pending','confirmed','paid','processing','shipped','delivered','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}</select></span>,
    ],
  }));

  return <div className='space-y-6'><PageHeader title='Commandes & Paiements' subtitle='Suivi Diapay, paiement à la livraison et actions de vérification serveur' />{error && <p className='rounded-xl bg-red-500/10 p-3 text-sm text-red-700'>{error}</p>}{message && <p className='rounded-xl bg-blue-500/10 p-3 text-sm'>{message}</p>}<div className='grid gap-4 lg:grid-cols-2'><div className='rounded-2xl border p-4 dark:border-zinc-800'><h3 className='mb-3 text-sm font-semibold'>Détail paiement</h3>{selected ? <dl className='space-y-2 text-sm'><div><dt className='font-medium'>Commande</dt><dd>{selected._id}</dd></div><div><dt className='font-medium'>Provider</dt><dd>{selected.paymentProvider ?? 'cash_on_delivery'}</dd></div><div><dt className='font-medium'>Statut</dt><dd>{selected.paymentStatus ?? 'unpaid'}</dd></div><div><dt className='font-medium'>Session Diapay</dt><dd>{selected.diapaySessionId ?? '—'}</dd></div><div><dt className='font-medium'>Paiement Diapay</dt><dd>{selected.diapayPaymentId ?? '—'}</dd></div><div><dt className='font-medium'>Méthode</dt><dd>{selected.paymentMethod ?? '—'}</dd></div></dl> : <p className='text-sm text-zinc-500'>Sélectionnez “Vérifier paiement”.</p>}</div><div className='rounded-2xl border p-4 dark:border-zinc-800'><h3 className='mb-3 text-sm font-semibold'>Rappels sécurité</h3><ul className='space-y-2 text-sm'><li>✅ Validation payée uniquement après webhook Diapay signé.</li><li>✅ Le frontend n’utilise jamais la secretKey.</li><li>✅ Le paiement à la livraison reste disponible.</li></ul></div></div>{loading ? <p>Chargement des commandes…</p> : rows.length ? <DataTable headers={['Commande', 'Statut', 'Provider', 'Payment status', 'Diapay session', 'Diapay payment', 'Action rapide']} rows={rows} /> : <p className='rounded-xl border p-4 text-sm text-zinc-500'>Aucune commande.</p>}</div>;
}
