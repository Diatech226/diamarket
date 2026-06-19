# DiaExpress — Operations Center Report

_Date : 2026-06-19._

## Sources utilisées

- `docs/DIAEXPRESS_INTERNAL_AUDIT_AND_INTEGRATION_ROADMAP.md`
- `docs/DIAEXPRESS_QUOTES_SHIPMENTS_UI_FLOW_REPORT.md`
- `docs/DIAEXPRESS_CLIENT_PORTAL_REPORT.md`
- `docs/DIAEXPRESS_PRICING_ENGINE_REPORT.md` était demandé mais absent du dépôt au moment de l’implémentation ; la compatibilité Pricing a donc été préservée sans modification du moteur pricing.

## Dashboard

`/admin` devient un dashboard d’exploitation : il agrège quotes, shipments, tracking et KPI au lieu d’une simple liste CRUD. Les widgets couvrent :

- quotes aujourd’hui, en attente, approuvés et convertis ;
- shipments créés, en transit, livrés, retardés et annulés ;
- mouvements tracking aujourd’hui et anomalies ;
- temps moyen livraison, taux livraison, taux retard et revenus.

## Opérations

`/admin/operations` affiche la vue principale du centre expéditions avec les colonnes demandées : tracking, client, origine, destination, transport, statut, date et source DiaExpress/Diamarket.

La recherche globale `/admin/search` prépare la recherche par tracking, quote, client et shipment depuis l’admin.

## Statuts, timeline et affectation

Les statuts shipment sont centralisés côté frontend via `SHIPMENT_STATUSES` :

- `draft`, `created`, `pending_dispatch`, `scheduled`, `picked_up`, `in_transit`, `at_hub`, `out_for_delivery`, `delivered`, `failed_delivery`, `delayed`, `returned`, `cancelled`.

Le drawer shipment existant reste le point d’action opérationnel : changement de statut, commentaire, localisation, événement timeline et assignation à un embarquement. L’architecture d’affectation expose aussi les champs de préparation opérateur, hub et planning dans le type `Shipment.meta`.

## Hubs

`/admin/hubs` liste les hubs préparés :

- Ouagadougou ;
- Bobo ;
- Accra ;
- Abidjan ;
- Montréal.

La vue montre statut, capacité, volume traité et coordonnées, avec fusion possible des market points backend existants.

## Alertes

`/admin/alerts` détecte :

- retard ;
- tracking bloqué ;
- livraison échouée ;
- paiement en attente.

Les priorités affichées sont `Critique`, `Important` et `Normal`.

## Rapports

`/admin/reports` fournit une version simple de performance opérationnelle : quotes, shipments, livraisons, retards, paiements et revenus.

## Vue cartographique préparée

Le composant commun affiche un `Shipment Location Layer` sans carte réelle : géolocalisation des hubs, tracking et volumes d’expédition sont structurés pour une future carte.

## Fichiers modifiés

- `apps/diaexpress-admin/app/admin/page.tsx`
- `apps/diaexpress-admin/app/admin/operations/page.tsx`
- `apps/diaexpress-admin/app/admin/hubs/page.tsx`
- `apps/diaexpress-admin/app/admin/alerts/page.tsx`
- `apps/diaexpress-admin/app/admin/reports/page.tsx`
- `apps/diaexpress-admin/app/admin/search/page.tsx`
- `apps/diaexpress-admin/app/admin/navigation.ts`
- `apps/diaexpress-admin/components/layout/topbar.tsx`
- `apps/diaexpress-admin/components/operations/OperationsOverview.tsx`
- `apps/diaexpress-admin/src/lib/operations.ts`
- `apps/diaexpress-admin/src/types/logistics.ts`
- `apps/diaexpress-admin/app/globals.css`

## Endpoints utilisés

- `GET /api/quotes`
- `GET /api/shipments`
- `GET /api/admin/market-points`
- DiaPay admin summary si `NEXT_PUBLIC_ENABLE_DIAPAY=true`.

## Problèmes restants

- Le document `docs/DIAEXPRESS_PRICING_ENGINE_REPORT.md` n’existe pas encore dans le dépôt.
- L’assignation opérateur/hub/planning nécessite une route backend dédiée pour persister autre chose que l’embarquement existant.
- La carte réelle reste à intégrer ultérieurement.
- Les audits trail détaillés dépendent des logs backend disponibles dans les événements/timeline et devraient être renforcés par une table dédiée si nécessaire.
- Les tests E2E authentifiés restent à brancher avec fixtures Clerk/Mongo.
