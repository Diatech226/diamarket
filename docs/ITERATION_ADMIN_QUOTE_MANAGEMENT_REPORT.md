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
| Colonnes opérationnelles référence/client/origine/destination/transport/poids/prix/statut/date/actions | Oui | Oui | Non | Non | P0 |
| Filtres statut/transport/pays origine/pays destination/date/client/référence | Oui | Oui | Non | Non | P0 |
| Recherche temps réel | Oui | Oui | Non | Non | P0 |
| Détail complet devis | Oui | Oui | Oui | Non | P0 |
| Timeline métier | Oui | Oui | Oui | Non | P0 |
| Notes internes admin | Oui | Oui | Non | Non | P1 |
| Demande d'informations client | Oui | Oui | Non | Non | P0 |
| Tarification manuelle avec raison obligatoire | Oui | Oui | Non | Non | P0 |
| Approbation/refus avec commentaire de rejet | Oui | Oui | Non | Non | P0 |
| Conversion shipment approuvée uniquement | Oui | Oui | Non | Non | P0 |
| Audit logs QuoteAuditLog | Oui | Oui | Non | Non | P0 |
| Hooks notification métier | Oui | Oui | Non | Non | P1 |
| Permissions Admin/Operations/Manager | Oui | Oui | Oui | Non | P0 |
| Dashboard KPI opérationnel | Oui | Oui | Non | Non | P0 |

## Fonctionnalités livrées

La gestion devis devient un centre d'opérations : recherche temps réel côté admin, filtres avancés, actions métier, détails devis, notes, demande d'information, override pricing motivé, validation, rejet et conversion shipment. Les statuts restent alignés avec le modèle canonique : `submitted`, `under_review`, `info_requested`, `priced`, `approved`, `rejected`, `converted_to_shipment`.

Côté liste admin, les colonnes ont été recentrées sur le traitement ticket métier : référence, client, origine, destination, transport, poids, prix estimé/final, statut, date et menu actions. Le menu `QuoteActionMenu` expose uniquement les actions cohérentes avec le statut courant.

Le dashboard opérationnel ajoute quatre KPI : quotes en attente, quotes à revoir, quotes approuvés et quotes convertis. Ces KPI sont servis par `GET /api/admin/quotes/dashboard` et affichés dans la vue quotes CMS.

## API

Contrat stable côté CMS :

- `GET /api/admin/quotes` : liste filtrable. Paramètres : `status`, `transportType`, `origin`, `destination`, `client`, `reference`, `search`, `from`, `to`, `limit`.
- `GET /api/admin/quotes/:id` : détail quote + audit logs.
- `PATCH /api/admin/quotes/:id` : notes, priorité, pricing final et override avec `overrideReason` obligatoire si `finalPrice` est modifié.
- `PATCH /api/admin/quotes/:id/status` : transition générique contrôlée.
- `POST /api/admin/quotes/:id/request-info` : passe en `info_requested`, stocke le message côté revue et notifie en in-app si un utilisateur est lié.
- `POST /api/admin/quotes/:id/approve` : approuve le devis, avec possibilité de renseigner `finalPrice` et `currency`.
- `POST /api/admin/quotes/:id/reject` : refuse le devis ; `reason` est obligatoire.
- `POST /api/admin/quotes/:id/convert` : convertit uniquement un devis `approved` en shipment.

## Permissions

| Rôle | Lecture | Modification | Validation | Conversion |
|---|---:|---:|---:|---:|
| Admin | Oui | Oui | Oui | Oui |
| Manager | Oui | Oui | Oui | Oui |
| Operations | Oui | Oui | Non | Oui |

Les routes admin quotes sont protégées par `requireAuth` et `requireRole('admin')` au niveau router. Le contrôleur conserve aussi une matrice métier interne pour distinguer lecture, modification, validation et conversion.

## Timeline

La timeline utilise `reviewHistory` et les `QuoteAuditLog` pour les événements métier : créé, soumis, revu, info demandée, prix proposé/override, approuvé, refusé et converti. Chaque événement porte date, utilisateur/rôle et commentaire quand disponible. Le composant `QuoteTimeline` agrège ces sources pour la fiche admin.

## Notes internes

Le composant `QuoteNotes` affiche séparément : note interne, note opérationnelle, message client/revue et note pricing. Ces notes restent dans le CMS/admin et servent au traitement opérationnel : client VIP, attente facture, vérification dimensions ou prix négocié.

## Tarification manuelle

L'override du prix final passe par `PATCH /api/admin/quotes/:id`. Dès qu'un `finalPrice` est fourni, `overrideReason` est obligatoire. Le contrôleur ajoute un événement `price_overridden` dans `reviewHistory` et écrit un `QuoteAuditLog` avec ancienne valeur, nouvelle valeur, utilisateur et commentaire.

## Conversion

La conversion est disponible uniquement depuis `approved`. Elle délègue la création au service shipment existant, copie route/pricing/poids/dimensions, génère ou reprend le tracking et passe le devis à `converted_to_shipment`. Les appels répétés restent protégés par la recherche d'un shipment existant sur `quoteId`.

## Audit logs

`QuoteAuditLog` trace `quoteId`, utilisateur, rôle, action, ancienne valeur, nouvelle valeur, commentaire et date. Les actions critiques (`admin_update`, `price_overridden`, `info_requested`, `approved`, `rejected`, `converted_to_shipment`) écrivent un audit log. L'écriture d'audit est non bloquante pour éviter de casser un workflow opérationnel si la persistance d'audit est indisponible en test/offline.

## Notifications

Les hooks métier préparés sont :

- `QuoteSubmitted`
- `QuoteInfoRequested`
- `QuoteApproved`
- `QuoteRejected`
- `QuoteConverted`

Ils publient des événements domaine non bloquants et préparent l'automatisation SMS/Email future, sans connecter de transport SMS/Email dans cette itération.

## Composants UX

- `StatusBadge` / `QuoteStatusBadge`
- `QuoteActionMenu`
- `QuoteTimeline`
- `QuoteNotes`
- `QuoteActionDrawer`
- Vue liste `QuotesTable`
- Vue opérationnelle `QuotesPage`

## Validation

- Tests API ciblés : transitions quote et protection routes admin.
- Typecheck admin exécuté : échec attendu dans l'environnement courant car les dépendances Next/Clerk/clsx/lucide ne sont pas installées/résolues, avec quelques erreurs legacy hors périmètre (`scheduled`, `pending`, `draft`). Les erreurs spécifiques introduites dans `QuoteTimeline` ont été corrigées.
