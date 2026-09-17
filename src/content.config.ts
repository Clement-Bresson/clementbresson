import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { tagIds } from "./data/tags";

/**
 * Blog articles. One folder per article, always with both languages:
 *
 *   src/content/blog/<slug>/en.md
 *   src/content/blog/<slug>/fr.md
 *   src/content/blog/<slug>/cover.jpg   (+ any other image used by the body)
 *
 * The folder name is the public slug for both languages. Images are
 * referenced relatively (`./cover.jpg`) so deleting the folder removes the
 * article and every asset it owns. Entry ids are `<slug>/<lang>`.
 */
const blog = defineCollection({
  loader: glob({
    pattern: "*/{en,fr}.md",
    base: "./src/content/blog",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      /** Meta description and list excerpt. Aim for 120–160 characters. */
      description: z.string().min(1),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      /** Relative to the article folder, e.g. `./cover.jpg`. Used for OG and schema. */
      cover: image().optional(),
      coverAlt: z.string().optional(),
      /** Only keys of `src/data/tags.json` are accepted. Both languages of an article must carry the same tags. */
      tags: z.array(z.enum(tagIds)).default([]),
      /** URL of the original LinkedIn post, when the article started as one. Rendered as attribution and as schema `sameAs`. */
      linkedin: z.url().optional(),
      /** Works the article cites. Rendered as a Sources section and as schema `citation`. */
      sources: z
        .array(
          z.object({
            title: z.string().min(1),
            author: z.string().optional(),
            year: z.number().int().optional(),
            url: z.url().optional(),
          }),
        )
        .default([]),
      /** Drafts are visible in `astro dev` but excluded from the build. */
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
