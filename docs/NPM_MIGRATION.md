# Migration npm Diamarket

## Objectif

Diamarket fonctionne désormais avec npm uniquement. La migration supprime l'orchestration externe et conserve l'architecture actuelle des applications dans `apps/` et des packages dans `packages/`.

## Éléments supprimés

- Suppression du fichier de configuration racine de l’ancien orchestrateur.
- Suppression de la dépendance de développement de l’ancien orchestrateur du manifest racine.
- Suppression des commandes racine qui déléguaient les builds, tests, lint et typecheck à l'orchestrateur externe.
- Aucun fichier de workspace de l’ancien gestionnaire n’est requis pour le fonctionnement npm.
- Aucune commande d'installation globale d’un autre gestionnaire de paquets ne doit être utilisée dans les déploiements.

## Éléments modifiés

- Le manifest racine conserve les workspaces npm `apps/*` et `packages/*`.
- Les scripts racine appellent directement npm avec `--prefix` pour chaque application concernée.
- Les commandes Diamarket ciblent explicitement :
  - `apps/diamarket-api` ;
  - `apps/diamarket-web` ;
  - `apps/diamarket-cms`.
- Les exemples de déploiement Render et Vercel utilisent npm uniquement.

## Commandes npm finales

Depuis la racine du dépôt :

```bash
npm install
npm run dev
npm run build
npm start
```

Builds applicatifs Diamarket :

```bash
npm --prefix apps/diamarket-api install
npm --prefix apps/diamarket-api run build

npm --prefix apps/diamarket-web install
npm --prefix apps/diamarket-web run build

npm --prefix apps/diamarket-cms install
npm --prefix apps/diamarket-cms run build
```

Commandes racine utiles :

```bash
npm run build:diamarket
npm run lint
npm run typecheck
npm test
```

## Déploiement

### Render

Configuration recommandée pour l'API Diamarket :

```bash
# Build
npm install && npm run build

# Start
npm start
```

Le fichier `render.yaml` applique ces commandes pour `apps/diamarket-api` via `rootDir`.

### Vercel

Configuration recommandée pour les applications web :

```bash
# Build
npm install --include=dev && npm run build
```

Le projet ne doit pas ajouter de précommande d'installation globale d’un autre gestionnaire de paquets.

## Vérification attendue

Après la migration, valider :

```bash
npm install
npm --prefix apps/diamarket-api run build
npm --prefix apps/diamarket-web run build
npm --prefix apps/diamarket-cms run build
```

Si le registre npm est bloqué par l'environnement CI, relancer les mêmes commandes dans un environnement disposant de l'accès au registre npm autorisé.
