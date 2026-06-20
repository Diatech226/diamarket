# DIAEXPRESS — Audit profond Quote Flow & Shipping Flow avant itérations

Date d'audit : 2026-06-20  
Périmètre principal : `apps/diaexpress-web`, `apps/diaexpress-admin`, `apps/diaexpress-api`  
Nature du ticket : documentation, audit, plan d'itérations. Aucune refonte code n'est incluse.

## 1. Résumé exécutif

DiaExpress possède déjà une base logistique réelle : modèles `Quote` et `Shipment`, endpoints devis/estimation/conversion/tracking, portail client, console admin, design system, opérations, hubs, pricing interne et intégrations carrier préparées. Ce n'est donc pas une coquille vide.

Mais l'expérience n'est pas encore au niveau d'un concurrent sérieux de DHL, FedEx, UPS, Aramex, Sendbox, Kobo360 ou Sendy. Le problème principal n'est pas l'absence totale de fonctionnalités ; c'est la fragmentation : statuts incohérents entre API, web et admin, routes legacy, wording hybride français/anglais, données essentielles parfois absentes, pricing non documenté par le rapport demandé, suivi colis encore trop dépendant de champs optionnels, et opérations/admin encore trop peu prescriptives.

Verdict direct : **DiaExpress est proche d'un bon prototype/staging logistique, mais encore loin d'une plateforme production-grade concurrentielle**. Pour devenir crédible, la priorité n'est pas d'ajouter des écrans décoratifs. Il faut verrouiller le contrat métier : statuts, transitions, ownership, pricing, conversion devis-expédition, tracking événementiel, preuves, notifications et exploitation admin.

### Documents de référence vérifiés

| Document demandé | Statut | Commentaire |
|---|---:|---|
| `docs/DIAEXPRESS_INTERNAL_AUDIT_AND_INTEGRATION_ROADMAP.md` | Disponible | Référence globale audit/intégration. |
| `docs/DIAEXPRESS_QUOTES_SHIPMENTS_UI_FLOW_REPORT.md` | Disponible | Référence directe UI quotes/shipments. |
| `docs/DIAEXPRESS_CLIENT_PORTAL_REPORT.md` | Disponible | Référence portail client. |
| `docs/DIAEXPRESS_PRICING_ENGINE_REPORT.md` | **Manquant** | Manque critique : le pricing est au coeur du quote flow. |
| `docs/DIAEXPRESS_OPERATIONS_CENTER_REPORT.md` | Disponible | Référence opérations/admin. |
| `docs/DIAEXPRESS_DESIGN_UX_FRONTEND_REPORT.md` | Disponible | Référence UX/design system. |

### Constats structurants

- **Utile** : estimation API, création de quote, ownership client, endpoints admin, conversion quote -> shipment idempotente, tracking public, timeline shipment, portail client, filtres admin, opérations/hubs.
- **Mal conçu** : trop de statuts legacy et synonymes (`requested`, `pending`, `confirmed`, `ready_for_shipment`, `converted`, `dispatched`) ; côté shipment, mélange entre statut métier, planning et assignation ; routes doublonnées ; actions admin qui se recoupent.
- **Manquant** : matrice stricte de transitions, preuve de pickup, preuve de livraison, documents, paiement complet, notifications, SLA, incidents, retours opérationnels, réclamations, audit log exploitable, webhooks et idempotence généralisée.
- **À supprimer/simplifier** : routes legacy non nécessaires, statuts synonymes, écrans ou actions qui changent seulement un label sans effet opérationnel, wording anglophone dans les parcours clients francophones.
- **Blocage business P0** : sans statuts propres, pricing fiable, quote sauvegardé, conversion contrôlée et tracking clair, DiaExpress ne peut pas inspirer la confiance attendue d'une plateforme logistique sérieuse.

---

## 2. Quote Flow actuel

### 2.1 Côté web client

Le web client contient un parcours de demande de devis plus avancé qu'un simple formulaire. Le module `quote-flow` gère un brouillon local, des étapes, une estimation, un résumé et une vue succès. C'est utile : le client peut progresser par étapes et ne perd pas immédiatement tout au refresh.

Limites sévères :

- le flow métier attendu en logistique est plus fin que le découpage actuel ;
- l'estimation reste temporaire et dépendante du pricing interne ;
- les contacts expéditeur/destinataire existent partiellement mais ne sont pas encore traités comme un contrat obligatoire complet ;
- le résumé prix/délai doit devenir permanent et plus rassurant ;
- l'historique client existe côté API/portail, mais la valeur métier dépend de statuts propres et de données fiables ;
- le wording et les états doivent être clarifiés pour éviter qu'un client confonde estimation, devis soumis, devis approuvé et expédition créée.

### 2.2 Côté admin

L'admin peut lister les quotes, filtrer, consulter, mettre à jour, envoyer en revue, demander des informations, marquer prêt pour expédition, confirmer/rejeter et convertir. C'est une base utile.

Limites sévères :

- les actions admin sont trop nombreuses pour un système dont les transitions ne sont pas encore strictement normalisées ;
- `approved`, `confirmed`, `ready_for_shipment`, `customer_approved`, `converted`, `converted_to_shipment` et `dispatched` créent une ambiguïté opérationnelle ;
- une demande d'information client doit générer une vraie tâche, une notification et un blocage de transition, pas seulement un statut ;
- la conversion en shipment doit être la seule porte de sortie vers l'opération, avec idempotence, audit et reprise d'erreur ;
- la communication client n'est pas encore assez intégrée au détail du devis.

