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

### How to publish an article (recipe)

When the user gives article text and/or images, or asks for a new article, ALWAYS follow the `blog-article` skill (`.claude/skills/blog-article/SKILL.md`). In short:

1. `node scripts/article.ts tags` and `node scripts/article.ts index` to know the vocabulary and the existing articles.
2. Your job is translation and judgment fields only: clean the source text, translate it faithfully to the other language, choose slug, titles (≤ 65 chars), descriptions (120–160 chars), 1–2 tags, and cross-links (in the new article and from 1–3 existing ones).
3. In the scratchpad, write the two bodies as Markdown files and a spec JSON that points to them (`bodyFile`), then run `node scripts/article.ts create <spec.json> --build`. Never write `fr.md`/`en.md` by hand for a new article; the script owns the mechanics (images, frontmatter, validation, build).
4. After inbound-link edits to existing articles, run `node scripts/article.ts check` and `npm run build`.
5. Report the two URLs. Commit and push only when asked (the deploy is automatic on push to main). A commit for an article holds the new folder, the existing articles edited for inbound links, and `src/data/tags.json` if a tag was added.

The README has the human-facing version of this recipe. The rules below are what the build enforces.

### Headless runs (the `blog-post` pipeline)

The `blog-post` GitHub workflow runs the same recipe without a human, through the OpenCode agent `.opencode/agents/blog-writer.md`, from a text sent by phone. Nobody answers questions during such a run: decide and continue. Rules specific to that mode, on top of the recipe and the skill:

- Scope: create the new folder under `src/content/blog/` and edit existing articles there only for inbound links. Work files (`spec.json`, bodies, summary) go in `.pipeline/`, which is ignored by git. Never touch anything else: no layouts, components, config, `src/data/tags.json` (use existing tags only) or workflow files. The agent's permissions deny it; the workflow fails if anything else changed.
- Faithful, not enriched: the article says what the text says, in both languages. Never invent a source, URL, number, quote or person. A source goes in the `sources` field only when the text names it or you are certain of it, and its `url` only when you are certain of the exact URL. When the text states a figure, a study or a claim that needs a source and gives none, keep the sentence and add `<!-- TODO source: what is missing -->` on its own line right after the paragraph, in both `fr.md` and `en.md`. Use a Markdown comparison table when the text compares alternatives; do not force one.
- Validation is `node scripts/article.ts create .pipeline/spec.json --build`, then `node scripts/article.ts check` and `npm run build` after inbound-link edits. An article that fails is fixed and re-run with `--force`; it is never left half-written.
- Do not commit. The workflow commits `post: <slug>` on branch `post/<slug>`, opens the PR with a body built from `.pipeline/summary.md` (three lines at most, in English, describing the article), the TODO markers found in the files and the `sources` of the frontmatter, and posts the preview URL as a comment.

### Formatting

Prettier with its defaults (`.prettierrc.json` only adds the Astro plugin), identical to format-on-save in the editor. `npm run format` formats everything, `npm run format:check` verifies. `article.ts create` formats the article it writes. Write code in that style (double quotes, 80 columns) rather than reformatting afterwards.

No comments in code unless strictly necessary: keep one only when it prevents a specific mistake the code cannot express (a load-bearing call, an ordering constraint, a magic number) or when it is a functional directive (`// @ts-check`, `@type`). No doc blocks, no section headers, no restating what the code says.

### Structure and rules

Routes follow Astro's i18n convention: one literal folder per locale (`src/pages/blog/` for the default locale, `src/pages/fr/blog/` for French). Those page files stay thin: they hold `getStaticPaths` and delegate the whole page to `src/components/BlogPostPage.astro` or `BlogListPage.astro`. Change the shared component, never one locale's page.

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
- Tags: `tags` may only contain keys of `src/data/tags.json` (typed by `src/data/tags.ts`, read by the script), and `en.md` and `fr.md` must carry the same tags (the build checks both). Add a new tag to that file first, with an EN and FR label and description. Each tag with at least one post gets `/blog/tag/<key>/` and `/fr/blog/tag/<key>/`. Never rename a published key.
- `draft: true` posts render in `astro dev` but are excluded from the build. Set `SHOW_DRAFTS=1` to include them in a build.
- Scheduling: an article whose `pubDate` is a later day (Europe/Paris, see `src/lib/publish-date.ts`) is treated like a draft until that day. The deploy workflow rebuilds every morning, which publishes it. `check` warns when a live article links to one that is not live yet.
- `pubDate`, `draft` and `tags` must be identical in `en.md` and `fr.md` (`check` enforces it; it only warns when `updatedDate`, `cover` or `linkedin` differ, which is legitimate when one language was revised alone). Frontmatter dates are always `YYYY-MM-DD`; pages display them in the reader's language (`25 août 2026` / `August 25, 2026`).
- Generated automatically at build: `sitemap-index.xml` (with hreflang and `lastmod`), JSON-LD on every page, `robots.txt`, `llms.txt`, `llms-full.txt`, `rss.xml` and `fr/rss.xml`.
