# Currency seed fix report

## Blocking error

```txt
MongoBulkWriteError: E11000 duplicate key error collection: diaexpress.currencyrates index: code_1 dup key: { code: "XOF" }
```

## Cause

The default currency seed must never rely on `insertMany` or count-then-insert logic. `XOF` is uniquely indexed by `code`, so repeated page loads, startup hooks, or concurrent processes can try to insert the same default currency twice and fail.

## Fix

`apps/diamarket-api/src/controllers/currencies.controller.ts` uses `CurrencyRate.bulkWrite()` with `updateOne` and `upsert: true` for each default currency code.

The seed:

- inserts a currency only when its code is missing;
- updates runtime fields (`rateToDefault`, `isActive`, `isDefault`, `source`, `lastUpdatedAt`) idempotently;
- does not delete production currencies;
- normalizes `FCFA` to `XOF` through the model/controller path;
- enforces `XOF` as the single default after upsert;
- logs `[currency-seed] Default currencies ensured.` after successful execution.

Manual creation of an already-existing currency code now returns:

```json
{
  "success": false,
  "message": "Currency code already exists"
}
```

## Validation notes

The `/currencies` CMS flow can call the seed repeatedly without crashing on duplicate `XOF`. A full runtime verification still requires a MongoDB instance with the `currencyrates` collection available.
