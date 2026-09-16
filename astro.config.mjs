// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// Canonical origin, used for hreflang alternates and Open Graph URLs.
// Override at build time with SITE_URL for previews or staging.
const site = process.env.SITE_URL ?? 'https://clementbresson.com';

// https://astro.build/config
export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
    },
  },
  fonts: [
    {
      // Newsreader: variable, with optical-size axis (6..72) so the 44px name
      // renders with the same display cut as the prototype's Google Fonts build.
      provider: fontProviders.local(),
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      display: 'swap',
      fallbacks: ['Georgia', 'Times New Roman', 'serif'],
      options: {
        variants: [
          {
            src: ['./node_modules/@fontsource-variable/newsreader/files/newsreader-latin-standard-normal.woff2'],
            weight: '200 800',
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Geist',
      cssVariable: '--font-geist',
      display: 'swap',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [
          {
            src: ['./node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2'],
            weight: '100 900',
            style: 'normal',
          },
        ],
      },
    },
  ],
});
