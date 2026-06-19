'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header';
import { cmsService } from '@/services/cms-service';
import type { AdminAuditLogItem, ApiCollection } from '@/types/cms';

function actorLabel(actor: AdminAuditLogItem['actorId']) {
  if (!actor) return 'Système';
  if (typeof actor === 'string') return actor.slice(-8);
  return actor.name || actor.email || actor._id.slice(-8);
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLogItem[]>([]);
  const [query, setQuery] = useState({ page: 1, limit: 20, search: '', resource: '' });
  const [meta, setMeta] = useState<ApiCollection<AdminAuditLogItem>['meta']>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLogs = useCallback(async () => {
    setLoading(true); setError('');
    try { const response = await cmsService.getAuditLogs(query); setLogs(response.data); setMeta(response.meta); }
    catch (err) { setError((err as Error).message); }
    finally { setLoading(false); }
  }, [query]);

  useEffect(() => { void loadLogs(); }, [loadLogs]);

  const rows = useMemo(() => logs.map((log) => ({
    id: log._id,
    searchableText: `${log.action} ${log.resource} ${log.resourceId ?? ''} ${actorLabel(log.actorId)}`,
    cells: [
      log.createdAt ? new Date(log.createdAt).toLocaleString('fr-FR') : '—',
      actorLabel(log.actorId),
      <span key="action" className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold dark:bg-zinc-800">{log.action}</span>,
      log.resource,
      log.resourceId ? <code key="resourceId" className="text-xs">{log.resourceId}</code> : '—',
      <details key="metadata" className="max-w-sm"><summary className="cursor-pointer text-olive-700">Voir</summary><pre className="mt-2 max-h-48 overflow-auto rounded-xl bg-zinc-950 p-3 text-xs text-zinc-50">{JSON.stringify(log.metadata ?? {}, null, 2)}</pre></details>,
    ],
  })), [logs]);

  return <div className="space-y-6"><PageHeader title="Audit logs" subtitle="Journal des actions sensibles réalisées dans le CMS." />
    {error && <p className="admin-alert-error" role="alert">{error}</p>}
    <section className="admin-card grid gap-3 md:grid-cols-3" aria-label="Filtres audit logs">
      <label className="md:col-span-2"><span className="mb-1 block text-sm font-medium">Recherche</span><input className="admin-field" value={query.search} onChange={(e) => setQuery({ ...query, page: 1, search: e.target.value })} placeholder="Action, ressource, identifiant…" /></label>
      <label><span className="mb-1 block text-sm font-medium">Ressource</span><input className="admin-field" value={query.resource} onChange={(e) => setQuery({ ...query, page: 1, resource: e.target.value })} placeholder="product, user, media…" /></label>
    </section>
    {loading ? <p className="admin-card text-sm text-zinc-500" role="status">Chargement des logs d’audit…</p> : <DataTable headers={['Date', 'Admin', 'Action', 'Ressource', 'ID', 'Métadonnées']} rows={rows} enableBulkActions={false} />}
    {meta && <div className="flex flex-wrap justify-end gap-3 text-sm"><button className="admin-btn admin-btn-secondary text-xs" disabled={query.page <= 1 || loading} onClick={() => setQuery({ ...query, page: query.page - 1 })}>Précédent</button><span className="py-2">Page {meta.page}/{meta.totalPages} — {meta.total} logs</span><button className="admin-btn admin-btn-secondary text-xs" disabled={query.page >= meta.totalPages || loading} onClick={() => setQuery({ ...query, page: query.page + 1 })}>Suivant</button></div>}
  </div>;
}
