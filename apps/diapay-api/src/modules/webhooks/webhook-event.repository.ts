import crypto from 'crypto'; import type { WebhookEvent } from './webhook.types'; import { sanitizePayload } from './webhook.validation';
const events = new Map<string, WebhookEvent>(); const providerSeen = new Set<string>(); const id=(p:string)=>`${p}_${crypto.randomBytes(12).toString('hex')}`; const now=()=>new Date().toISOString();
export function providerEventSeen(provider:string, providerEventId:string){ return providerSeen.has(`${provider}:${providerEventId}`); }
export function createWebhookEvent(input: Omit<WebhookEvent,'id'|'createdAt'|'payloadSanitized'|'livemode'> & { payload: unknown; livemode?: boolean }) { const evt: WebhookEvent={...input, id:id('evt_test'), payloadSanitized:sanitizePayload(input.payload), createdAt:now(), livemode: input.livemode ?? false}; events.set(evt.id, evt); if(evt.provider && evt.providerEventId) providerSeen.add(`${evt.provider}:${evt.providerEventId}`); return evt; }
export function listWebhookEvents(merchantId?:string){ return Array.from(events.values()).filter((e)=>!merchantId||e.merchantId===merchantId).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)); }
export function getWebhookEvent(id:string){ return events.get(id); }
export function updateWebhookEvent(id:string, patch:Partial<WebhookEvent>){ const evt=events.get(id); if(!evt) return undefined; Object.assign(evt, patch); return evt; }
