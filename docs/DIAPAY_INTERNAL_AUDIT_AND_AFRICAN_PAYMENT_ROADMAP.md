# DIAPAY — Audit interne critique et roadmap africaine de paiement

Date: 2026-06-20  
Périmètre: `apps/diapay-api`, `apps/diapay-dashboard`, `apps/diapay-sandbox`, `packages/diapay-sdk-js`, documentation Diapay, `.env.example`, scripts, routes, modèles, contrôleurs, services, providers, webhooks, tests, et intégrations paiement Diamarket/DiaExpress.

## 0. Verdict exécutif brutal

Diapay n'est **pas** une API de paiement prête pour staging sérieux ni production. C'est un **prototype sandbox en mémoire**, utile pour démontrer des écrans, des checkout sessions et un SDK local, mais dangereux s'il est présenté comme infrastructure financière.

Ce qui marche: serveur Express, création de checkout session, paiement direct mock, remboursements mock, dashboard de démonstration, sandbox Next, SDK TypeScript partiel, premières intégrations Diamarket/DiaExpress.

Ce qui ne marche pas pour une vraie API: pas de persistance, pas de vraie authentification, pas de hash de clés API, pas de ledger double-entry exploitable, pas de réception webhook provider, pas d'idempotence robuste par marchand/opération, pas de statuts normalisés, pas de providers réels, pas de reconciliation, pas de KYC/KYB, pas de settlement, pas de monitoring production.

Ce qui est dangereux: `cors()` ouvert, secrets et clés de démonstration affichés côté dashboard, webhooks sortants sans timestamp anti-replay, endpoint de création webhook non authentifié réellement, paiements/remboursements en mémoire, statuts `succeeded` mélangés à une cible métier `paid`, dashboard rempli de données fictives qui ressemblent à des données live.

Conclusion: Diapay doit être traité comme **prototype POC / sandbox local uniquement**. Avant d'encaisser 1 FCFA réel, il faut reconstruire le noyau: auth, clés, idempotence, providers, statuts, ledger, webhooks, stockage, audit logs.

## 1. Vision produit cible

Diapay doit devenir une **API africaine de paiement unifiée**, capable d'orchestrer plusieurs moyens de paiement locaux et internationaux avec un seul contrat développeur:

- mobile money: Orange Money, Moov Money, Wave, MTN MoMo, opérateurs par pays;
- cartes bancaires via acquéreur/PSP tokenisé;
- crypto/stablecoins uniquement si autorisé légalement, avec compliance forte;
- paiements marchands, marketplace, transferts, paiements transfrontaliers, payouts futurs;
- intégration native Diamarket et DiaExpress.

### Clients

- payer avec Orange Money, Moov Money, Wave, carte ou crypto autorisée;
- confirmer par OTP, USSD prompt, redirection 3DS ou preuve provider;
- recevoir statut clair, reçu, support et remboursement si nécessaire;
- payer même sans email: téléphone + pays + devise doivent être des identifiants de premier rang.

### Marchands

- accepter plusieurs moyens de paiement via une API unique;
- suivre transactions, remboursements, litiges, frais, soldes et reçus;
- configurer webhooks signés, API keys, environnement test/live;
- recevoir les fonds selon calendrier settlement/payout.

### Marketplaces

- encaisser une commande;
- répartir commissions plateforme, frais Diapay, vendeurs, réserve et escrow;
- payer vendeurs plus tard;
- gérer refunds, disputes et chargebacks;
- conserver un ledger vérifiable.

### Diaspora

- payer depuis l'étranger une commande locale Diamarket ou une livraison DiaExpress;
- utiliser carte/crypto autorisée à l'étranger;
- permettre au marchand local de recevoir en XOF/GHS/NGN selon pays;
- gérer FX, preuve de paiement, remboursement et conformité.

## 2. Architecture actuelle — audit `apps/diapay-api`

