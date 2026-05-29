import { checkoutSessions, webhookEventsData } from '../../../lib/api';
import { CheckoutSessionsTable, WebhookEventsList } from '../../../components/tables';
import { Button, PageHeader } from '../../../components/ui';

export default function CheckoutSessionsPage() {
  return <><PageHeader title="Checkout Sessions" description="Sessions checkout hébergées avec statut, paiement lié, expiration et événements sandbox." action={<Button>Créer session</Button>} /><CheckoutSessionsTable rows={checkoutSessions} /><div className="mt-6"><WebhookEventsList events={webhookEventsData} /></div></>;
}
