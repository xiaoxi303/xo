<template>
  <div
    v-if="isVisible"
    class="preloader-overlay notranslate fixed inset-0 z-[99999] overflow-hidden select-none pointer-events-auto bg-transparent"
    translate="no"
  >
    <!-- Background Shutter Curtains (Left & Right Split Panels in Quiet Luxury Linen Theme) -->
    <div class="curtain-container absolute inset-0 flex pointer-events-none z-0">
      <!-- Left Curtain Panel -->
      <div
        class="curtain-left flex-1 h-full relative border-r overflow-hidden shadow-[12px_0_40px_rgba(180,120,50,0.12)]"
        style="background: #f7f3ee; border-color: rgba(180, 160, 130, 0.25);"
      >
        <!-- Subtle Paper Print Grid Pattern -->
        <div
          class="absolute inset-0 opacity-[0.05] pointer-events-none"
          style="background-image: linear-gradient(#0a0b0e 1px, transparent 1px), linear-gradient(90deg, #0a0b0e 1px, transparent 1px); background-size: 32px 32px;"
        />
        <div class="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-[#b45309]/35 to-transparent" />
      </div>

      <!-- Right Curtain Panel -->
      <div
        class="curtain-right flex-1 h-full relative border-l overflow-hidden shadow-[-12px_0_40px_rgba(180,120,50,0.12)]"
        style="background: #f7f3ee; border-color: rgba(180, 160, 130, 0.25);"
      >
        <!-- Subtle Paper Print Grid Pattern -->
        <div
          class="absolute inset-0 opacity-[0.05] pointer-events-none"
          style="background-image: linear-gradient(#0a0b0e 1px, transparent 1px), linear-gradient(90deg, #0a0b0e 1px, transparent 1px); background-size: 32px 32px;"
        />
        <div class="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-[#b45309]/35 to-transparent" />
      </div>

      <!-- Subtle Split Seam Accent Line -->
      <div class="curtain-seam absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-[#b45309]/80 to-transparent opacity-0 pointer-events-none z-20" />
    </div>

    <!-- Central Preloader Content -->
    <div class="preloader-content absolute inset-0 flex flex-col items-center justify-center px-4 z-10">
      <!-- Ambient Studio Backdrop Warm Halos -->
      <div
        class="ambient-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] pointer-events-none rounded-full blur-[110px] opacity-35"
        style="background: radial-gradient(circle, rgba(217,119,6,0.25) 0%, rgba(147,51,234,0.12) 50%, transparent 80%);"
      />

      <!-- Cinematic Aperture SVG Icon -->
      <div class="aperture-container mb-8 relative flex items-center justify-center opacity-0 scale-90">
        <!-- Soft Warm Amber & Blue Dual Halos -->
        <div class="halo-amber absolute w-32 h-32 rounded-full bg-amber-500/20 blur-2xl scale-75" />
        <div class="halo-blue absolute w-24 h-24 rounded-full bg-[#007AFF]/15 blur-xl" />

        <svg
          class="aperture-svg w-20 h-20 text-[#b45309] relative z-10 drop-shadow-[0_4px_20px_rgba(180,83,9,0.25)]"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          stroke-width="1.4"
        >
          <circle cx="50" cy="50" r="46" class="outer-ring" stroke-dasharray="290" stroke-dashoffset="290" />
          
          <!-- Outer Blades -->
          <path d="M 50 4  L 20 40" class="blade-line blade-1" stroke-dasharray="55" stroke-dashoffset="55" />
          <path d="M 96 50 L 60 20" class="blade-line blade-2" stroke-dasharray="55" stroke-dashoffset="55" />
          <path d="M 50 96 L 80 60" class="blade-line blade-3" stroke-dasharray="55" stroke-dashoffset="55" />
          <path d="M 4  50 L 40 80" class="blade-line blade-4" stroke-dasharray="55" stroke-dashoffset="55" />
          
          <!-- Inner Blades -->
          <path d="M 20 40 L 40 30" class="blade-line blade-5" stroke-dasharray="35" stroke-dashoffset="35" />
          <path d="M 60 20 L 70 40" class="blade-line blade-6" stroke-dasharray="35" stroke-dashoffset="35" />
          <path d="M 80 60 L 60 70" class="blade-line blade-7" stroke-dasharray="35" stroke-dashoffset="35" />
          <path d="M 40 80 L 30 60" class="blade-line blade-8" stroke-dasharray="35" stroke-dashoffset="35" />

          <!-- Iris Polygon -->
          <polygon points="40,30 70,40 60,70 30,60" class="iris-polygon opacity-0" fill="rgba(180, 83, 9, 0.15)" />
        </svg>
      </div>

      <!-- Functional Loading Status Text -->
      <div class="status-container text-center space-y-2 max-w-md opacity-0 relative z-10">
        <p ref="statusTextRef" class="status-text text-sm sm:text-base font-sans font-semibold tracking-wider text-[#0a0b0e] transition-opacity duration-200">
          正在建立加密网络安全连接...
        </p>
        <p class="text-[10px] font-mono tracking-[0.25em] uppercase text-[#b45309] font-bold">
          REAL-TIME HYBRID NETWORK MONITOR · {{ netQualityLabel }}
        </p>
      </div>

      <!-- Capsule Progress Indicator Block -->
      <div class="progress-wrap flex flex-col items-center mt-8 space-y-4 opacity-0 relative z-10">
        <!-- Capsule Progress Track & Bar -->
        <div class="w-72 h-2.5 bg-black/[0.06] relative overflow-hidden rounded-full p-0.5 border border-amber-900/15 shadow-inner backdrop-blur-md">
          <div
            ref="progressBarRef"
            class="progress-bar h-full rounded-full shadow-[0_0_12px_rgba(180,83,9,0.5)]"
            style="width: 0%; background: linear-gradient(90deg, #b45309, #d97706, #007AFF)"
          />
        </div>

        <!-- Percentage Counter Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 text-xs font-mono font-bold tracking-widest text-slate-800 border border-amber-800/15 shadow-md backdrop-blur-md">
          <span class="w-2 h-2 rounded-full bg-[#007AFF] animate-ping" />
          <span class="text-slate-500">LOADING</span>
          <span ref="counterTextRef" class="text-[#b45309] font-mono font-extrabold text-sm min-w-[3.2ch] inline-block text-right tabular-nums">00%</span>
        </div>
      </div>

      <!-- Bottom Footer Tagline -->
      <div class="absolute bottom-8 text-[10px] font-mono tracking-[0.25em] opacity-60 uppercase text-slate-500">
        Xo Studio · Network Adaptive Sync
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'complete'): void
  (e: 'reveal-start'): void
}>()

