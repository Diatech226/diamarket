import { makeScenario } from './types';
export const scenario = makeScenario({ id: 'mobile-money-otp', title: 'MTN OTP required', description: 'Sandbox scenario for MTN OTP required. Mobile Money/provider flows are mock placeholders only.', category: 'mobile-money', payload: { amount: 25000, currency: 'XOF', provider: 'mock', scenario: 'mobile-money-otp', phoneNumber: '+2250700000000', operator: 'mock' }, expectedResult: 'requires_action', finalStatus: 'requires_action', ids: { paymentId: 'payment_mobile-money-otp' } });
export default scenario;
