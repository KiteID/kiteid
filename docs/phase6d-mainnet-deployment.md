# Phase 6d: Mainnet Deployment Guide

**Status**: READY (testnet prerequisites complete) — execution blocked only by Kite AI mainnet launch
**Target Chain**: Kite Mainnet (Chain ID 2366)
**Predecessor**: Phase 6e Gate 5 PASS (testnet runtime proof completed 2026-05-14)
**Target Date**: Pending Kite mainnet availability  

---

## Pre-Deployment Status (Gate 5 — PASSED 2026-05-14)

- [x] **Phase 6e Gate 5 Runtime Proof Complete** (founder confirmed):
  - [x] Manual testnet: SIWE session → nonce 200 OK
  - [x] Manual testnet: EIP-712 sign + relay txHash returned
  - [x] Manual testnet: On-chain getExpiry > 0 confirmed
  - [x] Manual testnet: Ponder wrapped_names table row created
  - [x] Manual testnet: Activity feed NameWrapped event visible
  - [x] Regression tests with authenticated session:
    - [x] Nonce replay → 409 Conflict
    - [x] Owner mismatch → signature validation error
    - [x] Expired deadline → 400 Bad Request

- [x] **Testnet Stability**: Relayer running on staging for multiple days

- [ ] **Mainnet Preparation** (still pending Kite mainnet launch):
  - [ ] Phase 1 registry addresses verified on chain 2366:
    - [ ] KiteRegistry address
    - [ ] KiteBaseRegistrar address
    - [ ] KiteResolver address
    - [ ] KiteReverseRegistrar address
  - [ ] RELAYER_PRIVATE_KEY account has mainnet KITE (≥ 2 KITE for deploy + gas)
  - [ ] Mainnet RPC tested: https://rpc.gokite.ai/ responding
  - [ ] Mainnet indexer ready: Ponder configured for chain 2366
  - [ ] Git branch: `develop` clean, all changes committed

## Post-Mainnet Checklist (Execute After Deploy)

- [ ] Backup: RELAYER_PRIVATE_KEY securely stored (hardware wallet or Phase 6.8 Infisical/Vault)
- [ ] Mainnet explorer access verified
- [ ] Rollback procedure tested locally

---

## Step 1: Deploy KiteWrapper Contract to Mainnet

### 1.1 Verify Mainnet Registries

```bash
cd packages/contracts

# Fetch mainnet registry addresses from Phase 1 deployment
# These are the addresses used for production (see Testnet Contract Addresses section)
REGISTRY="0x..."          # mainnet KiteRegistry
BASE_REGISTRAR="0x..."    # mainnet KiteBaseRegistrar
REVERSE_REGISTRAR="0x..."  # mainnet KiteReverseRegistrar
RESOLVER="0x..."          # mainnet KiteResolver

# Verify contracts exist on mainnet
cast code $REGISTRY --rpc-url https://rpc.gokite.ai/
# Should return bytecode (not 0x)
```

### 1.2 Deploy KiteWrapper to Mainnet

```bash
# Build contract
forge build

# Verify RELAYER_PRIVATE_KEY is set
echo $RELAYER_PRIVATE_KEY

# Deploy KiteWrapper
forge create \
  --rpc-url https://rpc.gokite.ai/ \
  --private-key $RELAYER_PRIVATE_KEY \
  src/wrapper/KiteWrapper.sol:KiteWrapper \
  --constructor-args $REGISTRY $BASE_REGISTRAR $REVERSE_REGISTRAR $RESOLVER \
  --verify false
```

**Output**: Save the deployed contract address (e.g., `0x...`) → referred to as `MAINNET_WRAPPER_ADDRESS`

### 1.3 Verify Deployment

```bash
# Check contract code on mainnet
cast code <MAINNET_WRAPPER_ADDRESS> --rpc-url https://rpc.gokite.ai/

# Should return bytecode (not 0x)
# Verify constructor args by checking storage slot 0
cast storage <MAINNET_WRAPPER_ADDRESS> 0 --rpc-url https://rpc.gokite.ai/
```

---

## Step 2: Update Configuration

### 2.1 Update Contract ABIs

**packages/contracts-abi/src/addresses.ts:**

