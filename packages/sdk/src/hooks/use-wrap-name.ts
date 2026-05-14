'use client';

import type { Address } from 'viem';
import type { UseWriteContractReturnType } from 'wagmi';
import { useAccount, useChainId, usePublicClient, useSignTypedData, useWriteContract } from 'wagmi';
import { abis, getBaseRegistrarAddress, getWrapperAddress } from '../contracts';
import { getWrapDomain, UNWRAP_REQUEST_TYPES, WRAP_REQUEST_TYPES } from '../lib/eip712';

export function useWrapName(chainId?: number): Omit<
  UseWriteContractReturnType,
  'writeContract' | 'writeContractAsync'
> & {
  checkWrapperApprovalAsync: (owner: Address) => Promise<boolean>;
  approveWrapperAsync: () => Promise<`0x${string}`>;
  wrapAsync: (
    node: `0x${string}`,
    tokenId: bigint,
    owner: Address,
    fuses: bigint,
    expiry: bigint,
  ) => Promise<`0x${string}`>;
  unwrapAsync: (node: `0x${string}`, tokenId: bigint, owner: Address) => Promise<`0x${string}`>;
  setFusesAsync: (node: `0x${string}`, fuses: bigint) => Promise<`0x${string}`>;
  bindPassportAsync: (node: `0x${string}`, commitment: `0x${string}`) => Promise<`0x${string}`>;
} {
  const { writeContractAsync, ...rest } = useWriteContract();
  const { address: account } = useAccount();
  const connectedChainId = useChainId();
  const { signTypedDataAsync } = useSignTypedData();
  const publicClient = usePublicClient();

  const effectiveChainId = chainId ?? connectedChainId;

  const checkWrapperApprovalAsync = async (owner: Address): Promise<boolean> => {
    if (!effectiveChainId) throw new Error('Chain ID not set');
    if (!publicClient) throw new Error('Public client not available');
    const wrapperAddress = getWrapperAddress(effectiveChainId);
    const baseRegistrar = getBaseRegistrarAddress(effectiveChainId);
    if (!wrapperAddress || !baseRegistrar) throw new Error('Contracts not deployed');

    return (await publicClient.readContract({
      address: baseRegistrar,
      abi: abis.baseRegistrar,
      functionName: 'isApprovedForAll',
      args: [owner, wrapperAddress],
    })) as boolean;
  };

  const approveWrapperAsync = async (): Promise<`0x${string}`> => {
    if (!effectiveChainId) throw new Error('Chain ID not set');
    const wrapperAddress = getWrapperAddress(effectiveChainId);
    const baseRegistrar = getBaseRegistrarAddress(effectiveChainId);
    if (!wrapperAddress || !baseRegistrar) throw new Error('Contracts not deployed');

    return writeContractAsync({
      address: baseRegistrar,
      abi: abis.baseRegistrar,
      functionName: 'setApprovalForAll',
      args: [wrapperAddress, true],
    });
  };

  const wrapAsync = async (
    node: `0x${string}`,
    tokenId: bigint,
    owner: Address,
    fuses: bigint,
    expiry: bigint,
  ): Promise<`0x${string}`> => {
    if (!effectiveChainId) throw new Error('Chain ID not set');
    if (!account) throw new Error('Account not connected');

    const wrapperAddress = getWrapperAddress(effectiveChainId);
    if (!wrapperAddress || wrapperAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('KiteWrapper not deployed on this network');
    }

    // Get nonce from API
    const nonceRes = await fetch('/api/v2/wrap/nonce');
    if (!nonceRes.ok) throw new Error('Failed to get nonce');
    const { nonce } = (await nonceRes.json()) as { nonce: string };

    // Sign typed data
    const deadline = Math.floor(Date.now() / 1000) + 280;
    const domain = getWrapDomain(effectiveChainId, wrapperAddress);

    const signature = await signTypedDataAsync({
      domain,
      types: WRAP_REQUEST_TYPES,
      primaryType: 'WrapRequest',
      message: {
        signer: account,
        node,
        tokenId,
        owner,
        fuses,
        expiry,
        nonce: nonce as `0x${string}`,
        deadline,
      },
      // biome-ignore lint/suspicious/noExplicitAny: wagmi signTypedDataAsync argument types not fully typed
    } as any);

    // Post to relay
    const relayRes = await fetch('/api/v2/wrap/relay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'wrap',
        params: {
          node,
          tokenId: tokenId.toString(),
          owner,
          fuses: fuses.toString(),
          expiry: expiry.toString(),
        },
        signer: account,
        nonce,
        deadline,
        signature,
      }),
    });

    if (!relayRes.ok) {
      const error = await relayRes.json();
      throw new Error(error.error || 'Relay failed');
    }

    const { txHash } = (await relayRes.json()) as { txHash: `0x${string}` };
    return txHash;
  };

  const unwrapAsync = async (
    node: `0x${string}`,
    tokenId: bigint,
    owner: Address,
  ): Promise<`0x${string}`> => {
    if (!effectiveChainId) throw new Error('Chain ID not set');
    if (!account) throw new Error('Account not connected');

    const wrapperAddress = getWrapperAddress(effectiveChainId);
    if (!wrapperAddress || wrapperAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('KiteWrapper not deployed on this network');
    }

    // Get nonce from API
    const nonceRes = await fetch('/api/v2/wrap/nonce');
    if (!nonceRes.ok) throw new Error('Failed to get nonce');
    const { nonce } = (await nonceRes.json()) as { nonce: string };

    // Sign typed data
    const deadline = Math.floor(Date.now() / 1000) + 280;
    const domain = getWrapDomain(effectiveChainId, wrapperAddress);

    const signature = await signTypedDataAsync({
      domain,
      types: UNWRAP_REQUEST_TYPES,
      primaryType: 'UnwrapRequest',
      message: {
        signer: account,
        node,
        tokenId,
        owner,
        nonce: nonce as `0x${string}`,
        deadline,
      },
      // biome-ignore lint/suspicious/noExplicitAny: wagmi signTypedDataAsync argument types not fully typed
    } as any);

    // Post to relay
    const relayRes = await fetch('/api/v2/wrap/relay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'unwrap',
        params: { node, tokenId: tokenId.toString(), owner },
        signer: account,
        nonce,
        deadline,
        signature,
      }),
    });

    if (!relayRes.ok) {
      const error = await relayRes.json();
      throw new Error(error.error || 'Relay failed');
    }

    const { txHash } = (await relayRes.json()) as { txHash: `0x${string}` };
    return txHash;
  };

  const setFusesAsync = (node: `0x${string}`, fuses: bigint): Promise<`0x${string}`> => {
    if (!effectiveChainId) throw new Error('Chain ID not set');
    const address = getWrapperAddress(effectiveChainId);
    if (!address || address === '0x0000000000000000000000000000000000000000') {
      throw new Error('KiteWrapper not deployed on this network');
    }
    return writeContractAsync({
      address,
      abi: abis.wrapper,
      functionName: 'setFuses',
      args: [node, fuses],
    });
  };

  const bindPassportAsync = (
    node: `0x${string}`,
    commitment: `0x${string}`,
  ): Promise<`0x${string}`> => {
    if (!effectiveChainId) throw new Error('Chain ID not set');
    const address = getWrapperAddress(effectiveChainId);
    if (!address || address === '0x0000000000000000000000000000000000000000') {
      throw new Error('KiteWrapper not deployed on this network');
    }
    return writeContractAsync({
      address,
      abi: abis.wrapper,
      functionName: 'bindPassport',
      args: [node, commitment],
    });
  };

  return {
    checkWrapperApprovalAsync,
    approveWrapperAsync,
    wrapAsync,
    unwrapAsync,
    setFusesAsync,
    bindPassportAsync,
    ...rest,
  };
}
