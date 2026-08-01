<template>
  <!-- Premium Video Player with Full Controls -->
  <div 
    ref="containerRef" 
    class="video-player relative overflow-hidden w-full h-full group select-none"
    :style="{ borderRadius: 'inherit' }"
    @mouseenter="showControls = true"
    @mouseleave="showControls = false"
  >
    <!-- Fallback: Image or Art Poster -->
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

    <!-- Poster overlay shown until video loads -->
    <div
      v-if="hasVideo && !isVideoReady && poster"
      class="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
      :style="{ backgroundImage: `url(${poster})`, opacity: isVideoReady ? 0 : 1 }"
    />

    <!-- Loading spinner -->
    <div
      v-if="hasVideo && isLoading"
      class="absolute inset-0 flex items-center justify-center z-20"
    >
      <div class="video-spinner"></div>
    </div>

    <!-- Central play button (shown when not playing) -->
    <div
      v-if="hasVideo && !isPlaying && !minimal"
      class="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
      @click="togglePlay"
    >
      <div class="video-play-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
          <path d="M8 5.14v14l11-7-11-7z"/>
        </svg>
      </div>
    </div>

    <!-- 1. Visible Site Logo Watermark (Only Logo, Semi-Transparent, Larger Size) -->
    <div
      v-if="hasVideo && logoWatermarkEnabled"
      class="absolute top-3 left-3 z-30 pointer-events-none flex items-center justify-center p-2 rounded-2xl bg-black/35 backdrop-blur-md border border-white/15 select-none shadow-md opacity-85 transition-all duration-300"
    >
      <img
        v-if="siteLogo"
        :src="siteLogo"
        alt="Logo"
        class="object-contain"
        style="width: 28px; height: 28px;"
      />
      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" class="text-white/90" style="width: 28px; height: 28px; flex-shrink: 0;">
        <path d="M10 30L30 10M10 10L30 30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        <circle cx="20" cy="20" r="8" stroke="currentColor" stroke-width="2.2" />
      </svg>
    </div>

    <!-- 2. Invisible Steganographic Watermark Layer (Canvas Overlay over Video Frame) -->
    <canvas
      v-if="hasVideo && invisibleWatermarkEnabled"
      ref="watermarkCanvasRef"
      class="absolute inset-0 w-full h-full pointer-events-none z-20 select-none opacity-80"
    />

    <!-- Video element -->
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
      @canplay="onCanPlay"
      @waiting="isLoading = true"
      @playing="isLoading = false"
      @timeupdate="onTimeUpdate"
      @ended="isPlaying = false"
    />

    <!-- Video info overlay (top) -->
    <div
      v-if="hasVideo && title && showControls && !minimal"
      class="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-300 z-10"
      :class="{ 'opacity-0': isPlaying && !showControls, 'opacity-100': showControls }"
    >
      <div class="flex items-center gap-2">
        <span v-if="index" class="video-badge">{{ index }}</span>
        <span v-if="category" class="video-badge video-badge-accent">{{ category }}</span>
      </div>
      <h3 class="text-white text-sm font-semibold mt-2 font-sans">{{ title }}</h3>
      <p v-if="description" class="text-white/70 text-xs mt-1 font-sans line-clamp-2">{{ description }}</p>
    </div>

    <!-- Controls bar (bottom) -->
    <div
      v-if="hasVideo && !minimal"
      class="absolute bottom-0 left-0 right-0 transition-all duration-300 z-40"
      :class="{ 
        'translate-y-full opacity-0': isPlaying && !showControls,
        'translate-y-0 opacity-100': showControls || !isPlaying
      }"
    >
      <!-- Progress bar -->
      <div 
        class="video-progress-container"
        @click="onProgressClick"
        @mousemove="onProgressHover"
        @mouseleave="hoverTime = null"
      >
        <div class="video-progress-bar">
          <div 
            class="video-progress-filled"
            :style="{ width: progressPercent + '%' }"
          />
          <div 
            v-if="hoverTime !== null"
            class="video-progress-hover"
            :style="{ width: hoverPercent + '%' }"
          />
        </div>
        <!-- Hover time tooltip -->
        <div 
          v-if="hoverTime !== null"
          class="video-time-tooltip"
          :style="{ left: hoverPercent + '%' }"
        >
          {{ formatTime(hoverTime) }}
        </div>
      </div>

      <!-- Control buttons -->
      <div class="video-controls-bar">
        <div class="flex items-center gap-3">
          <!-- Play/Pause button -->
          <button 
            class="video-control-btn"
            @click="togglePlay"
            :aria-label="isPlaying ? '暂停' : '播放'"
          >
            <svg v-if="isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
              <path d="M8 5.14v14l11-7-11-7z"/>
            </svg>
          </button>

          <!-- Volume button -->
          <button 
            class="video-control-btn"
            @click="toggleMute"
            :aria-label="isMuted ? '取消静音' : '静音'"
          >
            <svg v-if="isMuted" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          </button>

          <!-- Time display -->
          <span class="video-time-display">
            {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
          </span>
        </div>

        <div class="flex items-center gap-3">
          <!-- Fullscreen button -->
          <button 
            class="video-control-btn"
            @click="toggleFullscreen"
            :aria-label="isFullscreen ? '退出全屏' : '全屏'"
          >
            <svg v-if="isFullscreen" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
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
  minimal?: boolean
}>(), {
  src: '',
  poster: '',
  title: '',
  index: '01',
  category: '',
  description: '',
  showPlayIcon: false,
  minimal: false,
})

const containerRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const watermarkCanvasRef = ref<HTMLCanvasElement | null>(null)

const isVideoReady = ref(false)
const isPlaying = ref(false)
const isLoading = ref(false)
const isMuted = ref(true)
const isFullscreen = ref(false)
const showControls = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const hoverTime = ref<number | null>(null)
const hoverPercent = ref(0)

const hasVideo = computed(() => !!props.src?.trim())
const hasPoster = computed(() => !!props.poster?.trim())
let playTimer: ReturnType<typeof setTimeout> | null = null

// Site config & Watermark computations
const { data: siteConfigData } = useFetch('/api/site-config', { lazy: true })
const siteConfig = useState<any>('site-config', () => siteConfigData.value || {})

const logoWatermarkEnabled = computed(() => siteConfig.value?.watermark?.logoEnabled ?? true)
const invisibleWatermarkEnabled = computed(() => siteConfig.value?.watermark?.invisibleEnabled ?? true)

const siteLogo = computed(() => siteConfig.value?.siteInfo?.avatar || '/logo.png')
const siteBrandName = computed(() => siteConfig.value?.siteInfo?.brandName || 'Xo')

const invisibleText = computed(() => siteConfig.value?.watermark?.invisibleText || '© Xo Studio 2026')
const invisibleOpacity = computed(() => (siteConfig.value?.watermark?.invisibleOpacity ?? 3) / 100)

const drawInvisibleWatermark = () => {
  if (!watermarkCanvasRef.value || !containerRef.value) return
  const canvas = watermarkCanvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const rect = containerRef.value.getBoundingClientRect()
  canvas.width = rect.width || 600
  canvas.height = rect.height || 400

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.save()

  ctx.rotate((-20 * Math.PI) / 180)
  ctx.font = 'bold 13px sans-serif'
  const text = invisibleText.value
  const textWidth = ctx.measureText(text).width + 85
  const textHeight = 65

  // Pass 1: Primary Alpha LSB Layer
  ctx.fillStyle = `rgba(255, 255, 255, ${invisibleOpacity.value})`
  for (let x = -canvas.width; x < canvas.width * 2; x += textWidth) {
    for (let y = -canvas.height; y < canvas.height * 2; y += textHeight) {
      ctx.fillText(text, x, y)
    }
  }

  // Pass 2: High-Frequency Boundary Outline Layer (for robust spatial derivative decoding)
  ctx.strokeStyle = `rgba(251, 191, 36, ${Math.max(0.015, invisibleOpacity.value * 0.7)})`
  ctx.lineWidth = 1
  for (let x = -canvas.width; x < canvas.width * 2; x += textWidth) {
    for (let y = -canvas.height; y < canvas.height * 2; y += textHeight) {
      ctx.strokeText(text, x, y)
    }
  }

  ctx.restore()
}

watch([invisibleText, invisibleOpacity], () => {
  drawInvisibleWatermark()
})

const progressPercent = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds === 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function onCanPlay() {
  isVideoReady.value = true
  isLoading.value = false
  if (videoRef.value) {
    duration.value = videoRef.value.duration
  }
}

function onTimeUpdate() {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
  }
}

function togglePlay() {
  if (!videoRef.value) return
  if (isPlaying.value) {
    videoRef.value.pause()
    isPlaying.value = false
  } else {
    videoRef.value.play()
      .then(() => { isPlaying.value = true })
      .catch(() => {})
  }
}

function toggleMute() {
  if (!videoRef.value) return
  videoRef.value.muted = !videoRef.value.muted
  isMuted.value = videoRef.value.muted
}

function toggleFullscreen() {
  if (!containerRef.value) return
  if (!document.fullscreenElement) {
    containerRef.value.requestFullscreen()
      .then(() => { isFullscreen.value = true })
      .catch(() => {})
  } else {
    document.exitFullscreen()
      .then(() => { isFullscreen.value = false })
      .catch(() => {})
  }
}

function onProgressClick(e: MouseEvent) {
  if (!videoRef.value || !duration.value) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  videoRef.value.currentTime = percent * duration.value
}

function onProgressHover(e: MouseEvent) {
  if (!duration.value) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  hoverPercent.value = percent * 100
  hoverTime.value = percent * duration.value
}

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playTimer = setTimeout(() => {
            if (videoRef.value) {
              videoRef.value.preload = 'auto'
              videoRef.value.play()
                .then(() => { isPlaying.value = true })
                .catch(() => {})
            }
          }, 250)
        } else {
          if (playTimer) {
            clearTimeout(playTimer)
            playTimer = null
          }
          if (videoRef.value && !videoRef.value.paused) {
            videoRef.value.pause()
            isPlaying.value = false
          }
        }
      })
    },
    { threshold: 0.3 }
  )

  if (containerRef.value) {
    observer.observe(containerRef.value)
  }

  nextTick(() => {
    drawInvisibleWatermark()
  })
})
</script>