```typescript
export const KITE_WRAPPER_ADDRESSES = {
  [2368]: '0x3e45e568530763fa8f00b50b0106f63d2e6d84e5' as const, // testnet
  [2366]: '<MAINNET_WRAPPER_ADDRESS>' as const,                    // mainnet
};
```

### 2.2 Update .env Files

**packages/api/.env.production:**
```bash
WRAPPER_ADDRESS=<MAINNET_WRAPPER_ADDRESS>
RELAYER_PRIVATE_KEY=<controller-private-key>
NEXT_PUBLIC_CHAIN_ID=2366
```

**apps/web/.env.production:**
```bash
WRAPPER_ADDRESS=<MAINNET_WRAPPER_ADDRESS>
NEXT_PUBLIC_CHAIN_ID=2366
```

### 2.3 Update Dokploy Services

**Via Dokploy Dashboard or API:**

For `api` service:
- `WRAPPER_ADDRESS`: `<MAINNET_WRAPPER_ADDRESS>`
- `NEXT_PUBLIC_CHAIN_ID`: `2366`

For `web` service:
- `WRAPPER_ADDRESS`: `<MAINNET_WRAPPER_ADDRESS>`
- `NEXT_PUBLIC_CHAIN_ID`: `2366`

For `indexer` service:
- Update Ponder config to index chain 2366
- Verify RPC is `https://rpc.gokite.ai/`
- Clear schema if moving from testnet indexing

---

## Step 3: Deployment Pipeline

### 3.1 Create Release Commit

```bash
git checkout develop
git pull origin develop
git add packages/contracts-abi/src/addresses.ts .env.example
git commit -m "chore(release): update KiteWrapper mainnet address

KiteWrapper deployed to Kite mainnet (chain 2366):
Address: <MAINNET_WRAPPER_ADDRESS>
Controller: <RELAYER_PUBLIC_ADDRESS>

Testnet address retained for staging (2368): 0x3e45e568530763fa8f00b50b0106f63d2e6d84e5
"
git push origin develop
```

### 3.2 Trigger CI/CD

**Via GitHub Actions:**
- Push triggers `docker-build.yml`
- Multi-arch images built: `ghcr.io/kiteid/api:latest`, `ghcr.io/kiteid/web:latest`, etc.
- Await completion (~5-10 min)

### 3.3 Deploy via Dokploy Webhook

**Manual Deployment:**
```bash
# Each service redeploys with new env vars
# Monitor Dokploy dashboard for status

# For API service (api.kiteid.xyz subdomain if separate):
curl -X POST https://dokploy-api.internal/deploy \
  -H "Authorization: Bearer $DOKPLOY_TOKEN" \
  -d '{"appId": "api", "branch": "main"}'

# For Web service:
curl -X POST https://dokploy-api.internal/deploy \
  -H "Authorization: Bearer $DOKPLOY_TOKEN" \
  -d '{"appId": "web", "branch": "main"}'

# For Indexer service:
curl -X POST https://dokploy-api.internal/deploy \
  -H "Authorization: Bearer $DOKPLOY_TOKEN" \
  -d '{"appId": "indexer", "branch": "main"}'
```

**Or via GitHub webhook** (configured in Dokploy):
- Simply merge/push to `main` branch
- Dokploy automatically deploys on webhook signal

---

## Step 4: Post-Deployment Verification

### 4.1 API Health Check

```bash
# Verify API is running on mainnet
curl -s https://api.kiteid.xyz/health | jq .

# Expected response:
# { "ok": true }

# Check wrap preview endpoint
curl -s -X POST https://api.kiteid.xyz/v2/wrap/preview \
  -H "Content-Type: application/json" \
  -d '{
    "node": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "owner": "0x1234567890123456789012345678901234567890",
    "fuses": "0",
    "duration": 31536000
  }' | jq .

# Expected response:
# { "wrapperNotDeployed": false, "wrapperAddress": "<MAINNET_WRAPPER_ADDRESS>" }
```

### 4.2 Frontend Verification

```bash
# Navigate to https://kiteid.xyz/names
# Look for wrap button on test names
# UI should show wrapper as deployed

# Check browser console for any errors
# Verify RPC calls are going to https://rpc.gokite.ai/
```

### 4.3 Ponder Indexing Check

```bash
# Verify indexer is running and syncing mainnet
# Check Ponder status page or container logs

# Should see:
# - Chain 2366 synced
# - Block height increasing
# - No errors on KiteWrapper event parsing

# Test by wrapping a name (manually via wallet or relayer)
# Verify NameWrapped event appears in activity feed within 12 blocks (~12s)
```