| Module | Existe | Fonctionne | Partiel | Cassé | Dangereux | Recommandation |
|---|---:|---:|---:|---:|---:|---|
| Serveur Express | Oui | Oui local | Oui | Non | Oui | Garder, mais ajouter sécurité, versioning, erreurs, requestId. |
| Auth | Faux | Non | Oui | Oui | Oui | Remplacer `resolveMerchant` par auth API key hashée + scopes. |
| API keys | Modèle vide | Non | Non | Oui | Oui | Créer `APIKey` persistant: public/secret, hash, scopes, rotation. |
| Applications clientes | Non | Non | Non | Oui | Moyen | Ajouter `Application` par marchand avec callback URLs. |
| Merchants | Modèle vide | Non | Non | Oui | Oui | Créer vrai modèle Merchant/KYB/status/country/currencies. |
| Wallets | Types + marketplace mock | Non fiable | Oui | Oui | Oui | Reconstruire autour d'un ledger double-entry. |
| Payments | Oui | Mock | Oui | Non | Oui | Persister, normaliser statuts, attempts, provider refs. |
| Checkout sessions | Oui | Local | Oui | Non | Moyen | Garder concept, renforcer idempotence, expiration, customer phone. |
| Refunds | Endpoint mock | Local | Oui | Oui | Oui | Créer ressource Refund séparée, statuts, ledger reversal. |
| Webhooks sortants | Oui | Basique | Oui | Non | Oui | Ajouter signature standard, timestamp, retry, DLQ, event log. |
| Webhooks providers entrants | Non | Non | Non | Oui | Critique | Ajouter `POST /api/v1/webhooks/:provider` vérifié. |
| Providers | Mock par méthode | Oui mock | Oui | Non | Oui | Passer à adapters réels + contrats provider. |
| Payouts | Endpoint fake | Non | Oui | Oui | Oui | Désactiver ou marquer explicitement non-production. |
| Settlement | Non | Non | Non | Oui | Critique | Modèle Settlement obligatoire avant production. |
| Ledger | Types marketplace | Non fiable | Oui | Oui | Critique | Implémenter double-entry atomique. |
| Logs/audit | Morgan | Non | Oui | Oui | Majeur | AuditLog structuré, pas de données sensibles. |
| Sandbox | Oui | Démo | Oui | Non | Moyen | En faire un vrai simulateur provider et webhook. |
| Dashboard | Oui | Démo | Oui | Non | Moyen | Brancher sur API réelle ou distinguer clairement les mocks. |
| SDK | Oui | Buildable partiel | Oui | Non | Moyen | Corriger endpoints inexistants, ESM/CJS, verify webhook. |

## 3. Contrat API existant

Base réelle actuelle: `/api/v1`, pas `/api`. Les endpoints demandés sans `/v1` n'existent pas actuellement.

| Méthode | Endpoint | Auth | Description | Body attendu | Réponse | État | Problème |
|---|---|---|---|---|---|---|---|
| GET | `/health` | Non | Santé service | Aucun | `{service,status}` | OK local | Pas readiness DB/provider. |
| GET | `/api/v1/config` | Non | Config publique | Aucun | URLs | OK | Peut divulguer mauvais environnement. |
| POST | `/api/v1/checkout/sessions` | Bearer optionnel, non vérifié | Crée session | `amount,currency,successUrl,cancelUrl` | Session | Partiel | Auth faible, idempotence globale, stockage mémoire. |
| GET | `/api/v1/checkout/sessions` | Non | Liste sessions | Query `merchant` | Sessions | Dangereux | Expose tout sans auth. |
| GET | `/api/v1/checkout/sessions/:id` | Non | Détail session | Aucun | Session | Dangereux | Pas ownership réel. |
| POST | `/api/v1/checkout/sessions/:id/complete` | Non | Simule paiement checkout | `method,phone,cardNumber,forceStatus` | `{session,payment}` | Partiel | Peut compléter sans authentification. |
| POST | `/api/v1/checkout/sessions/:id/cancel` | Non | Annule session | optionnel `merchant` | Session | Partiel | Pas ownership. |
| POST | `/api/v1/payments` | Bearer optionnel, non vérifié | Paiement direct | `amount,currency,method` | Payment | Partiel | Pas idempotence, pas provider réel. |
| GET | `/api/v1/payments/:id` | Non | Détail paiement | Aucun | Payment | Dangereux | Lecture sans auth. |
| POST | `/api/v1/payments/:id/cancel` | Non | Annule paiement | Aucun | Payment | Partiel | Pas règles de transition strictes. |
| POST | `/api/v1/payments/:id/refund` | Non | Refund mock | `amount,reason` | Payment muté | Dangereux | Pas ressource Refund, pas ledger, pas auth. |
| POST | `/api/v1/webhooks` | Bearer optionnel | Crée endpoint webhook marchand | `url,events` | WebhookEndpoint avec secret | Partiel | Secret retourné et stocké clair, pas ownership. |
| GET | `/api/v1/webhook-events` | Non | Liste événements | Aucun | Events | Dangereux | Expose payloads/attempts. |
| GET | `/api/v1/transactions` | Non | Transactions dérivées paiements | Aucun | Liste calculée | Faux | Pas vraie transaction. |
| GET | `/api/v1/balance` | Non | Solde | Aucun | `0 XOF` | Faux | Pas wallet réel. |
| POST | `/api/v1/payouts` | Non | Payout mock | ignoré | `{po_mock_1}` | Faux | Très dangereux si présenté. |
| GET | `/api/v1/payment-methods` | Non | Méthodes | Aucun | Descriptors | OK sandbox | Pas règles par pays/devise. |
| GET | `/api/v1/providers` | Non | Providers | Aucun | Descriptors | OK sandbox | Tous mocks. |
| POST | `/api/v1/marketplace/split-payment` | Non | Split marketplace | `amount,currency,splits` | SplitPayment | Prototype | En mémoire, ledger non comptable. |
| GET/POST | `/api/v1/marketplace/*` | Non | Vendors, wallets, payouts, escrow, ledger, analytics | Variable | Mock/state | Prototype | Pas auth, pas persistance. |
| POST | `/api/checkout/sessions` | N/A | Demandé | N/A | N/A | Absent | Existe seulement en `/api/v1`. |
| GET | `/api/checkout/sessions/:id` | N/A | Demandé | N/A | N/A | Absent | Existe seulement en `/api/v1`. |
| POST | `/api/payments` | N/A | Demandé | N/A | N/A | Absent | Existe seulement en `/api/v1`. |
| GET | `/api/payments/:id` | N/A | Demandé | N/A | N/A | Absent | Existe seulement en `/api/v1`. |
| POST | `/api/payments/:id/refund` | N/A | Demandé | N/A | N/A | Absent | Existe seulement en `/api/v1`. |
| POST | `/api/webhooks/:provider` | N/A | Provider webhook entrant | N/A | N/A | Absent | Critique. |
| GET | `/api/merchants` | N/A | Marchands | N/A | N/A | Absent | Critique pour dashboard/admin. |
| GET | `/api/wallets` | N/A | Wallets | N/A | N/A | Absent | Seulement marketplace `/api/v1/marketplace/wallets`. |
| GET | `/api/transactions` | N/A | Transactions | N/A | N/A | Absent | Existe seulement `/api/v1/transactions`, non fiable. |

