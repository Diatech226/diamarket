# DIAPAY — Contrat public API v1

Date: 2026-07-02  
Source de vérité de cette itération: routes Express legacy conservées sous `/api/v1`, audit interne Diapay, et tests contractuels.

## Format de réponse stabilisé

Succès:

```json
{ "success": true, "data": {}, "message": "OK" }
```

Erreur:

```json
{ "success": false, "message": "...", "error": { "code": "...", "details": {} } }
```

Une couche de compatibilité enveloppe les réponses legacy sans déplacer brutalement la logique métier.

## Endpoints publics figés

| Méthode | URL | Auth requise | Payload | Succès | Erreur | Statuts | Effets métier | Stabilité |
|---|---|---|---|---|---|---|---|---|
| GET | `/health` | Non | Aucun | état du service | erreur JSON | 200, 500 | Healthcheck Render/runtime | Stable |
| GET | `/api/v1/config` | Non | Aucun | `apiBaseUrl`, `checkoutBaseUrl` | erreur JSON | 200, 500 | Expose config publique sandbox | Stable |
| POST | `/api/v1/checkout/sessions` | Optionnelle Bearer test | `amount`, `currency`, `successUrl`, `cancelUrl`, customer/items/metadata optionnels | session checkout | validation | 201, 400, 500 | Crée une session checkout en mémoire, supporte `Idempotency-Key` | Stable |
| GET | `/api/v1/checkout/sessions` | Non | query `merchant` optionnelle | liste sessions | erreur JSON | 200, 500 | Liste les sessions sandbox | Partiel |
| GET | `/api/v1/checkout/sessions/:id` | Non | Aucun | session checkout | introuvable | 200, 403, 404, 500 | Lit et rafraîchit l'expiration | Stable |
| POST | `/api/v1/checkout/sessions/:id/complete` | Non | `method` et détails provider | session + payment | conflit/validation | 200, 400, 404, 409, 500 | Crée un paiement provider mock et webhooks éventuels | Stable |
| POST | `/api/v1/checkout/sessions/:id/cancel` | Non | merchant optionnel | session annulée | conflit/introuvable | 200, 404, 409, 500 | Annule la session et émet webhook éventuel | Stable |
| POST | `/api/v1/payments` | Optionnelle Bearer test | `amount`, `currency`, `method`, customer/metadata optionnels | paiement | validation | 201, 400, 500 | Crée un paiement direct sandbox | Stable |
| GET | `/api/v1/payments/:id` | Non | Aucun | paiement | introuvable | 200, 404, 500 | Lit le paiement | Stable |
| POST | `/api/v1/payments/:id/cancel` | Non | Aucun | paiement annulé | introuvable | 200, 404, 500 | Annule via provider si disponible | Partiel |
| POST | `/api/v1/payments/:id/refund` | Non | `amount`, `reason`, metadata optionnels | paiement remboursé | introuvable | 200, 404, 500 | Compatibilité legacy de remboursement sur paiement | Partiel |
| POST | `/api/v1/refunds` | Non | `paymentId`, `amount`, `reason`, metadata optionnels | refund | validation/introuvable | 201, 400, 404, 500 | Crée une ressource refund sandbox liée à un paiement | Stable |
| GET | `/api/v1/refunds/:id` | Non | Aucun | refund | introuvable | 200, 404, 500 | Lit un refund sandbox | Stable |
| POST | `/api/v1/webhooks` | Optionnelle Bearer test | `url`, `events` | endpoint webhook | validation | 201, 400, 500 | Enregistre un endpoint webhook en mémoire | Partiel |
| GET | `/api/v1/webhook-events` | Non | Aucun | événements webhook | erreur JSON | 200, 500 | Liste événements webhook émis | Partiel |
| GET | `/api/v1/transactions` | Non | Aucun | transactions dérivées | erreur JSON | 200, 500 | Vue transactionnelle dérivée des paiements | Partiel |
| GET | `/api/v1/balance` | Non | Aucun | solde mock | erreur JSON | 200, 500 | Retourne un solde sandbox non financier réel | Dangereux si confondu avec production |
| POST | `/api/v1/payouts` | Non | Non strict | payout mock | erreur JSON | 201, 500 | Crée une réponse payout mock | Dangereux si confondu avec production |
| GET | `/api/v1/payment-methods` | Non | Aucun | méthodes supportées | erreur JSON | 200, 500 | Liste providers/méthodes sandbox | Stable |
| GET | `/api/v1/providers` | Non | Aucun | configs providers | erreur JSON | 200, 500 | Liste les providers sandbox | Stable |
| POST | `/api/v1/marketplace/split-payment` | Non | split marketplace | paiement split | validation | 201, 400, 500 | Simule split/escrow marketplace | Partiel |
| POST | `/api/v1/marketplace/vendors` | Non | données vendor | vendor | validation | 201, 400, 500 | Crée vendeur sandbox | Partiel |
| GET | `/api/v1/marketplace/vendors` | Non | Aucun | vendors | erreur JSON | 200, 500 | Liste vendeurs | Partiel |
| GET | `/api/v1/marketplace/vendors/:id/wallet` | Non | Aucun | wallet | introuvable | 200, 404, 500 | Lit wallet vendeur | Partiel |
| POST | `/api/v1/marketplace/payouts` | Non | payout marketplace | payout | validation | 201, 400, 500 | Simule payout vendeur | Dangereux si confondu production |
| GET | `/api/v1/marketplace/payouts` | Non | Aucun | payouts | erreur JSON | 200, 500 | Liste payouts marketplace | Partiel |
| POST | `/api/v1/marketplace/escrow/release` | Non | escrow id | résultat | validation | 200, 400, 500 | Libère escrow sandbox | Dangereux |
| POST | `/api/v1/marketplace/escrow/refund` | Non | escrow id | résultat | validation | 200, 400, 500 | Rembourse escrow sandbox | Dangereux |
| GET | `/api/v1/marketplace/escrow` | Non | Aucun | holds escrow | erreur JSON | 200, 500 | Liste escrows | Partiel |
| GET | `/api/v1/marketplace/ledger` | Non | Aucun | ledger | erreur JSON | 200, 500 | Liste ledger non double-entry durable | Dangereux |
| GET | `/api/v1/marketplace/wallets` | Non | Aucun | wallets | erreur JSON | 200, 500 | Liste wallets sandbox | Dangereux |
| GET | `/api/v1/marketplace/timeline` | Non | Aucun | timeline | erreur JSON | 200, 500 | Timeline marketplace | Partiel |
| GET | `/api/v1/marketplace/analytics` | Non | Aucun | analytics | erreur JSON | 200, 500 | Analytics sandbox | Partiel |
| GET/POST | `/api/v1/merchants` | Non | merchant en POST | liste ou merchant | validation | 200, 201, 400, 500 | Gestion merchants in-memory | Partiel |
| GET/POST | `/api/v1/merchant-admins` | Non | admin en POST | liste ou admin | validation | 200, 201, 400, 500 | Gestion admins in-memory | Partiel |
| GET/POST | `/api/v1/apps` | Non | app en POST | liste ou app | validation | 200, 201, 400, 500 | Gestion apps in-memory | Partiel |
| GET/POST | `/api/v1/api-keys` | Non | key request en POST | clés masquées | validation | 200, 201, 400, 500 | Gestion clés dev sandbox | Dangereux sans auth forte |
| DELETE | `/api/v1/api-keys/:id` | Non | Aucun | suppression | introuvable | 200, 404, 500 | Supprime clé en mémoire | Dangereux sans auth forte |
| POST | `/api/v1/api-keys/:id/rotate` | Non | Aucun | clé rotée | introuvable | 200, 404, 500 | Rotation clé sandbox | Dangereux sans auth forte |
| GET | `/api/v1/logs` | Non | Aucun | logs | erreur JSON | 200, 500 | Liste logs dev platform | Partiel |

