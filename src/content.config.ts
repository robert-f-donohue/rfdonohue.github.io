import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const blog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),

      // NEW: allow tags + optional linking to a project page
      tags: z.array(z.string()).default([]),
      projectSlug: z.string().optional(),

      // allow local images via image()
      heroImage: image().optional(),
    }),
});

const projects = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date().optional(),

      category: z.enum(["academic", "startup"]).default("academic"),

      status: z.enum(["active", "completed", "paused"]).default("active"),
      tags: z.array(z.string()).default([]),
      highlights: z.array(z.string()).default([]),

      website: z.string().url().optional(),
      writeup: z.string().url().optional(),
      demo: z.string().url().optional(),
      paper: z.string().url().optional(),
      slides: z.string().url().optional(),

      heroImage: image().optional(),
    }),
});

export const collections = { blog, projects };