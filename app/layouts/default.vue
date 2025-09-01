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

      <Body>
        <!-- Navigation -->
        <header class="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
              <!-- Logo -->
              <div class="flex-shrink-0">
                <NuxtLink :to="localePath('/')" class="text-xl font-bold text-gray-900 dark:text-white">
                  Ebedî Eyüpsultanlılar
                </NuxtLink>
              </div>

              <!-- Navigation Links -->
              <nav class="hidden md:flex space-x-8">
                <NuxtLink 
                  :to="localePath('/')" 
                  class="text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium transition-colors"
                  exact-active-class="text-primary-600 dark:text-primary-400"
                >
                  {{ $t('nav.home') }}
                </NuxtLink>
                <NuxtLink 
                  :to="localePath('/person')" 
                  class="text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium transition-colors"
                  active-class="text-primary-600 dark:text-primary-400"
                >
                  {{ $t('nav.people') }}
                </NuxtLink>
              </nav>

              <!-- Theme Toggle & Mobile Menu -->
              <div class="flex items-center space-x-4">
                <!-- Theme Toggle -->
                <UButton
                  :icon="isDark ? 'i-tabler-sun' : 'i-tabler-moon'"
                  color="neutral"
                  variant="ghost"
                  aria-label="Theme"
                  @click="toggleDark()"
                />

                <!-- Mobile menu button -->
                <UButton
                  :icon="mobileMenuOpen ? 'i-tabler-x' : 'i-tabler-menu-2'"
                  color="neutral"
                  variant="ghost"
                  class="md:hidden"
                  aria-label="Toggle menu"
                  @click="mobileMenuOpen = !mobileMenuOpen"
                />
              </div>
            </div>

            <!-- Mobile Navigation -->
            <div v-if="mobileMenuOpen" class="md:hidden">
              <div class="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200 dark:border-gray-700">
                <NuxtLink 
                  :to="localePath('/')" 
                  class="block px-3 py-2 text-base font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  exact-active-class="text-primary-600 dark:text-primary-400"
                  @click="mobileMenuOpen = false"
                >
                  {{ $t('nav.home') }}
                </NuxtLink>
                <NuxtLink 
                  :to="localePath('/person')" 
                  class="block px-3 py-2 text-base font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  active-class="text-primary-600 dark:text-primary-400"
                  @click="mobileMenuOpen = false"
                >
                  {{ $t('nav.people') }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main>
          <slot />
        </main>

        <!-- Footer -->
        <footer class="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="text-center">
              <p class="text-gray-600 dark:text-gray-400 text-sm">
                © 2025 Ebedî Eyüpsultanlılar. {{ $t('footer.rights') }}
              </p>
            </div>
          </div>
        </footer>
      </Body>
    </Html>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const head = useLocaleHead()

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

// Mobile menu
const mobileMenuOpen = ref(false)

// Page title
const title = computed(() => {
  return t('layouts.title')
})
</script>
