# Diamarket CMS — Audit des flows et roadmap par itérations

**Date :** 17 juin 2026  
**Périmètre principal :** `apps/diamarket-cms`, `apps/diamarket-api`, `docs/DIAMARKET_AUDIT_AND_ROADMAP.md`  
**Nature :** analyse interne statique et roadmap d’amélioration ; aucune refonte fonctionnelle appliquée.

---

## 1. Résumé exécutif CMS

Le CMS Diamarket est le back-office destiné à administrer la marketplace : authentification admin, pilotage des KPI, gestion du catalogue, des catégories, commandes, vendeurs, médias, slides, paramètres, devises, livraison et utilisateurs. Il doit devenir l’outil quotidien des équipes métier avant une exploitation réelle.

L’état actuel est celui d’un **prototype CMS partiellement connecté**. Le login admin fonctionne avec l’API Diamarket via `/api/auth/login`, `/api/auth/me` et `/api/auth/logout`, et les pages CMS sont protégées côté client par un gate admin. Plusieurs modules ont été branchés récemment côté API (`/api/admin/dashboard`, `/api/admin/products`, `/api/admin/categories`, `/api/admin/vendors`, `/api/admin/settings`, `/api/admin/slides`), ce qui corrige une partie de l’écart signalé dans l’audit global. En revanche, le CMS reste très hétérogène : certains écrans consomment des données réelles, d’autres restent entièrement statiques, et plusieurs flows importants n’ont pas encore de CRUD exploitable.

### Ce qui fonctionne ou semble exploitable statiquement

- Authentification admin de base : login, contrôle rôle admin après `/auth/me`, logout et stockage local du token en complément du cookie.
- Protection des routes CMS via `CmsAccessGate` et protection API via `requireAuth` + `requireAdmin` sur les préfixes admin.
- Dashboard connecté à `/admin/dashboard` avec KPI réels simples.
- Projets et médiathèque : module le plus complet côté CMS, même si la médiathèque n’a pas encore sa page dédiée.
- Paramètres marketplace basiques : lecture/écriture de clés autorisées.
- Vendeurs : liste et traitement des demandes vendeur partiellement branchés.
- Expéditions : liste `/shipments` et synchronisation provider disponibles, mais configuration logistique absente.

### Ce qui ne fonctionne pas encore ou reste partiel

- Produits : page essentiellement mockée ; le CMS n’utilise pas réellement `/admin/products` ni le CRUD `/products`.
- Catégories, slides, focal points, devises : écrans statiques avec lignes “Exemple”.
- Commandes : liste réelle possible mais endpoint CMS utilise `/orders` au lieu d’un endpoint admin dédié ; pas de détail complet, pas de changement de statut, pas de timeline.
- Médiathèque : services réels présents, mais pas de route `/media` dédiée dans le CMS.
- Utilisateurs/rôles et logs admin : backend partiel ou modèle présent, mais aucune UI CMS dédiée.
- Devises, commissions, zones/tarifs de livraison : modèles ou besoins identifiés, mais endpoints admin et UI insuffisants.

### Maturité et risques

Le CMS est **non prêt pour une équipe métier en production**. Sa maturité est estimée à **MVP technique incomplet** : l’ossature existe, mais les contrats API, les actions critiques, les états d’erreur, la validation et l’auditabilité sont insuffisants.

Risques majeurs avant utilisation réelle :

1. **Risque opérationnel :** un admin ne peut pas gérer complètement les produits, catégories, commandes, devises et slides.
2. **Risque de sécurité :** protection CMS surtout côté client ; il faut conserver et renforcer les protections API, permissions fines et journalisation.
3. **Risque de données :** formats API non uniformes (`data`, `stats`, tableau direct), retours silencieux `[]` dans `fetchCollection`, actions statiques donnant une fausse impression de fonctionnement.
4. **Risque business :** commandes, paiement, livraison, commissions et devises ne sont pas pilotables de bout en bout.

### Priorité générale

Priorité générale : **stabiliser le socle admin sécurisé**, puis rendre exploitables les flows à impact métier direct : dashboard, produits, catégories, commandes et vendeurs. Les modules de configuration avancée (devises, shipping, settings, logs) doivent suivre pour préparer la production.

---

## 2. Cartographie technique du CMS

### 2.1 Structure `apps/diamarket-cms/src/app`

