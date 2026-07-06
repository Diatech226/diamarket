import { OperationsOverview } from '@/components/operations/OperationsOverview';
import { fetchDashboardSnapshot } from '@/src/services/api/dashboard';
import { fetchMarketPoints } from '@/src/services/api/logisticsAdmin';

export default async function HubsRoute() {
  const [{ quotes, shipments, paymentSummary, metrics }, marketPoints] = await Promise.all([
    fetchDashboardSnapshot(),
    fetchMarketPoints({ page: 1, pageSize: 100, active: true }).catch(() => ({ items: [] })),
  ]);
  return <OperationsOverview title="Hubs logistiques" description="Hubs préparés : Ouagadougou, Bobo, Accra, Abidjan et Montréal." quotes={quotes.items} shipments={shipments.items} revenue={paymentSummary?.totalVolume ?? metrics.totalPayments} marketPoints={marketPoints.items} mode="hubs" />;
}
