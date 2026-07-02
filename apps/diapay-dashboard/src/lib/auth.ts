import { ROLE_SCOPES, type MerchantRole } from '../../../../apps/diapay-api/src/modules/auth/scopes';

export type DashboardAuthContext = { merchantId: string; adminId: string; role: MerchantRole; permissions: string[]; environment: 'test' | 'live'; isAuthenticated: boolean };
export const demoDashboardAuthContext: DashboardAuthContext = { merchantId: 'mrc_demo', adminId: 'adm_demo_owner', role: 'owner', permissions: ROLE_SCOPES.owner, environment: 'test', isAuthenticated: true };
export function requireDashboardAuth(context: DashboardAuthContext = demoDashboardAuthContext) { if (!context.isAuthenticated) throw new Error('Dashboard authentication required'); return context; }
