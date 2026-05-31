# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/diaexpress-adminv2/package.json ./apps/diaexpress-adminv2/package.json
RUN npm ci --workspace apps/diaexpress-adminv2 --include-workspace-root=false

FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY apps/diaexpress-adminv2 ./apps/diaexpress-adminv2

WORKDIR /app/apps/diaexpress-adminv2
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app/apps/diaexpress-adminv2/public ./public
COPY --from=builder /app/apps/diaexpress-adminv2/.next/standalone ./
COPY --from=builder /app/apps/diaexpress-adminv2/.next/static ./.next/static

EXPOSE 3001
CMD ["node", "server.js"]
