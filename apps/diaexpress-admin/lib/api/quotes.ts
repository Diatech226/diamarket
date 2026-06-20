import { apiClient } from './client';
import type { PaginatedParams, PaginatedResult } from '@/src/types/pagination';
import { paginateCollection } from '@/src/lib/pagination';
import type { Quote } from '@/src/types/logistics';

type DateRangeParams = {
  from?: string;
  to?: string;
};

export type QuoteListParams = PaginatedParams & DateRangeParams & { provider?: string; transportType?: string; origin?: string; destination?: string; client?: string; reference?: string };

export interface QuoteMetaPackageType {
  _id: string;
  name: string | null;
  basePrice: number | null;
  allowedTransportTypes: string[];
}

export interface QuoteMetaDestination {
  destination: string;
  transportTypes: string[];
  packageTypes: QuoteMetaPackageType[];
}

export interface QuoteMetaOrigin {
  origin: string;
  destinations: QuoteMetaDestination[];
}

export interface QuoteMetaResponse {
  origins: QuoteMetaOrigin[];
  marketPoints?: Array<{
    countryCode: string;
    countryName?: string;
    points: Array<{
      id: string;
      city?: string;
      label?: string;
      type?: string;
      contactName?: string;
      contactPhone?: string;
      contactEmail?: string;
      addressLine1?: string;
      addressLine2?: string;
      postalCode?: string;
      lat?: number;
      lng?: number;
    }>;
  }>;
}

export interface QuoteEstimateRequest {
  origin: string;
  destination: string;
  transportType: string;
  packageTypeId?: string;
  weight?: number | string;
  volume?: number | string;
  length?: number | string;
  width?: number | string;
  height?: number | string;
  transportLineId?: string;
  originMarketPointId?: string;
  destinationMarketPointId?: string;
}

export interface QuoteEstimate {
  estimatedPrice: number;
  currency?: string;
  provider?: string;
  transportType?: string;
  appliedRule?: unknown;
  breakdown?: unknown;
  warnings?: string[];
}

export interface CreateQuotePayload extends QuoteEstimateRequest {
  estimatedPrice: number;
  currency?: string;
  provider?: string;
  contactPhone?: string;
  recipientContactName?: string;
  recipientContactEmail?: string;
  productLocation?: string;
  pickupAddress?: string;
  userEmail?: string;
  notes?: string;
  transportLineId?: string;
}

export async function fetchQuotes(params: QuoteListParams = {}): Promise<PaginatedResult<Quote>> {
  const data = await apiClient<{ quotes?: Quote[] } | Quote[]>('/api/admin/quotes', { searchParams: { status: params.status, transportType: params.transportType, origin: params.origin, destination: params.destination, client: params.client, reference: params.reference, search: params.search, from: params.from, to: params.to } });
  const quotes = Array.isArray(data) ? data : Array.isArray(data?.quotes) ? data.quotes : [];

  const filteredByStatus = params.status
    ? quotes.filter((quote) => quote.status === params.status)
    : quotes;

  const filteredByProvider = params.provider
    ? filteredByStatus.filter((quote) => quote.provider === params.provider)
    : filteredByStatus;

  const filteredByDate = filteredByProvider.filter((quote) => {
    if (!quote.createdAt) return !params.from && !params.to;
    const created = new Date(quote.createdAt);

    if (params.from && created < new Date(params.from)) return false;
    if (params.to) {
      const end = new Date(params.to);
      end.setHours(23, 59, 59, 999);
      if (created > end) return false;
    }

    return true;
  });

  return paginateCollection(
    filteredByDate,
    params,
    (quote, searchTerm) =>
      [
        quote._id,
        quote.userEmail,
        quote.recipientContactName,
        quote.recipientContactEmail,
        quote.contactPhone,
        quote.requestedBy,
        quote.requestedByLabel,
        quote.origin,
        quote.destination,
        quote.trackingNumber
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(searchTerm))
  );
}

export async function fetchQuoteDashboard() {
  return apiClient<{ pending: number; toReview: number; approved: number; converted: number }>('/api/admin/quotes/dashboard');
}

export async function fetchQuoteById(id: string) {
  const data = await apiClient<{ quote?: Quote; auditLogs?: unknown[] } | Quote>(`/api/admin/quotes/${id}`);
  return 'quote' in data && data.quote ? { ...data.quote, auditLogs: data.auditLogs } as Quote : data as Quote;
}

