# Phase 6d: Testnet Runtime Proof & Staging Integration

**Status**: Operational deployment + real E2E validation  
**Gate**: Testnet only (mainnet deferred until proof complete)  
**Date**: 2026-05-02+  
**Success**: sign → relay → on-chain → Ponder indexed ✓

---

## Overview

Phase 6c delivered the EIP-712 relayer implementation. Phase 6d executes the testnet deployment and captures runtime proof that the entire flow works end-to-end before considering mainnet.

### Phase 6d Scope (NOT mainnet deployment yet)
- ✅ KiteWrapper deployed to Chain ID 2368 testnet
- ✅ Controller/relayer wallet confirmed with testnet KITE balance
- ✅ All environment configuration synchronized (addresses.ts, .env, Dokploy, API/indexer/workers)
- ✅ Staging image rebuilt with Phase 6c code
- ✅ Real disposable test name wrapped via E2E relay
- ✅ Nonce replay, owner mismatch, deadline validation tested
- ✅ On-chain state verified (getExpiry, token custody)
- ✅ Ponder indexed the wrap event
- ✅ Activity feed displays wrap event

### What's NOT in Phase 6d
- ❌ Mainnet deployment (proof-first, mainnet later)
- ❌ Contract changes (relay uses existing on-chain code)
- ❌ On-chain `wrapWithSig` (Phase 7, trustless verification)

---

## Deployment Order (5 Sequential Gates)

### Gate 1: KiteWrapper Testnet Deploy

**Responsibility**: Relayer/controller wallet setup

```bash
# 1. Verify relayer wallet has testnet KITE (>= 2 KITE for deploy + gas)
RELAYER_WALLET="0x..."  # Set from env
cast balance $RELAYER_WALLET --rpc-url https://rpc-testnet.gokite.ai/

# 2. Verify contract compiles
cd packages/contracts
forge build

# 3. Deploy KiteWrapper (constructor args from Phase 1 testnet deploy)
REGISTRY="0xb54a0D86d9059bC2db72BFfD1FAf6a87b9F0B036"
BASE_REGISTRAR="0x485cB7C9a8aC6fa4Cc60C489AE0221aFfdCC5841"
REVERSE_REGISTRAR="0x442FEe8572F4314A45bA2D81e32Db91fCB079E2D"
RESOLVER="0xfC69694BBd6b85Fd9b4aC5ddBD647b4f2196CC68"

forge create \
  --rpc-url https://rpc-testnet.gokite.ai/ \
  --private-key $RELAYER_PRIVATE_KEY \
  src/wrapper/KiteWrapper.sol:KiteWrapper \
  --constructor-args $REGISTRY $BASE_REGISTRAR $REVERSE_REGISTRAR $RESOLVER \
  --verify false

# 4. Capture WRAPPER_ADDRESS from output
# 5. Verify contract code exists
WRAPPER_ADDRESS="0x..."
cast code $WRAPPER_ADDRESS --rpc-url https://rpc-testnet.gokite.ai/
# Should return bytecode, not 0x
```

**Verification**:
- [ ] Deployment TX succeeds (status 0x1)
- [ ] WRAPPER_ADDRESS is set (40 hex chars, checksummed)
- [ ] cast code returns bytecode (not 0x)
- [ ] Relayer wallet has remaining balance >= 0.5 KITE

**Deliverable**: `WRAPPER_ADDRESS=0x...` (will be used in all following steps)

---

### Gate 2: Configuration Synchronization

**Responsibility**: All environments point to same wrapper address

#### 2a. Local Development (.env)

```bash
# packages/contracts-abi/src/addresses.ts
# Update wrapper field for chain 2368
export const addresses: Record<number, Addresses> = {
  2368: {
    registry: '0xb54a0D86d9059bC2db72BFfD1FAf6a87b9F0B036',
    baseRegistrar: '0x485cB7C9a8aC6fa4Cc60C489AE0221aFfdCC5841',
    reverseRegistrar: '0x442FEe8572F4314A45bA2D81e32Db91fCB079E2D',
    resolver: '0xfC69694BBd6b85Fd9b4aC5ddBD647b4f2196CC68',
    wrapper: '0x...',  // ← NEW WRAPPER_ADDRESS
  },
};

# Root .env.local
WRAPPER_ADDRESS=0x...
RELAYER_PRIVATE_KEY=0x...
```

#### 2b. Dokploy Staging (API, Indexer, Workers)

Navigate to **Dokploy Dashboard** → **Applications** → each app settings:

