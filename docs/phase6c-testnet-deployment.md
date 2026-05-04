# Phase 6c: Testnet Deployment Guide

**Status**: Ready for testnet integration  
**Target Chain**: Kite Testnet (Chain ID 2368)  
**Target Date**: 2026-05-02  

---

## Pre-Deployment Checklist

- [ ] KiteWrapper contract compiled locally (`pnpm build` in packages/contracts)
- [ ] RELAYER_PRIVATE_KEY account has testnet KITE balance (>= 1 KITE for deploy + gas)
- [ ] Testnet RPC accessible: https://rpc-testnet.gokite.ai/
- [ ] Git branch: `develop` (commit 76346d6), working tree clean
- [ ] Staging API running or will be updated post-deploy

---

## Step 1: Deploy KiteWrapper Contract

### 1.1 Prepare Deployment

```bash
cd packages/contracts

# Verify contract compiles
forge build

# Check RELAYER_PRIVATE_KEY is set (contract owner/controller)
echo $RELAYER_PRIVATE_KEY
```

### 1.2 Deploy to Testnet

**Via Foundry Script (correct UUPS proxy + initialization):**

KiteWrapper uses UUPS upgradeable proxy. Do NOT use `forge create --constructor-args` — constructor takes zero args and calls `_disableInitializers()`. Use the deployment script instead.

```bash
export BASE_REGISTRAR_ADDRESS="0x485cB7C9a8aC6fa4Cc60C489AE0221aFfdCC5841"
export RELAYER_PRIVATE_KEY="0x..."

forge script script/DeployWrapper.s.sol:DeployWrapper \
  --rpc-url https://rpc-testnet.gokite.ai/ \
  --private-key $RELAYER_PRIVATE_KEY \
  --broadcast
```

**What this does:**
1. Deploys KiteWrapper implementation (empty constructor, `_disableInitializers()`)
2. Deploys ERC1967Proxy pointing to implementation
3. Calls `initialize(baseRegistrar, owner)` on proxy
4. Calls `addController(deployer)` to register relayer as controller

**Output**: Copy the **proxy** address from `KiteWrapper (proxy):` line

### 1.3 Verify Controller Registration

```bash
# Verify relayer is registered as controller (CRITICAL — wrap() will revert otherwise)
cast call <WRAPPER_ADDRESS> \
  "controllers(address)(bool)" \
  <RELAYER_WALLET_ADDRESS> \
  --rpc-url https://rpc-testnet.gokite.ai/
# Must return: true

# Verify initialization (owner should be deployer)
cast call <WRAPPER_ADDRESS> \
  "owner()(address)" \
  --rpc-url https://rpc-testnet.gokite.ai/
# Must return: <RELAYER_WALLET_ADDRESS>
```

### 1.3 Verify Deployment

```bash
# Check contract code on testnet
cast code <WRAPPER_ADDRESS> --rpc-url https://rpc-testnet.gokite.ai/

# Should return bytecode (not 0x)
```

---

## Step 2: Update Configuration

### 2.1 Set Environment Variables

**Local dev (.env):**
```bash
WRAPPER_ADDRESS=<deployed-address>
RELAYER_PRIVATE_KEY=<controller-private-key>
NEXT_PUBLIC_CHAIN_ID=2368
```

**Staging Dokploy (via dashboard or API):**
```
WRAPPER_ADDRESS=<deployed-address>
RELAYER_PRIVATE_KEY=<controller-private-key>
DATABASE_SCHEMA=ponder_index  # Already set, verify
```

### 2.2 Update addresses.ts

**File**: `packages/contracts-abi/src/addresses.ts`

```typescript
export const addresses: Record<number, Addresses> = {
  2368: {
    registry: '0xb54a0D86d9059bC2db72BFfD1FAf6a87b9F0B036',
    baseRegistrar: '0x485cB7C9a8aC6fa4Cc60C489AE0221aFfdCC5841',
    reverseRegistrar: '0x442FEe8572F4314A45bA2D81e32Db91fCB079E2D',
    resolver: '0xfC69694BBd6b85Fd9b4aC5ddBD647b4f2196CC68',
    wrapper: '<DEPLOYED-ADDRESS>', // ← Update here
  },
  // ... mainnet addresses (Phase 6+)
};
```

**Commit & push:**
```bash
git add packages/contracts-abi/src/addresses.ts
git commit -m "config: testnet KiteWrapper address"
git push origin develop
```

---

## Step 3: Validate Relay Infrastructure

### 3.1 Test Nonce Issuance

**Prerequisites:**
- Staging web app running (localhost:3000 or staging.kiteid.xyz)
- User authenticated with SIWE session
- Wallet connected on testnet

**Manual test:**
```bash
# Get nonce (requires valid session auth)
curl -X GET https://api.staging.kiteid.xyz/v2/wrap/nonce \
  -H "Cookie: <session-cookie>"

# Expected response:
# { "nonce": "0x...", "expiresAt": "2026-05-02T10:XX:XXZ" }
```

### 3.2 Test Relay Endpoint

