import { makeScenario } from './types';
export const scenario = makeScenario({ id: 'refund-full', title: 'Refund full', description: 'Sandbox scenario for Refund full. Mobile Money/provider flows are mock placeholders only.', category: 'refund', payload: { amount: 25000, currency: 'XOF', provider: 'mock', scenario: 'refund-full', phoneNumber: '+2250700000000', operator: 'mock' }, expectedResult: 'succeeded', finalStatus: 'succeeded', ids: { refundId: 'refund_refund-full' } });
export default scenario;