## 4. Providers

| Provider | Existe | Fonctionne | Sandbox | Webhook | Refund | Statuts | Problèmes |
|---|---:|---:|---:|---:|---:|---|---|
| stripe | Non | Non | Non | Non | Non | N/A | Aucun adapter carte réel. |
| orange_money | Non | Non | Non | Non | Non | N/A | Mobile money africain non connecté. |
| moov_money | Non | Non | Non | Non | Non | N/A | Absent. |
| wave | Non | Non | Non | Non | Non | N/A | Absent. |
| crypto | Mock | Oui local | Oui | Non entrant | Mock | `succeeded/processing/failed` | Pas custody, pas chain monitoring, compliance absente. |
| mock | Oui | Oui | Oui | Sortant seulement | Mock | Incomplet | Force success par défaut: dangereux pour tests réalistes. |
| bank | Bank-card + transfer mocks | Oui local | Oui | Non entrant | Card mock | Incomplet | Pas tokenisation, PCI, 3DS réel, virement réconciliation absent. |
| mobile-money générique | Mock | Oui local | Oui | Non entrant | Mock | Incomplet | Ne modélise pas opérateur/pays/OTP/USSD/callback/plafonds. |

Critique: provider abstraction existe mais reste cosmétique. Elle n'a pas de vérification webhook, pas de normalisation provider events, pas de retry, pas d'idempotence provider, pas de secret management, pas d'enregistrement des `PaymentAttempt`.

## 5. Statuts paiement actuels et taxonomie cible

Statuts actuels: `requires_action`, `processing`, `succeeded`, `failed`, `cancelled`, `expired`, `refunded`. Sessions: `created`, `open`, `completed`, `cancelled`, `expired`.

Problème: `succeeded/completed/open` ne correspondent pas au vocabulaire cible `paid/pending/created`. Il faut séparer `CheckoutSessionStatus`, `PaymentIntentStatus`, `PaymentAttemptStatus`, `RefundStatus`.

| Statut cible | Sens | Visible client | Visible marchand | Terminal | Transitions autorisées |
|---|---|---:|---:|---:|---|
| `created` | Objet créé, aucun provider appelé | Oui | Oui | Non | `pending`, `processing`, `expired`, `cancelled` |
| `pending` | En attente d'action client/provider | Oui | Oui | Non | `processing`, `requires_action`, `paid`, `failed`, `expired`, `cancelled` |
| `processing` | Provider traite de façon asynchrone | Oui | Oui | Non | `paid`, `failed`, `requires_action`, `expired` |
| `requires_action` | OTP, USSD, 3DS, redirection requise | Oui | Oui | Non | `processing`, `paid`, `failed`, `expired`, `cancelled` |
| `paid` | Fonds capturés/confirmés | Oui | Oui | Oui sauf refund/dispute | `partially_refunded`, `refunded`, `disputed`, `chargeback` |
| `failed` | Paiement échoué | Oui | Oui | Oui | Aucun, créer nouveau paiement/attempt |
| `cancelled` | Annulé avant paiement | Oui | Oui | Oui | Aucun |
| `expired` | Délai dépassé | Oui | Oui | Oui | Aucun |
| `refunded` | Remboursement total | Oui | Oui | Oui | `disputed` rare selon provider |
| `partially_refunded` | Remboursement partiel | Oui | Oui | Non | `refunded`, `disputed`, `chargeback` |
| `disputed` | Litige ouvert | Oui simplifié | Oui | Non | `paid`, `chargeback`, `refunded` |
| `chargeback` | Perte/contrepassation | Oui | Oui | Oui | Aucun sauf ajustement ledger manuel contrôlé |

