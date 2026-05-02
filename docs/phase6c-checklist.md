# Phase 6c Testnet Deployment Checklist

**Date Started**: 2026-05-02  
**Target**: KiteWrapper testnet deploy + E2E relay flow validation  

---

## 🔧 Pre-Deployment (Local)

- [ ] `pnpm build` passes (packages/contracts)
- [ ] `echo $RELAYER_PRIVATE_KEY` → private key visible
- [ ] Test RPC reachable: `curl https://rpc-testnet.gokite.ai/ -d '{"jsonrpc":"2.0","method":"eth_chainId"}'`
- [ ] Git status clean: `git status` → no uncommitted changes
- [ ] Branch: `git branch | grep develop` → on develop (76346d6)

---

## 🚀 Deploy Contract

- [ ] Run forge create command (see deployment guide Step 1.2)
- [ ] Copy deployed address from output → `WRAPPER_ADDRESS=0x...`
- [ ] Verify on chain: `cast code <ADDRESS> --rpc-url https://rpc-testnet.gokite.ai/`
- [ ] Should return bytecode (not 0x)

---

## ⚙️ Update Config

### Local

- [ ] Set `WRAPPER_ADDRESS=0x...` in `.env`
- [ ] Set `RELAYER_PRIVATE_KEY=<key>` in `.env`
- [ ] Set `NEXT_PUBLIC_CHAIN_ID=2368` in `.env`

### Staging (Dokploy Dashboard)

- [ ] Navigate to API app settings
- [ ] Set `WRAPPER_ADDRESS=0x...`
- [ ] Set `RELAYER_PRIVATE_KEY=<key>` (already set?)
- [ ] Verify `DATABASE_SCHEMA=ponder_index` exists
- [ ] Click Deploy / Restart API container

### Code

- [ ] Update `packages/contracts-abi/src/addresses.ts` (wrapper field)
- [ ] `git add packages/contracts-abi/src/addresses.ts`
- [ ] `git commit -m "config: testnet KiteWrapper address"`
- [ ] `git push origin develop`
- [ ] Wait for CI/CD to complete (Docker build, deploy staging)

---

## ✅ Validate Relay Infrastructure

### Nonce Endpoint

- [ ] Call `/v2/wrap/nonce` (requires session auth)
- [ ] Response: `{ "nonce": "0x...", "expiresAt": "2026-05-02T..." }`
- [ ] Nonce is 66 chars (0x + 64 hex)
- [ ] expiresAt is ~5 min in future

### Relay Endpoint (Invalid Signature Test)

- [ ] Call `/v2/wrap/relay` with invalid signature
- [ ] Response: 401 "Invalid signature" (not 500, not 503)
- [ ] Confirms endpoint is live and validates signatures

---

## 🧪 Fund & Prepare Test

- [ ] Wallet has testnet funds (≥ 0.5 KITE)
- [ ] Registered test name (e.g., "testname.kite") on testnet
- [ ] Name is fully owned (past grace period if needed)
- [ ] Wallet connected to staging app

---

## 📋 E2E Wrap Flow

1. **Navigate to name detail**: https://staging.kiteid.xyz/names/testname

2. **Open WrapDialog**:
   - [ ] "Wrap to V2" button visible
   - [ ] Click button → dialog opens

3. **Select Fuses**:
   - [ ] Step: "select"
   - [ ] Choose fuses (default 0 OK)
   - [ ] Click "Continue" → preview loads

4. **Confirm Preview**:
   - [ ] Step: "preview"
   - [ ] Gas estimate shown (150000 gas)
   - [ ] Click "Continue" → confirm step

5. **Review Settings**:
   - [ ] Step: "confirm"
   - [ ] Node hash displayed (0x...)
   - [ ] Fuses shown as binary
   - [ ] Click "Sign with Wallet"

6. **Sign & Relay**:
   - [ ] Wallet opens → EIP-712 message prompt
   - [ ] Sign message → signature returned
   - [ ] Dialog shows "Wrapping name..." spinner
   - [ ] Step: "pending"

