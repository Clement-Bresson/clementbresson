# clementbresson — personal site

Personal site and bilingual blog for Clément Bresson, Fractional Tech Lead. Built with [Astro](https://astro.build), static output, zero client JavaScript.

## Routes

| URL                                                                | Content                                |
| ------------------------------------------------------------------ | -------------------------------------- |
| `/`, `/fr/`                                                        | Home (English default, French)         |
| `/blog/`, `/fr/blog/`                                              | Blog index with a topics row           |
| `/blog/<slug>/`                                                    | Article (`/fr/blog/<slug>/` in French) |
| `/blog/tag/<tag>/`                                                 | Tag page (`/fr/blog/tag/<tag>/`)       |
| `/rss.xml`, `/fr/rss.xml`                                          | RSS feeds                              |
| `/sitemap-index.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt` | Generated for search and AI crawlers   |

Copy lives in `src/i18n/en.ts` and `src/i18n/fr.ts`. Link targets live in `src/data/links.ts`.

## Commands

| Command                 | Action                                   |
| ----------------------- | ---------------------------------------- |
| `npm install`           | Install dependencies                     |
| `npm run dev`           | Start the dev server at `localhost:4321` |
| `npm run build`         | Build the production site to `./dist/`   |
| `npm run preview`       | Preview the production build locally     |
| `npm run article`       | Article tooling, see below               |
| `npm run article:check` | Validate every article                   |

## Blog: publishing an article

Every article exists in French and English, in one folder:

```
src/content/blog/<slug>/
  fr.md          # required
  en.md          # required (the build fails if one language is missing)
  cover.jpg      # optional cover, used for social previews
  *.png|jpg      # images used in the text, referenced as ./file.png
```

The folder name is the URL slug in both languages. Never rename it once published.

### The fast way: with Claude Code

Give Claude the text (French or English, a draft or a LinkedIn post) and the image paths, and say "new article". The `blog-article` skill (`.claude/skills/blog-article/SKILL.md`) makes Claude:

1. translate to the other language and clean the text (LinkedIn calls-to-action removed, headings and lists added),
2. propose the slug, a 120–160 character description per language and 1–2 tags,
3. read the article index and add links to related articles, in the new article and from existing ones,
4. run the script below, which does everything mechanical and builds the site.

Review the output, then commit and push. The deploy is automatic.

### The manual way: the script

`scripts/article.mjs` is deterministic and does not use any AI.

| Command                                    | What it does                                                                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `npm run article create spec.json --build` | Creates the folder from a JSON spec: copies images (resizing above 1600px), writes `fr.md` and `en.md`, validates, builds |
| `npm run article check [slug]`             | Validates one or all articles: both languages, same tags, known tags, images present, internal links resolve              |
| `npm run article index`                    | Prints every article with titles, descriptions and headings, to choose link targets                                       |
| `npm run article tags`                     | Lists the tag vocabulary                                                                                                  |

Minimal spec:

```json
{
  "slug": "my-article",
  "pubDate": "2026-09-20",
  "tags": ["architecture"],
  "cover": "cover.jpg",
  "images": [{ "from": "/path/to/photo.jpg", "as": "cover.jpg" }],
  "fr": {
    "title": "…",
    "description": "…",
    "coverAlt": "…",
    "body": "markdown…"
  },
  "en": {
    "title": "…",
    "description": "…",
    "coverAlt": "…",
    "body": "markdown…"
  }
}
```

Optional fields: `updatedDate`, `linkedin` (URL of the original post, shown as attribution), `sources` (list of `{ title, author?, year?, url? }`, rendered as a Sources section), `draft`. Full format in the skill file.

### Rules worth knowing

- Frontmatter `tags` must be keys of `src/data/tags.ts`, identical in both languages. To add a topic, add it there first with an EN and FR label and description. A tag page appears once an article uses it.
- Use `##` headings only: the layout renders the title as H1.
- Link other articles with relative URLs: `/blog/<slug>/` in `en.md`, `/fr/blog/<slug>/` in `fr.md`.
- `draft: true` shows in `npm run dev` but is excluded from the build (`SHOW_DRAFTS=1 npm run build` includes drafts).
- Set `updatedDate` when you revise an article: it feeds `dateModified` and the sitemap.
- Everything for SEO and AI search is generated at build: canonical and hreflang tags, Open Graph, JSON-LD (Person, WebSite, Blog, BlogPosting with citations, breadcrumbs), sitemap with `lastmod`, robots.txt allowing AI crawlers, llms.txt, RSS.

## Deploy (Cloudflare Workers, via GitHub Actions)

Every push to `main` runs `.github/workflows/deploy.yml`: it builds the site, then deploys `dist/` as a Cloudflare Worker with static assets using `wrangler.jsonc`. Pull requests only run the build.

One-time setup:

1. **Cloudflare account**: create one at dash.cloudflare.com and note the _Account ID_ (Workers & Pages → Overview, right column).
2. **API token**: My Profile → API Tokens → Create Token → template _Edit Cloudflare Workers_. Copy the token.
3. **GitHub secrets** (repo → Settings → Secrets and variables → Actions): `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
4. **First deploy**: push to `main` (or run the workflow manually). Before the custom domain is attached, temporarily set `"workers_dev": true` in `wrangler.jsonc` to get a `clementbresson.clement0bresson.workers.dev` URL for checking.
5. **Domain**: in Cloudflare, _Add a domain_ → `clementbresson.com` (Free plan). Cloudflare gives you two nameservers. In GoDaddy → Domain → Nameservers → _Change_ → _Enter my own_, paste them. Propagation takes minutes to a few hours; Cloudflare emails when the zone is active.
6. **Attach the domain**: the `routes` block in `wrangler.jsonc` declares both hostnames as custom domains; any deploy applies it. Cloudflare creates the DNS records and TLS certificate for `clementbresson.com` and `www.clementbresson.com`.
7. **www redirect**: Workers static assets do not support host-based rules in `_redirects`, so add a Redirect Rule in Cloudflare (domain → Rules → Redirect Rules → _Redirect from WWW to root_ template).

Local deploy is also possible with `npx wrangler login` then `npm run deploy`.

Set `SITE_URL` at build time to override the canonical origin (defaults to `https://clementbresson.com`), for example for a staging build.

## Fonts

Newsreader (display) and Geist (body) are self-hosted through Astro's Fonts API from the `@fontsource-variable/*` packages, preloaded, with `font-display: swap`.
