# SECURITY - Diamarket Iteration 7

## Roles
- client
- vendeur
- marketplace_point_focal
- agent_logistique
- admin
- super_admin

## Permission system
Defined in `diamarket-api/src/config/permissions.ts` with `ROLE_PERMISSIONS` and middleware `requirePermission`.

## Vendor workflow
1. Vendor request (`/api/vendor-requests`)
2. Admin approval/rejection
3. Vendor profile created on approval
4. Vendor status lifecycle: pending/active/suspended/rejected

## Production safeguards
- Helmet
- Rate limiting
- Strict CORS origin checks
- Ownership guard
- Server-side permission checks
- Sensitive webhook verification required (Diapay/shipping secrets in env)

## ENV
- Never expose `DIAPAY_*` and shipping provider keys on frontend.
- Keep all secrets server-side only.
