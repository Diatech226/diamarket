export type QuoteStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'info_requested'
  | 'priced'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'converted_to_shipment'
  | 'cancelled';
export type QuotePaymentStatus = 'pending' | 'approved' | 'failed';
export type ShipmentStatus =
  | 'created'
  | 'awaiting_pickup'
  | 'picked_up'
  | 'at_origin_hub'
  | 'in_transit'
  | 'at_destination_hub'
  | 'out_for_delivery'
  | 'delivered'
  | 'delivery_failed'
  | 'returned'
  | 'cancelled'
  | 'delayed';

export interface Quote {
  _id: string;
  origin: string;
  destination: string;
  transportType: 'air' | 'sea' | string;
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  weightActual?: number;
  weightVolumetric?: number;
  billableWeight?: number;
  volume?: number;
  status: QuoteStatus;
  provider?: string;
  estimatedPrice?: number;
  finalPrice?: number;
  currency?: string;
  contactPhone?: string;
  recipientContactName?: string;
  recipientContactEmail?: string;
  recipientContactPhone?: string;
  userEmail?: string;
  requestedBy?: string;
  requestedByLabel?: string;
  notes?: string;
  paymentStatus?: QuotePaymentStatus;
  productLocation?: string;
  createdAt?: string;
  createdAtOperational?: string;
  scheduledAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  returnedAt?: string;
  convertedAt?: string;
  convertedBy?: string;
  updatedAt?: string;
  shipmentId?: string;
  trackingNumber?: string;
  source?: string;
  priority?: string;
  adminNotes?: string;
  reviewNotes?: string;
  pricingNote?: string;
  declaredValue?: number;
  services?: string[];
  pricingSnapshot?: unknown;
  pricingBreakdown?: unknown;
  estimatedDelivery?: string;
  audit?: { history?: Array<{ action?: string; at?: string; actorLabel?: string; note?: string; fromStatus?: string; toStatus?: string }> };
  auditLogs?: Array<{ _id?: string; action: string; oldValue?: unknown; newValue?: unknown; comment?: string; userLabel?: string; role?: string; createdAt?: string }>;
  packageTypeId?: { _id: string; name?: string } | string;
}

export interface Shipment {
  _id: string;
  quoteId: string | Quote;
  trackingCode: string;
  shipmentReference?: string;
  source?: 'manual' | 'diamarket';
  status: ShipmentStatus;
  origin?: string;
  destination?: string;
  clientSnapshot?: Record<string, unknown>;
  originSnapshot?: Record<string, unknown>;
  destinationSnapshot?: Record<string, unknown>;
  transportSnapshot?: Record<string, unknown>;
  packageSnapshot?: Record<string, unknown>;
  serviceSnapshot?: Record<string, unknown>;
  pricingSnapshot?: Record<string, unknown>;
  routeSnapshot?: Record<string, unknown>;
  priceAccepted?: number;
  currency?: string;
  weight?: number;
  volume?: number;
  weightActual?: number;
  weightVolumetric?: number;
  billableWeight?: number;
  dimensions?: { length?: number; width?: number; height?: number };
  provider?: string;
  carrier?: string;
  currentLocation?: string;
  estimatedDelivery?: string;
  trackingUpdates?: Array<{ eventType?: string; location?: string; status?: ShipmentStatus; note?: string; timestamp?: string; source?: string; actorId?: string; actorLabel?: string; carrierReference?: string }>;
  timeline?: Array<{ eventType?: string; location?: string; status?: ShipmentStatus; note?: string; timestamp?: string; source?: string; actorId?: string; actorLabel?: string; carrierReference?: string }>;
  meta?: {
    quote?: { origin?: string; destination?: string; estimatedPrice?: number; transportType?: string; userEmail?: string; recipientContactName?: string };
    customerEmail?: string;
    customerName?: string;
    source?: string;
    operatorId?: string;
    hubId?: string;
    planning?: string;
    quoteId?: string;
    [key: string]: unknown;
  };
  embarkmentId?: string;
  createdAt?: string;
  createdAtOperational?: string;
  scheduledAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  returnedAt?: string;
  convertedAt?: string;
  convertedBy?: string;
  updatedAt?: string;
}

