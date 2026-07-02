import { ledgerRepository } from '../ledger/ledger.repository';
function sum(type: string) { return ledgerRepository.listAccounts().filter((a) => a.accountType === type).reduce((total, a) => total + Math.abs(a.balance), 0); }
export class BalanceService { getBalances() { return { source: 'in_memory_ledger_view', productionReady: false, merchantPendingBalance: sum('merchant_pending'), merchantAvailableBalance: sum('merchant_available'), platformFees: sum('platform_fees'), providerClearingBalance: sum('provider_clearing'), refundLiabilities: sum('merchant_refunds') }; } }
export const balanceService = new BalanceService();
