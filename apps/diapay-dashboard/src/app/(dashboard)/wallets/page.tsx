import { marketplaceWallets } from '../../../lib/api';
import { Badge, Card, PageHeader, formatMoney } from '../../../components/ui';

export default function WalletsPage() {
  return <><PageHeader title="Wallets marketplace" description="Suivez les merchant_wallet, vendor_wallet, platform_wallet, escrow_wallet et reserve_wallet par devise et propriétaire." />
  <Card className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-slate-400"><tr>{['Wallet','Type','Owner','Balance','Disponible','Pending','Statut'].map((h) => <th className="pb-4" key={h}>{h}</th>)}</tr></thead><tbody className="divide-y">{marketplaceWallets.map((wallet) => <tr key={wallet.id}><td className="py-4 font-mono text-xs">{wallet.id}</td><td>{wallet.type}</td><td className="font-semibold">{wallet.owner}</td><td>{formatMoney(wallet.balance, wallet.currency)}</td><td className="text-emerald-700">{formatMoney(wallet.availableBalance, wallet.currency)}</td><td className="text-amber-700">{formatMoney(wallet.pendingBalance, wallet.currency)}</td><td><Badge value={wallet.status} /></td></tr>)}</tbody></table></Card></>;
}