### 2.3 Côté API

L'API expose des endpoints utiles : création de quote, liste admin, estimation, metadata, liste utilisateur, détail sécurisé, confirmation, rejet, dispatch, changement de statut, revue, demande d'information, ready-for-shipment et paiement. Le modèle `Quote` couvre beaucoup de champs : route, transport, marché, contacts, pricing, paiement, livraison, colis, utilisateur, historique de revue.

Limites sévères :

- la liste de statuts API contient des statuts recommandables, des statuts legacy et des statuts qui se chevauchent ;
- le modèle conserve à la fois `shipmentId`, `trackingNumber`, `deliveryStatus` dans Quote, alors que le suivi réel doit vivre dans Shipment ;
- la normalisation existe mais le contrat public n'est pas encore suffisamment simple ;
- le pricing engine est central mais le rapport dédié demandé est absent ;
- l'estimation expire en 30 minutes, ce qui est sain, mais il manque une politique claire de validité du prix final et d'expiration du devis.

### 2.4 Tableau d'audit Quote Flow

| Élément Quote Flow | Existe | Fonctionne | Partiel | Inutile | Manquant | Recommandation |
|---|---:|---:|---:|---:|---:|---|
| Demande de devis web | Oui | Oui | Oui | Non | Non | Garder, mais rendre le parcours plus court, mobile-first et orienté résultat. |
| Estimation rapide | Oui | Partiellement | Oui | Non | Oui | Conserver ; afficher prix, délai, devise, validité et limites de l'estimation. |
| Formulaire multi-étapes | Oui | Oui | Oui | Non | Non | Recomposer en étapes métier : route, transport, colis, contacts, options, résumé. |
| Origine/destination | Oui | Oui | Non | Non | Non | Garder ; préférer hubs/pays normalisés plutôt que texte libre non contrôlé. |
| Type transport | Oui | Oui | Non | Non | Non | Garder ; clarifier air/sea/road et délais associés. |
| Type colis | Oui | Partiellement | Oui | Non | Oui | Rendre obligatoire ou expliquer quand optionnel ; relier au pricing. |
| Poids | Oui | Oui | Non | Non | Non | Garder ; validation stricte côté client et API. |
| Dimensions | Oui | Oui | Oui | Non | Non | Garder ; calcul automatique du volume et poids volumétrique. |
| Volume | Oui | Partiellement | Oui | Non | Oui | Calculer automatiquement ; éviter la double saisie si dimensions présentes. |
| Coordonnées expéditeur | Partiel | Partiel | Oui | Non | Oui | Ajouter nom, téléphone, email, adresse, option pickup/dropoff claire. |
| Coordonnées destinataire | Oui | Partiel | Oui | Non | Oui | Rendre le contact destinataire complet pour préparation shipment. |
| Résumé | Oui | Partiel | Oui | Non | Oui | Résumé permanent avec prix, délai, route, colis, prochain statut. |
| Confirmation succès | Oui | Oui | Oui | Non | Oui | Afficher référence devis, prochaine étape, délai de réponse, contact support. |
| Sauvegarde brouillon | Oui local | Partiel | Oui | Non | Oui | Garder local, puis ajouter brouillon serveur authentifié. |
| Historique devis client | Oui | Partiel | Oui | Non | Oui | Améliorer avec filtres, actions possibles et statuts compréhensibles. |
| Liste admin quotes | Oui | Oui | Oui | Non | Non | Garder ; renforcer filtres SLA/retard/source/priorité. |
| Filtres admin | Oui | Partiel | Oui | Non | Oui | Ajouter date, statut canonique, priorité, montant, origine, destination, aging. |
| Détail admin quote | Oui | Partiel | Oui | Non | Oui | Ajouter checklist données, timeline, pricing breakdown, actions autorisées. |
| Validation/rejet | Oui | Partiel | Oui | Non | Oui | Encadrer par transition stricte et raison obligatoire en rejet. |
| Demande d'information | Oui | Partiel | Oui | Non | Oui | Doit notifier le client et bloquer certaines transitions. |
| Approbation | Oui | Partiel | Oui | Non | Oui | Séparer approval admin et acceptance client. |
| Conversion en expédition | Oui | Partiel | Oui | Non | Oui | Garder ; idempotence déjà utile, mais imposer préconditions. |
| Statuts quote | Oui | Non | Oui | Oui | Oui | Remplacer par une taxonomie unique et supprimer alias legacy côté UI. |
| Timeline quote | Oui via reviewHistory | Partiel | Oui | Non | Oui | Exposer timeline client/admin standardisée. |
| Communication client | Partiel | Non | Oui | Non | Oui | Ajouter notifications, messages liés au devis, pièces jointes. |
| Modèle Quote API | Oui | Oui | Oui | Non | Oui | Garder, mais séparer clairement estimation, devis, paiement, shipment. |
| Endpoints Quote API | Oui | Oui | Oui | Oui | Oui | Déprécier doublons legacy ; documenter contrat stable. |
| Pricing | Oui | Partiel | Oui | Non | Oui | Audit pricing dédié obligatoire avant production. |
| Validations | Oui | Partiel | Oui | Non | Oui | Compléter validations adresses, contacts, dimensions, valeur déclarée. |
| Sécurité/ownership | Oui | Partiel | Oui | Non | Oui | Bon début ; ajouter tests et vérifier chaque endpoint legacy. |

