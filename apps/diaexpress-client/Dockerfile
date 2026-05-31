# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/diaexpress-client/package.json ./apps/diaexpress-client/package.json
COPY packages/diaexpress-shared/package.json ./packages/diaexpress-shared/package.json
RUN npm ci --workspace apps/diaexpress-client --workspace packages/diaexpress-shared --include-workspace-root=false

FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY apps/diaexpress-client ./apps/diaexpress-client
COPY packages/diaexpress-shared ./packages/diaexpress-shared

WORKDIR /app/apps/diaexpress-client
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/apps/diaexpress-client/public ./public
COPY --from=builder /app/apps/diaexpress-client/.next/standalone ./
COPY --from=builder /app/apps/diaexpress-client/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
