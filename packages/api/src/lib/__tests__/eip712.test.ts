import { privateKeyToAccount } from 'viem/accounts';
import { describe, expect, it } from 'vitest';
import {
  getWrapDomain,
  UNWRAP_REQUEST_TYPES,
  verifyRelaySignature,
  WRAP_REQUEST_TYPES,
} from '../eip712';

// Deterministic test account — DO NOT use for real funds
const TEST_PK = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
const TEST_ACCOUNT = privateKeyToAccount(TEST_PK);

const WRAPPER = '0x3e45e568530763fa8f00b50b0106f63d2e6d84e5' as `0x${string}`;
const NODE = `0x${'a'.repeat(64)}` as `0x${string}`;
const NONCE = `0x${'b'.repeat(64)}` as `0x${string}`;

describe('getWrapDomain', () => {
  it('returns domain with KiteWrapper name, version 1, chainId, verifyingContract', () => {
    const domain = getWrapDomain(2368, WRAPPER);
    expect(domain.name).toBe('KiteWrapper');
    expect(domain.version).toBe('1');
    expect(domain.chainId).toBe(2368);
    expect(domain.verifyingContract).toBe(WRAPPER);
  });

  it('uses different domain hash for mainnet vs testnet (different chainId)', () => {
    const testnet = getWrapDomain(2368, WRAPPER);
    const mainnet = getWrapDomain(2366, WRAPPER);
    expect(testnet.chainId).not.toBe(mainnet.chainId);
  });
});

describe('verifyRelaySignature - WrapRequest', () => {
  const domain = getWrapDomain(2368, WRAPPER);
  const buildMessage = (overrides: Partial<Record<string, unknown>> = {}) => ({
    signer: TEST_ACCOUNT.address,
    node: NODE,
    tokenId: 1234n,
    owner: TEST_ACCOUNT.address,
    fuses: 0n,
    expiry: 1735689600n,
    nonce: NONCE,
    deadline: 1735689600n,
    ...overrides,
  });

  it('returns signer address when signature is valid', async () => {
    const message = buildMessage();
    const signature = await TEST_ACCOUNT.signTypedData({
      domain,
      types: WRAP_REQUEST_TYPES,
      primaryType: 'WrapRequest',
      message,
    });

    const result = await verifyRelaySignature(
      'WrapRequest',
      WRAP_REQUEST_TYPES,
      message,
      signature,
      domain,
    );
    expect(result).toBe(TEST_ACCOUNT.address);
  });

  it('returns false when signature is from a different signer', async () => {
    const message = buildMessage();
    const otherAccount = privateKeyToAccount(
      '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
    );
    const signature = await otherAccount.signTypedData({
      domain,
      types: WRAP_REQUEST_TYPES,
      primaryType: 'WrapRequest',
      message: { ...message, signer: otherAccount.address },
    });

    // Verify against message claiming TEST_ACCOUNT signed it
    const result = await verifyRelaySignature(
      'WrapRequest',
      WRAP_REQUEST_TYPES,
      message,
      signature,
      domain,
    );
    expect(result).toBe(false);
  });

  it('returns false when message tampered after signing (tokenId)', async () => {
    const original = buildMessage();
    const signature = await TEST_ACCOUNT.signTypedData({
      domain,
      types: WRAP_REQUEST_TYPES,
      primaryType: 'WrapRequest',
      message: original,
    });

    // Attacker changes tokenId after signing
    const tampered = { ...original, tokenId: 9999n };
    const result = await verifyRelaySignature(
      'WrapRequest',
      WRAP_REQUEST_TYPES,
      tampered,
      signature,
      domain,
    );
    expect(result).toBe(false);
  });

  it('returns false when domain chainId differs (cross-chain replay)', async () => {
    const message = buildMessage();
    const signature = await TEST_ACCOUNT.signTypedData({
      domain,
      types: WRAP_REQUEST_TYPES,
      primaryType: 'WrapRequest',
      message,
    });

    const mainnetDomain = getWrapDomain(2366, WRAPPER);
    const result = await verifyRelaySignature(
      'WrapRequest',
      WRAP_REQUEST_TYPES,
      message,
      signature,
      mainnetDomain,
    );
    expect(result).toBe(false);
  });

  it('accepts string-encoded bigints from JSON body (tokenId, fuses, expiry)', async () => {
    const original = {
      signer: TEST_ACCOUNT.address,
      node: NODE,
      tokenId: 1234n,
      owner: TEST_ACCOUNT.address,
      fuses: 0n,
      expiry: 1735689600n,
      nonce: NONCE,
      deadline: 1735689600n,
    };
    const signature = await TEST_ACCOUNT.signTypedData({
      domain,
      types: WRAP_REQUEST_TYPES,
      primaryType: 'WrapRequest',
      message: original,
    });

    // Simulate API receiving JSON body where bigints arrive as strings
    const jsonStyle = {
      ...original,
      tokenId: '1234',
      fuses: '0',
      expiry: '1735689600',
    };
    const result = await verifyRelaySignature(
      'WrapRequest',
      WRAP_REQUEST_TYPES,
      jsonStyle,
      signature,
      domain,
    );
    expect(result).toBe(TEST_ACCOUNT.address);
  });
});

