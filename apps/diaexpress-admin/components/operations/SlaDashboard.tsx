import { Card } from '@/components/ui/card';
export function SlaDashboard({ data }: { data: { on_time:number; at_risk:number; late:number; averageDeliveryHours:number } }) {
  return <div style={{ display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:16 }}><Card title="On time" value={String(data.on_time)} /><Card title="At risk" value={String(data.at_risk)} /><Card title="Late" value={String(data.late)} /><Card title="Moyenne livraison" value={`${data.averageDeliveryHours || 0}h`} /></div>;
}
