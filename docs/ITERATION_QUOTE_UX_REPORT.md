# DIAEXPRESS — Iteration 2 Quote UX Report

Date : 2026-06-20

## Sources utilisées

- `docs/DIAEXPRESS_QUOTE_SHIPPING_FLOW_DEEP_AUDIT.md`
- `docs/DIAEXPRESS_STATUS_MODEL_REPORT.md`
- `docs/DIAEXPRESS_DESIGN_UX_FRONTEND_REPORT.md`

## Quote Form Audit

| Champ actuel | Obligatoire ? | Valeur métier | Peut être reporté ? | Recommandation |
|---|---:|---|---:|---|
| Origin texte libre | Oui | Route pricing | Non | Remplacer par pays + ville + adresse optionnelle. |
| Destination texte libre | Oui | Route pricing | Non | Remplacer par pays + ville + adresse optionnelle. |
| Market point origine/destination | Non | Utile admin si référentiel complet | Oui | Masquer du flow principal, déduire plus tard. |
| Transport line | Variable | Utile opérations avancées | Oui | Ne pas bloquer le client au devis initial. |
| Transport type | Oui | Driver pricing/délai | Non | Garder avec choix visuels Air/Maritime/Routier/Express. |
| Package type | Oui | Qualité des données et handling | Non | Garder en étape courte dédiée. |
| Poids | Selon transport | Poids taxable | Non pour Air/Routier/Express | Validation intelligente selon transport. |
| Dimensions | Selon transport | Volume, maritime, volumétrique | Oui sauf Maritime | Calcul automatique volume/poids volumétrique. |
| Volume manuel | Non | Pricing maritime | Oui | Supprimer la saisie directe, calculer automatiquement. |
| Valeur déclarée | Non | Assurance/risque | Oui | Ajouter comme champ non bloquant. |
| Contact unique | Oui | Follow-up commercial | Non | Remplacer par expéditeur + destinataire. |
| Product location/type | Non | Peu clair côté client | Oui | Remplacer par type d’envoi et services. |
| Notes | Non | Cas particuliers | Oui | Reporter après soumission ou admin info request. |

## Flow retenu

1. Origine/destination avec route détectée.
2. Type transport dynamique.
3. Type d’envoi.
4. Informations colis avec volume, poids volumétrique et poids taxable automatiques.
5. Services complémentaires.
6. Contacts expéditeur et destinataire.
7. Résumé avec prix/délai estimés et CTA de soumission.

## Champs supprimés ou reportés

- Ligne transport obligatoire.
- Market points visibles au client.
- Volume saisi comme champ primaire.
- Product location/type libres.
- Notes longues avant estimation.

## Champs ajoutés

- Pays/ville/adresse optionnelle pour origine et destination.
- Type d’envoi normalisé.
- Valeur déclarée.
- Services : assurance, urgent, collecte, livraison domicile, fragile.
- Contacts expéditeur et destinataire complets.

## Composants créés

- `QuoteWizard`
- `QuoteStepLocation`
- `QuoteStepTransport`
- `QuoteStepPackage`
- `QuoteStepServices`
- `QuoteStepContacts`
- `QuoteStepReview`
- `QuoteSummaryCard`
- `QuotePriceCard`
- `QuoteProgress`

## Compatibilité API

Payload normalisé vers :

- `POST /api/quotes/estimate` : route, transport, poids, dimensions, volume calculé, type d’envoi, services.
- `POST /api/quotes` : mêmes données + contacts, valeur déclarée, estimation, statut `submitted`.
- `GET /api/quotes/:id` : aucune rupture attendue ; les champs ajoutés sont additionnels et exploitables côté admin.

Les statuts normalisés ne sont pas modifiés. Le flow soumet `submitted` et ne touche pas au Shipment Flow.

## Estimation temps réel

Le wizard déclenche l’estimation dès que origine, destination, transport et poids ou dimensions sont disponibles. Si le Pricing Engine est indisponible, une estimation locale indicative garde le flow non bloquant et le brouillon reste sauvegardé.

## Mobile-first

Le layout est conçu en colonne par défaut, testé par CSS pour 320px, 375px et 768px. Le panneau résumé passe sous le formulaire sur mobile et devient sticky en desktop.

## Captures / descriptions

- Mobile 320px : progression en deux colonnes, champs une colonne, CTA bas de carte.
- Mobile 375px : progression trois colonnes, cartes de choix compactes.
- Tablet 768px : champs origine/destination en deux colonnes, métriques colis en trois colonnes.
- Desktop : formulaire + `QuoteSummaryCard` latérale sticky.
