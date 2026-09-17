# Porting the automatic blog system to another Astro + Wrangler project

Source of truth: this repository, in the state that follows the hardening pass of 2026-09-17
(Astro 7.3, Node 24, sharp 0.35, js-yaml 4, wrangler 4, static output deployed as Cloudflare Workers
static assets). Every defect found during that pass is already fixed in the source; §6 lists them so
you know what the target inherits and can re-test it.

In this guide `$SRC` is the root of this repository and `$DST` the root of the target project:

```sh
export SRC=<path to this repo>
export DST=<path to the target repo>
```

Follow the phases in order. Each phase ends with a check; do not start the next one until it passes.

---

## 0. What you are porting

Four layers. Port all four; each one relies on the one above it.

| Layer                    | What it guarantees                                                                                                                                                                                                                                                    | Files                                                                                                                                                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A. Content model         | One folder per article, both languages mandatory, closed tag vocabulary, typed frontmatter, scheduling. The **build fails** on a missing language, mismatched tags, unknown tag, invalid frontmatter.                                                                 | `src/content.config.ts`, `src/data/tags.json`, `src/data/tags.ts`, `src/lib/blog.ts`, `src/lib/publish-date.mjs`, `src/lib/post-dates.mjs`, `src/content/blog/`                                                                    |
| B. Rendering + SEO/GEO   | Article, index and tag pages per locale; canonical + hreflang; Open Graph; JSON-LD graph (Person, WebSite, Blog, BlogPosting with citations, CollectionPage, breadcrumbs); sitemap with per-URL `lastmod`; RSS per locale; `robots.txt`; `llms.txt`, `llms-full.txt`. | `src/pages/blog/**`, `src/pages/fr/blog/**`, `src/pages/*.ts`, `src/components/Blog*.astro`, `TagList.astro`, `LangToggle.astro`, `src/layouts/Base.astro`, `src/lib/{schema,feed,llms}.ts`, `astro.config.mjs`, `public/_headers` |
| C. Deterministic tooling | `scripts/article.mjs`: `create` (spec JSON + Markdown bodies → folder, images, frontmatter, validation, build), `check`, `index`, `tags`. No AI inside.                                                                                                               | `scripts/article.mjs`, `package.json` scripts                                                                                                                                                                                      |
| D. Agent layer           | The skill that tells Claude to do only translation + judgment fields and delegate everything else to layer C; the AGENTS.md section that forces the skill to be used; the permission allowlist.                                                                       | `.claude/skills/blog-article/SKILL.md`, `.claude/settings.json`, `AGENTS.md` (+ `CLAUDE.md` symlink), `README.md`                                                                                                                  |

Plus deploy: `.github/workflows/deploy.yml`, `wrangler.jsonc`, `.node-version`.

The division of labour is the point of the design: the model never writes `fr.md`/`en.md`, never
touches images, never hand-writes frontmatter. It produces one JSON spec and two Markdown bodies in
its scratchpad; the script owns the rest. Keep that boundary intact in the target.

---

## 1. Preconditions in the target project

Check each line. If one is false, apply the stated adjustment before Phase 2.

1. **Astro ≥ 5** (content layer with `glob` loader, `astro:content` `render`). Source runs 7.3.
   - `src/content.config.ts` imports `z` from `astro/zod`. On Astro 5 use `import { defineCollection, z } from 'astro:content'` instead.
   - `astro.config.mjs` uses the top-level `fonts` key and `<Font>` from `astro:assets` (stable in recent Astro; `experimental.fonts` in Astro 5.7–5.x). This is only about fonts, not the blog: keep the target's own font setup and skip it.
2. **`output: 'static'`**. Every route uses `getStaticPaths`; nothing here needs an adapter.
3. **Node ≥ 22** (source pins 24 in `.node-version` and `engines`). Full ICU is required (`Intl` with `timeZone`), which every official Node build has.
4. **i18n shape**: default locale unprefixed (`/blog/…`), other locales prefixed (`/fr/blog/…`), via Astro `i18n` with `prefixDefaultLocale: false`, and one literal page folder per locale as the Astro i18n guide prescribes. For other locales see §4.8.
5. **`trailingSlash: 'ignore'`** in Astro and `"html_handling": "auto-trailing-slash"` in wrangler. Internal links are written with a trailing slash.
6. **`tsconfig.json` extends an Astro preset** (`resolveJsonModule` and `allowJs` are needed: `tags.ts` imports `tags.json`, `blog.ts` imports `publish-date.mjs`).
7. **Entity type**: the JSON-LD graph hangs off a `Person`. If the target site belongs to a company, see §4.4.

