import { makeScenario } from './types';
export const scenario = makeScenario({ id: 'webhook-success', title: 'Webhook success', description: 'Sandbox scenario for Webhook success. Mobile Money/provider flows are mock placeholders only.', category: 'webhook', payload: { amount: 25000, currency: 'XOF', provider: 'mock', scenario: 'webhook-success', phoneNumber: '+2250700000000', operator: 'mock' }, expectedResult: 'delivered', finalStatus: 'delivered', ids: { eventId: 'event_webhook-success' } });
export default scenario;
