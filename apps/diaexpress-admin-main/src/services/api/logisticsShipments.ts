import { apiClient } from '@/lib/api/client';
import type { Shipment } from '@/src/types/logistics';
import type { PaginatedParams, PaginatedResult } from '@/src/types/pagination';
import { paginateCollection } from '@/src/lib/pagination';

export type ShipmentListParams = PaginatedParams & {
  provider?: string;
  trackingCode?: string;
  search?: string;
};

export async function fetchShipments(params: ShipmentListParams = {}): Promise<PaginatedResult<Shipment>> {
  const data = await apiClient<{ shipments: Shipment[] }>('api/admin/shipments', {
    searchParams: {
      status: params.status as string | undefined,
      provider: params.provider as string | undefined,
      trackingCode: params.trackingCode
    }
  });

  let shipments = data?.shipments ?? data ?? [];

  if (params.trackingCode) {
    const trackingTerm = params.trackingCode.toLowerCase();
    shipments = shipments.filter((shipment) => shipment.trackingCode?.toLowerCase().includes(trackingTerm));
  }

  return paginateCollection(
    shipments,
    params,
    (shipment, term) =>
      [
        shipment.trackingCode,
        shipment.quoteId,
        shipment.meta?.quote?.origin,
        shipment.meta?.quote?.destination,
        shipment.provider,
        shipment.carrier,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term))
  );
}

export async function fetchShipmentById(id: string) {
  const data = await apiClient<{ shipment?: Shipment } | Shipment>(`api/admin/shipments/${id}`);
  return 'shipment' in data && data.shipment ? data.shipment : data as Shipment;
}

export async function fetchShipmentTimeline(id: string) {
  const data = await apiClient<{ timeline?: Shipment['timeline'] }>(`api/admin/shipments/${id}/timeline`);
  return data.timeline || [];
}

export async function fetchShipmentDashboard() {
  return apiClient<{ createdToday: number; active: number; delayed: number; delivered: number }>('api/admin/shipments/dashboard');
}

export async function updateShipmentStatus(
  id: string,
  payload: { status?: Shipment['status']; location?: string; note?: string; paymentStatus?: string; eventType?: string; eventTimestamp?: string; carrierReference?: string }
) {
  return apiClient<Shipment>(`api/admin/shipments/${id}/status`, {
    method: 'PATCH',
    json: payload
  });
}

export async function addShipmentHistory(
  id: string,
  payload: { status?: Shipment['status']; location?: string; note?: string; eventType?: string; eventTimestamp?: string; carrierReference?: string }
) {
  return apiClient<Shipment>(`api/admin/shipments/${id}/history`, {
    method: 'POST',
    json: payload
  });
}

export async function assignShipmentEmbarkment(id: string, embarkmentId: string) {
  return apiClient<Shipment>(`api/admin/shipments/${id}/assign-embarkment`, {
    method: 'PATCH',
    json: { embarkmentId }
  });
}

export async function fetchShipmentTracking(trackingCode: string) {
  return apiClient<{
    provider?: string;
    trackingCode: string;
    status?: Shipment['status'];
    estimatedDelivery?: string;
    events?: Array<{ status?: string; location?: string; note?: string; timestamp?: string }>;
    shipment?: Shipment | null;
  }>(`api/tracking/${encodeURIComponent(trackingCode)}`);
}
