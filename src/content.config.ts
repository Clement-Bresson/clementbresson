import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { tagIds } from "./data/tags";

const blog = defineCollection({
  loader: glob({
    pattern: "*/{en,fr}.md",
    base: "./src/content/blog",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      tags: z.array(z.enum(tagIds)).default([]),
      linkedin: z.url().optional(),
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
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
