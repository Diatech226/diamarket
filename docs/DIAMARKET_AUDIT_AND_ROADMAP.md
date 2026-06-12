# Diamarket — Audit interne complet et roadmap de mise en production

**Date de l'audit :** 12 juin 2026
**Périmètre principal :** `apps/diamarket-api`, `apps/diamarket-cms`, `apps/diamarket-web`
**Périmètre d'intégration observé :** `apps/diapay-api`, package `packages/diapay-sdk-js`, `apps/diaexpress-api`
**Nature du livrable :** analyse interne statique, vérifications de build/typecheck/lint et recommandations ; aucune refonte ni correction fonctionnelle appliquée.

---

## 1. Résumé exécutif

Diamarket est un **prototype marketplace avancé**, mais pas encore un produit prêt à recevoir des commandes réelles en production. Le dépôt contient une base cohérente : monorepo, API Express/MongoDB typée, authentification e-mail/mot de passe par JWT/cookie HttpOnly, catalogue, demandes vendeur, commandes, intégration Diapay, abstraction livraison et deux interfaces Next.js. Les builds production du CMS et du site public réussissent individuellement.

Cependant, le niveau réel d'achèvement est inférieur à ce que suggèrent certains README :

- l'API expose les briques essentielles, mais plusieurs règles d'autorisation et d'intégrité métier sont insuffisantes ;
- le CMS n'est pleinement fonctionnel que pour les **projets/médias** et partiellement pour produits/commandes ; la majorité des autres écrans sont des démonstrateurs statiques et appellent des endpoints admin inexistants ;
- le site public propose un parcours visuel complet, mais masque des erreurs API avec des données fictives, utilise un panier non persistant, affiche un historique de commande fictif et construit des commandes à partir de données client non fiables ;
- les flows Diapay et livraison sont amorcés, sans couverture de tests, garanties transactionnelles, réconciliation, gestion robuste des remboursements/litiges ni intégration explicite à DiaExpress ;
- des fichiers `.env` contenant des valeurs sensibles sont suivis par Git ; leur historique doit être considéré comme compromis ;
- il n'existe ni pipeline CI/CD Diamarket, ni conteneurs Diamarket, ni tests automatisés Diamarket, ni lint réellement configuré, ni monitoring opérationnel.

### Verdict production readiness

| Domaine | Niveau actuel | Verdict |
|---|---:|---|
| Build frontend | Bon | CMS et web buildent individuellement |
| API build | Bloqué dans l'environnement audité | Dépendances/types Node absents localement |
| Authentification | Partielle | Bonne base, durcissement indispensable |
| Autorisations / isolation des données | Insuffisante | **Bloquant production** |
| Catalogue | Partiel | Lecture/création disponibles, gouvernance et mapping incomplets |
| Commandes | Prototype | **Bloquant production** : montants/stock/ownership non fiables |
| Paiement Diapay | Prototype avancé | Signature et idempotency key présentes, mais contrôles/ledger/refund incomplets |
| Livraison | Prototype abstrait/mock | Pas de flow DiaExpress prêt à exploiter |
| CMS | Démonstrateur partiellement connecté | Non exploitable par une équipe métier en l'état |
| UX/UI | Crédible visuellement, parcours incomplets | États, confiance, accessibilité et cohérence à renforcer |
| Exploitation / déploiement | Insuffisant | **Bloquant production** |
| Tests / qualité | Très insuffisant | **Bloquant production** |

### Trois priorités immédiates

1. **Sécuriser les secrets et l'isolation des données** : révoquer/rotater tous les secrets suivis par Git, retirer les `.env` de l'index/historique, corriger l'ownership commandes/paiements et interdire toute confiance dans les IDs/montants envoyés par le client.
2. **Stabiliser un contrat API réellement exécutable** : aligner routes API/CMS/web, valider toutes les entrées, recalculer les commandes côté serveur, rendre health/readiness fiables, normaliser dépendances et CI.
3. **Achever un parcours marketplace minimal de bout en bout** : catalogue publié → panier persistant → checkout authentifié → commande multi-vendeur ou règle mono-vendeur explicite → Diapay/COD → suivi client/admin → expédition DiaExpress.

---

## 2. Méthode et limites de l'audit

### Méthode

- inventaire du monorepo et des manifests npm ;
- lecture des modèles MongoDB, routes, contrôleurs, middlewares et services ;
- lecture des pages, clients API, composants et flows UX des deux frontends ;
- revue des `.env.example`, `.gitignore`, fichiers suivis par Git et documents existants ;
- recherche des tests, pipelines et artefacts de déploiement ;
- exécution des builds, typechecks et lints disponibles.

### Limites

- aucun test manuel avec MongoDB, Diapay sandbox ou DiaExpress actif n'a été réalisé ;
- aucune donnée réelle ni secret n'est reproduit dans ce rapport ;
- « fonctionne probablement » signifie que le code est cohérent statiquement ou buildable, pas qu'il est validé en environnement intégré ;
- les applications Diapay et DiaExpress ont été observées seulement comme dépendances d'intégration, pas auditées exhaustivement.

---

## 3. Cartographie actuelle

## 3.1 Monorepo et applications

Le dépôt racine utilise Turborepo, mais le manifest racine ne déclare ni `workspaces` ni `packageManager`, ce qui empêche actuellement `npm run build:diamarket` de résoudre les workspaces.

### Applications présentes

