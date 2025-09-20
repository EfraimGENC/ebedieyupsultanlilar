import { z, defineCollection, defineContentConfig } from "@nuxt/content";
import { asRobotsCollection } from "@nuxtjs/robots/content";

// Common schema for home pages
const homeSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string().optional(),
  featured: z.boolean().default(false),
});

// Helper: partial date with validation rules (allows unknown, year-only, month+year, or day+month+year)
const partialDateBase = z.object({
  year: z.number().int().min(1).max(3000).optional(),
  month: z.number().int().min(1).max(12).optional(),
  day: z.number().int().min(1).max(31).optional(),
});

const partialDateWithPlace = partialDateBase
  .extend({
    place: z.string().max(127).optional(),
  })
  // If month is provided, year must be provided
  .refine((d) => !d.month || !!d.year, {
    message: "month requires year",
    path: ["month"],
  })
  // If day is provided, month and year must be provided
  .refine((d) => !d.day || (!!d.month && !!d.year), {
    message: "day requires month and year",
    path: ["day"],
  })
  // If day and month are provided, check basic month-day bounds (not leap-year aware)
  .refine(
    (d) => {
      if (d.day && d.month) {
        const monthDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return d.day <= monthDays[d.month - 1];
      }
      return true;
    },
    {
      message: "invalid day for given month",
      path: ["day"],
    }
  );

// Common schema for person pages
const personSchema = z.object({
  title: z.string(),
  description: z.string().min(50).max(150),
  birth: partialDateWithPlace.optional(),
  death: partialDateWithPlace.optional(),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  cover: z.string().optional(),
  narrationAudio: z.string().optional(),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
});

export default defineContentConfig({
  collections: {
    // Turkish people collection
    people_tr: defineCollection(
      asRobotsCollection({
        type: "page",
        source: {
          include: "tr/**",
          prefix: "",
        },
        schema: personSchema,
      })
    ),
    // English people collection
    people_en: defineCollection(
      asRobotsCollection({
        type: "page",
        source: {
          include: "en/**",
          prefix: "",
        },
        schema: personSchema,
      })
    ),
    // French people collection
    people_fr: defineCollection(
      asRobotsCollection({
        type: "page",
        source: {
          include: "fr/**",
          prefix: "",
        },
        schema: personSchema,
      })
    ),
  },
});
