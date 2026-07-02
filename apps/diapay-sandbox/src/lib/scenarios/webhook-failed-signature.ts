import { makeScenario } from './types';
export const scenario = makeScenario({ id: 'webhook-failed-signature', title: 'Webhook failed signature', description: 'Sandbox scenario for Webhook failed signature. Mobile Money/provider flows are mock placeholders only.', category: 'webhook', payload: { amount: 25000, currency: 'XOF', provider: 'mock', scenario: 'webhook-failed-signature', phoneNumber: '+2250700000000', operator: 'mock' }, expectedResult: 'rejected', finalStatus: 'rejected', ids: { eventId: 'event_webhook-failed-signature' } });
export default scenario;
