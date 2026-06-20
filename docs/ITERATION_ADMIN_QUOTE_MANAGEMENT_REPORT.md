# DIAEXPRESS — Iteration 4 Admin Quote Management Report

Date : 2026-06-20

## Sources obligatoires utilisées

- `docs/DIAEXPRESS_QUOTE_SHIPPING_FLOW_DEEP_AUDIT.md`
- `docs/DIAEXPRESS_STATUS_MODEL_REPORT.md`
- `docs/ITERATION_QUOTE_UX_REPORT.md`
- `docs/ITERATION_PRICING_ENGINE_REPORT.md`

## Quote Management Audit

| Fonction | Existe | Fonctionne | Partiel | Bloquant | Priorité |
|---|---:|---:|---:|---:|---:|
| Liste devis admin | Oui | Oui | Non | Non | P0 |
| Filtres statut/transport/route/date/client/référence | Oui | Oui | Non | Non | P0 |
| Détail complet devis | Oui | Oui | Oui | Non | P0 |
| Timeline métier | Oui | Oui | Oui | Non | P0 |
| Notes internes | Oui | Oui | Non | Non | P1 |
| Demande d'informations client | Oui | Oui | Non | Non | P0 |
| Tarification manuelle avec raison | Oui | Oui | Non | Non | P0 |
| Approbation/refus | Oui | Oui | Non | Non | P0 |
| Conversion shipment | Oui | Oui | Non | Non | P0 |
| Audit logs QuoteAuditLog | Oui | Oui | Non | Non | P0 |
| Hooks notification métier | Oui | Oui | Non | Non | P1 |
| Permissions Admin/Operations/Manager | Oui | Oui | Oui | Non | P0 |

## Fonctionnalités livrées

La gestion devis devient un centre d'opérations : recherche temps réel côté admin, filtres avancés, actions métier, détails devis, notes, demande d'information, override pricing motivé, validation, rejet et conversion shipment. Les statuts restent alignés avec le modèle canonique : `submitted`, `under_review`, `info_requested`, `priced`, `approved`, `rejected`, `converted_to_shipment`.

## API

- `GET /api/admin/quotes`
- `GET /api/admin/quotes/:id`
- `PATCH /api/admin/quotes/:id/status`
- `POST /api/admin/quotes/:id/request-info`
- `POST /api/admin/quotes/:id/approve`
- `POST /api/admin/quotes/:id/reject`
- `POST /api/admin/quotes/:id/convert`

## Permissions

| Rôle | Lecture | Modification | Validation | Conversion |
|---|---:|---:|---:|---:|
| Admin | Oui | Oui | Oui | Oui |
| Manager | Oui | Oui | Oui | Oui |
| Operations | Oui | Oui | Non | Oui |

## Timeline

La timeline utilise `reviewHistory` pour les événements métier : créé, soumis, revu, info demandée, prix proposé/override, approuvé, refusé et converti. Chaque événement porte date, utilisateur, rôle et commentaire.

## Conversion

La conversion est disponible uniquement depuis `approved`. Elle délègue la création au service shipment existant, copie route/pricing/poids/dimensions, génère ou reprend le tracking et passe le devis à `converted_to_shipment`.

## Audit logs

`QuoteAuditLog` trace `quoteId`, utilisateur, rôle, action, ancienne valeur, nouvelle valeur, commentaire et date. Les actions critiques (`admin_update`, `price_overridden`, `info_requested`, `approved`, `rejected`, `converted_to_shipment`) écrivent un audit log.

## Notifications

Les hooks métier préparés sont : `QuoteSubmitted`, `QuoteInfoRequested`, `QuoteApproved`, `QuoteRejected`, `QuoteConverted`. Ils publient des événements domaine non bloquants et préparent l'automatisation SMS/Email future.
