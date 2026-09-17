export const links = {
  linkedin: "https://www.linkedin.com/in/cl%C3%A9ment-bresson-37111944/",
  blog: "blog/",
  github: "https://github.com/Clement-Bresson",
  malt: "https://www.malt.fr/profile/clementbresson",
  email: "mailto:clement0bresson@gmail.com",
} as const;

export type LinkKey = keyof typeof links;

export const linkOrder: LinkKey[] = [
  "linkedin",
  "blog",
  "github",
  "malt",
  "email",
];

export const sameAs = [links.linkedin, links.github, links.malt];
