<template>
  <div
    v-if="isVisible"
    class="preloader-overlay fixed inset-0 z-[999] flex flex-col items-center justify-center pointer-events-auto"
    style="background-color: var(--color-bg);"
  >
    <!-- Background grid lines for quiet luxury paper print aesthetic -->
    <div
      class="absolute inset-0 opacity-[0.03] pointer-events-none"
      style="background-image: linear-gradient(var(--color-ink-1) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink-1) 1px, transparent 1px); background-size: 32px 32px;"
    />

    <!-- Cinematic Aperture / Shutter Icon -->
    <div class="aperture-container mb-8 relative flex items-center justify-center opacity-0">
      <svg
        class="w-16 h-16 text-amber-800/80 transform rotate-[-45deg] scale-90"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        stroke-width="1.2"
      >
        <!-- Outer perfect circle -->
        <circle cx="50" cy="50" r="46" class="outer-ring" stroke-dasharray="290" stroke-dashoffset="290" />
        
        <!-- Shutter blades lines -->
        <path d="M 50 4  L 20 40" class="blade-line" />
        <path d="M 96 50 L 60 20" class="blade-line" />
        <path d="M 50 96 L 80 60" class="blade-line" />
        <path d="M 4  50 L 40 80" class="blade-line" />
        
        <path d="M 20 40 L 40 30" class="blade-line" />
        <path d="M 60 20 L 70 50" class="blade-line" />
        <path d="M 80 60 L 60 70" class="blade-line" />
        <path d="M 40 80 L 30 50" class="blade-line" />

        <!-- Center aperture opening -->
        <polygon points="40,30 70,50 60,70 30,50" class="iris-polygon" fill="rgba(180, 83, 9, 0.05)" />
      </svg>

      <!-- Shading light beam -->
      <div class="absolute w-24 h-24 rounded-full bg-amber-500/10 blur-xl scale-75 animate-pulse" />
    </div>

    <!-- Brand Typography Container -->
    <div class="text-center space-y-4">
      <div class="preloader-logo overflow-hidden h-12 md:h-16 flex items-center justify-center">
        <h1
          class="font-display text-4xl md:text-6xl font-bold tracking-[0.25em] uppercase leading-none opacity-0 translate-y-full"
          style="color: var(--color-ink-1);"
        >
          Xo Studio
        </h1>
      </div>
      
      <div class="preloader-sub overflow-hidden py-1">
        <p
          class="text-[9px] font-mono tracking-[0.3em] uppercase opacity-0 translate-y-full"
          style="color: var(--color-brand-accent);"
        >
          Cinematic Post-Production & Color Science
        </p>
      </div>
    </div>

    <!-- Fine Luxury Progress Indicator -->
    <div class="progress-wrap flex flex-col items-center mt-12 opacity-0">
      <!-- Fine progress track and fill -->
      <div class="w-48 h-[1px] bg-black/[0.06] relative overflow-hidden rounded-full">
        <div class="progress-bar absolute left-0 top-0 h-full w-0" style="background-color: var(--color-brand-accent);" />
      </div>

      <!-- Live Loading Counter -->
      <div class="mt-3 text-[10px] font-mono tracking-[0.18em]" style="color: var(--color-ink-4);">
        <span class="counter-num">00</span>%
      </div>
    </div>

    <!-- Subtle bottom copyright / indicator -->
    <div class="absolute bottom-10 text-[8px] font-mono tracking-[0.2em] opacity-40 uppercase">
      Loading Assets
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

  // Load GSAP dynamically
  const { gsap } = await import('gsap')
  
  const tl = gsap.timeline({
    onComplete: () => {
      // Fade out and translate the preloader overlay when done
      gsap.to('.preloader-overlay', {
        opacity: 0,
        yPercent: -15,
        duration: 1.1,
        ease: 'power4.inOut',
        onComplete: () => {
          isVisible.value = false
          emit('complete')
        }
      })
    }
  })

  // 1. Initial State configuration (prevent flashing)
  gsap.set('.aperture-container', { opacity: 0, scale: 0.85 })
  gsap.set('.preloader-logo h1', { yPercent: 100, opacity: 0 })
  gsap.set('.preloader-sub p', { yPercent: 100, opacity: 0 })
  gsap.set('.progress-wrap', { opacity: 0, y: 15 })

  // 2. Animate Aperture Circle Drawing
  tl.to('.aperture-container', {
    opacity: 1,
    scale: 1,
    duration: 0.9,
    ease: 'power3.out'
  })
  
  tl.to('.outer-ring', {
    strokeDashoffset: 0,
    duration: 1.4,
    ease: 'power2.inOut'
  }, '<')

  // Rotate the aperture gently
  tl.to('.aperture-container svg', {
    rotate: 45,
    duration: 2.2,
    ease: 'sine.inOut'
  }, '<')

  // 3. Stagger reveal logo & subtext
  tl.to('.preloader-logo h1', {
    yPercent: 0,
    opacity: 1,
    duration: 0.9,
    ease: 'power4.out'
  }, '-=1.1')

  tl.to('.preloader-sub p', {
    yPercent: 0,
    opacity: 1,
    duration: 0.8,
    ease: 'power4.out'
  }, '-=0.75')

  // 4. Fade in progress indicator
  tl.to('.progress-wrap', {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power2.out'
  }, '-=0.6')

  // 5. Fill progress bar & increment counter synchronously
  const counterObj = { val: 0 }
  tl.to(counterObj, {
    val: 100,
    duration: 1.8,
    ease: 'power3.inOut',
    onUpdate: () => {
      const numEl = document.querySelector('.counter-num')
      if (numEl) {
        const currentNum = Math.floor(counterObj.val)
        numEl.textContent = currentNum < 10 ? `0${currentNum}` : `${currentNum}`
      }
    }
  }, '-=0.8')

  tl.to('.progress-bar', {
    width: '100%',
    duration: 1.8,
    ease: 'power3.inOut'
  }, '<')

  // Quick pause at 100% to let visual settle
  tl.to({}, { duration: 0.3 })
})
</script>

<style scoped>
.blade-line {
  stroke-dasharray: 80;
  stroke-dashoffset: 80;
  animation: draw-blade 1.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  animation-delay: 0.2s;
  opacity: 0.8;
}

@keyframes draw-blade {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