---

## 3. Shipping Flow actuel

### 3.1 Côté web client

Le client dispose d'un accès à ses expéditions, d'un détail et d'un tracking public par code. C'est indispensable et utile. La timeline existe selon les champs `trackingUpdates`, `timeline`, `events` ou `statusHistory`, ce qui donne de la flexibilité.

Limites sévères :

- le tracking public doit être beaucoup plus lisible et fiable ;
- les statuts ne sont pas encore alignés sur une grammaire client simple ;
- documents, paiement lié, notifications, preuve de livraison et support lié au tracking ne sont pas encore au niveau attendu ;
- sans événements normalisés, la timeline peut sembler vide ou incohérente ;
- l'expérience mobile doit devenir la référence, pas une adaptation secondaire.

### 3.2 Côté admin

L'admin peut lister les shipments, filtrer, ouvrir le détail, modifier le statut, ajouter de l'historique, assigner une opération/embarkment et supprimer. Le centre opérations a des métriques, hubs préparés et alertes.

Limites sévères :

- changer un statut manuellement ne suffit pas pour opérer une logistique sérieuse ;
- il manque une notion robuste d'incident, retard, tentative de livraison, retour, preuve, agent assigné et hub courant ;
- le statut `at_hub` est trop vague : origine ou destination ? ;
- `failed_delivery` doit être harmonisé avec `delivery_failed` ;
- l'assignation opérationnelle existe, mais elle doit devenir visible dans un workflow complet avec SLA et responsabilités.

### 3.3 Côté API

L'API expose création depuis quote, liste admin, liste personnelle, détail, status update, ajout d'historique, assignation opérationnelle et tracking public. Le modèle `Shipment` stocke tracking code, quote liée, principal, carrier/provider, statut, hub, poids/volume/dimensions, tracking updates et assignation opérationnelle.

Limites sévères :

- il manque `picked_up` dans certains statuts serveur alors que le frontend admin le connaît ;
- `normalizeShipmentStatus` est utilisé dans le contrôleur shipment mais n'apparaît pas importé dans l'extrait audité, ce qui doit être vérifié par tests ;
- la preuve de pickup/livraison n'a pas de modèle dédié ;
- les documents et paiements ne sont pas des citoyens de première classe du Shipment ;
- les transitions de statut ne sont pas assez lisibles depuis le contrat API public.

### 3.4 Tableau d'audit Shipping Flow

| Élément Shipping Flow | Existe | Fonctionne | Partiel | Inutile | Manquant | Recommandation |
|---|---:|---:|---:|---:|---:|---|
| Mes expéditions client | Oui | Partiel | Oui | Non | Oui | Garder ; enrichir filtres, statut clair, CTA tracking/support. |
| Détail expédition client | Oui | Partiel | Oui | Non | Oui | Ajouter résumé colis, route, ETA, documents, paiement, support. |
| Tracking public | Oui | Oui | Oui | Non | Oui | Garder ; timeline standard, statut client, preuve et incidents. |
| Timeline client | Oui | Partiel | Oui | Non | Oui | Normaliser événements ; ne pas dépendre de plusieurs noms de champs. |
| Statut client | Oui | Partiel | Oui | Non | Oui | Traduire statuts techniques en messages compréhensibles. |
| Documents | Non | Non | Non | Non | Oui | Ajouter facture/reçu, étiquette, preuve pickup, POD. |
| Paiement lié | Partiel | Partiel | Oui | Non | Oui | Relier quote/payment/shipment de façon visible. |
| Notifications | Partiel | Non | Oui | Non | Oui | Ajouter email/SMS/WhatsApp aux jalons clés. |
| Liste shipments admin | Oui | Oui | Oui | Non | Non | Garder ; ajouter SLA, hub, agent, exception, retard. |
| Détail shipment admin | Oui | Partiel | Oui | Non | Oui | Ajouter checklist opérationnelle et timeline complète. |
| Changement statut admin | Oui | Oui | Oui | Non | Oui | Encadrer par transitions autorisées et champs obligatoires. |
| Assignation hub/opération | Oui | Partiel | Oui | Non | Oui | Garder ; rendre visible dans dashboard et timeline. |
| Incidents | Partiel via statuts | Non | Oui | Non | Oui | Créer entité incident ou sous-document structuré. |
| Retards | Oui via statut | Partiel | Oui | Non | Oui | Ajouter cause, ETA révisée, notification, SLA. |
| Preuve livraison | Non | Non | Non | Non | Oui | P0/P1 selon marché ; indispensable avant gros volume. |
| Retour | Oui statut | Partiel | Oui | Non | Oui | Ajouter workflow retour et responsabilités. |
| Annulation | Oui statut | Partiel | Oui | Non | Oui | Clarifier qui annule, quand et impacts paiement. |
| Modèle Shipment | Oui | Oui | Oui | Non | Oui | Garder ; ajouter preuves, docs, incidents, payment refs. |
| Endpoints Shipment | Oui | Oui | Oui | Oui | Oui | Déprécier doublons ; documenter contrat public. |
| Tracking events/history | Oui | Partiel | Oui | Non | Oui | Créer schéma événementiel unique et ordonné. |
| Ownership | Oui | Partiel | Oui | Non | Oui | Ajouter tests d'accès client/admin et tracking public limité. |
| Intégration Diamarket future | Partiel | Non prouvé | Oui | Non | Oui | Stabiliser estimate/create/tracking/webhook/status mapping. |