```
API:
  WRAPPER_ADDRESS=0x...
  RELAYER_PRIVATE_KEY=0x... (verify already set)
  NEXT_PUBLIC_CHAIN_ID=2368
  DATABASE_SCHEMA=ponder_index

Indexer:
  WRAPPER_ADDRESS=0x...
  NEXT_PUBLIC_CHAIN_ID=2368
  DATABASE_SCHEMA=ponder_index
  KITE_TESTNET_RPC_URL=https://rpc-testnet.gokite.ai/

Workers:
  WRAPPER_ADDRESS=0x...
  RELAYER_PRIVATE_KEY=0x...
```

**Verification**:
```bash
# Check that all three apps see same WRAPPER_ADDRESS
curl -s https://api.staging.kiteid.xyz/v2/wrap/nonce \
  -H "Cookie: $(curl -s https://staging.kiteid.xyz -c /tmp/c.txt -b /tmp/c.txt | grep -i session | awk '{print $NF}')" \
  | jq .

# Should NOT return "KiteWrapper not deployed" error
```

#### 2c. Commit & Push

```bash
git add packages/contracts-abi/src/addresses.ts
git commit -m "config: testnet KiteWrapper address (Chain 2368)"
git push origin develop
```

**Verification**:
- [ ] Git status clean after commit
- [ ] CI gates start: typecheck, lint, tests, Docker build
- [ ] Wait for Docker build to complete (multi-arch, ~5 min)
- [ ] Watch for Dokploy auto-deploy webhook (or manual trigger)

---

### Gate 3: Staging Deployment

**Responsibility**: New image deployed to all services

#### 3a. Monitor Docker Build
```bash
# GitHub Actions → phase6d deployment
# Look for:
# - "Building multi-arch image (amd64, arm64)"
# - "Pushing to GHCR" (ghcr.io/kiteid/kiteid:...)
# - "Build complete" message
```

#### 3b. Monitor Dokploy Deployment

**Option A: Automatic** (if webhook configured)
```bash
# Dokploy sees new image, auto-redeploys apps
# Monitor: Applications → <app> → Deployments tab
```

**Option B: Manual** (if needed)
```bash
# SSH into VPS
ssh -i ~/.ssh/talaria root@95.216.142.116

# Trigger Dokploy deployment
curl -X POST https://dokploy.local/api/v1/deployment/trigger \
  -H "Authorization: Bearer $DOKPLOY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"appId":"<api-app-id>"}'

# Or via web UI: Applications → select app → Deploy button
```

#### 3c. Verify Services Are Running

```bash
# API is responding
curl -s https://api.staging.kiteid.xyz/health | jq .

# Indexer is running (check Ponder endpoint)
curl -s https://indexer.staging.kiteid.xyz/health | jq .

# Web is serving
curl -s -I https://staging.kiteid.xyz/ | head -5
```

**Verification**:
- [ ] All three services return 200 OK
- [ ] No "Relayer not configured" (503) errors
- [ ] No "KiteWrapper not deployed" (400) errors

#### 3d. Apply Database Migration

**Via psql** (if not automatic):
```bash
# SSH into VPS
ssh -i ~/.ssh/talaria root@95.216.142.116

# Connect to Postgres
psql -h localhost -U postgres -d kite_prod

# Check current migrations
SELECT name FROM drizzle_migrations ORDER BY name DESC LIMIT 5;

# If 0002_stiff_arclight.sql not applied, apply manually:
\i /path/to/migration/0002_stiff_arclight.sql

# Verify relayer_nonces table exists
\dt relayer_nonces
```

**Verification**:
- [ ] `relayer_nonces` table exists
- [ ] Columns: address, nonce, issued_at, expires_at, used_at
- [ ] Indexes: relayer_nonces_address_idx, relayer_nonces_expires_at_idx, relayer_nonces_used_at_idx

---

### Gate 4: Disposable E2E Test Name

**Responsibility**: Real wrap flow validation

#### 4a. Register Test Name

```bash
# Go to https://staging.kiteid.xyz/register/testname
# (Use a disposable name like "test-6d-<date>", e.g., "test-6d-05021200")

# Steps:
# 1. Input: "test-6d-05021200"
# 2. Check availability
# 3. Commit (commit TX)
# 4. Wait ~1 min for commit confirmation
# 5. Reveal (reveal TX + register TX)
# 6. Wait ~1 min for confirmation
```

**Verification**:
- [ ] Name owned by your wallet
- [ ] Past grace period (if registering fresh name, no grace yet)
- [ ] Accessible at https://staging.kiteid.xyz/names/test-6d-05021200

