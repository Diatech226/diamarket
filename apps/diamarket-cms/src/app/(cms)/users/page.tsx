'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { cmsService } from '@/services/cms-service';
import type { AdminUserItem, ApiCollection, UserDetailResponse, UserRole } from '@/types/cms';

const ROLES: UserRole[] = ['admin', 'vendor', 'user'];
const money = (value?: number, currency = 'FCFA') => `${Number(value || 0).toLocaleString('fr-FR')} ${currency}`;

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [selected, setSelected] = useState<UserDetailResponse | null>(null);
  const [query, setQuery] = useState({ page: 1, limit: 20, search: '', role: '', status: '' });
  const [meta, setMeta] = useState<ApiCollection<AdminUserItem>['meta']>();
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true); setNotice(null);
    try { const response = await cmsService.getUsers(query); setUsers(response.data); setMeta(response.meta); }
    catch (error) { setNotice({ type: 'error', text: (error as Error).message }); }
    finally { setLoading(false); }
  }, [query]);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  const loadDetail = async (id: string) => {
    setAction(`detail:${id}`);
    try { const response = await cmsService.getUser(id); setSelected(response.data); }
    catch (error) { setNotice({ type: 'error', text: (error as Error).message }); }
    finally { setAction(''); }
  };

  const runAction = async (label: string, confirmation: string, callback: () => Promise<unknown>) => {
    if (!window.confirm(confirmation)) return;
    setAction(label); setNotice(null);
    try {
      await callback();
      setNotice({ type: 'success', text: 'Action exécutée avec succès.' });
      if (selected?.user._id) setSelected((await cmsService.getUser(selected.user._id)).data);
      await loadUsers();
    } catch (error) { setNotice({ type: 'error', text: (error as Error).message }); }
    finally { setAction(''); }
  };

  const rows = useMemo(() => users.map((user) => ({
    id: user._id,
    searchableText: `${user.name ?? ''} ${user.email ?? ''} ${user.role} ${user.disabled ? 'disabled désactivé' : 'active actif'}`,
    cells: [
      <button key="name" onClick={() => loadDetail(user._id)} className="text-left font-medium text-olive-700 underline">{user.name || 'Sans nom'}</button>,
      user.email ?? '—',
      <StatusBadge key="role" status={user.role} />,
      <StatusBadge key="status" status={user.disabled ? 'désactivé' : 'actif'} />,
      user.createdAt ? new Date(user.createdAt).toLocaleString('fr-FR') : '—',
      <div key="actions" className="flex flex-wrap gap-2">
        <button disabled={!!action} onClick={() => loadDetail(user._id)} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-50">Détail</button>
        <button disabled={!!action} onClick={() => runAction(`status:${user._id}`, `${user.disabled ? 'Réactiver' : 'Désactiver'} cet utilisateur ?`, () => cmsService.updateUserStatus(user._id, !user.disabled))} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-50">{user.disabled ? 'Réactiver' : 'Désactiver'}</button>
        <select disabled={!!action} value={user.role} onChange={(event) => runAction(`role:${user._id}`, `Changer le rôle en ${event.target.value} ?`, () => cmsService.updateUserRole(user._id, event.target.value as UserRole))} className="rounded-lg border px-2 py-1 text-xs disabled:opacity-50">{ROLES.map((role) => <option key={role} value={role}>{role}</option>)}</select>
      </div>,
    ],
  })), [users, action, selected?.user._id]);

  return <div className="space-y-6"><PageHeader title="Utilisateurs & rôles" subtitle="Recherche, statuts, rôles, commandes et vendeur lié" />
    {notice && <p className={`rounded-xl p-3 text-sm ${notice.type === 'error' ? 'bg-red-500/10 text-red-700' : 'bg-emerald-500/10 text-emerald-700'}`}>{notice.text}</p>}
    <div className="grid gap-3 rounded-2xl border p-4 md:grid-cols-4 dark:border-zinc-800">
      <input value={query.search} onChange={(e) => setQuery({ ...query, page: 1, search: e.target.value })} placeholder="Rechercher nom ou email…" className="rounded-xl border px-3 py-2 text-sm md:col-span-2" />
      <select value={query.role} onChange={(e) => setQuery({ ...query, page: 1, role: e.target.value })} className="rounded-xl border px-3 py-2 text-sm"><option value="">Tous rôles</option>{ROLES.map((role) => <option key={role} value={role}>{role}</option>)}</select>
      <select value={query.status} onChange={(e) => setQuery({ ...query, page: 1, status: e.target.value })} className="rounded-xl border px-3 py-2 text-sm"><option value="">Tous statuts</option><option value="active">Actif</option><option value="disabled">Désactivé</option></select>
    </div>
    {loading ? <p>Chargement des utilisateurs…</p> : <><DataTable headers={['Nom', 'Email', 'Rôle', 'Statut', 'Création', 'Actions']} rows={rows} enableBulkActions={false} searchPlaceholder="Recherche locale…" />{meta && <div className="flex justify-end gap-3 text-sm"><button disabled={query.page <= 1 || loading} onClick={() => setQuery({ ...query, page: query.page - 1 })}>Précédent</button><span>Page {meta.page}/{meta.totalPages} — {meta.total} utilisateurs</span><button disabled={query.page >= meta.totalPages || loading} onClick={() => setQuery({ ...query, page: query.page + 1 })}>Suivant</button></div>}</>}
    {selected && <aside className="rounded-2xl border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">{selected.user.name || selected.user.email || selected.user._id}</h2><p className="text-sm text-zinc-500">{selected.user.email ?? 'Email indisponible'} — <StatusBadge status={selected.user.role} /> <StatusBadge status={selected.user.disabled ? 'désactivé' : 'actif'} /></p></div><button onClick={() => setSelected(null)} className="rounded-lg border px-3 py-2 text-xs">Fermer</button></div><div className="mt-4 grid gap-4 lg:grid-cols-2"><section className="space-y-2 text-sm"><h3 className="font-semibold">Vendeur lié</h3>{selected.vendor ? <div><p>Boutique : {selected.vendor.shopName ?? '—'}</p><p>Statut : <StatusBadge status={selected.vendor.status} /></p><p>Ville : {[selected.vendor.city, selected.vendor.country].filter(Boolean).join(', ') || '—'}</p></div> : <p className="text-zinc-500">Aucun vendeur lié.</p>}</section><section className="space-y-2 text-sm"><h3 className="font-semibold">Commandes utilisateur</h3>{selected.orders.length ? selected.orders.map((order) => <p key={order._id}>• {order._id.slice(-8)} — <StatusBadge status={order.status ?? 'pending'} /> — {money(order.totalAmount, order.currency)}</p>) : <p className="text-zinc-500">Aucune commande pour cet utilisateur.</p>}</section></div></aside>}
  </div>;
}
