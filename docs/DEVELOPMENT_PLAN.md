# KiteID Development Plan

**Last updated:** 2026-04-27

## Current Phase: Phase 5 (Hackathon + Mainnet Integration)

---

## Phase Completion Status

### ✅ Phase 1: Smart Contracts V1
- **Completed:** 2026-04-14 (testnet deployment)
- **Contracts:** KiteRegistry, KiteBaseRegistrar, KiteController, KiteResolver, LinearPremiumPriceOracle, KiteReverseRegistrar
- **Chain:** Kite AI Testnet (ID: 2368)
- **Addresses:** See memory `kiteid/MEMORY.md` — Testnet Contract Addresses

### ✅ Phase 2: Frontend V1
- **Completed:** 2026-04-20
- **Features:** Commit-reveal registration flow, name search, profile management, activity log
- **Stack:** Next.js 16, React 19, Wagmi, RainbowKit, Zustand, TanStack Query

### ✅ Phase 3: Backend + Indexing
- **Completed:** 2026-04-22
- **Services:** Hono API (self-hosted), PostgreSQL, Ponder indexer
- **Features:** SIWE auth, name resolution API, activity indexing
- **Infrastructure:** Hetzner CAX21 (4 vCPU / 8GB), Dokploy, Cloudflare Tunnel

### ✅ Phase 4: Testnet Beta + Pre-audit Sprint
- **Completed:** 2026-04-27
- **Deliverables:**
  - About page (team, vision, tech stack, V2 teaser)
  - Ecosystem page (Kite AI network, testnet contract addresses, pricing tiers, links)
  - OG metadata for `/names/[name]` (server layout + generateMetadata)
  - Faucet guide banner (shown when `chainId === 2368`)
  - Footer links update (About, Ecosystem, Docs)
  - Fumadocs documentation site (9 MDX pages, full site at `/docs`)
  - A11y Playwright spec (axe-core WCAG2A/AA checks for all pages)
  - Kener status page config (ready for deployment)
  - E2E registration test (mocked contract calls, no KITE required)
  - CI Docker build job for docs app
  - Gitleaks + PostCSS audit ignores (false positives)

### 🎯 Phase 5: Hackathon + Mainnet Integration (CURRENT)
- **Start:** 2026-04-27
- **Gate:** Hackathon acceptance + Kite AI mainnet launch
- **Deliverables:**
  - [ ] Submit to Kite AI hackathon (link: check announcements)
  - [ ] Kite mainnet deployment (switch `NEXT_PUBLIC_CHAIN_ID=2366`)
  - [ ] Update contract addresses in frontend/docs for mainnet
  - [ ] Testnet → mainnet contract redeploy decision
  - [ ] Phase 5 testing (live faucet, real registration flow)

### 📋 Phase 6: V2 Identity Layer (Post-hackathon)
- **Blocked by:** Phase 5 completion, hackathon results
- **Deliverables:**
  - NameWrapper (ENS compatibility)
  - Kite Passport integration (agent identity)
  - x402 payment primitives
  - Vault / Infisical for secrets
  - Replica database + CAX31 upgrade
  - Dark mode UI

---

## Phase 5 Checklist

### Pre-launch (now)
- [x] All Phase 4 items complete
- [x] Staging fully operational (100% green)
- [x] E2E tests passing (mocked flow)
- [x] A11y audit passing
- [x] Security scans passing (gitleaks, trivy, semgrep)
- [x] Documentation site live
- [x] Status page config ready
- [ ] Docker build + deploy to staging (in progress)

### Hackathon submission
- [ ] Write compelling pitch (why KiteID matters for Kite AI agents)
- [ ] Create demo video or live walkthrough
- [ ] Submit to hackathon (deadline: TBD)

### Mainnet preparation
- [ ] Monitor Kite AI mainnet launch announcement
- [ ] Mainnet RPC endpoint: `https://rpc.gokite.ai/`
- [ ] Mainnet Explorer: `kitescan.ai`
- [ ] Update `NEXT_PUBLIC_CHAIN_ID` from 2368 → 2366
- [ ] Redeploy/verify contract addresses on mainnet
- [ ] Test full registration flow on mainnet

---

## Infrastructure Status

| Component | Status | Notes |
|-----------|--------|-------|
| VPS (Hetzner CAX21) | ✅ Live | 95.216.142.116, Debian 12 arm64 |
| Dokploy | ✅ Live | v0.28.8, 11 containers |
| PostgreSQL | ✅ Live | 17, PgBouncer, Dragonfly (Redis-compat) |
| Ponder Indexer | ✅ Live | Self-hosted, polling testnet |
| Cloudflare Tunnel | ✅ Live | Hides VPS IP, SSH via Access |
| GlitchTip | ✅ Live | errors.kiteid.xyz, Sentry SDK integrated |
| Kener Status Page | ⏳ Ready | Config at `apps/status/kener.config.yaml` |
| WAL-G Backup | ⏳ Optional | Config ready, needs R2 API token (deferred to Phase 6) |

---

## Key Decisions & Trade-offs

1. **Self-hosted infrastructure** — Full control, lower cost, but operational overhead (Phase 0B lesson learned)
2. **No audit hired** — Hackathon path, solo dev, deferred to Phase 6 if needed
3. **Ponder for indexing** — Lightweight, Viem native, meets V1 needs
4. **Dokploy for PaaS** — Simpler than K8s, Cloudflare Tunnel hides origin IP
5. **Storage**: R2 (egress cheap) + Resend (email delivery)

---

## Documentation

- **Architecture:** `docs/architecture/00-stack-decision.md` through `07-self-hosted-infra.md`
- **Research:** `docs/research/` — competitor analysis, stack evaluation
- **Phase lessons:** `docs/phase-lessons.md`
- **Memory:** `.claude/projects/.../memory/MEMORY.md` — credentials, URLs, preferences

---

## Next Steps

1. ✅ Merge PR #55 (Phase 4 items)
2. ⏳ Wait Docker build + deploy to staging.kiteid.xyz
3. 🔍 Test staging fully (faucet, registration, all pages)
4. 📝 Write hackathon submission
5. 🚀 Submit + monitor Kite AI mainnet launch
6. 🎯 Phase 5 ready when mainnet goes live

---

**Branch:** `develop` (main testnet branch)  
**Staging URL:** https://staging.kiteid.xyz  
**Docs:** https://staging.kiteid.xyz/docs  
**Status Page:** TBD (Kener deployment needed)
