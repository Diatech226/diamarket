import { Card } from '@/components/ui/card';
import type { Hub } from '@/src/services/api/operations';
export function HubCard({ hub }: { hub: Hub }) { return <Card title={hub.name} value={`${hub.city}, ${hub.country}`} meta={`Capacité ${hub.capacity || 'n/a'}`}><p>Présents: {hub.shipmentsPresent} · Entrants: {hub.shipmentsIncoming} · Sortants: {hub.shipmentsOutgoing}</p><p>Incidents liés: {hub.incidents}</p></Card>; }
