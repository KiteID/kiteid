'use client';

import {
  generateSecret,
  getResolverAddress,
  makeCommitment,
  normalizeLabel,
  useKiteCommit,
  useKiteRegister,
  useKiteRentPrice,
  yearsToSeconds,
} from '@kiteid/sdk';
import { useCallback, useEffect } from 'react';
import { useAccount, useChainId, useWaitForTransactionReceipt } from 'wagmi';
import { useRegistrationStore } from '@/stores/registration';
import { RegistrationState } from '@/stores/registration.types';
import { useCommitmentTimer } from './use-commitment-timer';

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

  const initRegistration = useCallback(
    (years: number, reverseRecord: boolean) => {
      if (!address) return;

      const secret = generateSecret();
      const dur = yearsToSeconds(years);
      const resolver = getResolverAddress(chainId);

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

      // Transition to COMMITTING so the wizard advances to the commit step
      store.updateState(label, RegistrationState.COMMITTING);
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
