<template>
  <div>
    <!-- Breadcrumb -->
    <UBreadcrumb :items="breadcrumbItems" class="mb-2"
      :ui="{ list: 'gap-0', link: 'gap-1', linkLeadingIcon: 'size-3', linkLabel: 'text-xs' }" />

    <!-- Hero -->
    <section class="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 mb-4">
      <div class="aspect-video bg-cover bg-center"
        style="background-image:url('https://random-image-pepebigotes.vercel.app/api/random-image')"></div>
      <div class="p-4">
        <span class="text-sm text-toned">{{ person?.meta?.birthYear }} — {{ person?.meta?.deathYear }}</span>
        <h1 class="text-xl font-bold mb-0">
          {{ person?.meta?.name }}
        </h1>
        <p class="text-sm text-toned mb-0">
          {{ person?.meta?.category }} • {{ person?.meta?.shortDescription }}
        </p>
        <div class="flex gap-2 mt-2 flex-wrap">
          <UBadge v-for="tag in person?.meta?.tags" :key="tag" :label="tag" variant="outline" icon="tabler:hash"
            color="neutral" />
        </div>
        <div class="flex gap-2 mt-3">
          <UButton variant="soft" icon="tabler:map" class="flex-1">Mezar Yol Tarifi</UButton>
          <UButton variant="soft" icon="tabler:share" class="flex-1" @click="shareContent">Paylaş</UButton>
        </div>
      </div>
    </section>

    <!-- Quick Facts -->
    <section class="grid grid-cols-2 gap-3 mb-4">
      <div class="p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-800/50">
        <div class="flex align-middle content-center">
          <UIcon name="tabler:calendar" class="text-primary me-1" />
          <h3 class="text-sm font-semibold text-green-400 m-0">
            {{ $t('person.born') }}
          </h3>
        </div>
        <div class="flex align-middle content-center">
          <p class="text-xs m-0">
            {{ person?.meta?.birthYear }}{{ person?.meta?.birthPlace ? ` • ${person?.meta?.birthPlace}` : '' }}
          </p>
        </div>
      </div>
      <div class="p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-800/50">
        <div class="flex align-middle content-center">
          <UIcon name="tabler:calendar-x" class="text-primary me-1" />
          <h3 class="text-sm font-semibold text-green-400 m-0">
            {{ $t('person.died') }}
          </h3>
        </div>
        <p class="text-xs m-0">
          {{ person?.meta?.deathYear }}{{ person?.meta?.deathPlace ? ` • ${person?.meta?.deathPlace}` : '' }}
        </p>
      </div>
      <div class="p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-800/50">
        <div class="flex align-middle content-center">
          <UIcon name="tabler:map" class="text-primary me-1" />
          <h3 class="text-sm font-semibold text-green-400 mb-0">Defin Yeri</h3>
        </div>
        <p class="text-xs mb-0">Eyüp Mezarlığı, Ada 12 / Parsel 34</p>
      </div>
      <div class="p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-800/50">
        <div class="flex align-middle content-center">
          <UIcon name="tabler:language" class="text-primary me-1" />
          <h3 class="text-sm font-semibold text-green-400 mb-0">Diller</h3>
        </div>
        <p class="text-xs mb-0">Türkçe, Arapça</p>
      </div>
    </section>

    <!-- Tabs -->
    <UTabs color="neutral" variant="link" :items="personTabs" class="w-full mb-3 hidden" />

    <!-- Bio -->
    <section class="prose prose-invert">
      <ContentRenderer v-if="person" :value="person" />
    </section>

    <!-- ########################################################################################## -->

    <!-- Navigation -->
    <div class="mx-auto py-8">
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
    <div v-if="relatedPersons && relatedPersons.length > 0" class="bg-gray-50 dark:bg-gray-900">
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
import type { TabsItem, BreadcrumbItem } from '@nuxt/ui'
import type { Collections } from '@nuxt/content'

// Get route params
const route = useRoute()
const { locale } = useI18n()
const localePath = useLocalePath()
const slug = route.params.slug as string

// Fetch person data based on current locale
const { data: person } = await useAsyncData(route.path, async () => {
  // Build collection name based on current locale
  const collection = ('people_' + locale.value) as keyof Collections
  const content = await queryCollection(collection).path(route.path).first()

  // Optional: fallback to default locale if content is missing
  if (!content && locale.value !== 'tr') {
    return await queryCollection('people_tr').path(route.path).first()
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

const personTabs = ref<TabsItem[]>([
  {
    label: 'Biyografi',
    icon: 'tabler:user',
    content: '<p>{{ person.value?.bio }}</p>'
  },
  {
    label: 'Kronoloji',
    icon: 'tabler:calendar',
    content: '<p>{{ person.value?.timeline }}</p>'
  },
  {
    label: 'Eserler',
    icon: 'tabler:book',
    content: '<p>{{ person.value?.works }}</p>'
  },
  {
    label: 'Görseller',
    icon: 'tabler:photo',
    content: '<p>{{ person.value?.images }}</p>'
  },
  {
    label: 'İlgili Kişiler',
    icon: 'tabler:users',
    content: '<p>{{ relatedPersons.value }}</p>'
  },
])

const breadcrumbItems = ref<BreadcrumbItem[]>([
  {
    icon: 'i-lucide-house'
  },
  {
    label: $t('nav.people'),
    icon: 'tabler:users',
    to: '/person'
  },
  {
    label: person?.value.meta?.name as string,
    icon: 'tabler:user',
    to: '/person/' + person?.value.path
  }
])
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
