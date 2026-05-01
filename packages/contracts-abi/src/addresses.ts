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
    wrapper: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  },
  kiteTestnet: {
    chainId: 2368,
    registry: '0xb54a0D86d9059bC2db72BFfD1FAf6a87b9F0B036' as `0x${string}`,
    baseRegistrar: '0x485cB7C9a8aC6fa4Cc60C489AE0221aFfdCC5841' as `0x${string}`,
    controller: '0xBD6a09D7227F56E79327d680183317C10A1370Df' as `0x${string}`,
    resolver: '0xfC69694BBd6b85Fd9b4aC5ddBD647b4f2196CC68' as `0x${string}`,
    priceOracle: '0x97972ee9Ca8cdB78d4897B016FDF4755240b6F77' as `0x${string}`,
    reverseRegistrar: '0x442FEe8572F4314A45bA2D81e32Db91fCB079E2D' as `0x${string}`,
    wrapper: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  },
} as const;
