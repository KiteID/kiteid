import { describe, expect, it } from 'vitest';
import { generateSecret, makeCommitment } from '../commitment';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

describe('generateSecret', () => {
  it('generates a 32-byte hex string', () => {
    const secret = generateSecret();
    expect(secret).toMatch(/^0x[a-f0-9]{64}$/);
  });

  it('generates unique secrets', () => {
    const s1 = generateSecret();
    const s2 = generateSecret();
    expect(s1).not.toBe(s2);
  });
});

describe('makeCommitment', () => {
  const baseParams = {
    name: 'alice',
    owner: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    duration: 31536000n,
    secret: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as `0x${string}`,
    resolver: ZERO_ADDRESS,
    data: [] as `0x${string}`[],
    reverseRecord: false,
  };

  it('produces a deterministic hash', () => {
    const c1 = makeCommitment(baseParams);
    const c2 = makeCommitment(baseParams);
    expect(c1).toBe(c2);
    expect(c1).toMatch(/^0x[a-f0-9]{64}$/);
  });

  it('different names produce different commitments', () => {
    const c1 = makeCommitment(baseParams);
    const c2 = makeCommitment({ ...baseParams, name: 'bob' });
    expect(c1).not.toBe(c2);
  });

  it('different secrets produce different commitments', () => {
    const c1 = makeCommitment(baseParams);
    const c2 = makeCommitment({
      ...baseParams,
      secret: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    });
    expect(c1).not.toBe(c2);
  });

  it('different durations produce different commitments', () => {
    const c1 = makeCommitment(baseParams);
    const c2 = makeCommitment({ ...baseParams, duration: 63072000n });
    expect(c1).not.toBe(c2);
  });
});
