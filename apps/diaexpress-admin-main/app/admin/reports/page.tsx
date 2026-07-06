import { OperationsOverview } from '@/components/operations/OperationsOverview';
import { fetchDashboardSnapshot } from '@/src/services/api/dashboard';

export default async function ReportsRoute() {
  const { quotes, shipments, paymentSummary, metrics } = await fetchDashboardSnapshot();
  return <OperationsOverview title="Performance opérationnelle" description="Rapports simples sur quotes, shipments, livraisons, retards et paiements." quotes={quotes.items} shipments={shipments.items} revenue={paymentSummary?.totalVolume ?? metrics.totalPayments} mode="reports" />;
}
