# Monorepo architecture

## Applications

The repository contains DiaMarket, DiaPay, and DiaExpress applications. Each DiaExpress application is installed, built, and started independently from its own directory with npm.

## DiaExpress dependency rules

- `apps/diaexpress-web`, `apps/diaexpress-admin`, and `apps/diaexpress-api` do not import one another.
- Frontend components, pages, hooks, styles, and utilities live inside the application that uses them.
- API cross-cutting infrastructure lives under `apps/diaexpress-api/src/lib`.
- DiaExpress applications use no local package links or external workspace protocol dependencies.

## Build and deployment

Run `npm install` and the application scripts from each application directory. Vercel installs and builds each Next.js application with npm.
