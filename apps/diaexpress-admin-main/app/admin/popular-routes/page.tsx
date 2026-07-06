import { PageHeader } from '@/components/ui/page-header';
import { CmsCrud } from '@/components/cms/CmsForms';
export default function PopularRoutesPage() { return <div className="page-stack"><PageHeader title="Routes populaires" description="Routes affichables sur la homepage avec délais et prix indicatifs." /><CmsCrud resource="popular-routes" /></div>; }
