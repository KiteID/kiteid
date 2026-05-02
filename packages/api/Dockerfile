FROM node:22-alpine AS base
RUN apk add --no-cache git && corepack enable && corepack prepare pnpm@10.28.1 --activate
WORKDIR /app

FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile --filter @kiteid/api...
RUN pnpm build --filter @kiteid/api...

FROM base AS runner
COPY --from=builder --chown=node:node /app /app
ENV NODE_ENV=production
USER node
CMD ["sh", "-c", "node /app/packages/db/migrate.mjs && node /app/packages/api/dist/index.js"]