| Zone | Rôle | État |
|---|---|---|
| `src/app/layout.tsx` | Layout racine Next.js | Minimal, global CSS |
| `src/app/page.tsx` | Entrée racine | Redirection/accueil selon implémentation existante |
| `src/app/login/page.tsx` | Login CMS admin | Fonctionnel côté client |
| `src/app/sign-in/[[...sign-in]]/page.tsx` | Compatibilité ancienne route sign-in | À vérifier / probablement legacy |
| `src/app/unauthorized/page.tsx` | Refus accès non-admin | Présent |
| `src/app/admin/page.tsx` | Route admin legacy | À clarifier |
| `src/app/(cms)/layout.tsx` | Layout protégé CMS | Utilise `CmsAccessGate`, sidebar, topbar |
| `src/app/(cms)/dashboard/page.tsx` | KPI admin | Connecté à `/admin/dashboard` |
| `src/app/(cms)/products/page.tsx` | Produits | UI mockée, non connectée CRUD |
| `src/app/(cms)/projects/page.tsx` | Projets + sélection média | Flow avancé réel |
| `src/app/(cms)/categories/page.tsx` | Catégories | Statique |
| `src/app/(cms)/orders/page.tsx` | Commandes/paiement | Liste + vérification paiement partielles |
| `src/app/(cms)/vendors/page.tsx` | Vendeurs/demandes | Partiellement connecté |
| `src/app/(cms)/focal-points/page.tsx` | Points focaux | Statique, endpoint absent |
| `src/app/(cms)/currencies/page.tsx` | Devises | Statique, endpoint absent |
| `src/app/(cms)/shipping/page.tsx` | Expéditions | Liste/sync réelle, configuration absente |
| `src/app/(cms)/slides/page.tsx` | Slides homepage | Statique malgré endpoints admin slides |
| `src/app/(cms)/settings/page.tsx` | Paramètres | Partiellement connecté |

### 2.2 Composants réutilisables

- `components/auth/cms-access-gate.tsx` : vérifie `/auth/me`, refuse les non-admins et redirige vers `/login` ou `/unauthorized`.
- `components/layout/sidebar.tsx`, `topbar.tsx` : navigation et structure admin.
- `components/ui/*` : `PageHeader`, `DataTable`, `FormInput`, `StatusBadge`, `StatCard`, `ConfirmModal`.
- `components/sidebar.tsx` : doublon ou composant legacy à consolider avec `components/layout/sidebar.tsx`.

### 2.3 Client API, auth, services, types

- `src/lib/api.ts` : client fetch générique, `credentials: include`, token Bearer lu depuis `localStorage`, mapping central `endpoints`.
- `src/lib/auth-client.ts` : client auth spécialisé, stockage `diamarket_cms_token`, login/me/logout.
- `src/services/cms-service.ts` : façade CMS ; mélange endpoints admin et endpoints publics/protégés.
- `src/types/cms.ts` : types projets, médias, commandes et enveloppes API ; couverture incomplète pour catégories, produits, settings, slides, users.

### 2.4 Gestion auth et protection admin

- Frontend : `CmsAccessGate` protège toutes les pages dans `(cms)`.
- Login : contrôle le rôle admin après authentification, logout immédiat si rôle non-admin.
- API : `apiRouter.use(['/admin', '/cms', '/dashboard'], requireAuth, requireAdmin)` protège les préfixes admin.
- Limite : protection frontend uniquement côté client, donc un rendu initial “chargement” existe ; c’est acceptable si l’API reste la source de vérité. Il faudra renforcer middleware Next si nécessaire, mais sans remplacer la sécurité API.

### 2.5 Routes/pages CMS et APIs appelées

| Page CMS | Route frontend | API appelée | Fonctionnelle ? | Problème observé | Priorité |
|---|---|---|---|---|---|
| Login | `/login` | `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` | Oui | Pas de retour à l’URL demandée, dépendance localStorage + cookie | Critique |
| Dashboard | `/dashboard` | `GET /api/admin/dashboard` | Partiel/Oui | KPI simples, pas alertes détaillées ni graphiques | Important |
| Produits | `/products` | Aucun appel effectif dans la page ; service `GET /api/admin/products` | Non | Données mockées, formulaire non soumis | Critique |
| Projets | `/projects` | `GET/POST/PUT/DELETE /api/projects`, `GET/POST/DELETE /api/media` | Oui/Partiel | Principal flow abouti, mais permissions vendor/admin à clarifier | Moyen |
| Catégories | `/categories` | Aucun appel effectif ; service `GET /api/admin/categories` | Non | Écran statique | Critique |
| Commandes | `/orders` | `GET /api/orders`, `GET /api/orders/:id/payment-status` | Partiel | Pas endpoint admin utilisé, actions très limitées | Critique |
| Vendeurs | `/vendors` | `GET /api/admin/vendors`, `GET /api/admin/vendor-requests`, approve/reject | Partiel | Pas changement statut vendeur dans UI, commissions limitées | Important |
| Focal points | `/focal-points` | Service attendu `/api/admin/marketplace-focal-points` | Non | Endpoint absent et écran statique | Moyen |
| Devises | `/currencies` | Service attendu `/api/admin/currencies` | Non | Endpoint absent et écran statique | Important |
| Shipping | `/shipping` | `GET /api/shipments`, `POST /api/orders/:id/shipment/sync` | Partiel | Suivi expéditions, pas configuration zones/tarifs | Important |
| Slides | `/slides` | Aucun appel effectif ; service `GET /api/admin/slides` | Non | Écran statique malgré endpoints CRUD | Important |
| Settings | `/settings` | `GET/PUT /api/admin/settings` | Partiel/Oui | Champs limités, validation et structure faibles | Important |
| Utilisateurs | Aucun écran | `GET /api/admin/users` existe | Non | Pas de page users/rôles | Important |
| Logs audit | Aucun écran | Modèle/service existent, endpoint liste absent | Non | Pas de consultation audit | Important |