---

## 4. Statuts actuels et statuts recommandés

### 4.1 Quote statuses actuels observés

Statuts côté modèle/API : `draft`, `requested`, `under_review`, `approved`, `rejected`, `awaiting_customer_approval`, `customer_approved`, `expired`, `cancelled`, `ready_for_shipment`, `converted`, `pending`, `confirmed`, `dispatched`.

Statuts côté admin/types : `requested`, `pending`, `under_review`, `info_requested`, `approved`, `confirmed`, `rejected`, `ready_for_shipment`, `converted_to_shipment`, `dispatched`, `cancelled`.

Problème : plusieurs statuts veulent dire presque la même chose. `approved` et `confirmed` sont ambigus ; `converted`, `converted_to_shipment` et `dispatched` mélangent quote et shipment ; `pending` est trop vague ; `awaiting_customer_approval` et `info_requested` doivent être distincts et visibles.

### 4.2 Quote statuses recommandés

| Statut | Déclencheur | Visible client | Action admin | Prochaines transitions autorisées |
|---|---|---:|---|---|
| `draft` | Brouillon client non soumis | Oui | Aucune | `submitted`, `cancelled` |
| `submitted` | Client envoie la demande | Oui | Prendre en revue | `under_review`, `cancelled`, `expired` |
| `under_review` | Admin ouvre/qualifie le devis | Oui | Vérifier données/pricing | `info_requested`, `priced`, `rejected`, `expired` |
| `info_requested` | Admin demande complément | Oui | Attendre réponse client | `submitted`, `under_review`, `cancelled`, `expired` |
| `priced` | Prix/délai final proposés | Oui | Approuver ou rejeter | `approved`, `rejected`, `expired` |
| `approved` | Admin valide le devis final | Oui | Attendre acceptation/paiement client ou convertir selon règle | `converted_to_shipment`, `cancelled`, `expired` |
| `rejected` | Admin refuse avec raison | Oui | Raison obligatoire | Terminal, sauf réouverture manuelle contrôlée vers `under_review` |
| `expired` | Validité dépassée | Oui | Renouveler/recalculer si besoin | Terminal, ou clone vers nouveau `draft` |
| `converted_to_shipment` | Shipment créé avec succès | Oui | Consulter shipment | Terminal côté quote |
| `cancelled` | Client ou admin annule avant conversion | Oui | Raison obligatoire si admin | Terminal |

### 4.3 Shipment statuses actuels observés

Statuts côté modèle/API : `draft`, `created`, `pending_dispatch`, `scheduled`, `in_transit`, `delayed`, `at_hub`, `out_for_delivery`, `delivered`, `failed_delivery`, `returned`, `cancelled`.

Statuts côté admin/types : `draft`, `created`, `pending_dispatch`, `scheduled`, `picked_up`, `in_transit`, `delayed`, `at_hub`, `out_for_delivery`, `delivered`, `failed_delivery`, `returned`, `cancelled`.

Problème : `picked_up` est attendu côté admin mais absent du modèle audité ; `at_hub` est insuffisant ; `pending_dispatch` et `scheduled` doivent devenir des étapes plus compréhensibles ; `failed_delivery` devrait être renommé `delivery_failed` pour cohérence grammaticale.

### 4.4 Shipment statuses recommandés

| Statut | Déclencheur | Visible client | Action admin | Prochaines transitions autorisées |
|---|---|---:|---|---|
| `created` | Conversion quote -> shipment | Oui | Vérifier données shipment | `awaiting_pickup`, `cancelled` |
| `awaiting_pickup` | Pickup programmé ou dropoff attendu | Oui | Programmer/assigner agent | `picked_up`, `cancelled`, `delayed` |
| `picked_up` | Colis collecté | Oui | Ajouter preuve pickup | `at_origin_hub`, `in_transit`, `delayed` |
| `at_origin_hub` | Colis reçu au hub origine | Oui | Consolider/assigner transport | `in_transit`, `delayed`, `cancelled` |
| `in_transit` | Colis en mouvement inter-hub/inter-ville | Oui | Suivre transporteur | `at_destination_hub`, `delayed`, `returned` |
| `at_destination_hub` | Colis reçu au hub destination | Oui | Préparer livraison finale | `out_for_delivery`, `delayed`, `returned` |
| `out_for_delivery` | Agent livreur assigné et sorti | Oui | Suivi dernier kilomètre | `delivered`, `delivery_failed`, `delayed` |
| `delivered` | Livraison confirmée | Oui | Ajouter preuve livraison/POD | Terminal |
| `delivery_failed` | Tentative échouée | Oui | Saisir cause et prochaine action | `out_for_delivery`, `returned`, `delayed`, `cancelled` |
| `returned` | Retour initié ou complété | Oui | Gérer retour et paiement éventuel | Terminal ou retour contrôlé vers `in_transit` si erreur |
| `cancelled` | Expédition annulée avant livraison | Oui | Raison obligatoire | Terminal |
| `delayed` | SLA dépassé ou incident transit | Oui | Cause, ETA révisée, notification | Retour au statut précédent, `returned`, `cancelled` |

