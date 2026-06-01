# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/diaexpress-web/package.json ./apps/diaexpress-web/package.json
COPY packages/diaexpress-shared/package.json ./packages/diaexpress-shared/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/ui/package.json ./packages/ui/package.json
RUN pnpm install --frozen-lockfile --filter diaexpress-web...

FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/diaexpress-web/node_modules ./apps/diaexpress-web/node_modules
COPY --from=deps /app/packages/diaexpress-shared/node_modules ./packages/diaexpress-shared/node_modules
COPY . .
RUN pnpm --filter diaexpress-web build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/apps/diaexpress-web/public ./public
COPY --from=builder /app/apps/diaexpress-web/.next/standalone ./
COPY --from=builder /app/apps/diaexpress-web/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
