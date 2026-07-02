import { runWebhookRetryOnce } from '../modules/webhooks/webhook-retry.service';
export async function webhookRetryJob(){ return runWebhookRetryOnce(); }
