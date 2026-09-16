export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export interface Copy {
  /** BCP 47 tag for <html lang> and og:locale. */
  htmlLang: string;
  ogLocale: string;
  metaTitle: string;
  /** Home page meta description, 120–160 characters. */
  metaDescription: string;
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
  blog: {
    /** Page heading and breadcrumb label. */
    title: string;
    metaTitle: string;
    /** Meta description of the index page and of the RSS feed. */
    description: string;
    empty: string;
    backToBlog: string;
    published: string;
    updated: string;
    rss: string;
    /** Heading of the tag list on the index and label before tags on an article. */
    topics: string;
    related: string;
    sources: string;
    originallyOnLinkedIn: string;
    /** Suffix after the number of minutes, e.g. "min read". */
    minRead: string;
  };
}
