import { dueWebhookDeliveries } from './webhook-delivery.repository';
export async function runWebhookRetryOnce(){ return dueWebhookDeliveries().map((delivery)=>({deliveryId:delivery.id,status:'retry_placeholder',note:'Retry requires endpoint secret lookup in persistent storage; dispatcher records due deliveries.'})); }
