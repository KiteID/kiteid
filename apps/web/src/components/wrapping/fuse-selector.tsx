'use client';

import { Button } from '@kiteid/ui';
import { useState } from 'react';

interface FuseSelectorProps {
  onSelect: (fuses: bigint) => void;
}

const FUSES = [
  {
    id: 'cannot-unwrap',
    name: 'Cannot Unwrap',
    description: 'Permanently wrap the name. Cannot convert back to V1.',
    bit: 0n,
  },
  {
    id: 'cannot-transfer',
    name: 'Cannot Transfer',
    description: 'Lock ownership. Cannot transfer the wrapped name to another address.',
    bit: 2n,
  },
  {
    id: 'cannot-unbind-passport',
    name: 'Lock Passport',
    description: 'Prevent unbinding Kite Passport. Protects your identity binding.',
    bit: 18n,
  },
  {
    id: 'cannot-revoke-agents',
    name: 'Lock Agents',
    description: 'Prevent revoking agent delegations. Lock your agent settings.',
    bit: 19n,
  },
];

export function FuseSelector({ onSelect }: FuseSelectorProps) {
  const [selected, setSelected] = useState<Set<bigint>>(new Set());

  const handleToggle = (bit: bigint) => {
    const newSelected = new Set(selected);
    if (newSelected.has(bit)) {
      newSelected.delete(bit);
    } else {
      newSelected.add(bit);
    }
    setSelected(newSelected);
  };

  const handleContinue = () => {
    let fuses = 0n;
    selected.forEach((bit) => {
      fuses |= 1n << bit;
    });
    onSelect(fuses);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {FUSES.map((fuse) => (
          <button
            key={fuse.id}
            type="button"
            onClick={() => handleToggle(fuse.bit)}
            className={`w-full rounded-lg border-2 p-4 text-left transition ${
              selected.has(fuse.bit)
                ? 'border-bronze bg-bronze/5 dark:bg-bronze/10'
                : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-1 h-5 w-5 rounded border-2 transition ${
                  selected.has(fuse.bit)
                    ? 'border-bronze bg-bronze'
                    : 'border-stone-300 dark:border-stone-600'
                }`}
              >
                {selected.has(fuse.bit) && (
                  <svg
                    className="h-full w-full text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{fuse.name}</p>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  {fuse.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <Button onClick={handleContinue} className="w-full" size="lg">
        {selected.size === 0
          ? 'Wrap (No Fuses)'
          : `Wrap (${selected.size} Lock${selected.size !== 1 ? 's' : ''})`}
      </Button>
    </div>
  );
}
