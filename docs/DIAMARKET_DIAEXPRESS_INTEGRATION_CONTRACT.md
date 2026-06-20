# Contrat officiel d'intégration Diamarket ↔ DiaExpress

Version: `2026-06-20.v1`.

## Sécurité
Tous les endpoints `/api/integrations/diamarket/*` exigent `Authorization: Bearer <token>` ou `x-integration-api-key`. Les clés autorisées sont configurées via `DIAMARKET_INTEGRATION_API_KEYS` ou `INTEGRATION_API_KEYS`. Aucun endpoint d'intégration n'est public.

## Idempotence
Les opérations mutantes exigent `Idempotency-Key`. DiaExpress refuse une double création de shipment pour le même `order.id` ou la même clé.

## Endpoints

### POST `/api/integrations/diamarket/shipping/estimate`
Payload:
```json
{ "origin":"Ouagadougou", "destination":"Bobo-Dioulasso", "transportType":"road", "weight":12, "length":50, "width":40, "height":30 }
```
Réponse `200`:
```json
{ "estimatedPrice":15000, "currency":"XOF", "estimatedDays":3 }
```
Erreurs: `401 INTEGRATION_UNAUTHORIZED`, `404 PRICING_NOT_FOUND`, `409 PRICING_AMBIGUOUS`.

### POST `/api/integrations/diamarket/shipments`
Headers: `Idempotency-Key` obligatoire.
Payload minimal: `order`, `client`, `address`, `items`, `origin`, `destination`, `transportType`, `weight`, `dimensions`.
Réponse `201`: `shipment`, `tracking { trackingNumber, status, events, timeline, lastUpdatedAt }`, `timeline`.
Erreurs: `400 IDEMPOTENCY_REQUIRED`, `401 INTEGRATION_UNAUTHORIZED`, `409 DIAMARKET_SHIPMENT_ALREADY_EXISTS`.

### GET `/api/integrations/diamarket/shipments/:trackingNumber`
Réponse: statut, événements, timeline et dernière mise à jour, sans duplication côté Diamarket.

## Webhooks DiaExpress → Diamarket
Événements officiels: `shipment.created`, `shipment.picked_up`, `shipment.in_transit`, `shipment.out_for_delivery`, `shipment.delivered`, `shipment.failed`, `shipment.returned`, `shipment.cancelled`.
Payload recommandé: `event`, `trackingNumber`, `orderId`, `status`, `occurredAt`, `timeline`.
Chaque webhook doit porter `Idempotency-Key`.

## Mapping statuts
| Shipment Status | Order Status Diamarket |
|---|---|
| created | shipment_created |
| pending_dispatch / scheduled | picked_up |
| in_transit / at_hub / delayed | in_transit |
| out_for_delivery | out_for_delivery |
| delivered | delivered |
| failed_delivery | delivery_failed |
| returned | returned |
| cancelled | cancelled |

## Versioning
La version contractuelle est dans ce document. Les changements breaking devront introduire `/api/integrations/diamarket/v2/*`.
