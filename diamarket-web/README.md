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
