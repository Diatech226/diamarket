# Diamarket Platform Monorepo

## Structure
- `apps/diamarket-*`: applications marketplace existantes
- `apps/diapay-*`: plateforme de paiement indépendante
- `packages/*`: packages partagés (UI, config, types, SDK)
- `docs/diamarket` et `docs/diapay`: documentation produit

## Lancement
- `pnpm install`
- `pnpm dev:diamarket` pour web/cms/api Diamarket
- `pnpm dev:diapay` pour api/dashboard/docs/sandbox Diapay
- `pnpm dev:all` pour tout

## Build
- `pnpm build:diamarket`
- `pnpm build:diapay`
- `pnpm build:all`

## Qualité
- `pnpm lint`
- `pnpm typecheck`

## Variables d'environnement
Chaque app contient un `.env.example`.

## Ports
- diamarket-web: `3000`
- diamarket-cms: `3001`
- diamarket-api: `5000`
- diapay-dashboard: `3100`
- diapay-docs: `3101`
- diapay-sandbox: `3102`
- diapay-api: `5100`

## Notes d'architecture
- Diamarket et Diapay sont découplés.
- Bases MongoDB séparées (`diamarket` vs `diapay`).
- `apps/diapay-api/src/providers/mock` permet les tests sans provider réel.
