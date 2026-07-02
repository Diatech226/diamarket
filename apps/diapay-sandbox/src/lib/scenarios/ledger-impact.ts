import { makeScenario } from './types';
export const scenario = makeScenario({ id: 'ledger-impact', title: 'Ledger impact', description: 'Sandbox scenario for Ledger impact. Mobile Money/provider flows are mock placeholders only.', category: 'ledger', payload: { amount: 25000, currency: 'XOF', provider: 'mock', scenario: 'ledger-impact', phoneNumber: '+2250700000000', operator: 'mock' }, expectedResult: 'balanced', finalStatus: 'balanced', ids: { paymentId: 'payment_ledger-impact' } });
export default scenario;
