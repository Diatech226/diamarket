# Iteration Shipping DiaExpress Report

## Documents de référence utilisés

- `docs/DIAMARKET_CMS_FLOW_AUDIT_AND_ITERATIONS.md`
- `docs/DIAMARKET_CMS_STABILIZATION_REPORT.md`
- `docs/ITERATION_PRODUCTS_REPORT.md`
- `docs/ITERATION_CATEGORIES_REPORT.md`
- `docs/ITERATION_ORDERS_REPORT.md`
- `docs/ITERATION_VENDORS_REPORT.md`
- `docs/ITERATION_MEDIA_LIBRARY_REPORT.md`
- `docs/ITERATION_SLIDES_REPORT.md`
- `docs/ITERATION_SETTINGS_REPORT.md`
- `docs/ITERATION_CURRENCIES_COMMISSIONS_REPORT.md`

## Endpoints vérifiés ou modifiés

- `POST /api/shipping/estimate` : validation minimale destination/poids, estimation DiaExpress réelle ou estimation locale depuis les zones/tarifs en mode démo.
- `GET /api/shipments` : liste filtrable par `status` et `tracking`; admin voit tout, client/vendeur restent limités à leurs commandes.
- `GET /api/shipments/:trackingNumber` : tracking protégé par le scope commande.
- `GET /api/orders/:id/shipment` : détail d'expédition protégé par le scope commande.
- `POST /api/orders/:id/shipment` : création idempotente d'expédition DiaExpress après validation commande/paiement/adresse.
- `POST /api/orders/:id/shipment/sync` : synchronisation provider par tracking number et normalisation du statut.
- `POST /api/shipping/diaexpress/webhook` : webhook signé HMAC SHA-256 via `X-DiaExpress-Signature`, idempotence par `eventId`.
- `GET /api/admin/shipping` : lecture configuration admin zones/tarifs/délais/provider.
- `PUT /api/admin/shipping` : sauvegarde configuration admin validée, sans secret provider.

## Statuts livraison normalisés

Les statuts supportés sont : `pending`, `created`, `picked_up`, `in_transit`, `out_for_delivery`, `delivered`, `failed`, `returned`, `cancelled`.

## Fichiers modifiés

- `apps/diamarket-api/src/controllers/shipping.controller.ts`
- `apps/diamarket-api/src/routes/index.ts`
- `apps/diamarket-api/.env.example`
- `apps/diamarket-cms/src/app/(cms)/shipping/page.tsx`
- `apps/diamarket-cms/src/services/cms-service.ts`
- `apps/diamarket-cms/src/types/cms.ts`
- `docs/ITERATION_SHIPPING_DIAEXPRESS_REPORT.md`

## Configuration

Variables API ajoutées ou normalisées dans `.env.example` :

```env
SHIPPING_PROVIDER=diaexpress
DIAEXPRESS_API_BASE_URL=
DIAEXPRESS_API_KEY=
DIAEXPRESS_WEBHOOK_SECRET=
SHIPPING_DEMO_MODE=false
SHIPPING_DEFAULT_CURRENCY=XOF
```

La page CMS ne reçoit jamais `DIAEXPRESS_API_KEY` ni `DIAEXPRESS_WEBHOOK_SECRET`; elle gère uniquement la configuration métier publique : provider, devise, origine, zones, tarifs et délais.

## Sécurité

- La configuration `/api/admin/shipping` est sous le préfixe admin protégé par `requireAuth` + `requireAdmin`.
- Les clients et vendeurs n'accèdent aux expéditions que par le scope de leurs commandes.
- Les secrets DiaExpress restent côté API et ne sont pas exposés au frontend.
- Les payloads estimation/configuration sont validés côté backend.
- Le webhook DiaExpress exige une signature HMAC SHA-256 et ignore les événements déjà traités.

## Tests et contrôles effectués

- `npm install` : échec environnement `403 Forbidden` sur `@types/react`.
- `npm --prefix apps/diamarket-api run build` : succès.
- `npm --prefix apps/diamarket-cms run build` : échec environnement car `next` n'est pas installé après l'échec `npm install`.
- `npm --prefix apps/diamarket-web run build` : échec environnement car `next` n'est pas installé après l'échec `npm install`.
- `npm --prefix apps/diamarket-cms run typecheck` : échec environnement sur types Next absents; un ancien avertissement Produits reste aussi présent.

## Couverture fonctionnelle par le code

1. Estimation livraison via `POST /api/shipping/estimate`.
2. Création expédition via `POST /api/orders/:id/shipment`.
3. Tracking via `GET /api/shipments/:trackingNumber` et détail CMS.
4. Synchronisation via bouton CMS et `POST /api/orders/:id/shipment/sync`.
5. Webhook simulable avec signature HMAC sur `/api/shipping/diaexpress/webhook`.
6. Refus accès non autorisé via scopes client/vendeur et admin-only config.
7. Configuration tarif via `/api/admin/shipping` et formulaire CMS zones/tarifs/délais.
8. Affichage CMS `/shipping` avec loading, error, empty, filtres, recherche tracking, détail et synchronisation.

## Problèmes restants

- Les tests fonctionnels bout-en-bout nécessitent une base MongoDB et des comptes admin, vendeur et client.
- Le build CMS/Web doit être relancé après restauration de l'accès registry npm ou installation des dépendances Next.js.
- DiaExpress réel dépend du contrat exact du provider; le mapping actuel accepte les champs courants (`amount`, `estimatedPrice`, `trackingCode`, `trackingNumber`, `status`).
