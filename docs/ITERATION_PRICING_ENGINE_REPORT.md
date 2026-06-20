# DIAEXPRESS — Iteration 3 Pricing Engine Report

Date : 2026-06-20

## Sources utilisées

- `docs/DIAEXPRESS_QUOTE_SHIPPING_FLOW_DEEP_AUDIT.md`
- `docs/DIAEXPRESS_STATUS_MODEL_REPORT.md`
- `docs/ITERATION_QUOTE_UX_REPORT.md`
- `docs/DIAEXPRESS_PRICING_ENGINE_REPORT.md`

## Architecture retenue

Le Pricing Engine backend devient la source de vérité unique. Les frontends admin et web ne calculent pas de prix : ils configurent ou demandent une estimation. Le service central `apps/diaexpress-api/services/pricingService.js` calcule le prix, les poids, les délais, les services additionnels et la devise.

## Pricing Source Map

| Calcul | Localisation | Utilisé | Redondant | Source de vérité |
|---|---|---:|---:|---|
| Prix transport kg/m³/forfait | `apps/diaexpress-api/services/pricingService.js` | Oui | Non | Pricing Engine |
| Poids volumétrique air/express | `apps/diaexpress-api/services/pricingService.js` | Oui | Non | Pricing Engine |
| Volume réel maritime/routier | `apps/diaexpress-api/services/pricingService.js` | Oui | Non | Pricing Engine |
| Poids taxable | `apps/diaexpress-api/services/pricingService.js` | Oui | Non | Pricing Engine |
| Délai min/max | `Pricing.transportPrices[]` + Pricing Engine | Oui | Non | Pricing Engine |
| Services assurance/collecte/domicile/fragile/prioritaire | `Pricing.transportPrices[].additionalServices` | Oui | Non | Pricing Engine |
| Conversion devise | `CurrencyRate` + Pricing Engine | Oui | Non | CurrencyRate |
| Snapshot devis | `Quote.pricingSnapshot` | Oui | Non | Quote snapshot immuable |
| Conversion shipment | `Shipment.pricingSnapshot`, `priceAccepted`, poids validés | Oui | Non | Quote validé |

## Calculs

- Air et Express : poids volumétrique = `(longueur × largeur × hauteur) / 5000` par défaut, divisor paramétrable par règle.
- Maritime et Routier : volume réel en m³ depuis dimensions ou volume fourni.
- Poids facturé : `max(poids réel, poids volumétrique)`.
- Tarif kg : `billableWeight × pricePerKg/pricePerUnit`.
- Tarif m³ : `volume × pricePerM3/pricePerUnit`.
- Forfait : `flatPrice`.
- Minimum facturable : `minimumPrice`, par exemple 5000 XOF.
- Services additionnels : addition fixe ou pourcentage selon configuration.

## Routes et délais

Chaque document `Pricing` définit une origine, une destination, éventuellement une ligne de transport, une devise et des `transportPrices`. Chaque entrée transport supporte `air`, `sea`, `road`, `express`, le minimum, les prix par unité, les délais min/max et les suppléments.

## Devises

`CurrencyRate` supporte `XOF`, `USD`, `EUR`, `CAD`. Le seed utilise `bulkWrite` + `upsert` pour rester idempotent et éviter le duplicate key XOF.

## Endpoints

- `POST /api/pricing/estimate` : estimation temps réel source de vérité.
- `POST /api/quotes/estimate` : compatibilité quote, déléguée au Pricing Engine.
- `POST /api/quotes` : recalcule depuis le Pricing Engine et stocke le snapshot.
- `POST /api/shipments/from-quote` : copie le prix/poids/route validés sans recalcul.
- `GET /api/pricing/currencies` : lecture admin des devises.

## Snapshot quote

À la création d'un devis, le backend ignore les montants clients et capture `estimatedPrice`, `currency`, `appliedRule`, `breakdown`, route et transport dans `pricingSnapshot`.

## Historique pricing

`PricingAuditLog` trace les créations, mises à jour et suppressions de règles avec acteur, ancienne valeur et nouvelle valeur.

## Performance

L'estimation fait une requête ciblée sur les règles actives puis un calcul mémoire. L'objectif est une réponse < 500 ms en environnement normal avec index origin/destination/transportLine/isActive.