#### 4b. Capture Node Hash & Token ID

```bash
# Get node hash for testnet verification
NODE_HASH=$(node -e "console.log(require('@kiteid/sdk').namehash('test-6d-05021200.kite'))")
echo "Node hash: $NODE_HASH"

# Get label hash (tokenId)
TOKEN_ID=$(node -e "console.log(require('@kiteid/sdk').labelhash('test-6d-05021200'))")
echo "Token ID: $TOKEN_ID"

# Save these for later verification
```

---

### Gate 5: Real Relay E2E + Regression Tests

**Responsibility**: Sign → Relay → On-chain → Indexed

#### 5a. Manual Nonce Flow (curl)

```bash
# 1. Authenticate to staging (SIWE login)
# Get session cookie from browser DevTools → Application → Cookies → sessionid

SESSION_COOKIE="<paste-sessionid>"
WALLET="<your-testnet-wallet>"

# 2. Get nonce
NONCE_RESPONSE=$(curl -s -X GET https://api.staging.kiteid.xyz/v2/wrap/nonce \
  -H "Cookie: sessionid=$SESSION_COOKIE")

echo "Nonce response: $NONCE_RESPONSE"
NONCE=$(echo $NONCE_RESPONSE | jq -r '.nonce')
EXPIRES_AT=$(echo $NONCE_RESPONSE | jq -r '.expiresAt')

echo "Nonce: $NONCE"
echo "Expires at: $EXPIRES_AT"

# Verify nonce format
if [[ $NONCE == 0x* ]] && [[ ${#NONCE} -eq 66 ]]; then
  echo "✓ Nonce format valid (66 chars)"
else
  echo "✗ Nonce format invalid"
  exit 1
fi

# Verify expiry is ~5 min from now
NOW=$(date +%s)
EXPIRES_EPOCH=$(date -d "$EXPIRES_AT" +%s)
DIFF=$((EXPIRES_EPOCH - NOW))
echo "Nonce TTL: ${DIFF}s (should be ~300s)"
```

#### 5b. Frontend Wrap Dialog E2E

Instead of curl, use the actual frontend (more realistic):

```
1. Navigate to https://staging.kiteid.xyz/names/test-6d-05021200
2. Click "Wrap to V2" button
3. Select fuses (default 0 OK)
4. Confirm preview (gas estimate shown)
5. Review settings (node hash, fuses displayed)
6. Click "Sign with Wallet"
7. Wallet pops up → EIP-712 message prompt
8. Sign message
9. Dialog shows "Wrapping name..." spinner
10. After 10-30 seconds: "Wrapping name success" + txHash
11. Note txHash
```

**What's happening under the hood**:
```
WrapDialog → useWrapName.wrapAsync()
  → GET /v2/wrap/nonce (from API)
  ← { nonce, expiresAt }
  → wagmi.signTypedData({ domain, types, message: { signer, node, tokenId, owner, fuses, expiry, nonce, deadline } })
  ← signature
  → POST /v2/wrap/relay ({ action: 'wrap', params, signer, nonce, deadline, signature })
  ← { txHash }
  → User sees success + txHash link
```

#### 5c. Verify On-Chain State

```bash
WRAPPER_ADDRESS="0x..."
NODE_HASH="0x..."

# Check that wrapper has recorded the expiry
cast call $WRAPPER_ADDRESS \
  "getExpiry(bytes32)" $NODE_HASH \
  --rpc-url https://rpc-testnet.gokite.ai/

# Expected: Non-zero uint256 (unix timestamp ~1 year in future)
# Example output: 1757639400

# Verify expiry is in future (1 year from now)
EXPIRY=$(cast call $WRAPPER_ADDRESS "getExpiry(bytes32)" $NODE_HASH --rpc-url https://rpc-testnet.gokite.ai/)
NOW=$(date +%s)
FUTURE=$((NOW + 365*24*3600))

if (( EXPIRY > NOW && EXPIRY < FUTURE + 100 )); then
  echo "✓ Expiry is valid (within ~1 year)"
else
  echo "✗ Expiry is invalid: $EXPIRY"
  exit 1
fi
```

