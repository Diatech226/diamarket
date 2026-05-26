# Diamarket CMS

CMS admin Next.js pour piloter la marketplace Diamarket.

## Fonctionnalités
- Auth Clerk + protection middleware par rôle (`admin`, `super_admin`, `marketplace_point_focal`).
- Layout CMS pro (sidebar, topbar, profil, thème clair/sombre via classes Tailwind `dark:`).
- Pages de base: dashboard, produits, catégories, slides, commandes, vendeurs, points focaux, paramètres, devises, livraison.
- Composants réutilisables: `DataTable`, `StatCard`, `PageHeader`, `FormInput`, `StatusBadge`, `ConfirmModal`.
- Client API centralisé dans `src/lib/api.ts` + service `src/services/cms-service.ts`.

## Endpoints backend attendus (diamarket-api)
- `GET /admin/dashboard`
- CRUD `/admin/products`
- CRUD `/admin/categories`
- CRUD `/admin/slides`
- `GET /admin/orders` + `GET /admin/orders/:id` + update status
- `GET /admin/vendors` + actions approve/reject/suspend
- CRUD `/admin/marketplace-focal-points`
- `GET/PUT /admin/settings`
- `GET/PUT /admin/currencies`
- `GET /admin/shipping`

## Endpoints potentiellement manquants à prévoir
- Simulation de livraison (`POST /admin/shipping/simulate`)
- Changement de devise par défaut (`PATCH /admin/currencies/default`)
- Tracking commande (`PATCH /admin/orders/:id/tracking`)

## Lancer
```bash
npm install
npm run dev
```

Configurer `.env.local`:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_DIAMARKET_API_URL=http://localhost:8000
```
