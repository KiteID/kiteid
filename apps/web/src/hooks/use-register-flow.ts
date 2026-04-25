'use client';

import {
  generateSecret,
  getResolverAddress,
  kiteAI,
  makeCommitment,
  normalizeLabel,
  useKiteCommit,
  useKiteRegister,
  useKiteRentPrice,
  yearsToSeconds,
} from '@kiteid/sdk';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAccount, useChainId, useWaitForTransactionReceipt } from 'wagmi';
import { TLD } from '@/lib/constants';
import { useRegistrationStore } from '@/stores/registration';
import { RegistrationState } from '@/stores/registration.types';
import { useCommitmentTimer } from './use-commitment-timer';

const COMMIT_TOAST_ID = 'kiteid-commit';
const WAIT_TOAST_ID = 'kiteid-wait';
const REGISTER_TOAST_ID = 'kiteid-register';

function explorerTxUrl(hash: string, chainId?: number): string {
  const base = chainId === kiteAI.id ? 'https://kitescan.ai' : 'https://testnet.kitescan.ai';
  return `${base}/tx/${hash}`;
}

function explorerAction(hash: string | undefined, chainId?: number) {
  if (!hash) return undefined;
  const url = explorerTxUrl(hash, chainId);
  return {
    label: 'View on explorer',
    onClick: () => window.open(url, '_blank', 'noopener,noreferrer'),
  };
}

