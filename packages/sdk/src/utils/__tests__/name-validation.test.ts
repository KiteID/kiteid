import { describe, expect, it } from 'vitest';
import { getLabelLength, isValidName, normalizeLabel } from '../name-validation';

describe('normalizeLabel', () => {
  it('lowercases input', () => {
    expect(normalizeLabel('HelloWorld')).toBe('helloworld');
  });

  it('trims whitespace', () => {
    expect(normalizeLabel('  alice  ')).toBe('alice');
  });

  it('strips .kite suffix', () => {
    expect(normalizeLabel('alice.kite')).toBe('alice');
  });
});

describe('isValidName', () => {
  it('accepts valid 3+ char names', () => {
    expect(isValidName('abc').valid).toBe(true);
    expect(isValidName('alice').valid).toBe(true);
    expect(isValidName('my-name').valid).toBe(true);
    expect(isValidName('a1b2c3').valid).toBe(true);
  });

  it('rejects empty names', () => {
    const result = isValidName('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects names shorter than 3 chars', () => {
    expect(isValidName('ab').valid).toBe(false);
    expect(isValidName('a').valid).toBe(false);
  });

  it('rejects names longer than 63 chars', () => {
    const longName = 'a'.repeat(64);
    expect(isValidName(longName).valid).toBe(false);
  });

  it('accepts names exactly 63 chars', () => {
    const maxName = 'a'.repeat(63);
    expect(isValidName(maxName).valid).toBe(true);
  });

  it('rejects invalid characters', () => {
    expect(isValidName('hello world').valid).toBe(false);
    expect(isValidName('hello_world').valid).toBe(false);
    expect(isValidName('hello.world').valid).toBe(false);
    expect(isValidName('HELLO').valid).toBe(true); // normalizes to lowercase
  });

  it('rejects names starting/ending with hyphen', () => {
    expect(isValidName('-alice').valid).toBe(false);
    expect(isValidName('alice-').valid).toBe(false);
  });

  it('allows hyphens in the middle', () => {
    expect(isValidName('my-name').valid).toBe(true);
    expect(isValidName('a-b-c').valid).toBe(true);
  });

  it('strips .kite suffix before validation', () => {
    expect(isValidName('alice.kite').valid).toBe(true);
  });
});

describe('getLabelLength', () => {
  it('returns label length without .kite suffix', () => {
    expect(getLabelLength('alice.kite')).toBe(5);
    expect(getLabelLength('alice')).toBe(5);
    expect(getLabelLength('abc')).toBe(3);
  });
});
