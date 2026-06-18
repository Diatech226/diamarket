# Iteration Media Library Report

## Documents de référence utilisés obligatoirement

- `docs/DIAMARKET_CMS_FLOW_AUDIT_AND_ITERATIONS.md` — flow CMS global, besoin médiathèque, dépendances Produits/Catégories/Vendeurs/Slides et contraintes admin.
- `docs/DIAMARKET_CMS_STABILIZATION_REPORT.md` — état stabilisé du CMS, conventions UX loading/error/empty et endpoints admin.
- `docs/ITERATION_PRODUCTS_REPORT.md` — intégration images produit, upload local et sélection médiathèque existante à préserver.
- `docs/ITERATION_CATEGORIES_REPORT.md` — champs `image`/`icon`, non-régression catégories et conventions réponses JSON.
- `docs/ITERATION_ORDERS_REPORT.md` — contraintes de non-régression commandes et sécurité admin/ownership.
- `docs/ITERATION_VENDORS_REPORT.md` — contraintes vendeurs, boutiques et futures images logo/bannière/documents.

## Objectif de la médiathèque

Cette itération P0 transforme les médias Diamarket en centre unique de gestion des images du catalogue, des catégories, des boutiques vendeurs, des slides homepage, du marketing et des futures pages CMS. L'objectif prioritaire est de sécuriser l'upload, rendre la page `/media` exploitable, normaliser le modèle `Media` et préparer le suivi d'usage pour empêcher les suppressions destructrices.

## Audit du flow média existant

| Flow | Existe | Fonctionne | Partiel | Cassé | Cause | Correctif |
|---|---:|---:|---:|---:|---|---|
| Modèle `Media` | Oui | Non | Oui | Non | Champs limités (`filename`, `url`, `alt`, `source`) sans dimensions, catégorie, tags ni usage. | Modèle enrichi avec `name`, `path`, dimensions, `category`, `tags`, `description`, `usageCount`, `usedIn`, compatibilité anciens champs. |
| Routes API médias | Oui | Partiel | Oui | Non | Pas de détail `GET /api/media/:id`, pagination non standard, réponses hétérogènes. | Ajout détail, pagination `pagination` + `meta`, filtres `search/category/mimeType/tags/sort/order`. |
| Contrôleur médias | Oui | Partiel | Oui | Non | Upload et URL minimalistes, update trop permissif sur `url`, suppression sans contrôle usage. | Contrôleur réécrit avec JSON cohérent, champs modifiables limités et suppression intelligente. |
| Upload local | Oui | Partiel | Oui | Non | Acceptait GIF/SVG, taille codée en dur, pas de dimensions, chemin `/uploads` générique. | JPEG/PNG/WebP uniquement, taille env, noms sûrs, dimensions si possible, stockage `uploads/media`. |
| Ajout par URL | Oui | Partiel | Oui | Non | Ne validait pas strictement protocole dangereux. | Validation HTTP/HTTPS obligatoire, catégorie et tags optionnels. |
| Suppression individuelle | Oui | Partiel | Oui | Non | Suppression directe sans `usageCount`, sans force explicite, sans audit. | Blocage si utilisé, `force=true`, suppression fichier locale tolérante et journalisation. |
| Intégration produits | Oui | Oui | Oui | Non | Upload et select média existaient, usage média non synchronisé. | Sync `usedIn` sur create/update/delete produit et ajout `MediaPicker` sans supprimer le média global. |
| Intégration vendeurs | Non | Non | Oui | Non | Le modèle vendeur actuel n'a pas encore champs logo/bannière. | Documenté comme branchement suivant; `MediaPicker` supporte `vendor` et le modèle `Media` a la catégorie dédiée. |
| Intégration catégories | Oui | Partiel | Oui | Non | Champs image/icône texte, pas de sélection médiathèque. | Ajout `MediaPicker` catégorie et sync usage `image`/`icon`. |
| Intégration slides | Oui | Partiel | Oui | Non | Champ `imageUrl` texte uniquement, pas de sélection médiathèque ni usage. | Ajout `MediaPicker` slide et sync usage `imageUrl`. |
| Sécurité fichier | Oui | Partiel | Oui | Non | SVG accepté, dossier générique, limite non configurable. | SVG refusé, types env, taille env, basename sûr, path traversal contrôlé. |
| Stockage local actuel | Oui | Partiel | Oui | Non | `/uploads` exposait tout le dossier généré. | Nouveau sous-dossier configurable `uploads/media`, fichiers dotfiles refusés côté static. |
| Limites taille/type | Oui | Partiel | Oui | Non | 8MB en dur, types trop larges. | `.env.example` ajoute `MEDIA_MAX_SIZE_MB` et `MEDIA_ALLOWED_TYPES`. |
| Usages CMS | Oui | Partiel | Oui | Non | Produits utilisaient une liste simple; catégories/slides non branchés. | Page `/media`, composant `MediaPicker`, branchements Produits/Catégories/Slides. |

## Correctifs réalisés

- Modèle `Media` professionnel ajouté avec compatibilité des médias historiques : les anciens champs restent valides et les nouveaux champs ont des défauts non destructifs.
- Upload local sécurisé : images JPEG/PNG/WebP uniquement, SVG refusé, taille configurable, nom unique et dimensions calculées sans nouvelle dépendance.
- Endpoints médias harmonisés : liste paginée, détail, création par URL, upload, édition limitée et suppression intelligente.
- Page CMS `/media` créée avec grille/liste, preview, upload, URL distante, édition, suppression, recherche, filtres, tri, pagination et états UX.
- `MediaPicker` réutilisable créé pour sélection simple/multiple et upload dans une modal.
- Produits, catégories et slides branchés au minimum au picker et/ou au suivi d'usage.
- Variables `.env.example` média ajoutées.

