# Vendor request public flow fix report

## Cause du 401

La route `POST /api/vendor-requests` était déclarée avec le middleware `requireAuth`. Un visiteur public qui soumettait le formulaire vendeur sans session recevait donc `401 Unauthorized` avant que la demande ne soit créée.

## Route corrigée

- `POST /api/vendor-requests` est maintenant une route publique.
- Les routes de gestion restent réservées aux administrateurs via le préfixe `/api/admin` déjà protégé par `requireAuth` et `requireAdmin` :
  - `GET /api/admin/vendor-requests`
  - `PATCH /api/admin/vendor-requests/:id/status`
  - `DELETE /api/admin/vendor-requests/:id`
  - Les routes existantes d'approbation/refus sont conservées pour compatibilité.

## Middleware retiré

`requireAuth` a été retiré uniquement de `POST /api/vendor-requests`. Les middlewares d'administration restent appliqués aux endpoints `/api/admin/vendor-requests` par le guard global `/admin`.

## Sécurité ajoutée

La route publique conserve des garde-fous applicatifs :

- validation du payload avant création ;
- `businessName` obligatoire ;
- email ou téléphone obligatoire ;
- validation simple des formats email et téléphone ;
- champ honeypot anti-spam (`website`, `companyWebsite` ou `_gotcha`) ;
- rate limit dédié à 5 soumissions par heure et par IP ;
- réponse JSON stable en succès et en erreur ;
- déduplication des demandes en attente par email ou téléphone, avec retour propre de la demande existante.

## Frontend

Le client web expose `submitVendorRequest(payload)` comme requête publique. Cette fonction appelle `POST /api/vendor-requests` sans imposer de header `Authorization`, même si un token est présent en stockage local.

## CORS

L'exemple de configuration inclut maintenant :

- `http://localhost:3000`
- `http://localhost:3001`
- `https://smove-three.vercel.app`
- `https://diamarket-web.vercel.app`

## Tests effectués

- `npm --prefix apps/diamarket-api run build`
- `npm --prefix apps/diamarket-web run build`

Les validations fonctionnelles suivantes sont couvertes par le changement de route et les contrôleurs :

1. Soumission sans authentification : route publique sans `requireAuth`.
2. Réponse succès : `201` pour une nouvelle demande, `200` pour une demande en attente déjà existante.
3. Visibilité admin : liste conservée sur `/api/admin/vendor-requests`.
4. Approbation/refus admin : routes existantes conservées et alias `PATCH /api/admin/vendor-requests/:id/status` ajouté.
5. Non-admin bloqué : préfixe `/api/admin` protégé par `requireAuth` + `requireAdmin`.
6. Payload invalide refusé : réponse `400` avec `success: false`.
7. Double demande : déduplication par email ou téléphone.
