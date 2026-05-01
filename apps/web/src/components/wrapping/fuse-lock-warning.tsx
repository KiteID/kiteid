'use client';

interface FuseLockWarningProps {
  fuses: bigint;
}

const FUSE_DESCRIPTIONS: Record<string, string> = {
  'cannot-unwrap': 'Cannot unwrap this name ever',
  'cannot-transfer': 'Cannot transfer ownership ever',
  'cannot-unbind-passport': 'Cannot unbind Kite Passport ever',
  'cannot-revoke-agents': 'Cannot revoke agent access ever',
};

export function FuseLockWarning({ fuses }: FuseLockWarningProps) {
  const lockedFuses: string[] = [];

  // Check each fuse bit
  if ((fuses & (1n << 0n)) !== 0n) lockedFuses.push('cannot-unwrap');
  if ((fuses & (1n << 2n)) !== 0n) lockedFuses.push('cannot-transfer');
  if ((fuses & (1n << 18n)) !== 0n) lockedFuses.push('cannot-unbind-passport');
  if ((fuses & (1n << 19n)) !== 0n) lockedFuses.push('cannot-revoke-agents');

  if (lockedFuses.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
      <div className="flex gap-3">
        <div className="text-amber-600 dark:text-amber-400 mt-0.5">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm text-amber-900 dark:text-amber-100">
            Irreversible Locks
          </p>
          <ul className="text-xs text-amber-800 dark:text-amber-200 mt-2 space-y-1 list-disc list-inside">
            {lockedFuses.map((fuse) => (
              <li key={fuse}>{FUSE_DESCRIPTIONS[fuse] || fuse}</li>
            ))}
          </ul>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-3">
            Burned fuses cannot be unburned. Ensure you understand the implications before
            confirming.
          </p>
        </div>
      </div>
    </div>
  );
}
