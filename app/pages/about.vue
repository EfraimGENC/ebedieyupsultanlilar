<template>
  <div>
    <h1>{{ $t('about.title') }}</h1>
    <p>Müzeyyen bir çeşme kıldı, du‘âsı müstecâb olsun.<br>
      Delîlin Hazret-i Allah, şefî‘in Mustafa olsun.<br>
      Bir içen bir dahî içe, içenlere şifâ olsun.<br>
      Re’îs Ahmed GENÇ’den, Eyüpsultân’a hediyye olsun.</p>
    <p class="m-0">— Ahmet GENÇ</p>
    <span class="text-dimmed font-light">{{ $t('about.authorSubtitle') }}</span>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  i18n: {
    paths: {
      tr: '/hakkinda',
      en: '/about',
      fr: '/a-propos',
    }
  }
})
</script>

<style></style>