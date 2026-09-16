# clementbresson — personal site

One-page personal site for Clément Bresson, Fractional Tech Lead. Built with [Astro](https://astro.build), static output, zero client JavaScript.

## Routes

| URL    | Language        |
| ------ | --------------- |
| `/`    | English (default) |
| `/fr/` | French          |

Copy lives in `src/i18n/en.ts` and `src/i18n/fr.ts`. Link targets live in `src/data/links.ts`.

## Commands

| Command           | Action                                      |
| ----------------- | ------------------------------------------- |
| `npm install`     | Install dependencies                        |
| `npm run dev`     | Start the dev server at `localhost:4321`    |
| `npm run build`   | Build the production site to `./dist/`      |
| `npm run preview` | Preview the production build locally        |

## Deploy (Cloudflare Workers, via GitHub Actions)

Every push to `main` runs `.github/workflows/deploy.yml`: it builds the site, then deploys `dist/` as a Cloudflare Worker with static assets using `wrangler.jsonc`. Pull requests only run the build.

One-time setup:

1. **Cloudflare account**: create one at dash.cloudflare.com and note the *Account ID* (Workers & Pages → Overview, right column).
2. **API token**: My Profile → API Tokens → Create Token → template *Edit Cloudflare Workers*. Copy the token.
3. **GitHub secrets** (repo → Settings → Secrets and variables → Actions): `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
4. **First deploy**: push to `main` (or run the workflow manually). The site is live at `clementbresson.clement0bresson.workers.dev`.
5. **Domain**: in Cloudflare, *Add a domain* → `clementbresson.com` (Free plan). Cloudflare gives you two nameservers. In GoDaddy → Domain → Nameservers → *Change* → *Enter my own*, paste them. Propagation takes minutes to a few hours; Cloudflare emails when the zone is active.
6. **Attach the domain**: the `routes` block in `wrangler.jsonc` declares both hostnames as custom domains; any deploy applies it. Cloudflare creates the DNS records and TLS certificate for `clementbresson.com` and `www.clementbresson.com`.
7. **www redirect**: Workers static assets do not support host-based rules in `_redirects`, so add a Redirect Rule in Cloudflare (domain → Rules → Redirect Rules → *Redirect from WWW to root* template).

Local deploy is also possible with `npx wrangler login` then `npm run deploy`.

Set `SITE_URL` at build time to override the canonical origin (defaults to `https://clementbresson.com`), for example for a staging build.

## Fonts

Newsreader (display) and Geist (body) are self-hosted through Astro's Fonts API from the `@fontsource-variable/*` packages, preloaded, with `font-display: swap`.
