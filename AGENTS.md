## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Blog

To publish an article from raw text and images, use the `blog-article` skill (`.claude/skills/blog-article/SKILL.md`): it translates, then runs `node scripts/article.mjs create <spec.json> --build`, which creates the folder, copies and resizes images, writes both language files and validates everything. `npm run article:check` validates all existing articles.

Articles live in `src/content/blog/<slug>/`, one folder per article, and every article MUST ship in both languages:

```
src/content/blog/<slug>/
  en.md        # required
  fr.md        # required — the build fails if either language is missing
  cover.jpg    # optional, referenced as `cover: ./cover.jpg`
  *.png|jpg    # any image used in the body, referenced relatively (`![alt](./img.png)`)
```

- The folder name is the public slug for both languages (`/blog/<slug>/` and `/fr/blog/<slug>/`). Use lowercase kebab-case and never rename a published folder.
- Frontmatter fields: `title`, `description` (120–160 chars, used as meta description and excerpt), `pubDate`, optional `updatedDate`, `cover`, `coverAlt`, `tags`, `draft`.
- `linkedin`: URL of the original LinkedIn post when the article started there (rendered as attribution and as schema `sameAs`). `sources`: list of `{ title, author?, year?, url? }` the article cites, rendered as a Sources section and as schema `citation`. Only add URLs you are certain of.
- Link related articles inside the text with relative URLs (`/blog/<slug>/` in `en.md`, `/fr/blog/<slug>/` in `fr.md`). A "Read next" block is generated automatically from shared tags.
- Tags: `tags` may only contain keys of `src/data/tags.ts`, and `en.md` and `fr.md` must carry the same tags (the build checks both). Add a new tag to that file first, with an EN and FR label and description. Each tag with at least one post gets `/blog/tag/<key>/` and `/fr/blog/tag/<key>/`. Never rename a published key.
- `draft: true` posts render in `astro dev` but are excluded from the build. Set `SHOW_DRAFTS=1` to include them in a build.
- Generated automatically at build: `sitemap-index.xml` (with hreflang and `lastmod`), JSON-LD on every page, `robots.txt`, `llms.txt`, `llms-full.txt`, `rss.xml` and `fr/rss.xml`.
