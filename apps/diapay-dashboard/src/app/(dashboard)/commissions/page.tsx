import { commissionRules } from '../../../lib/api';
import { Badge, Card, PageHeader } from '../../../components/ui';

export default function CommissionsPage() {
  return <><PageHeader title="Commission Engine" description="Règles fixes, pourcentage, catégorie, vendeur, pays et dynamiques avec priorité d'application." />
  <Card>{commissionRules.map((rule) => <div className="flex items-start justify-between gap-4 border-b py-4 last:border-0" key={rule.id}><div><p className="font-semibold">{rule.rule}</p><p className="mt-1 text-sm text-slate-500">Scope {rule.scope} · priorité {rule.priority}</p></div><Badge value={rule.active ? 'active' : 'disabled'} /></div>)}</Card></>;
}