---

## 2. Dependencies and package.json

```sh
cd $DST
npm install @astrojs/rss @astrojs/sitemap sharp js-yaml
npm install -D wrangler        # if not already present
npm install -D prettier prettier-plugin-astro
```

`sharp` and `js-yaml` must be direct dependencies: the script imports them (Astro only has them transitively).

Merge into `$DST/package.json`:

```json
{
  "engines": { "node": ">=24.0.0" },
  "scripts": {
    "deploy": "astro build && wrangler deploy",
    "article": "node scripts/article.mjs",
    "article:check": "node scripts/article.mjs check"
  }
}
```

`"type": "module"` must be set (it is in every Astro project). If the target's npm enforces install
scripts allow-listing, also carry `"allowScripts": { "esbuild": true }`.

Formatting: copy `.prettierrc.mjs` and `.prettierignore`, and add the scripts `"format": "prettier --write ."` and
`"format:check": "prettier --check ."`. The config is Prettier's defaults plus the Astro plugin, so the CLI gives
exactly what format-on-save gives in an editor with no Prettier settings; if the target already has a Prettier
config, keep the target's and only add the plugin. `article.mjs create` runs Prettier on the folder it writes, so
a new article is never the one unformatted file of the repo (it only warns if Prettier is missing).

Copy `.node-version` (content: `24`). The GitHub workflow reads it.

---

## 3. Copy the files

### 3.1 Manifest

**V** = copy verbatim. **A** = copy then adapt (see §4). **M** = merge into the target's existing file (see §5).

| File                                                  | Mode | Note                                                                          |
| ----------------------------------------------------- | ---- | ----------------------------------------------------------------------------- |
| `scripts/article.mjs`                                 | A    | four constants at the top                                                     |
| `.claude/skills/blog-article/SKILL.md`                | A    | author-specific translation rules                                             |
| `.claude/settings.json`                               | V/M  | permission allowlist; merge the `allow` array if the file exists              |
| `src/content.config.ts`                               | V/M  | M if the target already defines collections                                   |
| `src/data/tags.json`                                  | A    | new vocabulary                                                                |
| `src/data/tags.ts`                                    | V    | types the JSON                                                                |
| `src/lib/blog.ts`                                     | V    |                                                                               |
| `src/lib/publish-date.mjs`                            | A    | publishing time zone                                                          |
| `src/lib/post-dates.mjs`                              | A    | locale list; imported by `astro.config.mjs` only                              |
| `src/lib/feed.ts`                                     | V    |                                                                               |
| `src/lib/llms.ts`                                     | A    | uses home-page copy keys                                                      |
| `src/lib/schema.ts`                                   | A    | Person entity, fallback origin                                                |
| `src/i18n/ui.ts`, `index.ts`, `en.ts`, `fr.ts`        | M    | the `blog: {…}` block and a few root keys                                     |
| `src/components/BlogPostPage.astro`                   | A    | whole article page (head + schema + body); fallback OG image import           |
| `src/components/BlogListPage.astro`                   | V    | whole index / tag page                                                        |
| `src/components/BlogPost.astro`                       | V*   | *styling depends on CSS tokens, §5.4                                          |
| `src/components/BlogIndex.astro`                      | V*   |                                                                               |
| `src/components/TagList.astro`                        | V*   |                                                                               |
| `src/components/LangToggle.astro`                     | V*   | skip if the target has its own switcher, §5.5                                 |
| `src/layouts/Base.astro`                              | M    | head contract in §5.3                                                         |
| `src/pages/blog/{index,[slug],tag/[tag]}.astro`       | V    | default locale; 5–12 lines each, only `getStaticPaths` + the shared component |
| `src/pages/fr/blog/{index,[slug],tag/[tag]}.astro`    | V    | same files with `'fr'`; one such folder per prefixed locale                   |
| `src/pages/rss.xml.ts`, `src/pages/fr/rss.xml.ts`     | V    | one per locale                                                                |
| `src/pages/llms.txt.ts`, `src/pages/llms-full.txt.ts` | V    |                                                                               |
| `src/pages/robots.txt.ts`                             | V    | delete any static `public/robots.txt` in the target                           |
| `src/styles/global.css`                               | M    | the `.prose` block and `.rise` animation                                      |
| `astro.config.mjs`                                    | M    | sitemap `serialize`, i18n                                                     |
| `public/_headers`                                     | M    |                                                                               |
| `wrangler.jsonc`                                      | A/M  | name, routes                                                                  |
| `.github/workflows/deploy.yml`                        | A    | environment URL, cron hour                                                    |
| `AGENTS.md`                                           | M    | the `## Blog` section only                                                    |
| `README.md`                                           | M    | the "Blog: publishing an article" section                                     |

