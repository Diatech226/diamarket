# UI Build Fix Report

## Scope

- Fixed the blocking `react/no-unescaped-entities` JSX lint error in `apps/diaexpress-web/pages/routes/[slug].js` by escaping the apostrophe in visible copy with `&apos;`.
- Fixed simple React Hook dependency warnings in the requested UI files without disabling ESLint.
- Backend files were not modified.

## Changes

### diaexpress-web

- `pages/routes/[slug].js`
  - Replaced the unescaped JSX apostrophe in `l'expansion` with `l&apos;expansion`.
- `pages/account/notifications.js`
  - Wrapped `load` in `React.useCallback` and used `[load]` in `useEffect`.

### diamarket-cms

- `src/app/(cms)/users/page.tsx`
  - Wrapped `loadDetail` and `runAction` in `useCallback`.
  - Added the memoized callbacks to the `rows` `useMemo` dependency list.
- `src/app/(cms)/vendors/page.tsx`
  - Wrapped `loadVendors` and `loadRequests` in `useCallback`.
  - Updated the effects to depend on the memoized loader callbacks.
- `src/components/media/MediaPicker.tsx`
  - Wrapped `load` in `useCallback` with `category` and `search` dependencies.
  - Updated the effect to depend on `open` and the memoized `load` callback.

## Validation

Requested commands were executed:

```bash
npm --prefix apps/diaexpress-web run build
npm --prefix apps/diamarket-cms run build
```

Both commands currently stop before lint/build validation because the local workspace does not have the Next.js binary installed:

```text
sh: 1: next: not found
```

An attempt to restore dependencies with `npm install` was also blocked by registry access policy:

```text
npm error 403 403 Forbidden - GET https://registry.npmjs.org/@types%2freact
```

No ESLint rules were disabled, and image component migrations were intentionally left out of scope.
