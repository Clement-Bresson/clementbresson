import { getAbsoluteLocaleUrl } from "astro:i18n";
import { tagCopy } from "../data/tags";
import { getCopy, locales, type Locale } from "../i18n";
import {
  blogPath,
  fileUrl,
  getPosts,
  getTags,
  postPath,
  tagPath,
  type Post,
} from "./blog";

const langName: Record<Locale, string> = { en: "English", fr: "Français" };

function header(): string[] {
  const en = getCopy("en");
  const fr = getCopy("fr");
  return [
    `# ${en.name}`,
    "",
    `> ${en.title}. ${en.p1}`,
    "",
    `${en.p2} ${en.p3}`,
    "",
    "The site is bilingual. English pages live at the root, French pages under /fr/. Every article exists in both languages at the same slug.",
    "",
    "## Pages",
    "",
    `- [${en.name} (${langName.en})](${getAbsoluteLocaleUrl("en")}): ${en.title}`,
    `- [${fr.name} (${langName.fr})](${getAbsoluteLocaleUrl("fr")}): ${fr.title}`,
    `- [Blog (${langName.en})](${getAbsoluteLocaleUrl("en", blogPath)}): ${en.blog.description}`,
    `- [Blog (${langName.fr})](${getAbsoluteLocaleUrl("fr", blogPath)}): ${fr.blog.description}`,
    "",
  ];
}

async function topics(): Promise<string[]> {
  const out: string[] = [];
  for (const l of locales) {
    const tags = await getTags(l);
    if (!tags.length) continue;
    out.push(
      `## Topics (${langName[l]})`,
      "",
      ...tags.map(
        (tag) =>
          `- [${tag.label}](${getAbsoluteLocaleUrl(l, tagPath(tag.id))}): ${tag.description}`,
      ),
      "",
    );
  }
  return out;
}

function feeds(): string[] {
  return [
    "## Feeds",
    "",
    ...locales.map((l) => `- [RSS (${langName[l]})](${fileUrl(l, "rss.xml")})`),
    `- [Sitemap](${fileUrl("en", "sitemap-index.xml")})`,
    "",
  ];
}

const postLine = (p: Post) =>
  `- [${p.data.title}](${getAbsoluteLocaleUrl(p.locale, postPath(p.slug))}): ${p.data.description}`;

export async function llmsTxt(): Promise<string> {
  const out = header();
  for (const l of locales) {
    const posts = await getPosts(l);
    if (!posts.length) continue;
    out.push(`## Blog (${langName[l]})`, "", ...posts.map(postLine), "");
  }
  out.push(...(await topics()), ...feeds());
  return out.join("\n");
}

export async function llmsFullTxt(): Promise<string> {
  const out = header();
  for (const l of locales) {
    const posts = await getPosts(l);
    if (!posts.length) continue;
    out.push(`## Blog (${langName[l]})`, "");
    for (const p of posts) {
      const url = getAbsoluteLocaleUrl(l, postPath(p.slug));
      const modified = p.data.updatedDate ?? p.data.pubDate;
      out.push(
        `### ${p.data.title}`,
        "",
        `- URL: ${url}`,
        `- Language: ${getCopy(l).htmlLang}`,
        `- Published: ${p.data.pubDate.toISOString().slice(0, 10)}`,
        `- Updated: ${modified.toISOString().slice(0, 10)}`,
        ...(p.data.tags.length
          ? [
              `- Topics: ${p.data.tags.map((id) => tagCopy(id, l).label).join(", ")}`,
            ]
          : []),
        "",
        p.data.description,
        "",
        (p.body ?? "").trim(),
        "",
        "---",
        "",
      );
    }
  }
  out.push(...feeds());
  return out.join("\n");
}