Do **not** copy `src/content/blog/*` (the articles), `src/assets/portrait.png`, `src/components/Home.astro`,
`LinkRow.astro`, `src/data/links.ts` (only `sameAs` is used by the blog, see §4.4), fonts config.

`CLAUDE.md` in the source is a **symlink** to `AGENTS.md` (`ln -s AGENTS.md CLAUDE.md`). Reproduce the
symlink, or keep a single `CLAUDE.md` in the target. Never write to one through the other with a
redirect that replaces the file: it overwrites the real one.

### 3.2 Commands

```sh
cd $SRC
for f in \
  scripts/article.mjs \
  .claude/skills/blog-article/SKILL.md .claude/settings.json \
  src/data/tags.json src/data/tags.ts \
  src/lib/blog.ts src/lib/feed.ts src/lib/llms.ts src/lib/schema.ts src/lib/post-dates.mjs src/lib/publish-date.mjs \
  src/components/BlogPostPage.astro src/components/BlogListPage.astro \
  src/components/BlogPost.astro src/components/BlogIndex.astro src/components/TagList.astro \
  "src/pages/blog/index.astro" "src/pages/blog/[slug].astro" "src/pages/blog/tag/[tag].astro" \
  "src/pages/fr/blog/index.astro" "src/pages/fr/blog/[slug].astro" "src/pages/fr/blog/tag/[tag].astro" \
  src/pages/rss.xml.ts src/pages/fr/rss.xml.ts \
  src/pages/llms.txt.ts src/pages/llms-full.txt.ts src/pages/robots.txt.ts \
  .node-version
do
  mkdir -p "$DST/$(dirname "$f")"
  [ -e "$DST/$f" ] && echo "EXISTS, merge by hand: $f" || cp "$f" "$DST/$f"
done
mkdir -p $DST/src/content/blog
```

Files reported as `EXISTS` and every **M** file are merged by hand in §5. Copy
`src/content.config.ts`, `src/layouts/Base.astro`, `src/components/LangToggle.astro`, `src/i18n/*`,
`public/_headers`, `wrangler.jsonc`, `.github/workflows/deploy.yml` with `cp` only if the target has
no equivalent.

If the target already has pages at `src/pages/blog/**`, the loop reports them as `EXISTS`: decide
which blog wins before going further.

---

## 4. Adapt: every site-specific value

This list is exhaustive (produced by grepping the source for the domain, the author, the locale
literals). After this phase,
`grep -rniE "clementbresson|clément|ESSEC|malt" $DST --exclude-dir=node_modules --exclude-dir=docs`
must return nothing.

### 4.1 `scripts/article.mjs`

Everything site-specific is in one block at the top (lines 26–31); the regexes and printed URLs derive from it.

| Constant         | Current                                  | Change to                                                                                           |
| ---------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `SITE`           | `https://clementbresson.com`             | target origin (used to reject absolute links to the own site, and to print the URLs after `create`) |
| `LOCALES`        | `['fr', 'en']`                           | target locales; the order is only the order of messages                                             |
| `DEFAULT_LOCALE` | `'en'`                                   | the locale served without a URL prefix                                                              |
| `CALL_TO_ACTION` | French/English LinkedIn sign-off phrases | the author's real sign-off phrases, or `/$^/` if drafts do not come from a social platform          |

Also line 109, the LinkedIn post URL validation: keep it if the `linkedin` frontmatter field is kept, delete it with the field otherwise.
`MAX_IMAGE_WIDTH = 1600`: keep unless the target's content column is wider than 800 CSS px.

### 4.2 `src/data/tags.json`

Replace the whole vocabulary. Rules the rest of the system depends on:

- Every key is a URL slug (`[a-z0-9-]+`) and needs `en` and `fr` with `label` and `description`
  (description = tag page intro + meta description). `tags.ts` type-checks this shape.
