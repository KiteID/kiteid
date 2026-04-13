FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.28.1 --activate
WORKDIR /app

# -- deps --
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/config-typescript/package.json packages/config-typescript/
COPY packages/contracts-abi/package.json packages/contracts-abi/
COPY apps/indexer/package.json apps/indexer/
RUN pnpm install --frozen-lockfile --filter @kiteid/indexer...

# -- build --
FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/config-typescript/node_modules ./packages/config-typescript/node_modules
COPY --from=deps /app/packages/contracts-abi/node_modules ./packages/contracts-abi/node_modules
COPY --from=deps /app/apps/indexer/node_modules ./apps/indexer/node_modules

COPY packages/config-typescript packages/config-typescript
COPY packages/contracts-abi packages/contracts-abi
COPY apps/indexer apps/indexer
COPY pnpm-workspace.yaml package.json tsconfig.json ./

WORKDIR /app/apps/indexer
RUN mkdir -p .ponder && chown -R node:node .ponder

EXPOSE 42069
ENV NODE_ENV=production
USER node
CMD ["pnpm", "start"]
