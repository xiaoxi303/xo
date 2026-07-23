<template>
  <div class="default-art-poster relative w-full h-full overflow-hidden select-none font-sans flex flex-col justify-between p-4 md:p-6"
       style="background: #f4efdf; color: #222;">
    <!-- Grid Line Background -->
    <div class="poster-grid absolute inset-0 opacity-15 pointer-events-none"
         style="background-image: linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px); background-size: 20px 20px;" />
    <div class="poster-scan absolute inset-0 pointer-events-none" />

    <!-- Top Decorative Line & Color Blocks -->
    <div class="relative z-10 flex items-center justify-between">
      <div class="flex items-center gap-1.5">
        <div class="w-8 md:w-10 h-[2px] bg-neutral-800" />
        <div class="w-1.5 h-1.5 rotate-45 bg-rose-400" />
      </div>
      <!-- Color Bars Array -->
      <div class="flex flex-col gap-1 items-end">
        <div class="poster-bar w-16 md:w-20 h-1 bg-rose-400 rounded-full flex items-center justify-end pr-0.5">
          <div class="w-1 h-1 rounded-full bg-emerald-400" />
        </div>
        <div class="poster-bar poster-bar-delay w-24 md:w-28 h-1 bg-emerald-300 rounded-full flex items-center justify-end pr-0.5">
          <div class="w-1 h-1 rounded-full bg-sky-400" />
        </div>
        <div class="poster-bar poster-bar-slow w-14 md:w-16 h-1 bg-sky-400 rounded-full flex items-center justify-end pr-0.5">
          <div class="w-1 h-1 rounded-full bg-amber-400" />
        </div>
      </div>
    </div>

    <!-- Center Typography & Number Block -->
    <div class="relative z-10 my-auto py-1 space-y-1">
      <div class="flex items-baseline gap-3">
        <span class="font-display font-black tracking-tighter leading-none text-neutral-900" :style="{ fontSize: numberFontSize }">
          {{ displayIndex }}
        </span>
        <div class="space-y-0.5">
          <span v-if="category" class="text-[9px] md:text-[10px] font-mono tracking-widest uppercase block text-neutral-500 font-bold">
            {{ category }}
          </span>
          <span class="text-[10px] font-mono text-neutral-600 block">Autoplay Visuals</span>
        </div>
      </div>

      <!-- Main Title -->
      <h3 class="font-display font-extrabold text-2xl md:text-3xl text-neutral-900 tracking-tight leading-tight line-clamp-1">
        {{ title || '创意视频' }}
      </h3>
      <p class="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
        {{ englishSub }}
      </p>
    </div>

    <!-- Bottom Abstract Oval & Lines & Subtitle (Always visible!) -->
    <div class="relative z-10 flex items-end justify-between pt-2 border-t border-neutral-900/15">
      <p class="text-[10px] md:text-[11px] font-sans text-neutral-700 max-w-[80%] leading-snug line-clamp-2">
        {{ description || '用创意点亮灵感，用镜头讲述故事，让每一个帧率都成为打动人心的瞬间。' }}
      </p>

      <!-- Minimal Capsule Accent -->
      <div class="flex items-center gap-1.5 flex-shrink-0">
        <div class="w-6 h-3 rounded-full bg-neutral-900" />
        <div class="w-10 h-1 bg-neutral-300 rounded-full" />
      </div>
    </div>

    <!-- Abstract SVG Flow Line Graphic (Overlaid) -->
    <svg class="poster-flow absolute bottom-1 right-2 w-36 h-20 opacity-20 pointer-events-none overflow-visible" viewBox="0 0 200 100" fill="none">
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
  const val = props.index !== undefined && props.index !== '' ? props.index : '01'
  if (typeof val === 'number') {
    return val < 10 ? `0${val}` : `${val}`
  }
  const str = String(val).trim()
  const num = parseInt(str, 10)
  if (!isNaN(num) && String(num) === str) {
    return num < 10 ? `0${num}` : `${num}`
  }
  return str || '01'
})

const numberFontSize = computed(() => {
  const len = String(displayIndex.value || '').length
  if (len >= 3) return 'clamp(1.8rem, 4vw, 3.2rem)'
  return 'clamp(2.5rem, 5vw, 4.5rem)'
})

const englishSub = computed(() => {
  return props.category ? props.category.toUpperCase() : 'PORTFOLIO'
})
</script>

<style scoped>
.poster-grid {
  mask-image: radial-gradient(circle at center, black 60%, transparent 100%);
}
@keyframes posterScan {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}
.poster-scan {
  background: linear-gradient(180deg, transparent 0%, rgba(180,83,9,0.06) 50%, transparent 100%);
  animation: posterScan 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.poster-bar {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
  animation: posterPulse 3.5s ease-in-out infinite alternate;
}
.group:hover .poster-bar {
  transform: scaleX(1.1) translateX(-2px);
}
.poster-bar-delay {
  animation-delay: 0.8s;
}
.poster-bar-slow {
  animation-delay: 1.6s;
}
@keyframes posterPulse {
  0% { transform: scaleX(0.92); opacity: 0.85; }
  100% { transform: scaleX(1.08); opacity: 1; }
}

.default-art-poster h3 {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), color 0.3s ease;
}
.group:hover .default-art-poster h3 {
  transform: translateX(4px);
  color: var(--color-bronze, #b45309);
}

.default-art-poster .font-black {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.group:hover .default-art-poster .font-black {
  transform: scale(1.05) translateY(-2px);
}
</style>
