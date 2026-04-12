import { describe, expect, it } from 'vitest';
import { decodeContractError } from '../errors';

describe('decodeContractError', () => {
  it('should decode known contract error', () => {
    const error = { cause: { data: { errorName: 'NameNotAvailable' } } };
    expect(decodeContractError(error)).toBe('Bu isim zaten kayıtlı.');
  });

  it('should decode user rejection', () => {
    const error = { shortMessage: 'User rejected the request.' };
    expect(decodeContractError(error)).toBe('İşlem reddedildi.');
  });

  it('should decode insufficient funds', () => {
    const error = { message: 'insufficient funds for transfer' };
    expect(decodeContractError(error)).toBe('Yetersiz bakiye. Hesabınıza KITE yükleyin.');
  });

  it('should return generic message for unknown errors', () => {
    const error = { message: 'something weird' };
    expect(decodeContractError(error)).toBe('Bir hata oluştu. Lütfen tekrar deneyin.');
  });

  it('should handle null/undefined', () => {
    expect(decodeContractError(null)).toBe('Bilinmeyen bir hata oluştu.');
    expect(decodeContractError(undefined)).toBe('Bilinmeyen bir hata oluştu.');
  });

  it('should prefer shortMessage over generic message', () => {
    const error = { shortMessage: 'Gas estimation failed', message: 'something' };
    expect(decodeContractError(error)).toBe('Gas estimation failed');
  });
});
