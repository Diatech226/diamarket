# DIAPAY — Itération 6 : Merchant Auth, API Keys & Dashboard Foundation

Date: 2026-07-02

## Synthèse

Cette itération renforce l'accès marchand en conservant la migration progressive et les endpoints `/api/v1`. Les données restent en mémoire, mais les modèles marchands, applications, admins, scopes et clés API disposent maintenant d'une base cohérente pour le dashboard, le sandbox et les SDK.

## Modules créés ou renforcés

- `apps/diapay-api/src/modules/auth/scopes.ts`: scopes centraux et mapping rôles → permissions.
- `apps/diapay-api/src/modules/merchants`: types/modèle Merchant.
- `apps/diapay-api/src/modules/merchant-admins`: types MerchantAdmin.
- `apps/diapay-api/src/modules/applications`: types Application.
- `apps/diapay-api/src/modules/api-keys`: types APIKey et middleware `apiKeyAuthMiddleware`.

## Modèles

### Merchant

Champs: `id`, `name`, `businessName`, `country`, `defaultCurrency`, `status`, `livemodeEnabled`, `createdAt`, `updatedAt`. Statuts: `pending`, `active`, `suspended`, `rejected`, `closed`.

### MerchantAdmin

Champs: `id`, `merchantId`, `email`, `name`, `role`, `status`, `createdAt`, `updatedAt`. Rôles: `owner`, `admin`, `developer`, `finance`, `support`, `viewer`. Statuts: `invited`, `active`, `disabled`, `removed`.

### Application

Champs: `id`, `merchantId`, `name`, `environment`, `status`, `allowedOrigins`, `webhookDefaultUrl`, `createdAt`, `updatedAt`. Environnements: `test`, `live`. Statuts: `active`, `disabled`, `archived`.

### APIKey

Champs: `id`, `merchantId`, `applicationId`, `name`, `type`, `environment`, `prefix`, `keyHash`, `last4`, `scopes`, `status`, `createdAt`, `updatedAt`, `lastUsedAt`, `revokedAt`. Le champ `keyHash` n'est jamais renvoyé par les endpoints de listing.

## Sécurité des clés

- Formats supportés: `pk_test_*`, `sk_test_*`, `rk_test_*`, `pk_live_*`, `sk_live_*`, `rk_live_*`.
- Le secret complet n'est renvoyé qu'à la création ou rotation.
- Le stockage utilise PBKDF2-SHA256 avec pepper applicatif (`DIAPAY_API_KEY_PEPPER`) et ne conserve pas la clé en clair.
- Les réponses ultérieures exposent seulement `prefix`, `last4` et `maskedKey`.
- Révocation et rotation sont disponibles; une rotation révoque l'ancienne clé.
- `lastUsedAt` est mis à jour par l'authentification API key.

## Scopes et rôles

Scopes: `payments:read`, `payments:write`, `refunds:read`, `refunds:write`, `checkout:read`, `checkout:write`, `wallets:read`, `ledger:read`, `webhooks:read`, `webhooks:write`, `api_keys:read`, `api_keys:write`, `applications:read`, `applications:write`, `merchants:read`, `merchants:write`, `sandbox:write`.

Le mapping couvre owner, admin, developer, finance, support et viewer.

## Test/live mode

- Le test mode reste le défaut.
- Les applications et clés live sont refusées si `livemodeEnabled=false`.
- Les clés sont liées à `merchantId`, `applicationId` et `environment`.
- Le sandbox documente le mode test, le merchant test, l'application test et la clé masquée.

## Endpoints et protection progressive

Ajouts/renforcements:

- `GET|POST /api/v1/applications`
- `GET|PATCH|DELETE /api/v1/applications/:id`
- Alias legacy maintenus sous `/api/v1/apps`.
- `GET|POST|DELETE|POST rotate /api/v1/api-keys` conservés avec réponses masquées.
- Middleware `apiKeyAuthMiddleware(requiredScopes)` prêt pour protéger progressivement checkout, payments, refunds, wallets, ledger, balances, webhooks et API keys sans casser le sandbox.

## Dashboard

- Ajout d'une abstraction `DashboardAuthContext` avec `merchantId`, `adminId`, `role`, `permissions`, `environment`, `isAuthenticated`.
- Les fixtures de clés et secrets webhook sont masquées.
- Les pages `/dashboard`, `/payments`, `/transactions`, `/wallets`, `/revenue`, `/api-keys`, `/apps`, `/developers`, `/webhooks`, `/settings` existent et restent partiellement alimentées par fixtures.

## Sandbox

- Le sandbox affiche clairement le mode test, merchant test, application test et clé `sk_test` masquée.
- Les scénarios listent checkout/payment/refund/webhook avec clé test, clé absente et scope insuffisant comme cas à vérifier.

## SDK JS et Node

Méthodes ajoutées sans retirer les exports existants:

- `listApiKeys()`
- `createApiKey()`
- `revokeApiKey()`
- `listApplications()`
- `createApplication()`
- `updateApplication()`
- `listMerchantAdmins()`
- `getCurrentMerchant()`

Le client accepte toujours `new Diapay({ secretKey: "sk_test_..." })` et ne logge pas la clé.

## Limites restantes

- Persistance in-memory, non production-ready.
- Auth dashboard complète (Clerk/session réelle) encore partielle.
- Middleware API key prêt mais non appliqué à toutes les routes sensibles pour éviter de casser les flows sandbox existants dans cette itération progressive.
- Pas de rate limiting durable ni audit log persistant.

## Prochaine itération recommandée

Brancher la persistance transactionnelle, appliquer le middleware scope par scope aux endpoints sensibles, ajouter des tests contractuels OpenAPI générés, connecter l'auth dashboard réelle et introduire un audit log durable des accès marchands.
