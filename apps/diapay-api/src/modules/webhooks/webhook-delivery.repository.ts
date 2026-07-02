import crypto from 'crypto'; import type { WebhookDelivery } from './webhook.types';
const deliveries = new Map<string, WebhookDelivery>(); const id=(p:string)=>`${p}_${crypto.randomBytes(12).toString('hex')}`; const now=()=>new Date().toISOString();
export function createWebhookDelivery(input: Pick<WebhookDelivery,'eventId'|'endpointId'|'url'>){ const ts=now(); const d:WebhookDelivery={...input,id:id('del_test'),status:'pending',attemptCount:0,createdAt:ts,updatedAt:ts}; deliveries.set(d.id,d); return d; }
export function listWebhookDeliveries(){ return Array.from(deliveries.values()).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)); }
export function dueWebhookDeliveries(){ const n=Date.now(); return listWebhookDeliveries().filter((d)=>['pending','retrying','failed'].includes(d.status)&&(!d.nextAttemptAt||new Date(d.nextAttemptAt).getTime()<=n)); }
export function updateWebhookDelivery(id:string, patch:Partial<WebhookDelivery>){ const d=deliveries.get(id); if(!d)return undefined; Object.assign(d,patch,{updatedAt:now()}); return d; }
