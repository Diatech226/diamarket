# Cartes et moyens de test Diapay

## Carte bancaire

| Numéro | Résultat |
| --- | --- |
| `4242 4242 4242 4242` | Paiement réussi |
| `4000 0000 0000 0002` | Paiement échoué / carte refusée |

## Mobile Money

| Numéro | Résultat |
| --- | --- |
| `70000000` | Paiement réussi |
| `70000001` | Paiement échoué |

## Scénarios forcés

Dans le checkout sandbox, le champ scénario peut forcer `pending`, `failed` ou `expired` pour tester les états asynchrones sans vrais fonds.