7. **Success**:
   - [ ] Spinner completes (10-30 sec)
   - [ ] txHash appears (0x...)
   - [ ] Step: "done"
   - [ ] Close button visible

---

## 🔍 Post-Wrap Verification

### On-Chain

```bash
# Get node hash for "testname.kite"
NODE_HASH=$(node -e "console.log(require('@kiteid/sdk').namehash('testname.kite'))")

# Check wrapper state
cast call <WRAPPER_ADDRESS> \
  "getExpiry(bytes32)" $NODE_HASH \
  --rpc-url https://rpc-testnet.gokite.ai/

# Expected: Non-zero timestamp (e.g., 1234567890)
```

- [ ] getExpiry returns non-zero value
- [ ] Timestamp is ~1 year in future (+ 31536000 sec)

### Indexer (Ponder)

```bash
# SSH into indexer container or query Postgres
psql -h localhost -U postgres -d kite_prod -c \
  "SELECT node, owner, expiry, tx_hash FROM ponder_index.wrapped_names WHERE node = '$NODE_HASH' LIMIT 1;"

# Expected: Row with your owner address, future expiry, tx_hash from step 6
```

- [ ] wrapped_names table contains entry
- [ ] owner matches your wallet
- [ ] tx_hash matches dialog txHash
- [ ] expiry is in future

---

## 🚨 Regression Tests

### Nonce Replay (409 Expected)

```bash
# Re-use same nonce immediately
# (See deployment guide Section 5.1 for exact curl command)
```

- [ ] Second relay attempt → 409 "Invalid or expired nonce"
- [ ] Nonce single-use enforced ✓

### Owner Mismatch (401 Expected)

```bash
# Relay with signer=0xAlice but params.owner=0xBob
# (See deployment guide Section 5.2)
```

- [ ] Relay rejected → 401 "Owner must match authorized wallet"
- [ ] Grief prevention working ✓

### Expired Deadline (400 Expected)

```bash
# Relay with deadline = timestamp in past
# (See deployment guide Section 5.3)
```

- [ ] Relay rejected → 400 "Deadline has passed"
- [ ] Deadline validation working ✓

---

## 📊 Logs to Monitor

### API Container

```bash
docker logs <api-container> | tail -50 | grep -i relay
```

Expected patterns:
- [ ] "relayerWalletClient.writeContract" → on-chain broadcast
- [ ] "txHash": "0x..." → relay successful
- No "Relay error:" (unless testing error cases)

### Indexer Container

```bash
docker logs <indexer-container> | tail -50 | grep -i wrapped
```

Expected patterns:
- [ ] "NameWrapped event" or similar
- [ ] No "Failed to process event"

---

## ✨ Success Criteria (All Must Pass)

- [ ] Nonce → valid, 5-min TTL
- [ ] Relay endpoint → responds (401 on bad sig)
- [ ] E2E flow → sign → relay → txHash returned
- [ ] On-chain → getExpiry() returns non-zero
- [ ] Ponder → wrapped_names row indexed
- [ ] Nonce replay → 409
- [ ] Owner mismatch → 401
- [ ] Expired deadline → 400
- [ ] No "Relayer not configured" (503)
- [ ] No "KiteWrapper not deployed" (400)

---

## 🎯 Next Phase (6d)

- [ ] Trustless on-chain verification (`wrapWithSig`)
- [ ] Contract-stored nonces
- [ ] Mainnet deployment plan

---

## 📝 Notes

**Time Estimate**: 1-2 hours (contract deploy + E2E validation)  
**Risk**: Low (non-destructive, testnet only)  
**Rollback**: Delete WRAPPER_ADDRESS, re-deploy if needed  

**Contacts**:  
- Kite Testnet Faucet: https://faucet.gokite.ai/  
- RPC: https://rpc-testnet.gokite.ai/  
- Explorer: https://testnet.kitescan.ai/  

