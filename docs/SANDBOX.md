# Diapay Sandbox

La sandbox ne connecte aucun provider réel. Elle simule mobile money, carte bancaire et crypto avec des statuts déterministes.

## Applications

- API: `apps/diapay-api` sur `http://localhost:5100`
- Sandbox merchant + checkout: `apps/diapay-sandbox` sur `http://localhost:3102`
- Dashboard: `apps/diapay-dashboard`

## Scénarios

- Paiement réussi
- Paiement échoué
- Paiement en attente
- Paiement expiré
- Paiement annulé

Le checkout hébergé est disponible à `/checkout/[sessionId]` et affiche le marchand, le montant, la devise, les méthodes, les boutons payer et annuler.

## Fausse boutique

La page `/` de `diapay-sandbox` crée une session via une route serveur Next.js pour ne jamais exposer `sk_test_*` au navigateur, puis redirige vers `checkoutUrl`.
