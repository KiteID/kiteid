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

export function getAddresses(chainId: number): ContractAddresses {
  if (chainId === kiteAI.id) return addresses.kiteMainnet;
  if (chainId === kiteAITestnet.id) return addresses.kiteTestnet;
  throw new Error(`Unsupported chain ID: ${chainId}`);
}

export function getControllerAddress(chainId: number): Address {
  return getAddresses(chainId).controller;
}

export function getResolverAddress(chainId: number): Address {
  return getAddresses(chainId).resolver;
}

export { addresses };