export function useRegisterFlow(name: string) {
  const label = normalizeLabel(name);
  const chainId = useChainId();
  const { address } = useAccount();

  const store = useRegistrationStore();
  const registration = store.getRegistration(label);

  const duration = registration ? BigInt(registration.duration) : yearsToSeconds(1);
  const price = useKiteRentPrice(label, duration, chainId);
  const { commitAsync, isPending: isCommitPending } = useKiteCommit(chainId);
  const {
    registerAsync,
    data: registerData,
    isPending: isRegisterPending,
  } = useKiteRegister(chainId);

  const commitReceipt = useWaitForTransactionReceipt({
    hash: registration?.commitTxHash as `0x${string}` | undefined,
  });

  const registerReceipt = useWaitForTransactionReceipt({
    hash: registerData,
  });

  const timer = useCommitmentTimer(registration?.commitTimestamp);

  // Auto-transition: COMMIT_PENDING → WAITING_MIN_AGE when confirmed
  useEffect(() => {
    if (registration?.state === RegistrationState.COMMIT_PENDING && commitReceipt.isSuccess) {
      store.updateState(label, RegistrationState.WAITING_MIN_AGE);
    }
  }, [registration?.state, commitReceipt.isSuccess, label, store]);

  // Auto-transition: WAITING_MIN_AGE → READY_TO_REGISTER when timer done
  useEffect(() => {
    if (registration?.state === RegistrationState.WAITING_MIN_AGE && timer.isReady) {
      store.updateState(label, RegistrationState.READY_TO_REGISTER);
    }
  }, [registration?.state, timer.isReady, label, store]);

  // Auto-transition: WAITING_MIN_AGE → ERROR when expired
  useEffect(() => {
    if (registration?.state === RegistrationState.WAITING_MIN_AGE && timer.isExpired) {
      store.updateState(label, RegistrationState.ERROR, 'Commitment expired. Please start over.');
    }
  }, [registration?.state, timer.isExpired, label, store]);

  // Auto-transition: REGISTER_PENDING → COMPLETED when confirmed
  useEffect(() => {
    if (registration?.state === RegistrationState.REGISTER_PENDING && registerReceipt.isSuccess) {
      store.updateState(label, RegistrationState.COMPLETED);
    }
  }, [registration?.state, registerReceipt.isSuccess, label, store]);

  // --- Toast side-effects (do not change state logic) ---
  // Track last-seen state so we only emit on transitions, not every render.
  const lastStateRef = useRef<RegistrationState | undefined>(registration?.state);
  const waitAnnouncedRef = useRef(false);
  const registerSubmittedRef = useRef(false);

  // Commit lifecycle
  useEffect(() => {
    const prev = lastStateRef.current;
    const next = registration?.state;

    // Commit submission announced when COMMIT_READY → COMMITTING
    if (prev !== RegistrationState.COMMITTING && next === RegistrationState.COMMITTING) {
      toast.loading('Confirming commitment…', { id: COMMIT_TOAST_ID });
    }

    // Commit confirmed when entering WAITING_MIN_AGE
    if (prev !== RegistrationState.WAITING_MIN_AGE && next === RegistrationState.WAITING_MIN_AGE) {
      toast.success('Commitment confirmed', {
        id: COMMIT_TOAST_ID,
        action: explorerAction(registration?.commitTxHash, chainId),
      });
      // Wait-step info toast — 60s visible
      if (!waitAnnouncedRef.current) {
        toast.info('Waiting 60 seconds…', {
          id: WAIT_TOAST_ID,
          duration: 60000,
        });
        waitAnnouncedRef.current = true;
      }
    }

    // READY_TO_REGISTER → wait complete
    if (
      prev !== RegistrationState.READY_TO_REGISTER &&
      next === RegistrationState.READY_TO_REGISTER
    ) {
      toast.success('Ready to register', { id: WAIT_TOAST_ID });
      waitAnnouncedRef.current = false;
    }

    // Register submission → REGISTERING
    if (
      prev !== RegistrationState.REGISTERING &&
      next === RegistrationState.REGISTERING &&
      !registerSubmittedRef.current
    ) {
      toast.loading(`Registering ${label}${TLD}…`, { id: REGISTER_TOAST_ID });
      registerSubmittedRef.current = true;
    }

    // Register confirmed → COMPLETED
    if (prev !== RegistrationState.COMPLETED && next === RegistrationState.COMPLETED) {
      toast.success(`${label}${TLD} is yours`, {
        id: REGISTER_TOAST_ID,
        action: explorerAction(registerData, chainId),
      });
      registerSubmittedRef.current = false;
    }

    // ERROR branch — surface a terminal error toast
    if (prev !== RegistrationState.ERROR && next === RegistrationState.ERROR) {
      // Decide which in-flight toast to replace based on what came before.
      if (prev === RegistrationState.REGISTERING || prev === RegistrationState.REGISTER_PENDING) {
        toast.error('Registration failed', {
          id: REGISTER_TOAST_ID,
          description: registration?.errorMessage,
        });
        registerSubmittedRef.current = false;
      } else if (prev === RegistrationState.WAITING_MIN_AGE) {
        toast.error('Commitment expired', {
          id: WAIT_TOAST_ID,
          description: registration?.errorMessage,
        });
        waitAnnouncedRef.current = false;
      } else {
        toast.error('Commitment failed', {
          id: COMMIT_TOAST_ID,
          description: registration?.errorMessage,
        });
      }
    }

    lastStateRef.current = next;
  }, [
    registration?.state,
    registration?.commitTxHash,
    registration?.errorMessage,
    registerData,
    chainId,
    label,
  ]);

  const initRegistration = useCallback(
    (years: number, reverseRecord: boolean) => {
      if (!address) return;

      const secret = generateSecret();
      const dur = yearsToSeconds(years);
      const resolver = getResolverAddress(chainId);
      if (!resolver) return;

      const commitment = makeCommitment({
        name: label,
        owner: address,
        duration: dur,
        secret,
        resolver,
        data: [],
        reverseRecord,
      });

      store.startRegistration(label, {
        owner: address,
        duration: dur,
        secret,
        commitment,
        resolver,
        reverseRecord,
      });

      // Advance wizard to commit step — COMMIT_READY shows the button
      store.updateState(label, RegistrationState.COMMIT_READY);
    },
    [address, chainId, label, store],
  );

  const submitCommit = useCallback(async () => {
    if (!registration) return;

    store.updateState(label, RegistrationState.COMMITTING);
    try {
      const hash = await commitAsync(registration.commitment as `0x${string}`);
      store.setCommitTx(label, hash, Math.floor(Date.now() / 1000));
    } catch {
      store.updateState(label, RegistrationState.CONFIGURING, 'Transaction rejected');
    }
  }, [registration, commitAsync, label, store]);

  const submitRegister = useCallback(async () => {
    if (!registration || !price.data || !address) return;

    store.updateState(label, RegistrationState.REGISTERING);
    const totalPrice = price.data.base + price.data.premium;

    try {
      await registerAsync(
        {
          name: label,
          owner: address,
          duration: BigInt(registration.duration),
          secret: registration.secret as `0x${string}`,
          resolver: registration.resolver as `0x${string}`,
          data: [],
          reverseRecord: registration.reverseRecord,
        },
        totalPrice,
      );
      store.updateState(label, RegistrationState.REGISTER_PENDING);
    } catch {
      store.updateState(label, RegistrationState.READY_TO_REGISTER, 'Transaction rejected');
    }
  }, [registration, price.data, address, registerAsync, label, store]);

  const retry = useCallback(() => {
    if (!registration) return;
    if (registration.state === RegistrationState.ERROR && registration.commitTimestamp) {
      // Commitment expired, restart
      store.clearRegistration(label);
    } else {
      store.updateState(label, RegistrationState.CONFIGURING);
    }
  }, [registration, label, store]);

  return {
    registration,
    timer,
    price: price.data ? { base: price.data.base, premium: price.data.premium } : undefined,
    isPriceLoading: price.isLoading,
    isCommitPending,
    isRegisterPending,
    initRegistration,
    submitCommit,
    submitRegister,
    retry,
    clearRegistration: () => store.clearRegistration(label),
  };
}
