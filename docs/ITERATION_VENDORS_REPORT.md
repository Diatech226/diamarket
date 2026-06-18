# Iteration Vendors Report

## Documents de référence utilisés

- `docs/DIAMARKET_CMS_FLOW_AUDIT_AND_ITERATIONS.md` — audit CMS global, dépendances Produits ↔ Vendeurs ↔ Commandes, endpoints admin et règles RBAC.
- `docs/DIAMARKET_CMS_STABILIZATION_REPORT.md` — état stabilisé du module Vendeurs et limites restantes.
- `docs/ITERATION_PRODUCTS_REPORT.md` — dépendance du catalogue au vendeur, conventions pagination/filtres admin et statuts produits.
- `docs/ITERATION_CATEGORIES_REPORT.md` — conventions réponses JSON admin et métadonnées paginées.
- `docs/ITERATION_ORDERS_REPORT.md` — dépendance commandes vendeur, ownership admin/vendor/user et conventions statuts commandes/paiement/livraison.

## Audit complet du flow vendeur

| Flow | Existe | Fonctionne | Partiel | Cassé | Cause |
|---|---:|---:|---:|---:|---|
| Demande vendeur | Oui | Oui | Non | Non | Création publique authentifiée et liste admin filtrable par statut. |
| Validation vendeur | Oui | Oui | Non | Non | Approbation admin crée/réactive le vendeur et passe l'utilisateur en rôle `vendor`. |
| Refus vendeur | Oui | Oui | Non | Non | Refus admin avec commentaire et historique décision. |
| Activation vendeur | Oui | Oui | Non | Non | Endpoint admin statut `active`, synchronisé avec `isActive`. |
| Suspension vendeur | Oui | Oui | Non | Non | Endpoint admin statut `suspended`, désactive l'accès vendeur actif via `requireAuth`. |
| Boutique vendeur | Oui | Oui | Non | Non | Fiche admin détaillée avec boutique, propriétaire, contact et localisation. |
| Produits vendeur | Oui | Oui | Non | Non | Fiche vendeur expose actifs, brouillons, désactivés et liens vers gestion Produits. |
| Commandes vendeur | Oui | Oui | Non | Non | Fiche vendeur expose commandes, CA, panier moyen, commandes en attente/livrées. |
| Statistiques vendeur | Oui | Oui | Non | Non | Agrégats produits, commandes, revenus payés, panier moyen et commission estimée. |
| Commissions vendeur | Oui | Oui | Non | Non | Commission vendeur éditable admin, fallback commission globale `defaultCommission`. |

## Dépendances identifiées

- Produits → Vendeurs : `Product.vendor` rattache chaque produit à un vendeur et sert aux filtres catalogue/admin.
- Commandes → Vendeurs : `Order.vendor` rattache chaque commande à un vendeur unique, ce qui permet le scope vendor et les statistiques CA.
- Utilisateurs → Vendeurs : `Vendor.userId` relie la boutique au propriétaire, et l'approbation d'une demande met `User.role` à `vendor`.
- Commissions → Vendeurs/Settings : `Vendor.commissionRate` prime sur `Setting.defaultCommission`; ce socle prépare les calculs Diapay/split payments.

## Rôles et sécurité

- `admin` : accès complet aux endpoints `/api/admin/vendors`, `/api/admin/vendor-requests`, changement de statut et commission.
- `vendor` : accès uniquement à ses commandes via `orderScope` et à ses produits via scope `vendor`; aucune route admin ni modification commission.
- `user` : aucun accès aux endpoints admin vendeur; accès uniquement à ses commandes client.

## Problèmes trouvés

- Le statut de demande vendeur utilisait `active` au lieu d'un statut métier `approved`, ce qui mélangeait demande et boutique.
- Les demandes ne possédaient pas de commentaire admin ni d'historique de décision.
- `GET /api/admin/vendor-requests/:id` était absent.
- `GET /api/admin/vendors/:id` était absent, donc impossible d'afficher une fiche vendeur complète.
- `PUT /api/admin/vendors/:id/commission` était absent, donc la commission par vendeur n'était pas pilotable.
- La liste vendeurs n'avait pas recherche, filtres, tri ni pagination serveur.
- La page CMS Vendeurs était limitée à une table minimale, sans fiche, produits, commandes, statistiques, empty/error/loading complets.
- Le scope produit vendor utilisait uniquement `ownerUserId`; un produit créé par admin pour un vendeur risquait de ne pas être modifiable par ce vendeur.

## Correctifs réalisés

