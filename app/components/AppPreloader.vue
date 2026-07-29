<template>
  <div
    v-if="isVisible"
    class="preloader-overlay notranslate fixed inset-0 z-[99999] flex flex-col items-center justify-center pointer-events-auto px-4 select-none backdrop-blur-3xl"
    translate="no"
    style="background: var(--color-bg);"
  >
    <!-- Ambient Studio Backdrop Glows -->
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none rounded-full blur-[100px] opacity-30"
      style="background: radial-gradient(circle, rgba(0,122,255,0.3) 0%, rgba(217,119,6,0.2) 50%, transparent 80%);"
    />

    <!-- Background Grid Lines for Paper Print Aesthetic -->
    <div
      class="absolute inset-0 opacity-[0.035] pointer-events-none"
      style="background-image: linear-gradient(var(--color-ink-1) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink-1) 1px, transparent 1px); background-size: 32px 32px;"
    />

    <!-- Cinematic Aperture / Shutter Icon (LOGO STRICTLY UNTOUCHED) -->
    <div class="aperture-container mb-6 relative flex items-center justify-center invisible">
      <!-- Soft Amber & Blue Dual Ambient Halos -->
      <div class="absolute w-28 h-28 rounded-full bg-amber-500/20 blur-2xl scale-75 animate-pulse" />
      <div class="absolute w-20 h-20 rounded-full bg-[#007AFF]/15 blur-xl animate-ping" />

      <svg
        class="w-16 h-16 text-[#b45309] transform rotate-[-45deg] scale-95 relative z-10"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        stroke-width="1.3"
      >
        <circle cx="50" cy="50" r="46" class="outer-ring" stroke-dasharray="290" stroke-dashoffset="290" />
        
        <!-- Optimized Symmetric Outer Blades -->
        <path d="M 50 4  L 20 40" class="blade-line" />
        <path d="M 96 50 L 60 20" class="blade-line" />
        <path d="M 50 96 L 80 60" class="blade-line" />
        <path d="M 4  50 L 40 80" class="blade-line" />
        
        <!-- Optimized Symmetric Inner Blades -->
        <path d="M 20 40 L 40 30" class="blade-line" />
        <path d="M 60 20 L 70 40" class="blade-line" />
        <path d="M 80 60 L 60 70" class="blade-line" />
        <path d="M 40 80 L 30 60" class="blade-line" />

        <!-- Perfectly Symmetric Iris Polygon -->
        <polygon points="40,30 70,40 60,70 30,60" class="iris-polygon" fill="rgba(180, 83, 9, 0.12)" />
      </svg>
    </div>

    <!-- Minimal Functional Loading Status Text -->
    <div class="status-container text-center space-y-1.5 max-w-sm invisible relative z-10">
      <p class="status-text text-xs sm:text-sm font-sans font-semibold tracking-wider transition-all duration-300" style="color: var(--color-ink-1);">
        正在建立加密网络安全连接...
      </p>
      <p class="text-[9px] font-mono tracking-[0.2em] uppercase opacity-80" style="color: #b45309;">
        REAL-TIME HYBRID NETWORK MONITOR · {{ netQualityLabel }}
      </p>
    </div>

    <!-- Capsule Progress Indicator Block -->
    <div class="progress-wrap flex flex-col items-center mt-6 space-y-3 invisible relative z-10">
      <!-- Capsule Progress Track & Bar -->
      <div class="w-64 h-2 bg-black/[0.06] dark:bg-slate-800/80 relative overflow-hidden rounded-full p-0.5 border border-slate-300/40 dark:border-slate-700/40 shadow-inner">
        <div
          class="progress-bar h-full rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(0,122,255,0.5)]"
          :style="{ width: displayProgress + '%', background: 'linear-gradient(90deg, #b45309, #007AFF)' }"
        />
      </div>

      <!-- Percentage Counter Badge -->
      <div class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 text-[11px] font-mono font-bold tracking-widest text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <span class="w-1.5 h-1.5 rounded-full bg-[#007AFF] animate-ping" />
        <span>LOADING</span>
        <span class="text-[#007AFF] font-mono">{{ formattedProgress }}%</span>
      </div>
    </div>

    <!-- Bottom Footer Tagline -->
    <div class="absolute bottom-8 text-[9px] font-mono tracking-[0.2em] opacity-40 uppercase" style="color: var(--color-ink-4);">
      Xo Studio · Network Adaptive Sync
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'complete'): void
}>()

const isVisible = ref(true)
const displayProgress = ref(0)
const netQualityLabel = ref('4G STABLE')
const formattedProgress = computed(() => {
  const p = Math.floor(displayProgress.value)
  return p < 10 ? `0${p}` : `${p}`
})

// Dynamic presentation timing based on network speed (Default min 1800ms for smooth cinematic rhythm)
let minPresentationMs = 1800

