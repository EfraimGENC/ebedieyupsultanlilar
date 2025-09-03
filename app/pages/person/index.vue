<template>
  <div>
    <!-- Hero Section -->
    <div class="bg-gray-50 dark:bg-gray-900 py-16">
      <div class="max-w-7xl mx-auto">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            {{ $t('person.title') }}
          </h1>
          <p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            {{ $t('person.description') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Person Grid -->
    <div class="max-w-7xl mx-auto py-12">
      <!-- Filter Section -->
      <div class="mb-8">
        <div class="flex flex-wrap gap-4 items-center justify-between">
          <div class="flex flex-wrap gap-2">
            <UButton v-for="category in categories" :key="category"
              :color="selectedCategory === category ? 'primary' : 'neutral'" variant="soft"
              @click="filterByCategory(category)">
              {{ category }}
            </UButton>
          </div>

          <div class="w-full sm:w-auto">
            <UInput v-model="searchQuery" :placeholder="$t('person.search')" icon="i-tabler-search"
              class="min-w-[300px]" />
          </div>
        </div>
      </div>

      <!-- Person Cards Grid -->
      <div v-if="filteredPeople.length > 0" class="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div v-for="person in filteredPeople" :key="(person as any).path" class="group cursor-pointer"
          @click="navigateToPersonDetail(person)">
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <!-- Image -->
            <div class="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
              <NuxtImg v-if="(person as any).meta?.image" :src="(person as any).meta.image"
                :alt="(person as any).meta?.name"
                class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy" />
              <div v-else class="w-full h-48 flex items-center justify-center">
                <UIcon name="i-tabler-user-circle" class="text-6xl text-gray-400" />
              </div>
            </div>

            <!-- Content -->
            <div class="p-6">
              <div class="flex items-center justify-between mb-2">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                  {{ (person as any).meta?.category }}
                </span>
                <div v-if="(person as any).meta?.birthYear && (person as any).meta?.deathYear"
                  class="text-sm text-gray-500">
                  {{ (person as any).meta.birthYear }} - {{ (person as any).meta.deathYear }}
                </div>
              </div>

              <h3
                class="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {{ (person as any).meta?.name }}
              </h3>

              <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                {{ (person as any).meta?.shortDescription }}
              </p>

              <!-- Tags -->
              <div v-if="(person as any).meta?.tags && (person as any).meta.tags.length > 0"
                class="flex flex-wrap gap-1">
                <span v-for="tag in (person as any).meta.tags.slice(0, 3)" :key="tag"
                  class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  {{ tag }}
                </span>
                <span v-if="(person as any).meta.tags.length > 3" class="text-xs text-gray-500">
                  +{{ (person as any).meta.tags.length - 3 }} {{ $t('common.more') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <UIcon name="i-tabler-users" class="text-6xl text-gray-400 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ $t('person.noResults') }}
        </h3>
        <p class="text-gray-500">
          {{ $t('person.noResultsDescription') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Collections } from '@nuxt/content'

const route = useRoute()
const { locale } = useI18n()

// Meta
definePageMeta({
  title: 'person.metaTitle',
  description: 'person.metaDescription'
})

// i18n
const { t } = useI18n()
const localePath = useLocalePath()

// Data
const searchQuery = ref('')
const selectedCategory = ref('all')

// Fetch persons data based on current locale
const { data: people } = await useAsyncData('people-' + locale.value, async () => {
  const collection = ('people_' + locale.value) as keyof Collections

  try {
    const content = await queryCollection(collection).all()

    // Filter person items from the collection
    const personItems = content.filter((item: any) => item.path?.includes('/person/'))

    return personItems
  } catch (error) {
    // Fallback to default locale if error occurs
    if (locale.value !== 'tr') {
      const fallbackContent = await queryCollection('people_tr').all()
      return fallbackContent.filter((item: any) => item.path?.includes('/person/'))
    }
    return []
  }
}, {
  watch: [locale], // Refetch when locale changes
})

// Computed
const categories = computed(() => {
  const cats = ['all', ...new Set(people.value?.map((person: any) => person.meta?.category) || [])]
  return cats.filter(cat => cat) // Remove undefined values
})

const filteredPeople = computed(() => {
  if (!people.value) return []

  let filtered = people.value

  // Filter by category
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter((person: any) => person.meta?.category === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((person: any) =>
      person.meta?.name?.toLowerCase().includes(query) ||
      person.meta?.shortDescription?.toLowerCase().includes(query) ||
      person.meta?.tags?.some((tag: string) => tag.toLowerCase().includes(query))
    )
  }

  return filtered
})

// Methods
const filterByCategory = (category: string) => {
  selectedCategory.value = category
}

const navigateToPersonDetail = (person: any) => {
  // Extract slug from person path
  const slug = person.path.split('/').pop()
  navigateTo(localePath(`/person/${slug}`))
}

// SEO
useSeoMeta({
  title: () => t('person.metaTitle'),
  description: () => t('person.metaDescription'),
  ogTitle: () => t('person.metaTitle'),
  ogDescription: () => t('person.metaDescription'),
  ogType: 'website'
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
