# DiaExpress — rapport UI flows Quotes, Shipments et Tracking

_Date : 2026-06-19. Source obligatoire utilisée : `docs/DIAEXPRESS_INTERNAL_AUDIT_AND_INTEGRATION_ROADMAP.md`._

## Audit ciblé

| Flow | Page | API appelée | Rendu actuel | Problème UX | Backend bloquant ? | Correction frontend/admin |
|---|---|---|---|---|---|---|
| Admin quotes liste | `apps/diaexpress-admin/app/admin/quotes` | `GET /api/quotes` | Table réelle avec pagination locale | Filtres incomplets, statuts legacy, dimensions absentes | Non | Ajout filtres statut/transport/origine/destination/date/client, labels statuts DiaExpress, dimensions/poids/volume et CTA détail |
| Admin quotes pending | `apps/diaexpress-admin/app/admin/quotes/pending` | `GET /api/quotes` via redirection | Redirection simple | Acceptable mais segment pending peu visible | Non | Onglet pending et filtres enrichis dans liste principale |
| Admin quote détail | `apps/diaexpress-admin/app/admin/quotes/[id]` | `GET /api/quotes/:id`, actions quotes | Fiche partielle | Actions et informations colis/paiement/documents incomplètes | Non | Actions review/info/approve/reject/ready/convert/delete avec confirmation sensible, loading, feedback et refresh; résumé colis/paiement/documents |
| Admin shipments liste | `apps/diaexpress-admin/app/admin/shipments` | `GET /api/shipments` | Table réelle | Filtre transport absent, infos client limitées | Non | Filtre transport, statut picked_up, colonne client/transport, empty/loading/error conservés |
| Admin shipment détail | `apps/diaexpress-admin/app/admin/shipments/[id]` | `GET /api/shipments/:id` | Détail opérationnel + timeline | Actions surtout dans drawer liste | Non | Statuts harmonisés; détail conserve route, quote, ETA, embarkment et timeline lisible |
| Admin tracking | `apps/diaexpress-admin/app/admin/tracking` | `GET /api/tracking/:code` | Recherche dédiée | Dépend du format tracking | Non | Statuts admin harmonisés via configuration partagée |
| Web tracking public | `apps/diaexpress-web/src/views/TrackShipment.js` | `GET /api/tracking/:code` | Ancien flow statuts français | Incompatible avec statuts API modernes et timeline variable | Non | Normalisation draft→delivered, support `timeline`/`trackingUpdates`/`events`, empty/loading/error propres, pas d’affichage client sensible |
| Web espace client devis | `apps/diaexpress-web/src/pages/UserQuotes.js` | `GET /api/quotes/me`, `POST /api/shipments/from-quote` | Liste client existante | Champs historiques possibles | Non | Conservé; priorité mise sur compatibilité statuts/tracking |
| Web espace client shipments | `apps/diaexpress-web/src/pages/UserShipments.js` | `GET /api/shipments/me` | Cartes avec loading/error/empty | Labels statut dépendants composants | Non | Bénéficie des constantes statuts modernisées |
| Web demande devis | pages quote request | `POST /api/quotes/estimate`, `POST /api/quotes` | Wizard/estimation déjà séparés | À améliorer ensuite visuellement | Non | Non refactorisé massivement pour éviter de casser pricing/auth |

## Pages modifiées

- `apps/diaexpress-admin/components/quotes/QuoteFilters.tsx`
- `apps/diaexpress-admin/components/quotes/QuotesPage.tsx`
- `apps/diaexpress-admin/components/quotes/QuotesTable.tsx`
- `apps/diaexpress-admin/app/admin/quotes/[id]/page.tsx`
- `apps/diaexpress-admin/components/shipments/ShipmentsPage.tsx`
- `apps/diaexpress-admin/lib/api/quotes.ts`
- `apps/diaexpress-admin/lib/status.ts`
- `apps/diaexpress-admin/src/types/logistics.ts`
- `apps/diaexpress-web/src/constants/shipmentStatus.js`
- `apps/diaexpress-web/src/views/TrackShipment.js`

## Corrections backend minimales

Aucune modification backend n’a été nécessaire. Les endpoints cités dans l’audit interne existent déjà pour les besoins immédiats : quote list/detail/status/actions, conversion from quote, shipments list/detail/status/history/assign, tracking public.

## Endpoints utilisés

- `GET /api/quotes`
- `GET /api/quotes/:id`
- `PATCH /api/quotes/:id/status`
- `POST /api/quotes/:id/review`
- `POST /api/quotes/:id/request-info`
- `POST /api/quotes/:id/confirm`
- `POST /api/quotes/:id/reject`
- `POST /api/quotes/:id/ready-for-shipment`
- `DELETE /api/quotes/:id`
- `POST /api/shipments/from-quote`
- `GET /api/shipments`
- `GET /api/shipments/:id`
- `PATCH /api/shipments/:id/status`
- `PATCH /api/shipments/:id/assign-embarkment`
- `GET /api/tracking/:trackingCode`

## Tests manuels à exécuter en environnement connecté

Admin : liste devis, détail devis, changement statut devis, conversion devis en shipment, liste shipments, détail shipment, changement statut shipment via drawer, tracking admin.

Web : estimation devis, soumission devis, liste devis client, liste shipments client, tracking public desktop et mobile.

## Erreurs restantes et priorités

- Brancher un vrai toast dans la fiche détail quote si le provider UI global doit remplacer les alertes locales.
- Ajouter une fiche web client quote/shipment plus détaillée si la navigation produit le requiert.
- Ajouter des snapshots/E2E lorsque les fixtures auth Clerk et Mongo de staging seront disponibles.
- En itération backend séparée, exposer éventuellement l’alias `/api/shipments/tracking/:tracking` mentionné dans la roadmap pour intégration Diamarket historique.
