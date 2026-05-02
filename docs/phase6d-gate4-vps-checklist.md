# Phase 6d Gate 4: Dokploy VPS Environment Sync

**Status**: Ready for manual VPS deployment  
**Date**: 2026-05-02  
**Docker Image**: ✅ Available (0880b07 commit)  

---

## VPS Access

```bash
ssh -i ~/.ssh/talaria root@95.216.142.116
```

---

## Dokploy Environment Synchronization

For each of 3 applications (API, Indexer, Workers), update environment variables in Dokploy dashboard:

### 1. API Application

**Find in Dokploy:**
- Applications → API → Settings → Environment Variables

**Required variables:**

| Key | Value | Notes |
|-----|-------|-------|
| `WRAPPER_ADDRESS` | `0x3e45e568530763fa8f00b50b0106f63d2e6d84e5` | Testnet KiteWrapper deploy address |
| `RELAYER_PRIVATE_KEY` | (existing) | Verify already set, do not change |
| `KITE_TESTNET_RPC_URL` | `https://rpc-testnet.gokite.ai/` | Verify correct |
| `NEXT_PUBLIC_CHAIN_ID` | `2368` | Verify correct |

**After update:** Save and trigger redeploy

---

### 2. Indexer Application

**Find in Dokploy:**
- Applications → Indexer → Settings → Environment Variables

**Required variables:**

| Key | Value | Notes |
|-----|-------|-------|
| `WRAPPER_ADDRESS` | `0x3e45e568530763fa8f00b50b0106f63d2e6d84e5` | Testnet KiteWrapper deploy address |
| `DATABASE_SCHEMA` | `ponder_index` | **CRITICAL**: Must be set (Ponder event indexing) |
| `KITE_TESTNET_RPC_URL` | `https://rpc-testnet.gokite.ai/` | Verify correct |
| `NEXT_PUBLIC_CHAIN_ID` | `2368` | Verify correct |

**After update:** Save and trigger redeploy

**⚠️ Verify DATABASE_SCHEMA is set** - without it, Ponder won't index NameWrapped events

---

### 3. Workers Application

**Find in Dokploy:**
- Applications → Workers → Settings → Environment Variables

**Required variables:**

| Key | Value | Notes |
|-----|-------|-------|
| `WRAPPER_ADDRESS` | `0x3e45e568530763fa8f00b50b0106f63d2e6d84e5` | Testnet KiteWrapper deploy address |
| `RELAYER_PRIVATE_KEY` | (existing) | Verify already set |
| `KITE_TESTNET_RPC_URL` | `https://rpc-testnet.gokite.ai/` | Verify correct |

**After update:** Save and trigger redeploy

---

## Deployment Order

1. **API** (first — relay endpoints must be live)
2. **Indexer** (second — Ponder indexing)
3. **Workers** (third — async jobs)

---

## Post-Deployment Smoke Tests

After all 3 apps are deployed and healthy:

### Test 1: Wrap Preview (No Auth)

```bash
curl -X POST https://api.staging.kiteid.xyz/v2/wrap/preview \
  -H "Content-Type: application/json" \
  -d '{
    "node": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "owner": "0x1234567890123456789012345678901234567890",
    "fuses": "0",
    "duration": 31536000
  }'
```

**Expected Response:**
```json
{
  "node": "0xaa...",
  "owner": "0x12...",
  "fuses": "0",
  "duration": 31536000,
  "gasEstimate": {
    "wrap": "150000",
    "unwrap": "100000",
    ...
  },
  "wrapperAddress": "0x3e45e568530763fa8f00b50b0106f63d2e6d84e5",
  "wrapperNotDeployed": false
}
```

✅ **Check:** `wrapperNotDeployed` must be `false` (contract deployed)

---

### Test 2: Nonce Issuance (With Auth)

```bash
# After SIWE login, get session cookie
SESSION_COOKIE="..."

curl -X GET https://api.staging.kiteid.xyz/v2/wrap/nonce \
  -H "Cookie: $SESSION_COOKIE"
```

**Expected Response:**
```json
{
  "nonce": "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "expiresAt": "2026-05-02T10:10:30.000Z"
}
```

✅ **Check:** Nonce is 66-char hex (0x + 64 hex), expiresAt is ~5 min in future

---

### Test 3: Health Checks

```bash
# API health
curl -s https://api.staging.kiteid.xyz/health | jq .

# Indexer health (Ponder)
curl -s https://indexer.staging.kiteid.xyz/health | jq .

# Web
curl -s -I https://staging.kiteid.xyz/ | head -3
```

**All should return 200 OK**

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| wrapperNotDeployed: true | WRAPPER_ADDRESS not set or wrong | Check API env var, redeploy |
| /nonce returns 401 | Session auth not working | Check SIWE setup, re-login |
| /nonce returns 500 | Database connection error | Check DATABASE_URL in API, restart |
| Ponder doesn't index | DATABASE_SCHEMA not set | Set DATABASE_SCHEMA=ponder_index in indexer, restart |
| Health checks fail | Services not restarted | Trigger redeploy for failing app |

---

## Checklist

- [ ] API: WRAPPER_ADDRESS set ✓
- [ ] API: RELAYER_PRIVATE_KEY verified ✓
- [ ] API: Deployed ✓
- [ ] Indexer: WRAPPER_ADDRESS set ✓
- [ ] Indexer: DATABASE_SCHEMA set ✓
- [ ] Indexer: Deployed ✓
- [ ] Workers: WRAPPER_ADDRESS set ✓
- [ ] Workers: Deployed ✓
- [ ] Preview endpoint: wrapperNotDeployed false ✓
- [ ] Nonce endpoint: Returns valid nonce ✓
- [ ] Health checks: All 200 ✓

**Once all checked:** Proceed to Gate 5 (E2E Runtime Proof)

