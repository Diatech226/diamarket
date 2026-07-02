import { makeScenario } from './types';
export const scenario = makeScenario({ id: 'webhook-duplicate', title: 'Webhook duplicate', description: 'Sandbox scenario for Webhook duplicate. Mobile Money/provider flows are mock placeholders only.', category: 'webhook', payload: { amount: 25000, currency: 'XOF', provider: 'mock', scenario: 'webhook-duplicate', phoneNumber: '+2250700000000', operator: 'mock' }, expectedResult: 'duplicate_ignored', finalStatus: 'duplicate_ignored', ids: { eventId: 'event_webhook-duplicate' } });
export default scenario;
