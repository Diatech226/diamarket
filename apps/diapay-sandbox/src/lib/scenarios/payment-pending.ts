import { makeScenario } from './types';
export const scenario = makeScenario({ id: 'payment-pending', title: 'Payment pending', description: 'Sandbox scenario for Payment pending. Mobile Money/provider flows are mock placeholders only.', category: 'payment', payload: { amount: 25000, currency: 'XOF', provider: 'mock', scenario: 'payment-pending', phoneNumber: '+2250700000000', operator: 'mock' }, expectedResult: 'pending', finalStatus: 'pending', ids: { paymentId: 'payment_payment-pending' } });
export default scenario;