describe('verifyRelaySignature - UnwrapRequest', () => {
  const domain = getWrapDomain(2368, WRAPPER);

  it('returns signer address when valid unwrap signature provided', async () => {
    const message = {
      signer: TEST_ACCOUNT.address,
      node: NODE,
      tokenId: 5555n,
      owner: TEST_ACCOUNT.address,
      nonce: NONCE,
      deadline: 1735689600n,
    };
    const signature = await TEST_ACCOUNT.signTypedData({
      domain,
      types: UNWRAP_REQUEST_TYPES,
      primaryType: 'UnwrapRequest',
      message,
    });

    const result = await verifyRelaySignature(
      'UnwrapRequest',
      UNWRAP_REQUEST_TYPES,
      message,
      signature,
      domain,
    );
    expect(result).toBe(TEST_ACCOUNT.address);
  });

  it('rejects when wrap signature is replayed as unwrap', async () => {
    // Sign as WrapRequest
    const wrapMsg = {
      signer: TEST_ACCOUNT.address,
      node: NODE,
      tokenId: 5555n,
      owner: TEST_ACCOUNT.address,
      fuses: 0n,
      expiry: 1735689600n,
      nonce: NONCE,
      deadline: 1735689600n,
    };
    const wrapSig = await TEST_ACCOUNT.signTypedData({
      domain,
      types: WRAP_REQUEST_TYPES,
      primaryType: 'WrapRequest',
      message: wrapMsg,
    });

    // Try to use wrap signature as unwrap
    const unwrapMsg = {
      signer: TEST_ACCOUNT.address,
      node: NODE,
      tokenId: 5555n,
      owner: TEST_ACCOUNT.address,
      nonce: NONCE,
      deadline: 1735689600n,
    };
    const result = await verifyRelaySignature(
      'UnwrapRequest',
      UNWRAP_REQUEST_TYPES,
      unwrapMsg,
      wrapSig,
      domain,
    );
    expect(result).toBe(false);
  });
});

describe('verifyRelaySignature - error handling', () => {
  it('returns false for malformed signature', async () => {
    const domain = getWrapDomain(2368, WRAPPER);
    const message = {
      signer: TEST_ACCOUNT.address,
      node: NODE,
      tokenId: 1n,
      owner: TEST_ACCOUNT.address,
      fuses: 0n,
      expiry: 1735689600n,
      nonce: NONCE,
      deadline: 1735689600n,
    };
    const result = await verifyRelaySignature(
      'WrapRequest',
      WRAP_REQUEST_TYPES,
      message,
      '0xdeadbeef' as `0x${string}`,
      domain,
    );
    expect(result).toBe(false);
  });
});
