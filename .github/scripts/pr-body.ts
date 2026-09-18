import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import yaml from "js-yaml";

type Source = { title: string; author?: string; year?: number; url?: string };
type Frontmatter = { title?: string; sources?: Source[] };

const slug = process.argv[2];
if (!slug) {
  console.error("usage: node .github/scripts/pr-body.ts <slug>");
  process.exit(1);
}
const dir = `src/content/blog/${slug}`;

async function load(locale: string) {
  const raw = await readFile(`${dir}/${locale}.md`, "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`${locale}.md: no frontmatter`);
  return {
    data: yaml.load(m[1], { schema: yaml.JSON_SCHEMA }) as Frontmatter,
    body: m[2],
  };
}

const en = await load("en");
const fr = await load("fr");
const summary = existsSync(".pipeline/summary.md")
  ? (await readFile(".pipeline/summary.md", "utf8")).trim()
  : "_The agent left no summary._";

const todos: string[] = [];
for (const [locale, { body }] of [
  ["fr", fr],
  ["en", en],
] as const) {
  for (const m of body.matchAll(/<!--\s*TODO\s*([^>]*?)\s*-->/g))
    todos.push(`- \`${locale}.md\`: ${m[1]}`);
}

const sources = (en.data.sources ?? []).map((s) => {
  const who = [s.author, s.year].filter(Boolean).join(", ");
  const label = who ? `${s.title} (${who})` : s.title;
  return `- ${s.url ? `[${label}](${s.url})` : label}`;
});

const changed = execFileSync(
  "git",
  ["diff", "--name-only", "--", "src/content/blog"],
  { encoding: "utf8" },
)
  .split("\n")
  .filter(Boolean)
  .map((f) => `- \`${f}\``);

const lines = [
  `# ${en.data.title}`,
  "",
  `**FR**: ${fr.data.title}`,
  "",
  summary,
  "",
  "## TODO markers",
  "",
  ...(todos.length ? todos : ["None found."]),
  "",
  "## Sources",
  "",
  ...(sources.length ? sources : ["None in the frontmatter."]),
  "",
  "## Files",
  "",
  `- \`${dir}/en.md\`, \`${dir}/fr.md\` (new)`,
  ...changed,
];
console.log(lines.join("\n"));
