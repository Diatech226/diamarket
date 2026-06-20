# DIAEXPRESS — Pricing Engine Report

Document de référence créé pour matérialiser l'audit pricing demandé par les itérations DiaExpress. Le constat initial est une fragmentation entre estimation devis, règles admin, snapshots quote et conversion shipment. La cible est une source de vérité unique : `apps/diaexpress-api/services/pricingService.js`, exposée par l'endpoint d'estimation et consommée par la création de devis.

## Principes

- Aucun prix ne doit être calculé dans les frontends.
- Toute estimation passe par le Pricing Engine.
- Les devis stockent un snapshot tarifaire.
- Les expéditions créées depuis un devis copient le prix et le poids validés sans recalcul.
- Les devises sont pilotées par `CurrencyRate`, avec seed idempotent.
