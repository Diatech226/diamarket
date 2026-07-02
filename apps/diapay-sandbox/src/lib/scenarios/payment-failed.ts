import { makeScenario } from './types';
export const scenario = makeScenario({ id: 'payment-failed', title: 'Payment failed', description: 'Sandbox scenario for Payment failed. Mobile Money/provider flows are mock placeholders only.', category: 'payment', payload: { amount: 25000, currency: 'XOF', provider: 'mock', scenario: 'payment-failed', phoneNumber: '+2250700000000', operator: 'mock' }, expectedResult: 'failed', finalStatus: 'failed', ids: { paymentId: 'payment_payment-failed' } });
export default scenario;
