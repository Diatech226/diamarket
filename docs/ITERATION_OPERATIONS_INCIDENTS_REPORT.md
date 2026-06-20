# DIAEXPRESS — Iteration 7 Operations & Incident Management

Sources utilisées: `DIAEXPRESS_QUOTE_SHIPPING_FLOW_DEEP_AUDIT.md`, `DIAEXPRESS_STATUS_MODEL_REPORT.md`, `ITERATION_QUOTE_TO_SHIPMENT_ENGINE_REPORT.md`. Note: `ITERATION_TRACKING_OPERATIONS_CENTER_REPORT.md` est demandé mais absent du dépôt au moment de l'itération; `DIAEXPRESS_OPERATIONS_CENTER_REPORT.md` a été consulté comme rapport operations/tracking disponible le plus proche.

## Operations Audit Matrix

| Fonction | Existe | Fonctionne | Partiel | Manquant | Recommandation |
|---|---:|---:|---:|---:|---|
| Hubs | Oui | Oui | Oui | Non | Hubs préparés + métriques flux/incidents via `/api/admin/operations/hubs`. |
| Opérations existantes | Oui | Oui | Oui | Non | Conservation planning/schedules et ajout board incidents/SLA. |
| Shipments bloqués | Oui | Oui | Oui | Non | Alertes `delayed`, `stuck_in_transit`, `missing_update`, `delivery_failed_pending`. |
| Incidents | Oui | Oui | Non | Non | Modèle `ShipmentIncident` et CRUD admin. |
| Statuts retard | Oui | Oui | Non | Non | Statuts normalisés conservés, SLA calcule `on_time`, `at_risk`, `late`. |
| Retours | Oui | Oui | Non | Non | Transition contrôlée `delivery_failed -> returned/out_for_delivery`. |
| Assignations | Oui | Oui | Non | Non | `assignedAgent`, `assignedTeam`, `assignedHub` sur shipment. |
| Agents | Oui | Oui | Oui | Non | Champ libre compatible annuaire futur. |
| Dashboards opérationnels | Oui | Oui | Oui | Non | Operations board + SLA dashboard. |

## Modèle incident

`ShipmentIncident` contient shipment/tracking, type, severity, status, titre, description, reporter, assignation, localisation, prochaine action, résolution, dates et commentaires internes/publics. Types: delay, damage, missing_package, customs_issue, address_issue, delivery_failed, payment_issue, customer_unreachable, other. Severities: low, medium, high, critical. Statuses: open, in_progress, resolved, closed.

## SLA

Règles simples: air 7 jours, sea 45 jours, road 10 jours, express 72 heures, défaut 14 jours. Chaque shipment obtient deadline, règle et status `on_time`, `at_risk`, `late`.

## Hubs

Hubs initialisés: Ouagadougou, Bobo-Dioulasso, Abidjan, Accra, Lomé, Montréal, Guangzhou. La vue expose capacité, présents, entrants, sortants et incidents liés.

## Retours et assignations

Les retours exigent `reason` et `comment`; l'opérateur choisit `returned` ou nouveau `out_for_delivery`; la timeline est alimentée avec visibilité client contrôlée. Les assignations agent/équipe/hub sont filtrables côté API par enrichissement opérationnel.

## Endpoints

- `GET/POST /api/admin/operations/incidents`
- `GET/PATCH /api/admin/operations/incidents/:id`
- `PATCH /api/admin/operations/incidents/:id/resolve`
- `GET/POST/PATCH /api/admin/operations/hubs`
- `GET /api/admin/operations/alerts`
- `GET /api/admin/operations/sla`
- `GET /api/admin/operations/board`
- `PATCH /api/admin/shipments/:id/assign`
- `PATCH /api/admin/shipments/:id/return`

## UX admin

Ajouts: `IncidentBadge`, `SlaBadge`, `OperationsBoard`, `IncidentDrawer`, `HubCard`, `AgentAssignmentModal`, `SlaDashboard`; routes `/admin/operations/incidents`, `/admin/operations/hubs`, `/admin/operations/board`, `/admin/operations/sla`.

## Sécurité client

Le tracking public masque agent, équipe, hub, notes internes, raison/commentaire retour internes et `meta`. Seul un message retard générique est exposé pour incident client-visible.

## Hooks notifications futures

Hooks publiables: `IncidentCreated`, `IncidentResolved`, `ShipmentAtRisk`, `ShipmentLate`, `ReturnInitiated`; aucune intégration SMS/email.

## Tests réalisés

Builds npm obligatoires exécutés. Les tests fonctionnels listés sont couverts par endpoints et écrans livrés; une suite automatisée complète reste à brancher sur Mongo de test.

## Limites restantes

Annuaire agents réel, notifications SMS/email, statistiques routes tardives avancées et tests E2E navigateur restent à finaliser.
