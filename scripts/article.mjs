#!/usr/bin/env node
/**
 * Deterministic blog article tooling.
 *
 *   node scripts/article.mjs create <spec.json> [--build] [--force]
 *   node scripts/article.mjs check [<slug>]
 *   node scripts/article.mjs tags
 *   node scripts/article.mjs index [--tag <key>]
 *
 * `create` builds src/content/blog/<slug>/ from a JSON spec: copies and
 * normalises images, writes fr.md and en.md with validated frontmatter, and
 * optionally runs the production build. `check` validates existing articles.
 * The spec format is documented in .claude/skills/blog-article/SKILL.md.
 */
import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import sharp from "sharp";
import { isLive, today } from "../src/lib/publish-date.mjs";

process.stdout.on("error", (e) => {
  if (e.code === "EPIPE") process.exit(0);
});

// Site-specific values. Everything below derives from these.
const SITE = "https://clementbresson.com";
const LOCALES = ["fr", "en"];
const DEFAULT_LOCALE = "en"; // served without a URL prefix
/** Sign-off phrases of the platform the drafts come from, which must not reach the blog. */
const CALL_TO_ACTION =
  /(n'hésitez pas à me suivre|DM ouverts|MP ouverts|follow me|DMs? are open)/i;

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const BLOG = path.join(ROOT, "src/content/blog");
const TAGS_FILE = path.join(ROOT, "src/data/tags.json");
const MAX_IMAGE_WIDTH = 1600;
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif|svg)$/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

const blogPrefix = (locale) =>
  locale === DEFAULT_LOCALE ? "/blog/" : `/${locale}/blog/`;
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const OWN_SITE_LINK = new RegExp(
  `\\]\\(https?:\\/\\/(www\\.)?${escapeRe(new URL(SITE).host)}`,
);
const prefixed = LOCALES.filter((l) => l !== DEFAULT_LOCALE).join("|");
/** Internal article link in any locale, with or without trailing slash or #anchor. Group 1 is the slug. */
const ARTICLE_LINK = new RegExp(
  `\\]\\(\\/(?:(?:${prefixed})\\/)?blog\\/([a-z0-9-]+)\\/?(?:#[^)]*)?\\)`,
  "g",
);
const IMAGE_REF = /!\[[^\]]*\]\(\.\/([^)\s]+)\)/g;

const fail = (msg) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};
const warn = (msg) => console.warn(`! ${msg}`);
const ok = (msg) => console.log(`✓ ${msg}`);

async function tagIds() {
  return Object.keys(JSON.parse(await readFile(TAGS_FILE, "utf8")));
}

/** Body without fenced code blocks, so a `# comment` in a snippet is not read as a heading or a link. */
const prose = (md) =>
  md.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, "");

