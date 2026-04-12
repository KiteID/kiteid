import { describe, expect, it } from 'vitest';
import { daysUntilExpiry, humanDuration, secondsToYears, yearsToSeconds } from '../duration';

describe('yearsToSeconds', () => {
  it('converts years to seconds', () => {
    expect(yearsToSeconds(1)).toBe(365n * 24n * 60n * 60n);
    expect(yearsToSeconds(2)).toBe(2n * 365n * 24n * 60n * 60n);
  });
});

describe('secondsToYears', () => {
  it('converts seconds to years', () => {
    expect(secondsToYears(365n * 24n * 60n * 60n)).toBe(1);
    expect(secondsToYears(2n * 365n * 24n * 60n * 60n)).toBe(2);
  });
});

describe('humanDuration', () => {
  it('formats years', () => {
    expect(humanDuration(365n * 24n * 60n * 60n)).toBe('1 year');
    expect(humanDuration(2n * 365n * 24n * 60n * 60n)).toBe('2 years');
  });

  it('formats days', () => {
    expect(humanDuration(24n * 60n * 60n)).toBe('1 day');
    expect(humanDuration(7n * 24n * 60n * 60n)).toBe('7 days');
  });

  it('formats hours', () => {
    expect(humanDuration(3600n)).toBe('1 hour');
    expect(humanDuration(7200n)).toBe('2 hours');
  });

  it('formats minutes', () => {
    expect(humanDuration(60n)).toBe('1 minute');
    expect(humanDuration(300n)).toBe('5 minutes');
  });
});

describe('daysUntilExpiry', () => {
  it('returns 0 for past timestamp', () => {
    expect(daysUntilExpiry(0n)).toBe(0);
  });

  it('returns positive days for future timestamp', () => {
    const future = BigInt(Math.floor(Date.now() / 1000) + 86400 * 30);
    const days = daysUntilExpiry(future);
    expect(days).toBeGreaterThanOrEqual(29);
    expect(days).toBeLessThanOrEqual(30);
  });
});
