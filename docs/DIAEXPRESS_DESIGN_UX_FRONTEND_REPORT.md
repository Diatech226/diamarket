# DiaExpress — Design System, UX data flow & frontend report

_Date : 2026-06-19._

## Sources obligatoires utilisées

- `docs/DIAEXPRESS_INTERNAL_AUDIT_AND_INTEGRATION_ROADMAP.md`
- `docs/DIAEXPRESS_QUOTES_SHIPMENTS_UI_FLOW_REPORT.md`
- `docs/DIAEXPRESS_CLIENT_PORTAL_REPORT.md`
- `docs/DIAEXPRESS_OPERATIONS_CENTER_REPORT.md`
- `docs/DIAEXPRESS_PRICING_ENGINE_REPORT.md` : fichier demandé mais absent du dépôt au moment de l’audit; la refonte conserve donc le contrat pricing existant sans changement backend.

## Audit design actuel

| Page | Problème design | Problème UX | Donnée manquante | Correction proposée |
|---|---|---|---|---|
| Accueil | Direction déjà premium mais tokens encore hérités vert/gold sur certains écrans | Tracking rapide pas assez réutilisé comme composant système | Aucune | Normaliser la palette logistique et réutiliser tracking/search + CTA devis |
| Demande de devis | Wizard moderne mais mélange anglais/français et couleurs génériques | Étapes condensées en 4 blocs alors que le parcours métier en comporte 8 | Aucune | Itération suivante: découper en Origine, Transport, Colis, Dimensions, Expéditeur, Destinataire, Estimation, Confirmation |
| Estimation | Affichage fonctionnel | Message d’indisponibilité backend encore technique par endroits | Aucune | Microcopy: “Nous avons besoin de ces informations pour calculer le tarif” |
| Tracking | Timeline existante mais statuts visuels hétérogènes | Pas de placeholder carte, statut public peu scénarisé | Aucune | Ajout `StatusBadge`, `TransportBadge`, `ProgressStepper`, `TimelineStatus`, carte logistique simplifiée |
| Espace client | Portail déjà aligné endpoints `/me` | Notifications restent frontend | Endpoint notifications | Garder widget sans mock silencieux, documenter l’endpoint futur |
| Devis client | Données quote disponibles | Actions dépendantes du statut pas toujours explicitées | Aucune | Mettre en avant référence, statut, estimation, action suivante |
| Expéditions client | Cartes + tracking | Timeline variable selon API | Aucune | Normaliser `statusHistory`/`timeline`/`trackingUpdates` côté rendu |
| Adresses | CRUD existant | Validation UX à renforcer | Aucune | Conserver backend, améliorer labels/erreurs progressivement |
| Paiements | Page préparée | `GET /api/payments/mine` à valider | Endpoint paiement mine si absent | Ne pas modifier API dans cette pause design |
| Admin quotes | Tables robustes | Badges couleurs non conformes à la sémantique demandée | Aucune | Mapper requested/cyan, review/orange, approved/green, rejected/red |
| Admin shipments | Actions drawer existantes | Couleurs statuts transport non normalisées | Aucune | Mapper statuts shipment sur palette logistique |
| Admin pricing | Fonctionnel par ressources | Densité table | Rapport pricing absent | Conserver les routes existantes |
| Admin operations | Centre opérations présent | Besoin d’une lecture plus logistique | Aucune | Palette admin graphite/bleu/cyan/sable appliquée aux globals |

## Nouvelle direction design

DiaExpress adopte une identité “tour de contrôle logistique” : graphite sérieux, bleu nuit fiable, cyan tracking digital, sable colis/fret, orange transit, vert livré et rouge exception. L’objectif est de rendre les statuts compréhensibles sans lire de longs textes.

## Tokens créés

Les tokens frontend sont centralisés dans `apps/diaexpress-web/src/design-system/diaexpressTokens.js` :

- `colors`
- `spacing`
- `radius`
- `shadow`
- `typography`
- `statusColors`
- `transportColors`

Les variables CSS principales sont exposées dans `apps/diaexpress-web/src/styles/design-tokens.css`. L’admin reprend la même intention dans `apps/diaexpress-admin/app/globals.css`.

## Composants stabilisés

- `StatusBadge`
- `TransportBadge`
- `TimelineStatus`
- `ProgressStepper`

Les primitives déjà présentes couvrent aussi : Button, Card, Badge, Input, Select, Textarea, Stepper, EmptyState, LoadingState, ErrorState, Toast, Modal, PageHeader, SectionHeader et MetricCard.

## Pages améliorées ou complétées

- Tracking public : statuts sémantiques, stepper, timeline, placeholder logistique et microcopy française.
- Pages publiques ajoutées : `/faq`, `/aide`, `/conditions-livraison`, `/tarifs` (alias estimation/devis).
- Admin : thème global aligné palette DiaExpress et statut `at_hub` violet doux.

## Décisions UX data flow

- Aucun mock silencieux n’a été ajouté.
- Le tracking public continue de consommer `GET /api/tracking/:trackingCode` et fusionne uniquement les champs réellement renvoyés (`shipment`, `statusHistory`, `timeline`, `trackingUpdates`, `events`).
- Les badges quote/shipment restent compatibles avec les statuts backend existants.
- Aucun changement backend n’a été nécessaire.

## Limites restantes

1. Découper le formulaire devis en 8 étapes réelles sans casser pricing/auth.
2. Brancher un endpoint notifications client réel.
3. Valider `GET /api/payments/mine` côté API si absent.
4. Ajouter une carte réelle lorsque les coordonnées tracking/hubs seront disponibles.
5. Ajouter tests E2E authentifiés quand Clerk/Mongo staging seront disponibles.

## Prochaines itérations

- Refactor complet du wizard devis en étapes courtes mobile-first.
- Unifier les composants UI web/admin dans une convention de noms sans créer de package partagé complexe.
- Améliorer DataTable admin avec panneaux détail et confirmations homogènes.
- Ajouter audit accessibilité automatisé dès que l’environnement navigateur est disponible.
