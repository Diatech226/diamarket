import { payouts } from '../../../lib/api';
import { PayoutsTable } from '../../../components/tables';
import { Button, Card, PageHeader } from '../../../components/ui';

export default function PayoutsPage() { return <><PageHeader title="Payouts" description="Demandez et suivez les virements marchands vers comptes bancaires ou wallets." action={<Button>Demander payout</Button>} /><Card className="mb-5 grid gap-3 md:grid-cols-4"><input className="rounded-2xl border bg-transparent px-3 py-2" placeholder="Montant"/><select className="rounded-2xl border bg-transparent px-3 py-2"><option>XOF</option><option>USD</option></select><input className="rounded-2xl border bg-transparent px-3 py-2" placeholder="Destination"/><Button>Soumettre</Button></Card><PayoutsTable rows={payouts}/></>; }
