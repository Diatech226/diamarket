import { Router } from 'express';
import { getProviderAdapter } from './provider-registry';
import { providerWebhookNotConfigured } from './provider-errors';
export const providerWebhookRouter = Router();
providerWebhookRouter.post('/:provider', async (req, res) => { const provider = getProviderAdapter(req.params.provider); if (!provider?.parseWebhook) throw providerWebhookNotConfigured(); res.json(await provider.parseWebhook({ headers: req.headers, body: req.body })); });
