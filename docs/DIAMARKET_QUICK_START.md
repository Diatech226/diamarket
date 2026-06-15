# Diamarket — démarrage rapide

Ce guide couvre uniquement `diamarket-api`, `diamarket-web` et `diamarket-cms`.

## Prérequis et installation

- Node.js 20.x (version épinglée pour Render) ;
- npm 10 ou 11 ;
- MongoDB local ou MongoDB Atlas.

Depuis la racine, une installation npm initialise tous les workspaces :

```bash
npm install
cp apps/diamarket-api/.env.example apps/diamarket-api/.env
cp apps/diamarket-web/.env.example apps/diamarket-web/.env.local
cp apps/diamarket-cms/.env.example apps/diamarket-cms/.env.local
```

Modifier au minimum `MONGODB_URI`, `JWT_SECRET`, `ADMIN_DEFAULT_EMAIL` et
`ADMIN_DEFAULT_PASSWORD` dans l'environnement de l'API. Ne jamais committer les
fichiers `.env` ou `.env.local`.

## Lancement

Lancer les trois applications Diamarket depuis la racine :

```bash
npm run dev
```

Ou les lancer séparément :

```bash
npm --prefix apps/diamarket-api run dev
npm --prefix apps/diamarket-web run dev
npm --prefix apps/diamarket-cms run dev
```

Par défaut : API `http://localhost:5000`, web `http://localhost:3000`, CMS
`http://localhost:3001`. L'API crée l'administrateur défini par les variables
`ADMIN_DEFAULT_*` au démarrage. Une inscription publique crée toujours un
utilisateur de rôle `user`.

## Build et démarrage production

```bash
npm run build

npm --prefix apps/diamarket-api run build
npm --prefix apps/diamarket-api start

npm --prefix apps/diamarket-web run build
npm --prefix apps/diamarket-web start

npm --prefix apps/diamarket-cms run build
npm --prefix apps/diamarket-cms start
```

## Déploiement

### Render — API

- Root directory : `apps/diamarket-api`
- Build command : `npm install && npm run build`
- Start command : `npm start`
- Healthcheck : `/api/health`
- Définir les variables de `apps/diamarket-api/.env.example` dans Render.
- Définir `NODE_ENV=production` et utiliser le runtime Node.js 20.x déclaré
  dans `package.json`.
- Ne pas ajouter de précommande `npm install -g pnpm` : le dépôt utilise npm et
  le système de fichiers global du runtime Render est en lecture seule.

### Vercel — web et CMS

Créer deux projets Vercel avec respectivement `apps/diamarket-web` et
`apps/diamarket-cms` comme root directory. Vercel détecte Next.js ; utiliser
`npm install` et `npm run build`. Définir les variables `NEXT_PUBLIC_*` depuis
les fichiers `.env.example` correspondants.

## Modes de démonstration

Les erreurs API du storefront ne sont remplacées par des états vides que si
`NEXT_PUBLIC_DEMO_MODE=true`. Ne pas activer cette variable en production :
sans elle, les erreurs restent visibles et ne sont pas masquées par de fausses
données.

## Dépannage

- **Erreur MongoDB au démarrage** : vérifier `MONGODB_URI`, l'accès réseau Atlas
  et lancer `npm run test:mongo:dns -- <hostname>`.
- **Erreur CORS/auth** : ajouter exactement les URL web et CMS à
  `CORS_ALLOWED_ORIGINS`; conserver les cookies HTTPS en production.
- **Erreur `next/typescript`** : exécuter `npm install` depuis la racine et
  vérifier que les applications utilisent uniquement `next/core-web-vitals`.
- **Port occupé** : modifier `PORT` pour l'API ou arrêter le processus utilisant
  les ports 3000, 3001 ou 5000.
- **Échec Diapay/livraison** : laisser les intégrations externes désactivées ou
  explicitement en mode de démonstration pendant le développement local.

## Limites connues prioritaires

Selon l'audit, plusieurs écrans CMS attendent encore des endpoints `/admin/*`
non implémentés. Les commandes, paiements, stocks et autorisations doivent être
durcis et couverts par des tests intégrés avant toute mise en production.
