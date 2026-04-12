import { describe, expect, it } from 'vitest';
import { KITE_NODE, kiteLabelhash, kiteNamehash, labelhash, namehash } from '../namehash';

describe('namehash', () => {
  it('returns zero hash for empty string', () => {
    expect(namehash('')).toBe('0x0000000000000000000000000000000000000000000000000000000000000000');
  });

  it('computes consistent hash for "kite"', () => {
    const hash = namehash('kite');
    expect(hash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(hash).toBe(KITE_NODE);
  });

  it('computes consistent hash for multi-level names', () => {
    const hash1 = namehash('alice.kite');
    const hash2 = namehash('alice.kite');
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^0x[a-f0-9]{64}$/);
  });

  it('produces different hashes for different names', () => {
    const h1 = namehash('alice.kite');
    const h2 = namehash('bob.kite');
    expect(h1).not.toBe(h2);
  });
});

describe('labelhash', () => {
  it('produces keccak256 of label', () => {
    const hash = labelhash('alice');
    expect(hash).toMatch(/^0x[a-f0-9]{64}$/);
  });

  it('different labels produce different hashes', () => {
    expect(labelhash('alice')).not.toBe(labelhash('bob'));
  });
});

describe('kiteNamehash', () => {
  it('appends .kite and computes namehash', () => {
    expect(kiteNamehash('alice')).toBe(namehash('alice.kite'));
  });
});

describe('kiteLabelhash', () => {
  it('returns labelhash of the label', () => {
    expect(kiteLabelhash('alice')).toBe(labelhash('alice'));
  });
});
