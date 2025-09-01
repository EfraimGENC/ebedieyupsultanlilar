<template>
  <div>
    <!-- Hero Section -->
    <div class="bg-gray-50 dark:bg-gray-900 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
      <div v-if="1 > 0" class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="person in people" :key="person._path" class="group cursor-pointer"
          @click="navigateToPersonDetail(person)">
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <!-- Image -->
            <div class="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
              <NuxtImg v-if="person.image" :src="person.image" :alt="person.name"
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
                  {{ person.category }}
                </span>
                <div v-if="person.birthYear && person.deathYear" class="text-sm text-gray-500">
                  {{ person.birthYear }} - {{ person.deathYear }}
                </div>
              </div>

              <h3
                class="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {{ person.name }}
              </h3>

              <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                {{ person.shortDescription }}
              </p>

              <!-- Tags -->
              <div v-if="person.tags && person.tags.length > 0" class="flex flex-wrap gap-1">
                <span v-for="tag in person.tags.slice(0, 3)" :key="tag"
                  class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  {{ tag }}
                </span>
                <span v-if="person.tags.length > 3" class="text-xs text-gray-500">
                  +{{ person.tags.length - 3 }} {{ $t('common.more') }}
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

<script setup>
import { computed, ref } from 'vue'

const route = useRoute()


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

// Fetch persons data
const { data: people } = await useAsyncData(route.path, () => queryCollection('person').all())

// Computed
const categories = computed(() => {
  const cats = ['all', ...new Set(people.value?.map(person => person.category) || [])]
  return cats
})

const filteredPeople = computed(() => {
  if (!people.value) return []

  let filtered = people.value

  // Filter by category
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(person => person.category === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(person =>
      person.name.toLowerCase().includes(query) ||
      person.shortDescription.toLowerCase().includes(query) ||
      person.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }

  return filtered
})

// Methods
const filterByCategory = (category) => {
  selectedCategory.value = category
}

const navigateToPersonDetail = (person) => {
  navigateTo(localePath(person.path))
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
