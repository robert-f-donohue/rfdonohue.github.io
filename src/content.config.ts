import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),

    // Projects aren't always "posted"
    pubDate: z.coerce.date().optional(),

    status: z.enum(["active", "completed", "paused"]).default("active"),
    tags: z.array(z.string()).default([]),

    highlights: z.array(z.string()).default([]),

    // External links (all optional)
    website: z.string().url().optional(),
    writeup: z.string().url().optional(),
    demo: z.string().url().optional(),
    paper: z.string().url().optional(),
    slides: z.string().url().optional(),

    heroImage: z.string().optional(),
  }),
});

export const collections = { blog, projects };