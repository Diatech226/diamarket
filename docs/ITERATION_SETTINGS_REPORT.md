# Iteration Settings Report

## Documents de référence utilisés

- `docs/DIAMARKET_CMS_FLOW_AUDIT_AND_ITERATIONS.md`
- `docs/DIAMARKET_CMS_STABILIZATION_REPORT.md`
- `docs/ITERATION_PRODUCTS_REPORT.md`
- `docs/ITERATION_CATEGORIES_REPORT.md`
- `docs/ITERATION_ORDERS_REPORT.md`
- `docs/ITERATION_VENDORS_REPORT.md`
- `docs/ITERATION_MEDIA_LIBRARY_REPORT.md`
- `docs/ITERATION_SLIDES_REPORT.md`

## Paramètres implémentés

Le module Paramètres Marketplace couvre les groupes `general`, `branding`, `seo`, `contact`, `checkout`, `shipping`, `vendors`, `maintenance` et `social`.

Champs pilotables depuis le CMS : nom marketplace, logo, favicon, devise par défaut, commission par défaut, langue, pays principal, contact/email/téléphone support, adresse entreprise, mode et message de maintenance, image maintenance, liens sociaux, SEO title/description/keywords/OpenGraph, paramètres checkout, livraison, vendeurs et affichage homepage.

## Endpoints

- `GET /api/admin/settings` : admin uniquement, retourne tous les paramètres métier autorisés.
- `PUT /api/admin/settings` : admin uniquement, valide les clés, types et valeurs puis journalise les changements.
- `GET /api/settings` : public, retourne uniquement les paramètres marqués publics et filtre les noms de clés sensibles.

## Modèle

Le modèle `Setting` contient désormais :

```js
{
  key: String,
  value: Mixed,
  group: String,
  isPublic: Boolean,
  updatedBy: ObjectId,
  updatedAt: Date
}
```

## Fichiers modifiés

- `apps/diamarket-api/src/models/setting.model.ts`
- `apps/diamarket-api/src/controllers/admin.controller.ts`
- `apps/diamarket-api/src/routes/index.ts`
- `apps/diamarket-cms/src/app/(cms)/settings/page.tsx`
- `apps/diamarket-web/src/lib/api.ts`
- `apps/diamarket-web/src/components/header.tsx`
- `apps/diamarket-web/src/app/layout.tsx`
- `apps/diamarket-web/src/app/page.tsx`
- `docs/ITERATION_SETTINGS_REPORT.md`

## Sécurité

- Les routes `/api/admin/settings` restent protégées par `requireAuth` et `requireAdmin` via le préfixe `/api/admin`.
- Les clés contenant `secret`, `password`, `mongodb`, `uri`, `token`, `apiKey` ou `jwt` sont refusées côté admin et exclues côté public.
- Les secrets `JWT_SECRET`, `DIAPAY_SECRET_KEY`, `DIAEXPRESS_API_KEY`, `MONGODB_URI` et mots de passe ne sont pas dans la liste blanche des settings.
- Les changements sont journalisés avec administrateur, date via `createdAt`, champ, ancienne valeur et nouvelle valeur pour les paramètres non sensibles.

## Tests

- Build API exécuté avec succès.
- `npm install` racine tenté mais bloqué par le registre npm (`403 Forbidden` sur `@types/react`).
- Les builds CMS et Web nécessitent l'installation des dépendances Next.js absentes dans cet environnement.

## Problèmes restants

- Les validations frontend sont minimales pour les objets avancés checkout/livraison/vendeurs/homepage.
- La page maintenance est appliquée à la homepage publique; une protection globale par middleware pourrait étendre le comportement à toutes les routes publiques.
- Les tests fonctionnels avec authentification réelle nécessitent une base MongoDB et des comptes admin/user de recette.
