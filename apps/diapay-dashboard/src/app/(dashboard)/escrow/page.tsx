import { escrowHolds } from '../../../lib/api';
import { Badge, Button, Card, PageHeader, formatMoney } from '../../../components/ui';

export default function EscrowPage() {
  return <><PageHeader title="Escrow" description="Pilotez les fonds held, released, refunded ou disputed; release manuel, auto release et partial release." action={<Button>Release manuel</Button>} />
  <Card className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-slate-400"><tr>{['Escrow','Paiement','Vendeur','Montant','Statut','Auto release','Actions'].map((h) => <th className="pb-4" key={h}>{h}</th>)}</tr></thead><tbody className="divide-y">{escrowHolds.map((hold) => <tr key={hold.id}><td className="py-4 font-semibold">{hold.id}</td><td>{hold.paymentId}</td><td>{hold.vendor}</td><td>{formatMoney(hold.amount, hold.currency)}</td><td><Badge value={hold.status} /></td><td>{hold.autoReleaseAt ? new Date(hold.autoReleaseAt).toLocaleString('fr-FR') : 'Manual'}</td><td><div className="flex gap-2"><Button variant="secondary">Release</Button><Button variant="danger">Refund</Button></div></td></tr>)}</tbody></table></Card></>;
}
