import { PageHeader } from '@/components/ui/page-header';
import { SettingsForm } from '@/components/cms/CmsForms';
export default function SettingsPage() { return <div className="page-stack"><PageHeader title="Paramètres DiaExpress" description="Branding, support, pays couverts, devise et coordonnées publiques." /><SettingsForm /></div>; }