- Must be non-empty (it feeds `z.enum`): ship at least one tag.
- `src/data/tags.ts` imports `Locale` from `../i18n/ui`: keep that module or repoint the import.

### 4.3 `src/lib/llms.ts`

`header()` (lines 12–32) builds the intro from home-page copy keys `name`, `title`, `p1`, `p2`, `p3`.
Replace with the target's equivalents: one H1 (site/author name), one blockquote summary, one
paragraph. Lines 13–14 and 26–29 hard-code `'en'` and `'fr'`. `langName` (line 10) maps locale → display name.

### 4.4 `src/lib/schema.ts`

- Line 16: fallback origin `https://clementbresson.com` → target origin.
- `personNode` (lines 21–36): `name`, `jobTitle`, `description` come from i18n keys `name`, `title`, `p1`.
  Line 31 `alumniOf: ESSEC Business School` → replace or delete. Line 33 excludes the tag `'site'` from
  `knowsAbout`: replace with the target's meta-tag key or remove the filter. Line 34 `sameAs` is imported
  from `src/data/links.ts` (line 7): provide an exported `sameAs: string[]` of public profile URLs somewhere
  and repoint the import.
- **If the site belongs to an organisation**: change `'@type': 'Person'` to `'Organization'`, replace
  `jobTitle/alumniOf/knowsLanguage/knowsAbout` by `logo`, rename `#person` to `#org`
  everywhere (`personId` is referenced in `websiteNode`, `blogNode`, `blogPostingNode`). For
  `BlogPosting.author` keep a `Person` node if articles are signed.

### 4.5 `src/components/BlogPostPage.astro`

Line 4 imports `../assets/portrait.png` as the fallback image for articles without cover (used for
`BlogPosting.image`). Point it to the target's default social image (must live under `src/` so
`getImage` can process it). `Base.astro` has the same import (line 5) for the default `og:image`.

### 4.6 `src/lib/publish-date.mjs` and `src/lib/post-dates.mjs`

- `publish-date.mjs` line 5 `PUBLISH_TIME_ZONE = 'Europe/Paris'`: the time zone in which a `pubDate` "starts". It
  decides when a scheduled article goes live and what "today" means for the default `pubDate`.
- `post-dates.mjs` `['en', 'fr']`: the locale list (this file cannot import the TypeScript i18n module: it is
  loaded by `astro.config.mjs` before Vite exists). Never import `post-dates.mjs` from site code: it finds
  the articles relative to its own path, which is wrong once bundled. Site code uses `publish-date.mjs`.

### 4.7 Deploy files

`wrangler.jsonc`: `name` (line 5), `routes` patterns (lines 18–19), `compatibility_date`. Keep
`assets.directory: ./dist`, `not_found_handling: 404-page` (requires a `src/pages/404.astro`),
`html_handling: auto-trailing-slash`, `workers_dev: false`, `preview_urls: false` (avoids duplicate
hosts being indexed). For the very first deploy before the domain is attached, temporarily set
`workers_dev: true`.

`.github/workflows/deploy.yml`: the `url:` of the environment; the cron `10 4 * * *` (UTC) should fall
in the early morning of `PUBLISH_TIME_ZONE`. Secrets required in the target repo:
`CLOUDFLARE_API_TOKEN` (template _Edit Cloudflare Workers_) and `CLOUDFLARE_ACCOUNT_ID`. GitHub
disables scheduled workflows after 60 days without repository activity; any push re-enables them.

`astro.config.mjs` line 8: default `site`. See §5.2 for the merge.

### 4.8 Only if the target's locales differ from `en` (default, unprefixed) + `fr`

`blog.ts`, the shared page components and the script are locale-agnostic. What remains hard-coded, exhaustively:

- page folders: `src/pages/blog/**` = default locale, `src/pages/<locale>/blog/**` = each prefixed locale;
  the three files of a folder hard-code their locale literal (`'en'` / `'fr'`). Copy a folder and change the literal.

