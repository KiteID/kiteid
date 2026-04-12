'use client';

import { useCallback, useState } from 'react';

type TxStatus = 'idle' | 'pending' | 'confirmed' | 'error';

interface TxState {
  status: TxStatus;
  hash?: string;
  message?: string;
}

export function useTxStatus() {
  const [state, setState] = useState<TxState>({ status: 'idle' });

  const setPending = useCallback((hash?: string) => {
    setState({ status: 'pending', hash });
  }, []);

  const setConfirmed = useCallback((hash?: string) => {
    setState({ status: 'confirmed', hash });
  }, []);

  const setError = useCallback((message: string) => {
    setState({ status: 'error', message });
  }, []);

  const reset = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  return { ...state, setPending, setConfirmed, setError, reset };
}
