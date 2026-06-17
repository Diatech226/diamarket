# Diamarket CMS — Rapport de stabilisation des flows existants

**Date :** 17 juin 2026  
**Objectif :** stabiliser les flows CMS existants avant toute exécution de roadmap ou ajout fonctionnel.

## Synthèse

La stabilisation a privilégié les corrections de connexion API, la suppression de mocks visibles, la remontée explicite des erreurs et l’ajout d’états `loading`, `error` et `empty` sur les pages critiques. Aucune refonte UI ni nouvelle fonctionnalité métier n’a été introduite : les écrans existants ont été branchés sur les endpoints déjà présents dans `diamarket-api`.

## Tableau de contrôle par page CMS

| Route | Fonctionnelle | Partiellement fonctionnelle | Cassée | Cause | Correctif appliqué |
|---|---:|---:|---:|---|---|
| `/dashboard` | Oui | Non | Non | KPI déjà branchés mais erreurs API peu visibles. | Validation statique du flow existant ; conservation loading/error. |
| `/products` | Oui | Non | Non | Page mockée, aucun CRUD réel, upload limité à noms de fichiers, catégories/vendors/médiathèque absents. | Connexion liste/création/modification/suppression à l’API, chargement catégories/vendors/médias, upload média réel, sélection médiathèque, validations minimales et états loading/error/empty. |
| `/categories` | Oui | Non | Non | Page statique avec ligne “Exemple”, bouton créer inactif. | CRUD connecté à `/admin/categories`, formulaire contrôlé, slug automatique, validation nom, suppression avec confirmation, états loading/error/empty. |
| `/orders` | Oui | Non | Non | Liste utilisait l’endpoint non-admin, statut non modifiable, erreurs silencieuses. | Bascule vers `/admin/orders`, ajout mise à jour statut, conservation vérification paiement, états loading/error/empty. |
| `/vendors` | Oui | Non | Non | Approve/reject partiel, pas d’action statut vendeur depuis la liste. | Ajout action activer/suspendre via `/admin/vendors/:id/status`, rafraîchissement après action, messages d’erreur. |
| `/slides` | Oui | Non | Non | Page statique mockée malgré endpoints existants. | CRUD connecté à `/admin/slides`, suppression des données mockées, formulaire contrôlé, états loading/error/empty. |
| `/settings` | Oui | Non | Non | Lecture/sauvegarde déjà connectées ; validation limitée. | Flow conservé car persistance API existante ; risque restant documenté. |
| `/shipping` | Oui | Non | Non | Tracking/sync présents mais erreur/empty/loading incomplets. | Ajout états loading/error/empty et remontée d’erreurs provider/API. |
| `/projects` | Oui | Non | Non | Flow déjà connecté médias/projets. | Aucun changement nécessaire dans cette phase. |
| `/focal-points` | Non | Non | Oui | Endpoint attendu absent ou non câblé côté API ; écran statique hors périmètre endpoints existants. | Non corrigé pour éviter d’ajouter un endpoint ou une fonctionnalité. |
| `/currencies` | Non | Non | Oui | Endpoint admin absent ; écran statique. | Non corrigé pour éviter d’ajouter un endpoint ou une fonctionnalité. |
| `/login` | Oui | Non | Non | Login admin déjà protégé via `/auth/login` + `/auth/me`. | Aucun changement pour ne pas casser le login admin. |
| `/unauthorized` | Oui | Non | Non | Page simple de refus d’accès. | Aucun changement nécessaire. |

## Problèmes trouvés

### Dashboard

- Les KPI sont lus depuis `/admin/dashboard` et couvrent produits, commandes, vendeurs, demandes vendeur, utilisateurs, chiffre d’affaires et stock faible.
- Le flow avait déjà un chargement et une erreur visibles ; aucune carte mockée n’a été identifiée sur cette page.
- Risque restant : le contrat API reste spécifique (`stats`) alors que d’autres endpoints utilisent `data`.

### Produits

- La page était intégralement prototype : données mockées, formulaire non soumis, aucun CRUD, aucune catégorie ou médiathèque réelle.
- Le service CMS masquait les erreurs en retournant `[]`, ce qui transformait une panne API en page vide.
- Les champs requis API (`name`, `slug`, `description`, `price`, `currency`, `category`, `vendor`, `stock`) n’étaient pas construits.

### Catégories

- L’écran était statique, avec une ligne “Exemple” et un bouton créer sans effet.
- Aucune validation minimale n’empêchait une catégorie sans nom ou slug.

### Commandes

- La liste CMS pointait vers `/orders`, exposée aux règles de permissions/ownership, au lieu de `/admin/orders`.
- Le statut commande n’était pas modifiable depuis le CMS.
- Les erreurs de chargement étaient avalées par un fallback tableau vide.

### Vendeurs

- Les demandes vendeur étaient traitables, mais le statut vendeur actif/suspendu n’était pas pilotable depuis la liste.

### Slides

- La page était encore mockée alors que les endpoints `/admin/slides` existaient.

### Settings

- La lecture/sauvegarde étaient déjà branchées sur `/admin/settings`.
- Risque restant : validation métier faible côté formulaire CMS.

### Shipping

- La synchronisation existait mais les états d’erreur et de liste vide n’étaient pas complets.

### Auth

- Le login admin et le gate CMS ont été préservés.
- Tests rôles admin/vendeur/client/anonyme non automatisés faute de base de données et d’identifiants dans l’environnement de build.

## Correctifs réalisés

- Normalisation de `fetchCollection` pour ne plus masquer silencieusement les erreurs API.
- Bascule du service commandes CMS vers les endpoints admin.
- Ajout de méthodes service pour produits, catégories, slides, statuts commandes et statuts vendeurs.
- Connexion de la page produits au CRUD API, aux catégories, aux vendeurs et à la médiathèque.
- Connexion de la page catégories au CRUD API avec validation minimale.
- Connexion de la page slides au CRUD API et suppression des mocks.
- Ajout du changement de statut commande dans la page commandes.
- Ajout du changement de statut vendeur dans la page vendeurs.
- Ajout/renforcement d’états `loading`, `error`, `empty` sur produits, catégories, commandes, slides et shipping.

## Problèmes restants

- `/focal-points` et `/currencies` restent cassées car les endpoints admin correspondants ne sont pas disponibles dans l’API actuelle.
- Les tests auth par rôle restent manuels à réaliser avec des comptes réels : admin, vendeur, client, anonyme.
- Le CMS ne dispose pas encore d’une page médiathèque dédiée, même si la sélection média produit utilise le service média existant.
- Les settings restent faiblement validés côté UI.
- Le détail commande complet reste limité au bloc paiement existant ; le listing et le changement de statut sont stabilisés.

## Risques restants

- Les transitions de statut commande restent contrôlées par l’API ; une transition non autorisée renverra une erreur visible côté CMS.
- La création produit admin requiert un vendeur existant ; sans vendeur en base, le formulaire affiche une erreur plutôt qu’un enregistrement incomplet.
- L’upload média dépend de l’endpoint `/media/upload` et des permissions `media:manage`.
- L’environnement de validation n’a pas pu installer les dépendances npm à cause d’un refus registry sur `@types/react`, ce qui empêche la validation complète du build CMS dans ce conteneur.
