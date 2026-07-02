import { makeScenario } from './types';
export const scenario = makeScenario({ id: 'checkout-success', title: 'Checkout success', description: 'Sandbox scenario for Checkout success. Mobile Money/provider flows are mock placeholders only.', category: 'checkout', payload: { amount: 25000, currency: 'XOF', provider: 'mock', scenario: 'checkout-success', phoneNumber: '+2250700000000', operator: 'mock' }, expectedResult: 'completed', finalStatus: 'completed', ids: { checkoutSessionId: 'checkoutSession_checkout-success' } });
export default scenario;
