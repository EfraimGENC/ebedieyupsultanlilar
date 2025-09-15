<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

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

const availableLocalesItems = computed<DropdownMenuItem[]>(() => {
  return locales.value.filter(i => i.code !== locale.value).map(locale => ({
    label: locale.name,
    icon: `flag:${locale.code === 'en' ? 'gb' : locale.code}-4x3`,
    onClick: () => setLocale(locale.code)
  }))
})

// Bottom navigation items
const navigationItems = computed(() => [
  {
    to: localePath('index'),
    label: t('nav.home'),
    icon: 'tabler:home'
  },
  {
    to: localePath('person'),
    label: t('nav.people'),
    icon: 'tabler:users-group'
  },
  {
    to: localePath('about'),
    label: t('nav.about'),
    icon: 'tabler:info-circle'
  }
])

// Check if current path matches navigation item
const isActiveNavItem = (navTo: string) => {
  if (navTo === localePath('index')) {
    return route.path === localePath('index')
  }
  return route.path.startsWith(navTo)
}
</script>

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

    <Body
      class="min-h-dvh bg-gradient-to-b from-white to-gray-200 dark:from-gray-900 dark:to-gray-950 dark:text-gray-100 font-sans pb-safe">
      <!-- Topbar -->
      <header class="sticky top-0 z-50 backdrop-blur shadow bg-gray-100/50 dark:bg-gray-900/50 ">
        <div class="flex items-center justify-between max-w-xl mx-auto px-4 py-2">
          <NuxtLink :to="localePath('index')" class="flex items-center gap-2">
            <div class="w-7 h-7 rounded bg-gradient-to-br from-green-400 to-emerald-700"></div>
            <span class="font-semibold text-gray-900 dark:text-white">Ebedi Eyüpsultanlılar</span>
          </NuxtLink>

          <nav class="flex gap-0 text-sm">
            <!-- Language Switcher -->
            <UDropdownMenu arrow :items="availableLocalesItems">
              <UButton variant="ghost" :icon="`flag:${locale === 'en' ? 'gb' : locale}-4x3`" />
            </UDropdownMenu>
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
      <main class="w-full max-w-xl mx-auto p-4 pt-2">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="border-t border-gray-200 dark:border-gray-700 mb-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="text-center">
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              © 2025-{{ currentYear }} Ebedî Eyüpsultanlılar.
              <span class="inline-block">{{ $t('footer.rights') }}</span>
            </p>
          </div>
        </div>
      </footer>

      <!-- Bottom Mobile Navigation -->
      <nav
        class="fixed bottom-0 left-0 right-0 z-51 backdrop-blur-lg bg-gray-100/80 dark:bg-gray-900/80 border-t border-gray-200/50 dark:border-gray-700/50 pb-safe">
        <div class="flex items-center justify-around max-w-xl mx-auto px-4 py-2">
          <UButton v-for="item in navigationItems" :key="item.to" :to="item.to" variant="link"
            :color="isActiveNavItem(item.to) ? 'success' : 'neutral'"
            class="flex flex-col items-center gap-1 py-2 px-3 min-w-0">
            <UIcon :name="item.icon" class="w-5 h-5 flex-shrink-0" />
            <span class="text-xs font-medium truncate">{{ item.label }}</span>
          </UButton>
        </div>
      </nav>
    </Body>

    </Html>
  </div>
</template>
