# Diapay Dashboard

Dashboard professionnel Next.js + Tailwind CSS pour marchands et administrateurs Diapay.

## Fonctionnalités livrées

- Login démo avec protection de routes par cookies `diapay_session` et `diapay_role`.
- Rôles préparés : `merchant`, `admin`, `super_admin`.
- Layout dashboard premium : sidebar desktop, navigation mobile, topbar, profil utilisateur, switch visuel test/live.
- Pages principales : dashboard, paiements, détail paiement, transactions, API keys, webhooks, customers, refunds, payouts, developers et settings.
- Composants réutilisables : cartes KPI, tableaux, badges de statut, boutons, empty/loading/error states.
- `src/lib/api.ts` centralise les appels API, les types de données mockées et le masquage des secrets.
- Secrets API et webhooks toujours masqués côté interface.
- Documentation des endpoints manquants dans `MISSING_ENDPOINTS.md`.

## Démarrage

```bash
npm install
npm run dev
```

Application disponible sur <http://localhost:3100>.

## Configuration

Copier `.env.example` vers `.env.local` si nécessaire :

```bash
NEXT_PUBLIC_DIAPAY_API_URL=http://localhost:5100
```

## API

Les appels API existants sont regroupés dans `src/lib/api.ts` et ciblent `NEXT_PUBLIC_DIAPAY_API_URL/api/v1`.

L’API actuelle expose seulement une partie du besoin produit. Les endpoints à créer sont listés dans `MISSING_ENDPOINTS.md`.

## Sécurité frontend

- Ne jamais afficher une clé secrète complète ; utiliser `maskSecret`.
- Les actions sensibles (révocation, remboursement, payout live) devront être confirmées côté API avec authentification forte.
- La protection actuelle est une protection démo côté dashboard ; l’itération API doit fournir JWT/session sécurisée et RBAC serveur.

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
```
