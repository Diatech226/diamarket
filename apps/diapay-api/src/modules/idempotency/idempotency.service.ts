import crypto from 'crypto';
export interface IdempotencyRecord { merchantId: string; endpoint: string; key: string; requestHash: string; response?: { statusCode: number; body: unknown }; expiresAt: number; createdAt: string; updatedAt: string; }
const records = new Map<string, IdempotencyRecord>();
const ttlMs = Number(process.env.DIAPAY_IDEMPOTENCY_TTL_MS ?? 24 * 60 * 60 * 1000);
function stable(value: unknown): string { if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`; if (value && typeof value === 'object') return `{${Object.keys(value as Record<string, unknown>).sort().map((k)=>`${JSON.stringify(k)}:${stable((value as Record<string, unknown>)[k])}`).join(',')}}`; return JSON.stringify(value); }
export function hashPayload(payload: unknown) { return crypto.createHash('sha256').update(stable(payload ?? {})).digest('hex'); }
function recordKey(merchantId: string, endpoint: string, key: string) { return `${merchantId}:${endpoint}:${key}`; }
function prune() { const now = Date.now(); for (const [key, value] of records) if (value.expiresAt <= now) records.delete(key); }
export function getRecord(merchantId: string, endpoint: string, key: string) { prune(); return records.get(recordKey(merchantId, endpoint, key)); }
export function reserveRecord(merchantId: string, endpoint: string, key: string, requestHash: string) { const now = new Date().toISOString(); const record: IdempotencyRecord = { merchantId, endpoint, key, requestHash, expiresAt: Date.now() + ttlMs, createdAt: now, updatedAt: now }; records.set(recordKey(merchantId, endpoint, key), record); return record; }
export function saveResponse(record: IdempotencyRecord, statusCode: number, body: unknown) { record.response = { statusCode, body }; record.updatedAt = new Date().toISOString(); return record; }
export const idempotencyStore = { records, ttlMs };
