import crypto from 'crypto';
import type { WebhookEndpoint } from './webhook.types';
const endpoints = new Map<string, WebhookEndpoint>();
const id = (p:string)=>`${p}_${crypto.randomBytes(12).toString('hex')}`; const now=()=>new Date().toISOString();
export function mask(endpoint: WebhookEndpoint, reveal = false) { const { secret, ...rest } = endpoint; return reveal ? { ...rest, secret } : rest; }
export function listWebhookEndpoints(merchantId?: string) { return Array.from(endpoints.values()).filter((e)=>!merchantId || e.merchantId===merchantId); }
export function getWebhookEndpoint(id: string) { return endpoints.get(id); }
export function createWebhookEndpoint(input: { merchantId: string; applicationId?: string; url: string; description?: string; events?: string[] }) { const ts=now(); const ep: WebhookEndpoint={ id:id('we_test'), merchantId:input.merchantId, applicationId:input.applicationId, url:input.url, description:input.description, enabled:true, events: input.events?.length ? input.events : ['payment.paid','payment.failed'], secret:id('whsec_test'), createdAt:ts, updatedAt:ts }; endpoints.set(ep.id, ep); return ep; }
export function updateWebhookEndpoint(id: string, patch: Partial<Pick<WebhookEndpoint,'url'|'description'|'enabled'|'events'>>) { const ep=endpoints.get(id); if(!ep) return undefined; Object.assign(ep, patch, { updatedAt: now() }); return ep; }
export function deleteWebhookEndpoint(id: string) { return endpoints.delete(id); }