export interface PricingRule {
  _id: string;
  route?: string;
  origin?: string;
  destination?: string;
  clientSnapshot?: Record<string, unknown>;
  originSnapshot?: Record<string, unknown>;
  destinationSnapshot?: Record<string, unknown>;
  transportSnapshot?: Record<string, unknown>;
  packageSnapshot?: Record<string, unknown>;
  serviceSnapshot?: Record<string, unknown>;
  pricingSnapshot?: Record<string, unknown>;
  routeSnapshot?: Record<string, unknown>;
  priceAccepted?: number;
  weight?: number;
  volume?: number;
  weightActual?: number;
  weightVolumetric?: number;
  billableWeight?: number;
  dimensions?: { length?: number; width?: number; height?: number };
  transportType: string;
  transportLineId?: string;
  transportPrices?: Array<{
    transportType: string;
    unitType: string;
    allowedUnits?: string[];
    pricePerUnit?: number;
    pricePerKg?: number;
    pricePerM3?: number;
    flatPrice?: number;
    minimumPrice?: number;
    minDelayDays?: number;
    maxDelayDays?: number;
    additionalServices?: Record<string, number>;
    dimensionRanges?: Array<{ min?: number; max?: number; price: number; priority?: number }>;
    packagePricing?: Array<{ packageTypeId: string; basePrice: number; name?: string }>;
  }>;
  provider?: string;
  dimensionRanges?: string | { min: number; max: number; price: number }[];
  basePrice?: number;
  pricePerUnit?: number;
    pricePerKg?: number;
    pricePerM3?: number;
    flatPrice?: number;
    minimumPrice?: number;
    minDelayDays?: number;
    maxDelayDays?: number;
    additionalServices?: Record<string, number>;
  unitType?: string;
  packagePricing?: { packageTypeId: string; basePrice: number }[];
  currency: string;
  priority?: number;
  createdAt?: string;
  createdAtOperational?: string;
  scheduledAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  returnedAt?: string;
  convertedAt?: string;
  convertedBy?: string;
  updatedAt?: string;
}

export interface PackageType {
  _id: string;
  label: string;
  description?: string;
  maxWeight?: number;
  maxVolume?: number;
}

export interface LogisticsUser {
  _id: string;
  email: string;
  name?: string;
  role?: string;
  status?: string;
  createdAt?: string;
}

export interface LogisticsAddress {
  _id: string;
  label: string;
  street?: string;
  city?: string;
  country?: string;
  type?: string;
  userId?: string;
  createdAt?: string;
}

export interface Country {
  _id: string;
  code: string;
  name: string;
  isActive?: boolean;
  active?: boolean;
}

export type MarketPointType = 'agency' | 'hub' | 'relay' | string;

export interface MarketPoint {
  _id: string;
  name: string;
  label?: string;
  city?: string;
  countryCode?: string;
  countryName?: string;
  countryId?: Country | string | null;
  type: MarketPointType;
  addressText?: string;
  geo?: { lat?: number; lng?: number };
  isActive?: boolean;
}

export interface AdminAddress {
  _id: string;
  label: string;
  marketPointId?: MarketPoint | string | null;
  contactName?: string;
  contactPhone?: string;
  addressText?: string;
  line1?: string;
  line2?: string;
  city?: string;
  country?: string;
  countryCode?: string;
  geo?: { lat?: number; lng?: number };
  isActive?: boolean;
  createdAt?: string;
}

export type TransportMode = 'air' | 'sea' | 'road' | 'express';

export interface TransportLine {
  _id: string;
  origin?: string;
  destination?: string;
  clientSnapshot?: Record<string, unknown>;
  originSnapshot?: Record<string, unknown>;
  destinationSnapshot?: Record<string, unknown>;
  transportSnapshot?: Record<string, unknown>;
  packageSnapshot?: Record<string, unknown>;
  serviceSnapshot?: Record<string, unknown>;
  pricingSnapshot?: Record<string, unknown>;
  routeSnapshot?: Record<string, unknown>;
  priceAccepted?: number;
  weight?: number;
  volume?: number;
  weightActual?: number;
  weightVolumetric?: number;
  billableWeight?: number;
  dimensions?: { length?: number; width?: number; height?: number };
  country?: string;
  location?: string;
  transportType?: TransportMode;
  transportTypes: TransportMode[];
  lineCode?: string;
  isActive: boolean;
  notes?: string;
  departureDates?: string[];
  estimatedTransitDays?: number;
  createdAt?: string;
  createdAtOperational?: string;
  scheduledAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  returnedAt?: string;
  convertedAt?: string;
  convertedBy?: string;
  updatedAt?: string;
  originMarketPointId?: MarketPoint | string | null;
  destinationMarketPointId?: MarketPoint | string | null;
}

export type ExpeditionStatus = 'pending' | 'awaiting_pickup' | 'in_transit' | 'delivered' | 'cancelled';

export interface Expedition {
  _id: string;
  quoteId?: string;
  shipmentId?: string;
  shipments?: string[];
  transportLineId: TransportLine | string;
  plannedDepartureDate?: string;
  plannedArrivalDate?: string;
  status: ExpeditionStatus;
  voyageCode?: string;
  notes?: string;
  createdAt?: string;
  createdAtOperational?: string;
  scheduledAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  returnedAt?: string;
  convertedAt?: string;
  convertedBy?: string;
  updatedAt?: string;
}

export interface Embarkment {
  _id: string;
  transportLineId: TransportLine | string;
  transportType?: TransportMode;
  startDate?: string;
  endDate?: string;
  cutoffDate?: string;
  status?: string;
  label?: string;
  isActive?: boolean;
  createdAt?: string;
}