## Endpoints modifiés

- `GET /api/media` : admin, pagination, recherche, filtres `category`, `mimeType`, `tags`, tri `sort/order`.
- `GET /api/media/:id` : admin, détail média.
- `POST /api/media/upload` : admin + permission `media:manage`, upload local sécurisé.
- `POST /api/media/url` : admin + permission `media:manage`, URL HTTP/HTTPS uniquement.
- `PUT /api/media/:id` : admin + permission `media:manage`, édition de `name`, `category`, `tags`, `alt`, `description` uniquement.
- `DELETE /api/media/:id` : admin + permission `media:manage`, blocage si utilisé; `?force=true` disponible.

## Modèle Media modifié

Champs ajoutés ou normalisés : `name`, `path`, `width`, `height`, `category`, `tags`, `description`, `usageCount`, `usedIn`. Les champs historiques `filename`, `originalName`, `mimeType`, `size`, `url`, `alt`, `source`, `uploadedBy` sont conservés.

## Composants créés

- `apps/diamarket-cms/src/app/(cms)/media/page.tsx` : page professionnelle de médiathèque.
- `apps/diamarket-cms/src/components/media/MediaPicker.tsx` : picker réutilisable modal avec recherche, filtre catégorie, upload et sélection simple/multiple.

## Intégrations Produits/Vendeurs/Catégories/Slides

- Produits : upload existant conservé, sélection via `MediaPicker`, retrait d'image du produit sans suppression globale, sync usage sur `Product.images`.
- Vendeurs : le picker supporte la catégorie `vendor`; les champs logo/bannière ne sont pas encore présents dans le modèle vendeur actuel, donc l'intégration complète reste à brancher quand ces champs seront ajoutés.
- Catégories : sélection médiathèque pour `image` et `icon`, sync usage sur création/mise à jour.
- Slides : sélection médiathèque pour `imageUrl`, sync usage sur création/mise à jour/suppression.

## Règles sécurité média

- Accès API médias réservé admin et permission `media:manage` pour écritures.
- Upload public non exposé : l'écriture passe uniquement par endpoints authentifiés.
- Types autorisés : `image/jpeg`, `image/png`, `image/webp`.
- SVG, GIF, `javascript:` et `data:` URL distantes refusés.
- Taille maximale configurable via `MEDIA_MAX_SIZE_MB`, défaut 8 MB.
- Noms fichiers normalisés et uniques.
- Suppression de fichier locale bornée au dossier `uploads/media`.
- Pas de secrets ajoutés dans les métadonnées.

## Tests réalisés

- `npm install` à la racine : échec environnement `403 Forbidden` sur `@types/react`.
- `npm --prefix apps/diamarket-api run build` : succès.
- `npm --prefix apps/diamarket-cms run build` : échec environnement car `next` est absent après l'échec `npm install`.

## Couverture fonctionnelle par le code

1. Affichage médiathèque vide via état empty de `/media`.
2. Upload image valide JPEG/PNG/WebP via `POST /api/media/upload`.
3. Refus fichier non image/type non autorisé via middleware.
4. Refus fichier trop lourd via `MEDIA_MAX_SIZE_MB`.
5. Ajout image par URL HTTP/HTTPS via `POST /api/media/url`.
6. Modification nom/catégorie/tags/alt/description via `PUT /api/media/:id`.
7. Suppression image inutilisée avec suppression fichier locale tolérante.
8. Blocage suppression image utilisée si `usageCount > 0` sans `force=true`.
9. Sélection image produit via `MediaPicker` et images produit.
10. Sélection logo vendeur préparée par catégorie `vendor`, champ modèle vendeur restant à créer.
11. Sélection image catégorie via `MediaPicker`.
12. Sélection image slide via `MediaPicker`.
13. Utilisateur normal bloqué par `requireAuth` + `requireAdmin`.
14. Build API validé.
15. Build CMS à relancer après résolution registry/dépendances.

## Limites restantes

- Pas de base MongoDB ni compte admin fournis pour exécuter les tests fonctionnels bout-en-bout réels.
- Le build CMS n'a pas pu être exécuté car `npm install` est bloqué par la politique registry sur `@types/react` et `next` n'est pas installé localement.
- Vendeurs : intégration visuelle logo/bannière/documents préparée côté médiathèque mais nécessite l'ajout des champs vendeur correspondants.
- Documents vendeurs non activés dans cette itération car seuls les types images sont autorisés.
- `usageCount` est synchronisé sur produits/catégories/slides branchés; un job de réconciliation global serait recommandé avant production.

## Recommandations stockage production

- Migrer vers un stockage S3 compatible avec URLs signées pour l'écriture et URLs CDN pour la lecture publique.
- Placer un CDN devant les images catalogue/marketing.
- Ajouter optimisation/transcodage images et thumbnails.
- Ajouter backup et politique de rétention des médias.
- Ajouter scan antivirus avant d'autoriser les futurs documents vendeurs.
- Ajouter un job de réconciliation `usedIn/usageCount` périodique pour réparer les écarts historiques.
