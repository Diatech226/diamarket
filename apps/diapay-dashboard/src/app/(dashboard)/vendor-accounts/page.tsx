import { vendorAccounts } from '../../../lib/api';
import { Badge, Card, PageHeader } from '../../../components/ui';

export default function VendorAccountsPage() {
  return <><PageHeader title="Vendor Accounts" description="Comptes vendeurs marketplace avec KYC, devises, wallet, commissions et capabilities." />
  <Card className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-slate-400"><tr>{['Vendeur','Pays','Devises','Wallet','KYC','Commissions','Capabilities'].map((h) => <th className="pb-4" key={h}>{h}</th>)}</tr></thead><tbody className="divide-y">{vendorAccounts.map((vendor) => <tr key={vendor.id}><td className="py-4 font-semibold">{vendor.businessName}<p className="text-xs text-slate-400">{vendor.id}</p></td><td>{vendor.country}</td><td>{vendor.currencies.join(', ')}</td><td className="font-mono text-xs">{vendor.wallet}</td><td><Badge value={vendor.kycStatus} /></td><td>{vendor.commission}</td><td><div className="flex flex-wrap gap-2">{vendor.capabilities.map((capability) => <span className="rounded-full bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800" key={capability}>{capability}</span>)}</div></td></tr>)}</tbody></table></Card></>;
}