export async function updateQuote(id: string, payload: Partial<Quote> & { overrideReason?: string }) {
  const data = await apiClient<{ quote?: Quote } | Quote>(`/api/admin/quotes/${id}`, {
    method: 'PATCH',
    json: payload
  });
  return 'quote' in data && data.quote ? data.quote : data as Quote;
}

export async function fetchQuoteMeta(): Promise<QuoteMetaResponse> {
  return apiClient<QuoteMetaResponse>('/api/quotes/meta');
}

export async function estimateQuote(payload: QuoteEstimateRequest): Promise<QuoteEstimate[]> {
  const data = await apiClient<{
    quotes?: QuoteEstimate[];
    estimate?: number;
    currency?: string;
    quoteEstimate?: { totalPrice: number; currency?: string; appliedRule?: unknown; breakdown?: unknown; warnings?: string[] };
  }>(
    '/api/quotes/estimate',
    {
      method: 'POST',
      json: payload
    }
  );

  if (Array.isArray(data?.quotes)) {
    return data.quotes.filter((item): item is QuoteEstimate => item != null && typeof item.estimatedPrice === 'number');
  }

  if (data?.quoteEstimate?.totalPrice != null) {
    return [
      {
        estimatedPrice: data.quoteEstimate.totalPrice,
        currency: data.quoteEstimate.currency ?? 'USD',
        appliedRule: data.quoteEstimate.appliedRule,
        breakdown: data.quoteEstimate.breakdown,
        warnings: data.quoteEstimate.warnings,
        provider: 'internal',
      },
    ];
  }

  if (typeof data?.estimate === 'number') {
    return [
      {
        estimatedPrice: data.estimate,
        currency: data.currency ?? 'USD',
        provider: 'internal'
      }
    ];
  }

  return [];
}

export async function createQuote(payload: CreateQuotePayload) {
  const data = await apiClient<{ quote: Quote }>('/api/quotes', {
    method: 'POST',
    json: payload
  });

  return data?.quote;
}


export async function updateQuoteStatus(id: string, status: Quote['status'], payload: { note?: string; reason?: string } = {}): Promise<Quote> {
  const data = await apiClient<{ quote?: Quote } | Quote>(`/api/admin/quotes/${id}/status`, {
    method: 'PATCH',
    json: { status, ...payload }
  });

  return 'quote' in data && data.quote ? data.quote : (data as Quote);
}

export async function markQuoteUnderReview(id: string, note?: string): Promise<Quote> {
  try {
    const data = await apiClient<{ quote: Quote }>(`/api/admin/quotes/${id}/review`, { method: 'POST', json: note ? { note } : {} });
    return data.quote;
  } catch {
    return updateQuoteStatus(id, 'under_review', { note });
  }
}

export async function requestQuoteInfo(id: string, message?: string): Promise<Quote> {
  try {
    const data = await apiClient<{ quote: Quote }>(`/api/admin/quotes/${id}/request-info`, { method: 'POST', json: message ? { message } : {} });
    return data.quote;
  } catch {
    return updateQuoteStatus(id, 'info_requested', { note: message });
  }
}

export async function markQuoteReadyForShipment(id: string): Promise<Quote> {
  try {
    const data = await apiClient<{ quote: Quote }>(`/api/admin/quotes/${id}/ready-for-shipment`, { method: 'POST' });
    return data.quote;
  } catch {
    return updateQuoteStatus(id, 'approved');
  }
}

export async function confirmQuote(
  id: string,
  payload: { finalPrice?: number; currency?: string } = {}
): Promise<Quote> {
  const data = await apiClient<{ quote: Quote }>(`/api/admin/quotes/${id}/approve`, {
    method: 'POST',
    json: payload
  });

  return data.quote;
}

export async function rejectQuote(id: string, reason?: string): Promise<Quote> {
  const data = await apiClient<{ quote: Quote }>(`/api/admin/quotes/${id}/reject`, {
    method: 'POST',
    json: reason ? { reason } : {}
  });

  return data.quote;
}

export async function deleteQuote(id: string) {
  return apiClient<{ success?: boolean }>(`/api/quotes/${id}`, { method: 'DELETE' });
}

export async function convertQuoteToShipment(id: string) {
  return apiClient<{ shipment: { _id: string; trackingCode: string }; quote?: Quote }>(
    `/api/admin/quotes/${id}/convert`,
    {
      method: 'POST',
      json: {}
    }
  );
}
