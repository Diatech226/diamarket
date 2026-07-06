import { PageHeader } from '@/components/ui/page-header';
import { SettingsForm } from '@/components/cms/CmsForms';
export default function CmsPage() { return <div className="page-stack"><PageHeader title="Homepage administrable" description="Hero, CTA, visuel et contenus prioritaires de la page d’accueil." /><SettingsForm type="homepage" /></div>; }
