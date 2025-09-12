<template>
  <div>
    <h1>{{ $t('about.title') }}</h1>
    <p>Müzeyyen bir çeşme kıldı, du‘âsı müstecâb olsun.<br>
      Delîlin Hazret-i Allah, şefî‘in Mustafa olsun.<br>
      Bir içen bir dahî içe, içenlere şifâ olsun.<br>
      Re’îs Ahmed GENÇ’den, Eyüpsultân’a hediyye olsun.</p>
    <p class="m-0">— Ahmet GENÇ</p>
    <span class="text-dimmed font-light">{{ $t('about.authorSubtitle') }}</span>

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

useSeoMeta({
  title: () => $t('about.title'),
  description: () => $t('nuxtSiteConfig.description'),
  ogTitle: () => $t('about.title'),
  ogDescription: () => $t('nuxtSiteConfig.description'),
  ogType: 'website',
})

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