import { transactions } from '../../../lib/api';
import { TransactionsTable } from '../../../components/tables';
import { Button, Card, PageHeader } from '../../../components/ui';

export default function TransactionsPage() { return <><PageHeader title="Transactions" description="Filtrez par statut, méthode ou date puis exportez les écritures comptables en CSV." action={<Button variant="secondary">Export CSV</Button>} /><Card className="mb-5 grid gap-3 md:grid-cols-4"><select className="rounded-2xl border bg-transparent px-3 py-2"><option>Tout statut</option><option>succeeded</option><option>failed</option></select><select className="rounded-2xl border bg-transparent px-3 py-2"><option>Toutes méthodes</option><option>mobile-money</option><option>bank-card</option></select><input type="date" className="rounded-2xl border bg-transparent px-3 py-2"/><Button>Filtrer</Button></Card><TransactionsTable rows={transactions}/></>; }
