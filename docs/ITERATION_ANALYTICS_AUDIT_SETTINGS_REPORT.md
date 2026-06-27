# Itération 7 — Analytics, Audit Logs, Settings & Admin Control Center

## Références Stitch utilisées

- `stich-reference/15_analytics/rapports_de_ventes_desktop` pour les KPI, exports CSV/Excel, graphiques et tops.
- `stich-reference/15_analytics/gestion_des_avis_clients_desktop_optimis` pour la densité des cartes et les états analytiques.
- `stich-reference/11_audit/journaux_d_audit_desktop` et `_optimis` pour recherche, filtres, export, détail événement et alertes sécurité.
- `stich-reference/12_settings/param_tres_g_n_raux_desktop` et `_optimis` pour sections settings, SEO, maintenance et configuration globale.
- `stich-reference/09_email/configuration_des_notifications_desktop` pour les paramètres SMTP/notifications.

## Pages créées ou améliorées

- Analytics: `/analytics`, `/analytics/sales`, `/analytics/vendors`, `/analytics/products`, `/analytics/customers`, `/analytics/campaigns`.
- Audit logs: `/audit-logs`, `/audit-logs/[id]`.
- Users & roles: `/users`, `/users/[id]`, `/roles`, `/permissions`.
- Settings: `/settings`, `/settings/general`, `/settings/payments`, `/settings/shipping`, `/settings/email`, `/settings/security`, `/settings/seo`, `/settings/integrations`.
- System: `/system`, `/system/health`, `/system/env`, `/system/jobs`.

## Endpoints

- `GET /analytics/overview`, `/analytics/sales`, `/analytics/vendors`, `/analytics/products`, `/analytics/customers`.
- `GET /audit-logs`, `GET /audit-logs/:id`, `GET /audit-logs/export`.
- `GET /users`, `POST /users`, `PATCH /users/:id`, `GET /users/:id/audit-logs`.
- `GET /settings`, `PATCH /settings`.
- `GET /system/health`, `GET /system/jobs`, `GET /system/env`.

## Sécurité

- Les settings API refusent les clés sensibles via un motif `secret|password|mongodb|uri|token|api_key|jwt`.
- `/system/env` n’expose qu’une allowlist publique (`NODE_ENV`, `PORT`, `APP_*`, `PUBLIC_*`, `NEXT_PUBLIC_*`) et applique aussi le filtre anti-secret.
- Les endpoints administratifs Analytics/Audit/Settings restent derrière `requireAuth` + `requireAdmin`.
- Le dernier admin actif ne peut pas être rétrogradé ou désactivé via les contrôles existants.

## Limites restantes

- La création utilisateur CMS reste déclarée côté route mais dépend de la politique de persistance/authentification finale.
- Certains statuts d’intégration (Diapay, DiaExpress, SMTP) sont exposés en état prudent `unknown/warning` tant que les probes réels ne sont pas branchés.
- Les graphiques CMS utilisent un rendu CSS léger, sans dépendance charting externe.

## Tests effectués

- `npm --prefix apps/diamarket-cms run build`
- `npm --prefix apps/diamarket-web run build`
- `npm --prefix apps/diamarket-api run build`
