import type { LedgerOwnerType } from '../ledger/ledger.types';
export type Wallet = { id: string; ownerType: LedgerOwnerType; ownerId: string; currency: string; availableBalance: number; pendingBalance: number; reservedBalance: number; createdAt: string; updatedAt: string; source: 'in_memory_ledger_view' };
