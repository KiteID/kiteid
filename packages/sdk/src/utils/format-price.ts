import { formatEther } from 'viem';

export function formatKitePrice(value: bigint, decimals = 2): string {
  const formatted = formatEther(value);
  const num = Number.parseFloat(formatted);

  if (num === 0) return '0';
  if (num < 0.01) return '<0.01';

  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export function formatKitePriceWithSymbol(value: bigint, decimals = 2): string {
  return `${formatKitePrice(value, decimals)} KITE`;
}
