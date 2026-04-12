'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { COMMITMENT_MAX_AGE } from '@/lib/constants';
import type { RegistrationEntry, RegistrationStore } from './registration.types';
import { RegistrationState } from './registration.types';

export const useRegistrationStore = create<RegistrationStore>()(
  persist(
    (set, get) => ({
      registrations: {},

      startRegistration: (name, params) => {
        set((state) => ({
          registrations: {
            ...state.registrations,
            [name]: {
              name,
              secret: params.secret,
              commitment: params.commitment,
              owner: params.owner,
              duration: params.duration.toString(),
              resolver: params.resolver,
              reverseRecord: params.reverseRecord,
              state: RegistrationState.CONFIGURING,
            },
          },
        }));
      },

      updateState: (name, newState, errorMessage) => {
        set((state) => {
          const reg = state.registrations[name];
          if (!reg) return state;
          return {
            registrations: {
              ...state.registrations,
              [name]: { ...reg, state: newState, errorMessage },
            },
          };
        });
      },

      setCommitTx: (name, hash, timestamp) => {
        set((state) => {
          const reg = state.registrations[name];
          if (!reg) return state;
          return {
            registrations: {
              ...state.registrations,
              [name]: {
                ...reg,
                commitTxHash: hash,
                commitTimestamp: timestamp,
                state: RegistrationState.COMMIT_PENDING,
              },
            },
          };
        });
      },

      clearRegistration: (name) => {
        set((state) => {
          const { [name]: _, ...rest } = state.registrations;
          return { registrations: rest };
        });
      },

      clearExpired: () => {
        const now = Math.floor(Date.now() / 1000);
        set((state) => {
          const filtered: Record<string, RegistrationEntry> = {};
          for (const [key, reg] of Object.entries(state.registrations)) {
            if (reg.commitTimestamp && now - reg.commitTimestamp > COMMITMENT_MAX_AGE) {
              continue;
            }
            if (reg.state === RegistrationState.COMPLETED) {
              continue;
            }
            filtered[key] = reg;
          }
          return { registrations: filtered };
        });
      },

      getRegistration: (name) => {
        return get().registrations[name];
      },
    }),
    {
      name: 'kiteid-registrations',
      version: 1,
    },
  ),
);
