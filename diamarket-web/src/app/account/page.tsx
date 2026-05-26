import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/ui';

export default async function AccountPage() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in?redirect_url=/account');
  const orders = await api.getOrders();
  return <div className='space-y-4'><h1 className='text-2xl font-bold'>Mon compte</h1><div className='rounded bg-white p-4 shadow'><p>Profil client connecté</p></div><h2 className='text-xl font-semibold'>Historique commandes</h2>{orders.map(o=><div key={o.id} className='rounded bg-white p-4 shadow'><p>{o.id} - <StatusBadge status={o.status}/></p><p>Total: {o.totalFcfa} FCFA</p><p>Tracking: {o.trackingNumber ?? 'N/A'}</p></div>)}</div>;
}
