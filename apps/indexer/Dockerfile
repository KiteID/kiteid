FROM node:22-alpine
RUN apk add --no-cache git && corepack enable && corepack prepare pnpm@10.28.1 --activate
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile --filter @kiteid/indexer...
WORKDIR /app/apps/indexer
RUN mkdir -p .ponder && chown -R node:node /app
EXPOSE 42069
ENV NODE_ENV=production
USER node
CMD ["pnpm", "start"]