---

## 3. Analyse flow par flow

### Flow 1 — Auth admin & protection CMS

**Endpoints concernés :** `POST /api/auth/login`, `GET /api/auth/me`, `GET /api/auth/session`, `POST /api/auth/logout`, préfixes `/api/admin/*` protégés par `requireAuth` + `requireAdmin`.

**Ce qui marche :**

- Login admin côté CMS avec email/password.
- Stockage du token retourné dans `localStorage` et envoi Bearer sur les appels suivants.
- Cookies envoyés avec `credentials: include`.
- `/auth/me` utilisé au chargement du CMS et du login pour vérifier l’état courant.
- Refus utilisateur non-admin côté login et gate CMS.
- Logout efface le token local même si l’appel API échoue.

**Ce qui manque :**

- Redirection post-login vers l’URL initialement demandée.
- Middleware Next côté edge pour éviter tout flash de layout protégé.
- Durcissement des erreurs : distinguer API indisponible, 401, 403, compte désactivé.
- Tests manuels documentés pour admin, vendor, user, anonyme.
- Expiration/refresh session explicite et stratégie multi-onglets.

**Risques :**

- Si l’API admin n’est pas correctement protégée, le gate client ne suffit pas.
- `localStorage` augmente l’exposition du token en cas de XSS ; idéalement privilégier cookie HttpOnly, ou documenter clairement le compromis.

**Corrections futures :**

- Conserver `requireAuth` + `requireAdmin` API comme source de vérité.
- Ajouter tests E2E auth admin.
- Ajouter redirection `next=/route`.
- Normaliser réponse auth : `{ success, authenticated, user, token? }`.

### Flow 2 — Dashboard CMS

**Endpoint :** `GET /api/admin/dashboard`.

**Constat :**

La page dashboard appelle réellement `cmsService.getDashboard()` puis affiche produits, commandes, commandes en attente, vendeurs, demandes vendeur, utilisateurs, chiffre d’affaires payé et stock faible. L’API agrège ces compteurs depuis les modèles `Product`, `Order`, `User`, `Vendor`, `VendorRequest`.

**Limites :**

- KPI simples sans période, comparaison, taux de conversion, alertes structurées.
- Format API spécifique `{ success, stats }`, différent d’autres endpoints `{ data }`.
- Aucun graphique réel.
- Loading minimal, fallback erreur présent mais non enrichi.

**Endpoint recommandé :** garder `GET /api/admin/dashboard`, mais formaliser son contrat : `stats`, `alerts`, `recentOrders`, `pendingActions`, `period`.

### Flow 3 — Gestion produits

**Endpoints attendus :** `GET /api/products`, `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`, `GET /api/categories`, `GET /api/media`.  
**Endpoints admin présents :** `GET /api/admin/products` ; CRUD via `/api/products` protégé admin/vendor.

**Constat CMS :**

- La page produits est mockée : deux produits statiques, formulaire non contrôlé, upload local affichant seulement les noms de fichiers.
- Aucun chargement de catégories, vendeurs ou médias.
- Pas de création, édition, suppression, publication/dépublication.
- Pas de validation métier ni feedback réel.

**Écarts :**

- L’API impose des champs requis (`name`, `slug`, `description`, `price`, `currency`, `category`, `vendor`, `stock`) mais la page ne construit aucun payload.
- Le service `getProducts` existe mais n’est pas utilisé par la page.
- Pas de workflow image avec médiathèque, ni gestion multi-images.

**Corrections futures :**

- Brancher liste sur `/admin/products`.
- Créer formulaire produit complet aligné modèle API.
- Ajouter sélection catégorie, vendeur, médias.
- Ajouter actions statut, stock, prix, suppression sécurisée.
- Normaliser messages succès/erreur et validation.

### Flow 4 — Gestion catégories

**Endpoints vérifiés :** `GET /api/categories`, `POST /api/categories`, `PUT /api/categories/:id`, `DELETE /api/categories/:id`, et variantes admin `GET/POST/PUT/DELETE /api/admin/categories`.

**Constat CMS :** écran statique avec recherche, filtre, bouton créer sans action, ligne “Exemple”.

**Ce qui manque :**

- Chargement liste réelle.
- Création/édition/suppression.
- Gestion statut, ordre, image/icône.
- Prévention suppression si catégorie utilisée par produits.
- Slug et hiérarchie/traductions si nécessaires.

**Risque :** sans catégories administrables, le catalogue produits ne peut pas être maintenu proprement.

### Flow 5 — Gestion commandes

**Endpoints vérifiés :** `GET /api/orders`, `GET /api/orders/:id`, `PUT /api/orders/:id/status`, `GET /api/orders/:id/payment-status`, `POST /api/orders/:id/shipment`, `POST /api/orders/:id/shipment/sync`.  
**Endpoints admin présents aussi :** `GET /api/admin/orders`, `GET /api/admin/orders/:id`, `PUT /api/admin/orders/:id/status`.

**Constat CMS :**

