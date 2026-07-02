import type { DiapayEventType } from './webhook-status'; import { createWebhookEvent, listWebhookEvents } from './webhook-event.repository'; import { deliverWebhook } from './webhook-dispatcher.service';
export async function emitMerchantEvent(type: DiapayEventType|string, merchantId:string, data:unknown, applicationId?:string){ const event=createWebhookEvent({type,source:'internal',merchantId,applicationId,status:'processed',processedAt:new Date().toISOString(),payload:data,data}); await deliverWebhook(event); return event; }
export { listWebhookEvents };