**Dry run (no actual signature):**
```bash
# POST to relay (will fail without valid signature, but endpoint should respond)
curl -X POST https://api.staging.kiteid.xyz/v2/wrap/relay \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{
    "action": "wrap",
    "params": {"node": "0x...", "tokenId": "123", "owner": "0x...", "fuses": "0", "expiry": "1234567890"},
    "signer": "0x...",
    "nonce": "0x...",
    "deadline": 1234567890,
    "signature": "0xinvalid"
  }'

# Expected: 401 "Invalid signature" (not 500 server error)
```

---

## Step 4: End-to-End Relay Test

### 4.1 Setup

1. **Fund test wallet** (~0.5 KITE minimum):
   - Visit faucet: https://faucet.gokite.ai/ or equivalent
   - Request 0.5 KITE to testnet wallet address
   - Wait for confirmation

2. **Register test name**:
   - Open https://staging.kiteid.xyz/register/testname
   - Complete commit-reveal-register flow
   - Name should be owned by your wallet after grace period

3. **Open name detail page**:
   - https://staging.kiteid.xyz/names/testname
   - Verify "Wrap to V2" button visible

### 4.2 Execute Wrap Flow

1. **Click "Wrap to V2"** button
2. **Select fuses** (default 0 is fine)
3. **Confirm preview** (should show gas estimate from `/api/v2/wrap/preview`)
4. **Review settings** and click "Sign with Wallet"
5. **Sign EIP-712 message** in wallet
6. **Monitor**:
   - Dialog should show "Wrapping name..." spinner
   - After ~10-30 seconds: "Wrapping name success" + txHash
   - Click txHash to verify on block explorer

### 4.3 Verify On-Chain & Indexer

**Check contract state:**
```bash
cast call <WRAPPER_ADDRESS> \
  "getExpiry(bytes32)" <NODE_HASH> \
  --rpc-url https://rpc-testnet.gokite.ai/

# Should return non-zero expiry timestamp
```

**Check Ponder indexer:**
- Open Ponder dashboard (if available, or check Postgres directly)
- Query: `SELECT * FROM ponder_index.wrapped_names WHERE node = '<NODE>'`
- Should show: owner, fuses, expiry, wrapped_at, tx_hash

---

## Step 5: Regression Tests

### 5.1 Nonce Replay Prevention

**Scenario**: Use same nonce twice

```bash
# 1. Get nonce + sign wrap
curl -X GET /v2/wrap/nonce → { "nonce": "0xabc..." }
# Sign and relay successfully → { "txHash": "0x..." }

# 2. Try same nonce again immediately
curl -X POST /v2/wrap/relay \
  -d '{ ..., "nonce": "0xabc...", ... }'

# Expected: 409 "Invalid or expired nonce"
```

### 5.2 Owner Mismatch Rejection

**Scenario**: params.owner != session wallet

```bash
curl -X POST /v2/wrap/relay \
  -d '{
    ...,
    "signer": "0xAlice",
    "params": { ..., "owner": "0xBob" },
    ...
  }'

# Expected: 401 "Owner must match authorized wallet"
```

### 5.3 Expired Deadline

**Scenario**: deadline < now()

```bash
curl -X POST /v2/wrap/relay \
  -d '{
    ...,
    "deadline": 1234567890  # Past timestamp
  }'

# Expected: 400 "Deadline has passed"
```

---

## Monitoring & Troubleshooting

### Logs to Check

**API relay logs:**
```bash
# Dokploy container logs
docker logs <api-container> | grep -i relay

# Look for:
# - "Relay error:" → signature/nonce/validation issues
# - "relayerWalletClient.writeContract called" → on-chain broadcast
# - "txHash": → successful relay
```

**Ponder indexer logs:**
```bash
docker logs <indexer-container> | grep -i "wrapped\|wrapper"

# Should show NameWrapped event processing
```

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "Relayer not configured" (503) | RELAYER_PRIVATE_KEY not set | Set env var, restart API |
| "Invalid signature" (401) | EIP-712 domain/types mismatch | Verify getWrapDomain, WRAP_REQUEST_TYPES |
| "KiteWrapper not deployed" (400) | WRAPPER_ADDRESS is 0x0 or invalid | Deploy contract, update addresses.ts |
| txHash doesn't appear on chain | Gas too low or relayer wallet empty | Check relayer wallet balance, increase gas |
| Ponder doesn't index event | Wrong DATABASE_SCHEMA | Set to `ponder_index`, restart indexer |
| WCAG a11y test fails | Scroll label contrast | Fixed in 76346d6 (text-stone-700) |

---

## Success Criteria

- [x] KiteWrapper deployed to testnet (known address)
- [ ] `/v2/wrap/nonce` returns valid nonce with 5-min TTL
- [ ] `/v2/wrap/relay` accepts valid signature + broadcasts tx
- [ ] On-chain: `getExpiry(node)` returns non-zero after wrap
- [ ] Ponder: NameWrapped event indexed in `wrapped_names` table
- [ ] Nonce replay → 409 (single-use enforced)
- [ ] Owner mismatch → 401 (grief prevention works)
- [ ] E2E flow: sign → relay → on-chain → indexed in <60s

---

## Next Steps (Phase 6d+)

- Trustless on-chain signature verification (`wrapWithSig` function)
- Nonce storage in contract (mapping instead of DB)
- ERC-2771 meta-transaction forwarder
- Mainnet deployment checklist

