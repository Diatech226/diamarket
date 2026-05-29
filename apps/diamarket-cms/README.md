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

## Iteration 7 Security
Role/permission governance and vendor approvals are managed from CMS admin flows.

## Flow projets + médiathèque

La page `/projects` permet de créer un projet en mode progressif : seul le titre est obligatoire. Les champs `description`, `category`, `status`, dates, liens, image principale, galerie et médias associés sont facultatifs et peuvent être ajoutés lors d’une modification ultérieure.

### Images disponibles dans le formulaire projet
Pour l’image principale comme pour la galerie, l’admin peut :
1. saisir une URL d’image ;
2. choisir un média existant dans la médiathèque ;
3. importer une image locale depuis son ordinateur.

Les imports locaux et les URL ajoutées depuis le formulaire sont enregistrés automatiquement dans la médiathèque. Les previews s’affichent avant sauvegarde, et chaque image peut être retirée/remplacée sans bloquer la création du projet.

### Variables CMS utiles
```bash
NEXT_PUBLIC_DIAMARKET_API_URL=http://localhost:5000/api
NEXT_PUBLIC_CMS_USER_ID=000000000000000000000001
NEXT_PUBLIC_CMS_USER_ROLE=super_admin
```

`NEXT_PUBLIC_CMS_USER_ID` et `NEXT_PUBLIC_CMS_USER_ROLE` alimentent le pont temporaire par headers attendu par `diamarket-api` (`x-user-id`, `x-user-role`) jusqu’au branchement complet des tokens Clerk.
