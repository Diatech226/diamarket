import { PageHeader } from '@/components/ui/page-header';
import { CmsCrud } from '@/components/cms/CmsForms';
export default function FaqPage() { return <div className="page-stack"><PageHeader title="FAQ" description="Questions visibles sur la homepage, l’aide, le tracking et le devis." /><CmsCrud resource="faq" /></div>; }
