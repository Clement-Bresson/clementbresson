// Config-only: it locates the articles from its own path, which is wrong once bundled.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { isLive } from "./publish-date.mjs";

const root = fileURLToPath(new URL("../content/blog/", import.meta.url));

function readDate(file, key) {
  const m = readFileSync(file, "utf8").match(
    new RegExp(`^${key}:\\s*['"]?([^'"\\n]+)`, "m"),
  );
  return m ? new Date(m[1].trim()) : undefined;
}

export function postLastModified() {
  const out = new Map();
  if (!existsSync(root)) return out;
  for (const slug of readdirSync(root, { withFileTypes: true })) {
    if (!slug.isDirectory()) continue;
    for (const lang of ["en", "fr"]) {
      const file = join(root, slug.name, `${lang}.md`);
      if (!existsSync(file)) continue;
      const published = readDate(file, "pubDate");
      if (!published || Number.isNaN(published.getTime()) || !isLive(published))
        continue;
      const date = readDate(file, "updatedDate") ?? published;
      if (!Number.isNaN(date.getTime())) out.set(`${lang}/${slug.name}`, date);
    }
  }
  return out;
}

export function latestPostDate() {
  const dates = [...postLastModified().values()];
  return dates.length
    ? new Date(Math.max(...dates.map((d) => d.getTime())))
    : undefined;
}
