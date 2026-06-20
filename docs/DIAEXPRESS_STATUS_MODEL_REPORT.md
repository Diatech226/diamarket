# DIAEXPRESS — Status Model Report

Sources obligatoires utilisées : `docs/DIAEXPRESS_QUOTE_SHIPPING_FLOW_DEEP_AUDIT.md` et `docs/DIAEXPRESS_INTERNAL_AUDIT_AND_INTEGRATION_ROADMAP.md`.

## Audit des statuts actuels

| Statut | Type | Utilisé où | Encore utile | Legacy | Remplacement |
| --- | --- | --- | --- | --- | --- |
| draft | Quote/Shipment | API, admin, web | Quote oui, shipment non | shipment legacy | shipment `created` |
| requested | Quote | API, admin, web, docs | Non | Oui | `submitted` |
| pending | Quote/payment | API, admin, docs | Paiement seulement | Oui pour quote | `submitted` |
| under_review | Quote | API, admin, web | Oui | Non | — |
| info_requested | Quote | admin/web | Oui | Non | — |
| approved | Quote | API, admin, web | Oui | Non | — |
| confirmed | Quote/payment | API, admin | Paiement seulement | Oui pour quote | `approved` |
| ready_for_shipment | Quote | API, admin | Non | Oui | `approved` |
| converted | Quote | API | Non | Oui | `converted_to_shipment` |
| converted_to_shipment | Quote | admin/web | Oui | Non | — |
| dispatched | Quote/shipment wording | API/admin | Non pour quote | Oui | `converted_to_shipment` |
| cancelled | Quote/Shipment | API, admin, web | Oui | Non | — |
| expired | Quote | API/docs | Oui | Non | — |
| created | Shipment | API, admin, web | Oui | Non | — |
| pending_dispatch | Shipment | API, admin, web | Non | Oui | `awaiting_pickup` |
| scheduled | Shipment/planning | API, admin, web | Planning seulement | Oui pour shipment status | `awaiting_pickup` |
| picked_up | Shipment | admin/web | Oui | Non | — |
| in_transit | Shipment | API, admin, web | Oui | Non | — |
| at_hub | Shipment | API, admin, web | Non | Oui | `at_origin_hub` |
| out_for_delivery | Shipment | API, admin, web | Oui | Non | — |
| delivered | Shipment | API, admin, web | Oui | Non | — |
| failed_delivery | Shipment | API, admin, web | Non | Oui | `delivery_failed` |
| delivery_failed | Shipment | cible canonique | Oui | Non | — |
| returned | Shipment | API, admin, web | Oui | Non | — |
| delayed | Shipment | API, admin, web | Oui | Non | — |

## Statuts canoniques

Quotes : `draft`, `submitted`, `under_review`, `info_requested`, `priced`, `approved`, `rejected`, `expired`, `converted_to_shipment`, `cancelled`.

Shipments : `created`, `awaiting_pickup`, `picked_up`, `at_origin_hub`, `in_transit`, `at_destination_hub`, `out_for_delivery`, `delivered`, `delivery_failed`, `returned`, `cancelled`, `delayed`.

## Mappings legacy

Quote : `requested/pending -> submitted`, `confirmed/ready_for_shipment -> approved`, `converted/dispatched -> converted_to_shipment`.

Shipment : `draft -> created`, `pending_dispatch/scheduled -> awaiting_pickup`, `at_hub -> at_origin_hub`, `failed_delivery -> delivery_failed`.

## Matrices de transition

Les matrices officielles sont centralisées dans `apps/diaexpress-api/src/domain/statuses/index.js` et reprises côté admin pour masquer les actions impossibles.

## Fichiers modifiés

Backend : modèle de statut central, modèles MongoDB, services quote/shipment, contrôleurs, migration et tests.

Frontend admin/web : types, badges, options, labels français et normalisation d’affichage.

## Risques et compatibilité

Les lectures normalisent les anciens statuts. Les sauvegardes Mongoose normalisent avant validation afin d’éviter de nouvelles écritures legacy. Les filtres par anciens statuts sont mappés côté API quand ils passent par les helpers de normalisation.

## Migration

Commande idempotente : `npm --prefix apps/diaexpress-api run migrate:statuses`.

## Tests réalisés

À compléter automatiquement dans la PR après exécution : transitions quote, transitions shipment et builds API/admin/web.
