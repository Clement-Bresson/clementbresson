/**
 * schema.org JSON-LD builders. Everything hangs off one Person entity
 * (`#person`) and one WebSite entity (`#website`) so search and AI engines
 * resolve the home page, the blog and every article to the same author.
 */
import { getAbsoluteLocaleUrl } from "astro:i18n";
import { sameAs } from "../data/links";
import { tagCopy, tagIds, type TagId } from "../data/tags";
import { getCopy, locales, type Locale } from "../i18n";
import {
  blogPath,
  postPath,
  tagPath,
  type Post,
  type TagSummary,
} from "./blog";

type Node = Record<string, unknown>;

const tagLabel = (id: TagId, locale: Locale) => tagCopy(id, locale).label;

const siteUrl = (site: URL | undefined) =>
  (site ?? new URL("https://clementbresson.com")).origin + "/";

export const personId = (site: URL | undefined) => `${siteUrl(site)}#person`;
export const websiteId = (site: URL | undefined) => `${siteUrl(site)}#website`;

export function personNode(
  site: URL | undefined,
  locale: Locale,
  portraitUrl: string,
): Node {
  const t = getCopy(locale);
  return {
    "@type": "Person",
    "@id": personId(site),
    name: t.name,
    url: siteUrl(site),
    image: { "@type": "ImageObject", url: portraitUrl },
    jobTitle: t.title,
    description: t.p1,
    alumniOf: { "@type": "CollegeOrUniversity", name: "ESSEC Business School" },
    knowsLanguage: locales.map((l) => getCopy(l).htmlLang),
    knowsAbout: tagIds
      .filter((id) => id !== "site")
      .map((id) => tagLabel(id, locale)),
    sameAs,
  };
}

export function websiteNode(site: URL | undefined, locale: Locale): Node {
  const t = getCopy(locale);
  return {
    "@type": "WebSite",
    "@id": websiteId(site),
    url: siteUrl(site),
    name: t.name,
    inLanguage: locales.map((l) => getCopy(l).htmlLang),
    publisher: { "@id": personId(site) },
  };
}

export function breadcrumbNode(items: { name: string; url: string }[]): Node {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function blogNode(
  site: URL | undefined,
  locale: Locale,
  posts: Post[],
): Node {
  const t = getCopy(locale);
  const url = getAbsoluteLocaleUrl(locale, blogPath);
  return {
    "@type": "Blog",
    "@id": `${url}#blog`,
    url,
    name: t.blog.metaTitle,
    description: t.blog.description,
    inLanguage: t.htmlLang,
    author: { "@id": personId(site) },
    publisher: { "@id": personId(site) },
    isPartOf: { "@id": websiteId(site) },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      "@id": getAbsoluteLocaleUrl(locale, postPath(p.slug)),
      headline: p.data.title,
      url: getAbsoluteLocaleUrl(locale, postPath(p.slug)),
      datePublished: p.data.pubDate.toISOString(),
    })),
  };
}

export function tagPageNode(
  site: URL | undefined,
  locale: Locale,
  tag: TagSummary,
): Node {
  const t = getCopy(locale);
  const url = getAbsoluteLocaleUrl(locale, tagPath(tag.id));
  return {
    "@type": "CollectionPage",
    "@id": url,
    url,
    name: `${tag.label} — ${t.blog.metaTitle}`,
    description: tag.description,
    inLanguage: t.htmlLang,
    isPartOf: { "@id": `${getAbsoluteLocaleUrl(locale, blogPath)}#blog` },
    about: { "@type": "Thing", name: tag.label },
    hasPart: tag.posts.map((p) => ({
      "@type": "BlogPosting",
      "@id": getAbsoluteLocaleUrl(locale, postPath(p.slug)),
      headline: p.data.title,
      url: getAbsoluteLocaleUrl(locale, postPath(p.slug)),
      datePublished: p.data.pubDate.toISOString(),
    })),
  };
}

export function blogPostingNode(
  site: URL | undefined,
  post: Post,
  opts: {
    coverUrl?: string;
    fallbackImageUrl: string;
    wordCount: number;
    readingMinutes: number;
  },
): Node {
  const t = getCopy(post.locale);
  const url = getAbsoluteLocaleUrl(post.locale, postPath(post.slug));
  const blogUrl = getAbsoluteLocaleUrl(post.locale, blogPath);
  return {
    "@type": "BlogPosting",
    "@id": url,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: post.data.title,
    description: post.data.description,
    image: [opts.coverUrl ?? opts.fallbackImageUrl],
    datePublished: post.data.pubDate.toISOString(),
    dateModified: (post.data.updatedDate ?? post.data.pubDate).toISOString(),
    author: { "@id": personId(site) },
    publisher: { "@id": personId(site) },
    isPartOf: { "@id": `${blogUrl}#blog` },
    inLanguage: t.htmlLang,
    ...(post.data.tags.length
      ? {
          keywords: post.data.tags
            .map((id) => tagLabel(id, post.locale))
            .join(", "),
        }
      : {}),
    ...(post.data.tags.length
      ? { articleSection: tagLabel(post.data.tags[0], post.locale) }
      : {}),
    wordCount: opts.wordCount,
    timeRequired: `PT${opts.readingMinutes}M`,
    isAccessibleForFree: true,
    ...(post.data.linkedin ? { sameAs: [post.data.linkedin] } : {}),
    ...(post.data.sources.length
      ? {
          citation: post.data.sources.map((s) => ({
            "@type": "CreativeWork",
            name: s.title,
            ...(s.author
              ? { author: { "@type": "Person", name: s.author } }
              : {}),
            ...(s.year ? { datePublished: String(s.year) } : {}),
            ...(s.url ? { url: s.url } : {}),
          })),
        }
      : {}),
  };
}

/** Wraps nodes in a single JSON-LD graph. */
export function graph(nodes: Node[]): Node {
  return { "@context": "https://schema.org", "@graph": nodes };
}
