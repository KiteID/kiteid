# Phase 6c: EIP-712 Relay Test Cases

Comprehensive test scenarios for `/v2/wrap/nonce` and `/v2/wrap/relay` endpoints.

---

## Overview

The relay infrastructure uses server-issued nonces and EIP-712 signed messages to allow users to wrap/unwrap names without holding the controller wallet's private key. This document outlines all test cases required to validate the relay before mainnet deployment.

### Key Invariants
- **Nonce single-use**: Each nonce can be consumed exactly once per wallet address
- **Deadline validation**: Relay requests must have deadline > now()
- **Owner validation**: `params.owner` must match the authenticated wallet to prevent grief wrapping
- **Signature verification**: EIP-712 typed data signature must be valid for the wallet and message
- **Atomic nonce consumption**: No race conditions in nonce state transitions

---

## GET /v2/wrap/nonce

### Test Case 1: Nonce Without Authentication
**Scenario**: User calls `/v2/wrap/nonce` without valid session

**Expected Response**: 401 Unauthorized
```json
{ "error": "Unauthorized" }
```

**Implementation Check**:
- `requireAuth()` middleware is enforced on route
- Request without valid session cookie is rejected immediately

---

### Test Case 2: Nonce With No Primary Wallet
**Scenario**: Authenticated user has no primary wallet registered

**Setup**:
1. User is authenticated (session exists)
2. User has no wallet addresses in DB or no primary wallet set

**Expected Response**: 400 Bad Request
```json
{ "error": "No primary wallet found" }
```

**Implementation Check**:
- DB query: `walletAddresses.findFirst({ userId, isPrimary: true })` returns null
- Error is caught and returned before nonce generation

---

### Test Case 3: Valid Nonce Issuance
**Scenario**: Authenticated user with primary wallet requests nonce

**Setup**:
1. User authenticated with session
2. User has primary wallet: `0x1234567890123456789012345678901234567890`

**Expected Response**: 200 OK
```json
{
  "nonce": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "expiresAt": "2026-05-02T10:10:30.000Z"
}
```

**Validation**:
- `nonce` is 66 characters: `0x` + 64 hex digits (32 bytes)
- `expiresAt` is ISO string, approximately 5 minutes in future
- Nonce is unique (cryptographic randomness via `randomBytes(32)`)

**Implementation Check**:
```ts
const address = getAddress(walletAddress.address);  // Checksum
const nonce = `0x${randomBytes(32).toString('hex')}`;  // 66 chars
const expiresAt = new Date(Date.now() + 300_000);   // 5 min

await db.insert(relayerNonces).values({ address, nonce, expiresAt });
```

**Database Verification**:
```sql
SELECT nonce, address, issued_at, expires_at, used_at
FROM relayer_nonces
WHERE address = '0x1234567890123456789012345678901234567890'
ORDER BY issued_at DESC
LIMIT 1;
```
- Should show newly issued nonce
- `issued_at` ≈ now
- `expires_at` ≈ now + 5 min
- `used_at` is NULL

---

## POST /v2/wrap/relay

### Common Test Payload Structure

Valid wrap request:
```json
{
  "action": "wrap",
  "params": {
    "node": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "tokenId": "123456789",
    "owner": "0x1234567890123456789012345678901234567890",
    "fuses": "7",
    "expiry": "1234567890"
  },
  "signer": "0x1234567890123456789012345678901234567890",
  "nonce": "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "deadline": 1700000000,
  "signature": "0xccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"
}
```

Valid unwrap request:
```json
{
  "action": "unwrap",
  "params": {
    "node": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "tokenId": "123456789",
    "owner": "0x1234567890123456789012345678901234567890"
  },
  "signer": "0x1234567890123456789012345678901234567890",
  "nonce": "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "deadline": 1700000000,
  "signature": "0xccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"
}
```

---

### Test Case 4: Relay Without Authentication
**Scenario**: User calls `/v2/wrap/relay` without valid session

**Expected Response**: 401 Unauthorized
```json
{ "error": "Unauthorized" }
```

---

### Test Case 5: Relay With Relayer Not Configured
**Scenario**: Authenticated user attempts relay, but `RELAYER_PRIVATE_KEY` env not set

