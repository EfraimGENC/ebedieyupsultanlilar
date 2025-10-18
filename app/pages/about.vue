<template>
  <div>
    <h1>{{ $t('about.title') }}</h1>
    <p>Müzeyyen bir çeşme kıldı, du‘âsı müstecâb olsun.<br>
      Delîlin Hazret-i Allah, şefî‘in Mustafa olsun.<br>
      Bir içen bir dahî içe, içenlere şifâ olsun.<br>
      Re’îs Ahmed GENÇ’den, Eyüpsultân’a hediyye olsun.</p>
    <p class="m-0">— Hafız Efraim GENÇ</p>
    <span class="text-dimmed font-light">Ahmet GENÇ'in Babası</span>

    <!-- Contact Alert -->
    <UAlert class="mt-8" icon="i-tabler-mail" color="primary" variant="soft" :title="$t('about.contact.title')"
      :description="$t('about.contact.description')">
      <template #actions>
        <UButton color="primary" variant="soft" @click="openEmail" icon="i-tabler-send">
          {{ $t('about.contact.button') }}
        </UButton>
      </template>
    </UAlert>

    <!-- Navigation -->
    <div class="mx-auto py-8">
      <div class="border-t border-gray-200 dark:border-gray-700 pt-8">
        <div class="flex justify-between items-center">
          <UButton :to="localePath('index')" color="neutral" variant="ghost" icon="i-tabler-arrow-left">
            {{ $t('nav.home') }}
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
  </div>
</template>

<script setup lang="ts">
const localePath = useLocalePath()

definePageMeta({
  i18n: {
    paths: {
      tr: '/hakkinda',
      en: '/about',
      fr: '/a-propos',
    }
  }
})

useSeoMeta({
  title: () => $t('about.title'),
  description: () => $t('nuxtSiteConfig.description'),
  ogTitle: () => $t('about.title'),
  ogDescription: () => $t('nuxtSiteConfig.description'),
  ogType: 'website',
})

// E-posta adresini botlardan korumak için şifrelenmiş versiyon
// Base64 + ters çevirme kombinasyonu
const openEmail = () => {
  if (import.meta.client) {
    // "info@ebedieyupsultanlilar.com" şifrelenmiş hali
    const encoded = 'bW9jLnJhbGluc3VzcHV5ZWlkZWJlQG9mbmk='
    const decoded = atob(encoded).split('').reverse().join('')
    window.location.href = `mailto:${decoded}`
  }
}

const shareContent = async () => {
  // Sadece tarayıcıda çalışmasını garanti altına al
  if (import.meta.client) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: $t('about.title') as string,
          text: $t('nuxtSiteConfig.description') as string,
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
</script>

<style></style>