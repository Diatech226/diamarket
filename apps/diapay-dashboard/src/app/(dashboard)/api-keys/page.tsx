import { apiKeys } from '../../../lib/api';
import { ApiKeysTable } from '../../../components/tables';
import { Button, Card, PageHeader } from '../../../components/ui';

export default function ApiKeysPage() { return <><PageHeader title="API Keys" description="Créez, masquez et révoquez les clés API. Les secrets complets ne sont jamais affichés." action={<Button>Créer une clé</Button>} /><Card className="mb-5 grid gap-3 md:grid-cols-3"><input className="rounded-2xl border bg-transparent px-3 py-2" placeholder="Nom de clé"/><select className="rounded-2xl border bg-transparent px-3 py-2"><option>test</option><option>live</option></select><Button>Générer</Button></Card><ApiKeysTable rows={apiKeys}/></>; }
