import rss from "@astrojs/rss";
import { getAbsoluteLocaleUrl } from "astro:i18n";
import { getCopy, type Locale } from "../i18n";
import { blogPath, fileUrl, getPosts, postPath } from "./blog";

export async function buildFeed(locale: Locale): Promise<Response> {
  const t = getCopy(locale);
  const posts = await getPosts(locale);
  return rss({
    title: t.blog.metaTitle,
    description: t.blog.description,
    site: getAbsoluteLocaleUrl(locale, blogPath),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: getAbsoluteLocaleUrl(locale, postPath(post.slug)),
      categories: post.data.tags,
    })),
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: `<language>${t.htmlLang}</language><atom:link href="${fileUrl(locale, "rss.xml")}" rel="self" type="application/rss+xml"/>`,
  });
}
