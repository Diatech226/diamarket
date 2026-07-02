import { makeScenario } from './types';
export const scenario = makeScenario({ id: 'payment-success', title: 'Payment success', description: 'Sandbox scenario for Payment success. Mobile Money/provider flows are mock placeholders only.', category: 'payment', payload: { amount: 25000, currency: 'XOF', provider: 'mock', scenario: 'payment-success', phoneNumber: '+2250700000000', operator: 'mock' }, expectedResult: 'paid', finalStatus: 'paid', ids: { paymentId: 'payment_payment-success' } });
export default scenario;
