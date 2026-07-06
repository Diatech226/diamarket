import { PageHeader } from '@/components/ui/page-header';
import { CmsCrud } from '@/components/cms/CmsForms';
export default function ServicesPage() { return <div className="page-stack"><PageHeader title="Services logistiques" description="Créer, ordonner, activer et désactiver les services publics." /><CmsCrud resource="services" /></div>; }
