export const links = {
  linkedin: 'https://www.linkedin.com/in/cl%C3%A9ment-bresson-37111944/',
  // TODO: replace with the blog URL once it exists.
  blog: '#blog',
  github: 'https://github.com/Clement-Bresson',
  malt: 'https://www.malt.fr/profile/clementbresson',
  email: 'mailto:clement0bresson@gmail.com',
} as const;

export type LinkKey = keyof typeof links;

/** Display order of the link row. */
export const linkOrder: LinkKey[] = ['linkedin', 'blog', 'github', 'malt', 'email'];
