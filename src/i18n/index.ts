import { en } from './en';
import { fr } from './fr';
import { defaultLocale, locales, type Copy, type Locale } from './ui';

export { defaultLocale, locales, type Copy, type Locale };

const copy: Record<Locale, Copy> = { en, fr };

export function getCopy(locale: Locale): Copy {
  return copy[locale];
}
