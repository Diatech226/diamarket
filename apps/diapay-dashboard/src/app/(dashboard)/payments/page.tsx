import { payments } from '../../../lib/api';
import { PaymentsTable } from '../../../components/tables';
import { Button, PageHeader } from '../../../components/ui';

export default function PaymentsPage() { return <><PageHeader title="Paiements" description="Liste des paiements Diapay avec statut, méthode, devise, client, référence et provider." action={<Button>Nouveau paiement</Button>} /><PaymentsTable rows={payments} /></>; }
