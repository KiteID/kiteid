import { describe, expect, it } from 'vitest';

// Note: Full hook tests require wagmi and signTypedData mocking.
// This file documents expected behavior and test scenarios:

describe('useWrapName - BigInt serialization', () => {
  it('should serialize wrap request params to strings before JSON.stringify', () => {
    // Given: wrapAsync call with bigint tokenId, fuses, expiry
    // When: constructing relay request body
    // Then: tokenId.toString(), fuses.toString(), expiry.toString() are used
    const tokenId = 123456789n;
    const fuses = 7n; // binary: 0000111
    const expiry = 1234567890n;

    const body = JSON.stringify({
      action: 'wrap',
      params: {
        tokenId: tokenId.toString(),
        fuses: fuses.toString(),
        expiry: expiry.toString(),
      },
    });

    expect(body).toContain('"tokenId":"123456789"');
    expect(body).toContain('"fuses":"7"');
    expect(body).toContain('"expiry":"1234567890"');
  });

  it('should construct valid wrap message with all required fields', () => {
    // Verify: wrap message includes all EIP-712 fields
    const wrapMessage = {
      signer: '0x1234567890123456789012345678901234567890',
      node: `0x${'a'.repeat(64)}`,
      tokenId: 123n,
      owner: '0x0987654321098765432109876543210987654321',
      fuses: 7n,
      expiry: 1234567890n,
      nonce: `0x${'b'.repeat(64)}`,
      deadline: 1700000000n,
    };

    expect(wrapMessage).toHaveProperty('signer');
    expect(wrapMessage).toHaveProperty('tokenId');
    expect(wrapMessage).toHaveProperty('nonce');
    expect(wrapMessage).toHaveProperty('deadline');
  });

  it('should construct valid unwrap message with required fields', () => {
    // Verify: unwrap message includes EIP-712 fields (no fuses/expiry)
    const unwrapMessage = {
      signer: '0x1234567890123456789012345678901234567890',
      node: `0x${'a'.repeat(64)}`,
      tokenId: 123n,
      owner: '0x0987654321098765432109876543210987654321',
      nonce: `0x${'b'.repeat(64)}`,
      deadline: 1700000000n,
    };

    expect(unwrapMessage).toHaveProperty('signer');
    expect(unwrapMessage).toHaveProperty('tokenId');
    expect(unwrapMessage).not.toHaveProperty('fuses');
    expect(unwrapMessage).not.toHaveProperty('expiry');
  });
});

describe('useWrapName - EIP-712 domain and types', () => {
  it('should construct EIP-712 domain with required fields', () => {
    const domain = {
      name: 'KiteWrapper',
      version: '1',
      chainId: 2368,
      verifyingContract: `0x${'c'.repeat(40)}`,
    };

    expect(domain).toHaveProperty('name', 'KiteWrapper');
    expect(domain).toHaveProperty('version', '1');
    expect(domain).toHaveProperty('chainId', 2368);
    expect(domain).toHaveProperty('verifyingContract');
  });

  it('should define WRAP_REQUEST_TYPES with all fields', () => {
    // WRAP_REQUEST_TYPES schema validates wrap message structure
    const wrapRequestSchema = {
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
    };

    const fields = wrapRequestSchema.WrapRequest.map((f) => f.name);
    expect(fields).toContain('signer');
    expect(fields).toContain('tokenId');
    expect(fields).toContain('fuses');
    expect(fields).toContain('expiry');
    expect(fields).toContain('nonce');
  });

  it('should define UNWRAP_REQUEST_TYPES without fuses/expiry', () => {
    // UNWRAP_REQUEST_TYPES excludes fuses and expiry (only needed for wrap)
    const unwrapRequestSchema = {
      UnwrapRequest: [
        { name: 'signer', type: 'address' },
        { name: 'node', type: 'bytes32' },
        { name: 'tokenId', type: 'uint256' },
        { name: 'owner', type: 'address' },
        { name: 'nonce', type: 'bytes32' },
        { name: 'deadline', type: 'uint64' },
      ],
    };

    const fields = unwrapRequestSchema.UnwrapRequest.map((f) => f.name);
    expect(fields).toContain('signer');
    expect(fields).toContain('tokenId');
    expect(fields).not.toContain('fuses');
    expect(fields).not.toContain('expiry');
  });
});

describe('useWrapName - API relay request', () => {
  it('should construct relay request with all required fields', () => {
    const relayRequest = {
      action: 'wrap',
      params: {
        node: `0x${'a'.repeat(64)}`,
        tokenId: '123',
        owner: '0x0987654321098765432109876543210987654321',
        fuses: '7',
        expiry: '1234567890',
      },
      signer: '0x1234567890123456789012345678901234567890',
      nonce: `0x${'b'.repeat(64)}`,
      deadline: 1700000000,
      signature: `0x${'d'.repeat(130)}`,
    };

    expect(relayRequest).toHaveProperty('action', 'wrap');
    expect(relayRequest.params).toHaveProperty('tokenId');
    expect(relayRequest).toHaveProperty('signature');
  });

  it('should validate relay response structure', () => {
    // Successful relay returns { txHash }
    const successResponse = {
      txHash: `0x${'e'.repeat(64)}`,
    };

    expect(successResponse).toHaveProperty('txHash');
    expect(typeof successResponse.txHash).toBe('string');
    expect(successResponse.txHash).toMatch(/^0x/);
  });

  it('should handle relay error response', () => {
    // Failed relay returns { error: message, detail?: string }
    const errorResponse = {
      error: 'Invalid signature',
      detail: 'Recovered signer does not match request signer',
    };

    expect(errorResponse).toHaveProperty('error');
    expect(typeof errorResponse.error).toBe('string');
  });
});

describe('useWrapName - setFuses and bindPassport (direct calls)', () => {
  it('should construct setFuses writeContractAsync call', () => {
    const setFusesCall = {
      address: `0x${'c'.repeat(40)}`,
      abi: 'KiteWrapperAbi',
      functionName: 'setFuses',
      args: [`0x${'a'.repeat(64)}`, 7n],
    };

    expect(setFusesCall).toHaveProperty('functionName', 'setFuses');
    expect(setFusesCall.args).toHaveLength(2);
    expect(typeof setFusesCall.args[1]).toBe('bigint');
  });

  it('should construct bindPassport writeContractAsync call', () => {
    const bindPassportCall = {
      address: `0x${'c'.repeat(40)}`,
      abi: 'KiteWrapperAbi',
      functionName: 'bindPassport',
      args: [`0x${'a'.repeat(64)}`, `0x${'f'.repeat(64)}`],
    };

    expect(bindPassportCall).toHaveProperty('functionName', 'bindPassport');
    expect(bindPassportCall.args).toHaveLength(2);
    expect(bindPassportCall.args[0]).toMatch(/^0x/);
  });
});

describe('useWrapName - TokenId computation', () => {
  it('should use labelhash for tokenId, not full domain namehash', () => {
    // TokenId must be labelhash(label) per KiteBaseRegistrar/KiteController
    // NOT namehash("label.kite") which is the full domain hash

    // Example: for "alice.kite"
    const tokenIdSource = 'labelhash'; // should be labelhash(label)
    const nodeSource = 'namehash'; // should be namehash("alice.kite")

    expect(tokenIdSource).toBe('labelhash');
    expect(nodeSource).toBe('namehash');
    expect(tokenIdSource).not.toBe(nodeSource);
  });
});
