<template>
  <div class="default-art-poster relative w-full h-full overflow-hidden select-none font-sans flex flex-col justify-between p-6 md:p-8"
       style="background: #f4efdf; color: #222;">
    <!-- Grid Line Background -->
    <div class="poster-grid absolute inset-0 opacity-15 pointer-events-none"
         style="background-image: linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px); background-size: 24px 24px;" />
    <div class="poster-scan absolute inset-0 pointer-events-none" />

    <!-- Top Decorative Line & Color Blocks -->
    <div class="relative z-10 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-12 h-[3px] bg-neutral-800" />
        <div class="w-2 h-2 rotate-45 bg-rose-400" />
      </div>
      <!-- Color Bars Array -->
      <div class="flex flex-col gap-1.5 items-end">
        <div class="poster-bar w-24 h-1.5 bg-rose-400 rounded-full flex items-center justify-end pr-0.5">
          <div class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
        <div class="poster-bar poster-bar-delay w-32 h-1.5 bg-emerald-300 rounded-full flex items-center justify-end pr-0.5">
          <div class="w-1.5 h-1.5 rounded-full bg-sky-400" />
        </div>
        <div class="poster-bar poster-bar-slow w-20 h-1.5 bg-sky-400 rounded-full flex items-center justify-end pr-0.5">
          <div class="w-1.5 h-1.5 rounded-full bg-amber-400" />
        </div>
      </div>
    </div>

    <!-- Center Typography & Number Block -->
    <div class="relative z-10 my-auto py-2">
      <div class="flex items-baseline gap-4">
        <span class="font-display font-black text-6xl md:text-7xl tracking-tighter leading-none text-neutral-900" style="font-size: clamp(3.5rem, 8vw, 6rem);">
          {{ displayIndex }}
        </span>
        <div class="space-y-0.5">
          <span v-if="category" class="text-[10px] font-mono tracking-widest uppercase block text-neutral-500 font-bold">
            {{ category }}
          </span>
          <span class="text-xs font-mono text-neutral-600 block">Autoplay Visuals</span>
        </div>
      </div>

      <!-- Main Title -->
      <h3 class="font-display font-extrabold text-3xl md:text-4xl text-neutral-900 tracking-tight mt-1 leading-tight line-clamp-1">
        {{ title || '创意视频' }}
      </h3>
      <p class="text-xs font-mono uppercase tracking-widest text-neutral-500 mt-0.5">
        {{ englishSub }}
      </p>
    </div>

    <!-- Bottom Abstract Oval & Lines & Subtitle -->
    <div class="relative z-10 flex items-end justify-between pt-4 border-t border-neutral-900/10">
      <p class="text-[11px] font-sans text-neutral-600 max-w-[260px] leading-relaxed line-clamp-2">
        {{ description || '用创意点亮灵感，用镜头讲述故事，让每一个帧率都成为打动人心的瞬间。' }}
      </p>

      <!-- Minimal Capsule Accent -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <div class="w-8 h-4 rounded-full bg-neutral-900" />
        <div class="w-16 h-1.5 bg-neutral-300 rounded-full" />
      </div>
    </div>

    <!-- Abstract SVG Flow Line Graphic (Overlaid) -->
    <svg class="poster-flow absolute bottom-2 right-4 w-48 h-24 opacity-25 pointer-events-none overflow-visible" viewBox="0 0 200 100" fill="none">
      <path d="M 10 80 Q 80 -20 180 60 T 40 90" stroke="#111" stroke-width="1.5" fill="none" />
      <ellipse cx="140" cy="70" rx="35" ry="18" stroke="#111" stroke-width="1.2" transform="rotate(-15 140 70)" fill="none" />
      <rect x="110" y="55" width="25" height="4" fill="#333" />
      <circle cx="140" cy="57" r="2.5" fill="#f43f5e" />
    </svg>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  index?: number | string
  category?: string
  description?: string
}>(), {
  title: '创意视频',
  index: '01',
  category: '',
  description: '用创意点亮灵感，用镜头讲述故事，让每一个帧率都成为打动人心的瞬间。'
})

const displayIndex = computed(() => {
  if (typeof props.index === 'number') {
    return props.index < 10 ? `0${props.index}` : `${props.index}`
  }
  return props.index || '01'
})

const englishSub = computed(() => {
  return props.category ? props.category.toUpperCase() : 'PORTFOLIO'
})
</script>

<style scoped>
.poster-grid {
  animation: poster-grid-drift 18s linear infinite;
}

.poster-scan {
  background: linear-gradient(105deg, transparent 0 42%, rgba(255,255,255,0.26) 48%, transparent 54% 100%);
  transform: translateX(-120%);
  animation: poster-scan 5.8s ease-in-out infinite;
}

.poster-bar {
  transform-origin: right center;
  animation: poster-bar-float 3.8s ease-in-out infinite;
}

.poster-bar-delay {
  animation-delay: 0.35s;
}

.poster-bar-slow {
  animation-delay: 0.7s;
  animation-duration: 4.4s;
}

.poster-flow {
  animation: poster-flow-drift 6s ease-in-out infinite alternate;
}

@keyframes poster-grid-drift {
  from { background-position: 0 0, 0 0; }
  to { background-position: 24px 24px, 24px 24px; }
}

@keyframes poster-scan {
  0%, 48% { transform: translateX(-120%); opacity: 0; }
  58% { opacity: 0.55; }
  74%, 100% { transform: translateX(120%); opacity: 0; }
}

@keyframes poster-bar-float {
  0%, 100% { transform: translateX(0) scaleX(1); }
  50% { transform: translateX(-10px) scaleX(0.88); }
}

@keyframes poster-flow-drift {
  from { transform: translate(0, 0) rotate(0deg); }
  to { transform: translate(-14px, -5px) rotate(-2deg); }
}
</style>