## 6. Paiement Afrique — réalité terrain

| Besoin africain | Pris en charge | Partiel | Absent | Impact | Priorité |
|---|---:|---:|---:|---|---|
| Numéro téléphone obligatoire/central | Non | Oui via champ libre | Oui | Impossible de fiabiliser mobile money | P0 |
| Opérateur explicite | Non | `network` libre | Oui | Routage provider impossible | P0 |
| Pays | Providers descriptors | Non dans Payment | Oui | Règles devise/plafond impossibles | P0 |
| Devise XOF/GHS/NGN | Oui | Oui | Non | Base utile | P0 |
| OTP / prompt USSD | Non réel | Mock message | Oui | Expérience terrain absente | P0 |
| Callback asynchrone provider | Non | Non | Oui | Mobile money réel impossible | P0 |
| Statut asynchrone | Oui `processing` | Oui | Non | À renforcer avec polling/webhooks | P0 |
| Frais | Faux calcul transaction | Oui | Oui | Marchand ne peut pas rapprocher | P0 |
| Plafonds | Non | Non | Oui | Risque échec/conformité | P1 |
| Échec réseau/retry | Non | Non | Oui | Mobile money instable non couvert | P1 |
| Clients sans email | Partiel | Oui customer libre | Non | Doit devenir first-class | P1 |
| Preuve SMS | Non | Non | Oui | Support terrain faible | P2 |
| Support WhatsApp | Non | Non | Oui | Important adoption | P2 |
| Multi-devises FCFA UEMOA/CEMAC | Partiel XOF | Non XAF | Oui | Afrique francophone incomplète | P1 |
| Diaspora carte/crypto vers local | Concept seulement | Non | Oui | Proposition centrale absente | P1 |

## 7. Sécurité

| Sujet | Niveau | Constat | Action |
|---|---|---|---|
| API keys | Critique | Bearer `sk_` transformé en merchant, non vérifié | Hash + lookup DB + scopes + rotation. |
| Secret/public keys | Critique | Pas de séparation réelle | `pk_*` frontend limité, `sk_*` backend uniquement. |
| Hash des clés | Critique | Absent | Stocker hash, jamais secret clair. |
| Signature webhook provider | Critique | Endpoint entrant absent | Vérification HMAC/provider signature + raw body. |
| Idempotency keys | Critique | Map globale checkout seulement | Scope merchant+method+path+body hash, persistant. |
| Replay attacks | Critique | Webhook sortant sans timestamp/nonce | `t=timestamp,v1=signature`, TTL, eventId unique. |
| Validation payload | Majeur | Manuelle minimale | Zod/Joi schemas par endpoint. |
| Rate limiting | Majeur | Absent Diapay | IP + key + route. |
| Logs sensibles | Majeur | Morgan + données mock dashboard | Redaction, audit logs, pas de PAN/phone complet. |
| CORS | Majeur | Ouvert | Allowlist par environnement/application. |
| Secrets `.env` | Moyen | `.env.example` ok, `.env` existe local | Vérifier non commit, scanner secrets. |
| Accès dashboard | Critique | Login UI sans vraie auth visible | Auth admin/merchant, RBAC, sessions sécurisées. |
| Rôles | Majeur | Types dashboard seulement | Admin/merchant/developer/support/auditor. |
| KYC/KYB | Majeur | Absent sauf marketplace type | Obligatoire avant live/payout. |
| Crypto compliance | Critique | Absent | Pays autorisés, AML, sanctions, travel rule selon besoin. |

## 8. Ledger / money movement

Un système de paiement sans ledger robuste est dangereux. Diapay n'a pas encore de ledger financier exploitable: seulement des types marketplace et des états en mémoire.

| Concept financier | Existe | Fiable | Manquant | Risque | Recommandation |
|---|---:|---:|---:|---|---|
| Payment | Oui | Non production | Persistance, attempts | Paiements perdus au restart | DB + lifecycle strict. |
| Transaction | Faux | Non | Vraie transaction provider/ledger | Rapprochement impossible | Créer `Transaction` liée ledger/provider. |
| Wallet | Types/mock | Non | Soldes calculés du ledger | Soldes faux | Wallet = vue dérivée. |
| Balance | Endpoint faux | Non | Snapshots | Marchand trompé | Snapshots audités. |
| Merchant | Modèle vide | Non | KYB, settlement config | Ownership impossible | Modèle complet. |
| Fee | Faux 1.8% | Non | Rules | Revenue/frais faux | Fee engine. |
| Commission | Marketplace mock | Non | Rules persistées | Marketplace non fiable | Rules versionnées. |
| Refund | Endpoint mutateur | Non | Ressource Refund | Remboursements non traçables | Refund + reversal ledger. |
| Payout | Fake | Non | Payout lifecycle | Perte fonds | Désactiver live avant module. |
| Settlement | Non | Non | Tout | Production impossible | Settlement batch. |
| LedgerEntry | Type/mock | Non | Double-entry atomique | Critique financier | Ledger double-entry immuable. |