- Liste commandes via `/orders`, donc dépend des permissions `orders:read` et du comportement ownership du contrôleur.
- Vérification paiement disponible via `/orders/:id/payment-status`.
- Pas de page détail, pas de statut commande modifiable, pas de timeline, pas de création shipment depuis l’UI commandes.
- Colonnes centrées sur Diapay, mais pas sur items, client, total, adresse, livraison.

**Risques :**

- Mauvais endpoint pour un back-office admin si `/orders` filtre un jour par utilisateur/vendor.
- Actions sensibles non auditables depuis l’UI.
- Impossible d’opérer les commandes réelles.

**Corrections futures :**

- Migrer la liste CMS vers `/admin/orders`.
- Ajouter détail commande complet.
- Ajouter changement statut avec confirmation.
- Intégrer paiement, livraison et historique.

### Flow 6 — Gestion vendeurs

**Endpoints vérifiés :** `GET /api/vendor-requests`, `PUT /api/vendor-requests/:id/approve`, `PUT /api/vendor-requests/:id/reject`, `GET /api/admin/vendors`, `PUT /api/admin/vendors/:id/status`.  
**Variantes CMS utilisées :** `/admin/vendor-requests`, `/admin/vendors`.

**Constat :**

- Liste vendeurs agrégée avec nombre produits/commandes.
- Liste demandes vendeur et actions approve/reject disponibles.
- Pas d’action UI pour suspendre/réactiver un vendeur.
- Commission affichée mais pas gérée.
- Pas de détail vendeur, produits vendeur, commandes vendeur.

**Risque :** onboarding vendeur partiel, gouvernance vendeur insuffisante.

### Flow 7 — Médiathèque

**Endpoints vérifiés :** `GET /api/media`, `POST /api/media/url`, `POST /api/media/upload`, `PUT /api/media/:id`, `DELETE /api/media/:id`.  
**Demande initiale mentionne `POST /api/media` ; l’API réelle sépare URL et upload.**

**Constat :**

- Service CMS existe pour lister, créer depuis URL, uploader en dataUrl et supprimer.
- Le flow médias est intégré à la page projets.
- Pas de page médiathèque dédiée dans `(cms)`.
- Pas de pagination, filtres, preview globale, usage par produit/slide.
- Sécurité fichier dépend du middleware upload local, à durcir côté taille/type/stockage.

**Corrections futures :** créer une page `/media` ou intégrer proprement dans chaque flow avec composant commun `MediaPicker`.

### Flow 8 — Slides / homepage

**Endpoints vérifiés :** `GET /api/slides`, `GET /api/slides/:id`, `GET /api/admin/slides`, `POST /api/admin/slides`, `PUT /api/admin/slides/:id`, `DELETE /api/admin/slides/:id`.

**Constat CMS :** page statique, non connectée aux endpoints disponibles.

**Ce qui manque :**

- Liste réelle, formulaire, choix image/média, ordre, statut actif.
- Preview homepage.
- Validation du lien CTA.
- Vérification affichage côté web.

### Flow 9 — Paramètres CMS

**Endpoints vérifiés :** `GET /api/admin/settings`, `PUT /api/admin/settings`, `GET /api/settings` public filtré.

**Constat :**

- Page connectée pour `marketplaceName`, `defaultCurrency`, `defaultCommission`, `supportContact`, `maintenanceMode`.
- API n’accepte qu’une whitelist de clés : `marketplaceName`, `defaultCurrency`, `defaultCommission`, `supportContact`, `maintenanceMode`, `checkout`, `shipping`.
- Pas de schéma typé pour `checkout` et `shipping`.
- Secrets non exposés : bon principe, à maintenir.

**Corrections futures :** structurer les paramètres par sections avec validation côté API.

### Flow 10 — Devises / monnaies

**Endpoints potentiels :** `GET/POST/PUT/DELETE /api/admin/currencies`.  
**État réel :** modèle `CurrencyRate` présent, routes admin currencies absentes.

**Constat CMS :** page statique.

**Manques :** FCFA/USD/EUR, taux, devise par défaut, historique, conversion prix, cohérence affichage web.

### Flow 11 — Livraison / shipping

**Endpoints réels :** `GET /api/shipments`, `POST /api/shipping/estimate`, `POST /api/orders/:id/shipment`, `GET /api/orders/:id/shipment`, `GET /api/shipments/:trackingNumber`, `POST /api/orders/:id/shipment/sync`, `POST /api/shipping/diaexpress/webhook`.  
**Endpoints potentiels settings :** `GET/PUT /api/admin/shipping` absent comme route dédiée.

**Constat CMS :**

- Page expéditions réelle : liste shipments, filtre statut local, sync tracking.
- Pas de configuration zones, tarifs, délais, DiaExpress provider, frais.
- Pas de création shipment depuis la page shipping.

**Risque :** suivi partiel mais configuration opérationnelle absente.

### Flow 12 — Utilisateurs / rôles

**Endpoints potentiels :** `GET /api/admin/users`, `PUT /api/admin/users/:id/role`, `PUT /api/admin/users/:id/status`.  
**État réel :** `GET /api/admin/users` existe ; update rôle/statut absent.

**Constat CMS :** aucune page utilisateurs.

