# Diamarket - Iteration 1 Foundation

Monorepo contenant:
- `diamarket-web` (front client Next.js)
- `diamarket-cms` (back-office Next.js)
- `diamarket-api` (Express + MongoDB)

## Installation

1. Installer les dépendances:
```bash
npm install
```
2. Copier les variables d'environnement:
- `diamarket-web/.env.example` -> `diamarket-web/.env.local`
- `diamarket-cms/.env.example` -> `diamarket-cms/.env.local`
- `diamarket-api/.env.example` -> `diamarket-api/.env`

3. Lancer chaque service:
```bash
npm run dev:web
npm run dev:cms
npm run dev:api
```

## Architecture

### Web & CMS
- Next.js + TypeScript + Tailwind configurés.
- Layout client et layout admin séparés.
- Préparation multi-langue (`fr`, `en`, `zh`) et multi-devise (`FCFA`, `USD`).
- Provider Clerk déjà branché (placeholder de config via env).

### API
- Express modulaire (`config`, `models`, `routes`, `controllers`, `middlewares`).
- Connexion MongoDB via Mongoose.
- Modèles initiaux: User, VendorRequest, Vendor, Product, Category, Slide, Order, Shipment, Setting, CurrencyRate, MarketplacePoint.
- Routes REST de base scaffoldées (GET/POST), prêtes à être implémentées.
- Middleware placeholder pour l'intégration Clerk.
- Préparation donnée pour API logistique future avec `Shipment.externalProviderPayload`.

## Prochaine étape recommandée (Itération 2)
- Validation de schémas (zod/joi)
- Contrôle RBAC complet
- CRUD complet par module
- Internationalisation des contenus CMS/API
- Service de conversion de devises basé sur `CurrencyRate`
