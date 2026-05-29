'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { StatusBadge } from '@/components/ui';

export default function OrderPaymentPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState('Chargement du statut paiement...');

  useEffect(() => {
    api.getPaymentStatus(params.id).then((data) => { setOrder(data); setMessage(''); }).catch(() => setMessage('Statut paiement indisponible pour le moment.'));
  }, [params.id]);

  const retry = async () => {
    setMessage('Création de la session Diapay...');
    try {
      const session = await api.createDiapayCheckoutSession(params.id);
      window.location.assign(session.checkoutUrl);
    } catch {
      setMessage('Impossible de relancer le paiement Diapay.');
    }
  };

  return <div className='mx-auto max-w-2xl space-y-4 rounded-3xl bg-white p-8 shadow-sm'><h1 className='text-3xl font-bold'>Paiement commande {params.id}</h1>{message && <p className='rounded-xl bg-slate-50 p-3 text-slate-600'>{message}</p>}{order && <><p>Statut commande: <StatusBadge status={order.status} /></p><p>Statut paiement: <StatusBadge status={order.paymentStatus ?? 'unpaid'} /></p><p>Provider: {order.paymentProvider ?? 'cash_on_delivery'}</p>{order.diapaySessionId && <p>Session Diapay: {order.diapaySessionId}</p>}{order.diapayPaymentId && <p>Paiement Diapay: {order.diapayPaymentId}</p>}{order.paymentStatus !== 'paid' && <button onClick={retry} className='rounded-full bg-[#556B2F] px-5 py-3 text-white'>Payer avec Diapay</button>}</>}</div>;
}
