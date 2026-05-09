const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type T = (key: string) => string;

export function validateEmail(value: string, t: T): string | undefined {
  if (!value.trim()) return t('validation.emailRequired');
  if (!EMAIL_RE.test(value.trim())) return t('validation.emailInvalid');
  return undefined;
}

export function validatePassword(value: string, t: T): string | undefined {
  if (!value) return t('validation.passwordRequired');
  if (value.length < 8) return t('validation.passwordShort');
  return undefined;
}

export function validateName(value: string, t: T): string | undefined {
  if (!value.trim()) return t('validation.nameRequired');
  return undefined;
}