**Manques :** liste, filtres, rôles, activation/désactivation, permissions, séparation clients/vendors/admins, audit des changements.

### Flow 13 — Logs admin / audit

**Endpoint potentiel :** `GET /api/admin/audit-logs`.  
**État réel :** modèle `AdminAuditLog` et service `logAdminAction` présents ; endpoint de consultation absent.

**Constat :** actions settings et vendor status journalisées côté service, mais non consultables dans le CMS. Approve/reject vendor request et autres actions critiques doivent être vérifiées pour journalisation.

**Risque :** traçabilité insuffisante en production.

---

## 4. Tableau endpoint CMS ↔ API

| Fonction CMS | Endpoint attendu | Endpoint existe ? | Protégé ? | Format OK ? | Action recommandée |
|---|---|---:|---:|---:|---|
| Login | `POST /api/auth/login` | Oui | Non requis | Oui | Garder, tester cas erreurs |
| Session admin | `GET /api/auth/me` | Oui | Oui | Oui | Ajouter cas compte désactivé |
| Logout | `POST /api/auth/logout` | Oui | Oui | Oui | Tester effacement cookie/token |
| Dashboard | `GET /api/admin/dashboard` | Oui | Oui admin | Partiel | Formaliser `stats/alerts/recent` |
| Liste produits admin | `GET /api/admin/products` | Oui | Oui admin | Partiel | Utiliser dans page produits |
| CRUD produits | `POST/PUT/DELETE /api/products` | Oui | Oui rôle/permission | Partiel | Ajouter UI et validation complète |
| Liste catégories | `GET /api/admin/categories` / `/api/categories` | Oui | Admin pour admin | Partiel | Connecter UI |
| CRUD catégories | `POST/PUT/DELETE /api/admin/categories/:id` | Oui | Oui admin | Partiel | Connecter UI, vérifier contraintes produits |
| Liste commandes admin | `GET /api/admin/orders` | Oui | Oui admin | À vérifier | Remplacer `/orders` côté CMS |
| Détail commande | `GET /api/admin/orders/:id` | Oui | Oui admin | À vérifier | Ajouter page/detail panel |
| Statut commande | `PUT /api/admin/orders/:id/status` | Oui | Oui admin | À vérifier | Ajouter actions contrôlées |
| Statut paiement | `GET /api/orders/:id/payment-status` | Oui | Oui auth | Partiel | Ajouter variante admin ou confirmer permissions |
| Créer shipment | `POST /api/orders/:id/shipment` | Oui | Auth, pas admin strict | À durcir | Protéger selon rôle/ownership |
| Sync shipment | `POST /api/orders/:id/shipment/sync` | Oui | Auth | À durcir | Protéger admin/vendor autorisé |
| Demandes vendeur | `GET /api/admin/vendor-requests` | Oui | Oui admin | Oui/Partiel | Ajouter filtres/status |
| Approve/reject vendeur | `PUT /api/admin/vendor-requests/:id/*` | Oui | Oui admin | Oui/Partiel | Journaliser systématiquement |
| Liste vendeurs | `GET /api/admin/vendors` | Oui | Oui admin | Partiel | Ajouter pagination/détail |
| Statut vendeur | `PUT /api/admin/vendors/:id/status` | Oui | Oui admin | Oui | Ajouter UI |
| Médias liste | `GET /api/media` | Oui | Oui admin | Partiel | Ajouter page dédiée/pagination |
| Média URL | `POST /api/media/url` | Oui | Oui admin+permission | Oui | Documenter au lieu de `POST /media` |
| Média upload | `POST /api/media/upload` | Oui | Oui admin+permission | Partiel | Durcir sécurité fichier |
| Slides publics | `GET /api/slides` | Oui | Public | Oui/Partiel | Vérifier usage web |
| Slides admin CRUD | `GET/POST/PUT/DELETE /api/admin/slides` | Oui | Oui admin | À vérifier | Connecter page slides |
| Settings | `GET/PUT /api/admin/settings` | Oui | Oui admin | Partiel | Typage + validation sections |
| Devises | `/api/admin/currencies` | Non | N/A | N/A | Créer contrôleur/routes |
| Shipping config | `/api/admin/shipping` | Non dédié | N/A | N/A | Créer via settings ou module dédié |
| Utilisateurs | `GET /api/admin/users` | Oui | Oui admin | Partiel | Ajouter page users |
| Rôle/statut user | `PUT /api/admin/users/:id/role/status` | Non | N/A | N/A | Créer endpoints sécurisés |
| Audit logs | `GET /api/admin/audit-logs` | Non | N/A | N/A | Créer endpoint lecture admin |
| Focal points | `/api/admin/marketplace-focal-points` | Non | N/A | N/A | Décider maintien ou retrait du CMS |

---

## 5. Tableau des problèmes par gravité

### Critique

