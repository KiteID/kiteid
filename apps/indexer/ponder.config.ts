import { createConfig } from 'ponder';
import {
  KiteBaseRegistrarAbi,
  KiteControllerAbi,
  KiteRegistryAbi,
  KiteResolverAbi,
  KiteWrapperAbi,
} from './abis';

// Contract addresses — updated after deployment
const CONTROLLER = (process.env.CONTROLLER_ADDRESS ||
  '0x0000000000000000000000000000000000000000') as `0x${string}`;
const BASE_REGISTRAR = (process.env.BASE_REGISTRAR_ADDRESS ||
  '0x0000000000000000000000000000000000000000') as `0x${string}`;
const REGISTRY = (process.env.REGISTRY_ADDRESS ||
  '0x0000000000000000000000000000000000000000') as `0x${string}`;
const RESOLVER = (process.env.RESOLVER_ADDRESS ||
  '0x0000000000000000000000000000000000000000') as `0x${string}`;
const WRAPPER = (process.env.WRAPPER_ADDRESS ||
  '0x0000000000000000000000000000000000000000') as `0x${string}`;

const START_BLOCK = Number(process.env.START_BLOCK || '0');

export default createConfig({
  database: {
    kind: 'postgres',
  },
  chains: {
    kiteAI: {
      id: 2366,
      rpc: process.env.KITE_RPC_URL || 'https://rpc.gokite.ai/',
    },
    kiteAITestnet: {
      id: 2368,
      rpc: process.env.KITE_TESTNET_RPC_URL || 'https://rpc-testnet.gokite.ai/',
    },
  },
  contracts: {
    KiteController: {
      chain: {
        kiteAITestnet: {
          address: CONTROLLER,
          startBlock: START_BLOCK,
        },
      },
      abi: KiteControllerAbi,
    },
    KiteBaseRegistrar: {
      chain: {
        kiteAITestnet: {
          address: BASE_REGISTRAR,
          startBlock: START_BLOCK,
        },
      },
      abi: KiteBaseRegistrarAbi,
    },
    KiteRegistry: {
      chain: {
        kiteAITestnet: {
          address: REGISTRY,
          startBlock: START_BLOCK,
        },
      },
      abi: KiteRegistryAbi,
    },
    KiteResolver: {
      chain: {
        kiteAITestnet: {
          address: RESOLVER,
          startBlock: START_BLOCK,
        },
      },
      abi: KiteResolverAbi,
    },
    KiteWrapper: {
      chain: {
        kiteAITestnet: {
          address: WRAPPER,
          startBlock: START_BLOCK,
        },
      },
      abi: KiteWrapperAbi,
    },
  },
});
