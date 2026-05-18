FROM node:22-alpine AS base
RUN apk add --no-cache git && corepack enable && corepack prepare pnpm@10.28.1 --activate
WORKDIR /app

FROM base AS builder
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
ARG NEXT_PUBLIC_CHAIN_ID=2368
RUN pnpm install --frozen-lockfile --filter @kiteid/web...
RUN pnpm build --filter @kiteid/web...

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
# Drizzle migration runner. The web container serves /api/* so it owns the
# auth + relayer tables — running migrate at start keeps a fresh DB or a new
# migration deploy from leaving the container broken until someone SSHes in.
# Failure here intentionally aborts boot (set -e in the CMD shell).
#
# The migration script lives under apps/web/scripts/ so Node module
# resolution walks up to apps/web/node_modules where standalone has placed
# pg + drizzle-orm (declared in serverExternalPackages of next.config.ts).
COPY --from=builder --chown=nextjs:nodejs /app/packages/db/drizzle ./packages/db/drizzle
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/scripts/migrate.mjs ./apps/web/scripts/migrate.mjs
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["sh", "-c", "node apps/web/scripts/migrate.mjs && node apps/web/server.js"]
