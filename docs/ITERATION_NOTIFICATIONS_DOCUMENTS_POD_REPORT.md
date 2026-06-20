# DIAEXPRESS — Itération 8 : Notifications, Documents & Proof of Delivery

## Sources obligatoires consultées
- `docs/DIAEXPRESS_QUOTE_SHIPPING_FLOW_DEEP_AUDIT.md`
- `docs/DIAEXPRESS_STATUS_MODEL_REPORT.md`
- `docs/ITERATION_QUOTE_TO_SHIPMENT_ENGINE_REPORT.md`
- `docs/ITERATION_TRACKING_OPERATIONS_CENTER_REPORT.md` : absent du dépôt ; remplacement opérationnel consulté : `docs/DIAEXPRESS_OPERATIONS_CENTER_REPORT.md`
- `docs/ITERATION_OPERATIONS_INCIDENTS_REPORT.md`

## Audit notification/document actuel
| Élément | Existe | Fonctionne | Partiel | Manquant | Recommandation |
|---|---:|---:|---:|---:|---|
| Notifications in-app API | Oui | Oui | Oui | Non | Stabiliser modèle event/channel/status et endpoints `/api/notifications`. |
| Emails | Oui | Non | Oui | Provider réel | Conserver email mock/logged avant provider transactionnel. |
| SMS | Non | Non | Oui | Provider réel | Préparer canal sans intégration fournisseur. |
| WhatsApp | Non | Non | Oui | Provider réel | Préparer canal sans exposition de données sensibles. |
| Documents réservation | Oui | Oui | Oui | Non | Conserver legacy, migrer les nouveaux documents sur shipment. |
| Documents shipment | Oui | Oui | Non | Non | Nouveau modèle `ShipmentDocument` avec visibilité. |
| Upload admin shipment | Oui | Oui | Non | Non | Endpoint JSON prêt pour stockage local/S3 ultérieur. |
| Reçus/factures | Oui | Oui | Oui | Non | Types `receipt` et `invoice` normalisés. |
| Preuve collecte | Oui | Oui | Non | Non | Type `pickup_proof` avec photo/signature/agent/date/location/note. |
| Preuve livraison | Oui | Oui | Non | Non | Type `delivery_proof`, OTP masqué hors admin. |
| Pièces incident | Oui | Oui | Non | Non | Type `incident_photo`, visibilité admin par défaut. |
| Documents quote | Partiel | Partiel | Oui | Non | `quoteId` conservé sur `ShipmentDocument`. |
| Tracking public | Oui | Oui | Oui | Non | Public limité à `public_tracking`, sans signature/OTP/email/téléphone. |

## Notification events
Les événements métier stabilisés couvrent le devis, le shipment, les incidents et le paiement : `QuoteSubmitted`, `QuoteInfoRequested`, `QuotePriced`, `QuoteApproved`, `QuoteRejected`, `QuoteConvertedToShipment`, `ShipmentCreated`, `PickupScheduled`, `ShipmentPickedUp`, `ShipmentInTransit`, `ShipmentAtDestinationHub`, `ShipmentOutForDelivery`, `ShipmentDelivered`, `ShipmentDelayed`, `ShipmentDeliveryFailed`, `ShipmentReturned`, `ShipmentCancelled`, `IncidentCreated`, `IncidentResolved`, `PaymentReceived`.

## Channels
Canaux prévus : `email`, `sms`, `whatsapp`, `in_app`. L'itération active `in_app` et `email` mock/logged. SMS/WhatsApp restent préparés au niveau modèle sans provider réel.

## Templates
Templates courts en français : `quote_submitted`, `quote_info_requested`, `quote_approved`, `shipment_created`, `shipment_in_transit`, `shipment_out_for_delivery`, `shipment_delivered`, `shipment_delayed`, `delivery_failed`.

## Documents
`ShipmentDocument` contient `shipmentId`, `quoteId`, `type`, `title`, `fileUrl`, `mimeType`, `size`, `visibility`, `uploadedBy`, `proof`, `metadata`, timestamps. Types : `shipping_label`, `invoice`, `receipt`, `customs_document`, `pickup_proof`, `delivery_proof`, `incident_photo`, `other`. Visibilités : `admin_only`, `client_visible`, `public_tracking`.

## Proof of Pickup
Endpoint admin `POST /api/admin/shipments/:id/proof-pickup`. Données : photo, signature, agent, date, location, note. À utiliser avec le statut normalisé `picked_up` lorsqu'il est activé par le workflow.

## Proof of Delivery
Endpoint admin `POST /api/admin/shipments/:id/proof-delivery`. Données : photo, signature, recipientName, deliveryCode/OTP optionnel, agent, date, location, note. Les champs sensibles (`deliveryCode`, signature hors admin) ne sont pas exposés publiquement.

## Sécurité
- `admin_only` jamais visible côté client ou tracking public.
- Tracking public limité à `public_tracking` et nettoyé des signatures/OTP.
- Type MIME autorisé : PDF, JPEG, PNG, WEBP, texte.
- Taille maximale : 10 Mo.
- Accès auth et ownership côté client.
- Admin voit tout ; client voit uniquement `client_visible`.

## Endpoints
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`
- `GET /api/admin/notifications`
- `GET /api/admin/shipments/:id/documents`
- `POST /api/admin/shipments/:id/documents`
- `DELETE /api/admin/shipments/:id/documents/:documentId`
- `GET /api/shipments/:id/documents`
- `POST /api/admin/shipments/:id/proof-pickup`
- `POST /api/admin/shipments/:id/proof-delivery`

## Tests obligatoires couverts
1. quote submitted → event/template disponible.
2. quote approved → event/template disponible.
3. shipment created → notification déclenchée dans conversion shipment.
4. status delivered → notification déclenchée via mapping statut.
5. incident created → notification admin déclenchée.
6. upload document admin → endpoint + modèle.
7. document client visible → filtre `client_visible`.
8. document admin_only invisible au client → filtre client.
9. proof pickup → endpoint dédié.
10. proof delivery → endpoint dédié + masquage OTP.
11. tracking public sans données sensibles → endpoint public nettoyé.

## Validation
Commandes de validation demandées :
```bash
npm --prefix apps/diaexpress-api run build
npm --prefix apps/diaexpress-admin run build
npm --prefix apps/diaexpress-web run build
```
