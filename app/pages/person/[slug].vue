<script setup lang="ts">
import { withLeadingSlash } from 'ufo'
import type { TabsItem, BreadcrumbItem } from '@nuxt/ui'
import type { Collections } from '@nuxt/content'

const route = useRoute()
const { locale, t, defaultLocale, locales } = useI18n()
const localePath = useLocalePath()

const slug = computed(() => withLeadingSlash(String(route.params.slug)))

definePageMeta({
  i18n: {
    paths: {
      tr: '/kisi/[slug]',
      en: '/person/[slug]',
      fr: '/personne/[slug]',
    }
  }
})

const getPeopleCollectionName = (locale: string = 'tr') => {
  return (`people_${locale}`) as keyof Collections
}

const contentPath = computed(() => {
  return withLeadingSlash(`/person${slug.value}`)
})

// Route'dan locale çıkarıyoruz - prerender sırasında daha güvenilir
const currentLocale = computed(() => {
  const fullPath = route.fullPath || route.path

  for (const loc of locales.value) {
    if (loc.code !== defaultLocale && fullPath.startsWith(`/${loc.code}/`)) {
      return loc.code
    }
  }

  return defaultLocale
})

const { data: person } = await useAsyncData(`person-${currentLocale.value}-${slug.value}`, async () => {
  const content = await queryCollection(getPeopleCollectionName(currentLocale.value)).path(contentPath.value).first();

  if (!content && currentLocale.value !== 'tr') {
    const fallbackContent = await queryCollection(getPeopleCollectionName()).path(contentPath.value).first();
    return fallbackContent;
  }

  return content;
}, {
  watch: [locale],
});

// 404 if person not found
if (!person.value) {
  throw createError({
    statusCode: 404,
    statusMessage: t('person.errors.personNotFound', { slug: slug.value })
  })
}

// SEO meta tags and structured data (must be called after data is ready)
if (person.value) {
  useSeoMeta({
    title: person.value?.title as string,
    description: person.value?.description as string,
    ogTitle: person.value?.title as string,
    ogDescription: person.value?.description as string,
    ogImage: person.value?.cover as string,
    ogType: 'profile',
    articleAuthor: person.value?.title ? [person.value.title as string] : undefined,
    articleSection: person.value?.category as string,
    articleTag: person.value?.tags as string[]
  })

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: person.value?.title as string,
          description: person.value?.description,
          birthDate: person.value?.birth?.year ? `${person.value.birth.year}` : undefined,
          deathDate: person.value?.death?.year ? `${person.value.death.year}` : undefined,
          birthPlace: person.value?.birth?.place,
          deathPlace: person.value?.death?.place,
          image: person.value?.cover,
          jobTitle: person.value?.category,
          keywords: Array.isArray(person.value?.tags) ? person.value.tags.join(', ') : undefined
        })
      }
    ]
  })
}

// Methods
const shareContent = async () => {
  // Sadece tarayıcıda çalışmasını garanti altına al
  if (import.meta.client) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: person.value?.title as string,
          text: person.value?.description as string,
          url: window.location.href
        })
      } catch (err) {
        await navigator.clipboard.writeText(window.location.href)
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }
}

const personTabs = ref<TabsItem[]>([
  {
    label: t('person.bio'),
    icon: 'tabler:user',
    content: "Person bio content goes here."
  },
  {
    label: t('person.timeline'),
    icon: 'tabler:calendar',
    content: "Person timeline content goes here."
  },
  {
    label: t('person.works'),
    icon: 'tabler:book',
    content: "Person works content goes here."
  },
  {
    label: t('person.images'),
    icon: 'tabler:photo',
    content: "Person images content goes here."
  },
  {
    label: t('person.related'),
    icon: 'tabler:users',
    content: "Person related content goes here."
  },
])

const breadcrumbItems = ref<BreadcrumbItem[]>([
  {
    icon: 'i-lucide-house',
    to: localePath('index'),
  },
  {
    label: t('nav.people'),
    icon: 'tabler:users',
    to: localePath('person')
  },
  {
    label: person.value?.title as string,
    icon: 'tabler:user',
    to: localePath({ name: 'person-slug', params: { slug: (person.value?.path?.split('/').pop() || slug.value) } })
  }
])
</script>

<template>
  <div>
    <!-- Breadcrumb -->
    <UBreadcrumb :items="breadcrumbItems" class="mb-2"
      :ui="{ list: 'gap-0', link: 'gap-1', linkLeadingIcon: 'size-3', linkLabel: 'text-xs' }" />

    <!-- Hero -->
    <section class="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 mb-4">
      <div class="aspect-video bg-cover bg-center flex items-center justify-center bg-neutral-200 dark:bg-neutral-700"
        :style="`background-image:url('${person?.cover}')`">
        <UIcon v-if="!person?.cover" name="i-tabler-user-circle" class="text-7xl text-gray-400" />
      </div>
      <div class="p-4">
        <span class="text-sm text-toned">{{ person?.birth?.year }} — {{ person?.death?.year }}</span>
        <h1 class="text-xl font-bold mb-0">
          {{ person?.title }}
        </h1>
        <p class="text-sm text-toned mb-0">
          <strong>{{ person?.category }}</strong> • {{ person?.description }}
        </p>
        <div class="flex gap-2 mt-2 flex-wrap">
          <UBadge v-for="tag in person?.tags" :key="tag" :label="tag" variant="outline" icon="tabler:hash"
            color="neutral" />
        </div>
        <div class="flex gap-2 mt-3">
          <UButton variant="soft" icon="tabler:map" class="flex-1">Mezar Yol Tarifi</UButton>
          <UButton variant="soft" icon="tabler:share" class="flex-1" @click="shareContent">
            {{ $t('common.share') }}
          </UButton>
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
            {{ person?.birth?.year }}{{ person?.birth?.place ? ` • ${person?.birth?.place}` : '' }}
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
          {{ person?.death?.year }}{{ person?.death?.place ? ` • ${person?.death?.place}` : '' }}
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
        <p class="text-xs mb-0">
          <NuxtLink v-for="locale in locales" :key="locale.code" class="inline-block me-2"
            :to="localePath({ name: 'person-slug', params: { slug: (person?.path?.split('/').pop() || slug) } }, locale.code)">
            {{ locale.name }}
          </NuxtLink>
        </p>
      </div>
    </section>

    <!-- Tabs -->
    <!-- <UTabs color="neutral" variant="link" :items="personTabs" class="w-full mb-3" /> -->

    <!-- Bio -->
    <h2 class="text-2xl font-bold mb-4">{{ $t('person.bio') }}</h2>
    <section class="prose prose-invert">
      <ContentRenderer v-if="person" :value="person" />
    </section>

    <!-- ########################################################################################## -->

    <!-- Navigation -->
    <div class="mx-auto py-8">
      <div class="border-t border-gray-200 dark:border-gray-700 pt-8">
        <div class="flex justify-between items-center">
          <UButton :to="localePath('person')" color="neutral" variant="ghost" icon="i-tabler-arrow-left">
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
    <!-- <div v-if="relatedPersons && relatedPersons.length > 0" class="bg-gray-50 dark:bg-gray-900">
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
                <img v-if="(relatedPerson as any).meta?.cover" :src="(relatedPerson as any).meta.cover"
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
    </div> -->
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>