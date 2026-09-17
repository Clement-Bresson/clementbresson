// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { latestPostDate, postLastModified } from "./src/lib/post-dates.mjs";

const site = process.env.SITE_URL ?? "https://clementbresson.com";

const lastModified = postLastModified();
const latest = latestPostDate();
const postUrl = /^\/(?:(fr)\/)?blog\/([^/]+)\/?$/;
const listUrl = /^\/(?:fr\/)?blog\/(?:tag\/[^/]+\/?)?$/;

export default defineConfig({
  site,
  output: "static",
  trailingSlash: "ignore",
  integrations: [
    sitemap({
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
