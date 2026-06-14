# Itération 5 — Livraison DiaExpress

## Cartographie initiale

L'audit identifiait une abstraction générique/mock, une estimation storefront sans route API, une création déclenchée par le statut `processing` sans idempotence, un tracking non relié au client, et un écran CMS statique. `Order` possédait déjà adresse, estimation et statut; `Shipment` ne conservait ni identifiant provider, ni date estimée, ni historique.

## Intégration réalisée

- Adapter DiaExpress explicite : estimation, création, consultation et annulation; le mock est exclusivement activé par `SHIPPING_DEMO_MODE=true`.
- Routes : `POST /api/shipping/estimate`, `POST|GET /api/orders/:id/shipment`, `POST /api/orders/:id/shipment/sync`, `GET /api/shipments/:trackingNumber`, `GET /api/shipments` (admin), `POST /api/shipping/diaexpress/webhook`.
- Statuts internes : `pending`, `created`, `picked_up`, `in_transit`, `out_for_delivery`, `delivered`, `failed`, `returned`, `cancelled`.
- Ownership commande appliqué aux créations, lectures et synchronisations. Création idempotente par index unique `Shipment.order`; paiement Diapay doit être `paid` avant création.
- Webhook HMAC SHA-256, déduplication par `eventId`, historique et synchronisation du statut commande.
- Checkout connecté à l'estimation, page client de timeline, et tableau CMS filtrable avec synchronisation.

## Contrat provider et risques restants

Les chemins DiaExpress (`/api/quotes/estimate`, `/api/shipments`, `/api/shipments/tracking/:tracking`) doivent être validés en staging avec la version réellement déployée. Sans webhook disponible, l'admin utilise la synchronisation manuelle. Restent à ajouter : retries persistants/DLQ, rate limiter dédié distribué, tests d'intégration Mongo/DiaExpress, création d'expédition depuis le CMS pour une commande sans expédition et notifications client.
