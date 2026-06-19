# DiaExpress — Rapport portail client et tracking

_Date : 2026-06-19._

## Sources obligatoires utilisées

- `docs/DIAEXPRESS_INTERNAL_AUDIT_AND_INTEGRATION_ROADMAP.md`
- `docs/DIAEXPRESS_QUOTES_SHIPMENTS_UI_FLOW_REPORT.md`

## Audit espace client actuel

| Flow | Page | API utilisée | Fonctionne | Partiellement | Cassé | Priorité |
|---|---|---|---:|---:|---:|---|
| Dashboard client | `/client`, nouveau `/compte`, `/compte/dashboard`, `/dashboard` | `GET /api/quotes/me`, `GET /api/shipments/me`, `GET /api/addresses`, `GET /api/payments/mine` | ✅ |  |  | Haute |
| Mes devis | `/quotes`, nouveau `/account/quotes` | `GET /api/quotes/me` | ✅ |  |  | Haute |
| Détail devis | nouveau `/account/quotes/[id]` | `GET /api/quotes/:id`, `GET /api/shipments/me`, `POST /api/payments/create`, `POST /api/shipments/create-from-quote` | ✅ |  |  | Haute |
| Mes expéditions | `/shipments`, nouveau `/account/shipments` | `GET /api/shipments/me` | ✅ |  |  | Haute |
| Détail expédition | nouveau `/account/shipments/[id]` | `GET /api/shipments/:id`, lien public `GET /api/tracking/:trackingCode` | ✅ |  |  | Haute |
| Tracking public | `/track-shipment` | `GET /api/tracking/:trackingCode` | ✅ |  |  | Haute |
| Mes adresses | `/profile/addresses`, nouveau `/account/addresses` | `GET/POST/PUT/DELETE /api/addresses` | ✅ |  |  | Moyenne |
| Paiements | `/payments`, nouveau `/account/payments` | `GET /api/payments/mine` |  | ✅ |  | Moyenne |
| Historique complet | Dashboard + détails devis/expéditions | `history`, `statusHistory`, `timeline`, `trackingUpdates` | ✅ |  |  | Haute |
| Notifications client | Widget frontend dashboard | Données frontend préparées, pas d’endpoint dédié |  | ✅ |  | Moyenne |

## Pages créées ou améliorées

- `/compte`, `/compte/dashboard`, `/dashboard` : dashboard client orienté résumé, widgets, tracking rapide, notifications et derniers mouvements.
- `/account/quotes` : liste devis avec recherche, filtre statut, pagination, desktop table et cartes mobiles.
- `/account/quotes/[id]` : fiche devis avec colis, poids, volume, estimation, statut, historique, paiement et shipment associé.
- `/account/shipments` : alias espace client vers la liste des expéditions existante.
- `/account/shipments/[id]` : fiche expédition avec résumé, colis, transport et timeline visuelle.
- `/account/addresses` : alias self-service vers la gestion d’adresses existante.
- `/account/payments` : alias vers l’historique de paiements existant.

## Composants et helpers créés

- `src/components/client/status.js` : badges réutilisables pour statuts quotes et shipments, options de filtres et jalons timeline.
- `src/components/client/format.js` : helpers de références, dates, montants et routes.
- `src/components/client/ClientWorkspaceComponents.jsx` : carte shipment enrichie avec CTA détail et tracking public.

## Endpoints utilisés

- `GET /api/quotes/me`
- `GET /api/quotes/:id`
- `POST /api/payments/create`
- `POST /api/shipments/create-from-quote`
- `GET /api/shipments/me`
- `GET /api/shipments/:id`
- `GET /api/tracking/:trackingCode`
- `GET/POST/PUT/DELETE /api/addresses`
- `GET /api/payments/mine`

## Corrections appliquées

- Alignement dashboard sur les endpoints réels `/api/quotes/me` et `/api/shipments/me` au lieu des anciens chemins `/api/quotes/my` et `/api/shipments/my`.
- Ajout d’un portail client unifié avec navigation self-service sans refonte backend massive.
- Ajout de badges cohérents pour les statuts demandés des devis et expéditions.
- Ajout d’une expérience mobile via cartes responsive et masquage des tables sur petit écran.

## Problèmes trouvés

- `GET /api/payments/mine` est documenté comme absent/probable dans l’audit backend; le frontend reste préparé mais dépend d’une implémentation backend stable.
- Les notifications client n’ont pas encore d’endpoint dédié; l’architecture frontend est prête via widget et modèles d’événements.
- L’annulation client de devis n’a pas d’endpoint client confirmé; l’action est affichée comme démarche encadrée plutôt que de forcer une route admin.

## Responsive

- Dashboard, devis, expéditions, tracking, adresses et paiements utilisent les classes `dx-*` existantes et des règles mobiles ajoutées pour cartes, actions flexibles et formulaires pleine largeur.

## Prochaines priorités

1. Exposer/valider `GET /api/payments/mine` côté API si absent.
2. Ajouter un endpoint notifications client et remplacer le widget statique par des événements réels.
3. Ajouter des tests E2E authentifiés sur les dix parcours obligatoires.
4. Ajouter une action d’annulation devis côté client avec règles backend d’ownership.
