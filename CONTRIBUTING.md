# Contributing to KiteID

## Development Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies: `pnpm install`
4. Create a feature branch: `git checkout -b feat/my-feature`

## Branch Naming

- `feat/description` - New features
- `fix/description` - Bug fixes
- `chore/description` - Maintenance tasks
- `docs/description` - Documentation changes

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(contracts): add name registration
fix(web): resolve wallet connection issue
chore(deps): update dependencies
```

### Types

`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Scopes

`contracts`, `web`, `docs`, `indexer`, `workers`, `sdk`, `api`, `db`, `ui`, `brand`, `abi`, `infra`, `deps`

## Pull Request Process

1. Ensure `pnpm lint && pnpm typecheck && pnpm build` pass
2. Add a changeset if your change affects a package: `pnpm changeset`
3. Create a PR against `develop` (or `main` for hotfixes)
4. Fill out the PR template

## Code Style

- Biome handles formatting and linting
- Run `pnpm format` before committing
- Lefthook pre-commit hooks will check automatically
