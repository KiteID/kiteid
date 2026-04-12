// Contract addresses per network
// Updated after deployment — do not edit manually during development

export const addresses = {
  kiteMainnet: {
    chainId: 2366,
    registry: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    baseRegistrar: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    controller: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    resolver: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    priceOracle: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    reverseRegistrar: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  },
  kiteTestnet: {
    chainId: 2368,
    registry: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    baseRegistrar: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    controller: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    resolver: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    priceOracle: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    reverseRegistrar: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  },
} as const;
