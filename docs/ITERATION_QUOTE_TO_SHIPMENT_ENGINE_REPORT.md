# DIAEXPRESS — Iteration 5 Quote → Shipment Conversion Engine Report

Date : 2026-06-20

## Sources obligatoires utilisées

- `docs/DIAEXPRESS_QUOTE_SHIPPING_FLOW_DEEP_AUDIT.md`
- `docs/DIAEXPRESS_STATUS_MODEL_REPORT.md`
- `docs/ITERATION_QUOTE_UX_REPORT.md`
- `docs/ITERATION_PRICING_ENGINE_REPORT.md`
- `docs/ITERATION_ADMIN_QUOTE_MANAGEMENT_REPORT.md`

## Quote Conversion Audit

| Donnée | Présente | Copiée | Perdue | Incohérente | Action |
|---|---:|---:|---:|---:|---|
| Client | Oui | Oui | Non | Partiel avant snapshot | `clientSnapshot` dans `Shipment` |
| Origine | Oui | Oui | Non | Non | `originSnapshot` + `routeSnapshot` |
| Destination | Oui | Oui | Non | Non | `destinationSnapshot` + `routeSnapshot` |
| Transport | Oui | Oui | Non | Non | `transportSnapshot` sans recalcul |
| Poids | Oui | Oui | Non | Non | poids réel, volumétrique et facturable copiés |
| Dimensions | Oui | Oui | Non | Non | `dimensions` + `packageSnapshot.dimensions` |
| Volume | Oui | Oui | Non | Non | volume copié depuis Quote |
| Valeur déclarée | Partiel | Oui | Non | Ancien modèle incomplet | champs `declaredValue` préparés |
| Services | Partiel | Oui | Non | Ancien modèle incomplet | `serviceSnapshot.services` |
| Prix validé | Oui | Oui | Non | Non | `priceAccepted`, `currency`, `pricingSnapshot` |
| Devise | Oui | Oui | Non | Non | copie directe Quote |
| Délai | Partiel | Oui | Non | Non | `transportSnapshot.delay` / `estimatedDelivery` |
| Tracking Number | Oui | Oui | Non | Ancien format peu lisible | `TrackingNumberService` format `DX-YYYYMMDD-XXXXXX` |
| Historique | Oui | Oui | Non | Timeline initiale trop courte | événements `Shipment Created` et `Converted From Quote` |
| Statuts | Oui | Oui | Non | Legacy refusés | conversion uniquement depuis `approved` |

## Architecture

Le Quote approuvé est la source de vérité unique. La conversion passe par `POST /api/admin/quotes/:id/convert`, délègue à `createShipmentFromQuote`, crée un `Shipment` et lie les deux entités : `Quote.shipmentId` et `Shipment.quoteId`.

La conversion refuse tout statut autre que `approved` avec :

```json
{
  "success": false,
  "message": "Quote not eligible for shipment conversion"
}
```

Un devis déjà converti est refusé afin d'éviter les doubles shipments.

## Tracking

`TrackingNumberService` génère des numéros lisibles au format `DX-YYYYMMDD-XXXXXX`, par exemple `DX-20260620-000154`. Le modèle `Shipment` conserve un index unique sur `trackingCode` et un index de recherche sur `shipmentReference`.

## Snapshot

Le Shipment conserve son snapshot indépendant : client, origine, destination, transport, colis, poids, volume, valeur, services et pricing. Le pricing n'est pas recalculé lors de la conversion ; il est copié depuis le Quote validé.

## API

- `POST /api/admin/quotes/:id/convert`
- `GET /api/admin/shipments`
- `GET /api/admin/shipments/:id`
- `GET /api/admin/shipments/:id/timeline`
- `GET /api/admin/shipments/dashboard`

## Relations

- Quote → Shipment : `shipmentId`, `trackingNumber`.
- Shipment → Quote : `quoteId`, `meta.conversion.sourceQuoteId`.
- L'admin peut naviguer de la fiche Quote vers le Shipment et de la fiche Shipment vers le Quote source.

## Audit logs

`ShipmentAuditLog` trace la conversion avec `shipmentId`, `quoteId`, acteur, rôle, ancienne valeur, nouvelle valeur, action et commentaire. Les logs shipment sont séparés des `QuoteAuditLog` afin de préserver une traçabilité opérationnelle dédiée.

## Documents préparés

La conversion prépare la structure des documents opérationnels via les snapshots :

- Shipment Reference : `shipmentReference` / `trackingCode`.
- Shipping Summary : route, client, transport, colis, services, prix.
- Operational Sheet : snapshots + timeline initiale + source quote.

## Dashboard

Le dashboard shipment expose :

- Shipments créés aujourd'hui.
- Shipments actifs.
- Shipments en retard.
- Shipments livrés.

## Diamarket

La structure `source` est prête pour les futures commandes marketplace avec les valeurs `manual` et `diamarket`. Les quotes historiques restent compatibles via la source `manual` par défaut.