| Domaine | Application | Stack / rôle |
|---|---|---|
| Diamarket | `apps/diamarket-api` | Express 4, TypeScript, Mongoose, API métier |
| Diamarket | `apps/diamarket-cms` | Next.js 14, React 18, Tailwind, back-office |
| Diamarket | `apps/diamarket-web` | Next.js 14, React 18, Tailwind, storefront |
| Diapay | `apps/diapay-api` | API de paiement interne |
| Diapay | `apps/diapay-dashboard` | dashboard Diapay |
| Diapay | `apps/diapay-docs` | documentation Diapay |
| Diapay | `apps/diapay-sandbox` | sandbox Diapay |
| DiaExpress | `apps/diaexpress-api` | API logistique externe potentielle |
| DiaExpress | `apps/diaexpress-admin` | administration DiaExpress |
| DiaExpress | `apps/diaexpress-web` | site DiaExpress |

### Packages partagés présents

`packages/config`, `packages/diapay-node`, `packages/diapay-sdk-js`, `packages/eslint-config`, `packages/shared`, `packages/shared-utils`, `packages/types`, `packages/ui`.

**Constat :** les trois apps Diamarket utilisent peu ou pas les packages UI/types/config partagés ; les modèles frontend et backend peuvent donc dériver silencieusement.

## 3.2 Dossiers principaux Diamarket

### `diamarket-api`

- `src/config` : environnement, MongoDB, rôles/permissions ;
- `src/controllers` : auth, produits, catégories, projets, médias, commandes, paiements, demandes vendeur ;
- `src/middlewares` : auth, rôles, permissions, ownership, validation, upload local, erreurs ;
- `src/models` : modèles Mongoose ;
- `src/routes` : routeur principal et auth ;
- `src/services` : seed admin, Diapay, abstraction paiement, abstraction livraison ;
- `uploads` au runtime : stockage média local ;
- `scripts/test-mongo-dns.js` : diagnostic Mongo, pas un test métier automatisé.

### `diamarket-cms`

- `src/app/(cms)` : pages dashboard, produits, projets, catégories, commandes, vendeurs, points focaux, devises, livraison, slides, paramètres ;
- `src/components` : layout, gate auth et composants UI ;
- `src/lib` : clients API/auth ;
- `src/services/cms-service.ts` : façade d'accès aux endpoints ;
- `src/types` : types CMS.

### `diamarket-web`

- `src/app` : accueil, catalogue, produit, panier, checkout, compte, auth, demande vendeur, pages paiement ;
- `src/components` : header, UI et auth ;
- `src/context/store.tsx` : panier/devise/langue en mémoire ;
- `src/lib` : client API, auth, types, devise/i18n.

## 3.3 Modèles MongoDB identifiés

| Modèle | Présence / usage observé | État |
|---|---|---|
| `User` | identité, rôle, permissions, locale/devise | Utilisé |
| `Vendor` | boutique, statut, commission | Créé lors d'une approbation ; gestion incomplète |
| `VendorRequest` | candidature vendeur | Utilisé |
| `Product` | catalogue, stock, dimensions, vendor, statut | Utilisé |
| `Category` | hiérarchie/traductions | Utilisé en lecture/CRUD API |
| `Order` | items, total, paiement, expédition, événements | Utilisé, mais intégrité métier insuffisante |
| `Shipment` | tracking et payload provider | Utilisé lors du passage en processing |
| `Media` | upload/URL et métadonnées | Utilisé |
| `Project` | projets éditoriaux + galerie | Utilisé, principal module CMS abouti |
| `Commission` | commission vendeur | Modèle présent, aucun flow métier observé |
| `CurrencyRate` | taux FCFA/USD | Modèle présent, aucun contrôleur/route observé |
| `MarketplacePoint` | point focal/logistique | Modèle présent, aucun contrôleur/route observé |
| `Setting` | configuration clé/valeur | Modèle présent, aucun contrôleur/route observé |
| `Slide` | contenu accueil/traductions | Modèle présent, aucune route API observée |

## 3.4 Routes API réellement exposées

Toutes les routes sont préfixées par `/api`.

### Authentification

- `POST /auth/register` et `/v1/auth/register`
- `POST /auth/login` et `/v1/auth/login`
- `GET /auth/me`, `GET /auth/session`
- `POST /auth/logout`
- `GET /auth/oauth/providers`

### Système

- `GET /health` — retourne seulement `{ ok: true }`, sans statut Mongo/Diapay/DiaExpress.

### Catalogue et contenu

