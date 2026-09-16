---
name: blog-article
description: Turn raw text (any language) and images into a published bilingual blog article. Use when the user gives article content, a LinkedIn post, or says "new article", "publie cet article", "add this to the blog". The model translates and fills judgment fields; scripts/article.mjs does everything mechanical.
---

# Blog article

The blog needs every article in French AND English, in `src/content/blog/<slug>/`. Your job is
translation plus a few judgment fields. Everything else (folder, images, frontmatter, validation,
build) is done by the deterministic script `scripts/article.mjs`. Never write the article files by hand.

## Inputs to collect from the user

- The text, in French or English (a draft, notes, or a LinkedIn post). Ask only if the text is missing.
- Images, if any (paths on disk). The first one is the cover unless the user says otherwise.
- Optional: publication date (default today), the LinkedIn post URL, sources.

Do not ask for slug, description or tags: propose them.

## Steps

1. `node scripts/article.mjs tags` to see the tag vocabulary. Pick 1–2 tags. If none fits, add one to
   `src/data/tags.ts` (key + EN/FR label and description) before continuing.
2. Prepare the source language version:
   - Keep the author's voice, first person, and tu/vous choice. Fix typos and accents. Do not add facts.
   - If it comes from LinkedIn, remove every call-to-action ("n'hésitez pas à me suivre", "DM ouverts",
     "1 post par jour", "-----" footers). Keep "Bon designs !" when present.
   - Structure: short intro, `##` headings where natural (never `#`), lists for enumerations, fenced code
     blocks with a language. CAPS emphasis becomes **bold**.
   - Images: reference them as `![alt](./file.jpg)` where they belong in the text.
   - Internal links: see "Cross-linking" below. Relative URLs only: `/blog/<slug>/` in EN,
     `/fr/blog/<slug>/` in FR. Same targets in both languages.
   - Do not write a Sources section in the body: put sources in the `sources` field. Only include a URL
     you are certain of; otherwise title + author only.
3. Translate to the other language faithfully: same structure, headings, lists, links (with the other
   language's path prefix), same images with translated alt text. Natural, idiomatic, "you" in English.
   Keep technical terms in English (harness, test double, Dependency Rule…). "TJM" → "daily rate",
   "vibecodé" → "vibe-coded", "Bon designs !" → "Happy designing!".
4. Judgment fields, per language: `title` (≤ 65 chars, specific, no clickbait), `description`
   (120–160 chars, one real sentence: meta description and excerpt), `coverAlt` if there is a cover.
   Slug: lowercase kebab-case, English, stable forever.
5. Write the spec JSON to the scratchpad (not the project) and run:
   `node scripts/article.mjs create <spec.json> --build`
   Fix anything it reports and re-run with `--force`.
6. Inbound links (see "Cross-linking"): edit the existing articles that should point to the new one,
   then `node scripts/article.mjs check` and `npm run build`. Show the two URLs printed in step 5 and
   list the articles you linked from.
7. Do not commit unless asked. When asked, commit only `src/content/blog/<slug>/` (and `src/data/tags.ts`
   if a tag was added) and push; the deploy is automatic.

## Cross-linking

Every article should be woven into the existing ones. Do this on every new article:

1. `node scripts/article.mjs index` prints every existing article with slug, tags, titles, descriptions
   and section headings. Read it fully; open an article file only when you need to check wording.
2. Outbound: in the new article, link the first natural mention of any concept another article covers
   (a named architecture, a testing notion, harnesses, the fractional model…). One link per target.
   Prefer linking existing words over adding text. If a strongly related article has no natural
   mention, add at most one short factual bridging sentence at the end of the body. Aim for 2–5 links.
3. Inbound: pick the 1–3 existing articles where the new article is the most natural next read
   (shared tags, a concept the new article explains in depth). In each, link the first natural
   mention in BOTH fr.md and en.md with the right prefix, or add one bridging sentence at the end.
   Do not touch other content and do not set `updatedDate` for a link-only edit.
4. Never link the article to itself, never link inside headings or code, never link a target that
   does not exist (`check` fails on unknown slugs).

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
  "sources": [{ "title": "Boundaries", "author": "Gary Bernhardt", "year": 2012, "url": "https://www.destroyallsoftware.com/talks/boundaries" }],
  "draft": false,
  "fr": { "title": "…", "description": "…", "coverAlt": "…", "body": "markdown…" },
  "en": { "title": "…", "description": "…", "coverAlt": "…", "body": "markdown…" }
}
```

`updatedDate`, `cover`, `images`, `linkedin`, `sources`, `coverAlt` and `draft` are optional. Image
paths in `images[].from` are resolved relative to the spec file, or absolute. Images wider than
1600px are resized on copy. `cover` must be one of the copied images.

## Updating an existing article

Edit `src/content/blog/<slug>/{fr,en}.md` directly, set `updatedDate` in both, keep both languages in
sync, then run `node scripts/article.mjs check <slug>` and `npm run build`.
