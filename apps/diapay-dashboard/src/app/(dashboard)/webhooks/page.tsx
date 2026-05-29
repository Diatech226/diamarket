import { webhookLogs, webhooks } from '../../../lib/api';
import { WebhooksTable } from '../../../components/tables';
import { Button, Card, PageHeader } from '../../../components/ui';

export default function WebhooksPage() { return <><PageHeader title="Webhooks" description="Gérez les endpoints, événements activés, secrets masqués et logs de livraison." action={<Button>Créer endpoint</Button>} /><Card className="mb-5 grid gap-3 lg:grid-cols-[1fr_1fr_auto]"><input className="rounded-2xl border bg-transparent px-3 py-2" placeholder="https://example.com/webhooks"/><input className="rounded-2xl border bg-transparent px-3 py-2" defaultValue="payment.succeeded, refund.succeeded"/><Button>Ajouter</Button></Card><WebhooksTable rows={webhooks} logs={webhookLogs}/></>; }
