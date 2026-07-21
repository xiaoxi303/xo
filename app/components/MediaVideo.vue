<template>
  <!-- High-performance video component with IntersectionObserver + 250ms debounce -->
  <div ref="containerRef" class="relative overflow-hidden bg-slate-900 w-full h-full" :style="{ borderRadius: 'inherit' }">
    <MediaImage
      v-if="!hasVideo && hasPoster"
      :src="poster"
      :alt="title"
      :title="title"
      :index="index"
      :category="category"
      :description="description"
      class="w-full h-full"
    />

    <DefaultArtPoster
      v-else-if="!hasVideo"
      :title="title || '创意视频'"
      :index="index || '01'"
      :category="category"
      :description="description"
      class="w-full h-full"
    />

    <!-- Poster image shown until video loads -->
    <div
      v-else-if="!isVideoReady && poster"
      class="absolute inset-0 bg-cover bg-center"
      :style="{ backgroundImage: `url(${poster})` }"
    />

    <!-- Play icon overlay -->
    <div
      v-if="hasVideo && showPlayIcon && !isPlaying"
      class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
    >
      <div class="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-white translate-x-0.5">
          <path d="M8 5.14v14l11-7-11-7z"/>
        </svg>
      </div>
    </div>

    <video
      v-if="hasVideo"
      ref="videoRef"
      :src="src"
      :poster="poster"
      preload="none"
      muted
      loop
      playsinline
      class="w-full h-full object-cover"
      :style="{
        transition: 'opacity 0.6s ease',
        opacity: isVideoReady ? 1 : 0
      }"
      @canplay="isVideoReady = true"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  src?: string
  poster?: string
  title?: string
  index?: number | string
  category?: string
  description?: string
  showPlayIcon?: boolean
}>(), {
  src: '',
  poster: '',
  title: '',
  index: '01',
  category: '',
  description: '',
  showPlayIcon: false,
})

const containerRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const isVideoReady = ref(false)
const isPlaying = ref(false)
const hasVideo = computed(() => !!props.src?.trim())
const hasPoster = computed(() => !!props.poster?.trim())
let playTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // 250ms debounce — prevents rapid play/pause on fast scroll
          playTimer = setTimeout(() => {
            if (videoRef.value) {
              videoRef.value.preload = 'auto'
              videoRef.value.play()
                .then(() => { isPlaying.value = true })
                .catch(() => { /* Blocked by browser policy — silently ignore */ })
            }
          }, 250)
        } else {
          // Clear the pending play immediately
          if (playTimer) {
            clearTimeout(playTimer)
            playTimer = null
          }
          if (videoRef.value) {
            videoRef.value.pause()
            isPlaying.value = false
          }
        }
      })
    },
    { threshold: 0.15 } // trigger when 15% visible
  )

  if (containerRef.value) observer.observe(containerRef.value)

  onBeforeUnmount(() => {
    observer.disconnect()
    if (playTimer) clearTimeout(playTimer)
    if (videoRef.value) {
      videoRef.value.pause()
      videoRef.value.src = ''
      videoRef.value.load()
    }
  })
})
</script>
