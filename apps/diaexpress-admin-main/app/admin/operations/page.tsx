import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
export default function OperationsRoute() { const links=[['/admin/operations/board','Operations Board'],['/admin/operations/incidents','Incidents'],['/admin/operations/hubs','Hubs'],['/admin/operations/sla','SLA Dashboard']]; return <><PageHeader title="Operations Center" description="Supervision quotidienne des retards, incidents, échecs, retours, hubs et assignations." /><div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:16}}>{links.map(([href,label])=><Link key={href} href={href}><Card title={label} meta="Ouvrir la vue opérationnelle" /></Link>)}</div></>; }
