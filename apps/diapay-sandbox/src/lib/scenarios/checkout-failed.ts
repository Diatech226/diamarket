import { makeScenario } from './types';
export const scenario = makeScenario({ id: 'checkout-failed', title: 'Checkout failed', description: 'Sandbox scenario for Checkout failed. Mobile Money/provider flows are mock placeholders only.', category: 'checkout', payload: { amount: 25000, currency: 'XOF', provider: 'mock', scenario: 'checkout-failed', phoneNumber: '+2250700000000', operator: 'mock' }, expectedResult: 'failed', finalStatus: 'failed', ids: { checkoutSessionId: 'checkoutSession_checkout-failed' } });
export default scenario;
