<script setup lang="ts">
const localePath = useLocalePath()

useSeoMeta({
  title: 'Ebedî Eyüpsultanlılar',
})

useHead({
  titleTemplate: '%s'
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <div class="">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center">
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
            <UButton :to="localePath('person')" variant="outline" color="neutral" size="lg"
              trailing-icon="i-tabler-arrow-right">
              {{ $t('nav.people') }}
            </UButton>
          </div>
        </div>
        <UAlert :title="$t('layouts.warning.title')" :description="$t('layouts.warning.description')"
          icon="tabler:info-triangle" variant="soft" color="warning" class="mt-10" />
      </div>
    </div>
  </div>
</template>