- `GET /products`, `GET /products/:slug`
- `POST /products`, `PUT /products/:id`, `DELETE /products/:id`
- `GET /categories`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id`
- `GET /projects`, `GET /projects/:id`, CRUD projets
- `GET /media`, création URL/upload, modification et suppression média

### Vendeurs

- `POST /vendor-requests`
- `GET /vendor-requests`
- `PUT /vendor-requests/:id/approve`
- `PUT /vendor-requests/:id/reject`

### Commandes, paiement et livraison

- `POST /orders`
- `GET /orders`, `GET /orders/:id`
- `GET /orders/:id/payment-status`
- `PUT /orders/:id/status`
- `POST /orders/:id/shipment/sync`
- `POST /payments/diapay/checkout-session`
- `GET /payments/diapay/session/:sessionId`
- `POST /payments/diapay/webhook`

### Écart majeur de contrat

Le CMS attend notamment `/admin/dashboard`, `/admin/products`, `/admin/categories`, `/admin/slides`, `/admin/vendors`, `/admin/marketplace-focal-points`, `/admin/settings`, `/admin/currencies`, `/admin/shipping`. Le routeur applique une protection à ces préfixes, mais **aucune de ces routes admin n'est ensuite implémentée**. Elles retournent donc vraisemblablement 404 après authentification.

## 3.5 Pages principales

### Site public

- `/`, `/catalogue`, `/product/[id]`, `/cart`, `/checkout`
- `/login`, `/register`, `/account`, `/vendor-apply`
- `/orders/[id]/payment`, `/orders/success`, `/orders/cancel`
- `/sitemap.xml`

### CMS

- `/login`, `/unauthorized`, `/dashboard`
- `/products`, `/projects`, `/categories`, `/orders`, `/vendors`
- `/focal-points`, `/currencies`, `/shipping`, `/slides`, `/settings`

## 3.6 Dépendances externes et intégrations

### API

- MongoDB/Mongoose ;
- Diapay via `diapay-sdk-js` et API HTTP ;
- provider livraison externe générique via HTTP, configurable par `SHIPPING_API_BASE_URL`/`SHIPPING_API_KEY` ;
- bcrypt, jsonwebtoken, cors, morgan, dotenv ;
- stockage média sur disque local.

### Frontends

- Next.js, React, Tailwind ;
- aucun SDK Clerk réellement importé malgré des README/env historiques mentionnant Clerk ;
- appels directs navigateur → API par cookie cross-origin.

### État DiaExpress

Une abstraction de provider livraison externe existe, mais le contrat est générique et aucune configuration ou adaptation explicitement nommée DiaExpress n'est présente dans Diamarket. L'intégration DiaExpress doit donc être considérée **non finalisée**.

---

## 4. Inventaire fonctionnel par module

Légende : **Présent**, **Probablement fonctionnel**, **Partiel**, **Manquant**.

| Module | Ce qui existe | Évaluation | Ce qui manque / limite principale |
|---|---|---|---|
| Login/logout/me | JWT signé, cookie HttpOnly, bearer support, compte désactivable | Probablement fonctionnel | CSRF, MFA admin, reset password, vérification e-mail, révocation session |
| Register | validation minimale, rôle forcé `user`, feature flag | Probablement fonctionnel | politique mot de passe robuste, consentements, vérification e-mail, anti-bot |
| OAuth/Clerk | endpoint providers et variables/README | Partiel/incohérent | aucune validation Clerk réelle ni SDK frontend observé |
| Rôles/permissions | matrice RBAC riche | Présent | scopes vendeur/commande incomplets, rôles incohérents (`user` vs `client`) |
| Protection CMS | gate client via `/auth/me`; API protège préfixes admin | Partiel | middleware Next laisse tout passer ; gate accepte seulement `admin`, pas `super_admin` ; flash de contenu possible |
| Dashboard CMS | cartes KPI visuelles | Démonstration | endpoint/dashboard réel, données, filtres, alertes |
| Produits | modèle riche, liste/search, CRUD API, page CMS partielle | Partiel | publication sécurisée, ownership update/delete, variantes, SKU, audit, imports, mapping frontend |
| Catégories | modèle + CRUD API | API partielle | CMS réel, permissions fines, validation slug/unicité, ordre/navigation |
| Slides | modèle présent | Manquant côté API | CRUD/API et CMS réel |
| Vendeurs | demandes, approve/reject, modèle Vendor | Partiel | liste/gestion admin, onboarding/KYC, suspension, dashboard vendeur, unicité user/vendor |
| Commandes | modèle/statuts, création, liste, statut, CMS partiel | Prototype risqué | recalcul serveur, stock, adresses, taxes, frais, isolation, transitions, annulation/retours |
| Paiement COD | champ/provider et checkout option | Partiel | règles d'éligibilité, confirmation, collecte/réconciliation |
| Diapay checkout | création session, idempotency key par commande, webhook HMAC, pages retour | Prototype avancé | ownership, anti-replay, unicité event, réconciliation, refund/dispute, tests, ledger |
| Wallet/ledger | modèle `Commission` seulement | Manquant | wallet, écritures immuables, balance, payout, rapprochement |
| Livraison | estimation mock/externe, création à `processing`, sync tracking | Prototype | endpoint public estimate absent, adresses, frais fiables, webhooks, retries, DiaExpress explicite |
| Médias | bibliothèque, URL/upload base64, suppression individuelle, galerie projets | Partiel | stockage objet/CDN, antivirus, transformations, références, quotas, pagination |
| Notifications/e-mail | aucune implémentation Diamarket observée | Manquant | confirmation compte/commande/paiement/livraison, templates, préférences |
| Recherche/filtre | text indexes produits/projets, filtres catalogue frontend | Partiel | filtres API avancés, pertinence, facettes, pagination intégrée, moteur dédié |
| Pages publiques | accueil/catalogue/produit/panier/checkout | Présent visuellement | données réelles fiables, pages légales/support, avis, vendeurs, SEO produit |
| Pages client | auth/compte/paiement | Partiel | historique réel, détail/suivi, adresses, profil, retours, notifications |
| Gestion erreurs | middleware API + quelques messages UI | Partiel | erreurs structurées, request ID, retry UX, ne pas masquer par mocks |
| Logs | Morgan + `console` | Faible | JSON structuré, corrélation, audit log, redaction, centralisation |
| Tests | aucun test Diamarket métier | Manquant | unitaires, intégration, contrats, E2E, sécurité, charge |

---

## 5. Insuffisances et risques classés

## 5.1 Critiques — bloquants avant production

### C1 — Secrets et fichiers `.env` suivis par Git

Les `.env` de `diamarket-api`, `diamarket-cms` et `diamarket-web` sont suivis par Git, malgré les `.gitignore`. Plusieurs valeurs sont non vides et certaines ressemblent à des identifiants/secrets. Toute valeur historiquement commitée doit être considérée compromise.

**Risque :** accès base, usurpation admin, fuite provider, compromission inter-environnements.
**Action :** rotation immédiate, secret scanning, retrait de l'index et purge d'historique contrôlée, secret manager.

### C2 — Isolation commandes/paiements insuffisante

- les rôles `user`, `client` et `viewer` ont `orders:read` ;
- `GET /orders` retourne toutes les commandes sans filtrage ;
- `GET /orders/:id` n'applique pas d'ownership guard ;
- `GET /orders/:id/payment-status`, création/relecture session Diapay ne vérifient pas que la commande/session appartient à l'appelant ;
- le vendor scope repose sur des headers `x-vendor-id` non dérivés de la base.

**Risque :** fuite de données personnelles/commerciales, accès au statut d'autres paiements, actions non autorisées.
**Action :** scopes serveur systématiques, vendor résolu depuis User/Vendor, policies testées sur chaque endpoint.

### C3 — Commande et montant contrôlés par le client

`POST /orders` accepte `customer`, `vendor`, `items`, `totalAmount`, monnaie et potentiellement statut depuis le body. L'API ne recharge pas les produits, ne recalcule pas prix/totaux/frais, ne contrôle ni disponibilité ni vendeur, et ne décrémente pas le stock.

**Risque :** paiement d'un montant manipulé, vente hors stock, commande attribuée à un tiers, fraude.
**Action :** DTO minimal depuis le client (`productId`, quantité, adresse, mode), recalcul transactionnel serveur et snapshot de prix.

### C4 — Catalogue public expose potentiellement brouillons/inactifs

Les routes publiques produits/projets acceptent un filtre `status`, mais n'imposent pas `active/published`. Les visiteurs peuvent donc vraisemblablement lister ou ouvrir des contenus en brouillon.

**Risque :** publication prématurée, informations internes exposées, prix non validés.
**Action :** routes publiques séparées et filtre publication obligatoire.

### C5 — Storefront masque les pannes API avec des données fictives

Produits, catégories, slides, estimation livraison et candidature vendeur ont des fallbacks mock silencieux ; l'historique de commandes est toujours fictif. Une panne backend peut donc apparaître comme un site fonctionnel, et une demande vendeur échouée peut être présentée comme reçue.

**Risque :** tromperie utilisateur, perte de demandes/commandes, incapacité à détecter les incidents.
**Action :** mocks réservés à un mode démo explicitement activé ; erreurs production visibles et observables.

### C6 — Aucun socle de tests Diamarket / CI de protection

Aucun test automatisé métier n'est présent pour les trois apps Diamarket, alors que l'auth, les commandes, le paiement et les webhooks sont sensibles.

**Risque :** régressions silencieuses sur argent, permissions et commandes.
**Action :** gates CI obligatoires et tests de sécurité/contrat avant toute mise en production.

## 5.2 Importants — nécessaires avant bêta publique

### I1 — Contrat CMS/API largement désaligné

La plupart des écrans CMS appellent des endpoints `/admin/*` inexistants. Catégories, slides, vendeurs, points focaux, devises et shipping sont essentiellement des tables d'exemple. Le dashboard/settings sont simulés.

### I2 — CMS protégé uniquement après rendu client

Le middleware Next retourne toujours `NextResponse.next()`. La protection repose sur `CmsAccessGate` côté navigateur ; ce n'est pas une barrière serveur. De plus, la gate et le login vérifient strictement `role === 'admin'`, excluant `super_admin` et autres rôles CMS autorisés par l'API.

### I3 — Validation backend trop faible et mass assignment

La validation vérifie principalement la présence de quelques champs. Plusieurs contrôleurs transmettent directement `req.body` à Mongoose, et certains updates n'activent pas `runValidators`. Il manque schémas stricts, whitelist de champs, validation ObjectId/URL/taille/type, normalisation et messages standardisés.

### I4 — Ownership produits/projets incomplet

L'ownership guard est appliqué uniquement à la création produit, pas à update/delete. Les projets n'appliquent pas d'ownership guard. Un vendeur/éditeur autorisé pourrait modifier des objets hors scope.

### I5 — Auth/session à durcir

- secret JWT par défaut dangereux ;
- token JWT également renvoyé dans le JSON alors qu'un cookie HttpOnly existe ;
- cookie cross-site `SameSite=None` en production sans protection CSRF observée ;
- aucun reset password, vérification e-mail, MFA, session store/révocation, rotation ;
- rate limit global mémoire, non distribué et non spécialisé sur login/register.

### I6 — Diapay incomplet pour une exploitation financière

Points positifs : clé secrète uniquement côté API, signature HMAC, comparaison timing-safe, contrôle montant/devise, idempotency key de création et journal d'événements. Limites :

- absence de timestamp/anti-replay webhook ;
- `eventId` non unique en base et événement sans ID potentiellement dupliqué ;
- traitement webhook non transactionnel ;
- création session sans contrôle ownership/état métier ;
- session brute retournée au navigateur ;
- pas de refund/dispute/chargeback/réconciliation/ledger/audit financier ;
- aucune suite de tests sandbox automatisée.

### I7 — Livraison/DiaExpress incomplète

- le storefront appelle `/shipping/estimate`, route inexistante dans `diamarket-api` ;
- l'estimation backend de commande reçoit un body de commande qui ne correspond pas clairement au type attendu ;
- création d'expédition uniquement lors du statut `processing`, sans idempotence : répétition possible ;
- aucun webhook de statut, retry, circuit breaker ou file d'attente ;
- aucune adresse de livraison structurée dans le modèle Order ;
- aucune adaptation explicite DiaExpress.

### I8 — Médias non adaptés à la production

Les fichiers sont stockés sur le disque local de l'API et importés via data URL JSON jusqu'à 8 MB ; SVG est accepté. Il n'y a pas de CDN/object storage, scan de contenu, traitement image, URLs signées, quotas ni protection contre suppression d'un média référencé.

### I9 — Déploiement Diamarket absent

Pas de Dockerfile, manifeste cloud, pipeline CI/CD ou infrastructure-as-code pour Diamarket. Le healthcheck ne teste pas la readiness DB. Aucun runbook, rollback ou migration/index deployment n'est défini.

### I10 — Monorepo/npm non normalisé

Aucun lockfile n'a été trouvé ; le script Turborepo racine échoue faute de `packageManager`/workspaces. Cela compromet la reproductibilité et le patching sécurité.

## 5.3 Moyens

- modèles/frontends dupliqués et mapping incohérent (`_id`, `slug`, `price` vs `priceFcfa`, dimensions) ;
- `getProduct(id)` recharge toute la liste et cherche un ID, alors que l'API expose un détail par slug ;
- pagination API non consommée correctement par certaines méthodes frontend ;
- panier/devise/langue uniquement en mémoire, perdus au refresh ;
- pas de stratégie multi-vendeur explicite alors qu'une commande n'accepte qu'un seul vendor ;
- pas de transitions de statut contrôlées : tout rôle `orders:update` peut pousser n'importe quel statut valide ;
- risque de créations multiples de Shipment sur répétition de `processing` ;
- modèle Commission non branché ; taux de change/configuration/slides/points focaux sans routes ;
- CORS fallback basé sur une regex permissive si allowlist absente ;
- rate limiter mémoire sans nettoyage robuste, sans Redis et sans distinction endpoint ;
- logs non structurés, pas de request ID, métriques, traces, alertes, audit admin ;
- erreurs du `fetchCollection` CMS transformées silencieusement en listes vides ;
- accessibilité limitée : images sans `alt`, formulaires souvent sans labels, confirmations et focus management faibles ;
- SEO limité : pages produit rendues client-side, sitemap inclut panier/checkout/account et n'inclut pas dynamiquement les produits ;
- pas de cache/CDN/révalidation ou optimisation image Next observés ;
- documentation API textuelle mais pas d'OpenAPI/Swagger exécutable.

## 5.4 Faibles

- textes/labels CMS incohérents ou anglophones (`currencies`, `shipping`) ;
- nombreux composants/pages condensés en lignes uniques, maintenance difficile ;
- design system fragmenté et packages UI partagés non exploités ;
- états empty/loading/error/success non uniformes ;
- aucune analytics produit/conversion ni collecte Core Web Vitals ;
- mentions légales, CGV, confidentialité, retours, contact/support non observés.

---

## 6. Analyse UX/UI

## 6.1 Site public et parcours client

### Points positifs

- architecture de navigation simple et responsive ;
- accueil, catalogue, produit, panier et checkout déjà matérialisés ;
- signaux visuels utiles : promo, vendeur vérifié, stock faible, statut paiement ;
- choix langue/devise présent ;
- pages dédiées retour Diapay succès/annulation.

### Faiblesses et améliorations

| Parcours | Faiblesse | Amélioration professionnelle recommandée |
|---|---|---|
| Accueil/catalogue | fallback mock silencieux, contenu générique, données API non normalisées | afficher données réelles, skeletons, erreurs réessayables, merchandising piloté CMS |
| Recherche/filtres | filtres surtout client-side, pas de facettes/pagination fiable | recherche serveur, filtres URL partageables, compte de résultats, tri stable |
| Fiche produit | variantes fictives, avis « bientôt », prix double calculé arbitrairement, images sans alt | vraies variantes/SKU, garanties/retours, vendeur réel, disponibilité, métadonnées SEO, avis modérés |
| Panier | perdu au refresh, stock non revalidé, multi-vendeur non géré | persistance locale/serveur, regroupement vendeur, validation stock/prix, sauvegarde wishlist |
| Création compte | UX simple mais sans vérification e-mail/reset/conditions | onboarding progressif, validation en ligne, force mot de passe, consentements, récupération compte |
| Checkout | détails/adresses/validation métier insuffisants, estimation fictive possible | checkout par étapes courtes, adresse structurée, résumé sticky, frais/taxes réels, validation serveur |
| Paiement | retry utile mais peu d'explication/assistance | états pending/failed/expired clairs, polling borné, support, reçu et référence transaction |
| Suivi commande | historique fictif, tracking non relié au Shipment | timeline réelle commande/paiement/livraison, détail colis, notifications et support |
| Demande vendeur | erreurs masquées et champs non alignés (`shopName` vs `businessName`) | formulaire aligné API, documents/KYC, accusé réel, statut et prochaines étapes |
| Accessibilité | labels/alt/focus/annonces incomplets | audit WCAG 2.2 AA, navigation clavier, contrastes, `alt`, erreurs associées aux champs |

## 6.2 CMS/admin et expérience vendeur/admin

### Points positifs

- layout cohérent avec sidebar/topbar ;
- composants réutilisables déjà amorcés ;
- module projets/médiathèque relativement riche : création progressive, URL/upload, galerie, suppression individuelle ;
- produits et commandes affichent déjà certaines données réelles ;
- page commandes prévoit la vérification Diapay.

### Faiblesses et améliorations

| Zone | Faiblesse | Amélioration professionnelle recommandée |
|---|---|---|
| Accès CMS | protection client-only, rôles incohérents | protection serveur, policy unique API/CMS, page 403, session expirée gérée |
| Dashboard | KPIs statiques | KPIs réels datés, comparaison période, alertes stock/paiement/livraison, drill-down |
| Produits | principalement liste, pas de workflow complet | formulaire structuré, variantes, médias, validation, prévisualisation, brouillon/publication, audit |
| Catégories/slides/devises/points focaux/shipping | pages exemple | CRUD réels, permissions, états vides/loading/error, confirmations sûres |
| Commandes | liste sommaire et action paiement partielle | détail complet, timeline, transition contrôlée, remboursement, expédition, notes internes, export |
| Vendeurs | page démo | file d'approbation, KYC, scopes, commission, suspension, historique |
| Médias | utile dans projets mais pas de page dédiée globale | médiathèque dédiée, filtres, pagination, usage/références, suppression protégée, optimisation |
| Paramètres | sauvegarde simulée | configuration versionnée, validation, permissions, secrets jamais exposés, audit |
| Feedback | erreurs souvent masquées par listes vides | toasts accessibles, erreurs détaillées, retry, logs corrélables, confirmations explicites |
| Expérience vendeur | aucun dashboard vendeur réel | portail séparé/scopé : produits, stock, commandes, commissions, expéditions, support |

---

## 7. Analyse production readiness

| Axe | État | Recommandation / gate de lancement |
|---|---|---|
| Sécurité | Insuffisant | corriger C1–C4, secret manager, CSRF, RBAC/scopes testés, Helmet/CSP/HSTS, scans |
| Scalabilité | Faible | Redis rate limit/cache, object storage/CDN, pagination, jobs asynchrones, stateless API |
| Erreurs | Partiel | format d'erreur standard, request ID, classification métier/provider, retry contrôlé |
| Performance | Non mesurée | index review, explain queries, cache, image optimization, budgets et tests de charge |
| SEO | Partiel | SSR/metadata produits/catégories, canonical, robots, sitemap dynamique, schema.org |
| Accessibilité | Non auditée | WCAG 2.2 AA, tests axe/keyboard/screen reader |
| Monitoring | Absent | logs JSON centralisés, métriques, traces, dashboards, alertes et SLO |
| Backup MongoDB | Documenté, non prouvé | Atlas backup/PITR, restauration testée, RPO/RTO définis |
| Médias | Non prêt | stockage S3-compatible, CDN, scan, resizing, lifecycle, backup |
| Paiement | Prototype | sandbox E2E, idempotence persistée, anti-replay, réconciliation, refund/dispute, ledger |
| Livraison | Prototype/mock | contrat DiaExpress, idempotence, tracking/webhooks, retries/DLQ, support incident |
| Environnements | Stratégie documentée seulement | comptes/DB/secrets/URLs isolés dev-staging-prod et promotion d'artefact |
| Déploiement | Absent pour Diamarket | images containers, CI/CD, migrations/indexes, readiness/liveness, rollback |
| Documentation | Partielle | OpenAPI, runbooks, catalogue env, diagrammes flows, manuel admin/support |

### Checklist minimale avant mise en production

#### Sécurité et conformité

- [ ] Tous les secrets historiquement commités ont été révoqués et rotatés.
- [ ] Aucun `.env` réel n'est suivi par Git ; secret scanning CI actif.
- [ ] Les routes commandes/paiements/médias/admin ont des tests d'autorisation négatifs.
- [ ] Les montants, vendeurs, stocks et frais sont recalculés côté serveur.
- [ ] CSRF, CORS strict, CSP/HSTS et rate limiting distribué sont actifs.
- [ ] Vérification e-mail, reset password et MFA admin sont disponibles.
- [ ] Politique de confidentialité, CGV, retours/remboursements et conservation des données validées.

#### Marketplace

- [ ] Seuls les produits publiés sont publics.
- [ ] Les règles mono/multi-vendeur sont explicites et testées.
- [ ] Le stock est réservé/décrémenté transactionnellement.
- [ ] Les transitions commande/paiement/livraison sont définies et auditées.
- [ ] Le client voit un historique et un suivi réels.
- [ ] Le CMS permet réellement de gérer produits, commandes, vendeurs, catégories et médias.

#### Diapay et DiaExpress

- [ ] Webhooks signés, anti-replay, idempotents et testés.
- [ ] Rapprochement Diapay et procédure de refund/dispute disponibles.
- [ ] Ledger/audit financier immuable disponible si fonds/commissions gérés.
- [ ] Intégration DiaExpress staging validée : estimation, création, tracking, erreurs/retry.
- [ ] Runbooks incidents provider et mode dégradé validés.

#### Exploitation

- [ ] Builds, lint, typecheck, tests et scans passent en CI.
- [ ] Staging est isolé et représentatif de production.
- [ ] Readiness/liveness, logs, métriques, traces et alertes sont opérationnels.
- [ ] Backups MongoDB et restauration sont testés.
- [ ] Object storage/CDN média et sauvegarde sont configurés.
- [ ] Tests de charge, sécurité et E2E checkout réussissent.
- [ ] Rollback et astreinte/support lancement sont définis.

---

## 8. Roadmap professionnelle proposée

Les estimations supposent une petite équipe pluridisciplinaire. Chaque itération doit se terminer par une démonstration, des critères d'acceptation et une décision go/no-go.

## Itération 1 — Stabilisation technique

**Objectif : rendre l'app stable, reproductible et buildable.**

### Travaux

- corriger le manifest racine Turborepo (`workspaces`, `packageManager`) et choisir un gestionnaire npm unique ;
- créer/committer un lockfile, nettoyer imports et dépendances inutilisées ;
- rendre les trois builds et typechecks reproductibles depuis une installation propre ;
- configurer ESLint non interactif pour API/CMS/web ;
- normaliser les noms de variables et compléter les `.env.example` sans secret ;
- retirer les `.env` réels du suivi Git après rotation ;
- distinguer health/liveness/readiness, avec statut DB ;
- imposer CORS explicite hors développement ;
- aligner README installation, ports et commandes ;
- définir un contrat de réponse API commun et produire une première spécification OpenAPI.

### Critères de sortie

- `install → lint → typecheck → test → build` exécutable automatiquement ;
- aucun secret détecté ;
- contrat des routes réellement exposées documenté ;
- health/readiness exploitable par un orchestrateur.

## Itération 2 — Auth & sécurité

**Objectif : sécuriser comptes, données et administration.**

### Travaux

- choisir et documenter la stratégie d'identité unique : auth interne ou Clerk, sans hybride ambigu ;
- finaliser login/register/logout/me, reset password et vérification e-mail ;
- renforcer JWT/session : secrets obligatoires, rotation/révocation, cookies/domaines, CSRF ;
- unifier rôles/permissions/scopes (`user/client`, admin/super_admin, vendeur, focal/logistique) ;
- protéger CMS côté serveur ;
- seed admin sûr, ponctuel et désactivé en production après bootstrap ;
- schémas de validation backend stricts et whitelist de champs ;
- résoudre vendor/customer scopes depuis la base, jamais depuis des headers client ;
- rate limiting distribué et renforcé sur auth ;
- tests de permissions positifs/négatifs et journal d'audit sécurité.

### Critères de sortie

- aucune lecture/écriture inter-utilisateur non autorisée ;
- CMS inaccessible sans rôle autorisé ;
- toutes les routes mutables validées et couvertes par tests de permissions.

## Itération 3 — Marketplace core

**Objectif : rendre le parcours marketplace complet et fiable.**

### Travaux

- séparer routes publiques publiées et routes de gestion ;
- finaliser produits, catégories, vendeurs, variantes/SKU/stock et médias produit ;
- aligner types/mappings API-web-CMS dans un package partagé ;
- panier persistant et décision mono/multi-vendeur ;
- création commande serveur : produits rechargés, prix/frais recalculés, snapshot, transaction stock ;
- modèle d'adresse, frais, taxes/remises et notes client ;
- machine à états commande et transitions autorisées ;
- dashboard client réel et dashboard vendeur si nécessaire ;
- suppression des mocks silencieux en production ;
- tests E2E catalogue → commande COD.

### Critères de sortie

- une commande COD réelle peut être créée, gérée et suivie sans donnée fictive ;
- aucune manipulation de montant/stock possible depuis le navigateur.

## Itération 4 — Paiement Diapay

**Objectif : intégrer un paiement professionnel et auditable.**

### Travaux

- checkout Diapay lié à une commande appartenant au client et éligible ;
- webhook signé avec timestamp/anti-replay ;
- idempotence persistée avec unicité `event_id` ;
- statuts paiement et machine à états séparés des statuts commande ;
- traitement transactionnel et réconciliation périodique ;
- refund partiel/complet, échec, expiration, dispute/chargeback ;
- ledger immuable, commissions et audit logs financiers ;
- ne jamais exposer de payload provider brut inutile ;
- sandbox E2E, tests de contrat et runbook incident.

### Critères de sortie

- double webhook/double clic/délai provider sans double débit ni état incohérent ;
- rapprochement et remboursement démontrés en staging.

## Itération 5 — Livraison DiaExpress

**Objectif : connecter livraison/expédition de bout en bout.**

### Travaux

- formaliser l'adapter API DiaExpress et ses versions/contrats ;
- calcul des frais depuis adresse, poids/dimensions et colis ;
- création expédition idempotente depuis commande payée/confirmée ;
- tracking, statuts livraison et mapping vers statuts commande ;
- assignation livreur/point focal si applicable ;
- webhooks DiaExpress ou polling contrôlé ;
- retries exponentiels, circuit breaker, DLQ et actions manuelles ;
- affichage client/admin/vendeur et notifications ;
- tests staging et runbook colis bloqué/perdu/retourné.

### Critères de sortie

- un colis staging est estimé, créé, suivi et livré avec statuts cohérents.

## Itération 6 — Admin/CMS professionnel

**Objectif : rendre l'administration exploitable quotidiennement.**

### Travaux

- implémenter les endpoints admin manquants et supprimer les données exemple ;
- dashboard KPI réel avec période et drill-down ;
- gestion produits/catégories/slides/projets ;
- gestion commandes, paiements, refunds, expéditions ;
- gestion utilisateurs/vendeurs/permissions/KYC ;
- médiathèque globale avec suppression individuelle protégée et usages ;
- logs admin/audit, notes internes et historique ;
- exports CSV/PDF asynchrones et sécurisés ;
- états loading/empty/error, pagination, recherche et bulk actions.

### Critères de sortie

- équipe support/opérations capable d'exploiter le cycle complet sans accès DB.

## Itération 7 — UX/UI production

**Objectif : rendre l'app crédible commercialement, accessible et cohérente.**

### Travaux

- design system partagé et tokens ;
- responsive et accessibilité WCAG 2.2 AA ;
- empty/loading/error/success states cohérents ;
- fiche produit professionnelle, confiance vendeur, garanties/retours, avis ;
- checkout optimisé mobile avec résumé, validation, assistance ;
- suivi commande en timeline ;
- pages marketing, vendeurs, FAQ, support, légal ;
- recherche/filtres performants ;
- tests utilisateurs et analytics funnel.

### Critères de sortie

- parcours mobile et desktop validés par QA/accessibilité et tests utilisateurs.

## Itération 8 — Production & monitoring

**Objectif : préparer et sécuriser le lancement.**

### Travaux

- pyramide de tests : unitaires, intégration, contrat, E2E, sécurité et charge ;
- CI/CD avec promotion dev → staging → prod et approvals ;
- containers/infrastructure-as-code, readiness/liveness, rollback ;
- logs JSON, metrics, traces, SLO/alertes et dashboards ;
- backup MongoDB/PITR et exercice de restauration ;
- variables/secrets production et rotation ;
- sécurité headers, scans SAST/SCA/secrets et pentest ;
- object storage/CDN média ;
- SEO technique, analytics consenties et Core Web Vitals ;
- documentation finale, runbooks, support et checklist go-live.

### Critères de sortie

- tous les gates de la checklist production sont verts ;
- lancement progressif/feature flags et rollback testés.

---

## 9. Priorisation recommandée

### P0 — Cette semaine

1. Révoquer/rotater tous les secrets présents ou historiquement présents dans Git.
2. Bloquer les accès inter-commandes/inter-paiements et toute confiance dans les montants envoyés par le client.
3. Désactiver les mocks silencieux hors environnement démo.
4. Interdire publication publique des brouillons.
5. Geler tout lancement avec transactions réelles tant que les tests de sécurité critiques n'existent pas.

### P1 — Prochaines 2 à 4 semaines

1. Itération 1 complète : reproductibilité, CI, env, contrats API.
2. Itération 2 complète : auth/RBAC/scopes/validation.
3. Concevoir puis implémenter le modèle transactionnel de commande/stock.
4. Aligner CMS/web avec les endpoints réellement disponibles.

### P2 — Avant bêta

1. Marketplace core E2E sans mocks.
2. Diapay staging auditable et réconcilié.
3. DiaExpress staging avec tracking.
4. CMS minimum exploitable et observabilité opérationnelle.

---

## 10. Branche / prochaine itération proposée

**Branche recommandée :** `iteration-1/stabilisation-technique`

### Contenu strict recommandé

- normalisation npm/Turborepo et lockfile ;
- builds/lint/typecheck reproductibles ;
- CI de base ;
- inventaire/normalisation env et retrait sécurisé des `.env` suivis ;
- health/readiness API ;
- CORS explicite ;
- OpenAPI initial reflétant les routes réelles ;
- aucun changement métier massif.

**Ticket sécurité parallèle prioritaire :** ouvrir immédiatement un incident interne `SEC-P0 — Rotation des secrets et confinement des accès commandes/paiements`. Ce ticket doit précéder toute utilisation de données ou paiements réels.

---

## 11. Vérifications techniques réalisées pendant l'audit

| Commande | Résultat | Conclusion |
|---|---|---|
| `npm run build:diamarket` | Échec | Turborepo ne résout pas les workspaces : champ `packageManager` manquant |
| `npm --prefix apps/diamarket-api run typecheck` | Échec | type definition `node` introuvable dans l'installation actuelle |
| `npm --prefix apps/diamarket-api run build` | Échec | même blocage de dépendance/type Node |
| `npm --prefix apps/diamarket-cms run typecheck` | Réussite | types CMS valides |
| `npm --prefix apps/diamarket-cms run build` | Réussite | build Next.js production CMS généré |
| `npm --prefix apps/diamarket-web run typecheck` | Réussite | types storefront valides |
| `npm --prefix apps/diamarket-web run build` | Réussite | build Next.js production storefront généré |
| `npm --prefix apps/diamarket-api run lint` | Commande factice | affiche `No lint configured` |
| `npm --prefix apps/diamarket-cms run lint` | Échec interactif | ESLint non configuré |
| `npm --prefix apps/diamarket-web run lint` | Échec interactif | ESLint non configuré |

---

## 12. Conclusion

Diamarket possède suffisamment de briques pour éviter une refonte totale : les modèles principaux, les écrans structurants, le RBAC, l'abstraction livraison et le flow Diapay constituent une base utile. La priorité n'est pas d'ajouter davantage d'écrans, mais de **rendre fiables, sécurisés et observables les parcours déjà amorcés**.

Le lancement production doit rester bloqué jusqu'à la résolution des risques critiques : secrets Git, isolation commandes/paiements, recalcul serveur des commandes, suppression des mocks silencieux et mise en place d'une couverture de tests/CI minimale. La séquence recommandée est donc : **stabilisation → sécurité → marketplace core → Diapay → DiaExpress → CMS → UX → exploitation production**.