**Setup**:
1. User authenticated
2. `relayerWalletClient` is undefined (no private key configured)

**Expected Response**: 503 Service Unavailable
```json
{ "error": "Relayer not configured" }
```

**Implementation Check**:
```ts
if (!relayerWalletClient) {
  return c.json({ error: 'Relayer not configured' }, 503);
}
```

---

### Test Case 6: Relay With KiteWrapper Not Deployed
**Scenario**: Authenticated user attempts relay, but wrapper contract not deployed to testnet

**Setup**:
1. User authenticated, relayer configured
2. `WRAPPER_ADDRESS` env is `0x0000000000000000000000000000000000000000` (not deployed)

**Expected Response**: 400 Bad Request
```json
{ "error": "KiteWrapper not deployed" }
```

---

### Test Case 7: Relay With Invalid Action
**Scenario**: User sends relay request with action != 'wrap' | 'unwrap'

**Payload**:
```json
{
  "action": "invalid",
  ...
}
```

**Expected Response**: 400 Bad Request
```json
{ "error": "Invalid action" }
```

---

### Test Case 8: Valid Wrap Relay
**Scenario**: User signs valid wrap request and relays successfully

**Setup**:
1. User authenticated with wallet `0xAlice`
2. Nonce was previously issued and not expired
3. Signature is valid for wrap message (signed with Alice's key)
4. `params.owner` = `0xAlice` (matches signer)

**Expected Relay Flow**:
```
User's browser:
  1. Gets nonce from /v2/wrap/nonce → "0xbbb..."
  2. Signs EIP-712 WrapRequest with domain (KiteWrapper, v1, chain 2368, wrapper address)
     - Message fields: signer, node, tokenId, owner, fuses, expiry, nonce, deadline
  3. Posts to /v2/wrap/relay with signature

API:
  1. Validates session wallet matches signer
  2. Validates owner matches session wallet
  3. Checks deadline > now()
  4. Atomically consumes nonce (UPDATE with all conditions)
  5. Verifies EIP-712 signature
  6. Calls relayerWalletClient.writeContract(wrap, args)
  7. Returns { txHash }

On-chain:
  1. KiteWrapper.wrap() executes with relayer as msg.sender
  2. Transaction succeeds, NameWrapped event emitted
  3. Ponder indexer processes event into wrapped_names table
```

**Expected Response**: 200 OK
```json
{
  "txHash": "0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd"
}
```

**Implementation Checks**:

1. Nonce consumption (atomic, no race condition):
```ts
const updateResult = await db
  .update(relayerNonces)
  .set({ usedAt: new Date() })
  .where(
    and(
      eq(relayerNonces.address, sessionWallet),
      eq(relayerNonces.nonce, nonce),
      gt(relayerNonces.expiresAt, new Date()),
      isNull(relayerNonces.usedAt),
    ),
  );

if (updateResult.rowCount === 0) {
  return c.json({ error: 'Invalid or expired nonce' }, 409);
}
```

2. Signature verification (EIP-712):
```ts
const recoveredSigner = await verifyRelaySignature(
  'WrapRequest',
  WRAP_REQUEST_TYPES,
  { signer, node, tokenId, owner, fuses, expiry, nonce, deadline },
  signature,
  domain,
);

if (!recoveredSigner || recoveredSigner !== signerAddress) {
  return c.json({ error: 'Invalid signature' }, 401);
}
```

3. WriteContract call:
```ts
const tokenId = BigInt(p.tokenId);
const fuses = BigInt(p.fuses);
const expiry = BigInt(p.expiry);

const txHash = await relayerWalletClient.writeContract({
  address: WRAPPER_ADDRESS,
  abi: KiteWrapperAbi,
  functionName: 'wrap',
  args: [p.node, tokenId, p.owner, fuses, expiry],
});
```

**Verification**:
```bash
# Check tx on-chain
cast receipt <txHash> --rpc-url https://rpc-testnet.gokite.ai/

# Check contract state
NODE_HASH=$(node -e "console.log(require('@kiteid/sdk').namehash('testname.kite'))")
cast call <WRAPPER_ADDRESS> "getExpiry(bytes32)" $NODE_HASH \
  --rpc-url https://rpc-testnet.gokite.ai/

# Check indexer
psql -h localhost -U postgres -d kite_prod -c \
  "SELECT * FROM ponder_index.wrapped_names WHERE node = '$NODE_HASH';"
```

---

### Test Case 9: Valid Unwrap Relay
**Scenario**: User signs and relays unwrap request

**Difference from wrap**:
- `params` does NOT include `fuses` or `expiry` (unwrap doesn't need them)
- `UNWRAP_REQUEST_TYPES` is used instead of `WRAP_REQUEST_TYPES`
- Contract function called is `unwrap(node, tokenId, owner)`

**Expected Response**: 200 OK with txHash

---

### Test Case 10: Nonce Replay Attack (Same Nonce Used Twice)
**Scenario**: User attempts to use the same nonce for two relay requests

**Setup**:
1. First relay request with nonce `0xbbb...` succeeds
2. Nonce is marked `usedAt = now()` in DB
3. Second relay request with same nonce `0xbbb...` is attempted

**Execution**:
```ts
// First relay
updateResult.rowCount === 1  // ✓ Nonce consumed

// Second relay attempt
updateResult.rowCount === 0  // ✗ WHERE isNull(usedAt) fails
```

**Expected Response**: 409 Conflict
```json
{ "error": "Invalid or expired nonce" }
```

**Verification**:
```bash
# Issue nonce
curl -s -X GET https://api.staging.kiteid.xyz/v2/wrap/nonce \
  -H "Cookie: <session>" | jq '.nonce'
# Response: "0xbbb..."

# First relay - succeeds
curl -s -X POST https://api.staging.kiteid.xyz/v2/wrap/relay \
  -H "Content-Type: application/json" \
  -H "Cookie: <session>" \
  -d '{"action":"wrap","params":{...},"signer":"0xAlice",...,"nonce":"0xbbb..."}' \
  | jq '.txHash'
# Response: "0xddd..."

# Second relay with same nonce - fails
curl -s -X POST https://api.staging.kiteid.xyz/v2/wrap/relay \
  -H "Content-Type: application/json" \
  -H "Cookie: <session>" \
  -d '{"action":"wrap","params":{...},"signer":"0xAlice",...,"nonce":"0xbbb..."}' \
  | jq '.error'
# Response: "Invalid or expired nonce"
```

---

### Test Case 11: Expired Nonce
**Scenario**: Nonce was issued 6+ minutes ago and is no longer valid

**Setup**:
1. Nonce issued at `T`
2. Current time is `T + 301 seconds` (past 5-minute TTL)
3. Relay request with expired nonce is attempted

**Execution**:
```ts
// DB condition: expiresAt > now()
// expiresAt = T + 300s
// now = T + 301s
// Condition fails
updateResult.rowCount === 0
```

**Expected Response**: 409 Conflict
```json
{ "error": "Invalid or expired nonce" }
```

---

### Test Case 12: Deadline in the Past
**Scenario**: User's relay request includes `deadline` that is in the past

**Setup**:
1. Now = `1700000100`
2. Relay request has `deadline: 1700000000` (100 seconds in past)

**Execution**:
```ts
const nowSeconds = Math.floor(Date.now() / 1000);  // 1700000100
if (deadline <= nowSeconds) {  // 1700000000 <= 1700000100 → true
  return c.json({ error: 'Deadline has passed' }, 400);
}
```

**Expected Response**: 400 Bad Request
```json
{ "error": "Deadline has passed" }
```

---

### Test Case 13: Signer Mismatch (Wallet Switching)
**Scenario**: User signs message as `0xAlice` but session is authenticated as `0xBob`

**Setup**:
1. Session wallet: `0xBob` (from SIWE authentication)
2. Relay request signer: `0xAlice` (in params)

**Execution**:
```ts
const sessionWallet = getAddress('0xBob');
const signerAddress = getAddress('0xAlice');

if (signerAddress !== sessionWallet) {
  return c.json({ error: 'Signer does not match session wallet' }, 401);
}
```

**Expected Response**: 401 Unauthorized
```json
{ "error": "Signer does not match session wallet" }
```

**Mitigation**: Frontend prevents this via wagmi hook (signer comes from current connected wallet)

---

### Test Case 14: Owner Mismatch (Grief Prevention)
**Scenario**: User signs relay with correct wallet but tries to wrap another wallet's name

**Setup**:
1. Session wallet: `0xAlice`
2. Signer: `0xAlice` (matches)
3. `params.owner`: `0xBob` (does NOT match)

**Execution**:
```ts
const sessionWallet = getAddress('0xAlice');
const paramsOwner = getAddress('0xBob');

if (paramsOwner !== sessionWallet) {
  return c.json({ error: 'Owner must match authorized wallet' }, 401);
}
```

**Expected Response**: 401 Unauthorized
```json
{ "error": "Owner must match authorized wallet" }
```

**Why This Matters**: Prevents Alice from submitting signed wraps to Bob's account, which would require Bob's payment but Alice's signature.

---

### Test Case 15: Invalid Signature
**Scenario**: User's EIP-712 signature is invalid or tampered with

**Setup**:
1. Message signed as: `{ signer: 0xAlice, node: 0xaa..., tokenId: 123, owner: 0xAlice, ... }`
2. Relay request modifies a param (e.g., tokenId: 456) but keeps original signature
3. OR: Signature is random/invalid hex

**Execution**:
```ts
const recoveredSigner = await verifyRelaySignature(
  'WrapRequest',
  WRAP_REQUEST_TYPES,
  { signer, node, tokenId, owner, fuses, expiry, nonce, deadline },
  signature,
  domain,
);

// Signature doesn't match modified params
if (!recoveredSigner || recoveredSigner !== signerAddress) {
  return c.json({ error: 'Invalid signature' }, 401);
}
```

**Expected Response**: 401 Unauthorized
```json
{ "error": "Invalid signature" }
```

**Implementation Check**:
- `viem.verifyTypedData()` recovers signer from signature
- If recovered address != request signer, signature is invalid
- Domain includes `chainId` and `verifyingContract` to prevent cross-chain/contract attacks

---

### Test Case 16: BigInt Serialization (String to BigInt Conversion)
**Scenario**: Verify that relay correctly converts string params to BigInts

**Setup**:
1. Frontend sends: `{ tokenId: "123456789", fuses: "7", expiry: "1234567890" }`
2. API receives as strings (JSON serialization)

**Execution**:
```ts
const p = params as any;
const tokenId = BigInt(p.tokenId);    // BigInt("123456789") → 123456789n
const fuses = BigInt(p.fuses);        // BigInt("7") → 7n
const expiry = BigInt(p.expiry);      // BigInt("1234567890") → 1234567890n

// Passed to contract via writeContract
args: [p.node, tokenId, p.owner, fuses, expiry]
```

**Verification**:
- Each converted value is type `bigint` (checked via `typeof`)
- Values match original string representations
- Contract receives correct numeric types (uint256, uint96, uint64)

---

### Test Case 17: EIP-712 Domain Configuration
**Scenario**: Verify that domain separator is correctly configured for signature verification

**Expected Domain** (chain 2368, wrapper address `0xc9c965f1d9fba0bD98c50B93B1Ce8f7aB53bBE93`):
```ts
{
  name: 'KiteWrapper',
  version: '1',
  chainId: 2368,
  verifyingContract: '0xc9c965f1d9fba0bD98c50B93B1Ce8f7aB53bBE93',
}
```

**Purpose**:
- Prevents signature replay on different contracts (different verifyingContract)
- Prevents signature replay on different chains (different chainId)
- Identifies the message format (name, version)

**Implementation Check**:
```ts
const domain = getWrapDomain(
  Number(process.env.NEXT_PUBLIC_CHAIN_ID || '2368'),
  WRAPPER_ADDRESS as `0x${string}`,
);
```

---

### Test Case 18: EIP-712 Types Verification
**Scenario**: Verify that WRAP_REQUEST_TYPES and UNWRAP_REQUEST_TYPES are correctly defined

**WRAP_REQUEST_TYPES** (8 fields):
```ts
{
  WrapRequest: [
    { name: 'signer', type: 'address' },
    { name: 'node', type: 'bytes32' },
    { name: 'tokenId', type: 'uint256' },
    { name: 'owner', type: 'address' },
    { name: 'fuses', type: 'uint96' },
    { name: 'expiry', type: 'uint64' },
    { name: 'nonce', type: 'bytes32' },
    { name: 'deadline', type: 'uint64' },
  ],
}
```

**UNWRAP_REQUEST_TYPES** (6 fields, no fuses/expiry):
```ts
{
  UnwrapRequest: [
    { name: 'signer', type: 'address' },
    { name: 'node', type: 'bytes32' },
    { name: 'tokenId', type: 'uint256' },
    { name: 'owner', type: 'address' },
    { name: 'nonce', type: 'bytes32' },
    { name: 'deadline', type: 'uint64' },
  ],
}
```

**Verification**:
- Wrap includes fuses (state change permissions) and expiry (token lifetime)
- Unwrap omits both (unwrap doesn't set these fields)
- All fields have correct Solidity types (address, bytes32, uint256, etc.)

---

## Testing Tools & Commands

### Using curl

```bash
# Set variables
SESSION_COOKIE="..."  # From SIWE login
WRAPPER_ADDRESS="0xc9c965f1d9fba0bD98c50B93B1Ce8f7aB53bBE93"
WALLET="0x1234567890123456789012345678901234567890"

# Test 1: Get nonce
curl -X GET https://api.staging.kiteid.xyz/v2/wrap/nonce \
  -H "Cookie: $SESSION_COOKIE" | jq .

# Test 2: Get nonce without auth (should fail)
curl -X GET https://api.staging.kiteid.xyz/v2/wrap/nonce | jq .

# Test 3: Relay with invalid signature (test error handling)
curl -X POST https://api.staging.kiteid.xyz/v2/wrap/relay \
  -H "Content-Type: application/json" \
  -H "Cookie: $SESSION_COOKIE" \
  -d '{
    "action": "wrap",
    "params": {"node": "0xaa...", "tokenId": "123", "owner": "'$WALLET'", "fuses": "0", "expiry": "1234567890"},
    "signer": "'$WALLET'",
    "nonce": "0xbb...",
    "deadline": 1700000000,
    "signature": "0xinvalid"
  }' | jq .
```

### Using Hono Test Client (for integration tests)

```ts
import { hoist } from 'hono/testing';
import { wrapperRouter } from './wrapper';

const app = hoist(wrapperRouter);

// Test nonce endpoint
const res = await app.request(
  new Request('http://localhost/nonce', {
    method: 'GET',
    headers: { Cookie: 'session=...' },
  }),
);
const json = await res.json();
expect(json).toHaveProperty('nonce');
```

---

## Success Criteria

All 18 test cases must pass before proceeding to mainnet:

✓ GET /nonce: 401 without auth, 400 no wallet, 200 valid nonce  
✓ POST /relay: 401 no auth, 503 no relayer, 400 no wrapper  
✓ POST /relay (wrap): 200 valid sig, txHash returned  
✓ POST /relay (unwrap): 200 valid sig, txHash returned  
✓ Nonce replay: 409 already used  
✓ Nonce expiry: 409 after 5+ min  
✓ Deadline validation: 400 if past  
✓ Signer mismatch: 401 if wallet != session  
✓ Owner mismatch: 401 if owner != signer (grief prevention)  
✓ Invalid signature: 401 if sig doesn't match message  
✓ BigInt serialization: strings converted to bigints  
✓ EIP-712 domain: correct chainId + verifyingContract  
✓ EIP-712 types: wrap has fuses/expiry, unwrap doesn't  

---

## Logs to Monitor

### API Container
```bash
docker logs <api-container> | grep -i relay
```

Look for:
- `"Relay error:"` → Indicates validation or broadcast failure
- `"relayerWalletClient.writeContract"` → On-chain broadcast started
- `"txHash": "0x..."` → Successful relay completion
- Error details should show which validation failed

### Indexer Container
```bash
docker logs <indexer-container> | grep -i "wrapped\|wrapper"
```

Look for:
- `"NameWrapped event"` processing
- `"Updated wrapped_names"` or similar indexing confirmation
- No `"Failed to process event"` errors

---

## Next Steps (Phase 6d)

Once all relay tests pass:
1. Deploy KiteWrapper to mainnet (Chain ID 2366)
2. Update `packages/contracts-abi/src/addresses.ts` for mainnet
3. Implement on-chain `wrapWithSig` for trustless verification (remove API dependency)
4. Migrate nonce storage to contract (mapping instead of DB)

