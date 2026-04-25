const SECONDS_PER_YEAR = 365n * 24n * 60n * 60n;
const SECONDS_PER_DAY = 24n * 60n * 60n;

export function yearsToSeconds(years: number): bigint {
  return BigInt(years) * SECONDS_PER_YEAR;
}

export function secondsToYears(seconds: bigint): number {
  return Number(seconds / SECONDS_PER_YEAR);
}

export function humanDuration(seconds: bigint): string {
  const years = Number(seconds / SECONDS_PER_YEAR);
  if (years >= 1) {
    return years === 1 ? '1 year' : `${years} years`;
  }

  const days = Number(seconds / SECONDS_PER_DAY);
  if (days >= 1) {
    return days === 1 ? '1 day' : `${days} days`;
  }

  const hours = Number(seconds / 3600n);
  if (hours >= 1) {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }

  const minutes = Number(seconds / 60n);
  return minutes === 1 ? '1 minute' : `${minutes} minutes`;
}

export function daysUntilExpiry(expiryTimestamp: bigint): number {
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (expiryTimestamp <= now) return 0;
  return Number((expiryTimestamp - now) / SECONDS_PER_DAY);
}

export { SECONDS_PER_DAY, SECONDS_PER_YEAR };
