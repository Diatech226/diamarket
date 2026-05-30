import { marketplaceAnalytics, marketplaceWallets } from '../../../lib/api';
import { PageHeader, StatCard, formatMoney } from '../../../components/ui';

export default function BalancesPage() {
  const available = marketplaceWallets.reduce((sum, wallet) => sum + wallet.availableBalance, 0);
  const pending = marketplaceWallets.reduce((sum, wallet) => sum + wallet.pendingBalance, 0);
  return <><PageHeader title="Balances" description="Vue consolidée des soldes disponibles, pending, escrow, reserve et revenus plateforme." />
  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"><StatCard label="Disponible" value={formatMoney(available)} detail="Prêt pour payouts ou settlement" /><StatCard label="Pending" value={formatMoney(pending)} detail="Escrow + réserve risque" accent="from-amber-500 to-orange-400" /><StatCard label="Escrow" value={formatMoney(marketplaceAnalytics.escrowBalances)} detail="Fonds bloqués livraison/dispute" accent="from-purple-500 to-indigo-400" /><StatCard label="Revenus plateforme" value={formatMoney(marketplaceAnalytics.platformRevenue)} detail="Commissions + frais Diapay" accent="from-emerald-500 to-teal-400" /></div></>;
}
