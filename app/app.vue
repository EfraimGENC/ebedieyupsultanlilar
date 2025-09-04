<script setup lang="ts">
const tooltipProviderProps = {
  delayDuration: 0,
}

const toasterProps = {
  position: 'top-right' as const,
}
</script>

<template>
  <div>
    <UApp :tooltip="tooltipProviderProps" :toaster="toasterProps">
      <NuxtLoadingIndicator />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UApp>
  </div>
</template>
