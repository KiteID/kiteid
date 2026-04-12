export { kiteAI, kiteAITestnet } from './chains';
export type { KiteConfigOptions } from './config';
export { createKiteConfig } from './config';
export type { NetworkKey } from './contracts';
export {
  abis,
  addresses,
  getAddresses,
  getControllerAddress,
  getResolverAddress,
} from './contracts';
export {
  useKiteAvailable,
  useKiteCommitments,
  useKiteIsReserved,
  useKiteRentPrice,
} from './hooks';
export type { Price, RegistrationParams } from './types';
export type { ValidationResult } from './utils';
export {
  daysUntilExpiry,
  formatKitePrice,
  formatKitePriceWithSymbol,
  getLabelLength,
  humanDuration,
  isValidName,
  KITE_NODE,
  kiteLabelhash,
  kiteNamehash,
  labelhash,
  namehash,
  normalizeLabel,
  SECONDS_PER_DAY,
  SECONDS_PER_YEAR,
  secondsToYears,
  yearsToSeconds,
} from './utils';
