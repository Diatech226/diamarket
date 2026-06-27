'use client';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { cmsService } from '@/services/cms-service';
import { AuditLogDetailDrawer, AuditLogTable, ExportButton } from '@/components/cms/admin-control-center';
import type { AdminAuditLogItem } from '@/types/cms';
export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLogItem[]>([]); const [selected,setSelected]=useState<any>();
  const [query, setQuery] = useState({ page: 1, limit: 20, search: '', resource: '', action: '', actorId: '', from: '', to: '' });
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const loadLogs = useCallback(async () => { setLoading(true); setError(''); try { const response = await cmsService.getAuditLogs(query); setLogs(response.data); } catch (err) { setError((err as Error).message); } finally { setLoading(false); } }, [query]);
  useEffect(() => { void loadLogs(); }, [loadLogs]);
  return <div className="space-y-6"><PageHeader title="Audit logs" subtitle="Recherche, filtres utilisateur/action/module/date, détail et export CSV." actions={<ExportButton href="/api/audit-logs/export"/>}/>{error && <p className="admin-alert-error" role="alert">{error}</p>}<section className="admin-card grid gap-3 md:grid-cols-5"><input className="admin-field md:col-span-2" value={query.search} onChange={(e)=>setQuery({...query,page:1,search:e.target.value})} placeholder="Recherche événements, utilisateurs, actions…"/><input className="admin-field" value={query.actorId} onChange={(e)=>setQuery({...query,page:1,actorId:e.target.value})} placeholder="Utilisateur"/><input className="admin-field" value={query.action} onChange={(e)=>setQuery({...query,page:1,action:e.target.value})} placeholder="Action"/><input className="admin-field" value={query.resource} onChange={(e)=>setQuery({...query,page:1,resource:e.target.value})} placeholder="Module"/><input className="admin-field" type="date" value={query.from} onChange={(e)=>setQuery({...query,page:1,from:e.target.value})}/><input className="admin-field" type="date" value={query.to} onChange={(e)=>setQuery({...query,page:1,to:e.target.value})}/></section>{loading ? <p className="admin-card text-sm text-zinc-500">Chargement…</p> : <AuditLogTable rows={logs} onSelect={setSelected}/>}<AuditLogDetailDrawer log={selected}/></div>;
}
