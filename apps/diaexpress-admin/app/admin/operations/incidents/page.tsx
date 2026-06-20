import { fetchIncidents } from '@/src/services/api/operations';
import { IncidentDrawer } from '@/components/operations/IncidentDrawer';
import { PageHeader } from '@/components/ui/page-header';
export default async function IncidentsPage({ searchParams }: { searchParams?: Record<string,string> }) { const { items } = await fetchIncidents(searchParams || {}); return <><PageHeader title="Incidents opérations" description="Recherche tracking, filtres type/severity/status, assignation, résolution et clôture." /><div style={{display:'grid',gap:12}}>{items.length ? items.map(i=><IncidentDrawer key={i._id} incident={i}/>) : <p>Aucun incident.</p>}</div></>; }
