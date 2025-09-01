<script setup lang="ts">
import { withLeadingSlash } from 'ufo'
import type { Collections } from '@nuxt/content'

const { locale } = useI18n()
const localePath = useLocalePath()

// Fetch home page content based on current locale
const { data: home } = await useAsyncData('home', async () => {
  const collection = ('people_' + locale.value) as keyof Collections
  const content = await queryCollection(collection).path('/index').first()
  
  // Fallback to default locale if content is missing
  if (!content && locale.value !== 'tr') {
    return await queryCollection('people_tr').path('/index').first()
  }
  
  return content
}, {
  watch: [locale], // Refetch when locale changes
})

useSeoMeta({
  title: (home.value as any)?.title || 'Ebedî Eyüpsultanlılar',
  description: (home.value as any)?.description || 'Tarihe iz bırakmış önemli kişileri keşfedin'
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center">
          <h1 class="text-4xl font-bold sm:text-5xl md:text-6xl">
            {{ $t('layouts.title') }}
          </h1>
          <p class="mt-3 max-w-md mx-auto text-base text-primary-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            {{ $t('person.description') }}
          </p>
          <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <UButton :to="localePath('/person')" variant="outline" color="neutral" size="lg"
              trailing-icon="i-tabler-arrow-right">
              {{ $t('nav.people') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Renderer for additional content -->
    <div v-if="home" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="prose prose-lg dark:prose-invert max-w-none">
        <ContentRenderer :value="home" />
      </div>
    </div>
  </div>
</template>
