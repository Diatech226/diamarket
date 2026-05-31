import { PageHeader } from '@/components/ui/page-header';

const rows = [
  {
    label: 'Backend logistique',
    value:
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ||
      process.env.ADMIN_API_BASE_URL ||
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_LOGISTICS_API_BASE_URL ||
      'http://localhost:5000'
  },
  {
    label: 'diaPay Admin',
    value:
      process.env.NEXT_PUBLIC_DIAPAY_ADMIN_API_BASE_URL ||
      process.env.ADMIN_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'http://localhost:5000/api/v1/admin'
  }
];

export default function SettingsPage() {
  return (
    <div className="page-stack">
      <PageHeader title="Paramètres" description="Configurez les intégrations critiques pour exposer les APIs DiaExpress." />
      <div className="status-grid">
        {rows.map((row) => (
          <div key={row.label} className="stat-card">
            <p>{row.label}</p>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
