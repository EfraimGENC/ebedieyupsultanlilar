<script setup lang="ts">

interface Props {
  src: string
}

const props = defineProps<Props>()

const { t } = useI18n()

// Refs
const audioElement = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const isLoaded = ref(false)
const playbackRate = ref(1)

// Computed
const progress = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
})

const formattedCurrentTime = computed(() => {
  return formatTime(currentTime.value)
})

const formattedDuration = computed(() => {
  return formatTime(duration.value)
})

const playbackRates = [
  { value: 1, label: '1x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x' }
]

// Methods
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const togglePlay = () => {
  if (!audioElement.value) return

  if (isPlaying.value) {
    audioElement.value.pause()
  } else {
    audioElement.value.play()
  }
}

const seekTo = (event: Event) => {
  if (!audioElement.value) return

  const target = event.target as HTMLInputElement
  const seekTime = (parseFloat(target.value) / 100) * duration.value
  audioElement.value.currentTime = seekTime
}

const rewind = () => {
  if (!audioElement.value) return
  audioElement.value.currentTime = Math.max(0, audioElement.value.currentTime - 10)
}

const fastForward = () => {
  if (!audioElement.value) return
  audioElement.value.currentTime = Math.min(duration.value, audioElement.value.currentTime + 10)
}

const changePlaybackRate = (rate: number) => {
  if (!audioElement.value) return
  playbackRate.value = rate
  audioElement.value.playbackRate = rate
}

// Event handlers
const onLoadedData = () => {
  if (!audioElement.value) return
  duration.value = audioElement.value.duration || 0
  isLoaded.value = true
}

const onCanPlay = () => {
  if (!audioElement.value) return
  if (!isLoaded.value) {
    duration.value = audioElement.value.duration || 0
    isLoaded.value = true
  }
}

const onTimeUpdate = () => {
  if (!audioElement.value) return
  currentTime.value = audioElement.value.currentTime
}

const onPlay = () => {
  isPlaying.value = true
}

const onPause = () => {
  isPlaying.value = false
}

const onEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
}

const onError = () => {
  console.warn('Audio loading error:', audioElement.value?.error)
  isLoaded.value = false
}

// Lifecycle
onMounted(() => {
  if (audioElement.value) {
    // Multiple events to ensure loading detection
    audioElement.value.addEventListener('loadedmetadata', onLoadedData)
    audioElement.value.addEventListener('loadeddata', onLoadedData)
    audioElement.value.addEventListener('canplay', onCanPlay)
    audioElement.value.addEventListener('canplaythrough', onCanPlay)

    audioElement.value.addEventListener('timeupdate', onTimeUpdate)
    audioElement.value.addEventListener('play', onPlay)
    audioElement.value.addEventListener('pause', onPause)
    audioElement.value.addEventListener('ended', onEnded)
    audioElement.value.addEventListener('error', onError)

    // Force check if already loaded
    nextTick(() => {
      if (audioElement.value && audioElement.value.readyState >= 1) {
        onLoadedData()
      }
    })
  }
})

onUnmounted(() => {
  if (audioElement.value) {
    audioElement.value.removeEventListener('loadedmetadata', onLoadedData)
    audioElement.value.removeEventListener('loadeddata', onLoadedData)
    audioElement.value.removeEventListener('canplay', onCanPlay)
    audioElement.value.removeEventListener('canplaythrough', onCanPlay)

    audioElement.value.removeEventListener('timeupdate', onTimeUpdate)
    audioElement.value.removeEventListener('play', onPlay)
    audioElement.value.removeEventListener('pause', onPause)
    audioElement.value.removeEventListener('ended', onEnded)
    audioElement.value.removeEventListener('error', onError)
  }
})
</script>

<template>
  <div
    class="flex justify-between content-center items-center gap-2 p-3 mb-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-800/50">
    <audio ref="audioElement" :src="props.src" preload="auto" class="hidden" crossorigin="anonymous" />

    <!-- Play/Pause -->
    <UButton :variant="isPlaying ? 'soft' : 'solid'" color="primary" size="lg"
      :icon="isPlaying ? 'tabler:player-pause' : 'tabler:player-play'" @click="togglePlay" :disabled="!isLoaded"
      :loading="!isLoaded" :aria-label="isPlaying ? t('audio.pause') : t('audio.play')" />

    <!-- Progress Bar -->
    <div class="w-full">
      <div class="relative w-full">
        <div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          <div class="h-full bg-green-500 dark:bg-green-500 rounded-lg transition-all duration-100 ease-out"
            :style="{ width: `${progress}%` }"></div>
        </div>
        <input type="range" min="0" max="100" :value="progress" @input="seekTo"
          class="absolute inset-0 w-full h-1 opacity-0 cursor-pointer" :disabled="!isLoaded" />
      </div>
      <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>{{ formattedCurrentTime }}</span>
        <span>{{ formattedDuration }}</span>
      </div>
    </div>

    <!-- Playback Rate -->
    <UButton variant="soft" color="primary" size="sm" :label="`${playbackRate}x`" :disabled="!isLoaded" @click="() => {
      const currentIndex = playbackRates.findIndex(rate => rate.value === playbackRate)
      const nextIndex = (currentIndex + 1) % playbackRates.length
      changePlaybackRate(playbackRates[nextIndex]?.value || 1)
    }" />

  </div>
</template>

<style scoped>
/* Custom slider styling */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: rgb(34, 197, 94);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: rgb(34, 197, 94);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-webkit-slider-track {
  background: rgb(34, 197, 94);
  height: 4px;
  border-radius: 2px;
}

.slider::-moz-range-track {
  background: rgb(34, 197, 94);
  height: 4px;
  border-radius: 2px;
  border: none;
}

.dark .slider::-webkit-slider-track {
  background: rgb(34, 197, 94);
}

.dark .slider::-moz-range-track {
  background: rgb(34, 197, 94);
}
</style>