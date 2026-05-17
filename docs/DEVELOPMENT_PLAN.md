# KiteID Repo Development Plan (Quick Reference)

**Last updated:** 2026-05-14

**Master plan:** `../../docs/DEVELOPMENT_PLAN.md` (the authoritative source for phase definitions, gates, exit criteria, risk register, success metrics)

This file is a **short operational mirror** of the master plan from the repo's perspective. It does NOT redefine phases — it lists what is currently checked into this repository and where each piece of work belongs in the master plan's phase numbering.

---

## Current Position

- **Master phase:** Phase 5 (Hackathon + Mainnet) running in parallel with Phase 6.1 (NameWrapper) substantial completion.
- **Branch:** `develop`
- **Staging URL:** https://staging.kiteid.xyz
- **Docs URL:** https://staging.kiteid.xyz/docs
- **Testnet KiteWrapper:** `0x6b42995873495b69639e207b86a5610bbdb95fb9` (Chain ID 2368)

---

## Phase Completion Status (mirrors master plan)

| Master Phase | Status | Repo Evidence |
|---|---|---|
| Phase 1: Smart Contracts V1 | ✅ Complete (2026-04-14) | `packages/contracts/src/` + testnet addresses in memory |
| Phase 2: Frontend V1 | ✅ Complete (2026-04-20) | `apps/web/` commit-reveal flow |
| Phase 3: Backend + Indexing | ✅ Complete (2026-04-22) | `packages/api/`, `apps/indexer/`, `apps/workers/` |
| Phase 4: Testnet Beta + Pre-audit | ✅ Complete (2026-04-27) | Staging live, Slither/Aderyn/Halmos clean, Fumadocs at `apps/docs/` |
| **Phase 5: Hackathon + Mainnet** | ⏳ In progress | Open items: hackathon submission, WAL-G backup, Kener status page, mainnet deploy |
| **Phase 6.1: NameWrapper (ERC-1155)** | ✅ Testnet substantially complete (2026-05-14) | See below |
| Phase 6.2: Kite Passport Integration | 🟡 Mock UI + on-chain `bindPassport` only | Full integration pending |
| Phase 6.3 – 6.7 | 📋 Planned | Not started |
| Phase 6.8: HA Infrastructure / Infisical | 📋 Planned | CAX21 still in use |

---

## Phase 6.1 NameWrapper — What This Repo Ships

This subsection mirrors **master plan §6.1** so reviewers can find code quickly. The master plan owns the spec; this list owns the file pointers.

### Contracts
- `packages/contracts/src/wrapper/KiteWrapper.sol` — UUPS, ERC-1155, controller-gated wrap/unwrap, fuses, agent auth, `bindPassport`
- `packages/contracts/script/DeployWrapper.s.sol` — deploys impl + ERC1967Proxy + `initialize` + `addController` + verification
- `packages/contracts/test/unit/KiteWrapper.t.sol` — 25/25 tests passing

### API (Relayer)
- `packages/api/src/lib/wallet.ts` — chain-aware wallet client (mainnet 2366 vs testnet 2368 RPC split)
- `packages/api/src/lib/eip712.ts` — EIP-712 domain + WRAP_REQUEST_TYPES / UNWRAP_REQUEST_TYPES + signature verify
- `packages/api/src/routes/wrapper.ts` — `GET /v2/wrap/nonce`, `POST /v2/wrap/relay`, `POST /v2/wrap/preview`, `GET /v2/wrap/status/:node`
- `packages/api/src/lib/__tests__/eip712.test.ts` — 10 deterministic tests
- `packages/api/src/lib/__tests__/wallet.test.ts` — 6 deterministic tests
- DB: `packages/db/src/schema/relayer-nonces.ts`

### Frontend
- `packages/sdk/src/hooks/use-wrap-name.ts` — `wrapAsync`, `unwrapAsync`, `setFusesAsync`, `bindPassportAsync`, `checkWrapperApprovalAsync`, `approveWrapperAsync` (with `waitForTransactionReceipt`)
- `packages/sdk/src/lib/eip712.ts` — domain + typed data definitions (mirrors API)
- `apps/web/src/components/wrapping/wrap-dialog.tsx` — approval-aware wrap UI with `approving` step
- `apps/web/e2e/wrap-flow.spec.ts` — E2E scaffold + smoke tests (real flow gated on testnet wallet)

### Indexer
- `apps/indexer/src/handlers/` — KiteWrapper event handlers → `wrapped_names`, `agent_authorizations`, `activity_event`

### Documentation
- `docs/phase6c-testnet-deployment.md` — UUPS proxy deployment guide (corrected from earlier `forge create` error)
- `docs/phase6d-mainnet-deployment.md` — mainnet deployment checklist
- `docs/phase6e-gate5-completion.md` — gate 5 sign-off with runtime proof template
- `docs/phase6e-gate5-manual-testnet.md` — 6-test manual checklist + Pre-Test 0 controller verification

---

## Phase 5 Open Items (from master plan §5)

- [ ] Hackathon submission (pitch + demo video + submission)
- [ ] WAL-G + pgBackRest backup pipeline (R2 API token needed)
- [ ] Kener status page deployment
- [ ] Mainnet deployment (blocked by Kite mainnet launch — external)

---

## Decision Gates (mirrors master plan)

- ✅ Gate 0A → Phase 1 (2026-04-11)
- ✅ Gate 0B-core → Phase 3 (2026-04-12)
- ✅ Gate 1 → Phase 2 (2026-04-12)
- ✅ Gate 2 → Phase 3 (2026-04-12)
- ✅ Gate 3 → Phase 4 (2026-04-13)
- ✅ Gate 4 → Phase 5 (2026-04-27)
- ✅ **Gate 4.5 → Phase 6.1 Testnet Complete (2026-05-14)** — see master plan for criteria
- ⏳ Gate 5 → Mainnet Launch (blocked by Kite mainnet)
- 📋 Gate 6 → V2 Development (long-horizon)

---

## See Also

- **Master plan:** `../../docs/DEVELOPMENT_PLAN.md`
- **Architecture decisions:** `../../docs/architecture/00-07`
- **Research:** `../../docs/research/`
- **Phase lessons:** `docs/phase-lessons.md`
