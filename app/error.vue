<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const router = useRouter()
const { t, locale } = useI18n()

const statusCode = computed(() => props.error?.statusCode || 500)
const is404 = computed(() => statusCode.value === 404)
const title = computed(() => (is404.value ? t('errorPage.title404') : t('errorPage.titleGeneric')))
const description = computed(() => (is404.value ? t('errorPage.desc404') : t('errorPage.descGeneric')))
const icon = computed(() => (is404.value ? 'tabler:map-pin' : 'tabler:alert-triangle'))
// Nuxt UI color tokens: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
const tone = computed(() => (is404.value ? 'warning' : 'error'))

const goHome = () => clearError({ redirect: '/' })
const goBack = () => router.back()
const retry = () => window.location.reload()

// E-posta adresini botlardan korumak için şifrelenmiş versiyon
// Base64 + ters çevirme kombinasyonu
// Avoid SSR/CSR hydration mismatch by generating link only on client
const emailLink = ref<string>("#")

useHead(() => ({
  title: `${statusCode.value} · ${title.value}`,
}))

// Avoid SSR/CSR hydration mismatch by rendering timestamp only on client
const now = ref<string>("")
onMounted(() => {
  try {
    now.value = new Date().toLocaleString(locale.value)
  } catch {
    now.value = new Date().toLocaleString()
  }
  
  // E-posta linkini client-side'da oluştur
  // "eyup@ebedieyupsultanlilar.com" şifrelenmiş hali
  const encoded = 'bW9jLnJhbGlsbmF0bHVzcHV5ZWlkZWJlQHB1eWU='
  const decoded = atob(encoded).split('').reverse().join('')
  const subject = encodeURIComponent(t('errorPage.emailSubjectPrefix') + statusCode.value)
  emailLink.value = `mailto:${decoded}?subject=${subject}`
})
</script>

<template>
  <div class="min-h-dvh bg-gradient-to-b from-white to-gray-200 dark:from-gray-900 dark:to-gray-950">
    <UContainer class="w-full max-w-xl mx-auto">
      <div class="mx-auto max-w-3xl flex flex-col items-center justify-center gap-6 py-12">
        <UIFuzzyText :text="statusCode.toString()" font-size="9rem" color="warning" />
        <UCard class="shadow-lg">
          <template #header>
            <div class="flex items-start gap-4">
              <div class="flex flex-col items-center gap-2">
                <div
                  class="flex size-12 shrink-0 items-center justify-center rounded-xl border border-slate-200/70 bg-white dark:border-slate-800/60 dark:bg-slate-900">
                  <UIcon :name="icon"
                    :class="['size-6', is404 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400']" />
                </div>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-3">
                  <UBadge :color="tone" variant="soft" size="md">{{ statusCode }}</UBadge>
                  <h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white mb-0">
                    {{ title }}!
                  </h1>
                </div>
                <p class="text-slate-600 dark:text-slate-300 mb-0">{{ description }}</p>
              </div>
            </div>
          </template>

          <div class="space-y-6">
            <UAlert v-if="props.error?.message || props.error?.statusMessage" :color="tone" variant="soft"
              :icon="is404 ? 'tabler:info-circle' : 'tabler:bug'" :title="t('errorPage.techTitle')"
              :description="props.error?.statusMessage || props.error?.message" />

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <UButton color="primary" size="lg" icon="tabler:home" @click="goHome">
                {{ t('errorPage.goHome') }}
              </UButton>

              <div class="flex gap-3">
                <UButton color="neutral" size="lg" variant="soft" icon="tabler:arrow-back-up" class="flex-1"
                  @click="goBack">
                  {{ t('errorPage.goBack') }}
                </UButton>
                <UButton :color="tone" size="lg" variant="outline" icon="tabler:refresh" class="flex-1" @click="retry">
                  {{ t('errorPage.retry') }}
                </UButton>
              </div>
            </div>

            <div
              class="flex items-center justify-between rounded-lg border border-dashed border-slate-200/70 px-4 py-3 dark:border-slate-800/60">
              <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <UIcon name="tabler:lifebuoy" class="size-4" />
                {{ t('errorPage.needHelp') }}
              </div>
              <UButton color="neutral" size="sm" variant="ghost" :to="emailLink" icon="tabler:mail">
                {{ t('errorPage.report') }}
              </UButton>
            </div>
          </div>

          <template #footer>
            <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{{ t('errorPage.codeLabel') }} <strong class="font-medium">{{ statusCode }}</strong></span>
              <ClientOnly>
                <span>{{ t('errorPage.timeLabel') }} {{ now }}</span>
              </ClientOnly>
            </div>
          </template>
        </UCard>

        <div class="text-center text-sm text-slate-500 dark:text-slate-400">
          <p>
            {{ t('errorPage.contactNote') }}
          </p>
        </div>
      </div>
    </UContainer>
  </div>
</template>
