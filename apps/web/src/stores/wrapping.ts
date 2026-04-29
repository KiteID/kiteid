'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WrapStep = 'select' | 'preview' | 'confirm' | 'pending' | 'done';

interface WrappingState {
  step: WrapStep;
  selectedFuses: bigint;
  node: string | null;
  owner: string | null;
  txHash: string | null;
  errorMessage: string | null;
  wrappedNames: Record<
    string,
    {
      owner: string;
      fuses: bigint;
      expiry: number;
      wrappedAt: string;
      txHash: string;
    }
  >;

  startWrap: (node: string, owner: string) => void;
  setFuses: (fuses: bigint) => void;
  advanceStep: (step: WrapStep) => void;
  setTxHash: (hash: string) => void;
  setError: (error: string | null) => void;
  addWrappedName: (
    node: string,
    data: {
      owner: string;
      fuses: bigint;
      expiry: number;
      wrappedAt: string;
      txHash: string;
    },
  ) => void;
  reset: () => void;
}

const initialState = {
  step: 'select' as WrapStep,
  selectedFuses: 0n,
  node: null,
  owner: null,
  txHash: null,
  errorMessage: null,
  wrappedNames: {} as Record<
    string,
    {
      owner: string;
      fuses: bigint;
      expiry: number;
      wrappedAt: string;
      txHash: string;
    }
  >,
};

export const useWrappingStore = create<WrappingState>()(
  persist(
    (set) => ({
      ...initialState,

      startWrap: (node, owner) => {
        set({
          node,
          owner,
          step: 'select',
          selectedFuses: 0n,
          txHash: null,
          errorMessage: null,
        });
      },

      setFuses: (fuses) => {
        set({ selectedFuses: fuses });
      },

      advanceStep: (step) => {
        set({ step });
      },

      setTxHash: (hash) => {
        set({ txHash: hash });
      },

      setError: (error) => {
        set({ errorMessage: error });
      },

      addWrappedName: (node, data) => {
        set((state) => ({
          wrappedNames: {
            ...state.wrappedNames,
            [node]: data,
          },
        }));
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'wrapping-store',
      partialize: (state) => ({
        wrappedNames: state.wrappedNames,
      }),
    },
  ),
);