---

## 5. Données nécessaires

| Donnée | Quote | Shipment | Obligatoire | Optionnelle | Qui la renseigne | Quand | Commentaire |
|---|---:|---:|---:|---:|---|---|---|
| Client / principal | Oui | Oui | Oui | Non | Auth/API | Création | Doit être stable pour ownership. |
| Origine | Oui | Oui | Oui | Non | Client/admin | Estimation puis shipment | Préférer hub/ville/pays normalisés. |
| Destination | Oui | Oui | Oui | Non | Client/admin | Estimation puis shipment | Base du pricing et SLA. |
| Type transport | Oui | Oui | Oui | Non | Client/admin | Estimation | Air/sea/road avec délais clairs. |
| Type colis | Oui | Oui | Oui recommandé | Oui selon produit | Client/admin | Formulaire | Important pour pricing et manipulation. |
| Poids | Oui | Oui | Oui | Non | Client/admin | Estimation | Validation stricte. |
| Dimensions | Oui | Oui | Oui recommandé | Oui | Client/admin | Estimation | Indispensable pour poids volumétrique. |
| Volume | Oui | Oui | Non si calculé | Oui | Système | Estimation | Doit être calculé automatiquement. |
| Valeur déclarée | Oui | Oui | Oui si assurance | Oui | Client | Formulaire | Manquant important. |
| Urgence/priorité | Oui | Oui | Non | Oui | Client/admin | Formulaire/admin | Impact SLA/pricing. |
| Assurance | Oui | Oui | Non | Oui | Client/admin | Devis | Manquant côté contrat clair. |
| Instructions spéciales | Oui | Oui | Non | Oui | Client | Formulaire | Utile pour pickup/livraison. |
| Contact expéditeur | Oui | Oui | Oui | Non | Client | Formulaire | Nom, téléphone, email, adresse. |
| Contact destinataire | Oui | Oui | Oui | Non | Client | Formulaire | Nom, téléphone, email, adresse. |
| Prix estimé | Oui | Non | Oui pour devis | Non | Pricing API | Estimation | Afficher limites et validité. |
| Prix final | Oui | Oui paiement | Oui avant approval | Non | Admin/pricing | Revue | Différencier estimate/final. |
| Délai estimé / ETA | Oui | Oui | Oui | Non | Pricing/admin | Estimation/shipment | Doit rester visible. |
| Validité du prix | Oui | Non | Oui | Non | Système | Estimation/pricing | Expiration explicite. |
| Devise | Oui | Oui | Oui | Non | Pricing | Estimation | Multi-devise à verrouiller. |
| Quote liée | Non | Oui | Oui | Non | Système | Conversion | Relation fondamentale. |
| Tracking number | Non | Oui | Oui | Non | Système/provider | Conversion | Unique, lisible, indexé. |
| Pickup | Oui option | Oui | Oui si service pickup | Oui | Client/admin | Avant expédition | Date, créneau, lieu, agent. |
| Statut | Oui | Oui | Oui | Non | Système/admin | Tout le cycle | Taxonomie unique. |
| Timeline | Oui | Oui | Oui | Non | Système/admin/provider | Chaque événement | Un schéma événementiel commun. |
| Preuve pickup | Non | Oui | Non au début | Oui | Agent/admin | Pickup | Nécessaire pour opérations sérieuses. |
| Preuve livraison | Non | Oui | Oui à terme | Non | Agent/client | Livraison | Photo/signature/OTP. |
| Agent assigné | Non | Oui | Non | Oui | Admin | Opérations | Important pour dernier kilomètre. |
| Hub actuel | Non | Oui | Oui dès hub | Non | Admin/système | Opérations | Remplacer `at_hub` vague. |
| Paiement | Oui | Oui | Oui si payant | Non | Client/système | Approval | Facture/reçu visibles. |
| Documents | Non | Oui | Non au début | Oui | Système/admin | Shipment | Étiquette, facture, douane, POD. |
| Incidents | Non | Oui | Non | Oui | Admin/provider | Exception | Entité structurée requise. |
| Source Diamarket | Oui | Oui | Non | Oui | Intégration | Création | Préparer `orderId`, `merchantId`, `cartId`. |

---

## 6. Utilités / inutilités / simplifications

