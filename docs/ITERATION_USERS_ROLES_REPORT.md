# Iteration Users & Roles Report

Date: 2026-06-18

## Rapports utilisés

Les trois rapports imposés ont été utilisés comme contexte de cadrage :

- `docs/DIAMARKET_CMS_FLOW_AUDIT_AND_ITERATIONS.md`
- `docs/DIAMARKET_CMS_STABILIZATION_REPORT.md`
- `docs/ITERATION_CMS_BUGFIX_REPORT.md`

## Objectif

Rendre le module CMS **Utilisateurs & rôles** exploitable avec une page `/users`, des endpoints admin dédiés, des garde-fous sur le dernier admin actif et une journalisation des changements sensibles.

## Correctifs API

- Ajout de `GET /api/admin/users` avec pagination, recherche, filtre rôle et filtre statut.
- Ajout de `GET /api/admin/users/:id` avec détail utilisateur, commandes client et vendeur lié.
- Ajout de `PUT /api/admin/users/:id/role` pour modifier le rôle.
- Ajout de `PUT /api/admin/users/:id/status` pour activer/désactiver un compte.
- Validation ObjectId sur les endpoints ciblant un utilisateur.
- Protection par le préfixe admin existant `requireAuth` + `requireAdmin`.
- Exclusion systématique de `passwordHash` via `select('-passwordHash')`.
- Blocage du retrait de rôle admin si l’utilisateur est le dernier admin actif.
- Blocage de la désactivation si l’utilisateur est le dernier admin actif.
- Audit log `user.role_changed` et `user.status_changed`.

## Correctifs CMS

- Ajout de la route `/users` dans le CMS.
- Ajout de l’entrée `users` dans la sidebar.
- Liste utilisateurs avec recherche serveur, filtre rôle et filtre statut.
- Détail utilisateur affichant informations de compte, commandes et vendeur lié si présent.
- Action activer/désactiver avec confirmation navigateur.
- Modification de rôle avec confirmation navigateur.
- Badges rôle/statut, loading, erreurs, empty state et notifications succès/erreur.

## Sécurité

- Les endpoints `/api/admin/users*` restent derrière `requireAuth` et `requireAdmin`.
- Les utilisateurs normaux sont refusés par le middleware admin.
- Les vendeurs sont refusés sur les endpoints admin ; leurs accès propres restent portés par les endpoints non-admin existants.
- Les données sensibles de mot de passe/hash ne sont jamais retournées.

## Tests demandés

À valider avec une base seedée :

1. Voir la liste utilisateurs.
2. Ouvrir un détail utilisateur.
3. Désactiver un user.
4. Réactiver un user.
5. Changer rôle user → vendor.
6. Empêcher le retrait/désactivation du dernier admin actif.
7. Refuser l’accès à un user normal.

## Validation technique

- `npm --prefix apps/diamarket-api run build`
- `npm --prefix apps/diamarket-cms run build`