let networkTargetProgress = 15
let animationFrameId: number | null = null
let isFullyLoaded = false
let startTime = 0

// Dynamic status text update based on progress & network state
const updateStatusText = (progress: number) => {
  if (!import.meta.client) return
  const st = document.querySelector('.status-text')
  if (!st) return

  if (progress < 25) {
    st.textContent = '正在建立加密网络安全连接...'
  } else if (progress < 55) {
    st.textContent = '正在传输网络资产、图片与字体...'
  } else if (progress < 85) {
    st.textContent = '正在解析色域规范与渲染流...'
  } else if (progress < 99) {
    st.textContent = '网络资源就绪，正在准备全屏进入...'
  } else {
    st.textContent = '环境载入完成，欢迎访问！'
  }
}

onMounted(async () => {
  if (!import.meta.client) return

  startTime = Date.now()

  // 0. Detect User's Real Network Speed (Network Information API)
  const nav = navigator as any
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection
  if (conn) {
    const effectiveType = conn.effectiveType || '4g'
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      minPresentationMs = 3500
      netQualityLabel.value = '2G SLOW'
    } else if (effectiveType === '3g') {
      minPresentationMs = 2600
      netQualityLabel.value = '3G MEDIUM'
    } else {
      minPresentationMs = 1800
      netQualityLabel.value = '4G STABLE'
    }
  }

  // Dynamically import GSAP
  const { gsap } = await import('gsap')

  // 1. Initial State configuration
  gsap.set('.aperture-container', { autoAlpha: 0, scale: 0.85 })
  gsap.set('.status-container', { autoAlpha: 0, y: 10 })
  gsap.set('.progress-wrap', { autoAlpha: 0, y: 10 })

  // 2. Entrance Animation
  const introTl = gsap.timeline()
  introTl.to('.aperture-container', { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'power3.out' })
  introTl.to('.outer-ring', { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, '<')
  introTl.to('.aperture-container svg', { rotate: 45, duration: 1.4, ease: 'sine.inOut' }, '<')
  introTl.to('.status-container', { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power3.out' }, '-=0.5')
  introTl.to('.progress-wrap', { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.3')

  // 3. Real Network Resource Load Tracking
  const images = Array.from(document.querySelectorAll('img'))
  const scripts = Array.from(document.querySelectorAll('script'))
  const totalResources = images.length + scripts.length + 1
  let loadedCount = 0

  const updateResourceProgress = () => {
    loadedCount++
    const resRatio = Math.min(loadedCount / Math.max(totalResources, 1), 1)
    networkTargetProgress = Math.max(networkTargetProgress, 20 + resRatio * 75)
  }

  images.forEach(img => {
    if (img.complete) {
      updateResourceProgress()
    } else {
      img.addEventListener('load', updateResourceProgress, { once: true })
      img.addEventListener('error', updateResourceProgress, { once: true })
    }
  })

  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    networkTargetProgress = Math.max(networkTargetProgress, 35)
  }
  
  const onWindowLoad = () => {
    isFullyLoaded = true
    networkTargetProgress = 100
  }

  if (document.readyState === 'complete') {
    onWindowLoad()
  } else {
    window.addEventListener('load', onWindowLoad, { once: true })
    // Safety fallback timeout (4.5s max for slow network)
    setTimeout(() => {
      onWindowLoad()
    }, 4500)
  }

  // 4. Smooth Cinematic Lerp Animation Loop (Smooth 0.05 interpolation for unhurried pacing)
  const loop = () => {
    const elapsed = Date.now() - startTime
    const timeCapProgress = Math.min((elapsed / minPresentationMs) * 100, 100)
    const effectiveTarget = Math.min(networkTargetProgress, timeCapProgress)

    // Smooth lerp interpolation (0.05 speed for elegant unhurried rhythm)
    const step = (effectiveTarget - displayProgress.value) * 0.05
    if (Math.abs(effectiveTarget - displayProgress.value) > 0.05) {
      displayProgress.value += step
    } else {
      displayProgress.value = effectiveTarget
    }

    updateStatusText(displayProgress.value)

    const isMinTimeElapsed = elapsed >= minPresentationMs

    if (displayProgress.value >= 99.5 && isFullyLoaded && isMinTimeElapsed) {
      displayProgress.value = 100
      updateStatusText(100)

      setTimeout(() => {
        gsap.to('.preloader-overlay', {
          opacity: 0,
          scale: 1.04,
          duration: 0.8,
          ease: 'power3.inOut',
          onComplete: () => {
            isVisible.value = false
            emit('complete')
          }
        })
      }, 200)
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
  stroke-dasharray: 55;
  stroke-dashoffset: 55;
  animation: draw-blade 1.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  animation-delay: 0.1s;
  opacity: 0.85;
}

@keyframes draw-blade {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
