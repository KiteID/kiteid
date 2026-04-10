# KiteID

ENS-style `.kite` domain name service on [Kite AI](https://www.gokite.ai/) blockchain.

## Monorepo Structure

```
kiteid/
├── apps/
│   ├── web/            # Next.js frontend
│   ├── docs/           # Documentation site
│   ├── indexer/        # Ponder blockchain indexer
│   └── workers/        # Background workers (Inngest)
├── packages/
│   ├── contracts/      # Solidity smart contracts (Foundry)
│   ├── contracts-abi/  # Generated ABIs
│   ├── sdk/            # TypeScript SDK
│   ├── api/            # Hono API server
│   ├── db/             # Drizzle ORM schema
│   ├── ui/             # Shared UI components (shadcn/ui)
│   ├── utils/          # Shared utilities
│   ├── brand/          # Brand assets & design tokens
│   ├── config-typescript/  # Shared TypeScript configs
│   └── config-biome/   # Shared Biome config
└── deploy/             # Deployment configs
```

## Getting Started

### Prerequisites

- Node.js >= 22
- pnpm >= 10
- Foundry (for smart contracts)
- Docker (for local dev services)

### Setup

```bash
pnpm install
pnpm build
```

### Local Development

```bash
# Start all dev services (Postgres, PgBouncer, Dragonfly)
docker compose up -d

# Start development
pnpm dev
```

### Commands

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages |
| `pnpm dev` | Start development servers |
| `pnpm lint` | Lint with Biome |
| `pnpm format` | Format with Biome |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm test` | Run tests |
| `pnpm test:contracts` | Run Foundry tests |
| `pnpm clean` | Clean build artifacts |

## Tech Stack

- **Contracts:** Solidity 0.8.34+, Foundry, OpenZeppelin 5.5
- **Frontend:** Next.js 16, React 19, Tailwind v4, shadcn/ui
- **Web3:** Viem, Wagmi v3, RainbowKit
- **Backend:** Hono, PostgreSQL 17, Drizzle ORM, Dragonfly
- **Indexing:** Ponder
- **Monorepo:** Turborepo 2.x, pnpm workspaces
- **Quality:** Biome 2.4, Lefthook, Commitlint, Changesets

## License

[MIT](LICENSE)
