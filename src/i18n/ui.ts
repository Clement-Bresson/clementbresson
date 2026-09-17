export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export interface Copy {
  htmlLang: string;
  ogLocale: string;
  metaTitle: string;
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
    title: string;
    metaTitle: string;
    description: string;
    empty: string;
    backToBlog: string;
    published: string;
    updated: string;
    rss: string;
    topics: string;
    related: string;
    sources: string;
    originallyOnLinkedIn: string;
    minRead: string;
  };
}
