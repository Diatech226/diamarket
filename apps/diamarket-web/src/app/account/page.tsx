import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/ui';

export default async function AccountPage() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in?redirect_url=/account');
  const orders = await api.getOrders();
  return <div className='space-y-5'><h1 className='text-2xl font-bold'>Mon compte client</h1><div className='grid gap-4 md:grid-cols-3'>{['Commandes','Wishlist','Notifications'].map(card=><div key={card} className='rounded-2xl bg-white p-4 shadow-sm'><p className='font-semibold'>{card}</p></div>)}</div><h2 className='text-xl font-semibold'>Dashboard commandes</h2>{orders.map(o=><div key={o.id} className='rounded-2xl bg-white p-4 shadow-sm'><p>{o.id} - <StatusBadge status={o.status}/></p><p>Total: {o.totalFcfa} FCFA</p><p>Tracking: {o.trackingNumber ?? 'N/A'}</p><p className='text-sm text-slate-500'>Timeline: Préparation → Expédition → En transit → Livré</p><button className='mt-2 rounded-full border px-3 py-1 text-sm'>Télécharger facture</button></div>)}</div>;
}
