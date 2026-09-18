import { getCollection, type CollectionEntry } from "astro:content";
import { getAbsoluteLocaleUrl, getRelativeLocaleUrl } from "astro:i18n";
import { tagCopy, tagIds, type TagId } from "../data/tags";
import { locales, type Locale } from "../i18n";
import { isLive } from "./publish-date.ts";

export type Post = CollectionEntry<"blog"> & { slug: string; locale: Locale };

const includeUnpublished =
  import.meta.env.DEV || process.env.SHOW_DRAFTS === "1";

function parseId(id: string): { slug: string; locale: Locale } {
  const [slug, locale] = id.split("/");
  if (!slug || !locale || !(locales as readonly string[]).includes(locale)) {
    throw new Error(
      `Unexpected blog entry id "${id}". Expected "<slug>/<en|fr>".`,
    );
  }
  return { slug, locale: locale as Locale };
}

let cache: Promise<Post[]> | undefined;

export function getAllPosts(): Promise<Post[]> {
  cache ??= (async () => {
    const entries = await getCollection(
      "blog",
      (e) => includeUnpublished || (!e.data.draft && isLive(e.data.pubDate)),
    );
    const posts = entries.map((e) => ({ ...e, ...parseId(e.id) }));

    const bySlug = new Map<string, Set<Locale>>();
    for (const p of posts) {
      bySlug.set(p.slug, (bySlug.get(p.slug) ?? new Set()).add(p.locale));
    }
    const incomplete = [...bySlug]
      .filter(([, langs]) => langs.size !== locales.length)
      .map(
        ([slug, langs]) =>
          `${slug} (missing: ${locales.filter((l) => !langs.has(l)).join(", ")})`,
      );
    if (incomplete.length) {
      throw new Error(
        `Every blog article needs ${locales.map((l) => `${l}.md`).join(" and ")}. Incomplete: ${incomplete.join("; ")}`,
      );
    }

    const tagKey = (p: Post) => [...p.data.tags].sort().join(",");
    const mismatched = [...bySlug.keys()].filter((slug) => {
      const keys = new Set(posts.filter((p) => p.slug === slug).map(tagKey));
      return keys.size > 1;
    });
    if (mismatched.length) {
      throw new Error(
        `Both languages of an article must have the same tags. Mismatched: ${mismatched.join(", ")}`,
      );
    }

    return posts.sort(
      (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
    );
  })();
  return cache;
}

export async function getPosts(locale: Locale): Promise<Post[]> {
  return (await getAllPosts()).filter((p) => p.locale === locale);
}

export const postPath = (slug: string) => `blog/${slug}/`;
export const blogPath = "blog/";
export const tagPath = (tag: TagId) => `blog/tag/${tag}/`;

export interface TagSummary {
  id: TagId;
  label: string;
  description: string;
  posts: Post[];
}

export async function getTags(locale: Locale): Promise<TagSummary[]> {
  const posts = await getPosts(locale);
  return tagIds
    .map((id) => ({
      id,
      ...tagCopy(id, locale),
      posts: posts.filter((p) => p.data.tags.includes(id)),
    }))
    .filter((t) => t.posts.length > 0);
}

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function wordCount(body: string | undefined): number {
  return body ? body.trim().split(/\s+/).filter(Boolean).length : 0;
}

export function readingMinutes(body: string | undefined): number {
  return Math.max(1, Math.round(wordCount(body) / 200));
}

export async function getRelated(post: Post, limit = 3): Promise<Post[]> {
  const others = (await getPosts(post.locale)).filter(
    (p) => p.slug !== post.slug,
  );
  const shared = (p: Post) =>
    p.data.tags.filter((t) => post.data.tags.includes(t)).length;
  return others
    .map((p) => ({ p, score: shared(p) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.p.data.pubDate.getTime() - a.p.data.pubDate.getTime(),
    )
    .slice(0, limit)
    .map(({ p }) => p);
}

export const fileUrl = (locale: Locale, file: string) =>
  getAbsoluteLocaleUrl(locale, file).replace(/\/$/, "");
export const filePath = (locale: Locale, file: string) =>
  getRelativeLocaleUrl(locale, file).replace(/\/$/, "");
