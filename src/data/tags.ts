import type { Locale } from "../i18n/ui";
import vocabulary from "./tags.json";

interface TagCopy {
  label: string;
  /** One sentence shown under the heading of the tag page and used as its meta description. */
  description: string;
}

/**
 * The tag vocabulary lives in `tags.json` so `scripts/article.mjs` reads the
 * same source. Keys are URL slugs shared by both languages
 * (`/blog/tag/<key>/` and `/fr/blog/tag/<key>/`), values are the localized
 * labels. Article frontmatter may only use keys listed there, which keeps the
 * taxonomy deliberate and every tag page paired across languages.
 *
 * Add a tag there first, then use it in articles. Never rename a key that has
 * been published: the URL would change.
 */
export const tags = vocabulary satisfies Record<
  string,
  Record<Locale, TagCopy>
>;

export type TagId = keyof typeof tags;

export const tagIds = Object.keys(tags) as [TagId, ...TagId[]];

export function tagCopy(id: TagId, locale: Locale): TagCopy {
  return tags[id][locale];
}
