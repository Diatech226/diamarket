import { customers, payments } from '../../../lib/api';
import { CustomersTable, PaymentsTable } from '../../../components/tables';
import { PageHeader } from '../../../components/ui';

export default function CustomersPage() { return <><PageHeader title="Customers" description="Liste clients, profil, pays et historique paiements rattaché au marchand." /><CustomersTable rows={customers}/><h2 className="mb-4 mt-8 text-xl font-semibold">Historique paiements client sélectionné</h2><PaymentsTable rows={payments.filter(p => p.customer === customers[0].name)}/></>; }
