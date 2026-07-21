<template>
  <!-- LQIP blur-up image component or Generative Art Poster fallback -->
  <div
    ref="containerRef"
    class="relative overflow-hidden bg-slate-900 w-full h-full"
    :style="{ borderRadius: 'inherit' }"
  >
    <!-- Fallback Generative Art Poster when no image URL provided or error occurs -->
    <DefaultArtPoster
      v-if="!src || !src.trim() || hasError"
      :title="title || alt || '创意视频'"
      :index="index || '01'"
      :category="category"
      :description="description"
      class="w-full h-full"
    />

    <template v-else>
      <!-- Low Quality Placeholder (blurred) -->
      <img
        v-if="lqipSrc"
        :src="lqipSrc"
        aria-hidden="true"
        class="absolute inset-0 w-full h-full object-cover scale-110 pointer-events-none select-none"
        :style="{
          filter: 'blur(20px)',
          transition: 'opacity 0.6s ease',
          opacity: isLoaded ? 0 : 1
        }"
      />

      <!-- Skeleton shimmer -->
      <div
        v-if="!isLoaded"
        class="absolute inset-0 skeleton-shimmer"
      />

      <!-- High quality image -->
      <img
        v-if="isInView"
        :src="src"
        :alt="alt || ''"
        class="relative w-full h-full object-cover"
        :style="{
          transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'scale(1)' : 'scale(1.04)'
        }"
        @load="onLoaded"
        @error="onError"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  src?: string
  alt?: string
  lqip?: string
  title?: string
  index?: number | string
  category?: string
  description?: string
}>(), {
  src: '',
  alt: '',
})

const containerRef = ref<HTMLElement | null>(null)
const isLoaded = ref(false)
const isInView = ref(false)
const hasError = ref(false)

const lqipSrc = computed(() => {
  if (props.lqip) return props.lqip
  return props.src
})

const onLoaded = () => {
  isLoaded.value = true
}

const onError = () => {
  hasError.value = true
  isLoaded.value = true
}

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        isInView.value = true
        observer.disconnect()
      }
    },
    { rootMargin: '200px' }
  )
  if (containerRef.value) observer.observe(containerRef.value)
})
</script>

<style scoped>
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.03) 25%,
    rgba(255,255,255,0.07) 50%,
    rgba(255,255,255,0.03) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}
</style>