const isVisible = ref(true)
const netQualityLabel = ref('4G STABLE')
const statusTextRef = ref<HTMLElement | null>(null)
const progressBarRef = ref<HTMLElement | null>(null)
const counterTextRef = ref<HTMLElement | null>(null)

let isFinishing = false
let minPresentationMs = 2800
let networkTargetProgress = 15
let animationFrameId: number | null = null
let isFullyLoaded = false
let startTime = 0
let currentText = ''

// Smooth Cross-Fading Status Text Updates
const updateStatusText = (progress: number) => {
  if (!statusTextRef.value) return
  let nextText = ''
  if (progress < 25) {
    nextText = '正在建立加密网络安全连接...'
  } else if (progress < 55) {
    nextText = '正在传输网络资产与渲染流...'
  } else if (progress < 85) {
    nextText = '正在解析色域规范与界面矩阵...'
  } else if (progress < 99) {
    nextText = '网络资源就绪，准备全屏进入...'
  } else {
    nextText = '环境载入完成，欢迎访问！'
  }

  if (nextText !== currentText) {
    currentText = nextText
    statusTextRef.value.style.opacity = '0'
    setTimeout(() => {
      if (statusTextRef.value) {
        statusTextRef.value.textContent = nextText
        statusTextRef.value.style.opacity = '1'
      }
    }, 120)
  }
}

