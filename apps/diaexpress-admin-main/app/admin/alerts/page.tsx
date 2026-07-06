import { OperationsOverview } from '@/components/operations/OperationsOverview';
import { fetchDashboardSnapshot } from '@/src/services/api/dashboard';

export default async function AlertsRoute() {
  const { quotes, shipments, paymentSummary, metrics } = await fetchDashboardSnapshot();
  return <OperationsOverview title="Alertes opérations" description="Détection des retards, tracking bloqué, livraisons échouées et paiements en attente." quotes={quotes.items} shipments={shipments.items} revenue={paymentSummary?.totalVolume ?? metrics.totalPayments} mode="alerts" />;
}
