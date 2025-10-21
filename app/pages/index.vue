<script setup lang="ts">
import type { Collections } from '@nuxt/content'

const route = useRoute()
const { locale, t, defaultLocale, locales } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: 'Ebedî Eyüpsultanlılar',
})

useHead({
  titleTemplate: '%s'
})

const personDetailRoute = (person: any) => {
  const slug = person.path.split('/').pop()
  return localePath({ name: 'person-slug', params: { slug } })
}

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

const slug = "ebu-eyyub-el-ensari"
const contentPath = `/person/${slug}`

const { data: ebuEyyubElEnsari } = await useAsyncData(`person-${currentLocale.value}-${slug}`, async () => {

  const getPeopleCollectionName = (locale: string = 'tr') => {
    return (`people_${locale}`) as keyof Collections
  }

  const content = await queryCollection(getPeopleCollectionName(currentLocale.value)).path(contentPath).first();

  if (!content && currentLocale.value !== 'tr') {
    const fallbackContent = await queryCollection(getPeopleCollectionName()).path(contentPath).first();
    return fallbackContent;
  }

  return content;
}, {
  watch: [locale],
});
</script>

<template>
  <div>
    <!-- Hero Section -->
    <div class="py-24">

      <!-- Hero Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl font-bold sm:text-5xl md:text-6xl">
          {{ $t('layouts.title') }}
        </h1>
        <p class="mt-3 max-w-md mx-auto text-base sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          {{ $t('nuxtSiteConfig.description') }}
        </p>
        <div class="mt-8 flex gap-2 justify-center">
          <UButton :to="localePath('about')" variant="outline" color="neutral" size="lg" icon="tabler:info-circle">
            {{ $t('about.title') }}
          </UButton>
          <UButton :to="localePath('person')" variant="solid" color="primary" size="lg"
            trailing-icon="i-tabler-arrow-right">
            {{ $t('nav.people') }}
          </UButton>
        </div>
      </div>

      <!-- Ebu Eyyûb el-Ensârî Hazretleri -->
      <div
        class="my-16 p-2 rounded-2xl bg-gray-50/20 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 flex flex-cols gap-3">
        <div>
          <img :src="ebuEyyubElEnsari?.cover" alt="Ebedi Eyüpsultanlılar Çeşmesi"
            class="rounded-xl max-h-48 max-w-48" />
        </div>
        <div class="flex flex-col justify-between pt-1">
          <div class="">
            <p class="text-muted text-sm leading-4 mb-1">{{ $t('about.ebuEyyubElEnsariDefinition') }}</p>
            <h4 class="m-0">{{ ebuEyyubElEnsari?.title }}</h4>
            <p class="leading-5 mb-0 line-clamp-3 md:line-clamp-4">{{ ebuEyyubElEnsari?.description }}</p>
          </div>
          <div class="flex justify-end">
            <UButton :to="personDetailRoute(ebuEyyubElEnsari)" variant="subtle" color="neutral" size="sm"
              trailing-icon="i-tabler-arrow-right">
              {{ $t('person.readMore') }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Under construction warning -->
      <UAlert :title="$t('layouts.warning.title')" :description="$t('layouts.warning.description')"
        icon="tabler:info-triangle" variant="soft" color="warning" />

    </div>

  </div>
</template>