- `src/i18n/ui.ts:1–3` `locales`, `defaultLocale`; one copy file per locale in `src/i18n/`
- `src/content.config.ts:19` glob `'*/{en,fr}.md'`
- `astro.config.mjs:13` `postUrl` regex `(fr)`, `:15` `listUrl` regex, `:25` sitemap i18n map, `:30` `?? 'en'`, `:40–41`
- `src/lib/post-dates.mjs` locale list
- `src/lib/blog.ts:92` `locale === 'fr' ? 'fr-FR' : 'en-US'` (date display: `25 août 2026` vs `August 25, 2026`)
- `src/lib/llms.ts` (§4.3)
- `src/layouts/Base.astro:65` `x-default` → `'en'`
- `scripts/article.mjs` `LOCALES`, `DEFAULT_LOCALE`
- `src/data/tags.json`: one block per locale in every tag
- one `src/pages/<locale>/rss.xml.ts` per prefixed locale, and its line in `public/_headers`
- `src/pages/404.astro` if copied
- `SKILL.md`, `AGENTS.md`, `README.md` wording

---

## 5. Merge into existing target files

### 5.1 `src/content.config.ts`

If the target already has collections, add the `blog` collection (lines 17–51 of the source) and export
it alongside the others. The `generateId` that strips `.md` is required: `src/lib/blog.ts:parseId`
expects ids of the form `<slug>/<locale>`.

### 5.2 `astro.config.mjs`

Add, without removing what the target has:

```js
import sitemap from "@astrojs/sitemap";
import { latestPostDate, postLastModified } from "./src/lib/post-dates.mjs";

const site = process.env.SITE_URL ?? "https://TARGET-DOMAIN";
const lastModified = postLastModified();
const latest = latestPostDate();
const postUrl = /^\/(?:(fr)\/)?blog\/([^/]+)\/?$/;
const listUrl = /^\/(?:fr\/)?blog\/(?:tag\/[^/]+\/?)?$/;
```

and in `defineConfig`: `site`, `output: 'static'`, `trailingSlash: 'ignore'`, the `sitemap({ i18n, serialize })`
integration exactly as in source lines 23–37, and the `i18n` block (lines 39–45). If the target already
uses `@astrojs/sitemap`, merge the `i18n` and `serialize` options into the existing call; do not register it twice.

Why `post-dates.mjs` reads files directly: the config is evaluated before the content layer exists.

### 5.3 Base layout: the head contract

The blog pages call the layout with these props; the target layout must accept them and emit
the corresponding tags (source: `src/layouts/Base.astro`):

| Prop                                                  | Emits                                                                                                                                                                  |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `locale`                                              | `<html lang>`, `og:locale`, `og:locale:alternate`                                                                                                                      |
| `path` (locale-relative, e.g. `blog/my-post/`)        | `<link rel="canonical">`, one `<link rel="alternate" hreflang>` per locale + `x-default`, `og:url`                                                                     |
| `title`, `description`                                | `<title>`, meta description, OG/Twitter title + description                                                                                                            |
| `ogType` (`website` \| `article`)                     | `og:type`                                                                                                                                                              |
| `ogImage` `{ src: ImageMetadata, alt }`               | `og:image` (+ width, height, alt) via `getImage({ width: 1200, format: 'jpg' })`, `twitter:card = summary_large_image`; falls back to the default image with `summary` |
| `article` `{ published, modified?, tags?, section? }` | `article:published_time`, `article:modified_time`, `article:section`, `article:tag`, `article:author`                                                                  |
| `schema` (array of nodes)                             | one `<script type="application/ld+json">` = `graph([personNode, websiteNode, ...schema])`                                                                              |
| `noindex`                                             | `robots noindex`, and suppresses canonical + hreflang                                                                                                                  |

Always emitted: `<link rel="alternate" type="application/rss+xml">` to the locale's feed (`filePath(locale, 'rss.xml')`),
`<link rel="sitemap" href="/sitemap-index.xml">`.

If the target already has a layout, port these blocks into it rather than replacing it, then make the
blog pages import the target layout.

### 5.4 Styles

