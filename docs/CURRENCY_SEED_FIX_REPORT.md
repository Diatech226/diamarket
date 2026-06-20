# Currency seed fix report

## Problem

The Diamarket currencies page could trigger this MongoDB duplicate key error when default currencies were initialized more than once:

```txt
MongoBulkWriteError: E11000 duplicate key error collection: diaexpress.currencyrates index: code_1 dup key: { code: "XOF" }
```

## Root cause

`apps/diamarket-api/src/controllers/currencies.controller.ts` seeded default currencies with `CurrencyRate.insertMany(seed)` when the collection appeared empty. That check was not safe for repeated or concurrent startup/page-load scenarios: if one process inserted `XOF` between the count check and `insertMany`, or if the collection had been partially seeded, the unique `code` index could reject the operation.

## Fix

The seed now uses `CurrencyRate.bulkWrite()` with `updateOne` and `upsert: true` for every default currency code. Existing production currency documents are not deleted. New default documents are inserted only when missing, and runtime seed fields such as `rateToDefault`, `isActive`, `isDefault`, `source`, and `lastUpdatedAt` are updated idempotently.

After the upserts, `XOF` is enforced as the single default currency through the existing single-default helper, which clears `isDefault` on all other currency rows and marks `XOF` active/default with `rateToDefault: 1`.

Expected log after successful seed:

```txt
[currency-seed] Default currencies ensured.
```

## Guarantees

- The seed can run multiple times without throwing duplicate-key errors for existing currency codes.
- There is still one document per unique `code` via the existing unique index.
- Only one currency is default after seeding.
- Existing documents are upserted, not deleted.
- The `/currencies` CMS flow no longer depends on a non-idempotent `insertMany` seed.

## Files changed

- `apps/diamarket-api/src/controllers/currencies.controller.ts`
- `docs/CURRENCY_SEED_FIX_REPORT.md`
- `docs/AUTH_FLOW_STABILIZATION_REPORT.md`
- `.env.example` files for Diamarket and DiaExpress apps
