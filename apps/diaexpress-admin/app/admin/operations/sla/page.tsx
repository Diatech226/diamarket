import { fetchSlaDashboard } from '@/src/services/api/operations';
import { SlaDashboard } from '@/components/operations/SlaDashboard';
import { PageHeader } from '@/components/ui/page-header';
export default async function SlaPage() { const data = await fetchSlaDashboard(); return <><PageHeader title="SLA Dashboard" description="Shipments on time, at risk, late, routes et hubs à risque." /><SlaDashboard data={data} /></>; }
