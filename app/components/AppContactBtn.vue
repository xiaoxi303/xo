<template>
  <a
    ref="btnRef"
    :href="href"
    :class="[
      'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-bold tracking-wide transition-all duration-300 select-none group shadow-md cursor-pointer text-xs',
      customClass || 'px-6 py-2.5 text-white bg-slate-900 border border-white/10'
    ]"
    :style="{
      '--x': `${mouseX}px`,
      '--y': `${mouseY}px`
    }"
    @mouseenter="handleMouseEnter"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <!-- 1. Cursor Origin Expanding Ripple Wave (Triggers on Mouse Enter) -->
    <span
      v-if="animatingRipple"
      key="ripple"
      class="pointer-events-none absolute rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 animate-ripple-out opacity-90"
      :style="{
        left: `${rippleX}px`,
        top: `${rippleY}px`,
        width: '320px',
        height: '320px'
      }"
    />

    <!-- 2. Continuous Real-Time Cursor Tracking Spotlight Fill -->
    <span
      class="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-300"
      :style="{
        opacity: isHovered ? 1 : 0,
        background: 'radial-gradient(130px circle at var(--x, 50%) var(--y, 50%), #f59e0b 0%, #d97706 45%, #b45309 80%, #78350f 100%)'
      }"
    />

    <!-- 3. Ambient Glow Shadow following cursor -->
    <span
      class="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-300 blur-sm"
      :style="{
        opacity: isHovered ? 0.8 : 0,
        background: 'radial-gradient(90px circle at var(--x, 50%) var(--y, 50%), rgba(254, 240, 138, 0.7) 0%, transparent 80%)'
      }"
    />

    <!-- Content slot with icon -->
    <span class="relative z-10 flex items-center gap-2 transition-colors duration-200" :class="isHovered ? 'text-white' : ''">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        class="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 opacity-95"
      >
        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
      </svg>
      <slot>
        <span class="tracking-[0.08em] font-sans">联系我</span>
      </slot>
    </span>
  </a>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  href?: string
  customClass?: string
}>(), {
  href: 'mailto:hello@xo.dev',
  customClass: ''
})

const btnRef = ref<HTMLElement | null>(null)
const mouseX = ref(50)
const mouseY = ref(20)
const rippleX = ref(50)
const rippleY = ref(20)
const isHovered = ref(false)
const animatingRipple = ref(false)
let rippleTimer: any = null

const handleMouseEnter = (e: MouseEvent) => {
  if (!btnRef.value) return
  const rect = btnRef.value.getBoundingClientRect()
  const rx = e.clientX - rect.left
  const ry = e.clientY - rect.top

  mouseX.value = rx
  mouseY.value = ry
  rippleX.value = rx
  rippleY.value = ry

  // Restart ripple animation from entry point
  animatingRipple.value = false
  if (rippleTimer) clearTimeout(rippleTimer)
  nextTick(() => {
    animatingRipple.value = true
    isHovered.value = true
    rippleTimer = setTimeout(() => {
      animatingRipple.value = false
    }, 1100)
  })
}

const handleMouseMove = (e: MouseEvent) => {
  if (!btnRef.value) return
  const rect = btnRef.value.getBoundingClientRect()
  mouseX.value = e.clientX - rect.left
  mouseY.value = e.clientY - rect.top
  if (!isHovered.value) isHovered.value = true
}

const handleMouseLeave = (e: MouseEvent) => {
  if (btnRef.value) {
    const rect = btnRef.value.getBoundingClientRect()
    mouseX.value = e.clientX - rect.left
    mouseY.value = e.clientY - rect.top
  }
  isHovered.value = false
  animatingRipple.value = false
}
</script>

<style scoped>
@keyframes rippleExpand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.7;
  }
  50% {
    opacity: 0.95;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.8);
    opacity: 1;
  }
}

.animate-ripple-out {
  animation: rippleExpand 1.1s cubic-bezier(0.2, 1, 0.3, 1) forwards;
}
</style>
