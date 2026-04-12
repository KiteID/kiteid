import { parseEther } from 'viem';
import { describe, expect, it } from 'vitest';
import { formatKitePrice, formatKitePriceWithSymbol } from '../format-price';

describe('formatKitePrice', () => {
  it('formats zero', () => {
    expect(formatKitePrice(0n)).toBe('0');
  });

  it('formats whole numbers', () => {
    expect(formatKitePrice(parseEther('5'))).toBe('5');
    expect(formatKitePrice(parseEther('160'))).toBe('160');
    expect(formatKitePrice(parseEther('640'))).toBe('640');
  });

  it('formats decimals', () => {
    expect(formatKitePrice(parseEther('5.5'))).toBe('5.5');
    expect(formatKitePrice(parseEther('0.1'))).toBe('0.1');
  });

  it('formats very small values', () => {
    expect(formatKitePrice(parseEther('0.001'))).toBe('<0.01');
  });

  it('respects decimal precision', () => {
    expect(formatKitePrice(parseEther('5.123'), 0)).toBe('5');
    expect(formatKitePrice(parseEther('5.123'), 3)).toBe('5.123');
  });
});

describe('formatKitePriceWithSymbol', () => {
  it('appends KITE symbol', () => {
    expect(formatKitePriceWithSymbol(parseEther('5'))).toBe('5 KITE');
    expect(formatKitePriceWithSymbol(parseEther('640'))).toBe('640 KITE');
  });
});
