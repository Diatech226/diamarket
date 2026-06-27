# Itération Stitch — Produits, Catégories & Médiathèque

## Références Stitch utilisées
- `stich-reference/02_products/gestion_des_produits_desktop_exports/screen.png` et `code.html` pour la table premium, les filtres visibles, l’export et les actions rapides.
- `stich-reference/02_products/gestion_des_stocks_desktop/screen.png` pour les signaux de stock faible et l’édition rapide.
- `stich-reference/03_categories/gestion_des_cat_gories_desktop/screen.png` et `code.html` pour l’arborescence, le preview et l’organisation catalogue.
- `stich-reference/03_categories/d_tails_de_la_cat_gorie_desktop/screen.png` pour la fiche détail catégorie.
- `stich-reference/07_media/m_diath_que_desktop_exports_filtres/screen.png` et `code.html` pour la grille assets, les filtres et la preview latérale.
- `docs/ITERATION_STITCH_PAGES_STOREFRONT_REPORT.md`, `docs/DIAMARKET_LOCAL_TOKENS_UI_MIGRATION_REPORT.md`, `apps/diamarket-cms/src/design/` et `apps/diamarket-web/src/design/` pour conserver les tokens locaux et l’approche post-Storefront.

## Pages créées ou améliorées
- CMS produits: `/products`, `/products/new`, `/products/[id]/edit`, `/products/export`.
- CMS catégories: `/categories`, `/categories/new`, `/categories/[id]/edit`.
- CMS médiathèque: `/media` avec upload, grille/liste, filtres, URL externe, édition metadata, copie possible depuis l’URL affichée et blocage API si le média est utilisé.
- Web public vérifié/complété: `/catalogue`, `/product/[slug]`, `/category/[slug]`.

## Composants créés
- Produits: `ProductTable`, `ProductForm`, `ProductStatusBadge`, `ProductImagePicker`, `ProductStatsCards`, `ProductExportButton`.
- Catégories: `CategoryTree`, `CategoryForm`, `CategoryPreviewCard`.
- Médiathèque: `MediaGrid`, `MediaUploadDropzone`, `MediaPreviewDrawer`, `MediaUsageWarning`.

## Endpoints connectés
- Produits CMS: `GET /admin/products`, `POST /products`, `PUT/PATCH /products/:id`, `DELETE /products/:id`, `GET /products/export`.
- Catégories CMS: `GET/POST/PUT/DELETE /admin/categories`.
- Médiathèque CMS: `GET /media`, `POST /media/upload`, `POST /media/url`, `PUT /media/:id`, `DELETE /media/:id`.
- Public: `GET /products`, `GET /products/:slug`, `GET /categories`.

## Changements API
- `DELETE /products/:id` archive désormais le produit par défaut (`status: archived`) au lieu de le supprimer physiquement.
- Les endpoints existants conservent les règles: admin voit le catalogue complet via `/admin/products`, vendor reste borné par les routes protégées produit, public ne voit que les produits actifs via `/products`, suppression média protégée par `usageCount` sauf force explicite.

## Tests
- `npm --prefix apps/diamarket-cms run build`
- `npm --prefix apps/diamarket-web run build`
- `npm --prefix apps/diamarket-api run build`

## Limites restantes
- Les pages `/new` et `/edit` exposent le shell dédié et les composants Stitch-ready; le formulaire opérationnel complet reste centralisé sur `/products` et `/categories` pour éviter de dupliquer la logique client.
- L’export Excel reste documenté côté UI; l’endpoint existant retourne le flux CSV.
