import { makeScenario } from './types';
export const scenario = makeScenario({ id: 'refund-partial', title: 'Refund partial', description: 'Sandbox scenario for Refund partial. Mobile Money/provider flows are mock placeholders only.', category: 'refund', payload: { amount: 25000, currency: 'XOF', provider: 'mock', scenario: 'refund-partial', phoneNumber: '+2250700000000', operator: 'mock' }, expectedResult: 'succeeded', finalStatus: 'succeeded', ids: { refundId: 'refund_refund-partial' } });
export default scenario;
