export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export interface Copy {
  /** BCP 47 tag for <html lang> and og:locale. */
  htmlLang: string;
  ogLocale: string;
  metaTitle: string;
  name: string;
  title: string;
  p1: string;
  p2: string;
  p3: string;
  p4: string;
  links: {
    linkedin: string;
    blog: string;
    github: string;
    malt: string;
    email: string;
  };
  portraitAlt: string;
  langSwitchLabel: string;
}
