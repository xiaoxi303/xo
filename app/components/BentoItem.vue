<template>
  <!-- Single Bento card with 3D tilt hover micro-interaction -->
  <div
    ref="cardRef"
    :class="[
      'glass-card overflow-hidden group relative bento-tilt-card',
      to ? 'cursor-pointer' : 'cursor-default',
      colSpanClass
    ]"
    :style="tiltStyle"
    @mouseenter="onMouseEnter"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @click="handleClick"
  >
    <!-- Shine overlay follows cursor -->
    <div
      class="absolute inset-0 pointer-events-none z-10 rounded-[inherit] transition-opacity duration-300"
      :style="shineStyle"
    />
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  /**
   * Number of columns to span at each breakpoint.
   * Format: 'default:md:lg' e.g. '12:6:4'
   */
  span?: string
  /**
   * Optional target route for navigation on click
   */
  to?: string
}>(), {
  span: '12:6:4',
  to: undefined
})

const cardRef = ref<HTMLElement | null>(null)
const rotateX = ref(0)
const rotateY = ref(0)
const shineX = ref(50)
const shineY = ref(50)
const isHovered = ref(false)
let animationFrameId: number | null = null

// Static map to ensure Tailwind scan picks up whole literal class strings
const spanMap: Record<string, string> = {
  '12:6:8': 'col-span-12 md:col-span-6 lg:col-span-8',
  '12:6:4': 'col-span-12 md:col-span-6 lg:col-span-4',
  '12:12:8': 'col-span-12 md:col-span-12 lg:col-span-8',
}

const colSpanClass = computed(() => {
  return spanMap[props.span] || 'col-span-12'
})

const tiltStyle = computed(() => ({
  transform: isHovered.value
    ? `perspective(900px) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg) scale3d(1.018, 1.018, 1.018)`
    : 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
  transition: isHovered.value
    ? 'transform 0.12s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s ease'
    : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s ease',
  willChange: 'transform',
  backfaceVisibility: 'hidden' as const
}))

const shineStyle = computed(() => ({
  background: isHovered.value
    ? `radial-gradient(480px circle at ${shineX.value}% ${shineY.value}%, rgba(255,255,255,0.14) 0%, rgba(217,119,6,0.06) 40%, transparent 80%)`
    : 'none',
  opacity: isHovered.value ? 1 : 0,
}))

const onMouseEnter = () => {
  isHovered.value = true
}

const onMouseMove = (e: MouseEvent) => {
  if (!cardRef.value) return
  
  // Cancel any pending animation frame
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  
  // Use requestAnimationFrame for smoother updates
  animationFrameId = requestAnimationFrame(() => {
    const rect = cardRef.value!.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    const halfW = rect.width / 2
    const halfH = rect.height / 2
    rotateY.value = ((cx - halfW) / halfW) * 6
    rotateX.value = -((cy - halfH) / halfH) * 6
    shineX.value = (cx / rect.width) * 100
    shineY.value = (cy / rect.height) * 100
  })
}

const onMouseLeave = () => {
  isHovered.value = false
  rotateX.value = 0
  rotateY.value = 0
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

import { recordProjectClickEvent } from '~/utils/analytics'

const handleClick = (e: MouseEvent) => {
  e.stopPropagation()
  e.preventDefault()
  
  if (props.to && props.to.startsWith('/projects/')) {
    recordProjectClickEvent(props.to)
  }

  if (props.to) {
    navigateTo(props.to)
  }
}
</script>