'use client';

import { FilteredShipmentsTable } from '@/components/shipments/FilteredShipmentsTable';

export function ShipmentsSection() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <FilteredShipmentsTable
        title="À venir / Booking"
        description="Expéditions planifiées ou en attente de chargement"
        statuses={['awaiting_pickup', 'awaiting_pickup', 'in_transit', 'at_origin_hub', 'out_for_delivery']}
      />
      <FilteredShipmentsTable
        title="Livrées / archivées"
        description="Expéditions terminées ou annulées"
        statuses={['delivered', 'cancelled']}
      />
    </div>
  );
}
