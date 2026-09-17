// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { latestPostDate, postLastModified } from "./src/lib/post-dates.mjs";

// Canonical origin, used for hreflang alternates and Open Graph URLs.
// Override at build time with SITE_URL for previews or staging.
const site = process.env.SITE_URL ?? "https://clementbresson.com";

// <lastmod> per article URL, from `updatedDate` (or `pubDate`) in the frontmatter.
const lastModified = postLastModified();
const latest = latestPostDate();
const postUrl = /^\/(?:(fr)\/)?blog\/([^/]+)\/?$/;
// Blog index and tag pages change whenever an article is published or updated.
const listUrl = /^\/(?:fr\/)?blog\/(?:tag\/[^/]+\/?)?$/;

// https://astro.build/config
export default defineConfig({
  site,
  output: "static",
  trailingSlash: "ignore",
  integrations: [
    sitemap({
      // Emits <xhtml:link rel="alternate" hreflang> pairs for /x and /fr/x.
      i18n: { defaultLocale: "en", locales: { en: "en", fr: "fr" } },
      serialize(item) {
        const path = new URL(item.url).pathname;
        const m = path.match(postUrl);
        if (m && m[2] !== "tag") {
          const date = lastModified.get(`${m[1] ?? "en"}/${m[2]}`);
          if (date) item.lastmod = date.toISOString();
        } else if (listUrl.test(path) && latest) {
          item.lastmod = latest.toISOString();
        }
        return item;
      },
    }),
  ],
  i18n: {
    locales: ["en", "fr"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  fonts: [
    {
      // Newsreader: variable, with optical-size axis (6..72) so the 44px name
      // renders with the same display cut as the prototype's Google Fonts build.
      provider: fontProviders.local(),
      name: "Newsreader",
      cssVariable: "--font-newsreader",
      display: "swap",
      fallbacks: ["Georgia", "Times New Roman", "serif"],
      options: {
        variants: [
          {
            src: [
              "./node_modules/@fontsource-variable/newsreader/files/newsreader-latin-standard-normal.woff2",
            ],
            weight: "200 800",
            style: "normal",
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Geist",
      cssVariable: "--font-geist",
      display: "swap",
      fallbacks: ["system-ui", "sans-serif"],
      options: {
        variants: [
          {
            src: [
              "./node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2",
            ],
            weight: "100 900",
            style: "normal",
          },
        ],
      },
    },
  ],
});
