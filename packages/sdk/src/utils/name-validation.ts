const VALID_NAME_REGEX = /^[a-z0-9-]+$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 63;

export type ValidationResult = {
  valid: boolean;
  error?: string;
};

export function normalizeLabel(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/\.kite$/, '');
}

export function isValidName(name: string): ValidationResult {
  const label = normalizeLabel(name);

  if (label.length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }

  if (label.length < MIN_LENGTH) {
    return { valid: false, error: `Name must be at least ${MIN_LENGTH} characters` };
  }

  if (label.length > MAX_LENGTH) {
    return { valid: false, error: `Name must be at most ${MAX_LENGTH} characters` };
  }

  if (!VALID_NAME_REGEX.test(label)) {
    return { valid: false, error: 'Name can only contain lowercase letters, numbers, and hyphens' };
  }

  if (label.startsWith('-') || label.endsWith('-')) {
    return { valid: false, error: 'Name cannot start or end with a hyphen' };
  }

  return { valid: true };
}

export function getLabelLength(name: string): number {
  return normalizeLabel(name).length;
}
