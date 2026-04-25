'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export function useCopy(timeout = 1600) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string, label = 'Copied') => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(label, { duration: 1400 });
        setTimeout(() => setCopied(false), timeout);
      } catch {
        toast.error('Copy failed');
      }
    },
    [timeout],
  );

  return { copy, copied };
}