- Normalisation du modèle `VendorRequest` avec statuts `pending`, `approved`, `rejected`, commentaire admin, téléphone, pays, ville, commission demandée et historique de décision.
- Enrichissement du modèle `Vendor` avec téléphone, pays et ville.
- Ajout d'une liste admin vendeurs paginée, filtrable, triable et enrichie avec propriétaire, produits, commandes, CA et compteurs opérationnels.
- Ajout d'une fiche vendeur admin détaillée avec boutique, propriétaire, produits, commandes, statistiques, commission globale/effective et commission estimée.
- Ajout du endpoint détail demande vendeur.
- Ajout de la modification commission vendeur, journalisée via audit admin.
- Renforcement des réponses JSON admin avec `success`, `data`, `meta` et messages d'erreur cohérents.
- Refonte de la page CMS Vendeurs : demandes par statut, commentaire admin, historique décision, liste vendeurs, actions activer/suspendre/réactiver, fiche détaillée, produits, commandes, statistiques, loading, empty, error, confirmations et notifications.
- Correction du scope produit vendor pour interdire l'accès croisé tout en permettant au vendeur actif de gérer les produits rattachés à sa boutique.

## Endpoints modifiés ou ajoutés

- `GET /api/admin/vendors` : modifié; pagination, recherche, filtre statut, tri, métriques et commission globale en `meta`.
- `GET /api/admin/vendors/:id` : ajouté; fiche vendeur complète avec produits, commandes et statistiques.
- `PUT /api/admin/vendors/:id/status` : vérifié/renforcé; admin only, statuts `active`/`suspended`, audit trail.
- `PUT /api/admin/vendors/:id/commission` : ajouté; admin only, commission `0..1`, audit trail.
- `GET /api/admin/vendor-requests` : modifié; filtre statut `pending`/`approved`/`rejected`.
- `GET /api/admin/vendor-requests/:id` : ajouté; détail demande.
- `PUT /api/admin/vendor-requests/:id/approve` : modifié; statut `approved`, commentaire, historique, création/réactivation vendeur.
- `PUT /api/admin/vendor-requests/:id/reject` : modifié; statut `rejected`, commentaire et historique.

## Modèles modifiés

- `VendorRequest` : ajout champs décision/commentaire/contact/localisation/commission demandée; statuts demande normalisés.
- `Vendor` : ajout téléphone, pays et ville; conservation statut, `isActive`, commission vendeur.
- `Product` et `Order` non modifiés structurellement; leurs relations `vendor` sont utilisées pour les agrégats et la sécurité.
- `Setting` non modifié structurellement; `defaultCommission` sert de commission globale marketplace.

## Fichiers modifiés

- `apps/diamarket-api/src/controllers/admin.controller.ts`
- `apps/diamarket-api/src/controllers/vendor-requests.controller.ts`
- `apps/diamarket-api/src/middlewares/resource-access.ts`
- `apps/diamarket-api/src/models/vendor-request.model.ts`
- `apps/diamarket-api/src/models/vendor.model.ts`
- `apps/diamarket-api/src/routes/index.ts`
- `apps/diamarket-cms/src/app/(cms)/vendors/page.tsx`
- `apps/diamarket-cms/src/services/cms-service.ts`
- `apps/diamarket-cms/src/types/cms.ts`
- `docs/ITERATION_VENDORS_REPORT.md`

## Tests réalisés

- `npm --prefix apps/diamarket-api run build` : succès.
- `npm install` : échec environnement; registry npm renvoie `403 Forbidden` sur `@types/react`.
- `npm --prefix apps/diamarket-cms run build` : échec environnement; `next` absent car l'installation des dépendances est bloquée.

## Validation fonctionnelle couverte par le code

1. Demande vendeur listable par statut.
2. Approbation vendeur avec commentaire, historique et création/réactivation boutique.
3. Refus vendeur avec commentaire et historique.
4. Activation/réactivation vendeur depuis la liste et la fiche.
5. Suspension vendeur et désactivation de l'accès vendeur actif.
6. Modification commission par admin uniquement.
7. Accès vendor limité à ses commandes via `orderScope`.
8. Refus de l'accès croisé produit entre vendeurs via scope `vendor`.
9. Consultation produits vendeur depuis la fiche admin.
10. Consultation commandes vendeur et statistiques depuis la fiche admin.

## Problèmes restants

- Les tests fonctionnels réels nécessitent une base MongoDB et des comptes `admin`, `vendor`, `user`, non fournis dans cet environnement.
- Le build CMS ne peut pas être validé tant que le registry bloque `@types/react` et que `next` n'est pas installé localement.
- Les actions rapides produits depuis la fiche vendeur redirigent vers le module Produits; une action inline de désactivation peut être ajoutée ensuite si souhaitée.
- Les captures d'écran réelles n'ont pas pu être produites sans dépendances CMS installées ni serveur Next exécutable.

## Recommandations

- Ajouter des tests d'intégration MongoDB pour les endpoints vendor admin et les scopes `admin`/`vendor`/`user`.
- Ajouter une vraie page vendor self-service côté marketplace pour les vendeurs actifs.
- Brancher les commissions sur Diapay lors de l'itération split payments/payouts.
- Ajouter un journal d'audit consultable dans le CMS pour les changements de statut et commission.
