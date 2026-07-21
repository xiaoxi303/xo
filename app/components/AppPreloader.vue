<template>
  <div
    v-if="isVisible"
    class="preloader-overlay notranslate fixed inset-0 z-[999] flex flex-col items-center justify-center pointer-events-auto px-4 select-none"
    translate="no"
    style="background-color: var(--color-bg);"
  >
    <!-- Background grid lines for paper print aesthetic -->
    <div
      class="absolute inset-0 opacity-[0.035] pointer-events-none"
      style="background-image: linear-gradient(var(--color-ink-1) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink-1) 1px, transparent 1px); background-size: 32px 32px;"
    />

    <!-- Cinematic Aperture / Shutter Icon -->
    <div class="aperture-container mb-6 relative flex items-center justify-center invisible">
      <svg
        class="w-14 h-14 text-[#b45309] transform rotate-[-45deg] scale-95"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        stroke-width="1.3"
      >
        <circle cx="50" cy="50" r="46" class="outer-ring" stroke-dasharray="290" stroke-dashoffset="290" />
        
        <path d="M 50 4  L 20 40" class="blade-line" />
        <path d="M 96 50 L 60 20" class="blade-line" />
        <path d="M 50 96 L 80 60" class="blade-line" />
        <path d="M 4  50 L 40 80" class="blade-line" />
        
        <path d="M 20 40 L 40 30" class="blade-line" />
        <path d="M 60 20 L 70 50" class="blade-line" />
        <path d="M 80 60 L 60 70" class="blade-line" />
        <path d="M 40 80 L 30 50" class="blade-line" />

        <polygon points="40,30 70,50 60,70 30,50" class="iris-polygon" fill="rgba(180, 83, 9, 0.08)" />
      </svg>

      <!-- Soft amber light halo -->
      <div class="absolute w-20 h-20 rounded-full bg-amber-500/15 blur-xl scale-75 animate-pulse" />
    </div>

    <!-- Minimal Functional Loading Status Text -->
    <div class="status-container text-center space-y-1.5 max-w-sm invisible">
      <p class="status-text text-xs sm:text-sm font-sans font-semibold tracking-wider" style="color: var(--color-ink-1);">
        正在建立服务器连接...
      </p>
      <p class="text-[9px] font-mono tracking-[0.2em] uppercase opacity-70" style="color: #b45309;">
        REAL-TIME NETWORK ASSETS TRACKER
      </p>
    </div>

    <!-- Progress Indicator Block -->
    <div class="progress-wrap flex flex-col items-center mt-8 space-y-3 invisible">
      <!-- Bronze progress track and bar -->
      <div class="w-56 h-[2px] bg-black/[0.08] relative overflow-hidden rounded-full">
        <div
          class="progress-bar absolute left-0 top-0 h-full rounded-full transition-all duration-75 ease-out"
          :style="{ width: displayProgress + '%', backgroundColor: '#b45309' }"
        />
      </div>

      <!-- Percentage Counter -->
      <div class="text-xs font-mono font-bold tracking-[0.2em]" style="color: var(--color-ink-3);">
        <span>{{ formattedProgress }}</span>%
      </div>
    </div>

    <!-- Bottom Footer Tagline -->
    <div class="absolute bottom-8 text-[9px] font-mono tracking-[0.2em] opacity-40 uppercase" style="color: var(--color-ink-4);">
      Xo Studio · Real-time Resource Monitor
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'complete'): void
}>()

const isVisible = ref(true)
const displayProgress = ref(0)
const formattedProgress = computed(() => {
  const p = Math.floor(displayProgress.value)
  return p < 10 ? `0${p}` : `${p}`
})

let targetProgress = 15
let animationFrameId: number | null = null
let isFullyLoaded = false

// Dynamic status text update
const updateStatusText = (progress: number) => {
  if (!import.meta.client) return
  const st = document.querySelector('.status-text')
  if (!st) return

  if (progress < 30) {
    st.textContent = '正在建立服务器连接...'
  } else if (progress < 65) {
    st.textContent = '正在从服务器加载网络资产与字体...'
  } else if (progress < 95) {
    st.textContent = '正在解析色彩规范与视频矩阵...'
  } else {
    st.textContent = '网络资源就绪，正在进入...'
  }
}

onMounted(async () => {
  if (!import.meta.client) return

  // Dynamically import GSAP
  const { gsap } = await import('gsap')

  // 1. Initial State configuration
  gsap.set('.aperture-container', { autoAlpha: 0, scale: 0.85 })
  gsap.set('.status-container', { autoAlpha: 0, y: 10 })
  gsap.set('.progress-wrap', { autoAlpha: 0, y: 10 })

  // 2. Entrance Animation
  const introTl = gsap.timeline()
  introTl.to('.aperture-container', { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power3.out' })
  introTl.to('.outer-ring', { strokeDashoffset: 0, duration: 1.0, ease: 'power2.inOut' }, '<')
  introTl.to('.aperture-container svg', { rotate: 45, duration: 1.4, ease: 'sine.inOut' }, '<')
  introTl.to('.status-container', { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power3.out' }, '-=0.5')
  introTl.to('.progress-wrap', { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.3')

  // 3. Real Network Resource Load Tracking
  const images = Array.from(document.querySelectorAll('img'))
  const totalResources = images.length + 2 // DOM + Fonts + Images
  let loadedCount = 0

  const updateResourceProgress = () => {
    loadedCount++
    const resRatio = Math.min(loadedCount / Math.max(totalResources, 1), 1)
    // Map resource loading ratio to 25% -> 85% range
    targetProgress = Math.max(targetProgress, 25 + resRatio * 60)
  }

  // Monitor image loading
  images.forEach(img => {
    if (img.complete) {
      updateResourceProgress()
    } else {
      img.addEventListener('load', updateResourceProgress, { once: true })
      img.addEventListener('error', updateResourceProgress, { once: true })
    }
  })

  // Monitor document ready state
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    targetProgress = Math.max(targetProgress, 35)
  }
  
  // Monitor window load event (complete network download)
  const onWindowLoad = () => {
    isFullyLoaded = true
    targetProgress = 100
  }

  if (document.readyState === 'complete') {
    onWindowLoad()
  } else {
    window.addEventListener('load', onWindowLoad, { once: true })
    // Fallback safety timeout if network hangs (max 3.5s)
    setTimeout(() => {
      onWindowLoad()
    }, 3500)
  }

  // 4. Smooth Lerp Animation Loop (requestAnimationFrame)
  const loop = () => {
    // Smooth lerp interpolation towards target progress
    const step = (targetProgress - displayProgress.value) * 0.08
    if (Math.abs(targetProgress - displayProgress.value) > 0.1) {
      displayProgress.value += step
    } else {
      displayProgress.value = targetProgress
    }

    updateStatusText(displayProgress.value)

    if (displayProgress.value >= 99.5 && isFullyLoaded) {
      displayProgress.value = 100
      updateStatusText(100)

      // Trigger exit animation
      setTimeout(() => {
        gsap.to('.preloader-overlay', {
          opacity: 0,
          yPercent: -10,
          duration: 0.7,
          ease: 'power4.inOut',
          onComplete: () => {
            isVisible.value = false
            emit('complete')
          }
        })
      }, 150)
      return
    }

    animationFrameId = requestAnimationFrame(loop)
  }

  animationFrameId = requestAnimationFrame(loop)
})

onBeforeUnmount(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped>
.blade-line {
  stroke-dasharray: 80;
  stroke-dashoffset: 80;
  animation: draw-blade 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  animation-delay: 0.1s;
  opacity: 0.85;
}

@keyframes draw-blade {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
