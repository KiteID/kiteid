export { kiteAI, kiteAITestnet } from './chains';
export type { NetworkKey } from './contracts';
export {
  abis,
  addresses,
  getAddresses,
  getControllerAddress,
  getResolverAddress,
  getWrapperAddress,
} from './contracts';
export type { ActivityEvent, IndexedDomain } from './hooks';
export {
  useActivityFeed,
  useDomainDetail,
  useDomainStats,
  useIndexedNames,
  useKiteAvailable,
  useKiteCommit,
  useKiteCommitments,
  useKiteIsReserved,
  useKiteNameExpiry,
  useKiteNameOwner,
  useKiteRegister,
  useKiteRenew,
  useKiteRentPrice,
  useKiteResolver,
  useWrapName,
} from './hooks';
export type { Price, RegistrationParams } from './types';
export type { ValidationResult } from './utils';
export {
  daysUntilExpiry,
  formatKitePrice,
  formatKitePriceWithSymbol,
  generateSecret,
  getLabelLength,
  humanDuration,
  isValidName,
  KITE_NODE,
  kiteLabelhash,
  kiteNamehash,
  labelhash,
  makeCommitment,
  namehash,
  normalizeLabel,
  SECONDS_PER_DAY,
  SECONDS_PER_YEAR,
  secondsToYears,
  yearsToSeconds,
} from './utils';
