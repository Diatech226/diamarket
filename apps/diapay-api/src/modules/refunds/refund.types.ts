export type RefundStatus = 'created' | 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
export interface Refund { id: string; paymentId: string; amount: number; currency: string; status: RefundStatus; reason?: string; metadata: Record<string, unknown>; createdAt: string; updatedAt: string; }