## 9. Webhooks

| Webhook | Direction | Signature | Idempotence | Retry | État | Problème |
|---|---|---:|---:|---:|---|---|
| Merchant `payment.succeeded` | Diapay → marchand | HMAC simple | EventId existe | Non durable | Partiel | Pas timestamp, pas backoff persistant. |
| Merchant `payment.failed` | Diapay → marchand | HMAC simple | EventId existe | Non durable | Partiel | Perdu au restart. |
| Merchant `checkout.session.completed` | Diapay → marchand | HMAC simple | EventId existe | Non durable | Partiel | Payload non versionné. |
| Provider webhook Stripe/Orange/Moov/Wave/Crypto | Provider → Diapay | Non | Non | Non | Absent | Bloque providers réels. |
| Dead-letter queue | Interne | N/A | N/A | Non | Absent | Impossible opérer prod. |
| Logs delivery | Interne | N/A | Partiel | Non | Mémoire | Non auditable. |

## 10. Dashboard Diapay

| Page dashboard | Existe | Fonctionne | Partiel | Manquant | Recommandation |
|---|---:|---:|---:|---:|---|
| Login | Oui | Démo | Oui | Auth réelle | Brancher RBAC/session. |
| Dashboard | Oui | Démo | Oui | Données live | Séparer mock/live. |
| Merchants | Non | Non | Non | Oui | Ajouter admin merchants. |
| Paiements | Oui | Partiel | Oui | Filtres réels | Auth + API paginée. |
| Transactions | Oui | Faux | Oui | Ledger | Ne pas afficher comme réel. |
| Refunds | Oui | Démo | Oui | API refunds | Créer endpoints. |
| Webhooks | Oui | Démo/API partielle | Oui | Retry/signature | Gestion complète endpoints/events. |
| API keys | Oui UI mock | Non | Oui | Backend | Très prioritaire. |
| Providers | Indirect | Partiel | Oui | Config réelle | Provider accounts/status. |
| Sandbox | Non intégré fort | Partiel | Oui | Scénarios | Lier au sandbox. |
| Logs | Non | Non | Non | Oui | Audit/security logs. |
| Balances | Oui | Faux | Oui | Ledger | Calcul ledger uniquement. |
| Payouts | Oui | Faux | Oui | Backend réel | Masquer en live tant qu'absent. |

## 11. Sandbox développeur

Le sandbox est utile comme démonstration: il crée une checkout session via route Next, affiche un checkout, simule success/cancel et un webhook local. Mais il n'est pas encore utilisable par un développeur externe sérieux: scénarios limités, pas de documentation intégrée complète, pas de simulateur de webhook provider entrant, pas de clés test provisionnées via dashboard, pas de logs persistants, pas de simulation réaliste de timeout/retry réseau mobile money.

À ajouter: scénarios success/failure/timeout/OTP expired/insufficient funds/provider down/duplicate webhook, exemples curl/JS, secret webhook vérifiable, replay webhook, cartes test, téléphones test par opérateur/pays.

## 12. SDK JS

Points positifs: TypeScript, build `tsc`, exports, méthodes checkout/payments/refunds/payouts, retries simples, erreurs typées, validation locale.

Problèmes: package CommonJS seulement malgré cible navigateur potentielle; endpoints SDK inexistants (`/refunds/:id`, `/payouts/:id`, `/customers`); événements webhook SDK divergent (`checkout.completed` vs API `checkout.session.completed`); `verify webhook` à vérifier/renforcer avec timestamp; pas d'ESM explicite; pas de tests SDK; pas de garantie que les apps consomment le package local plutôt qu'un npm non publié.

## 13. Intégration Diamarket — cible paiement

Constat: Diamarket contient déjà documentation/intégration Diapay, service `diapay.service.ts`, provider payment Diapay, script de réconciliation, et le web décrit un checkout avec `checkoutUrl`. C'est la bonne direction mais l'intégration dépend d'un Diapay trop faible.

### Diamarket Payment Flow cible

```text
Checkout Diamarket
→ Diamarket API crée Order pending_payment
→ Diapay Checkout Session avec metadata {orderId, customerId, marketplaceSplits}
→ Provider mobile money/carte/crypto
→ Webhook provider vers Diapay
→ Diapay normalise Payment paid/failed
→ Ledger Diapay: gross, fees, commission, escrow/vendor liabilities
→ Webhook Diapay signé vers Diamarket
→ Diamarket marque Order paid
→ Fulfillment vendeur/logistique
→ Refund/partial refund via Diapay si annulation/retour
→ Payout vendeur futur depuis ledger Diapay
```