| Flow | Fichier frontend | Endpoint API | Cause probable | Impact | Correction recommandée |
|---|---|---|---|---|---|
| Produits | `apps/diamarket-cms/src/app/(cms)/products/page.tsx` | `/api/admin/products`, `/api/products` | Page mockée non branchée | Catalogue non administrable | Brancher liste + CRUD complet |
| Commandes | `apps/diamarket-cms/src/app/(cms)/orders/page.tsx` | `/api/admin/orders`, `/api/orders/:id/status` | UI trop limitée et endpoint liste non admin | Commandes non opérables | Détail, statut, timeline, endpoint admin |
| Catégories | `apps/diamarket-cms/src/app/(cms)/categories/page.tsx` | `/api/admin/categories` | Écran statique | Produits difficiles à structurer | CRUD catégories complet |
| Auth sécurité production | `cms-access-gate.tsx`, `auth-client.ts` | `/api/auth/*`, `/api/admin/*` | Socle récent non testé E2E | Risque accès/UX en production | Tests auth, redirections, durcissement sessions |

### Important

| Flow | Fichier frontend | Endpoint API | Cause probable | Impact | Correction recommandée |
|---|---|---|---|---|---|
| Vendeurs | `vendors/page.tsx` | `/api/admin/vendors/:id/status` | UI partielle | Gouvernance vendeur incomplète | Ajouter détail/statut/commission |
| Slides | `slides/page.tsx` | `/api/admin/slides` | Écran généré statique | Homepage non pilotable | CRUD slides + media picker |
| Devises | `currencies/page.tsx` | `/api/admin/currencies` | Routes absentes | Prix multi-devise non gouvernés | Créer module currencies |
| Shipping | `shipping/page.tsx` | `/api/admin/shipping`, `/api/shipments` | Suivi sans config | Frais/délais non pilotables | Module zones/tarifs/settings shipping |
| Settings | `settings/page.tsx` | `/api/admin/settings` | Formulaire minimal | Config fragile | Schéma typé + sections |
| Users | Aucun | `/api/admin/users` | UI absente | Rôles non administrables | Page users + endpoints role/status |
| Audit | Aucun | `/api/admin/audit-logs` | Endpoint absent | Pas de traçabilité | API + page logs |

### Moyen

| Flow | Fichier frontend | Endpoint API | Cause probable | Impact | Correction recommandée |
|---|---|---|---|---|---|
| Médiathèque | Pas de page dédiée | `/api/media/*` | Intégrée seulement aux projets | Réutilisation limitée | Page media + composant MediaPicker |
| Dashboard | `dashboard/page.tsx` | `/api/admin/dashboard` | KPI v1 | Pilotage limité | Ajouter alertes, période, récents |
| Focal points | `focal-points/page.tsx` | `/api/admin/marketplace-focal-points` | Modèle sans routes | Module inutilisable | Décider priorité métier |
| Projets | `projects/page.tsx` | `/api/projects`, `/api/media` | Flow avancé mais isolé | Qualité variable | Stabiliser validations et permissions |

### Faible

| Flow | Fichier frontend | Endpoint API | Cause probable | Impact | Correction recommandée |
|---|---|---|---|---|---|
| UI cohérence | Plusieurs pages | Tous | Pages statiques générées | UX non professionnelle | Harmoniser états loading/error/empty |
| Types | `types/cms.ts` | Tous | Types incomplets | Régressions silencieuses | Étendre types CMS alignés API |
| API service | `cms-service.ts` | Tous | `fetchCollection` masque erreurs | Debug difficile | Ne pas avaler les erreurs critiques |

---

## 6. Roadmap par itérations CMS

### Itération CMS 1 — Auth & protection admin

**Objectif :** rendre l’accès CMS fiable et sécurisé.  
**Fichiers probables :** `src/lib/auth-client.ts`, `src/components/auth/cms-access-gate.tsx`, `src/app/login/page.tsx`, `apps/diamarket-api/src/controllers/auth.controller.ts`, middlewares auth/admin.  
**Endpoints :** `/api/auth/login`, `/api/auth/me`, `/api/auth/session`, `/api/auth/logout`, `/api/admin/*`.

**Inclure :** login admin, session persistante, logout, refus non-admin, redirections, messages erreurs.

**Critères d’acceptation :**

- Un admin accède à `/dashboard` après login.
- Un user/vendor est redirigé vers `/unauthorized`.
- Un anonyme est redirigé vers `/login`.
- Logout invalide la session et empêche l’accès aux pages CMS.
- Les endpoints admin retournent 401/403 sans rôle admin.

**Tests manuels :** login admin, login vendor, login user, refresh page, multi-onglets, expiration token.  
**Risque :** élevé.  
**Priorité :** P0.

### Itération CMS 2 — Dashboard réel

**Objectif :** brancher le dashboard sur des KPI réels.  
**Fichiers probables :** `dashboard/page.tsx`, `cms-service.ts`, `admin.controller.ts`.  
**Endpoints :** `GET /api/admin/dashboard`.

**Inclure :** stats produits/commandes/users/vendors, alertes, états loading/error, commandes récentes.

**Critères d’acceptation :** KPI cohérents en base, erreurs visibles, aucun mock.  
**Tests manuels :** créer données test, vérifier compteurs, simuler API down.  
**Risque :** moyen.  
**Priorité :** P1.

### Itération CMS 3 — Produits

