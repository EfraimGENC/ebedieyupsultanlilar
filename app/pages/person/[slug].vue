<template>
  <div>
    <!-- Hero Section -->
    <div class="relative bg-gray-50 dark:bg-gray-900 py-16 lg:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:grid lg:grid-cols-12 lg:gap-8">
          <!-- Image -->
          <div class="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-4 lg:text-left">
            <div class="aspect-w-3 aspect-h-4 rounded-lg overflow-hidden shadow-lg">
              <NuxtImg v-if="(person as any)?.meta?.image" :src="(person as any).meta.image"
                :alt="(person as any).meta?.name" class="w-full h-96 lg:h-full object-cover" loading="lazy" />
              <div v-else class="w-full h-96 lg:h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <UIcon name="i-tabler-user-circle" class="text-8xl text-gray-400" />
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="mt-8 lg:mt-0 lg:col-span-8">
            <div class="mb-4">
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                {{ (person as any)?.meta?.category }}
              </span>
            </div>

            <h1 class="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              {{ (person as any)?.meta?.name }}
            </h1>

            <p class="mt-6 text-xl text-gray-600 dark:text-gray-400 leading-8">
              {{ (person as any)?.meta?.shortDescription }}
            </p>

            <!-- Life Dates -->
            <div v-if="(person as any)?.meta?.birthYear || (person as any)?.meta?.deathYear"
              class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-if="(person as any)?.meta?.birthYear" class="flex items-center">
                <UIcon name="i-tabler-calendar" class="text-primary-600 mr-3 text-xl" />
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ $t('person.born') }}
                  </div>
                  <div class="text-gray-600 dark:text-gray-400">
                    {{ (person as any).meta.birthYear }}{{ (person as any).meta?.birthPlace ? `, ${(person as
                    any).meta.birthPlace}` : '' }}
                  </div>
                </div>
              </div>

              <div v-if="(person as any)?.meta?.deathYear" class="flex items-center">
                <UIcon name="i-tabler-calendar-x" class="text-gray-500 mr-3 text-xl" />
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ $t('person.died') }}
                  </div>
                  <div class="text-gray-600 dark:text-gray-400">
                    {{ (person as any).meta.deathYear }}{{ (person as any).meta?.deathPlace ? `, ${(person as
                    any).meta.deathPlace}` : '' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Tags -->
            <div v-if="(person as any)?.meta?.tags && (person as any).meta.tags.length > 0" class="mt-8">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
                {{ $t('person.tags') }}
              </h3>
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in (person as any).meta.tags" :key="tag"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="prose prose-lg dark:prose-invert max-w-none">
        <ContentRenderer :value="person" />
      </div>
    </div>

    <!-- Navigation -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="border-t border-gray-200 dark:border-gray-700 pt-8">
        <div class="flex justify-between items-center">
          <UButton :to="localePath('/person')" color="neutral" variant="ghost" icon="i-tabler-arrow-left">
            {{ $t('person.backToList') }}
          </UButton>

          <!-- Share buttons -->
          <div class="flex gap-2">
            <UButton color="neutral" variant="ghost" icon="i-tabler-share" @click="shareContent">
              {{ $t('common.share') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Related Persons -->
    <div v-if="relatedPersons.length > 0" class="bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {{ $t('person.related') }}
        </h2>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="relatedPerson in relatedPersons" :key="(relatedPerson as any).path" class="group cursor-pointer"
            @click="navigateTo(localePath(`/person/${(relatedPerson as any).path?.split('/').pop()}`))">
            <div
              class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <div class="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
                <NuxtImg v-if="(relatedPerson as any).meta?.image" :src="(relatedPerson as any).meta.image"
                  :alt="(relatedPerson as any).meta?.name"
                  class="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy" />
                <div v-else class="w-full h-32 flex items-center justify-center">
                  <UIcon name="i-tabler-user-circle" class="text-4xl text-gray-400" />
                </div>
              </div>

              <div class="p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-medium text-primary-600 dark:text-primary-400">
                    {{ (relatedPerson as any).meta?.category }}
                  </span>
                  <div v-if="(relatedPerson as any).meta?.birthYear && (relatedPerson as any).meta?.deathYear"
                    class="text-xs text-gray-500">
                    {{ (relatedPerson as any).meta.birthYear }} - {{ (relatedPerson as any).meta.deathYear }}
                  </div>
                </div>

                <h3
                  class="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {{ (relatedPerson as any).meta?.name }}
                </h3>

                <p class="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                  {{ (relatedPerson as any).meta?.shortDescription }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { withLeadingSlash } from 'ufo'
import type { Collections } from '@nuxt/content'

// Get route params
const route = useRoute()
const { locale } = useI18n()
const localePath = useLocalePath()
const slug = route.params.slug as string

// Fetch person data based on current locale
const { data: person } = await useAsyncData(`person-${slug}`, async () => {
  // Build collection name based on current locale
  const collection = ('people_' + locale.value) as keyof Collections
  const content = await queryCollection(collection).path(`/person/${slug}`).first()

  // Optional: fallback to default locale if content is missing
  if (!content && locale.value !== 'tr') {
    return await queryCollection('people_tr').path(`/person/${slug}`).first()
  }

  return content
}, {
  watch: [locale], // Refetch when locale changes
})

// 404 if person not found
if (!person.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Person Not Found'
  })
}

// Fetch related persons (same category, exclude current)
const { data: relatedPersons } = await useAsyncData(`related-${slug}`, async () => {
  const collection = ('people_' + locale.value) as keyof Collections
  const allPersons = await queryCollection(collection).all()

  // Filter person items and find related ones
  const personItems = allPersons.filter((item: any) => item.path?.includes('/person/'))
  return personItems
    .filter((p: any) => p.path !== person.value?.path && p.meta?.category === (person.value as any)?.meta?.category)
    .slice(0, 3)
})

// Methods
const shareContent = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: (person.value as any).name,
        text: (person.value as any).shortDescription,
        url: window.location.href
      })
    } catch (err) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href)
    }
  } else {
    // Fallback to clipboard
    await navigator.clipboard.writeText(window.location.href)
  }
}

// SEO
useSeoMeta({
  title: (person.value as any)?.meta?.name,
  description: (person.value as any)?.meta?.shortDescription,
  ogTitle: (person.value as any)?.meta?.name,
  ogDescription: (person.value as any)?.meta?.shortDescription,
  ogImage: (person.value as any)?.meta?.image,
  ogType: 'article',
  articleAuthor: (person.value as any)?.meta?.name,
  articleSection: (person.value as any)?.meta?.category,
  articleTag: (person.value as any)?.meta?.tags
})

// Structured data for better SEO
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: (person.value as any)?.meta?.name,
        description: (person.value as any)?.meta?.shortDescription,
        birthDate: (person.value as any)?.meta?.birthYear ? `${(person.value as any).meta.birthYear}-01-01` : undefined,
        deathDate: (person.value as any)?.meta?.deathYear ? `${(person.value as any).meta.deathYear}-01-01` : undefined,
        birthPlace: (person.value as any)?.meta?.birthPlace,
        deathPlace: (person.value as any)?.meta?.deathPlace,
        image: (person.value as any)?.meta?.image,
        jobTitle: (person.value as any)?.meta?.category,
        keywords: (person.value as any)?.meta?.tags?.join(', ')
      })
    }
  ]
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
