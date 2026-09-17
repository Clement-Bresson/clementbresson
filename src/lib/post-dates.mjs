// Used by astro.config to set per-URL <lastmod> in the sitemap. The config
// runs before the content layer exists, so this reads frontmatter directly.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../content/blog/", import.meta.url).pathname;

function readDate(file, key) {
  const m = readFileSync(file, "utf8").match(
    new RegExp(`^${key}:\\s*['"]?([^'"\\n]+)`, "m"),
  );
  return m ? new Date(m[1].trim()) : undefined;
}

/** Map of "<lang>/<slug>" -> last modification date, e.g. "fr/hello" */
export function postLastModified() {
  const out = new Map();
  if (!existsSync(root)) return out;
  for (const slug of readdirSync(root, { withFileTypes: true })) {
    if (!slug.isDirectory()) continue;
    for (const lang of ["en", "fr"]) {
      const file = join(root, slug.name, `${lang}.md`);
      if (!existsSync(file)) continue;
      const date = readDate(file, "updatedDate") ?? readDate(file, "pubDate");
      if (date && !Number.isNaN(date.getTime()))
        out.set(`${lang}/${slug.name}`, date);
    }
  }
  return out;
}

/** Newest publication/update date across all articles, for list pages. */
export function latestPostDate() {
  const dates = [...postLastModified().values()];
  return dates.length
    ? new Date(Math.max(...dates.map((d) => d.getTime())))
    : undefined;
}