The three components are styled with scoped CSS that references these custom properties. Define
them (or map them to the target's tokens) in the global stylesheet:

```
--color-bg --color-ink --color-body --color-muted --color-inactive --color-hover
--font-newsreader (display)   --font-geist (text)
```

Also copy from `src/styles/global.css`: the `@keyframes rise` + `.rise` rule with its
`prefers-reduced-motion` guard (lines 27–48; every component uses `class="rise"` with a `--delay`), and the
whole `.prose` block (lines 50–186), which styles the rendered Markdown. The `.prose` rules must be
global, not scoped: Astro scoping does not reach into `<Content />`.

### 5.5 i18n copy

The blog reads these keys through `getCopy(locale)` (`src/i18n/index.ts`). If the target has another
i18n mechanism, keep a thin `src/i18n/index.ts` exporting `getCopy`, `locales`, `defaultLocale`,
`type Locale` with at least:

```ts
htmlLang, ogLocale, metaTitle, metaDescription, name, title, p1, p2, p3, portraitAlt, langSwitchLabel,
blog: { title, metaTitle, description, empty, backToBlog, published, updated, rss,
        topics, related, sources, originallyOnLinkedIn, minRead }
```

(`title`, `p1`–`p3` are only used by `schema.ts` and `llms.ts`; drop them if you rewrote those in §4.3–4.4.)
French values are in `src/i18n/fr.ts` lines 24–39; reuse them as is.

`LangToggle.astro` takes `current`, `label`, `path` and links to the same `path` in the other locale.
If the target has its own switcher, remove the `<LangToggle>` line from `BlogPost.astro:25` and
`BlogIndex.astro:23` and make sure the target's switcher preserves the path.

### 5.6 `public/_headers`

Append the source file's rules. Adjust `/fr/rss.xml` to the target's prefixed locale.

### 5.7 Entry points

Add a link to `/blog/` (via `getRelativeLocaleUrl(locale, 'blog/')`) in the target's navigation and in
its 404 page. Without an inbound link the blog is only reachable through the sitemap.

**Check for phases 2–5**: `npm run build` passes with an empty `src/content/blog/` (the index shows
the `blog.empty` copy; no tag pages, no article pages; `dist/rss.xml`, `dist/fr/rss.xml`, `dist/llms.txt`,
`dist/robots.txt`, `dist/sitemap-index.xml` exist).

---

## 6. What was hardened on 2026-09-17 (already in the source)

Each item was reproduced before the fix and re-tested after it, with a real Astro build where the
consequence is only visible in `dist/`. Listed so you can re-run the scenario in the target (§9).

Defects fixed:

1. **A `# comment` line inside a fenced code block was rejected as an H1** by `create` and `check`.
   Heading, Sources and link checks now run on the body with fenced blocks removed (`prose()`).
2. **Phone photos wider than 1600px shipped sideways.** The resize step dropped the EXIF orientation
   without rotating the pixels. Astro's own pipeline auto-orients, so only images the script resized
   were affected. Fixed with `.rotate()` before `.resize()`, and the width test uses the displayed width.
3. **`--force` deleted the existing article before validating the images.** All validation now
   happens before the disk is touched. Image names are restricted to `[a-z0-9._-]`.
4. **Crash, or a sitemap silently without `lastmod`, when the project path contains a space or an
   accent** (`new URL(…).pathname` is percent-encoded). `fileURLToPath` in the script and in `post-dates.mjs`.
5. **CI did not run `check`**, the only thing that detects a broken internal link. It now runs before the build.
6. **The skill told Claude to commit only the new folder**, forgetting the articles edited for inbound links.

Examined and found **not** to be defects (do not "fix" them in the target):

- An image saved under another extension (`shot.png` as `cover.jpg`) builds fine: Astro detects the
  format from the content. Converting instead would flatten transparency to black. The script simply
  refuses an extension change, so files are never mislabelled.
- `CLAUDE.md` and `AGENTS.md` look like duplicates; they are one file and a symlink.

Improvements made: bodies as Markdown files (`bodyFile`) instead of JSON-escaped strings; `pubDate`
defaults to today; `check` parses frontmatter with a YAML parser (any valid YAML syntax is understood),
fails when `pubDate`/`draft`/tags differ across languages, warns on differing `updatedDate`, cover,
heading/image/code-block counts and link targets, accepts links without trailing slash or with an
anchor, refuses self-links; tag vocabulary in `tags.json` shared by site and script; page files reduced to `getStaticPaths` +
a shared page component (literal locale folders kept, as Astro documents); localized RSS categories; `index --tag`; scheduling (future
`pubDate` + daily rebuild); permission allowlist.

---

## 7. Agent layer

### 7.1 `.claude/skills/blog-article/SKILL.md`

Keep the frontmatter `name: blog-article` and rewrite `description` with the phrases the target's
author actually uses to trigger it (the source lists "new article", "publie cet article", "add this to the blog").

Author-specific content to rewrite:

- Step 2: "Keep 'Bon designs !' when present", the list of LinkedIn footers to remove.
- Step 3: the glossary (`TJM → daily rate`, `vibecodé → vibe-coded`, `Bon designs ! → Happy designing!`)
  and the list of technical terms kept in English. Replace with the target's domain glossary.
- Cross-linking §2: the examples of linkable concepts.
- Spec example: slug, LinkedIn URL, source.

Keep unchanged (these are the rules that make the output reliable): "never write the article files by
hand"; "do not ask for slug, description or tags: propose them"; bodies in `*.body.md` files next to
the spec, in the scratchpad, not in the project; relative links only with the right locale prefix and
the same targets in both languages; no Sources heading in the body; "only include a URL you are
certain of"; `--build` then `--force` on retry; inbound links in both languages, none towards a
scheduled article, no `updatedDate` for a link-only edit; the commit list of step 7.

### 7.2 `AGENTS.md`

Copy the `## Blog` section (recipe + "Structure and rules"). The sentence "ALWAYS follow the
`blog-article` skill" is what makes a plain "here is my article" message route to the skill. Do not
write absolute paths in these files.

### 7.3 `.claude/settings.json`

Allows `node scripts/article.mjs *`, `npm run article *`, `npm run article:check`, `npm run build`
without a prompt, so a publication runs uninterrupted. Merge into the target's `permissions.allow`.

### 7.4 `README.md`

Copy the "Blog: publishing an article" and "Deploy" sections; change the domain, the
`workers.dev` hostname, and the registrar named in step 5.

---

## 8. Cloudflare and search, one-time

1. GitHub repo secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
2. Domain must be an active zone on the same Cloudflare account; the `routes` with `custom_domain: true`
   create DNS records and certificates on the first deploy.
3. `www` → apex: Workers static assets do not support host rules in `_redirects`; add a Cloudflare
   Redirect Rule (template _Redirect from WWW to root_).
4. After the first deploy: add the property in Google Search Console and submit `/sitemap-index.xml`;
   same in Bing Webmaster Tools.

---

## 9. Acceptance test

Run all of it; every line must hold.

```sh
cd $DST
node scripts/article.mjs tags                 # prints the target vocabulary, one key per line
```

Then, in Claude Code inside `$DST`, give a short text (5 lines, with a fenced `bash` block containing a
`# comment`) plus one portrait phone photo (4032×3024 with EXIF rotation), and say "new article".
Expect, without any hand-written file:

- [ ] `src/content/blog/<slug>/{fr.md,en.md,cover.jpg}` exist; the cover is **upright** and 1600px wide
- [ ] `node scripts/article.mjs check` → `✓ N article(s) valid`
- [ ] `npm run build` passes
- [ ] `dist/blog/<slug>/index.html` and `dist/fr/blog/<slug>/index.html` exist
- [ ] each contains: one `<h1>`, `rel="canonical"`, three `hreflang` alternates (en, fr, x-default),
      `og:image` pointing to the cover, one `application/ld+json` whose graph holds `BlogPosting`
      and `BreadcrumbList`
- [ ] the date reads `17 septembre 2026` on the French page and `September 17, 2026` on the English one
- [ ] `dist/blog/tag/<tag>/` and `dist/fr/blog/tag/<tag>/` exist for the tag used
- [ ] `dist/rss.xml` and `dist/fr/rss.xml` list the article with localized `<category>` labels;
      `dist/llms.txt` lists it in both languages; `dist/llms-full.txt` contains the body
- [ ] `dist/sitemap-0.xml` has the two article URLs with `<lastmod>` and `xhtml:link` alternates
- [ ] negative tests fail loudly: delete `fr.md` → build error "Every blog article needs…"; put a
      different tag or `pubDate` in `fr.md` → `check` error; link to `/blog/nope/` → `check` error;
      `{ "from": "x.png", "as": "x.jpg" }` → `create` error, nothing written
- [ ] draft and scheduling: `draft: true`, or a `pubDate` next year, in both files → article absent
      from `dist/`, from the sitemap, RSS and `llms.txt`; present with `SHOW_DRAFTS=1 npm run build`
- [ ] the whole project copied to a path containing a space still passes `check` and `build`, and the
      sitemap still has `<lastmod>`
- [ ] push to `main` → the workflow runs check, build, deploy; both URLs answer 200 on the custom domain
- [ ] `grep -rniE "clementbresson|clément|ESSEC" $DST --exclude-dir=node_modules --exclude-dir=docs` → nothing

Delete the test article folder afterwards (the folder owns all its assets; nothing else to clean).