Exigences: idempotency key `diamarket_order_<id>`, webhooks signés, statut final basé webhook non redirect, split commissions, refund partiel par ligne, escrow futur.

## 14. Intégration DiaExpress — cible paiement

Constat: DiaExpress a un service `diapayClient.js`, `diapayAdminClient.js`, service de paiement/workflow, pages web paiement et admin payments. Mais la surface attendue par DiaExpress admin (`GET /payments/summary`, `/payments/:id/events`, api-keys, jobs) n'existe pas dans `diapay-api` actuel.

### DiaExpress Payment Flow cible

```text
Quote/Shipment DiaExpress approuvé
→ DiaExpress API crée Payment Request
→ Diapay Checkout Session {quoteId, shipmentId, route, customerPhone}
→ Client paie mobile money/carte
→ Provider callback vers Diapay
→ Diapay ledger + reçu
→ Webhook Diapay vers DiaExpress
→ DiaExpress paymentStatus=paid et autorise création/activation shipment
→ Reçu PDF/email/WhatsApp
→ Refund si devis annulé ou prestation impossible
```

Exigences: paiement devis et expédition séparés, receipt URL, timeline d'événements, admin read-only, remboursement lié à quote/shipment, support paiement agence plus tard.

## 15. Inutile/dangereux à supprimer ou reconstruire

| Élément | Pourquoi inutile/dangereux | Action | Priorité |
|---|---|---|---|
| Payout mock `/api/v1/payouts` | Fait croire à sortie de fonds | Désactiver live / renommer sandbox | P0 |
| Dashboard clés live fictives visibles | Normalise exposition secrets | Remplacer par clés masquées + backend réel | P0 |
| Auth `resolveMerchant` depuis string secret | Sécurité inexistante | Supprimer | P0 |
| Transactions calculées depuis payments | Faux ledger | Supprimer/remplacer | P0 |
| Models vides `ApiKey/Merchant/Refund/...` | Fausse complétude | Implémenter ou retirer | P1 |
| Provider mock success par défaut | Tests trop optimistes | Scénarios réalistes par défaut pending | P1 |
| Marketplace ledger mémoire | Dangereux si pris au sérieux | Rebuild double-entry | P0 |
| SDK endpoints inexistants | DX cassée | Aligner SDK/API | P1 |
| `/api/v1/checkout/sessions` list sans auth | Fuite données | Protéger | P0 |
| `cors()` global | Surface attaque | Allowlist | P1 |

## 16. Manques pour être sérieux

| Manque | Impact | Priorité | Complexité | Itération recommandée |
|---|---|---|---|---|
| Ledger double-entry | Système dangereux | P0 | Élevée | 6 |
| Idempotence persistante | Doubles débits | P0 | Moyenne | 5 |
| Webhooks signés robustes | Intégrations non fiables | P0 | Moyenne | 5 |
| Webhooks provider entrants | Providers réels impossibles | P0 | Moyenne | 5 |
| Checkout session durcie | UX/API fragile | P0 | Moyenne | 3 |
| Refunds réels | Support impossible | P0 | Moyenne | 6 |
| Reconciliation | Fonds non rapprochables | P0 | Élevée | 13 |
| Provider abstraction réelle | Pas multi-provider | P1 | Élevée | 4 |
| Mobile money async | Afrique non servie | P0 | Élevée | 9 |
| Dashboard merchant réel | Marchands aveugles | P1 | Moyenne | 7 |
| Sandbox réaliste | Dev adoption faible | P1 | Moyenne | 8 |
| SDK stable | Intégration lente | P1 | Moyenne | 8 |
| Documentation API | Adoption impossible | P1 | Moyenne | 8 |
| Monitoring | Prod aveugle | P1 | Moyenne | 13 |
| Audit logs | Investigation impossible | P1 | Moyenne | 2/13 |
| Sécurité keys | Danger critique | P0 | Moyenne | 2 |
| KYC/KYB | Payout/live impossible | P1 | Élevée | 13 |
| Limites pays/devise | Échecs terrain | P1 | Moyenne | 9 |
| Conformité crypto | Risque légal | P1 | Élevée | 10 |
| Settlement/payouts | Marchands non payés | P0 | Élevée | 6/13 |
| Dispute/chargeback | Cartes/marketplaces non crédibles | P2 | Élevée | 13 |

## 17. Architecture cible

```text
Client App
→ Diapay API
→ Checkout Session
→ Payment Intent
→ Payment Attempt
→ Provider Adapter
→ Provider Response
→ Provider Webhook
→ Status Normalizer
→ Ledger double-entry
→ Merchant Webhook
→ Dashboard / Reports / Reconciliation
```

Modules cibles:

