<template>
  <div>
    <!-- Hero Section -->
    <div class="relative bg-gray-50 dark:bg-gray-900 py-16 lg:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:grid lg:grid-cols-12 lg:gap-8">
          <!-- Image -->
          <div class="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-4 lg:text-left">
            <div class="aspect-w-3 aspect-h-4 rounded-lg overflow-hidden shadow-lg">
              <NuxtImg v-if="person.image" :src="person.image" :alt="person.name"
                class="w-full h-96 lg:h-full object-cover" loading="lazy" />
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
                {{ person.category }}
              </span>
            </div>

            <h1 class="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              {{ person.name }}
            </h1>

            <p class="mt-6 text-xl text-gray-600 dark:text-gray-400 leading-8">
              {{ person.shortDescription }}
            </p>

            <!-- Life Dates -->
            <div v-if="person.birthYear || person.deathYear" class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-if="person.birthYear" class="flex items-center">
                <UIcon name="i-tabler-calendar" class="text-primary-600 mr-3 text-xl" />
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ $t('person.born') }}
                  </div>
                  <div class="text-gray-600 dark:text-gray-400">
                    {{ person.birthYear }}{{ person.birthPlace ? `, ${person.birthPlace}` : '' }}
                  </div>
                </div>
              </div>

              <div v-if="person.deathYear" class="flex items-center">
                <UIcon name="i-tabler-calendar-x" class="text-gray-500 mr-3 text-xl" />
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ $t('person.died') }}
                  </div>
                  <div class="text-gray-600 dark:text-gray-400">
                    {{ person.deathYear }}{{ person.deathPlace ? `, ${person.deathPlace}` : '' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Tags -->
            <div v-if="person.tags && person.tags.length > 0" class="mt-8">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
                {{ $t('person.tags') }}
              </h3>
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in person.tags" :key="tag"
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
          <div v-for="relatedPerson in relatedPersons" :key="relatedPerson._path" class="group cursor-pointer"
            @click="navigateTo(localePath(relatedPerson._path))">
            <div
              class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <div class="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
                <NuxtImg v-if="relatedPerson.image" :src="relatedPerson.image" :alt="relatedPerson.name"
                  class="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy" />
                <div v-else class="w-full h-32 flex items-center justify-center">
                  <UIcon name="i-tabler-user-circle" class="text-4xl text-gray-400" />
                </div>
              </div>

              <div class="p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-medium text-primary-600 dark:text-primary-400">
                    {{ relatedPerson.category }}
                  </span>
                  <div v-if="relatedPerson.birthYear && relatedPerson.deathYear" class="text-xs text-gray-500">
                    {{ relatedPerson.birthYear }} - {{ relatedPerson.deathYear }}
                  </div>
                </div>

                <h3
                  class="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {{ relatedPerson.name }}
                </h3>

                <p class="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                  {{ relatedPerson.shortDescription }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Get route params
const route = useRoute()
const { locale } = useI18n()
const localePath = useLocalePath()

// Fetch person data
const { data: person } = await useAsyncData(`person-${route.params.slug}`, () => {
  return queryCollection('person').path(`/person/${slug}`).first()
})


const { data: post } = await useAsyncData(`blog-${slug}`, () => {
  return queryCollection('blog').path(`/blog/${slug}`).first()
})

// 404 if person not found
if (!person.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Person Not Found'
  })
}

// Fetch related persons (same category, exclude current)
const { data: allRelatedPersons } = await useAsyncData(`related-${route.params.slug}`, () =>
  queryContent('person')
    .find()
)

const relatedPersons = computed(() => {
  if (!allRelatedPersons.value || !person.value) return []

  return allRelatedPersons.value
    .filter(p => p._path !== person.value._path && p.category === person.value.category)
    .slice(0, 3)
})

// Methods
const shareContent = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: person.value.name,
        text: person.value.shortDescription,
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
  title: person.value.name,
  description: person.value.shortDescription,
  ogTitle: person.value.name,
  ogDescription: person.value.shortDescription,
  ogImage: person.value.image,
  ogType: 'article',
  articleAuthor: person.value.name,
  articleSection: person.value.category,
  articleTag: person.value.tags
})

// Structured data for better SEO
useJsonld({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: person.value.name,
  description: person.value.shortDescription,
  birthDate: person.value.birthYear ? `${person.value.birthYear}-01-01` : undefined,
  deathDate: person.value.deathYear ? `${person.value.deathYear}-01-01` : undefined,
  birthPlace: person.value.birthPlace,
  deathPlace: person.value.deathPlace,
  image: person.value.image,
  jobTitle: person.value.category,
  keywords: person.value.tags?.join(', ')
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
