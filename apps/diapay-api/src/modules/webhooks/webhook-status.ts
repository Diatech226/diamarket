export type WebhookEventStatus = 'received' | 'processing' | 'processed' | 'ignored' | 'failed' | 'duplicate';
export type WebhookDeliveryStatus = 'pending' | 'delivering' | 'succeeded' | 'failed' | 'retrying' | 'dead';
export const DIAPAY_EVENT_TYPES = ['checkout.session.created','checkout.session.expired','payment.created','payment.pending','payment.processing','payment.requires_action','payment.paid','payment.failed','payment.cancelled','payment.expired','refund.created','refund.succeeded','refund.failed','payout.created','payout.succeeded','payout.failed'] as const;
export type DiapayEventType = typeof DIAPAY_EVENT_TYPES[number];
