# Diapay Dashboard — endpoints API manquants

Le dashboard est préparé pour consommer `apps/diapay-api` via `src/lib/api.ts`. Les endpoints suivants existent déjà dans `apps/diapay-api/src/routes/index.ts` :

- `POST /api/v1/payments`
- `GET /api/v1/payments/:id`
- `POST /api/v1/payments/:id/cancel`
- `POST /api/v1/payments/:id/refund`
- `POST /api/v1/webhooks`
- `GET /api/v1/transactions`
- `GET /api/v1/balance`
- `POST /api/v1/payouts`
- `GET /api/v1/payment-methods`

## À ajouter pour une intégration complète

### Auth / RBAC
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/users`
- `PATCH /api/v1/users/:id/role`

### Dashboard analytics
- `GET /api/v1/dashboard/metrics?environment=test|live&period=30d`
- `GET /api/v1/dashboard/volume-series`

### Paiements
- `GET /api/v1/payments?status=&method=&from=&to=&customer=`
- `GET /api/v1/payments/:id/events`

### API keys
- `GET /api/v1/api-keys`
- `POST /api/v1/api-keys`
- `POST /api/v1/api-keys/:id/revoke`
- `PATCH /api/v1/api-keys/:id`

### Webhooks
- `GET /api/v1/webhooks`
- `PATCH /api/v1/webhooks/:id`
- `DELETE /api/v1/webhooks/:id`
- `GET /api/v1/webhooks/:id/deliveries`
- `POST /api/v1/webhooks/:id/rotate-secret`

### Customers
- `GET /api/v1/customers`
- `GET /api/v1/customers/:id`
- `GET /api/v1/customers/:id/payments`

### Refunds
- `GET /api/v1/refunds`
- `GET /api/v1/refunds/:id`

### Payouts
- `GET /api/v1/payouts`
- `GET /api/v1/payouts/:id`
- `POST /api/v1/payouts/:id/cancel`

### Settings
- `GET /api/v1/merchant/settings`
- `PATCH /api/v1/merchant/settings`
- `POST /api/v1/merchant/logo`
- `PATCH /api/v1/merchant/notifications`
