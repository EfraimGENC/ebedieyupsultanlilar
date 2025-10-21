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
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

      <!-- Hero Content -->
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

      <!-- Under construction warning -->
      <UAlert :title="$t('layouts.warning.title')" :description="$t('layouts.warning.description')"
        icon="tabler:info-triangle" variant="soft" color="warning" class="mt-10" />

    </div>

    <!-- Ebu Eyyûb el-Ensârî Hazretleri -->
    <div
      class="p-2 rounded-2xl bg-gray-50/20 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 flex flex-cols gap-2">
      <div>
        <img src="/about/ebedi-eyupsultanlilar-cesmesi.jpg" alt="Ebedi Eyüpsultanlılar Çeşmesi"
          class="rounded-xl max-h-48 max-w-48" />
      </div>
      <div class="flex flex-col justify-between pt-1">
        <div class="">
          <p class="text-muted text-sm leading-4 mb-1">Bu beldenin asıl sahibi, Allah Resûlü’nün mihmandarı</p>
          <h4 class="m-0">Ebu Eyyûb el-Ensârî</h4>
          <p class="leading-5 mb- line-clamp-4">Hicret'ten sonra Hz. Muhammed'i Medine'deki evinde misafir eden ve
            İstanbul'un fethinde manevi bir rol oynayan sahabe.</p>
        </div>
        <div class="flex justify-end">
          <UButton :to="localePath({ name: 'person-slug', params: { slug: 'ebu-eyyub-el-ensari' } })" variant="subtle"
            color="neutral" size="sm" trailing-icon="i-tabler-arrow-right">
            {{ $t('person.readMore') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>