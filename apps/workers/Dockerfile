FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.28.1 --activate
WORKDIR /app

# -- deps --
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/config-typescript/package.json packages/config-typescript/
COPY packages/db/package.json packages/db/
COPY apps/workers/package.json apps/workers/
RUN pnpm install --frozen-lockfile --filter @kiteid/workers...

# -- build --
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/config-typescript/node_modules ./packages/config-typescript/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=deps /app/apps/workers/node_modules ./apps/workers/node_modules

COPY packages/config-typescript packages/config-typescript
COPY packages/db packages/db
COPY apps/workers apps/workers
COPY pnpm-workspace.yaml package.json tsconfig.json ./

WORKDIR /app/apps/workers
RUN pnpm build

# -- runner --
FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/workers/dist ./dist
COPY --from=builder /app/apps/workers/node_modules ./node_modules
COPY --from=builder /app/packages/db ./packages/db

ENV NODE_ENV=production
# Run idempotent DB migrations on startup (Drizzle tracks applied state)
# In local dev, docker-compose init service runs first; this is a prod safety net.
CMD ["sh", "-c", "node /app/packages/db/migrate.mjs && node dist/index.js"]
