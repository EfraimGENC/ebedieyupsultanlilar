<template>
  <div>
    <Html :lang="head.htmlAttrs.lang" :dir="head.htmlAttrs.dir">

    <Head>
      <Title>{{ title }}</Title>
      <template v-for="link in head.link" :key="link.key">
        <Link :id="link.key" :rel="link.rel" :href="link.href" :hreflang="link.hreflang" />
      </template>
      <template v-for="meta in head.meta" :key="meta.key">
        <Meta :id="meta.key" :property="meta.property" :content="meta.content" />
      </template>
    </Head>

    <Body class="bg-white dark:bg-gray-900 dark:text-gray-100 font-sans">
      <!-- Topbar -->
      <header class="sticky top-0 z-50 backdrop-blur shadow bg-gray-100/50 dark:bg-gray-900/50 ">
        <div class="flex items-center justify-between max-w-xl mx-auto px-4 py-3">
          <NuxtLink :to="localePath('/')" class="flex items-center gap-2">
            <div class="w-7 h-7 rounded bg-gradient-to-br from-green-400 to-emerald-700"></div>
            <span class="font-semibold text-gray-900 dark:text-white">Ebedi Eyüpsultanlılar</span>
          </NuxtLink>

          <nav class="flex gap-0 text-sm">
            <!-- Language Switcher -->
            <UButton v-for="locale in availableLocales" :key="locale.code" @click.prevent.stop="setLocale(locale.code)"
              :icon="`flag:${locale.code === 'en' ? 'gb' : locale.code}-4x3`" variant="ghost" />
            <!-- Theme Toggle -->
            <ClientOnly>
              <UButton :icon="isDark ? 'i-tabler-sun' : 'i-tabler-moon'" color="neutral" variant="ghost"
                aria-label="Theme" @click="toggleDark()" />
              <template #fallback>
                <UButton icon="i-tabler-moon" color="neutral" variant="ghost" aria-label="Theme" disabled />
              </template>
            </ClientOnly>
          </nav>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-xl mx-auto p-4">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="border-t border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="text-center">
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              © 2025-{{ currentYear }} Ebedî Eyüpsultanlılar.
              <span class="inline-block">{{ $t('footer.rights') }}</span>
            </p>
          </div>
        </div>
      </footer>
    </Body>

    </Html>
  </div>
</template>

<script setup lang="ts">

const route = useRoute()
const localePath = useLocalePath()
const head = useLocaleHead()

const { t, locale, locales, setLocale } = useI18n()

const availableLocales = computed(() => {
  return locales.value.filter(i => i.code !== locale.value)
})

// Current year for footer
const currentYear = ref(2025)
onMounted(() => {
  currentYear.value = new Date().getFullYear()
})

// Theme
const colorMode = useColorMode()
const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})

const toggleDark = () => {
  isDark.value = !isDark.value
}

// Page title
const title = computed(() => {
  return t('layouts.title')
})
</script>
