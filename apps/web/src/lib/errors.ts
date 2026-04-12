const ERROR_MAP: Record<string, string> = {
  CommitmentNotFound: 'Commitment bulunamadı. Kayıt işlemini yeniden başlatın.',
  CommitmentTooNew: 'Geri sayım tamamlanmadan kayıt yapılamaz.',
  CommitmentTooOld: 'Commitment süresi doldu. Yeniden başlatın.',
  InsufficientValue: 'Yetersiz KITE gönderildi. Fiyat değişmiş olabilir.',
  NameNotAvailable: 'Bu isim zaten kayıtlı.',
  NameReserved: 'Bu isim rezerve edilmiş.',
  DurationTooShort: 'Süre çok kısa. Minimum 1 yıl.',
  Unauthorized: 'Bu işlem için yetkiniz yok.',
};

export function decodeContractError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Bilinmeyen bir hata oluştu.';

  const errorObj = error as {
    message?: string;
    shortMessage?: string;
    cause?: { data?: { errorName?: string } };
  };

  // Check for known contract error names
  const errorName = errorObj.cause?.data?.errorName;
  if (errorName && ERROR_MAP[errorName]) {
    return ERROR_MAP[errorName];
  }

  // Check for user rejection
  const message = errorObj.shortMessage || errorObj.message || '';
  if (message.includes('User rejected') || message.includes('user rejected')) {
    return 'İşlem reddedildi.';
  }
  if (message.includes('insufficient funds')) {
    return 'Yetersiz bakiye. Hesabınıza KITE yükleyin.';
  }

  return errorObj.shortMessage || 'Bir hata oluştu. Lütfen tekrar deneyin.';
}
