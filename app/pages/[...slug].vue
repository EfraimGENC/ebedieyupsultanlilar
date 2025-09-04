<script setup lang="ts">
import { withLeadingSlash } from 'ufo'
import type { Collections } from '@nuxt/content'

const route = useRoute()
const { locale } = useI18n()
const slug = computed(() => withLeadingSlash(String(route.params.slug)))

const { data: page } = await useAsyncData('page-' + slug.value, async () => {
  // Build collection name based on current locale
  const collection = ('people_' + locale.value) as keyof Collections
  const content = await queryCollection(collection).path(slug.value).first()

  // Optional: fallback to default locale if content is missing
  if (!content && locale.value !== 'tr') {
    return await queryCollection('people_tr').path(slug.value).first()
  }

  return content
}, {
  watch: [locale], // Refetch when locale changes
})

// SEO
useSeoMeta({
  title: (page.value as any)?.title || 'Ebedî Eyüpsultanlılar',
  description: (page.value as any)?.description || (page.value as any)?.shortDescription || 'Tarihe iz bırakmış önemli kişileri keşfedin'
})
</script>

<template>
  <div>
    <ContentRenderer v-if="page" :value="page" />
    <div v-else>
      <div class="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
        <UIcon name="i-tabler-file-x" class="text-6xl text-gray-400 mb-4" />
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Page not found</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">This page doesn't exist in {{ locale }} language.</p>
        <div class="mt-6">
          <UButton :to="$localePath('/')" color="primary">
            {{ $t('welcome') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
