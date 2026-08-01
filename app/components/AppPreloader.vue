<template>
  <div
    v-if="isVisible"
    class="preloader-overlay notranslate fixed inset-0 z-[99999] overflow-hidden select-none pointer-events-auto bg-transparent"
    translate="no"
  >
    <!-- Background Shutter Curtains (Left & Right Split Panels in Quiet Luxury Organic Warm Linen Theme) -->
    <div class="curtain-container absolute inset-0 flex pointer-events-none z-0">
      <!-- Left Curtain Panel -->
      <div
        class="curtain-left flex-1 h-full relative overflow-hidden shadow-[16px_0_50px_rgba(180,120,50,0.1)]"
        style="background: radial-gradient(circle at 100% 50%, #f7f3ee 0%, #ede6dc 100%); border-right: 1px solid rgba(180, 150, 110, 0.3);"
      >
        <!-- Organic Paper Print Grid Pattern -->
        <div
          class="absolute inset-0 opacity-[0.06] pointer-events-none"
          style="background-image: linear-gradient(#1c1917 1px, transparent 1px), linear-gradient(90deg, #1c1917 1px, transparent 1px); background-size: 32px 32px;"
        />
        <div class="absolute inset-y-0 right-0 w-[1.5px] bg-gradient-to-b from-transparent via-[#b45309]/40 to-transparent" />
      </div>

      <!-- Right Curtain Panel -->
      <div
        class="curtain-right flex-1 h-full relative overflow-hidden shadow-[-16px_0_50px_rgba(180,120,50,0.1)]"
        style="background: radial-gradient(circle at 0% 50%, #f7f3ee 0%, #ede6dc 100%); border-left: 1px solid rgba(180, 150, 110, 0.3);"
      >
        <!-- Organic Paper Print Grid Pattern -->
        <div
          class="absolute inset-0 opacity-[0.06] pointer-events-none"
          style="background-image: linear-gradient(#1c1917 1px, transparent 1px), linear-gradient(90deg, #1c1917 1px, transparent 1px); background-size: 32px 32px;"
        />
        <div class="absolute inset-y-0 left-0 w-[1.5px] bg-gradient-to-b from-transparent via-[#b45309]/40 to-transparent" />
      </div>

      <!-- Center Split Seam Accent Line -->
      <div class="curtain-seam absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-transparent via-[#b45309] to-transparent opacity-80 pointer-events-none z-20 shadow-[0_0_12px_rgba(180,83,9,0.4)]" />
    </div>

    <!-- Central Preloader Content -->
    <div class="preloader-content absolute inset-0 flex flex-col items-center justify-center px-4 z-10">
      <!-- Ambient Warm Halos -->
      <div
        class="ambient-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none rounded-full blur-[130px] opacity-40 animate-pulse"
        style="background: radial-gradient(circle, rgba(217,119,6,0.22) 0%, rgba(225,29,72,0.08) 45%, transparent 75%);"
      />

      <!-- World-Class 3D Optics Lens Aperture Core -->
      <div class="aperture-container mb-8 relative flex items-center justify-center opacity-0 scale-90">
        <!-- Dual Warm Ambient Halos -->
        <div class="halo-amber absolute w-36 h-36 rounded-full bg-amber-500/20 blur-3xl scale-90 animate-ping" />
        <div class="halo-bronze absolute w-28 h-28 rounded-full bg-[#b45309]/15 blur-2xl" />

        <svg
          class="aperture-svg w-24 h-24 text-[#b45309] relative z-10 drop-shadow-[0_4px_25px_rgba(180,83,9,0.25)]"
          viewBox="0 0 100 100"
          fill="none"
        >
          <!-- Outer Rotating Dash Ring -->
          <circle
            cx="50"
            cy="50"
            r="46"
            class="outer-ring"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-dasharray="290"
            stroke-dashoffset="290"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            class="inner-counter-ring text-[#1c1917]/30 opacity-60"
            stroke="currentColor"
            stroke-width="1"
            stroke-dasharray="8 12"
          />

          <!-- 8 Precision Aperture Blades -->
          <g stroke="currentColor" stroke-width="1.3">
            <path d="M 50 4  L 20 40" class="blade-line blade-1" stroke-dasharray="55" stroke-dashoffset="55" />
            <path d="M 96 50 L 60 20" class="blade-line blade-2" stroke-dasharray="55" stroke-dashoffset="55" />
            <path d="M 50 96 L 80 60" class="blade-line blade-3" stroke-dasharray="55" stroke-dashoffset="55" />
            <path d="M 4  50 L 40 80" class="blade-line blade-4" stroke-dasharray="55" stroke-dashoffset="55" />
            <path d="M 20 40 L 40 30" class="blade-line blade-5" stroke-dasharray="35" stroke-dashoffset="35" />
            <path d="M 60 20 L 70 40" class="blade-line blade-6" stroke-dasharray="35" stroke-dashoffset="35" />
            <path d="M 80 60 L 60 70" class="blade-line blade-7" stroke-dasharray="35" stroke-dashoffset="35" />
            <path d="M 40 80 L 30 60" class="blade-line blade-8" stroke-dasharray="35" stroke-dashoffset="35" />
          </g>

          <!-- Center Iris Hologram Core -->
          <polygon points="40,30 70,40 60,70 30,60" class="iris-polygon opacity-0" fill="rgba(180, 83, 9, 0.18)" stroke="#b45309" stroke-width="1.5" />
          <circle cx="50" cy="50" r="7" fill="#b45309" class="iris-center shadow-[0_0_12px_#b45309]" />
        </svg>
      </div>

      <!-- Functional Loading Status Text -->
      <div class="status-container text-center space-y-2 max-w-md opacity-0 relative z-10">
        <p ref="statusTextRef" class="status-text text-sm sm:text-base font-sans font-semibold tracking-wider text-[#1c1917] transition-opacity duration-200">
          正在载入极奢视效与界面矩阵...
        </p>
        <p class="text-[10px] font-sans tracking-[0.18em] uppercase text-[#b45309] font-bold">
          全站资源动态同步 · {{ netQualityLabel }}
        </p>
      </div>

      <!-- Quantum Progress Bar Block -->
      <div class="progress-wrap flex flex-col items-center mt-8 space-y-4 opacity-0 relative z-10">
        <!-- Capsule Progress Track & Flowing Bar -->
        <div class="w-80 h-3 bg-black/[0.05] relative overflow-hidden rounded-full p-0.5 border border-amber-900/15 shadow-inner backdrop-blur-xl">
          <div
            ref="progressBarRef"
            class="progress-bar h-full rounded-full transition-all duration-75 relative overflow-hidden shadow-[0_0_10px_rgba(180,83,9,0.3)]"
            style="width: 0%; background: linear-gradient(90deg, #b45309, #d97706, #f59e0b);"
          >
            <!-- Particle Shimmer Light Streak -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse" />
          </div>
        </div>

        <!-- Percentage Counter Badge -->
        <div class="inline-flex items-center gap-2.5 px-4.5 py-1.5 rounded-full bg-white/90 text-xs font-mono font-bold tracking-widest text-[#1c1917] border border-amber-900/15 shadow-md backdrop-blur-xl">
          <span class="w-2 h-2 rounded-full bg-[#b45309] animate-ping" />
          <span class="text-stone-600 font-sans font-bold">资源载入中</span>
          <span ref="counterTextRef" class="text-[#b45309] font-mono font-extrabold text-sm min-w-[3.5ch] inline-block text-right tabular-nums">
            00%
          </span>
        </div>
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
const netQualityLabel = ref('4G 极速网络')
const statusTextRef = ref<HTMLElement | null>(null)
const progressBarRef = ref<HTMLElement | null>(null)
const counterTextRef = ref<HTMLElement | null>(null)

