import React from 'react';
import Link from 'next/link';
import { myNotifications, markRead } from '../../src/api/notifications';

export default function AccountNotifications(){
  const [items,setItems]=React.useState([]); const [unread,setUnread]=React.useState(false); const [loading,setLoading]=React.useState(true);
  const load=React.useCallback(async ()=>{ setLoading(true); const token=typeof window!=='undefined'?localStorage.getItem('diaexpress_token')||'':''; const data=await myNotifications(token, unread); setItems(data.items||data.notifications||[]); setLoading(false); }, [unread]);
  React.useEffect(()=>{load();},[load]);
  async function read(id){ const token=localStorage.getItem('diaexpress_token')||''; await markRead(token,id); await load(); }
  const linkFor=(n)=> n.relatedType==='Quote'?`/account/quotes/${n.relatedId}`:n.relatedType==='Shipment'?`/account/shipments/${n.relatedId}`:'#';
  return <main className="dx-dashboard-shell"><section className="dx-dashboard"><header className="dx-dashboard__header"><span className="dx-dashboard__eyebrow">Centre notifications</span><h1 className="dx-dashboard__title">Notifications</h1><p className="dx-dashboard__subtitle">Suivez devis, expéditions, incidents et paiements sans appeler le support.</p><button className="dx-button dx-button--outline" onClick={()=>setUnread(!unread)}>{unread?'Tout afficher':'Non lues'}</button></header>{loading?<div className="dx-empty">Chargement…</div>:!items.length?<div className="dx-empty">Aucune notification pour le moment.</div>:<div className="dx-card">{items.map(n=><article key={n._id} style={{borderBottom:'1px solid #e2e8f0',padding:'14px 0'}}><strong>{n.title}</strong><p>{n.message}</p><small>{n.channel} · {n.eventType}</small><div style={{display:'flex',gap:8,marginTop:8}}><Link className="dx-button dx-button--sm dx-button--outline" href={linkFor(n)}>Voir</Link>{!n.read&&<button className="dx-button dx-button--sm" onClick={()=>read(n._id)}>Marquer lu</button>}</div></article>)}</div>}</section></main>;
}
