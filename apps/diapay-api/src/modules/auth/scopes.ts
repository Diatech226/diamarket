export const DIAPAY_SCOPES = [
  'payments:read','payments:write','refunds:read','refunds:write','checkout:read','checkout:write','wallets:read','ledger:read','webhooks:read','webhooks:write','api_keys:read','api_keys:write','applications:read','applications:write','merchants:read','merchants:write','sandbox:write',
] as const;
export type DiapayScope = typeof DIAPAY_SCOPES[number];
export type MerchantRole = 'owner' | 'admin' | 'developer' | 'finance' | 'support' | 'viewer';
const readScopes = DIAPAY_SCOPES.filter((scope) => scope.endsWith(':read'));
export const ROLE_SCOPES: Record<MerchantRole, DiapayScope[]> = {
  owner: [...DIAPAY_SCOPES],
  admin: DIAPAY_SCOPES.filter((scope) => scope !== 'merchants:write'),
  developer: ['api_keys:read','api_keys:write','webhooks:read','webhooks:write','sandbox:write','checkout:read','checkout:write','applications:read','applications:write'],
  finance: ['payments:read','refunds:read','refunds:write','wallets:read','ledger:read'],
  support: ['payments:read','refunds:read'],
  viewer: readScopes,
};
export function hasScopes(granted: string[] = [], required: DiapayScope[] = []) { return required.every((scope) => granted.includes(scope)); }
