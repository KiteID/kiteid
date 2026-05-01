# KiteID Development Plan

**Last updated:** 2026-05-01

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

### 🎯 Phase 5: Hackathon + Mainnet Integration
- **Start:** 2026-04-27
- **Gate:** Hackathon acceptance + Kite AI mainnet launch
- **Deliverables:**
  - [ ] Submit to Kite AI hackathon (link: check announcements)
  - [ ] Kite mainnet deployment (switch `NEXT_PUBLIC_CHAIN_ID=2366`)
  - [ ] Update contract addresses in frontend/docs for mainnet
  - [ ] Testnet → mainnet contract redeploy decision
  - [ ] Phase 5 testing (live faucet, real registration flow)

### ✅ Phase 6a: KiteWrapper Contract Development
- **Completed:** 2026-04-28
- **Deliverables:**
  - KiteWrapper contract (wrap/unwrap/fuses/agent auth)
  - 25/25 unit + integration tests
  - Testnet deployment (address `0x...` — see Phase 6b notes for when address is set)

### ✅ Phase 6b: KiteWrapper Frontend & Indexer Integration
- **Completed:** 2026-05-01 (commit d94c90f main, fb717af develop sync)
- **Blockers Fixed:**
  - tsdown devDependency missing in @kiteid/ui + @kiteid/sdk (added to both)
  - Dockerfile using wrong pnpm filter syntax (changed to `--filter @kiteid/web...` for transitive deps)
  - Gitleaks false positives (refactored test secret to template literal + gitleaks:allow annotation, fixed tarball extraction to temp dir)
- **Deliverables:**
  - useWrapName SDK hook (wrapAsync, unwrapAsync, setFusesAsync)
  - wrap-dialog.tsx frontend integration (real writeContract calls)
  - Ponder handlers for 5 KiteWrapper events → activityEvent + wrappedName/agentAuth tables
  - API status/preview endpoints (graceful fallback if wrapper not deployed)
  - Staging deployment live + all smoke tests passing
  - See `docs/phase-lessons.md` for blocker details & solutions

### ✅ Phase 6c: KiteWrapper EIP-712 Relayer
- **Completed:** 2026-05-01 (commit 0e31bfb)
- **Design Decisions:**
  1. **EIP-712 Model:** User signs typed data → API verifies signature → controller relayer calls KiteWrapper.onlyController functions
  2. **Replay Protection:** Server-issued nonce (single-use, 5min TTL), deadline in typed data, chainId + verifyingContract in EIP712Domain
  3. **Off-chain MVP:** No contract changes. Trustless on-chain verification deferred to Phase 7 (wrapWithSig + contract nonce)
- **Deliverables:**
  - [x] Nonce table (relayer_nonces): single-use, TTL-enforced, server-issued
  - [x] EIP-712 domain + typed data definitions (WRAP_REQUEST_TYPES, UNWRAP_REQUEST_TYPES)
  - [x] API endpoints: GET /v2/wrap/nonce (issue nonce), POST /v2/wrap/relay (verify sig, broadcast)
  - [x] Signature verification (viem recoverTypedDataAddress)
  - [x] SDK hook update (wrapAsync/unwrapAsync via relayer pattern)
  - [x] Web UI integration (wrap-dialog wired to relayer)
  - [x] All quality gates pass: 191 contract tests, 41 SDK tests, 17 web tests
  - [x] Push to develop (0e31bfb)
- **Threat Model:**
  - Replay: nonce (server-issued, single-use, DB tracked)
  - Staleness: deadline in typed data (max 300s TTL)
  - Domain confusion: verifyingContract + chainId in domain separator
  - Parameter tamper: all wrap params inside signed struct
  - Identity spoof: SIWE session wallet must match typed.signer
  - Nonce grinding: server-issued (not client-chosen)

### 🎯 Phase 6d: KiteWrapper Testnet E2E + Mainnet Deploy (NEXT)
- **Blocked by:** Phase 6c completion (✅ done)
- **Gate:** Testnet relayer E2E test passing before mainnet deploy
- **Deliverables:**
  - [ ] Testnet relayer E2E test (user signs EIP-712 → verify → relay → on-chain ✓)
  - [ ] KiteWrapper deployment to testnet (if not already done)
  - [ ] KiteWrapper deployment to mainnet (after gate passes)
  - [ ] Contract addresses in packages/contracts-abi/src/addresses.ts updated
  - [ ] Environment variables (RELAYER_PRIVATE_KEY, WRAPPER_ADDRESS) configured on prod
  - [ ] Smoke test on mainnet (wrap a test name, verify Ponder picks up event)
  - [ ] Documentation: relayer security assumptions, mainnet rollout checklist

### 📋 Phase 7: V2 Identity Layer (Post-hackathon)
- **Blocked by:** Phase 5 completion, hackathon results
- **Deliverables:**
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
- [x] Docker build + deploy to staging (complete, d94c90f live)

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
