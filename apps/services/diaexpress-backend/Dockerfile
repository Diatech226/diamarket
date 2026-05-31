# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY services/diaexpress-backend/package.json ./services/diaexpress-backend/package.json
RUN npm ci --omit=dev --workspace services/diaexpress-backend --include-workspace-root=false

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY services/diaexpress-backend ./services/diaexpress-backend

WORKDIR /app/services/diaexpress-backend
RUN mkdir -p uploads

EXPOSE 5000
CMD ["node", "server.js"]
