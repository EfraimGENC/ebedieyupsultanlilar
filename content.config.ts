import { z, defineCollection, defineContentConfig } from "@nuxt/content";

// Common schema for home pages
const homeSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string().optional(),
  featured: z.boolean().default(false),
});

// Common schema for person pages
const personSchema = z.object({
  title: z.string(),
  name: z.string(),
  shortDescription: z.string().max(255),
  birthYear: z.number().optional(),
  birthPlace: z.string().max(127).optional(),
  deathYear: z.number().optional(),
  deathPlace: z.string().max(127).optional(),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  image: z.string().optional(),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
});

export default defineContentConfig({
  collections: {
    // Turkish people collection
    people_tr: defineCollection({
      type: "page",
      source: {
        include: "tr/**",
        prefix: "",
      },
      schema: personSchema,
    }),
    // English people collection
    people_en: defineCollection({
      type: "page",
      source: {
        include: "en/**",
        prefix: "",
      },
      schema: personSchema,
    }),
    // French people collection
    people_fr: defineCollection({
      type: "page",
      source: {
        include: "fr/**",
        prefix: "",
      },
      schema: personSchema,
    }),
  },
});
