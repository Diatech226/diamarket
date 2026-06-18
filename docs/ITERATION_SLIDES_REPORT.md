# Iteration Slides Report

## Documents de référence utilisés obligatoirement

- `docs/DIAMARKET_CMS_FLOW_AUDIT_AND_ITERATIONS.md` — cartographie CMS, flow Slides statique et priorité homepage.
- `docs/DIAMARKET_CMS_STABILIZATION_REPORT.md` — état stabilisé, suppression des mocks visibles et conventions UX loading/error/empty.
- `docs/ITERATION_PRODUCTS_REPORT.md` — non-régression Produits, conventions services CMS et médias.
- `docs/ITERATION_CATEGORIES_REPORT.md` — conventions de réponses admin et intégration MediaPicker.
- `docs/ITERATION_ORDERS_REPORT.md` — contraintes de sécurité admin et non-régression commandes.
- `docs/ITERATION_VENDORS_REPORT.md` — contraintes vendeurs et administration marketplace.
- `docs/ITERATION_MEDIA_LIBRARY_REPORT.md` — Media Library, `MediaPicker`, catégorie `slide` et suivi d'usage média.

## Audit initial homepage

| Section Homepage | Source actuelle | API | CMS pilotable | Priorité |
|---|---|---|---|---|
| Hero principal / slider | `apps/diamarket-web/src/components/ui.tsx` avec fallback local si API vide | `GET /api/slides` | Oui après itération : slides actifs, dates valides, ordre CMS | Critique |
| Images hero | Champ historique `imageUrl` | `GET /api/slides` | Oui : `imageDesktop` et `imageMobile` via MediaPicker | Critique |
| CTA hero | Texte bouton codé partiellement et `cta/ctaUrl` historique | `GET /api/slides` | Oui : `ctaLabel` + `ctaLink` | Critique |
| Badge hero | Texte codé “Marketplace africaine de confiance” | Aucun auparavant | Oui : champ `badge`, fallback conservé | Important |
| Couleur hero | Gradient codé dans le composant | Aucun auparavant | Oui : `backgroundColor`, fallback conservé | Important |
| Promotions / campagnes | Pas de modèle dédié | Réutilise `GET /api/slides` | Préparé par `badge`, dates, activation, ordre | Important |
| Catégories homepage | API catégories | `GET /api/categories` | Hors itération slides, non cassé | Moyen |
| Produits homepage | API produits | `GET /api/products` | Hors itération slides, non cassé | Moyen |
| Données mockées slides | Fallback UI local si aucune slide disponible | Non applicable | Les mocks ne pilotent plus le contenu si API disponible | Critique |

## Modèle Slide

Le modèle `Slide` est enrichi avec les champs administrables suivants :

```js
{
  title,
  subtitle,
  description,
  imageDesktop,
  imageMobile,
  ctaLabel,
  ctaLink,
  badge,
  backgroundColor,
  position,
  isActive,
  startDate,
  endDate,
  createdAt,
  updatedAt
}
```

Compatibilité conservée avec les anciens champs `imageUrl`, `cta`, `ctaUrl` et `translations` pour éviter de casser les données existantes.

## Endpoints

### Public

- `GET /api/slides` : lecture publique uniquement, retourne les slides `isActive !== false`, dont la campagne est valide (`startDate <= now <= endDate` si dates présentes), triés par `position`.
- `GET /api/slides/:id` : lecture publique d'une slide visible uniquement.

### Admin

- `GET /api/admin/slides` : liste complète admin, y compris inactifs/programmés/expirés.
- `GET /api/admin/slides/:id` : détail admin.
- `POST /api/admin/slides` : création avec validation titre, image desktop et URL CTA/image.
- `PUT /api/admin/slides/:id` : édition, activation/désactivation et changement d'ordre via `position`.
- `DELETE /api/admin/slides/:id` : suppression avec désynchronisation de l'usage média.

Toutes les routes admin restent protégées par `requireAuth` + `requireAdmin` sur le préfixe `/api/admin`.

## Composants CMS

- Page `apps/diamarket-cms/src/app/(cms)/slides/page.tsx` refondue pour gérer création, édition, suppression, duplication, activation, désactivation et ordre.
- `MediaPicker` réutilisé avec catégorie `slide` pour sélectionner/remplacer l'image desktop et l'image mobile.
- Preview desktop et preview mobile ajoutées.
- Badges de statut : visible maintenant, inactif ou programmé/expiré selon dates.
- États UX : loading, empty state, error state et notifications de sauvegarde/suppression.
- Réorganisation par boutons `Monter` / `Descendre`; le frontend respecte ensuite `position`.

## Intégration homepage web

La homepage web consomme déjà `api.getSlides()`, branché sur `GET /api/slides`. Le mapping frontend a été enrichi pour utiliser `imageDesktop`, `imageMobile`, `ctaLabel`, `badge`, `backgroundColor`, `description` et `position`. Le composant hero trie les slides par position et propose une navigation par indicateurs si plusieurs slides sont publiées.

Le fallback local reste uniquement une sécurité d'affichage si l'API retourne zéro slide ou en mode démo, afin de ne pas casser la homepage.

## Bannières marketing et campagnes

La logique Slide sert désormais de socle réutilisable pour promotions, soldes, événements et campagnes :

- activation manuelle avec `isActive` ;
- fenêtre de campagne avec `startDate` / `endDate` ;
- priorisation avec `position` ;
- badge marketing ;
- couleurs de campagne ;
- images desktop/mobile issues de la médiathèque.

## Sécurité et validation

- Routes admin sous protection admin existante.
- Routes publiques en lecture seule.
- Titre obligatoire.
- Image desktop obligatoire.
- URL image/CTA limitée aux chemins relatifs ou URL HTTP/HTTPS.
- Dates cohérentes : début avant fin.
- Slides masquées automatiquement côté public si inactives, programmées dans le futur ou expirées.

## Tests fonctionnels couverts par le code

1. Création slide via `POST /api/admin/slides` et formulaire CMS.
2. Édition slide via `PUT /api/admin/slides/:id`.
3. Suppression slide via `DELETE /api/admin/slides/:id`.
4. Activation slide via mise à jour `isActive`.
5. Désactivation slide via mise à jour `isActive`.
6. Changement ordre via `position` et boutons monter/descendre.
7. Image desktop via `imageDesktop` + MediaPicker.
8. Image mobile via `imageMobile` + MediaPicker.
9. Affichage homepage via `GET /api/slides` et HeroSlider.
10. Expiration automatique via filtre public `startDate/endDate`.

## Problèmes restants

- Pas de test E2E réel exécuté faute de base MongoDB et comptes admin fournis.
- La réorganisation est implémentée par boutons, pas par drag & drop, pour limiter le risque de dépendance UI supplémentaire.
- Le fallback homepage reste codé comme garde-fou si aucune slide active n'existe; le contenu marketing réel est désormais piloté par API/CMS.
