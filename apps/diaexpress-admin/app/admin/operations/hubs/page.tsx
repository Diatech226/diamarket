import { fetchHubs } from '@/src/services/api/operations';
import { HubCard } from '@/components/operations/HubCard';
import { PageHeader } from '@/components/ui/page-header';
export default async function HubsPage() { const { items } = await fetchHubs(); return <><PageHeader title="Hubs DiaExpress" description="Capacité, colis présents, flux entrants/sortants et incidents liés." /><div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:16}}>{items.map(h=><HubCard key={h._id} hub={h}/>)}</div></>; }
