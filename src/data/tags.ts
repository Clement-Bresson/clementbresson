import type { Locale } from "../i18n/ui";
import vocabulary from "./tags.json";

interface TagCopy {
  label: string;
  description: string;
}

export const tags = vocabulary satisfies Record<
  string,
  Record<Locale, TagCopy>
>;

export type TagId = keyof typeof tags;

export const tagIds = Object.keys(tags) as [TagId, ...TagId[]];

export function tagCopy(id: TagId, locale: Locale): TagCopy {
  return tags[id][locale];
}