| Élément | Pourquoi inutile/confus | Supprimer | Simplifier | Garder |
|---|---|---:|---:|---:|
| `pending` quote | Trop vague ; doublon de `submitted` ou `under_review`. | Oui à terme | Oui | Non |
| `confirmed` quote | Ambigu : confirmé par admin, client ou paiement ? | Oui à terme | Oui | Non |
| `ready_for_shipment` quote | Utile mais remplaçable par `approved` puis conversion. | Non | Oui | Temporaire |
| `converted` vs `converted_to_shipment` | Deux noms pour la même idée. | Oui pour l'un | Oui | Un seul |
| `dispatched` sur Quote | Mélange quote et shipment ; dispatch est shipment. | Oui | Non | Non |
| `deliveryStatus` dans Quote | Redondant avec Shipment. | Oui à terme | Oui | Non |
| `trackingNumber` dans Quote | Utile comme référence de lien, mais source de vérité doit être Shipment. | Non | Oui | Oui miroir |
| `at_hub` shipment | Trop vague pour client et opérations. | Oui | Oui | Non |
| `pending_dispatch` | Terme interne peu clair pour client. | Oui | Oui | Non |
| `scheduled` | Utile seulement si attaché à pickup/transport ; sinon vague. | Non | Oui | Temporaire |
| `failed_delivery` | Compréhensible mais moins propre que `delivery_failed`. | Non | Oui | Temporaire |
| Routes `/estimate` et `/estimateQuote` | Doublon legacy. | Oui une fois clients migrés | Oui | Temporaire |
| Routes `/from-quote` et `/create-from-quote` | Doublon. | Oui une fois clients migrés | Oui | Temporaire |
| Multiples actions admin de quote | Risque d'actions sans impact réel si transitions floues. | Non | Oui | Oui si matrice stricte |
| Wording mixte EN/FR | Réduit confiance client. | Oui | Oui | Non |
| Volume saisi manuellement avec dimensions | Risque incohérence. | Non | Oui | Oui calculé |
| Suppression shipment admin | Dangereux en production ; audit perdu. | Oui à terme | Oui en annulation contrôlée | Non prod |

---

## 7. Manques majeurs pour concurrencer les grandes entreprises

| Manque | Impact business | Priorité | Complexité | Itération proposée |
|---|---|---:|---:|---|
| Statuts quote/shipment unifiés | Sans langage commun, client et opérations perdent confiance. | P0 | M | Itération 1 |
| Transitions autorisées | Empêche erreurs opérationnelles et incohérences. | P0 | M | Itération 1 |
| Pricing report et tests tarifs | Un devis faux détruit la crédibilité. | P0 | M/L | Itération 3 |
| Estimation instantanée lisible | Conversion client plus forte. | P0 | M | Itération 3 |
| Devis sauvegardé serveur | Reprise multi-device et historique fiable. | P0 | M | Itération 2 |
| Conversion quote -> shipment avec préconditions | Évite pertes de données et shipments invalides. | P0 | M | Itération 5 |
| Tracking fiable et timeline unique | Fonction coeur d'une logistique sérieuse. | P0 | M | Itération 6 |
| Ownership et sécurité testés | Empêche fuite de devis/shipments. | P0 | M | Itération 1/5 |
| Pickup scheduling | Indispensable si service pickup promis. | P1 | M | Itération 5/7 |
| Preuve de livraison | Réduit litiges et rassure clients. | P1 | M | Itération 8 |
| Notifications email/SMS/WhatsApp | Réduit support manuel, améliore confiance. | P1 | M/L | Itération 8 |
| Documents d'expédition | Nécessaire pour B2B/fret/douane. | P1 | L | Itération 8 |
| Gestion incidents | Nécessaire pour retards, pertes, dommages. | P1 | M | Itération 7 |
| Retours | Nécessaire marketplace et e-commerce. | P1 | M | Itération 7 |
| Paiement intégré clair | Bloque conversion commerciale. | P1 | M/L | Itération 5/8 |
| Factures/reçus | Nécessaire B2B et support. | P1 | M | Itération 8 |
| Multi-hubs/agences opérationnels | Passage à l'échelle. | P1 | L | Itération 7 |
| SLA et alertes retard | Pilotage opérations. | P1 | M | Itération 7 |
| Filtres admin puissants | Productivité équipe. | P1 | S/M | Itération 4 |
| Audit log exploitable | Traçabilité et litiges. | P1 | M | Itération 4/7 |
| Exports admin | Reporting et opérations. | P2 | S/M | Itération 7 |
| Support lié au tracking | Réduit friction client. | P2 | M | Itération 6/8 |
| Assurance | Important pour colis de valeur. | P2 | M/L | Itération 3/8 |
| Webhooks | Intégration Diamarket et partenaires. | P1 | M/L | Itération 9 |
| Idempotence généralisée | Évite doublons paiements/shipments/events. | P0/P1 | M | Itération 5/9 |
| Monitoring/logs/retry | Fiabilité production. | P1 | M/L | Itération 9 |
| Rate limiting | Protection API publique. | P1 | S/M | Itération 9 |
| Carte réelle hubs/tracking | Utile mais non bloquant au début. | P3 | M/L | Après itération 9 |
| Design premium décoratif | Ne compense pas des statuts/prix faibles. | P3 | S/M | Après stabilisation métier |

---

## 8. Expérience cible

### 8.1 Quote Flow cible

```txt
Accueil
→ Estimation rapide
→ Formulaire guidé
→ Résumé prix/délai
→ Création devis
→ Notification client
→ Revue admin
→ Approbation
→ Paiement éventuel
→ Conversion en shipment
```

Expérience attendue :

