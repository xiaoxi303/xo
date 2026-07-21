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
        class="w-16 h-16 text-[#b45309] transform rotate-[-45deg] scale-95"
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

      <!-- Soft amber light halo behind shutter -->
      <div class="absolute w-24 h-24 rounded-full bg-amber-500/15 blur-xl scale-75 animate-pulse" />
    </div>

    <!-- Brand Typography Container (Clear & Unclipped) -->
    <div class="text-center space-y-2 max-w-lg">
      <div class="preloader-logo py-1">
        <h1
          class="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-[0.18em] uppercase leading-tight invisible"
          style="color: var(--color-ink-1);"
        >
          Xo Studio
        </h1>
      </div>
      
      <div class="preloader-sub py-1 space-y-1">
        <p
          class="text-xs sm:text-sm font-sans tracking-widest font-semibold uppercase invisible"
          style="color: var(--color-ink-2);"
        >
          影视后期 · 达芬奇调色指导
        </p>
        <p
          class="text-[10px] font-mono tracking-[0.22em] uppercase invisible opacity-80"
          style="color: #b45309;"
        >
          Cinematic Post-Production & Color Science
        </p>
      </div>
    </div>

    <!-- Progress Indicator Block -->
    <div class="progress-wrap flex flex-col items-center mt-10 space-y-3 invisible">
      <!-- Warm bronze progress bar -->
      <div class="w-52 h-[2px] bg-black/[0.08] relative overflow-hidden rounded-full">
        <div class="progress-bar absolute left-0 top-0 h-full w-0 rounded-full" style="background-color: #b45309;" />
      </div>

      <!-- Percentage Counter -->
      <div class="text-xs font-mono font-bold tracking-[0.2em]" style="color: var(--color-ink-3);">
        <span class="counter-num">00</span>%
      </div>
    </div>

    <!-- Bottom Footer Tagline -->
    <div class="absolute bottom-8 text-[9px] font-mono tracking-[0.2em] opacity-40 uppercase" style="color: var(--color-ink-4);">
      Loading Studio Assets
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'complete'): void
}>()

const isVisible = ref(true)

onMounted(async () => {
  if (!import.meta.client) return

  // Dynamically import GSAP
  const { gsap } = await import('gsap')
  
  const tl = gsap.timeline({
    onComplete: () => {
      // Smoothly fade out & slide up preloader
      gsap.to('.preloader-overlay', {
        opacity: 0,
        yPercent: -10,
        duration: 0.9,
        ease: 'power4.inOut',
        onComplete: () => {
          isVisible.value = false
          emit('complete')
        }
      })
    }
  })

  // 1. Configure initial invisible states
  gsap.set('.aperture-container', { autoAlpha: 0, scale: 0.85 })
  gsap.set('.preloader-logo h1', { autoAlpha: 0, y: 18 })
  gsap.set('.preloader-sub', { autoAlpha: 0, y: 12 })
  gsap.set('.progress-wrap', { autoAlpha: 0, y: 10 })

  // 2. Animate Aperture Camera Shutter
  tl.to('.aperture-container', {
    autoAlpha: 1,
    scale: 1,
    duration: 0.7,
    ease: 'power3.out'
  })
  
  tl.to('.outer-ring', {
    strokeDashoffset: 0,
    duration: 1.2,
    ease: 'power2.inOut'
  }, '<')

  tl.to('.aperture-container svg', {
    rotate: 45,
    duration: 1.8,
    ease: 'sine.inOut'
  }, '<')

  // 3. Reveal Logo Title & Subtitle cleanly
  tl.to('.preloader-logo h1', {
    autoAlpha: 1,
    y: 0,
    duration: 0.7,
    ease: 'power3.out'
  }, '-=0.8')

  tl.to('.preloader-sub', {
    autoAlpha: 1,
    y: 0,
    duration: 0.6,
    ease: 'power3.out'
  }, '-=0.5')

  // 4. Reveal Progress Block
  tl.to('.progress-wrap', {
    autoAlpha: 1,
    y: 0,
    duration: 0.5,
    ease: 'power2.out'
  }, '-=0.4')

  // 5. Fill progress bar & update counter
  const counterObj = { val: 0 }
  tl.to(counterObj, {
    val: 100,
    duration: 1.4,
    ease: 'power2.inOut',
    onUpdate: () => {
      const numEl = document.querySelector('.counter-num')
      if (numEl) {
        const currentNum = Math.floor(counterObj.val)
        numEl.textContent = currentNum < 10 ? `0${currentNum}` : `${currentNum}`
      }
    }
  }, '-=0.5')

  tl.to('.progress-bar', {
    width: '100%',
    duration: 1.4,
    ease: 'power2.inOut'
  }, '<')

  // Brief pause at 100%
  tl.to({}, { duration: 0.25 })
})
</script>

<style scoped>
.blade-line {
  stroke-dasharray: 80;
  stroke-dashoffset: 80;
  animation: draw-blade 1.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  animation-delay: 0.15s;
  opacity: 0.85;
}

@keyframes draw-blade {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
