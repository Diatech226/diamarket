# Diamarket Web

Frontend Next.js de la marketplace Diamarket.

## Fonctionnalités iteration 4
- Accueil marketing (hero, catégories, produits populaires, promotions)
- Catalogue avec recherche + tri
- Détail produit + ajout panier
- Panier avec quantités/suppression
- Checkout protégé Clerk avec estimation livraison et création commande (paiement à la livraison)
- Compte client protégé Clerk (historique, tracking)
- Demande compte vendeur
- Internationalisation frontend (FR/EN/ZH) via switcher
- Multi-devise FCFA/USD via switcher
- Client API centralisé `src/lib/api.ts`

## Lancement
```bash
npm install
npm run dev
```

Configurer `NEXT_PUBLIC_API_URL` pour connecter `diamarket-api`.

## Iteration 7 Security
Vendor dashboard access must be server-authorized; never trust only client role checks.

## Paiement Diapay

Le checkout web propose deux options : paiement à la livraison et **Payer avec Diapay**. Le navigateur ne reçoit jamais la secret key Diapay ; il appelle `diamarket-api`, récupère `checkoutUrl`, puis redirige le client vers Diapay Checkout.

Pages ajoutées :

- `/orders/[id]/payment` : suivi et relance paiement.
- `/orders/success` : retour après paiement réussi côté Diapay, avec rappel que la confirmation finale dépend du webhook.
- `/orders/cancel` : retour annulation/échec avec possibilité de réessayer.