1. Le visiteur obtient une estimation en moins d'une minute avec route, transport, colis, poids/dimensions et devise.
2. Le formulaire guidé demande uniquement les informations nécessaires au bon moment.
3. Le résumé reste visible : prix estimé/final, délai, validité, inclusions, limites.
4. Après soumission, le client reçoit une référence devis, un statut clair et une promesse de délai de réponse.
5. L'admin qualifie le devis avec une checklist, demande des infos si nécessaire, applique le prix final et approuve/rejette.
6. Le client accepte/paye si requis.
7. La conversion crée un shipment sans perte de données, avec tracking number, timeline initiale et notification.

### 8.2 Shipping Flow cible

```txt
Shipment créé
→ Pickup programmé
→ Colis collecté
→ Hub origine
→ Transit
→ Hub destination
→ Sortie livraison
→ Livré
→ Preuve livraison
→ Clôture
```

Expérience attendue :

1. Le client voit son tracking immédiatement après conversion.
2. Chaque événement possède statut, date, lieu, source et commentaire.
3. Les exceptions sont visibles sans jargon : retard, tentative échouée, retour, action requise.
4. L'admin voit SLA, hub courant, agent assigné, incidents, documents et historique complet.
5. La livraison se clôture avec preuve, horodatage, identité de l'agent et reçu/document.

---

## 9. Roadmap d'itérations Quote + Shipping

### Itération 1 — Nettoyage et simplification des statuts

- **Objectif** : uniformiser les statuts quote/shipment et imposer une matrice de transitions.
- **Scope** : mapping statuts API/frontend/admin, labels client, compat legacy en lecture, transitions autorisées.
- **Fichiers probables** : `apps/diaexpress-api/models/Quote.js`, `apps/diaexpress-api/models/Shipment.js`, `apps/diaexpress-api/services/quoteDomainService.js`, `apps/diaexpress-api/services/shipmentService.js`, `apps/diaexpress-admin/src/types/logistics.ts`, constantes statuts web/admin.
- **Backend minimal** : Oui, nécessaire.
- **Critères d'acceptation** : un statut canonique par état métier ; transitions invalides refusées ; anciens statuts mappés sans casser les données existantes.
- **Tests manuels** : créer quote, passer revue, demander info, approuver, convertir, changer shipment jusqu'à delivered.
- **Risques** : migration de données existantes et compatibilité routes legacy.

### Itération 2 — Quote Request UX

- **Objectif** : créer un formulaire devis fluide, intelligent et mobile-first.
- **Scope** : étapes courtes, validation progressive, sauvegarde brouillon, résumé permanent, message succès utile.
- **Fichiers probables** : `apps/diaexpress-web/src/modules/quote-flow/*`, pages demande devis, styles associés, API logistics client.
- **Backend minimal** : Non pour UX local ; Oui si brouillon serveur.
- **Critères d'acceptation** : client comprend toujours où il est, ce qui manque et le prochain résultat.
- **Tests manuels** : mobile, desktop, refresh, erreur API estimation, soumission authentifiée/non authentifiée selon règle.
- **Risques** : trop d'étapes ; données obligatoires non disponibles dans metadata.

### Itération 3 — Pricing & estimation claire

- **Objectif** : rendre l'estimation rapide, compréhensible et fiable.
- **Scope** : pricing breakdown, validité, délai estimé, devise, erreurs tarifaires, rapport pricing manquant.
- **Fichiers probables** : `apps/diaexpress-api/services/pricingService.js`, modèles Pricing, endpoints `/api/quotes/estimate`, UI estimate/review.
- **Backend minimal** : Oui.
- **Critères d'acceptation** : estimation déterministe, explication affichable, erreurs claires, tests routes principales.
- **Tests manuels** : routes connues, routes inconnues, poids/dimensions limites, règles ambiguës, devise.
- **Risques** : règles tarifaires ambiguës ou incomplètes.

### Itération 4 — Admin Quote Management

- **Objectif** : rendre la gestion des devis exploitable par l'équipe.
- **Scope** : table, filtres, détail, checklist, actions selon statut, notes, timeline, raison rejet.
- **Fichiers probables** : `apps/diaexpress-admin` pages quotes, hooks `useQuotes`, API `lib/api/quotes`, contrôleurs admin quote.
- **Backend minimal** : Oui pour timeline/actions strictes.
- **Critères d'acceptation** : un admin sait quoi faire sur chaque devis en moins de 10 secondes.
- **Tests manuels** : filtres, changement statut, rejet avec raison, demande info, approval.
- **Risques** : trop d'actions exposées ; mauvaise migration des statuts legacy.

### Itération 5 — Conversion Quote → Shipment

- **Objectif** : conversion propre, sans perte de données.
- **Scope** : préconditions, idempotence, copie données, tracking number, timeline initiale, lien paiement.
- **Fichiers probables** : `apps/diaexpress-api/src/domains/shipment/application/shipmentApplicationService.js`, `controllers/shipmentController.js`, `models/Shipment.js`, `models/Quote.js`, UI admin quote detail.
- **Backend minimal** : Oui.
- **Critères d'acceptation** : impossible de convertir un devis invalide ; conversion répétée ne crée pas de doublon ; shipment complet.
- **Tests manuels** : conversion success, conversion répétée, conversion devis rejeté/expiré, tracking visible client.
- **Risques** : données quote insuffisantes ; paiement non synchronisé.

### Itération 6 — Shipment Tracking UX