**Objectif :** rendre la gestion produits complète.  
**Fichiers probables :** `products/page.tsx`, `cms-service.ts`, `types/cms.ts`, `products.controller.ts`.  
**Endpoints :** `GET /api/admin/products`, `POST/PUT/DELETE /api/products`, `GET /api/admin/categories`, `GET /api/media`, `GET /api/admin/vendors`.

**Inclure :** CRUD produits, stock, images, catégories, publication, validation.

**Critères d’acceptation :** un admin peut créer, éditer, publier/dépublier, supprimer/désactiver et voir un produit côté API.  
**Tests manuels :** produit minimal, produit avec média, stock bas, validation champs requis.  
**Risque :** élevé.  
**Priorité :** P0.

### Itération CMS 4 — Catégories

**Objectif :** rendre la gestion catégories complète.  
**Fichiers probables :** `categories/page.tsx`, `cms-service.ts`, `categories.controller.ts`.  
**Endpoints :** `GET/POST/PUT/DELETE /api/admin/categories`.

**Critères d’acceptation :** CRUD, ordre, statut, image/icône, blocage suppression si produits liés.  
**Tests manuels :** créer catégorie, modifier slug, supprimer catégorie vide, tenter supprimer catégorie utilisée.  
**Risque :** élevé.  
**Priorité :** P0.

### Itération CMS 5 — Commandes

**Objectif :** rendre les commandes exploitables.  
**Fichiers probables :** `orders/page.tsx`, `cms-service.ts`, `orders.controller.ts`, shipping/payment services.  
**Endpoints :** `/api/admin/orders`, `/api/admin/orders/:id`, `/api/admin/orders/:id/status`, `/api/orders/:id/payment-status`, `/api/orders/:id/shipment`.

**Inclure :** détail, statut, paiement, livraison, timeline.

**Critères d’acceptation :** l’admin voit toutes les infos commande, met à jour les statuts autorisés, déclenche/synchronise livraison.  
**Tests manuels :** commande COD, commande Diapay, changement statut, sync shipment.  
**Risque :** élevé.  
**Priorité :** P0.

### Itération CMS 6 — Vendeurs

**Objectif :** gérer demandes et vendeurs.  
**Fichiers probables :** `vendors/page.tsx`, `admin.controller.ts`, `vendor-requests.controller.ts`.  
**Endpoints :** `/api/admin/vendor-requests`, `/api/admin/vendors`, `/api/admin/vendors/:id/status`.

**Critères d’acceptation :** approuver/refuser, suspendre/réactiver, voir produits/commandes vendeur, gérer commission.  
**Tests manuels :** demande pending, approve, reject, suspend vendor.  
**Risque :** moyen/élevé.  
**Priorité :** P1.

### Itération CMS 7 — Médiathèque

**Objectif :** médiathèque professionnelle.  
**Fichiers probables :** nouvelle page `src/app/(cms)/media/page.tsx`, composant `MediaPicker`, `media.controller.ts`.  
**Endpoints :** `/api/media`, `/api/media/url`, `/api/media/upload`, `/api/media/:id`.

**Critères d’acceptation :** upload, liste, preview, sélection, suppression, pagination, filtres, erreurs fichiers.  
**Tests manuels :** upload image valide, fichier invalide, suppression média inutilisé, sélection produit/slide.  
**Risque :** moyen.  
**Priorité :** P1.

### Itération CMS 8 — Slides homepage

**Objectif :** brancher le contenu homepage au CMS.  
**Fichiers probables :** `slides/page.tsx`, `slides.controller.ts`, web homepage si nécessaire uniquement pour vérifier affichage.  
**Endpoints :** `GET /api/slides`, `GET/POST/PUT/DELETE /api/admin/slides`.

**Critères d’acceptation :** CRUD slide, actif/inactif, ordre, image, CTA, preview web.  
**Tests manuels :** créer slide active, réordonner, désactiver, vérifier côté web.  
**Risque :** moyen.  
**Priorité :** P1.

### Itération CMS 9 — Paramètres marketplace

**Objectif :** configurer la marketplace sans toucher au code.  
**Fichiers probables :** `settings/page.tsx`, `admin.controller.ts`, `setting.model.ts`.  
**Endpoints :** `GET/PUT /api/admin/settings`, `GET /api/settings`.

**Critères d’acceptation :** sections marketplace, contact, checkout, maintenance, shipping ; validation ; aucun secret exposé.  
**Tests manuels :** modifier nom, maintenance, support, checkout, vérifier public settings.  
**Risque :** moyen.  
**Priorité :** P1.

### Itération CMS 10 — Devises & commissions

**Objectif :** gérer monnaies, taux et commissions.  
**Fichiers probables :** `currencies/page.tsx`, nouveaux contrôleurs routes currencies/commissions, modèles `CurrencyRate`, `Commission`.  
**Endpoints :** `/api/admin/currencies`, endpoints commissions à définir.

**Critères d’acceptation :** FCFA/USD/EUR, taux, devise par défaut, commission globale et vendeur, validations.  
**Tests manuels :** changer taux, vérifier affichage prix, commission vendeur.  
**Risque :** moyen/élevé.  
**Priorité :** P1.

### Itération CMS 11 — Livraison / DiaExpress

