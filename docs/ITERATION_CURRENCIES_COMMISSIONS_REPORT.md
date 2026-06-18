# Iteration Currencies & Commissions Report

## Documents de référence utilisés obligatoirement

- `docs/DIAMARKET_CMS_FLOW_AUDIT_AND_ITERATIONS.md`
- `docs/DIAMARKET_CMS_STABILIZATION_REPORT.md`
- `docs/ITERATION_PRODUCTS_REPORT.md`
- `docs/ITERATION_CATEGORIES_REPORT.md`
- `docs/ITERATION_ORDERS_REPORT.md`
- `docs/ITERATION_VENDORS_REPORT.md`
- `docs/ITERATION_MEDIA_LIBRARY_REPORT.md`
- `docs/ITERATION_SLIDES_REPORT.md`
- `docs/ITERATION_SETTINGS_REPORT.md`

## Devises implémentées

Le module gère les devises minimales `XOF`/FCFA, `USD`, `EUR`, `CAD` et `CNY`. Chaque devise porte un code, un nom, un symbole, un taux par rapport à la devise par défaut, un statut actif, un indicateur de devise par défaut et une date de dernière mise à jour. Un seed applicatif crée les cinq devises à la première lecture si la collection est vide.

## Commissions implémentées

La commission globale marketplace est stockée dans `Setting.defaultCommission`. Les commissions spécifiques vendeur utilisent `Vendor.commissionRate`. Les commissions catégorie utilisent `Category.commissionRate`. Le modèle produit accepte aussi `Product.commissionRate` pour préparer l'extension future par produit.

## Règles de priorité

La fonction backend `resolveCommission({ product, vendor, category, amount })` applique : commission produit, sinon vendeur, sinon catégorie, sinon globale marketplace. Elle retourne le taux, la source appliquée et le montant de commission calculé.

## Endpoints

- `GET /api/admin/currencies`
- `POST /api/admin/currencies`
- `PUT /api/admin/currencies/:id`
- `DELETE /api/admin/currencies/:id`
- `GET /api/currencies`
- `GET /api/admin/commissions`
- `PUT /api/admin/commissions/default`
- `PUT /api/admin/vendors/:id/commission`
- `PUT /api/admin/categories/:id/commission`

Les routes admin restent protégées par `requireAuth` + `requireAdmin`. La route publique `/api/currencies` est en lecture seule et ne retourne que les devises actives.

## Modèles

- `CurrencyRate` enrichi pour gérer une vraie devise administrable.
- `Commission` conservé pour les écritures futures liées à la facturation/payouts.
- `Vendor.commissionRate` validé entre 0 et 1.
- `Category.commissionRate` ajouté et validé entre 0 et 1.
- `Product.commissionRate` ajouté pour priorité future produit.
- `Order` enrichi avec `commissionRate`, `commissionAmount`, `vendorNetAmount`, `marketplaceRevenue` et `commissionSource` afin de conserver un snapshot non rétroactif.

## Fichiers modifiés

- `apps/diamarket-api/src/controllers/admin.controller.ts`
- `apps/diamarket-api/src/controllers/currencies.controller.ts`
- `apps/diamarket-api/src/controllers/orders.controller.ts`
- `apps/diamarket-api/src/models/category.model.ts`
- `apps/diamarket-api/src/models/currency-rate.model.ts`
- `apps/diamarket-api/src/models/order.model.ts`
- `apps/diamarket-api/src/models/product.model.ts`
- `apps/diamarket-api/src/models/user.model.ts`
- `apps/diamarket-api/src/routes/index.ts`
- `apps/diamarket-api/src/services/commission.service.ts`
- `apps/diamarket-cms/src/app/(cms)/currencies/page.tsx`
- `apps/diamarket-cms/src/app/(cms)/settings/page.tsx`
- `apps/diamarket-cms/src/services/cms-service.ts`

## Tests effectués

- `npx tsc -p apps/diamarket-api/tsconfig.json --noEmit` : succès.
- `npm install` : échec environnement; registry npm renvoie `403 Forbidden` sur `@types/react`.
- `npm --prefix apps/diamarket-api run build` : succès.
- `npm --prefix apps/diamarket-cms run build` : échec environnement; `next` absent après échec de `npm install`.
- `npm --prefix apps/diamarket-web run build` : échec environnement; `next` absent après échec de `npm install`.

## Risques restants

- Les tests fonctionnels bout-en-bout nécessitent MongoDB et des comptes admin/user réels.
- Les taux ne sont pas synchronisés avec un fournisseur FX externe; ils sont administrés manuellement.
- Le snapshot commission est appliqué aux nouvelles commandes uniquement, conformément à la contrainte de non-recalcul rétroactif.
- Le calcul multi-vendeur reste refusé par le contrôleur commandes existant.
