# Audit Stitch design & endpoints — Diamarket CMS

## Périmètre audité
- `apps/diamarket-cms` : Next.js App Router, layout CMS protégé par `CmsAccessGate`, sidebar, topbar, composants UI (`data-table`, `stat-card`, `status-badge`, media picker) et service `cms-service`.
- `apps/diamarket-web` : storefront public Next.js, pages catalogue/panier/checkout/account, client API centralisé dans `src/lib/api.ts`.
- `apps/diamarket-api` : API Express/TypeScript, routes auth, produits, catégories, commandes, média, vendeurs/admin, shipping et settings.

## Pages et routes existantes
- CMS : dashboard, products, categories, vendors, orders, media, users, audit logs, settings, slides, team, currencies, shipping, projects.
- Vendor/admin API : `/admin/vendors`, `/admin/products`, `/admin/categories`, `/admin/orders`, `/admin/users`, `/admin/audit-logs`.
- Storefront web : home, catalogue, checkout, cart, account, login/register, vendor apply.

## Design system existant
- Tailwind CSS avec tokens olive/zinc et composants atomiques CMS.
- La nouvelle fondation ajoute des patterns premium : hero sombre, cards statistiques, table propre, filtres, badges, empty/loading/error states.

## Services API existants
- `apps/diamarket-cms/src/lib/api.ts` : client fetch authentifié et endpoints centralisés.
- `apps/diamarket-cms/src/services/cms-service.ts` : services admin existants.
- `apps/diamarket-web/src/lib/api.ts` : client public web avec adaptateurs produits, catégories, commandes.

## Endpoints disponibles avant itération
- Auth : `/auth/login`, `/auth/register`, `/users/me`.
- Produits/catégories : `/products`, `/products/:id`, `/categories`, variantes admin.
- Vendeurs : `/vendors`, `/admin/vendors`, vendor requests.
- Média : `/media`, `/media/upload`, `/media/url` protégés admin.
- Commandes/paiements/shipping : `/orders`, `/payments/diapay/*`, `/shipping/estimate`.

## Endpoints ajoutés/fondation
- Users/audit : `POST /users`, `GET /users/:id/audit-logs`.
- Produits : `PATCH /products/:id`, `GET /products/export`.
- Vendeurs : payouts, bank details, messaging.
- White-Label : config, home page builder, domaine.
- Marketing : promotions, campaign analytics, email templates.
- Public storefront : `GET /public/storefront/:domain`, `POST /public/orders`, `POST /public/returns/claim`.

## Endpoints encore partiels
Certains endpoints nouvellement créés retournent une réponse contractuelle JSON mais ne persistent pas encore toutes les données : user creation, returns claim, exports avancés, promotions/templates persistés, payouts réels et DNS custom domain.

## Sécurité observée
- Layout CMS protégé côté frontend.
- Routes CMS/admin protégées par `requireAuth`, `requireAdmin`, `requireRole` et permissions quand disponibles.
- Les routes White-Label sensibles exigent auth admin/vendor ; la restriction stricte vendorId ↔ utilisateur doit être renforcée dans l’itération suivante.
