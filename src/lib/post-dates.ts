// Config-only: it locates the articles from its own path, which is wrong once bundled.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { updatedDate } from "./modified-date.ts";
import { isLive } from "./publish-date.ts";

const root = fileURLToPath(new URL("../content/blog/", import.meta.url));

function readFrontmatter(file: string): string {
  const m = readFileSync(file, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? m[1] : "";
}

function readDate(frontmatter: string, key: string): Date | undefined {
  const m = frontmatter.match(new RegExp(`^${key}:\\s*['"]?([^'"\\n]+)`, "m"));
  return m ? new Date(m[1].trim()) : undefined;
}

export function postLastModified(): Map<string, Date> {
  const out = new Map<string, Date>();
  if (!existsSync(root)) return out;
  for (const slug of readdirSync(root, { withFileTypes: true })) {
    if (!slug.isDirectory()) continue;
    for (const lang of ["en", "fr"]) {
      const file = join(root, slug.name, `${lang}.md`);
      if (!existsSync(file)) continue;
      const frontmatter = readFrontmatter(file);
      if (/^draft:\s*true\s*$/m.test(frontmatter)) continue;
      const published = readDate(frontmatter, "pubDate");
      if (!published || Number.isNaN(published.getTime()) || !isLive(published))
        continue;
      const date =
        updatedDate(file, published, readDate(frontmatter, "updatedDate")) ??
        published;
      if (!Number.isNaN(date.getTime())) out.set(`${lang}/${slug.name}`, date);
    }
  }
  return out;
}

export function latestPostDate(): Date | undefined {
  const dates = [...postLastModified().values()];
  return dates.length
    ? new Date(Math.max(...dates.map((d) => d.getTime())))
    : undefined;
}
