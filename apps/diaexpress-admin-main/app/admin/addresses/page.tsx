import Link from 'next/link';
import { AddressesManager } from '@/components/logistics/AddressesManager';
import { PageHeader } from '@/components/ui/page-header';

export default function AddressesPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Addresses / Market Points"
        description="Gestion des points de marché et des adresses opérationnelles."
        actions={<Link className="button button--ghost" href="/admin/market-points">Ouvrir Market Points</Link>}
      />
      <AddressesManager />
    </div>
  );
}