let minPresentationMs = 2600
let isFinishing = false
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
    nextText = '正在载入极奢视效与界面矩阵...'
  } else if (progress < 55) {
    nextText = '正在传输网络资产与渲染流...'
  } else if (progress < 85) {
    nextText = '正在解析色域规范与 4K 影视帧...'
  } else if (progress < 99) {
    nextText = '全站资源载入完毕，准备影院级开幕...'
  } else {
    nextText = '环境就绪，欢迎访问 Xo 工作室！'
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

  // 1. Detect Real Network Connection Speed
  const nav = navigator as any
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection
  if (conn) {
    const effectiveType = conn.effectiveType || '4g'
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      minPresentationMs = 4500
      netQualityLabel.value = '2G 慢速网络'
    } else if (effectiveType === '3g') {
      minPresentationMs = 3500
      netQualityLabel.value = '3G 普通网络'
    } else {
      minPresentationMs = 2500
      netQualityLabel.value = '4G 极速网络'
    }
  }

  // 2. Import GSAP
  const { gsap } = await import('gsap')

  // Set initial state for aperture and UI
  gsap.set('.aperture-container', { autoAlpha: 0, scale: 0.75, rotate: -45 })
  gsap.set('.status-container', { autoAlpha: 0, y: 15 })
  gsap.set('.progress-wrap', { autoAlpha: 0, y: 15 })

  // Fade in elements immediately with mechanical aperture recoil physics
  gsap.to('.aperture-container', {
    autoAlpha: 1,
    scale: 1,
    rotate: 0,
    duration: 0.9,
    ease: 'back.out(1.8)'
  })

  gsap.to(['.status-container', '.progress-wrap'], {
    autoAlpha: 1,
    y: 0,
    duration: 0.6,
    ease: 'power3.out',
    delay: 0.1
  })

  // SVG Aperture Ring & Blade Animations
  gsap.to('.outer-ring', { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' })
  gsap.to('.inner-counter-ring', { rotate: -360, duration: 20, repeat: -1, ease: 'none', transformOrigin: '50% 50%' })
  gsap.to('.blade-line', { strokeDashoffset: 0, duration: 1.1, stagger: 0.04, ease: 'power2.out' })
  gsap.to('.iris-polygon', { autoAlpha: 1, duration: 0.7, delay: 0.3 })
  gsap.to('.aperture-svg', { rotate: 90, duration: 2.2, ease: 'sine.inOut' })

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
  }

  const progressObj = { value: 0 }

  const triggerOutro = () => {
    if (isFinishing) return
    isFinishing = true

    // Brief hold at 100% so user registers "环境就绪" comfortably
    setTimeout(() => {
      const outroTl = gsap.timeline({
        onComplete: () => {
          isVisible.value = false
          emit('complete')
        }
      })

      // Step 1: Center UI elements aperture burst flash & scale up
      outroTl.to('.aperture-container', {
        scale: 1.35,
        rotate: 180,
        autoAlpha: 0,
        duration: 0.45,
        ease: 'power3.in'
      })
      outroTl.to(['.status-container', '.progress-wrap'], {
        y: 15,
        autoAlpha: 0,
        duration: 0.35,
        ease: 'power2.in'
      }, '<')
      outroTl.to('.curtain-seam', {
        autoAlpha: 0,
        duration: 0.2
      }, '<')

      // Step 2: Organic Linen Curtains Slide Away smoothly
      outroTl.to('.curtain-left', {
        xPercent: -100,
        duration: 1.05,
        ease: 'power4.inOut'
      }, 'curtain')
      outroTl.to('.curtain-right', {
        xPercent: 100,
        duration: 1.05,
        ease: 'power4.inOut'
      }, 'curtain')

      // Step 3: Trigger Handshake for Webpage 3D Parallax Depth Push right as curtains part
      outroTl.add(() => {
        emit('reveal-start')
      }, 'curtain+=0.05')
    }, 280)
  }

  const loop = () => {
    if (isFinishing) return

    const elapsed = Date.now() - startTime
    const timeCapProgress = Math.min((elapsed / minPresentationMs) * 100, 100)
    const effectiveTarget = Math.min(networkTargetProgress, timeCapProgress)

    // Unhurried organic lerp interpolation
    const step = (effectiveTarget - progressObj.value) * 0.04
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
