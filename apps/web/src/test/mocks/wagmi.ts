import type { Mock } from 'vitest';
import { vi } from 'vitest';

export const mockAccount = {
  address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
  isConnected: true,
  isDisconnected: false,
  status: 'connected' as const,
};

export const mockUseAccount: Mock = vi.fn(() => mockAccount);
export const mockUseChainId: Mock = vi.fn(() => 2368);
export const mockUseSwitchChain: Mock = vi.fn(() => ({ switchChain: vi.fn() }));
export const mockUseBalance: Mock = vi.fn(() => ({
  data: { value: 1000000000000000000n, symbol: 'KITE', decimals: 18 },
  isLoading: false,
}));
export const mockUseWaitForTransactionReceipt: Mock = vi.fn(() => ({
  isSuccess: false,
  isError: false,
  isLoading: false,
}));

vi.mock('wagmi', () => ({
  useAccount: mockUseAccount,
  useChainId: mockUseChainId,
  useBalance: mockUseBalance,
  useSwitchChain: mockUseSwitchChain,
  useReadContract: vi.fn(() => ({ data: undefined, isLoading: false })),
  useWriteContract: vi.fn(() => ({
    writeContract: vi.fn(),
    writeContractAsync: vi.fn(),
    data: undefined,
    isPending: false,
  })),
  useWaitForTransactionReceipt: mockUseWaitForTransactionReceipt,
}));
