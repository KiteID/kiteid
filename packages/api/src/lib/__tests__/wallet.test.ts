import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Wallet module reads env at import time, so we reset the module cache per test
async function loadWalletModule() {
  vi.resetModules();
  return await import('../wallet');
}

const originalEnv = { ...process.env };

describe('wallet client chain selection', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_CHAIN_ID;
    delete process.env.KITE_RPC_URL;
    delete process.env.KITE_TESTNET_RPC_URL;
    delete process.env.RELAYER_PRIVATE_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns undefined wallet client when RELAYER_PRIVATE_KEY is unset', async () => {
    process.env.NEXT_PUBLIC_CHAIN_ID = '2368';
    const { relayerWalletClient, relayerAccount } = await loadWalletModule();
    expect(relayerWalletClient).toBeUndefined();
    expect(relayerAccount).toBeUndefined();
  });

  it('uses testnet chain id when NEXT_PUBLIC_CHAIN_ID=2368', async () => {
    process.env.NEXT_PUBLIC_CHAIN_ID = '2368';
    process.env.RELAYER_PRIVATE_KEY =
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
    const { relayerWalletClient } = await loadWalletModule();
    expect(relayerWalletClient).toBeDefined();
    expect(relayerWalletClient?.chain?.id).toBe(2368);
    expect(relayerWalletClient?.chain?.name).toBe('Kite Testnet');
  });

  it('uses mainnet chain id when NEXT_PUBLIC_CHAIN_ID=2366', async () => {
    process.env.NEXT_PUBLIC_CHAIN_ID = '2366';
    process.env.RELAYER_PRIVATE_KEY =
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
    const { relayerWalletClient } = await loadWalletModule();
    expect(relayerWalletClient).toBeDefined();
    expect(relayerWalletClient?.chain?.id).toBe(2366);
    expect(relayerWalletClient?.chain?.name).toBe('Kite Mainnet');
  });

  it('selects mainnet RPC URL when chainId is 2366', async () => {
    process.env.NEXT_PUBLIC_CHAIN_ID = '2366';
    process.env.KITE_RPC_URL = 'https://custom-mainnet.example.com/';
    process.env.KITE_TESTNET_RPC_URL = 'https://custom-testnet.example.com/';
    process.env.RELAYER_PRIVATE_KEY =
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
    const { relayerWalletClient } = await loadWalletModule();
    expect(relayerWalletClient?.chain?.rpcUrls.default.http[0]).toBe(
      'https://custom-mainnet.example.com/',
    );
  });

  it('selects testnet RPC URL when chainId is 2368', async () => {
    process.env.NEXT_PUBLIC_CHAIN_ID = '2368';
    process.env.KITE_RPC_URL = 'https://custom-mainnet.example.com/';
    process.env.KITE_TESTNET_RPC_URL = 'https://custom-testnet.example.com/';
    process.env.RELAYER_PRIVATE_KEY =
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
    const { relayerWalletClient } = await loadWalletModule();
    expect(relayerWalletClient?.chain?.rpcUrls.default.http[0]).toBe(
      'https://custom-testnet.example.com/',
    );
  });

  it('falls back to default testnet RPC when env unset', async () => {
    process.env.NEXT_PUBLIC_CHAIN_ID = '2368';
    process.env.RELAYER_PRIVATE_KEY =
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
    const { relayerWalletClient } = await loadWalletModule();
    expect(relayerWalletClient?.chain?.rpcUrls.default.http[0]).toBe(
      'https://rpc-testnet.gokite.ai/',
    );
  });
});