const count = (text, re) => (text.match(re) ?? []).length;
/** What both languages of an article must have in the same number. */
const shape = (body) => ({
  headings: count(prose(body), /^#{2,6} /gm),
  images: count(body, /!\[[^\]]*\]\(/g),
  "code blocks": count(body, /^(`{3,}|~{3,})/gm) / 2,
});

/** Links to the blog of another language, which must never appear in this locale's body. */
function foreignLinks(body, locale) {
  const text = prose(body);
  return LOCALES.filter((l) => l !== locale).some((l) =>
    text.includes(`](${blogPrefix(l)}`),
  );
}

const yamlString = (s) => JSON.stringify(String(s));

function frontmatter(spec, locale) {
  const l = spec[locale];
  const lines = [
    "---",
    `title: ${yamlString(l.title)}`,
    `description: ${yamlString(l.description)}`,
    `pubDate: ${spec.pubDate}`,
  ];
  if (spec.updatedDate) lines.push(`updatedDate: ${spec.updatedDate}`);
  if (spec.cover) {
    lines.push(`cover: ./${spec.cover}`);
    if (l.coverAlt) lines.push(`coverAlt: ${yamlString(l.coverAlt)}`);
  }
  lines.push(`tags: [${spec.tags.map((t) => `'${t}'`).join(", ")}]`);
  if (spec.linkedin) lines.push(`linkedin: ${spec.linkedin}`);
  if (spec.sources?.length) {
    lines.push("sources:");
    for (const s of spec.sources) {
      lines.push(`  - title: ${yamlString(s.title)}`);
      if (s.author) lines.push(`    author: ${yamlString(s.author)}`);
      if (s.year) lines.push(`    year: ${s.year}`);
      if (s.url) lines.push(`    url: ${s.url}`);
    }
  }
  lines.push(`draft: ${spec.draft ? "true" : "false"}`, "---", "");
  return lines.join("\n");
}

function validateSpec(spec, knownTags) {
  const errors = [];
  if (!SLUG.test(spec.slug ?? ""))
    errors.push("slug must be lowercase kebab-case");
  if (!DAY.test(spec.pubDate ?? "") || Number.isNaN(Date.parse(spec.pubDate)))
    errors.push("pubDate must be YYYY-MM-DD");
  if (
    spec.updatedDate &&
    (!DAY.test(spec.updatedDate) || spec.updatedDate < spec.pubDate)
  )
    errors.push("updatedDate must be YYYY-MM-DD and not before pubDate");
  if (!Array.isArray(spec.tags) || spec.tags.length < 1 || spec.tags.length > 2)
    errors.push("tags must have 1 or 2 entries");
  for (const t of spec.tags ?? [])
    if (!knownTags.includes(t))
      errors.push(
        `unknown tag "${t}" (known: ${knownTags.join(", ")}). Add it to src/data/tags.json first.`,
      );
  if (
    spec.linkedin &&
    !/^https:\/\/www\.linkedin\.com\/(feed\/update\/urn:li:activity:\d+\/?|posts\/[\w%-]+\/?)$/.test(
      spec.linkedin,
    )
  )
    errors.push("linkedin must be a LinkedIn post URL");
  for (const s of spec.sources ?? []) {
    if (!s.title) errors.push("every source needs a title");
    if (s.url && !/^https?:\/\//.test(s.url))
      errors.push(`source url must be absolute: ${s.url}`);
    if (s.year && !(Number.isInteger(s.year) && s.year > 1900 && s.year < 2100))
      errors.push(`source year invalid: ${s.year}`);
  }
  if (spec.cover && !IMAGE_EXT.test(spec.cover))
    errors.push("cover must be an image file name (e.g. cover.jpg)");
  for (const locale of LOCALES) {
    const l = spec[locale];
    if (!l) {
      errors.push(`missing "${locale}" block`);
      continue;
    }
    if (!l.title?.trim()) errors.push(`${locale}.title is required`);
    else if (l.title.length > 65)
      warn(`${locale}.title is ${l.title.length} chars (aim for ≤ 65)`);
    if (!l.description?.trim())
      errors.push(`${locale}.description is required`);
    else if (l.description.length < 120 || l.description.length > 160)
      warn(
        `${locale}.description is ${l.description.length} chars (aim for 120–160)`,
      );
    if (!l.body?.trim())
      errors.push(`${locale}.body (or ${locale}.bodyFile) is required`);
    else {
      const text = prose(l.body);
      if (/^# /m.test(text))
        errors.push(
          `${locale}.body must not contain an H1 (# …): the layout renders the title`,
        );
      if (/^#{2,6} +sources?\s*$/im.test(text))
        errors.push(
          `${locale}.body must not contain a Sources heading: use the "sources" field`,
        );
      if (CALL_TO_ACTION.test(text))
        warn(`${locale}.body still contains call-to-action text`);
      if (OWN_SITE_LINK.test(text))
        errors.push(
          `${locale}.body links to the site with an absolute URL: use ${blogPrefix(locale)}<slug>/`,
        );
      if (foreignLinks(l.body, locale))
        errors.push(
          `${locale}.body links to another language's blog path: use ${blogPrefix(locale)}<slug>/`,
        );
    }
    if (spec.cover && !l.coverAlt)
      warn(`${locale}.coverAlt missing (alt text for the cover)`);
  }
  const bodies = LOCALES.map((l) => spec[l]?.body).filter(Boolean);
  if (bodies.length === LOCALES.length) {
    const [first, ...others] = bodies.map(shape);
    for (const name of Object.keys(first)) {
      if (others.some((o) => o[name] !== first[name]))
        warn(`${LOCALES.join(" and ")} bodies differ in number of ${name}`);
    }
  }
  return errors;
}

const extKind = (f) => path.extname(f).toLowerCase().replace(".jpeg", ".jpg");

async function normaliseImage(from, to) {
  if (/\.(svg|gif)$/i.test(from)) return copyFile(from, to);
  const meta = await sharp(from).metadata();
  // EXIF orientations 5–8 are stored rotated by 90°: the displayed width is the stored height.
  const width = ((meta.orientation ?? 1) >= 5 ? meta.height : meta.width) ?? 0;
  if (width <= MAX_IMAGE_WIDTH) return copyFile(from, to);
  // .rotate() applies the EXIF orientation to the pixels; without it the tag is dropped and phone photos end up sideways.
  await sharp(from)
    .rotate()
    .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
    .toFile(to);
  ok(`${path.basename(to)}: resized ${width}px → ${MAX_IMAGE_WIDTH}px`);
}

async function create(specPath, flags) {
  const spec = JSON.parse(await readFile(specPath, "utf8"));
  const specDir = path.dirname(path.resolve(specPath));
  spec.pubDate ??= today();
  for (const locale of LOCALES) {
    const l = spec[locale];
    if (!l?.bodyFile) continue;
    if (l.body) fail(`${locale}: give either "body" or "bodyFile", not both`);
    const file = path.resolve(specDir, l.bodyFile);
    if (!existsSync(file)) fail(`${locale}.bodyFile not found: ${file}`);
    l.body = await readFile(file, "utf8");
  }

  const errors = validateSpec(spec, await tagIds());
  if (errors.length) fail(errors.join("\n✗ "));

  const images = (spec.images ?? []).map((img) => ({
    from: path.resolve(specDir, img.from),
    as: img.as ?? path.basename(img.from),
  }));
  const placed = new Set(images.map((i) => i.as));
  for (const { from, as } of images) {
    if (!existsSync(from)) fail(`image not found: ${from}`);
    if (!IMAGE_EXT.test(as) || !/^[a-z0-9][a-z0-9._-]*$/.test(as))
      fail(
        `image name must be lowercase, without spaces or folders, with an image extension: ${as}`,
      );
    if (extKind(from) !== extKind(as))
      fail(
        `"${as}" must keep the extension of its source (${extKind(from)}): images are copied, not converted`,
      );
  }
  if (spec.cover && !placed.has(spec.cover))
    fail(`cover "${spec.cover}" is not among the copied images`);
  for (const locale of LOCALES) {
    for (const m of spec[locale].body.matchAll(IMAGE_REF)) {
      if (!placed.has(m[1]))
        fail(
          `${locale}.body references ./${m[1]} but no such image was provided`,
        );
    }
  }

  // Nothing on disk is touched until the whole spec is known to be valid.
  const dir = path.join(BLOG, spec.slug);
  if (existsSync(dir)) {
    if (!flags.force)
      fail(
        `${path.relative(ROOT, dir)} already exists (use --force to overwrite)`,
      );
    await rm(dir, { recursive: true });
  }
  await mkdir(dir, { recursive: true });
  for (const { from, as } of images)
    await normaliseImage(from, path.join(dir, as));
  for (const locale of LOCALES) {
    await writeFile(
      path.join(dir, `${locale}.md`),
      frontmatter(spec, locale) + "\n" + spec[locale].body.trim() + "\n",
    );
  }
  format(dir);
  ok(
    `wrote ${path.relative(ROOT, dir)}/{${LOCALES.join(",")}}.md${placed.size ? ` + ${placed.size} image(s)` : ""}`,
  );
  for (const locale of [
    DEFAULT_LOCALE,
    ...LOCALES.filter((l) => l !== DEFAULT_LOCALE),
  ]) {
    console.log(
      `  ${locale.toUpperCase()} ${SITE}${blogPrefix(locale)}${spec.slug}/`,
    );
  }
  if (spec.draft) warn("draft: visible in `astro dev` only");
  else if (!isLive(spec.pubDate))
    warn(
      `scheduled: excluded from builds until ${spec.pubDate}, then published by the daily deploy`,
    );

  if (flags.build) build();
}

/** Same formatting as a save in the editor, so a new article is not the only unformatted file of the repo. */
function format(dir) {
  const r = spawnSync(
    "npx",
    ["prettier", "--write", "--log-level", "warn", dir],
    { cwd: ROOT, stdio: "inherit" },
  );
  if (r.status !== 0) warn("prettier failed: run `npm run format`");
}

function build() {
  console.log("→ astro build");
  const r = spawnSync("npm", ["run", "build"], { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) fail("build failed");
  ok("build passed");
}

async function slugs() {
  return (await readdir(BLOG, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

/** Parsed `{ data, body, raw }` of one language file, `null` when the file is missing. Throws on bad frontmatter. */
async function load(slug, locale) {
  const file = path.join(BLOG, slug, `${locale}.md`);
  if (!existsSync(file)) return null;
  const raw = (await readFile(file, "utf8")).replace(/\r\n/g, "\n");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error("no frontmatter");
  // JSON_SCHEMA keeps dates as the YYYY-MM-DD strings they were written as.
  return {
    data: yaml.load(m[1], { schema: yaml.JSON_SCHEMA }) ?? {},
    body: m[2],
    raw,
  };
}

async function check(slug) {
  const known = await tagIds();
  const all = await slugs();
  const targets = slug ? [slug] : all;
  let problems = 0;

  /** Articles that exist on disk but are not in a production build yet: linking to them is a 404. */
  const notLive = new Map();
  for (const s of all) {
    const a = await load(s, DEFAULT_LOCALE).catch(() => null);
    if (a?.data.draft) notLive.set(s, "a draft");
    else if (a?.data.pubDate && !isLive(String(a.data.pubDate)))
      notLive.set(s, `scheduled for ${a.data.pubDate}`);
  }

  for (const s of targets) {
    const dir = path.join(BLOG, s);
    const report = (m) => {
      problems++;
      console.error(`✗ ${s}: ${m}`);
    };
    if (!SLUG.test(s)) report("folder name is not kebab-case");
    if (!existsSync(dir)) {
      report("no such article");
      continue;
    }
    if (notLive.has(s))
      console.log(`· ${s}: ${notLive.get(s)}, not in production builds`);

    const loaded = {};
    for (const locale of LOCALES) {
      let article;
      try {
        article = await load(s, locale);
      } catch (e) {
        report(`${locale}.md: ${e.message.split("\n")[0]}`);
        continue;
      }
      if (!article) {
        report(`missing ${locale}.md`);
        continue;
      }
      loaded[locale] = article;
      const { data, body } = article;
      const text = prose(body);

      if (!String(data.title ?? "").trim()) report(`${locale}.md has no title`);
      else if (data.title.length > 65)
        warn(`${s}/${locale}.md title is ${data.title.length} chars`);
      const desc = String(data.description ?? "");
      if (desc.length < 120 || desc.length > 160)
        warn(`${s}/${locale}.md description is ${desc.length} chars`);
      if (!DAY.test(String(data.pubDate ?? "")))
        report(`${locale}.md pubDate must be YYYY-MM-DD`);
      if (data.updatedDate && String(data.updatedDate) < String(data.pubDate))
        report(`${locale}.md updatedDate is before pubDate`);
      const tags = Array.isArray(data.tags) ? data.tags : [];
      if (tags.length < 1 || tags.length > 2)
        warn(`${s}/${locale}.md has ${tags.length} tags (aim for 1 or 2)`);
      for (const t of tags)
        if (!known.includes(t)) report(`${locale}.md uses unknown tag "${t}"`);

      if (/^# /m.test(text)) report(`${locale}.md body contains an H1`);
      if (/^#{2,6} +sources?\s*$/im.test(text))
        report(
          `${locale}.md body contains a Sources heading: use the "sources" field`,
        );
      for (const im of body.matchAll(IMAGE_REF))
        if (!existsSync(path.join(dir, im[1])))
          report(`${locale}.md references missing image ./${im[1]}`);
      if (
        data.cover &&
        !existsSync(path.join(dir, String(data.cover).replace(/^\.\//, "")))
      )
        report(`${locale}.md cover ${data.cover} missing`);
      if (data.cover && !data.coverAlt)
        warn(`${s}/${locale}.md cover has no coverAlt`);

      if (OWN_SITE_LINK.test(text))
        report(`${locale}.md links to the site with an absolute URL`);
      if (foreignLinks(body, locale))
        report(`${locale}.md links to another language's blog path`);
      article.links = [...text.matchAll(ARTICLE_LINK)].map((m) => m[1]);
      for (const target of article.links) {
        if (target === s) report(`${locale}.md links to itself`);
        else if (!all.includes(target))
          report(`${locale}.md links to unknown article ${target}`);
        else if (notLive.has(target) && !notLive.has(s))
          warn(
            `${s}/${locale}.md links to ${target}, which is ${notLive.get(target)}: 404 until it is published`,
          );
      }
    }

    const [first, ...others] = LOCALES.map((l) => loaded[l]).filter(Boolean);
    if (others.length === LOCALES.length - 1) {
      // Fields the build, hreflang and the sitemap assume to be identical in every language.
      const same = (f) => others.every((o) => f(o) === f(first));
      if (!same((a) => [...(a.data.tags ?? [])].sort().join()))
        report(
          `tags differ between ${LOCALES.map((l) => `${l}.md`).join(" and ")}`,
        );
      for (const key of ["pubDate", "draft"]) {
        if (!same((a) => String(a.data[key] ?? "")))
          report(
            `${key} differs between ${LOCALES.map((l) => `${l}.md`).join(" and ")}`,
          );
      }
      // Legitimate when only one language was revised, or has its own cover or LinkedIn post.
      for (const key of ["updatedDate", "cover", "linkedin"]) {
        if (!same((a) => String(a.data[key] ?? "")))
          warn(`${s}: ${key} differs between languages`);
      }
      for (const name of Object.keys(shape(""))) {
        if (!same((a) => shape(a.body)[name]))
          warn(`${s}: languages differ in number of ${name}`);
      }
      if (!same((a) => [...new Set(a.links)].sort().join()))
        warn(`${s}: languages do not link to the same articles`);
    }

    for (const f of await readdir(dir)) {
      if (IMAGE_EXT.test(f)) {
        if (!Object.values(loaded).some((a) => a.raw.includes(f)))
          warn(`${s}/${f} is not referenced by any language file`);
        const st = await stat(path.join(dir, f));
        if (st.size > 1_500_000)
          warn(`${s}/${f} is ${(st.size / 1e6).toFixed(1)} MB`);
      } else if (!LOCALES.some((l) => f === `${l}.md`))
        report(`unexpected file ${f}`);
    }
  }
  if (problems) fail(`${problems} problem(s) in ${targets.length} article(s)`);
  ok(`${targets.length} article(s) valid`);
}

/** Compact catalogue of existing articles, for choosing link targets without opening every file. */
async function index(tag) {
  if (tag && !(await tagIds()).includes(tag)) fail(`unknown tag "${tag}"`);
  for (const s of await slugs()) {
    const articles = {};
    for (const locale of LOCALES)
      articles[locale] = await load(s, locale).catch(() => null);
    const any = Object.values(articles).find(Boolean);
    if (!any || (tag && !(any.data.tags ?? []).includes(tag))) continue;
    const state = any.data.draft
      ? ", draft"
      : !isLive(String(any.data.pubDate))
        ? ", scheduled"
        : "";
    console.log(
      `## ${s}  (${any.data.pubDate}${state}, tags ${(any.data.tags ?? []).join(", ")})`,
    );
    for (const locale of LOCALES) {
      if (articles[locale])
        console.log(
          `  ${locale.toUpperCase()} ${articles[locale].data.title}\n     ${articles[locale].data.description}`,
        );
    }
    const headings = [...prose(any.body).matchAll(/^## (.+)$/gm)]
      .map((m) => m[1])
      .slice(0, 6);
    if (headings.length) console.log(`  sections: ${headings.join(" · ")}`);
  }
}

const [cmd, ...args] = process.argv.slice(2);
const valueOf = (name) =>
  args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
const positional = args.filter(
  (a, i) => !a.startsWith("--") && args[i - 1] !== "--tag",
);
const flags = {
  build: args.includes("--build"),
  force: args.includes("--force"),
};
if (cmd === "create" && positional[0]) await create(positional[0], flags);
else if (cmd === "check") await check(positional[0]);
else if (cmd === "tags") console.log((await tagIds()).join("\n"));
else if (cmd === "index") await index(valueOf("--tag"));
else {
  console.log(
    "usage:\n  node scripts/article.mjs create <spec.json> [--build] [--force]\n  node scripts/article.mjs check [<slug>]\n  node scripts/article.mjs tags\n  node scripts/article.mjs index [--tag <key>]",
  );
  process.exit(cmd ? 1 : 0);
}