onMounted(async () => {
  if (!import.meta.client) return

  startTime = Date.now()

  // 1. Detect Real Network Connection Speed & Set Unhurried Ceremonial Minimum Timing
  const nav = navigator as any
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection
  if (conn) {
    const effectiveType = conn.effectiveType || '4g'
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      minPresentationMs = 5000
      netQualityLabel.value = '2G SLOW'
    } else if (effectiveType === '3g') {
      minPresentationMs = 3800
      netQualityLabel.value = '3G MEDIUM'
    } else {
      minPresentationMs = 2800
      netQualityLabel.value = '4G STABLE'
    }
  }

  // 2. Import GSAP
  const { gsap } = await import('gsap')

  // Set initial state for aperture and UI
  gsap.set('.aperture-container', { autoAlpha: 0, scale: 0.8, rotate: -25 })
  gsap.set('.status-container', { autoAlpha: 0, y: 10 })
  gsap.set('.progress-wrap', { autoAlpha: 0, y: 10 })

  // Fade in elements immediately with mechanical aperture recoil physics
  gsap.to('.aperture-container', {
    autoAlpha: 1,
    scale: 1,
    rotate: 0,
    duration: 0.8,
    ease: 'back.out(1.5)'
  })

  gsap.to(['.status-container', '.progress-wrap'], {
    autoAlpha: 1,
    y: 0,
    duration: 0.5,
    ease: 'power2.out',
    delay: 0.08
  })

  // SVG Aperture Ring & Blade Animations
  gsap.to('.outer-ring', { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' })
  gsap.to('.blade-line', { strokeDashoffset: 0, duration: 1.0, stagger: 0.04, ease: 'power2.out' })
  gsap.to('.iris-polygon', { autoAlpha: 1, duration: 0.6, delay: 0.3 })
  gsap.to('.aperture-svg', { rotate: 45, duration: 1.8, ease: 'sine.inOut' })

  // 3. Real Network & Page Resource Load Tracking
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
    setTimeout(() => {
      onWindowLoad()
    }, 5000)
  }

  // 4. Unhurried Dynamic Lerp Loop (0.035 rate for calm, elegant, unhurried rhythm)
  const progressObj = { value: 0 }

  const triggerOutro = () => {
    if (isFinishing) return
    isFinishing = true

    // Brief 300ms hold at 100% so user registers "环境载入完成" comfortably
    setTimeout(() => {
      const outroTl = gsap.timeline({
        onComplete: () => {
          isVisible.value = false
          emit('complete')
        }
      })

      // Step 1: Center UI elements fade out & scale down
      outroTl.to('.aperture-container', {
        scale: 0.82,
        autoAlpha: 0,
        duration: 0.35,
        ease: 'power2.in'
      })
      outroTl.to(['.status-container', '.progress-wrap'], {
        y: 12,
        autoAlpha: 0,
        duration: 0.3,
        ease: 'power2.in'
      }, '<')

      // Step 2: Left & Right Curtains Slide Away (Duration: 0.95s)
      outroTl.to('.curtain-left', {
        xPercent: -100,
        duration: 0.95,
        ease: 'power4.inOut'
      }, 'curtain')
      outroTl.to('.curtain-right', {
        xPercent: 100,
        duration: 0.95,
        ease: 'power4.inOut'
      }, 'curtain')

      // Step 3: Trigger Handshake for Webpage 3D Parallax Depth Push right as curtains part
      outroTl.add(() => {
        emit('reveal-start')
      }, 'curtain+=0.05')
    }, 300)
  }

  const loop = () => {
    if (isFinishing) return

    const elapsed = Date.now() - startTime
    const timeCapProgress = Math.min((elapsed / minPresentationMs) * 100, 100)
    const effectiveTarget = Math.min(networkTargetProgress, timeCapProgress)

    // Unhurried organic lerp interpolation (0.035 rate for calm, unhurried cinematic pacing)
    const step = (effectiveTarget - progressObj.value) * 0.035
    if (Math.abs(effectiveTarget - progressObj.value) > 0.04) {
      progressObj.value += step
    } else {
      progressObj.value = effectiveTarget
    }

    const val = progressObj.value
    if (progressBarRef.value) {
      progressBarRef.value.style.width = `${val}%`
    }
    if (counterTextRef.value) {
      const displayVal = Math.floor(val)
      counterTextRef.value.textContent = `${displayVal < 10 ? '0' + displayVal : displayVal}%`
    }
    updateStatusText(val)

    const isMinTimeElapsed = elapsed >= minPresentationMs

    if (val >= 99.5 && isFullyLoaded && isMinTimeElapsed) {
      progressObj.value = 100
      if (progressBarRef.value) progressBarRef.value.style.width = '100%'
      if (counterTextRef.value) counterTextRef.value.textContent = '100%'
      updateStatusText(100)

      triggerOutro()
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