---

## Step 5: Smoke Test - Wrap a Mainnet Name

### 5.1 Prerequisites

- [ ] Connected wallet with mainnet KITE balance (≥ 5 KITE for name registration + wrap)
- [ ] A registered `.kite` name on mainnet (or register one as test)
- [ ] Relayer running and accessible

### 5.2 Register Test Name (if needed)

```bash
# From web UI: https://kiteid.xyz/register/test-mainnet-<timestamp>
# Follow commit-reveal flow
# Wait for Ponder indexing (~6s per block)
```

### 5.3 Wrap Test Name

```bash
# From web UI: https://kiteid.xyz/names
# Find registered test name
# Click "Wrap" button
# Sign EIP-712 message in wallet
# Relayer executes wrap() on-chain
# Verify txHash returned and showing in activity feed
```

### 5.4 Verify On-Chain

```bash
# Check on Kite Explorer (https://kitescan.ai/)
# Search for KiteWrapper address
# Verify NameWrapped event logged with correct parameters
# Check NFT ownership in wallet
```

---

## Step 6: Documentation & Rollback Plan

### 6.1 Update Docs

- [ ] Update `DEVELOPMENT_PLAN.md` Phase 6d status to ✅ complete
- [ ] Add mainnet wrapper address to README (if public docs)
- [ ] Update security assumptions doc (relayer still beta, nonce TTL: 300s)
- [ ] Document any operational incidents or learnings

### 6.2 Rollback Procedure (If Needed)

**If critical bug discovered:**

```bash
# 1. Revert wrapper address in env
WRAPPER_ADDRESS=0x0 (or previous testnet addr for staging fallback)

# 2. Commit and push to develop
git revert HEAD
git push origin develop

# 3. Redeploy via CI/CD
# Services automatically pull latest env from git/Dokploy

# 4. Notify stakeholders
# Timeline: ~10 min from decision to live (CI + deploy)

# 5. Post-mortem: document root cause and fix strategy
```

---

## Phase 6d Completion Gate

**Gate 5 Must Close First** ⏳:
- [ ] Testnet manual proof: SIWE → nonce → sign → relay → on-chain → Ponder
- [ ] E2E regression tests passing with auth (nonce single-use, owner validation, deadline)
- [ ] 24h testnet stability confirmed
- [ ] Documentation updated to reflect runtime proof

**Phase 6d Complete when** (after Gate 5):
- [ ] KiteWrapper deployed to mainnet at fixed address
- [ ] All env vars updated (WRAPPER_ADDRESS, CHAIN_ID=2366)
- [ ] API /health + /v2/wrap/preview responding 200 with correct wrapper
- [ ] Frontend showing wrap button for mainnet names
- [ ] Smoke test: wrap transaction executed and indexed by Ponder
- [ ] No critical incidents in first 24h of mainnet operation
- [ ] Documentation updated + rollback procedure tested

**Next Phase**: Phase 7 (V2 Identity Layer) begins post-Phase 6d completion

---

## Testnet Contract Addresses (Reference)

For mapping mainnet registries, see Phase 1 deployment on mainnet chain 2366.

| Contract | Address |
|----------|---------|
| KiteRegistry | `0x...` |
| KiteBaseRegistrar | `0x...` |
| KiteResolver | `0x...` |
| KiteReverseRegistrar | `0x...` |

*(Fetch from git history or Kite Explorer once Phase 1 reaches mainnet)*

---

## Appendix: Mainnet Safety Checklist

**Risk Mitigation:**

- [ ] Relayer private key NOT in version control
- [ ] Relayer key has sufficient mainnet KITE (not depleted by failed txns)
- [ ] Rate limiting active on `/api/v2/wrap/nonce` + `/api/v2/wrap/relay`
- [ ] Nonce TTL enforced (300s max from issuance)
- [ ] Session SIWE validation working (no auth bypass)
- [ ] Ponder indexing lag ≤ 12 blocks (max for UX)
- [ ] Monitoring/alerting on wrap failure rates
- [ ] Backup plan: pause wrapping by setting WRAPPER_ADDRESS=0x0

---

**Authored**: Phase 6d planning  
**Last Updated**: 2026-05-02