## Notes de compatibilité

Les URLs publiques ne sont pas renommées. Les routes restent dans le routeur legacy temporaire avec le commentaire: `Legacy route kept for compatibility during Diapay restructuring.`

## Itération 2 — normalisation checkout, payments et refunds

Les endpoints publics checkout, payments et refunds restent inchangés sous `/api/v1`. Leur implémentation est maintenant branchée sur des modules internes dédiés avec repositories adaptant encore le store legacy en mémoire.

### Statuts paiement officiels

`created`, `pending`, `processing`, `requires_action`, `paid`, `failed`, `cancelled`, `expired`, `refunded`, `partially_refunded`, `disputed`, `chargeback`.

Les anciens statuts sandbox restent acceptés en compatibilité et sont normalisés en interne: `succeeded` est traité comme `paid`, `open` comme `pending`, et `canceled` comme `cancelled`.

### Refunds

`POST /api/v1/refunds` crée une ressource refund liée à un paiement payé. Un remboursement partiel passe le paiement en `partially_refunded`; un remboursement total passe le paiement en `refunded`. Un refund supérieur au montant payé, un refund sur paiement inexistant, ou un refund sur paiement non payé retourne une enveloppe d'erreur standard.

### Erreurs de validation

Les validations runtime des modules retournent l'enveloppe uniforme:

```json
{
  "success": false,
  "message": "Invalid payment payload",
  "error": { "code": "VALIDATION_ERROR", "details": {} }
}
```
