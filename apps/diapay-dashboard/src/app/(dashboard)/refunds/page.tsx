import { refunds } from '../../../lib/api';
import { RefundsTable } from '../../../components/tables';
import { PageHeader } from '../../../components/ui';

export default function RefundsPage() { return <><PageHeader title="Refunds" description="Suivez les remboursements, leur paiement source, leur raison et leur statut." /><RefundsTable rows={refunds}/></>; }
