<script setup lang="ts">
import type { Collections } from '@nuxt/content'
import Fuse from 'fuse.js'

const route = useRoute()
const { locale } = useI18n()

// Meta
definePageMeta({
  title: 'person.metaTitle',
  description: 'person.metaDescription',
  i18n: {
    paths: {
      tr: '/kisi',
      en: '/person',
      fr: '/personne',
    }
  }
})

// i18n
const { t } = useI18n()
const localePath = useLocalePath()

// Data
const searchQuery = useState<string>('searchQuery', () => '')
const selectedCategory = ref('all')

// Fetch full person data with body content for search and display
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

// Create normalized search data for Fuse.js with Turkish character normalization
const normalizedSearchData = computed(() => {
  if (!people.value) return []

  return people.value.map((person: any) => {
    // Collect all searchable text
    const searchableTexts: string[] = []

    // Add title
    if (person.title) {
      searchableTexts.push(normalizeText(person.title))
    }

    // Add description
    if (person.description) {
      searchableTexts.push(normalizeText(person.description))
    }

    // Add tags
    if (person.tags && Array.isArray(person.tags)) {
      person.tags.forEach((tag: string) => {
        searchableTexts.push(normalizeText(tag))
      })
    }

    // Add category
    if (person.category) {
      searchableTexts.push(normalizeText(person.category))
    }

    // Add birth/death place
    if (person.birth?.place) {
      searchableTexts.push(normalizeText(person.birth.place))
    }
    if (person.death?.place) {
      searchableTexts.push(normalizeText(person.death.place))
    }

    // Extract content from body if available
    if (person.body) {
      const bodyText = extractBodyText(person.body)
      if (bodyText) {
        searchableTexts.push(normalizeText(bodyText))
      }
    }

    return {
      id: person.path || person.id,
      title: normalizeText(person.title || ''),
      content: searchableTexts.join(' '),
      originalPerson: person
    }
  })
})

// Initialize Fuse.js with Turkish-normalized data
const fuse = computed(() => {
  if (!normalizedSearchData.value.length) return null

  return new Fuse(normalizedSearchData.value, {
    keys: [
      { name: 'title', weight: 2 },
      { name: 'content', weight: 1 }
    ],
    threshold: 0.3,
    distance: 100,
    minMatchCharLength: 2,
    shouldSort: true,
    includeScore: true
  })
})

// Computed
const categories = computed(() => {
  const cats = ['all', ...new Set(people.value?.map((person: any) => person.category) || [])]
  const filtered = cats.filter(cat => cat) // Remove undefined values

  // Keep 'all' at the beginning, sort the rest alphabetically
  const [all, ...rest] = filtered
  return [all, ...rest.sort((a, b) => a.localeCompare(b))]
})

const filteredPeople = computed(() => {
  if (!people.value) return []

  let filtered = people.value

  // Filter by category
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter((person: any) => person.category === selectedCategory.value)
  }

  // Filter by search query using Fuse.js with Turkish normalization
  if (searchQuery.value && fuse.value) {
    // Normalize the search query
    const normalizedQuery = normalizeText(searchQuery.value)

    // Search using Fuse.js
    const searchResults = fuse.value.search(normalizedQuery)

    // Get the IDs of matching persons
    const matchingIds = new Set(searchResults.map(result => result.item.id))

    // Filter people based on search results
    filtered = filtered.filter((person: any) => {
      // Create person ID from path
      const personId = person.path || person.id
      return matchingIds.has(personId)
    })
  }

  return filtered
})

// Methods
const filterByCategory = (category: string) => {
  selectedCategory.value = category
}

const personDetailRoute = (person: any) => {
  const slug = person.path.split('/').pop()
  return localePath({ name: 'person-slug', params: { slug } })
}

const navigateToPersonDetail = (person: any) => {
  navigateTo(personDetailRoute(person))
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

<template>
  <div>
    <!-- Hero Section -->
    <div class="bg-gray-50/20 dark:bg-gray-900/20 rounded-2xl p-5">
      <div class="max-w-7xl mx-auto">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            {{ $t('person.title') }}
          </h1>
          <p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            {{ $t('person.description') }}
          </p>
          <div class="w-full">
            <UInput v-model="searchQuery" :placeholder="$t('person.search')" icon="i-tabler-search"
              :ui="{ trailing: 'pe-1' }" class="w-full sm:min-w-[300px] sm:w-auto">

              <template v-if="searchQuery?.length" #trailing>
                <UButton color="neutral" variant="link" size="sm" icon="tabler:circle-x"
                  :aria-label="$t('person.clearSearch')" @click="searchQuery = ''" />
              </template>
            </UInput>
          </div>
        </div>
      </div>
    </div>

    <!-- Person Grid -->
    <div class="max-w-7xl mx-auto py-6">
      <!-- Filter Section -->
      <div class="mb-8">
        <div class="flex flex-wrap gap-4 items-center justify-between">
          <div class="flex flex-wrap gap-2">
            <UButton v-for="category in categories" :key="category"
              :color="selectedCategory === category ? 'primary' : 'neutral'" variant="soft"
              @click="filterByCategory(category)">
              {{ category == 'all' ? $t('person.category.all') : category }}
            </UButton>
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
            <div class="aspect-w-16 aspect-h-9 bg-neutral-200 dark:bg-neutral-700">
              <img v-if="person.cover" :src="person.cover" :alt="person.title"
                class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy" />
              <div v-else class="w-full h-48 flex items-center justify-center">
                <UIcon name="i-tabler-user-circle" class="text-6xl text-gray-400" />
              </div>
            </div>

            <!-- Content -->
            <div class="p-6">
              <div class="flex items-center justify-between gap-2 mb-2">
                <UBadge size="md" class="rounded-full truncate">
                  {{ person.category }}
                </UBadge>
                <div class="text-sm text-gray-500 whitespace-nowrap">
                  {{ person.birth?.year || '?' }} - {{ person.death?.year || '?' }}
                </div>
              </div>

              <h3
                class="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {{ person.title }}
              </h3>

              <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                {{ person.description }}
                <UButton :to="personDetailRoute(person)" variant="link" color="neutral" class="p-0 align-middle"
                  trailing-icon="tabler:arrow-right" size="xs">
                </UButton>
              </p>

              <!-- Tags -->
              <div v-if="person.tags && person.tags.length > 0"
                class="flex flex-wrap content-center items-center gap-1">
                <UBadge v-for="tag in person.tags.slice(0, 5)" :key="tag" :label="tag" size="sm" color="neutral"
                  variant="subtle" />
                <span v-if="person.tags.length > 5" class="text-xs text-gray-500">
                  +{{ person.tags.length - 5 }} {{ $t('common.more') }}
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

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>