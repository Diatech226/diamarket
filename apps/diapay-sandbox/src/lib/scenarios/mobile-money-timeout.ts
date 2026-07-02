import { makeScenario } from './types';
export const scenario = makeScenario({ id: 'mobile-money-timeout', title: 'Wave timeout', description: 'Sandbox scenario for Wave timeout. Mobile Money/provider flows are mock placeholders only.', category: 'mobile-money', payload: { amount: 25000, currency: 'XOF', provider: 'mock', scenario: 'mobile-money-timeout', phoneNumber: '+2250700000000', operator: 'mock' }, expectedResult: 'provider_timeout', finalStatus: 'provider_timeout', ids: { paymentId: 'payment_mobile-money-timeout' } });
export default scenario;
