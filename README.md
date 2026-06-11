# Diamarket Platform Monorepo

## Structure
- `apps/diamarket-*`: applications marketplace existantes
- `apps/diapay-*`: plateforme de paiement indépendante
- `packages/*`: packages partagés (UI, config, types, SDK)
- `docs/diamarket` et `docs/diapay`: documentation produit

## Lancement
- `npm install`
- `npm run dev:diamarket` pour web/cms/api Diamarket
- `npm run dev:diapay` pour api/dashboard/docs/sandbox Diapay
- `npm run dev:all` pour tout

## Build
- `npm run build:diamarket`
- `npm run build:diapay`
- `npm run build:all`

## Qualité
- `npm run lint`
- `npm run typecheck`

## Variables d'environnement
Chaque app contient un `.env.example`.


## MongoDB Diamarket API

`diamarket-api` charge explicitement son environnement depuis `apps/diamarket-api/.env`. Ce fichier est prioritaire sur une variable `MONGODB_URI` héritée du shell afin d'éviter de réutiliser accidentellement une ancienne URI Atlas.

### Configuration MongoDB local

1. Démarrer un serveur MongoDB local. Exemples usuels :
   - service système : `mongod --dbpath <chemin-vers-vos-donnees>` ;
   - Docker : `docker run --rm -p 27017:27017 --name diamarket-mongo mongo:7`.
2. Configurer `apps/diamarket-api/.env` :

```env
MONGODB_URI=mongodb://127.0.0.1:27017/diamarket
```

### Configuration MongoDB Atlas

1. Copier l'URI officielle depuis l'interface Atlas.
2. Remplacer uniquement la valeur de `MONGODB_URI` dans `apps/diamarket-api/.env`, par exemple avec un hôte Atlas et des identifiants propres à votre environnement :

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-hostname>/diamarket?retryWrites=true&w=majority
```

Ne commitez jamais d'identifiants Atlas réels. L'API journalise uniquement l'hôte MongoDB, sans mot de passe. MongoDB est obligatoire : si la connexion échoue, l'API s'arrête proprement au démarrage. Voir `docs/MONGODB_ATLAS_SETUP.md` pour le diagnostic Atlas/DNS.

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
