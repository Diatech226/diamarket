import { OperationsOverview } from '@/components/operations/OperationsOverview';
import { BackendOffline } from '@/components/system/backend-offline';
import { fetchDashboardSnapshot } from '@/src/services/api/dashboard';

export default async function AdminDashboard() {
  const { quotes, shipments, paymentSummary, metrics, errors } = await fetchDashboardSnapshot();
  const isBackendOffline = errors.some((message) => /impossible de contacter le serveur|requête expirée|backend offline/i.test(message));

  return (
    <>
      {errors.length ? <div className="alert alert--error"><strong>Erreurs API :</strong><ul>{errors.map((message) => <li key={message}>{message}</li>)}</ul></div> : null}
      {isBackendOffline ? <BackendOffline /> : null}
      <OperationsOverview title="Operations Dashboard" description="Centre d’exploitation DiaExpress pour piloter devis, expéditions, statuts, hubs, retards et performance." quotes={quotes.items} shipments={shipments.items} revenue={paymentSummary?.totalVolume ?? metrics.totalPayments} />
    </>
  );
}