- `Merchant`: identité, KYB, pays, devises, statut live.
- `Application`: intégration marchand, URLs, environnements, CORS allowed origins.
- `APIKey`: publishable/secret, hash, scopes, last used, rotation.
- `CheckoutSession`: panier, URLs, expiration, customer phone/email, metadata.
- `Payment`: intention métier, montant, devise, statut normalisé.
- `PaymentAttempt`: tentative provider, raw status, retries, action required.
- `Provider`: type, capabilities, pays, devises.
- `ProviderAccount`: credentials chiffrés par marchand/pays.
- `WebhookEvent`: événement interne immutable.
- `LedgerEntry`: écriture double-entry immutable.
- `Wallet`: projection de solde par owner/devise.
- `Refund`: ressource séparée, partielle/totale, status.
- `Payout`: sortie de fonds contrôlée.
- `Settlement`: batch de règlement marchand.
- `AuditLog`: sécurité, admin, modifications sensibles.

## 18. Roadmap stricte

### Itération 1 — Domain Model & Payment Status Cleanup
- Objectif: nettoyer statuts et modèle domaine.
- Scope: `models/Payment`, `CheckoutSession`, `Refund`, nouveaux `PaymentAttempt`.
- Fichiers probables: `apps/diapay-api/src/models/*`, `packages/diapay-sdk-js/src/index.ts`, OpenAPI.
- Endpoints: aucun nouveau obligatoire, mais réponses modifiées.
- Acceptation: statuts cibles documentés, transitions testées, legacy `succeeded` mappé vers `paid`.
- Tests: unit transitions, snapshots API.
- Risques: casser Diamarket/DiaExpress; prévoir mapping temporaire.

### Itération 2 — API Keys, Auth & Security
- Objectif: sécuriser accès API/dashboard.
- Scope: API keys hashées, scopes, RBAC dashboard, CORS allowlist, rate limit.
- Fichiers: middleware auth, models `ApiKey`, `Merchant`, dashboard login.
- Endpoints: `POST/GET /api/v1/api-keys`, `GET /api/v1/me`.
- Acceptation: aucun endpoint sensible sans auth, clés jamais stockées clair.
- Tests: auth success/fail, scope denied, redaction logs.
- Risques: migration des apps existantes.

### Itération 3 — Checkout Session & Payment Intent
- Objectif: contrat checkout stable.
- Scope: session persistante, customer phone, country/currency, expiration job.
- Endpoints: `POST/GET /checkout/sessions`, `POST /payment-intents` si séparé.
- Acceptation: redirect non source de vérité, webhook source de vérité.
- Tests: idempotence, expiration, validation URLs.
- Risques: complexité UX multi-method.

### Itération 4 — Provider Adapter Architecture
- Objectif: adapters sérieux.
- Scope: mock réaliste, stripe/card, orange money abstraction, crypto abstraction prudente.
- Endpoints: `GET /providers`, admin provider accounts.
- Acceptation: interface create/cancel/refund/verifyWebhook/normalize.
- Tests: contract tests par provider.
- Risques: credentials, différences provider.

### Itération 5 — Webhooks & Idempotence
- Objectif: fiabilité événementielle.
- Scope: provider webhooks, merchant webhooks, retry, event logs, DLQ.
- Endpoints: `POST /api/v1/webhooks/:provider`, `/webhook-endpoints`, `/webhook-events`.
- Acceptation: signatures vérifiées, replay rejeté, retry persistant.
- Tests: duplicate provider event, failed merchant webhook retry.
- Risques: raw body Express.

### Itération 6 — Ledger & Wallet
- Objectif: argent traçable.
- Scope: double-entry ledger, balances, fees, refunds, settlements initiaux.
- Endpoints: `/ledger`, `/wallets`, `/balances`, `/refunds`.
- Acceptation: somme débits=crédits, wallet dérivé ledger.
- Tests: payment/refund/split invariants.
- Risques: modèle comptable à valider par expert finance.

### Itération 7 — Dashboard Merchant
- Objectif: rendre les marchands autonomes.
- Scope: payments, API keys, webhooks, refunds, balances.
- Endpoints: API paginées/filtres.
- Acceptation: aucune donnée mock en mode live.
- Tests: e2e auth + pages.
- Risques: confusion admin/merchant.

### Itération 8 — Sandbox & SDK
- Objectif: DX externe crédible.
- Scope: playground, docs, examples, SDK stable.
- Endpoints: simulate provider events, resend webhooks.
- Acceptation: intégration complète en <30 min.
- Tests: SDK integration tests contre API sandbox.
- Risques: divergence API/SDK.

### Itération 9 — Mobile Money Africa
- Objectif: servir le terrain africain.
- Scope: Orange Money, Moov, Wave, country/currency rules, phone validation.
- Endpoints: provider-specific webhooks, payment method discovery par pays.
- Acceptation: flow async OTP/USSD et échecs réseau gérés.
- Tests: CI/SN/BJ/TG XOF, timeouts, duplicate callbacks.
- Risques: contrats opérateurs variables.

