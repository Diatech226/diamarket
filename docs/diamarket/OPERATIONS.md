# Diamarket — installation et exploitation

Ce guide couvre uniquement le périmètre Diamarket stabilisé par l’Itération 1 : API, CMS, storefront et SDK Diapay consommé par l’API.

## Prérequis

- Node.js 20 LTS ou version ultérieure compatible ;
- npm 11.4.2 (gestionnaire unique du monorepo) ;
- MongoDB accessible par l’API.

PNPM et Yarn ne sont pas requis. Exécuter toutes les commandes suivantes depuis la racine du dépôt.

## Installation propre

```bash
cp apps/diamarket-api/.env.example apps/diamarket-api/.env
cp apps/diamarket-cms/.env.example apps/diamarket-cms/.env.local
cp apps/diamarket-web/.env.example apps/diamarket-web/.env.local
npm install
npm run lint
npm run typecheck
npm run test
npm run build
```

Les fichiers `.env` et `.env.local` sont locaux et ne doivent jamais être commités. Seuls les `.env.example` sans secret sont suivis.

## Développement

```bash
npm run dev:diamarket
```

Services locaux :

| Service | Port | URL |
|---|---:|---|
| Storefront | 3000 | `http://localhost:3000` |
| CMS | 3001 | `http://localhost:3001` |
| API | 5000 | `http://localhost:5000` |

## Build et démarrage de déploiement

```bash
npm install
npm run build
npm --workspace diamarket-api run start
npm --workspace diamarket-cms run start
npm --workspace diamarket-web run start
```

En déploiement, utiliser `npm install`, puis basculer vers `npm ci` dès qu’un lockfile validé peut être généré et commité. Injecter les variables d’environnement depuis le gestionnaire de secrets de la plateforme. Ne pas copier de `.env` réel dans l’image ou l’artefact.

## Healthchecks API

- `GET /health` et `GET /api/health` : liveness du processus, réponse HTTP 200 tant que l’API répond ;
- `GET /ready` et `GET /api/ready` : readiness, réponse HTTP 200 uniquement lorsque MongoDB est connecté et répond au ping, sinon HTTP 503.

Exemple de probes :

```bash
curl --fail http://localhost:5000/health
curl --fail http://localhost:5000/ready
```

## Configuration de production minimale

- définir `NODE_ENV=production` ;
- fournir `MONGODB_URI`, `JWT_SECRET` et les secrets provider via un secret manager ;
- définir explicitement `CORS_ALLOWED_ORIGINS` avec les origines exactes du storefront et du CMS ;
- laisser `AUTH_ALLOW_HEADER_BRIDGE=false` ;
- ne pas activer de seed admin permanent après bootstrap.

L’Itération 1 ne fournit pas encore de conteneur, pipeline CI/CD, monitoring ou stratégie de rollback ; ces éléments restent prévus par l’Itération 8.
