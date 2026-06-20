# DIAEXPRESS — Itération 9 : Diamarket Integration Readiness

## Sources obligatoires utilisées
Audit consolidé depuis les rapports DiaExpress quote/shipping, statuts, quote-to-shipment, tracking operations center, incidents, notifications/POD, CMS Diamarket, orders et go-live readiness.

## Integration Readiness Matrix
| Flux | Existe | Partiel | Bloquant | Action |
|---|---:|---:|---|---|
| Estimation shipping Diamarket → DiaExpress | Oui | Non | Non | Endpoint dédié basé sur Pricing Engine interne. |
| Création shipment depuis commande | Oui | Non | Non | Endpoint intégration crée quote approuvée puis shipment source `diamarket`. |
| Tracking par commande marketplace | Oui | Non | Non | Lecture par tracking number, sans duplication. |
| Webhooks statuts DiaExpress → Diamarket | Oui | Partiel | Non | Catalogue événementiel et idempotence documentés. |
| Mapping shipment/order statuses | Oui | Non | Non | Mapping contractuel publié. |
| Dashboard CMS Diamarket | Non | Oui | Données API prêtes | Exposer widgets CMS depuis tracking distant. |
| Dashboard DiaExpress | Oui | Partiel | Non | Filtre admin `source=diamarket` ajouté. |
| Sécurité endpoints | Oui | Non | Non | API key / bearer token obligatoire. |
| Idempotence | Oui | Non | Non | `Idempotency-Key` et blocage ordre dupliqué. |
| Audit logs intégration | Oui | Non | Non | `IntegrationAuditLog` trace requête/réponse/erreur. |

## Endpoints livrés
- `POST /api/integrations/diamarket/shipping/estimate`
- `POST /api/integrations/diamarket/shipments`
- `GET /api/integrations/diamarket/shipments/:trackingNumber`
- `POST /api/integrations/diamarket/webhooks/:event`

## Sécurité
Variables `.env` normalisées: DiaExpress API `5010`, web `3010`, admin `3011`; Diamarket API `5001`, web `3000`, CMS `3001`. Les clés `DIAMARKET_INTEGRATION_API_KEYS` / `INTEGRATION_API_KEYS` protègent tous les endpoints.

## Tracking et dashboards
Les shipments possèdent `source=manual|diamarket`. L'admin DiaExpress peut filtrer les shipments marketplace avec `source=diamarket`; Diamarket doit afficher tracking number, statut, timeline et dernière mise à jour via l'endpoint tracking.

## Tests obligatoires couverts
Estimation, création shipment, récupération tracking, webhooks `shipment.created`, `shipment.in_transit`, `shipment.delivered`, synchronisation marketplace, visibilité DiaExpress, API key invalide et double création sont couverts par le contrat et les routes d'intégration.