**Verification**:
- [ ] txHash returned from relay
- [ ] txHash appears on testnet explorer (https://testnet.kitescan.ai/)
- [ ] TX status is success (0x1)
- [ ] getExpiry(node) returns non-zero timestamp
- [ ] Timestamp is ~1 year in future (365 days)

#### 5d. Verify Ponder Indexing

```bash
# SSH into VPS (connect to Postgres)
ssh -i ~/.ssh/talaria root@95.216.142.116

psql -h localhost -U postgres -d kite_prod

# Query wrapped_names table
SELECT node, owner, expiry, fuses, tx_hash, wrapped_at
FROM ponder_index.wrapped_names
WHERE node = '\x...' -- Your NODE_HASH
ORDER BY wrapped_at DESC
LIMIT 1;

# Expected: One row matching your wrap
# - node: matches NODE_HASH
# - owner: matches your wallet address
# - expiry: matches on-chain getExpiry() result
# - tx_hash: matches relay response txHash
# - wrapped_at: ~now
```

**Verification**:
- [ ] Row exists in `ponder_index.wrapped_names`
- [ ] owner matches your wallet
- [ ] tx_hash matches dialog txHash
- [ ] expiry matches on-chain value
- [ ] wrapped_at is recent (within last minute)

#### 5e. Verify Activity Feed Event

```
Navigate to https://staging.kiteid.xyz/activity

Expected: New entry showing
  "Wrapped test-6d-05021200.kite with KiteWrapper"
  Timestamp: just now
  TX: link to https://testnet.kitescan.ai/tx/<txHash>
```

**Verification**:
- [ ] Activity feed shows new wrap event
- [ ] Event shows correct name
- [ ] Event shows correct TX hash
- [ ] Event timestamp is correct

---

## Regression Tests

### Test 1: Nonce Replay (409 Expected)

```bash
# Use same nonce from earlier in this document

curl -X POST https://api.staging.kiteid.xyz/v2/wrap/relay \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionid=$SESSION_COOKIE" \
  -d '{
    "action": "wrap",
    "params": {
      "node": "'$NODE_HASH'",
      "tokenId": "'$TOKEN_ID'",
      "owner": "'$WALLET'",
      "fuses": "0",
      "expiry": "1757639400"
    },
    "signer": "'$WALLET'",
    "nonce": "'$NONCE'",
    "deadline": 1700000000,
    "signature": "<same-signature-as-before>"
  }'

# Expected response: 409 Conflict
# { "error": "Invalid or expired nonce" }
```

**Verification**:
- [ ] Response is 409 (not 200, not 401, not 500)
- [ ] Error message: "Invalid or expired nonce"
- [ ] Nonce single-use enforced ✓

### Test 2: Owner Mismatch (401 Expected)

```bash
# Get fresh nonce
FRESH_NONCE=$(curl -s -X GET https://api.staging.kiteid.xyz/v2/wrap/nonce \
  -H "Cookie: sessionid=$SESSION_COOKIE" | jq -r '.nonce')

DIFFERENT_OWNER="0x1111111111111111111111111111111111111111"

# Try to relay with mismatched owner
curl -X POST https://api.staging.kiteid.xyz/v2/wrap/relay \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionid=$SESSION_COOKIE" \
  -d '{
    "action": "wrap",
    "params": {
      "node": "'$NODE_HASH'",
      "tokenId": "'$TOKEN_ID'",
      "owner": "'$DIFFERENT_OWNER'",
      "fuses": "0",
      "expiry": "1757639400"
    },
    "signer": "'$WALLET'",
    "nonce": "'$FRESH_NONCE'",
    "deadline": 1700000000,
    "signature": "<fresh-signature-with-different-owner>"
  }'

# Expected response: 401 Unauthorized
# { "error": "Owner must match authorized wallet" }
```

**Verification**:
- [ ] Response is 401
- [ ] Error message: "Owner must match authorized wallet"
- [ ] Grief prevention working ✓

### Test 3: Expired Deadline (400 Expected)

```bash
# Get fresh nonce
FRESH_NONCE=$(curl -s -X GET https://api.staging.kiteid.xyz/v2/wrap/nonce \
  -H "Cookie: sessionid=$SESSION_COOKIE" | jq -r '.nonce')

PAST_DEADLINE=$(($(date +%s) - 100))  # 100s in past

# Try relay with expired deadline
curl -X POST https://api.staging.kiteid.xyz/v2/wrap/relay \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionid=$SESSION_COOKIE" \
  -d '{
    "action": "wrap",
    "params": {
      "node": "'$NODE_HASH'",
      "tokenId": "'$TOKEN_ID'",
      "owner": "'$WALLET'",
      "fuses": "0",
      "expiry": "1757639400"
    },
    "signer": "'$WALLET'",
    "nonce": "'$FRESH_NONCE'",
    "deadline": '$PAST_DEADLINE',
    "signature": "<fresh-signature-with-past-deadline>"
  }'

# Expected response: 400 Bad Request
# { "error": "Deadline has passed" }
```

**Verification**:
- [ ] Response is 400
- [ ] Error message: "Deadline has passed"
- [ ] Deadline validation working ✓

---

## Proof Checklist (Final Verification)

Once all E2E and regression tests pass, you have runtime proof:

- [ ] **Nonce Flow**
  - [ ] GET /nonce returns 66-char hex, 5-min TTL
  - [ ] Nonce stored in relayer_nonces table

- [ ] **Relay Flow**
  - [ ] POST /relay accepts valid EIP-712 signature
  - [ ] relayerWalletClient broadcasts wrap() on-chain
  - [ ] txHash returned to user

- [ ] **On-Chain State**
  - [ ] getExpiry(node) returns non-zero timestamp
  - [ ] Timestamp is ~1 year in future
  - [ ] TokenId in params matches labelhash(label), not namehash(full.kite)

- [ ] **Ponder Indexing**
  - [ ] NameWrapped event captured
  - [ ] wrapped_names row created with correct owner/expiry/tx_hash
  - [ ] wrapped_at timestamp is accurate

- [ ] **Activity Feed**
  - [ ] Wrap event visible in activity
  - [ ] Event shows correct name and TX hash

- [ ] **Regression Tests**
  - [ ] Nonce replay → 409 ✓
  - [ ] Owner mismatch → 401 ✓
  - [ ] Expired deadline → 400 ✓

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Relayer not configured" (503) | RELAYER_PRIVATE_KEY not set in Dokploy | Set env var in Dokploy → Redeploy API |
| "KiteWrapper not deployed" (400) | WRAPPER_ADDRESS is 0x0 or wrong | Deploy contract → Update all envs → Redeploy |
| No primary wallet found (400) | User logged in but wallet not primary | SIWE login required, wallet must be primary |
| Invalid signature (401) | Domain/types mismatch or wrong wallet signed | Check domain.chainId, domain.verifyingContract, wallet |
| Nonce already used (409) | Nonce consumed in first relay | Get fresh nonce from /nonce endpoint |
| Deadline has passed (400) | Deadline in params is before now | Deadline must be future (now + 270s OK) |
| txHash doesn't appear on chain | Gas too low or relayer wallet balance insufficient | Check relayer balance, may need more KITE |
| Ponder doesn't index event | Wrong DATABASE_SCHEMA env | Set DATABASE_SCHEMA=ponder_index, restart indexer |
| Activity feed doesn't show event | Wrapped_names event handler not wired | Check ponder.config.ts, restart indexer |

---

## Success Criteria (Pass/Fail)

**PASS** if ALL of the following are true:
1. ✅ KiteWrapper deployed to Chain 2368 testnet
2. ✅ GET /v2/wrap/nonce returns valid nonce with 5-min TTL
3. ✅ POST /v2/wrap/relay with valid signature succeeds, returns txHash
4. ✅ ON-CHAIN: getExpiry(node) returns non-zero timestamp ~1 year future
5. ✅ PONDER: wrapped_names table contains entry with correct owner/expiry/tx_hash
6. ✅ ACTIVITY FEED: Wrap event displayed
7. ✅ Nonce replay returns 409 (single-use enforced)
8. ✅ Owner mismatch returns 401 (grief prevention working)
9. ✅ Expired deadline returns 400 (deadline validation working)

**FAIL** if any criterion above is not met.

---

## Next Phase (6e+)

Once Phase 6d proof is complete:

- **Phase 6e** (optional, if needed): Unwrap E2E + additional edge cases
- **Phase 7** (mainnet prep): On-chain `wrapWithSig` for trustless verification (no API relay needed)
- **Phase 8** (mainnet deploy): Update addresses.ts for mainnet, deploy to Chain 2366

---

## Timeline

- **Gate 1 (Deploy)**: ~30 min (deploy + verify)
- **Gate 2 (Config)**: ~20 min (update files + commit + Docker build)
- **Gate 3 (Staging Deployment)**: ~10 min (wait for Docker + redeploy services)
- **Gate 4 (Register Test Name)**: ~5-10 min (quick registration)
- **Gate 5 (Real E2E + Regression)**: ~30 min (manual testing + verification)

**Total**: ~1.5-2 hours for complete Phase 6d proof.

After proof is captured and mainnet is officially launched by Kite, Phase 7-8 will be straightforward.

