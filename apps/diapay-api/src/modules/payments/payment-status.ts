export const PAYMENT_STATUSES = [
  'created', 'pending', 'processing', 'requires_action', 'paid', 'failed', 'cancelled', 'expired', 'refunded', 'partially_refunded', 'disputed', 'chargeback',
] as const;

export type NormalizedPaymentStatus = typeof PAYMENT_STATUSES[number];

export const TERMINAL_PAYMENT_STATUSES: readonly NormalizedPaymentStatus[] = [
  'failed', 'cancelled', 'expired', 'refunded', 'chargeback',
];

export const PAYMENT_STATUS_TRANSITIONS: Record<NormalizedPaymentStatus, readonly NormalizedPaymentStatus[]> = {
  created: ['pending', 'processing', 'requires_action', 'paid', 'failed', 'cancelled', 'expired'],
  pending: ['processing', 'requires_action', 'paid', 'failed', 'cancelled', 'expired'],
  processing: ['requires_action', 'paid', 'failed', 'cancelled', 'expired'],
  requires_action: ['processing', 'paid', 'failed', 'cancelled', 'expired'],
  paid: ['partially_refunded', 'refunded', 'disputed', 'chargeback'],
  failed: [],
  cancelled: [],
  expired: [],
  refunded: [],
  partially_refunded: ['refunded', 'disputed', 'chargeback'],
  disputed: ['paid', 'partially_refunded', 'refunded', 'chargeback'],
  chargeback: [],
};

export const LEGACY_PAYMENT_STATUS_MAP: Record<string, NormalizedPaymentStatus> = {
  created: 'created', open: 'pending', pending: 'pending', processing: 'processing', requires_action: 'requires_action',
  succeeded: 'paid', success: 'paid', paid: 'paid', failed: 'failed', cancelled: 'cancelled', canceled: 'cancelled',
  expired: 'expired', refunded: 'refunded', partially_refunded: 'partially_refunded', disputed: 'disputed', chargeback: 'chargeback',
};

export function normalizePaymentStatus(status: string): NormalizedPaymentStatus {
  return LEGACY_PAYMENT_STATUS_MAP[status] ?? 'pending';
}

export function isTerminalPaymentStatus(status: string): boolean {
  return TERMINAL_PAYMENT_STATUSES.includes(normalizePaymentStatus(status));
}

export function canTransitionPaymentStatus(from: string, to: string): boolean {
  const normalizedFrom = normalizePaymentStatus(from);
  const normalizedTo = normalizePaymentStatus(to);
  return normalizedFrom === normalizedTo || PAYMENT_STATUS_TRANSITIONS[normalizedFrom].includes(normalizedTo);
}