- **Objectif** : timeline tracking client/admin professionnelle.
- **Scope** : statut client clair, timeline unique, ETA, support, vues empty/error/loading, tracking public robuste.
- **Fichiers probables** : pages tracking web, portail client shipments, `apps/diaexpress-web/src/design-system/StatusBadges.jsx`, API tracking.
- **Backend minimal** : Oui si schéma events unifié.
- **Critères d'acceptation** : un code tracking affiche un état compréhensible, même avec peu d'événements.
- **Tests manuels** : code valide, code inconnu, shipment sans events, delayed, delivered.
- **Risques** : événements provider hétérogènes.

### Itération 7 — Operations & incidents

- **Objectif** : gérer retards, échecs, retours, incidents.
- **Scope** : hub courant, agent/operation assignés, SLA, incident reason, ETA révisée, retour.
- **Fichiers probables** : `apps/diaexpress-api/src/domains/operations/*`, `models/Shipment.js`, admin operations center, shipment detail.
- **Backend minimal** : Oui.
- **Critères d'acceptation** : chaque exception a cause, responsable, prochaine action et visibilité client maîtrisée.
- **Tests manuels** : retard, échec livraison, retour, réassignation hub/agent.
- **Risques** : complexité opérationnelle et besoin de données terrain.

### Itération 8 — Notifications & documents

- **Objectif** : SMS/email/WhatsApp, preuves, reçus et documents.
- **Scope** : notification service, templates, preuves pickup/POD, facture/reçu, étiquette/documents.
- **Fichiers probables** : services notification API, modèles Payment/Shipment, UI client/admin documents.
- **Backend minimal** : Oui.
- **Critères d'acceptation** : événements clés déclenchent notifications ; documents téléchargeables ; preuves visibles selon permissions.
- **Tests manuels** : quote submitted, quote approved, shipment created, out_for_delivery, delivered, delayed.
- **Risques** : fournisseurs SMS/WhatsApp, stockage fichiers, confidentialité.

### Itération 9 — Diamarket integration readiness

- **Objectif** : faire de DiaExpress le moteur livraison de Diamarket.
- **Scope** : estimate, shipment creation, tracking sync, webhooks, idempotency keys, mapping statuts commande/livraison.
- **Fichiers probables** : `apps/diaexpress-api` contrats publics, `apps/diamarket-api` shipping integration, docs OpenAPI, webhooks.
- **Backend minimal** : Oui.
- **Critères d'acceptation** : checkout Diamarket -> estimation -> commande -> shipment -> tracking -> webhook -> historique client fonctionne en staging.
- **Tests manuels** : commande Diamarket payée/COD, création shipment unique, sync tracking, webhook signé, retry.
- **Risques** : contrats inter-app instables, secrets, environnements staging.

---

## 10. Priorités P0/P1/P2/P3

### P0 — indispensable

- Statuts canonique quote/shipment.
- Matrice transitions autorisées.
- Pricing fiable et documenté.
- Estimation claire prix/délai/devise/validité.
- Quote sauvegardé et historique client fiable.
- Conversion quote -> shipment idempotente avec préconditions.
- Tracking number unique et timeline minimale fiable.
- Ownership/sécurité testés.
- Suppression ou masquage des statuts/actions legacy côté UI.

### P1 — important

- Admin quote management exploitable.
- Admin shipment management avec SLA/retards/assignation.
- Pickup scheduling.
- Preuve de livraison.
- Notifications email/SMS/WhatsApp sur jalons critiques.
- Documents de base : reçu, étiquette, POD.
- Incidents et retours structurés.
- Paiement/facture lié au devis et à l'expédition.
- Webhooks et idempotence pour intégrations.
- Monitoring/logs/rate limiting API publique.

### P2 — amélioration

- Assurance colis.
- Support client lié au tracking.
- Exports admin avancés.
- Reporting opérationnel avancé.
- Multi-devise poussée.
- Automatisation carrier plus riche.
- Score qualité transporteur/hub.

### P3 — futur

- Carte réelle temps quasi-réel.
- UI premium non fonctionnelle.
- Optimisations IA/ETA avancées.
- Marketplace de transporteurs.
- Portail partenaires complet.
- Fonctionnalités décoratives sans impact conversion, tracking ou opérations.

---

## 11. Conclusion directe

DiaExpress n'est pas loin parce qu'il manquerait tout. Il est loin parce que les fondations métier ne sont pas encore assez propres pour porter une promesse logistique sérieuse.

La plateforme a déjà beaucoup d'éléments utiles : devis, estimation, admin, shipment, tracking, client portal, opérations et design. Mais un concurrent sérieux ne se juge pas à la quantité d'écrans. Il se juge à la fiabilité d'un flux simple : **je demande un prix, je comprends le prix, je valide, mon colis est créé, je le suis, je suis notifié, je reçois une preuve, et l'équipe peut gérer les exceptions sans bricolage**.

Aujourd'hui, DiaExpress est au stade **GO staging contrôlé**, pas GO production public ambitieux. Les prochaines itérations doivent être strictes : d'abord statuts/pricing/conversion/tracking, ensuite UX et opérations, puis notifications/documents/intégration Diamarket. Tout ce qui n'aide pas directement ce chemin doit être repoussé.