### Itération 10 — Crypto & Diaspora
- Objectif: diaspora avec prudence légale.
- Scope: stablecoin, compliance, conversion, payout local futur.
- Endpoints: crypto payment intent, compliance checks.
- Acceptation: pays autorisés, AML screening, aucune custody non maîtrisée.
- Tests: underpayment, overpayment, chain confirmation.
- Risques: réglementation.

### Itération 11 — Diamarket Integration
- Objectif: paiement commande marketplace.
- Scope: order payment, commissions, refunds, vendor payout futur.
- Endpoints: webhooks Diamarket, split metadata.
- Acceptation: order paid seulement via webhook signé.
- Tests: checkout, duplicate webhook, refund partiel.
- Risques: synchronisation statuts commandes.

### Itération 12 — DiaExpress Integration
- Objectif: paiement devis/expédition.
- Scope: quote/shipment payment, receipt, refund.
- Endpoints: admin payments summary/events, webhooks DiaExpress.
- Acceptation: paymentStatus fiable, receipt disponible.
- Tests: quote paid → shipment enabled, refund cancellation.
- Risques: dépendance aux anciens endpoints admin.

### Itération 13 — Production Hardening
- Objectif: go-live contrôlé.
- Scope: monitoring, security, legal, reconciliation, runbooks, backups.
- Endpoints: admin ops, reconciliation imports.
- Acceptation: audit sécurité passé, procédures incident, alerting.
- Tests: load, chaos webhooks, restore backup, reconciliation.
- Risques: dette réglementaire et opérationnelle.

## 19. Priorités P0/P1/P2/P3

### P0 — dangereux ou inutilisable sans cela
- Auth API key hashée + scopes.
- Protéger endpoints lecture/mutation.
- Idempotence persistante.
- Webhooks provider entrants vérifiés.
- Webhooks marchands signés avec timestamp + retry durable.
- Ledger double-entry.
- Modèle Payment/Refund/Wallet/Settlement persistant.
- Mobile money async réel.
- Désactiver/renommer payouts et transactions fake.

### P1 — crédibilité produit
- Dashboard marchand réel.
- SDK aligné API et testé.
- OpenAPI complète.
- Provider adapter contract tests.
- Règles pays/devise/plafonds.
- Reconciliation provider.
- KYC/KYB minimal avant live.
- Monitoring et audit logs.

### P2 — amélioration forte
- Disputes/chargebacks.
- Support WhatsApp/SMS receipts.
- Escrow avancé marketplace.
- Exports comptables.
- Portail développeur complet.

### P3 — peut attendre
- Crypto multi-chain avancé.
- Optimisation FX sophistiquée.
- Payouts automatiques multi-banques.
- Risk scoring avancé ML.

## 20. Score final

| Domaine | Note /100 | Commentaire |
|---|---:|---|
| Architecture | 32 | Structure modulaire présente, mais mémoire/mock. |
| Sécurité | 12 | Auth quasi absente, CORS ouvert, secrets mock visibles. |
| Paiement Afrique | 24 | XOF/mobile-money mock, mais réalité terrain absente. |
| Provider abstraction | 38 | Interface existe, adapters non réels. |
| Ledger | 10 | Types seulement, pas comptabilité fiable. |
| Dashboard | 45 | UI riche mais largement fictive. |
| Sandbox | 42 | Démo utile mais pas simulateur externe sérieux. |
| SDK | 48 | Bonne base TS, endpoints divergents. |
| Documentation | 40 | Docs existantes, audit/contrat à consolider. |
| Production readiness | 8 | Non prêt. |

Score global: **30/100**.

Diapay est-il prêt? **Non**.  
Prototype? **Oui**.  
Staging? **Non, sauf staging interne sandbox sans argent réel**.  
Production? **Absolument non**.

## 21. Validation build

À exécuter pour valider l'état technique:

```bash
npm --prefix apps/diapay-api run build
npm --prefix apps/diapay-dashboard run build
npm --prefix apps/diapay-sandbox run build
npm --prefix packages/diapay-sdk-js run build
```

Les résultats effectifs de cette branche doivent être reportés dans le message final/PR. Tout échec doit être traité comme signal de dette technique, pas comme simple détail.

### Résultats de validation observés sur cette branche

| Commande | Résultat | Détail |
|---|---|---|
| `npm --prefix apps/diapay-api run build` | Échec | Erreurs TypeScript dans les types marketplace (`MarketplaceCurrency`, `PayoutStatus`, `MarketplacePayment`, `SplitRule`) et incohérences entre `Marketplace.ts`, `Wallet.ts`, `Payout.ts`, `marketplace-store.ts`. |
| `npm --prefix apps/diapay-dashboard run build` | Échec | Compilation OK, mais prerender `/escrow` échoue avec `RangeError: Invalid currency code : USDT`; Next signale aussi ESLint absent. |
| `npm --prefix apps/diapay-sandbox run build` | Succès | Build Next terminé, routes statiques/dynamiques générées. |
| `npm --prefix packages/diapay-sdk-js run build` | Succès | Build TypeScript terminé. |
