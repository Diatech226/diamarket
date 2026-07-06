'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Item = Record<string, any>;
const fields: Record<string, string[]> = {
  services: ['title','description','icon','image','transportType','displayOrder'],
  'popular-routes': ['origin','destination','transport','estimatedDelay','indicativePrice','displayOrder'],
  faq: ['question','answer','category','displayOrder'],
  testimonials: ['client','photo','company','comment','rating','displayOrder'],
  'case-studies': ['title','category','summary','result','route','displayOrder'],
  'newsletter/subscribers': ['email','name','country','status'],
  'newsletter/campaigns': ['title','subject','status'],
  'marketing/ctas': ['label','href','placement','displayOrder'],
};
const labels: Record<string, string> = { services: 'service', 'popular-routes': 'route populaire', faq: 'FAQ', testimonials: 'témoignage', 'case-studies': 'étude de cas', 'newsletter/subscribers': 'abonné', 'newsletter/campaigns': 'campagne', 'marketing/ctas': 'CTA' };

export function SettingsForm({ type = 'site-settings' }: { type?: 'site-settings' | 'homepage' }) {
  const [data, setData] = useState<Item>({});
  const [status, setStatus] = useState('Chargement...');
  const names = type === 'homepage'
    ? ['heroTitle','heroSubtitle','heroImage','primaryCtaLabel','primaryCtaHref','trackingCtaLabel','trackingCtaHref']
    : ['companyName','slogan','logo','favicon','primaryColor','supportPhone','supportEmail','whatsapp','address','openingHours','coveredCountries','primaryCurrency'];
  useEffect(() => { apiClient(`/api/admin/${type}`).then((d) => { setData(d as Item); setStatus(''); }).catch((e) => setStatus(e.message)); }, [type]);
  const save = async () => { setStatus('Enregistrement...'); try { const saved = await apiClient(`/api/admin/${type}`, { method: 'PUT', json: data }); setData(saved as Item); setStatus('Enregistré.'); } catch (e:any) { setStatus(e.message); } };
  return <div className="resource-table"><div className="status-grid">{names.map((name) => <label className="stat-card" key={name}><p>{name}</p>{name.toLowerCase().includes('subtitle') || name === 'address' || name === 'openingHours' ? <textarea className="input" value={data[name] || ''} onChange={(e) => setData({ ...data, [name]: e.target.value })} /> : <Input value={Array.isArray(data[name]) ? data[name].join(', ') : data[name] || ''} onChange={(e) => setData({ ...data, [name]: e.target.value })} />}</label>)}</div><Button onClick={save}>Enregistrer</Button>{status ? <p>{status}</p> : null}</div>;
}

export function CmsCrud({ resource }: { resource: 'services' | 'popular-routes' | 'faq' | 'testimonials' | 'case-studies' | 'newsletter/subscribers' | 'newsletter/campaigns' | 'marketing/ctas' }) {
  const [items, setItems] = useState<Item[]>([]); const [form, setForm] = useState<Item>({ isActive: true, displayOrder: 0 }); const [status, setStatus] = useState('');
  const load = useCallback(async () => { setStatus('Chargement...'); try { setItems(await apiClient(`/api/admin/${resource}`) as Item[]); setStatus(''); } catch(e:any) { setStatus(e.message); } }, [resource]);
  useEffect(() => { void load(); }, [load]);
  const save = async () => { try { await apiClient(form._id ? `/api/admin/${resource}/${form._id}` : `/api/admin/${resource}`, { method: form._id ? 'PUT' : 'POST', json: form }); setForm({ isActive: true, displayOrder: 0 }); await load(); } catch(e:any) { setStatus(e.message); } };
  const remove = async (id:string) => { if (!confirm('Supprimer cet élément ?')) return; await apiClient(`/api/admin/${resource}/${id}`, { method:'DELETE' }); await load(); };
  const toggle = async (it:Item) => { await apiClient(`/api/admin/${resource}/${it._id}`, { method:'PUT', json:{ isActive: !it.isActive } }); await load(); };
  return <div className="page-stack"><div className="resource-table__filters">{fields[resource].map((f) => <Input key={f} placeholder={f} value={form[f] || ''} onChange={(e) => setForm({ ...form, [f]: f === 'displayOrder' ? Number(e.target.value) : e.target.value })} />)}<Button onClick={save}>{form._id ? 'Mettre à jour' : `Créer ${labels[resource]}`}</Button></div>{status ? <div className="alert">{status}</div> : null}<div className="table-wrapper"><table><tbody>{items.length ? items.map((it) => <tr key={it._id}><td>{it.title || it.client || it.email || it.label || it.question || `${it.origin} → ${it.destination}`}</td><td>{it.isActive ? 'Actif' : 'Inactif'}</td><td>{it.displayOrder}</td><td><Button onClick={() => setForm(it)}>Éditer</Button><Button variant="ghost" onClick={() => toggle(it)}>{it.isActive ? 'Désactiver' : 'Activer'}</Button><Button variant="ghost" onClick={() => remove(it._id)}>Supprimer</Button></td></tr>) : <tr><td>Empty — aucun contenu administrable.</td></tr>}</tbody></table></div></div>;
}
