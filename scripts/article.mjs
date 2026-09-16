#!/usr/bin/env node
/**
 * Deterministic blog article tooling.
 *
 *   node scripts/article.mjs create <spec.json> [--build] [--force]
 *   node scripts/article.mjs check [<slug>]
 *   node scripts/article.mjs tags
 *   node scripts/article.mjs index
 *
 * `create` builds src/content/blog/<slug>/ from a JSON spec: copies and
 * normalises images, writes fr.md and en.md with validated frontmatter, and
 * optionally runs the production build. `check` validates existing articles.
 * The spec format is documented in .claude/skills/blog-article/SKILL.md.
 */
import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';

process.stdout.on('error', (e) => { if (e.code === 'EPIPE') process.exit(0); });

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const BLOG = path.join(ROOT, 'src/content/blog');
const TAGS_FILE = path.join(ROOT, 'src/data/tags.ts');
const LOCALES = ['fr', 'en'];
const MAX_IMAGE_WIDTH = 1600;
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif|svg)$/i;

const fail = (msg) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};
const warn = (msg) => console.warn(`! ${msg}`);
const ok = (msg) => console.log(`✓ ${msg}`);

async function tagIds() {
  const src = await readFile(TAGS_FILE, 'utf8');
  return [...src.matchAll(/^ {2}'?([a-z0-9-]+)'?: \{$/gm)].map((m) => m[1]);
}

const yamlString = (s) => JSON.stringify(String(s));

function frontmatter(spec, locale) {
  const l = spec[locale];
  const lines = ['---', `title: ${yamlString(l.title)}`, `description: ${yamlString(l.description)}`, `pubDate: ${spec.pubDate}`];
  if (spec.updatedDate) lines.push(`updatedDate: ${spec.updatedDate}`);
  if (spec.cover) {
    lines.push(`cover: ./${spec.cover}`);
    if (l.coverAlt) lines.push(`coverAlt: ${yamlString(l.coverAlt)}`);
  }
  lines.push(`tags: [${spec.tags.map((t) => `'${t}'`).join(', ')}]`);
  if (spec.linkedin) lines.push(`linkedin: ${spec.linkedin}`);
  if (spec.sources?.length) {
    lines.push('sources:');
    for (const s of spec.sources) {
      lines.push(`  - title: ${yamlString(s.title)}`);
      if (s.author) lines.push(`    author: ${yamlString(s.author)}`);
      if (s.year) lines.push(`    year: ${s.year}`);
      if (s.url) lines.push(`    url: ${s.url}`);
    }
  }
  lines.push(`draft: ${spec.draft ? 'true' : 'false'}`, '---', '');
  return lines.join('\n');
}

function validateSpec(spec, knownTags) {
  const errors = [];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(spec.slug ?? '')) errors.push('slug must be lowercase kebab-case');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(spec.pubDate ?? '') || Number.isNaN(Date.parse(spec.pubDate))) errors.push('pubDate must be YYYY-MM-DD');
  if (spec.updatedDate && (!/^\d{4}-\d{2}-\d{2}$/.test(spec.updatedDate) || spec.updatedDate < spec.pubDate)) errors.push('updatedDate must be YYYY-MM-DD and not before pubDate');
  if (!Array.isArray(spec.tags) || spec.tags.length < 1 || spec.tags.length > 2) errors.push('tags must have 1 or 2 entries');
  for (const t of spec.tags ?? []) if (!knownTags.includes(t)) errors.push(`unknown tag "${t}" (known: ${knownTags.join(', ')}). Add it to src/data/tags.ts first.`);
  if (spec.linkedin && !/^https:\/\/www\.linkedin\.com\/(feed\/update\/urn:li:activity:\d+\/?|posts\/[\w%-]+\/?)$/.test(spec.linkedin)) errors.push('linkedin must be a LinkedIn post URL');
  for (const s of spec.sources ?? []) {
    if (!s.title) errors.push('every source needs a title');
    if (s.url && !/^https?:\/\//.test(s.url)) errors.push(`source url must be absolute: ${s.url}`);
    if (s.year && !(Number.isInteger(s.year) && s.year > 1900 && s.year < 2100)) errors.push(`source year invalid: ${s.year}`);
  }
  if (spec.cover && !IMAGE_EXT.test(spec.cover)) errors.push('cover must be an image file name (e.g. cover.jpg)');
  for (const locale of LOCALES) {
    const l = spec[locale];
    if (!l) { errors.push(`missing "${locale}" block`); continue; }
    if (!l.title?.trim()) errors.push(`${locale}.title is required`);
    else if (l.title.length > 65) warn(`${locale}.title is ${l.title.length} chars (aim for ≤ 65)`);
    if (!l.description?.trim()) errors.push(`${locale}.description is required`);
    else if (l.description.length < 120 || l.description.length > 160) warn(`${locale}.description is ${l.description.length} chars (aim for 120–160)`);
    if (!l.body?.trim()) errors.push(`${locale}.body is required`);
    else {
      if (/^# /m.test(l.body)) errors.push(`${locale}.body must not contain an H1 (# …): the layout renders the title`);
      if (/^#{2,6} +sources?\s*$/im.test(l.body)) errors.push(`${locale}.body must not contain a Sources heading: use the "sources" field`);
      if (/(n'hésitez pas à me suivre|DM ouverts|MP ouverts|follow me|DMs? are open)/i.test(l.body)) warn(`${locale}.body still contains LinkedIn call-to-action text`);
      if (/\]\(https?:\/\/(www\.)?clementbresson\.com/.test(l.body)) errors.push(`${locale}.body links to the site with an absolute URL: use /blog/<slug>/ or /fr/blog/<slug>/`);
      const wrongPrefix = locale === 'fr' ? /\]\(\/blog\//g : /\]\(\/fr\/blog\//g;
      if (wrongPrefix.test(l.body)) errors.push(`${locale}.body links to the other language's blog path`);
    }
    if (spec.cover && !l.coverAlt) warn(`${locale}.coverAlt missing (alt text for the cover)`);
  }
  if (spec.fr && spec.en && spec.fr.body && spec.en.body) {
    const count = (b, re) => (b.match(re) ?? []).length;
    for (const [name, re] of [['headings', /^#{2,6} /gm], ['images', /!\[[^\]]*\]\(/g], ['code blocks', /^```/gm]]) {
      if (count(spec.fr.body, re) !== count(spec.en.body, re)) warn(`fr and en bodies differ in number of ${name}`);
    }
  }
  return errors;
}

async function normaliseImage(from, to) {
  if (/\.svg$/i.test(from)) return copyFile(from, to);
  const img = sharp(from);
  const meta = await img.metadata();
  if ((meta.width ?? 0) > MAX_IMAGE_WIDTH) {
    await img.resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true }).toFile(to);
    ok(`${path.basename(to)}: resized ${meta.width}px → ${MAX_IMAGE_WIDTH}px`);
  } else {
    await copyFile(from, to);
  }
}

async function create(specPath, flags) {
  const spec = JSON.parse(await readFile(specPath, 'utf8'));
  const known = await tagIds();
  const errors = validateSpec(spec, known);
  if (errors.length) fail(errors.join('\n✗ '));

  const dir = path.join(BLOG, spec.slug);
  if (existsSync(dir)) {
    if (!flags.force) fail(`${path.relative(ROOT, dir)} already exists (use --force to overwrite)`);
    await rm(dir, { recursive: true });
  }
  await mkdir(dir, { recursive: true });

  const specDir = path.dirname(path.resolve(specPath));
  const images = spec.images ?? [];
  const placed = new Set();
  for (const img of images) {
    const from = path.resolve(specDir, img.from);
    const as = img.as ?? path.basename(img.from);
    if (!existsSync(from)) fail(`image not found: ${from}`);
    if (!IMAGE_EXT.test(as)) fail(`unsupported image type: ${as}`);
    await normaliseImage(from, path.join(dir, as));
    placed.add(as);
  }
  if (spec.cover && !placed.has(spec.cover)) fail(`cover "${spec.cover}" is not among the copied images`);
  for (const locale of LOCALES) {
    for (const m of spec[locale].body.matchAll(/!\[[^\]]*\]\(\.\/([^)\s]+)\)/g)) {
      if (!placed.has(m[1])) fail(`${locale}.body references ./${m[1]} but no such image was provided`);
    }
    await writeFile(path.join(dir, `${locale}.md`), frontmatter(spec, locale) + '\n' + spec[locale].body.trim() + '\n');
  }
  ok(`wrote ${path.relative(ROOT, dir)}/{fr,en}.md${placed.size ? ` + ${placed.size} image(s)` : ''}`);
  console.log(`  EN https://clementbresson.com/blog/${spec.slug}/\n  FR https://clementbresson.com/fr/blog/${spec.slug}/`);

  if (flags.build) build();
}

function build() {
  console.log('→ astro build');
  const r = spawnSync('npm', ['run', 'build'], { cwd: ROOT, stdio: 'inherit' });
  if (r.status !== 0) fail('build failed');
  ok('build passed');
}

async function check(slug) {
  const known = await tagIds();
  const slugs = slug ? [slug] : (await readdir(BLOG, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);
  let problems = 0;
  for (const s of slugs) {
    const dir = path.join(BLOG, s);
    const report = (m) => { problems++; console.error(`✗ ${s}: ${m}`); };
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) report('folder name is not kebab-case');
    const fm = {};
    for (const locale of LOCALES) {
      const f = path.join(dir, `${locale}.md`);
      if (!existsSync(f)) { report(`missing ${locale}.md`); continue; }
      const src = await readFile(f, 'utf8');
      const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!m) { report(`${locale}.md has no frontmatter`); continue; }
      const [, head, body] = m;
      const get = (k) => head.match(new RegExp(`^${k}: (.*)$`, 'm'))?.[1]?.trim();
      const tags = [...(get('tags') ?? '').matchAll(/'([a-z0-9-]+)'/g)].map((x) => x[1]);
      fm[locale] = { tags, pubDate: get('pubDate') };
      for (const t of tags) if (!known.includes(t)) report(`${locale}.md uses unknown tag "${t}"`);
      const desc = get('description')?.replace(/^["']|["']$/g, '') ?? '';
      if (desc.length < 120 || desc.length > 160) warn(`${s}/${locale}.md description is ${desc.length} chars`);
      if (/^# /m.test(body)) report(`${locale}.md body contains an H1`);
      for (const im of body.matchAll(/!\[[^\]]*\]\(\.\/([^)\s]+)\)/g)) if (!existsSync(path.join(dir, im[1]))) report(`${locale}.md references missing image ./${im[1]}`);
      const cover = get('cover');
      if (cover && !existsSync(path.join(dir, cover.replace(/^\.\//, '')))) report(`${locale}.md cover ${cover} missing`);
      const wrongPrefix = locale === 'fr' ? /\]\(\/blog\//g : /\]\(\/fr\/blog\//g;
      if (wrongPrefix.test(body)) report(`${locale}.md links to the other language's blog path`);
      for (const link of body.matchAll(/\]\(\/(?:fr\/)?blog\/([a-z0-9-]+)\/\)/g)) {
        if (!existsSync(path.join(BLOG, link[1]))) report(`${locale}.md links to unknown article ${link[1]}`);
      }
    }
    if (fm.fr && fm.en) {
      if (fm.fr.tags.join() !== fm.en.tags.join()) report('tags differ between fr.md and en.md');
      if (fm.fr.pubDate !== fm.en.pubDate) report('pubDate differs between fr.md and en.md');
    }
    const files = await readdir(dir);
    for (const f of files) {
      if (IMAGE_EXT.test(f)) {
        const used = LOCALES.some((l) => existsSync(path.join(dir, `${l}.md`))) && (await Promise.all(LOCALES.map(async (l) => existsSync(path.join(dir, `${l}.md`)) && (await readFile(path.join(dir, `${l}.md`), 'utf8')).includes(f)))).some(Boolean);
        if (!used) warn(`${s}/${f} is not referenced by any language file`);
        const st = await stat(path.join(dir, f));
        if (st.size > 1_500_000) warn(`${s}/${f} is ${(st.size / 1e6).toFixed(1)} MB`);
      } else if (!/^(fr|en)\.md$/.test(f)) report(`unexpected file ${f}`);
    }
  }
  if (problems) fail(`${problems} problem(s) in ${slugs.length} article(s)`);
  ok(`${slugs.length} article(s) valid`);
}

/** Compact catalogue of existing articles, for choosing link targets without opening every file. */
async function index() {
  const slugs = (await readdir(BLOG, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  for (const s of slugs) {
    const row = { slug: s };
    for (const locale of LOCALES) {
      const f = path.join(BLOG, s, `${locale}.md`);
      if (!existsSync(f)) continue;
      const src = await readFile(f, 'utf8');
      const head = src.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
      const get = (k) => head.match(new RegExp(`^${k}: (.*)$`, 'm'))?.[1]?.trim().replace(/^["']|["']$/g, '');
      row[locale] = { title: get('title'), description: get('description') };
      row.tags ??= get('tags');
      row.pubDate ??= get('pubDate');
      row.headings = [...src.matchAll(/^## (.+)$/gm)].map((m) => m[1]).slice(0, 6);
    }
    console.log(`## ${row.slug}  (${row.pubDate}, tags ${row.tags})`);
    for (const locale of LOCALES) if (row[locale]) console.log(`  ${locale.toUpperCase()} ${row[locale].title}\n     ${row[locale].description}`);
    if (row.headings?.length) console.log(`  sections: ${row.headings.join(' · ')}`);
  }
}

const [cmd, arg, ...rest] = process.argv.slice(2);
const flags = { build: rest.includes('--build') || arg === '--build', force: rest.includes('--force') || arg === '--force' };
if (cmd === 'create' && arg && !arg.startsWith('--')) await create(arg, flags);
else if (cmd === 'check') await check(arg && !arg.startsWith('--') ? arg : undefined);
else if (cmd === 'tags') console.log((await tagIds()).join('\n'));
else if (cmd === 'index') await index();
else {
  console.log('usage:\n  node scripts/article.mjs create <spec.json> [--build] [--force]\n  node scripts/article.mjs check [<slug>]\n  node scripts/article.mjs tags\n  node scripts/article.mjs index');
  process.exit(cmd ? 1 : 0);
}
