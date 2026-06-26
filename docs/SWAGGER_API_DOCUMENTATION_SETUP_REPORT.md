# Swagger UI / OpenAPI setup report

## Dépendances ajoutées

- `apps/diamarket-api`: `swagger-ui-express`, `swagger-jsdoc`, `@types/swagger-ui-express`, `@types/swagger-jsdoc`.
- `apps/diaexpress-api`: `swagger-ui-express`, `swagger-jsdoc`.

> Note: l'installation npm a été tentée, mais le registre npm a répondu `403 Forbidden` pour `swagger-jsdoc` dans cet environnement. Les dépendances sont déclarées dans les `package.json`; exécuter `npm install` dans un environnement autorisé mettra à jour les `package-lock.json` et installera les modules.

## Fichiers créés ou modifiés

- `apps/diamarket-api/src/config/swagger.ts`
- `apps/diaexpress-api/src/config/swagger.js`
- `apps/diamarket-api/src/app.ts`
- `apps/diaexpress-api/server.js`
- `apps/diamarket-api/.env.example`
- `apps/diaexpress-api/.env.example`
- `apps/diamarket-api/package.json`
- `apps/diaexpress-api/package.json`

## Routes Swagger

Chaque backend expose la documentation si Swagger est activé:

- Diamarket API: `GET /api/docs` et `GET /api/docs.json`
- DiaExpress API: `GET /api/docs` et `GET /api/docs.json`

## Endpoints documentés

### Diamarket

- Public: produits et catégories.
- Auth: register, login, me, logout.
- CMS/Admin: dashboard, produits, catégories, commandes, vendeurs, utilisateurs.
- Shipping / DiaExpress: création/synchronisation d'expédition et statut de paiement.

### DiaExpress

- Public: health, tracking, estimation et création de devis.
- Auth: register, login, me, logout.
- Quotes: routes utilisateur et administrateur.
- Shipments: routes utilisateur et administrateur.
- Pricing: routes publiques et administrateur.
- Integrations Diamarket: estimation, création et suivi d'expédition.

## Sécurité

Les spécifications OpenAPI déclarent le schéma `bearerAuth` HTTP Bearer JWT. Les routes authentifiées et administrateur incluent `security: [{ bearerAuth: [] }]`.

Swagger est optionnel en production:

- En développement: activé par défaut.
- En production: activé uniquement avec `ENABLE_SWAGGER=true`.

Les exemples restent génériques et ne contiennent pas de secrets.

## Accès navigateur

Après installation des dépendances et démarrage local:

- Diamarket: `http://localhost:5001/api/docs`
- DiaExpress: `http://localhost:5000/api/docs` ou le port configuré par `PORT`.

Les URLs serveur OpenAPI utilisent `API_PUBLIC_URL` en production lorsque la variable est fournie, sinon l'URL locale de développement.

## Limites restantes

- Les spécifications documentent les endpoints demandés et des schémas maintenables, mais tous les payloads métier ne sont pas encore exhaustifs.
- Les `package-lock.json` doivent être régénérés dans un environnement où `npm install` peut accéder aux paquets Swagger.
- Les annotations JSDoc par route pourront être ajoutées progressivement si l'équipe veut générer une partie de la documentation depuis les fichiers de routes.
