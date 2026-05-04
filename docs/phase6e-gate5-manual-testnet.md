# Phase 6e Gate 5: Manual Testnet Runtime Proof

**Objective**: Validate the complete wrap flow on testnet: SIWE → nonce → EIP-712 sign → relay → on-chain → Ponder indexing

**Prerequisites**:
- [ ] Testnet wallet (MetaMask or RainbowKit compatible)
- [ ] Testnet KITE balance: ≥ 10 KITE (5 for name + 5+ for wrap test)
- [ ] Faucet access (testnet KITE can be obtained at: https://faucet.gokite.ai/ or contact team)
- [ ] staging.kiteid.xyz deployed and green
- [ ] Browser dev tools (F12) for console logs and network inspection

---

## Pre-Test 0: Verify KiteWrapper On-Chain Setup (CRITICAL)

Before running any test, verify the KiteWrapper contract is correctly initialized and the relayer is registered as controller. Without this, wrap() will always revert with `CallerNotController`.

```bash
WRAPPER_ADDRESS="0x3e45e568530763fa8f00b50b0106f63d2e6d84e5"
RPC="https://rpc-testnet.gokite.ai/"

# 1. Verify contract is deployed (should return bytecode)
cast code $WRAPPER_ADDRESS --rpc-url $RPC | wc -c
# > 100 means deployed; "0x" means not deployed

# 2. Verify owner is set (not zero address)
cast call $WRAPPER_ADDRESS "owner()(address)" --rpc-url $RPC
# Should return: your relayer wallet address (non-zero)

# 3. Verify relayer wallet IS a controller
cast call $WRAPPER_ADDRESS \
  "controllers(address)(bool)" \
  <RELAYER_WALLET_ADDRESS> \
  --rpc-url $RPC
# MUST return: true
# If false: call addController(relayerAddress) as contract owner first
```

**If relayer is not a controller:**
```bash
# Add relayer as controller (must run as contract owner)
cast send $WRAPPER_ADDRESS \
  "addController(address)" \
  <RELAYER_WALLET_ADDRESS> \
  --rpc-url $RPC \
  --private-key $RELAYER_PRIVATE_KEY
# Should succeed; verify with step 3 above
```

**Only proceed to Test 1 after verifying controller = true.**

---

## Test 1: SIWE Session → Nonce Issuance

### Steps

1. **Connect Wallet**
   ```
   Navigate to https://staging.kiteid.xyz
   Click "Connect Wallet" button
   Select testnet from chain switcher (if needed)
   Sign SIWE message in wallet popup
   Verify session cookie set in browser
   ```

2. **Verify Nonce Endpoint**
   ```
   Open Browser DevTools → Console
   Run: await fetch('/api/v2/wrap/nonce').then(r => r.json())
   
   Expected response:
   {
     "nonce": "0x..." (66-char hex),
     "expiresAt": "2026-05-02T14:30:00Z" (300s from now)
   }
   ```

### Pass Criteria
- [ ] SIWE signature requested by wallet
- [ ] Session cookie appears in Application → Cookies
- [ ] `/api/v2/wrap/nonce` returns 200 with valid 66-char hex nonce
- [ ] `expiresAt` is within 300s of current time

**If fails**: Check staging API logs (`docker logs kiteid-api`) for 401 or signature errors

---

## Test 2: Register Disposable Test Name

### Steps

1. **Generate Test Name**
   ```
   Navigate to: https://staging.kiteid.xyz/register/test-mainnet-<TIMESTAMP>
   Example: https://staging.kiteid.xyz/register/test-mainnet-1714767000
   ```

2. **Commit Phase**
   ```
   Click "Register" button
   Sign transaction in wallet (commit hash)
   Wait for confirmation (≤12s on testnet)
   Verify "Commit" status shows checkmark
   Copy txHash from UI for records
   ```

3. **Reveal Phase** (after 1 block)
   ```
   Wait ~3-6 seconds (testnet block time)
   Click "Reveal" button (should appear after 1 block)
   Sign transaction in wallet (name reveal)
   Wait for confirmation
   Verify "Registered" status with checkmark
   Copy txHash
   ```

### Pass Criteria
- [ ] Commit tx appears on-chain (check testnet explorer)
- [ ] Reveal tx appears on-chain
- [ ] Name shows in `/names` page with "Registered" status
- [ ] UI displays no errors

**If fails**: 
- Check wallet balance (≥ 5 KITE)
- Check testnet explorer for revert reasons
- Check browser console for JS errors

---

## Test 3: Get Nonce + Sign EIP-712

### Steps

1. **Get Fresh Nonce**
   ```
   const nonce = await fetch('/api/v2/wrap/nonce')
     .then(r => r.json())
     .then(j => j.nonce);
   console.log('Nonce:', nonce);
   ```

2. **Open Wrap Dialog**
   ```
   Navigate back to: https://staging.kiteid.xyz/names
   Find the test name registered in Test 2
   Click "Wrap" button on that name
   Dialog should open with wrap confirmation
   ```

3. **Sign EIP-712 Message**
   ```
   Click "Sign & Relay" or "Wrap" button in dialog
   Wallet prompts for EIP-712 signature (NOT simple transaction)
   Inspect signature in DevTools → Network tab
   Look for POST to /api/v2/wrap/relay with signature in body
   Verify message includes:
     - signer: <your-wallet-address>
     - nonce: <from-step-1>
     - deadline: <timestamp 280s from now>
   ```

4. **Verify Relay Response**
   ```
   Check Network tab → Response from /api/v2/wrap/relay
   Expected 200 response:
   {
     "txHash": "0x..." (66-char hex)
   }
   Copy txHash for on-chain verification
   ```

### Pass Criteria
- [ ] EIP-712 signature requested (not simple tx)
- [ ] POST to /api/v2/wrap/relay succeeds (200 OK)
- [ ] Response includes valid txHash
- [ ] No 401/409/400 errors

**If fails**:
- 401: Check wallet session still active (reconnect if needed)
- 409: Nonce already used (get fresh nonce, try again)
- 400: Deadline expired (get fresh nonce with deadline > 280s)
- Other: Check browser console + `/api/diagnose` endpoint for errors

---

## Test 4: On-Chain Wrap Verification

### Steps

1. **Wait for Confirmation**
   ```
   Take txHash from Test 3
   Wait 2-6 seconds (max 2 blocks on testnet)
   ```

2. **Verify On-Chain**
   ```
   Open: https://kitescan.ai/ (testnet explorer)
   Search for txHash from Test 3
   Should show successful transaction
   Check transaction details:
     - To: KiteWrapper contract (0x3e45e568530763fa8f00b50b0106f63d2e6d84e5)
     - Function: wrap(...)
     - Status: Success (checkmark)
   ```

3. **Verify Wrapped NFT**
   ```
   In wrap dialog, click "View NFT" or similar
   Should show NFT is now wrapped (ownership transferred to wrapper)
   Name shows "Wrapped" indicator or similar
   ```

4. **Check Contract State**
   ```
   Via cast (CLI):
   cast call 0x3e45e568530763fa8f00b50b0106f63d2e6d84e5 \
     "getExpiry(bytes32)" <name-node-hash> \
     --rpc-url https://rpc-testnet.gokite.ai/
   
   Should return > 0 (expiry timestamp)
   ```

### Pass Criteria
- [ ] txHash appears on testnet explorer
- [ ] Transaction status is "Success"
- [ ] Function call is to KiteWrapper.wrap()
- [ ] getExpiry() returns > 0 (wrapped state confirmed on-chain)

**If fails**:
- Failed tx: Check testnet explorer "Revert" reason (signature invalid, nonce used, etc.)
- Not found: Wait longer (up to 12 blocks = ~12s)
- getExpiry() = 0: Name not actually wrapped (check call params)

---

## Test 5: Ponder Indexing + Activity Feed

### Steps

1. **Wait for Indexing**
   ```
   Testnet has ~1-2s block time
   Wait ~12 blocks (~12s) for Ponder to index event
   ```

2. **Check Activity Feed** (On `/names` page)
   ```
   Scroll to Activity section
   Should see event like:
   "NameWrapped - test-mainnet-<TIMESTAMP>"
   Timestamp should be ≤ 20s ago
   Click event to see details
   ```

3. **Verify Ponder Database** (if access available)
   ```
   SELECT * FROM wrapped_names WHERE node = <name-node>;
   Should return one row with:
     - node: <calculated-node-hash>
     - owner: <your-wallet>
     - expiry: <timestamp>
     - wrapper_address: 0x3e45e568530763fa8f00b50b0106f63d2e6d84e5
   ```

### Pass Criteria
- [ ] Activity feed shows NameWrapped event within 30s
- [ ] Event shows correct name and timestamp
- [ ] Ponder database has wrapped_names row (if accessible)

**If fails**:
- Check Ponder logs: `docker logs kiteid-indexer`
- Verify indexer is synced: `docker exec kiteid-indexer curl localhost:42069/health`
- Check event was emitted: Verify on testnet explorer ✓
- Check database: `psql ... -c "SELECT COUNT(*) FROM wrapped_names;"`

---

## Test 6: Regression Tests (with Auth)

These require testing with authenticated session to validate business logic (not just auth layer).

### 6a: Nonce Replay → 409 Conflict

**Steps**:
1. Get nonce N1: `/api/v2/wrap/nonce` → `{ "nonce": "0x..." }`
2. Sign + relay with N1: POST `/api/v2/wrap/relay` → 200 { txHash }
3. Try same nonce N1 again: POST `/api/v2/wrap/relay` → **EXPECTED: 409 Conflict**

**Pass**: Second relay returns 409 (nonce already used)  
**Fail**: Returns 200 again or different error

### 6b: Owner Mismatch → Signature Validation

**Steps**:
1. Get nonce: `/api/v2/wrap/nonce`
2. Sign EIP-712 with incorrect owner address (not your wallet)
3. Post signed request to `/api/v2/wrap/relay`
4. **EXPECTED: 401 Unauthorized** (signature doesn't match signer address)

**Pass**: Request rejected with clear signature error  
**Fail**: Request succeeds or generic auth error

### 6c: Expired Deadline → 400 Bad Request

**Steps**:
1. Get nonce with deadline D (300s from now)
2. Wait 310s (deadline expires)
3. Sign + relay with expired deadline
4. **EXPECTED: 400 Bad Request** (deadline in past)

**Pass**: Request rejected with deadline error  
**Fail**: Request succeeds or different error

**If any fail**:
- Check API implementation: `packages/api/src/routes/wrapper.ts`
- Verify nonce checking: lines ~100-120
- Verify deadline validation: lines ~85-95
- Check signature verification: lines ~125-135

---

## Summary Checklist

Mark each test as PASS ✅ or FAIL ❌:

- [ ] **Test 1**: SIWE Session + Nonce 200 OK
- [ ] **Test 2**: Register test name (commit + reveal)
- [ ] **Test 3**: EIP-712 sign + relay txHash returned
- [ ] **Test 4**: On-chain getExpiry > 0 confirmed
- [ ] **Test 5**: Ponder wrapped_names row + activity feed event
- [ ] **Test 6a**: Nonce replay → 409 with auth
- [ ] **Test 6b**: Owner mismatch → signature validation error
- [ ] **Test 6c**: Expired deadline → 400 with auth

**Gate 5 Status**:
- **PASS**: All 8 tests ✅ → Gate 5 complete, proceed to Phase 6d
- **FAIL**: Any test ❌ → Debug, fix, re-run until all PASS

---

## Troubleshooting

### "Nonce endpoint returns 401"
- Check session: Are you SIWE-authenticated?
- Reconnect wallet if session expired
- Check API logs: `docker logs kiteid-api | grep nonce`

### "Relay returns 401"
- Session may have expired between nonce request and relay
- Reconnect wallet
- Check session cookie still present

### "Relay returns 409"
- You've already used this nonce
- Get a fresh nonce and try again
- Check you're not hitting rate limit (10 req/min)

### "Relay returns 400 or 500"
- Check deadline: is it within 300s of nonce issuance?
- Check signature: did you use the correct typed data?
- Check params: node, tokenId, owner, fuses, expiry all present?
- Check API logs for stack trace

### "On-chain tx failed"
- Check testnet explorer "Revert Reason"
- Common: "Only controller", "Invalid nonce", "Signature invalid"
- Check: Is RELAYER_PRIVATE_KEY set correctly? Is controller registered?

### "Ponder not indexing"
- Check indexer health: curl https://api.staging.kiteid.xyz/api/diagnose
- Check Ponder synced to current block: `docker logs kiteid-indexer | tail -20`
- Check wrapped_names table exists: `psql ... -c "\dt wrapped_names"`
- Indexer may need restart if stuck

---

**Completion**: Once all 8 tests pass, update documentation to mark Gate 5 complete and proceed to Phase 6d mainnet deployment.

**Last Updated**: 2026-05-02
