import {
  addresses,
  IPriceOracleAbi,
  KiteBaseRegistrarAbi,
  KiteControllerAbi,
  KiteRegistryAbi,
  KiteResolverAbi,
  KiteReverseRegistrarAbi,
} from '@kiteid/contracts-abi';
import type { Address } from 'viem';
import { kiteAI, kiteAITestnet } from './chains';

export const abis = {
  controller: KiteControllerAbi,
  registry: KiteRegistryAbi,
  baseRegistrar: KiteBaseRegistrarAbi,
  resolver: KiteResolverAbi,
  reverseRegistrar: KiteReverseRegistrarAbi,
  priceOracle: IPriceOracleAbi,
} as const;

export type NetworkKey = 'kiteMainnet' | 'kiteTestnet';

type ContractAddresses = (typeof addresses)[NetworkKey];

export function getAddresses(chainId: number): ContractAddresses | undefined {
  if (chainId === kiteAI.id) return addresses.kiteMainnet;
  if (chainId === kiteAITestnet.id) return addresses.kiteTestnet;
  return undefined;
}

export function getControllerAddress(chainId: number): Address | undefined {
  return getAddresses(chainId)?.controller;
}

export function getResolverAddress(chainId: number): Address | undefined {
  return getAddresses(chainId)?.resolver;
}

export { addresses };
