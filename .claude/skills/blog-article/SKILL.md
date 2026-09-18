---
name: blog-article
description: Turn raw text (any language) and images into a published bilingual blog article. Use when the user gives article content, a LinkedIn post, or says "new article", "publie cet article", "add this to the blog". The model translates and fills judgment fields; scripts/article.ts does everything mechanical.
---

# Blog article

The blog needs every article in French AND English, in `src/content/blog/<slug>/`. Your job is
translation plus a few judgment fields. Everything else (folder, images, frontmatter, validation,
build) is done by the deterministic script `scripts/article.ts`. Never write the article files by hand.

## Inputs to collect from the user

- The text, in French or English (a draft, notes, or a LinkedIn post). Ask only if the text is missing.
- Images, if any (paths on disk). The first one is the cover unless the user says otherwise.
- Optional: publication date (the script defaults `pubDate` to today; a later day schedules the article), the LinkedIn post URL, sources.

Do not ask for slug, description or tags: propose them.

## Steps

1. `node scripts/article.ts tags` to see the tag vocabulary. Pick 1–2 tags. If none fits, add one to
   `src/data/tags.json` (key + EN/FR label and description) before continuing.
2. Prepare the source language version:
   - Keep the author's voice, first person, and tu/vous choice. Fix typos and accents. Do not add facts.
   - If it comes from LinkedIn, remove every call-to-action ("n'hésitez pas à me suivre", "DM ouverts",
     "1 post par jour", "-----" footers). Keep "Bon designs !" when present.
   - Structure: short intro, `##` headings where natural (never `#`), lists for enumerations, fenced code
     blocks with a language. CAPS emphasis becomes **bold**.
   - Images: reference them as `![alt](./file.jpg)` where they belong in the text.
   - Internal links: see "Cross-linking" below. Relative URLs only: `/blog/<slug>/` in EN,
     `/fr/blog/<slug>/` in FR. Same targets in both languages.
   - Do not write a Sources section in the body: put sources in the `sources` field. See "Sources" below.
3. Translate to the other language faithfully: same structure, headings, lists, links (with the other
   language's path prefix), same images with translated alt text. Natural, idiomatic, "you" in English.
   Keep technical terms in English (harness, test double, Dependency Rule…). "TJM" → "daily rate",
   "vibecodé" → "vibe-coded", "Bon designs !" → "Happy designing!".
4. Judgment fields, per language: `title` (≤ 65 chars, specific, no clickbait), `description`
   (120–160 chars, one real sentence: meta description and excerpt), `coverAlt` if there is a cover.
   Slug: lowercase kebab-case, English, stable forever.
5. In the scratchpad (not the project), write `fr.body.md`, `en.body.md` and `spec.json`, then run:
   `node scripts/article.ts create <spec.json> --build`
   Fix anything it reports and re-run with `--force`. Bodies go in files, not in the JSON: plain
   Markdown needs no escaping, which matters for code samples with quotes and backslashes.
6. Inbound links (see "Cross-linking"): edit the existing articles that should point to the new one,
   then `node scripts/article.ts check` and `npm run build`. Show the two URLs printed in step 5 and
   list the articles you linked from.
7. Do not commit unless asked. When asked, commit the new `src/content/blog/<slug>/` folder, the existing
   articles you edited for inbound links, and `src/data/tags.json` if a tag was added. Then push; the
   deploy is automatic.

## Sources

Sources are researched, not guessed, and they matter for SEO and AI search. For every product, company,
person, talk, book or article the text names, search the web for its official page (or the original
article), fetch the URL to confirm it, then add a `sources` entry (`title`, `author`, `year`, `url`) and
link the first mention in both bodies to that URL. Never write a URL you have not fetched. When the text
relies on a figure or a study you cannot find, keep the sentence and add
`<!-- TODO source: what is missing -->` after the paragraph, in both languages, and say so in the report.

## Cross-linking

Every article should be woven into the existing ones. Do this on every new article:

1. `node scripts/article.ts index` prints every existing article with slug, tags, titles, descriptions
   and section headings (`index --tag <key>` narrows it to one topic once the blog is large). Read it
   fully; open an article file only when you need to check wording.
2. Outbound: in the new article, link the first natural mention of any concept another article covers
   (a named architecture, a testing notion, harnesses, the fractional model…). One link per target.
   Prefer linking existing words over adding text. If a strongly related article has no natural
   mention, add at most one short factual bridging sentence at the end of the body. Aim for 2–5 links.
3. Inbound: pick the 1–3 existing articles where the new article is the most natural next read
   (shared tags, a concept the new article explains in depth). In each, link the first natural
   mention in BOTH fr.md and en.md with the right prefix, or add one bridging sentence at the end.
   Do not touch other content and do not set `updatedDate` (it is derived from git).
4. Never link the article to itself, never link inside headings or code, never link a target that
   does not exist (`check` fails on both). Do not add inbound links to an article scheduled for a
   later day: they would 404 until then (`check` warns). Add them once it is live.

The "Read next" block is generated from shared tags, so tags matter too: choose them for the cluster
the article belongs to, not for breadth.

## Spec format

```json
{
  "slug": "functional-core-imperative-shell",
  "pubDate": "2026-09-11",
  "updatedDate": "2026-10-01",
  "tags": ["architecture", "testing"],
  "cover": "cover.jpg",
  "images": [
    { "from": "/absolute/or/relative/path/photo.jpg", "as": "cover.jpg" },
    { "from": "diagram.png" }
  ],
  "linkedin": "https://www.linkedin.com/feed/update/urn:li:activity:7504254004768530433/",
  "sources": [
    {
      "title": "Boundaries",
      "author": "Gary Bernhardt",
      "year": 2012,
      "url": "https://www.destroyallsoftware.com/talks/boundaries"
    }
  ],
  "draft": false,
  "fr": {
    "title": "…",
    "description": "…",
    "coverAlt": "…",
    "bodyFile": "fr.body.md"
  },
  "en": {
    "title": "…",
    "description": "…",
    "coverAlt": "…",
    "bodyFile": "en.body.md"
  }
}
```

`pubDate` (default: today), `updatedDate`, `cover`, `images`, `linkedin`, `sources`, `coverAlt` and
`draft` are optional. Dates are `YYYY-MM-DD`. `bodyFile` and `images[].from` are resolved relative to the
spec file, or absolute; a short body may be given inline as `"body"` instead of `bodyFile`. Images
wider than 1600px are resized on copy (phone photos are rotated upright). `images[].as` must be
lowercase, without spaces, and keep the extension of its source: images are never converted. `cover`
must be one of the copied images.

## Updating an existing article

Edit `src/content/blog/<slug>/{fr,en}.md` directly and keep both languages in sync; the "Updated"
date comes from git once the change is committed (set `updatedDate` only to override it). Then run
`node scripts/article.ts check <slug>` and `npm run build`. `check` fails when `pubDate`, tags or the
draft flag differ between the two files, and warns when `updatedDate`, cover, headings, images, code
blocks or link targets do.