**Objectif :** gérer zones, frais et tracking.  
**Fichiers probables :** `shipping/page.tsx`, `shipping.controller.ts`, services shipping, settings shipping.  
**Endpoints :** `/api/admin/shipping` ou `PUT /api/admin/settings.shipping`, `/api/shipping/estimate`, `/api/shipments`, `/api/orders/:id/shipment/sync`.

**Critères d’acceptation :** zones, tarifs, délais, provider, tracking, sync, erreurs provider.  
**Tests manuels :** estimation, création shipment, sync, webhook mock.  
**Risque :** élevé.  
**Priorité :** P1.

### Itération CMS 12 — Utilisateurs & rôles

**Objectif :** gérer clients, vendeurs, admins.  
**Fichiers probables :** nouvelle page `users/page.tsx`, `routes/index.ts`, `admin.controller.ts`, `user.model.ts`.  
**Endpoints :** `GET /api/admin/users`, `PUT /api/admin/users/:id/role`, `PUT /api/admin/users/:id/status`.

**Critères d’acceptation :** liste filtrable, changement rôle sécurisé, activation/désactivation, protection dernier admin.  
**Tests manuels :** désactiver user, promouvoir admin, empêcher suppression dernier admin.  
**Risque :** élevé.  
**Priorité :** P1.

### Itération CMS 13 — Logs admin & audit

**Objectif :** tracer les actions sensibles.  
**Fichiers probables :** nouvelle page `audit-logs/page.tsx`, `admin-audit.service.ts`, `admin-audit-log.model.ts`, nouveau contrôleur.  
**Endpoints :** `GET /api/admin/audit-logs`.

**Critères d’acceptation :** journal des actions admin sensibles, filtres par acteur/action/date, aucune donnée secrète.  
**Tests manuels :** action settings, vendor status, product update, vérifier log.  
**Risque :** moyen.  
**Priorité :** P2.

### Itération CMS 14 — UX/UI admin production

**Objectif :** rendre le CMS professionnel et confortable.  
**Fichiers probables :** composants UI, sidebar/topbar, toutes pages CMS.  
**Endpoints :** tous.

**Critères d’acceptation :** états loading/error/empty, confirmations, toasts, pagination, filtres, accessibilité, responsive.  
**Tests manuels :** navigation complète, erreurs API, mobile/tablette, clavier.  
**Risque :** moyen.  
**Priorité :** P2.

### Itération CMS 15 — Tests & production CMS

**Objectif :** tests, build, monitoring, checklist go-live CMS.  
**Fichiers probables :** scripts npm, tests E2E, docs runbook, CI.  
**Endpoints :** health/readiness, tous endpoints admin.

**Critères d’acceptation :** `npm install`, build CMS, tests auth/flows critiques, checklist secrets/CORS/cookies/monitoring.  
**Tests manuels :** smoke test complet staging.  
**Risque :** élevé si absent.  
**Priorité :** P0 avant production.

---

## 7. Priorités immédiates

### Les 3 flows à corriger en premier

1. **Produits** — c’est le cœur du catalogue. Sans CRUD produit fiable, la marketplace ne peut pas être administrée.
2. **Commandes** — c’est le cœur opérationnel. Il faut voir, comprendre et agir sur chaque commande, paiement et livraison.
3. **Catégories** — dépendance directe des produits ; nécessaire pour un catalogue propre, filtrable et maintenable.

### Pourquoi cet ordre

- Produits et catégories débloquent l’alimentation du catalogue.
- Commandes débloquent l’exploitation réelle et le support client.
- Ces trois flows réduisent l’écart principal entre “prototype visuel” et “outil métier utilisable”.

### Branche recommandée

`feature/cms-products-orders-categories-hardening`

### Ordre d’exécution recommandé

1. Stabiliser contrats API admin produits/catégories/commandes.
2. Brancher listes réelles avec états loading/error/empty.
3. Ajouter formulaires CRUD catégories puis produits.
4. Ajouter détail commande et changement statut.
5. Ajouter tests manuels documentés puis tests automatisés critiques.

---

## 8. Contraintes à respecter

- Ce ticket est une analyse/documentation.
- Ne pas faire de refonte dans ce ticket.
- Ne pas tout corriger maintenant.
- Ne pas casser le login admin qui fonctionne.
- Ne pas réintroduire pnpm/turbo.
- N’utiliser que npm.
- Utiliser l’audit global comme référence, tout en notant que certains endpoints admin absents dans l’audit du 12 juin 2026 existent maintenant dans le routeur actuel.
- Ne pas travailler sur `diamarket-web` sauf vérification d’affichage indispensable.
- Ne pas travailler sur DiaExpress.

---

## 9. Validation finale recommandée

Pour ce ticket documentaire :

1. Vérifier que seul le document d’audit CMS est ajouté.
2. Lancer un build CMS si l’environnement dispose des dépendances.
3. Ne modifier aucune logique applicative.
4. Commit recommandé :

```bash
git add docs/DIAMARKET_CMS_FLOW_AUDIT_AND_ITERATIONS.md
git commit -m "docs: audit diamarket cms flows and iteration plan"
```
