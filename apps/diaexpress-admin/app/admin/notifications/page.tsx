import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { apiClient } from '@/lib/api/client';

async function fetchNotifications(){
  try { const data = await apiClient<{items:any[]}>('/api/admin/notifications', { cache: 'no-store' }); return data.items || []; } catch { return []; }
}
export default async function AdminNotificationsPage(){
  const items = await fetchNotifications();
  return <div className="page-stack"><PageHeader title="Notifications admin" description="Nouveaux devis, incidents, retards, livraisons échouées et paiements reçus." />
    <div className="panel"><div className="panel__title">Flux opérationnel</div>{!items.length?<div className="empty-state">Aucune notification admin.</div>:items.map((n)=><div key={n._id} className="search-result"><strong>{n.title}</strong><span>{n.message}</span><small>{n.eventType} · {n.channel}</small>{n.relatedType==='Shipment'?<Link href={`/admin/shipments/${n.relatedId}`}>Ouvrir shipment</Link>:null}</div>)}</div>
  </div>;
}
