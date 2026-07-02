import { Router } from 'express';
import { getProviderAdapter, listProviderCapabilities } from './provider-registry';
import { providerWebhookNotConfigured } from './provider-errors';
export const providerRouter = Router();
providerRouter.get('/', (_req, res) => res.json(listProviderCapabilities()));
providerRouter.get('/:provider/capabilities', (req, res) => { const provider = getProviderAdapter(req.params.provider); if (!provider) throw providerWebhookNotConfigured(); res.json(provider.capabilities); });
providerRouter.post('/simulate', async (req, res) => { const provider = getProviderAdapter('mock')!; res.status(201).json(await provider.createPayment({ amount: Number(req.body.amount ?? 1000), currency: String(req.body.currency ?? 'XOF'), merchant: 'sandbox', method: 'mock', details: req.body, scenario: req.body.scenario })); });
