import { z, defineCollection, defineContentConfig } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    person: defineCollection({
      type: 'page',
      source: 'person/**/*.md',
      schema: z.object({
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
        draft: z.boolean().default(false)
      })
    })
  }
})
