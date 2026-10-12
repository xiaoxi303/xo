<template>
  <div
    class="default-art-poster relative w-full h-full overflow-hidden select-none font-sans flex flex-col justify-between p-4 md:p-6 transition-colors duration-500"
    :class="theme === 'linen' ? 'poster-linen' : 'poster-cinema'"
  >
    <!-- Background Texture & Ambient Glows (Cinema Mode) -->
    <template v-if="theme !== 'linen'">
      <div class="absolute inset-0 bg-gradient-to-br from-[#07090e] via-[#0d1017] to-[#14101c] pointer-events-none" />
      <div
        class="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none blur-3xl opacity-30"
        style="background: radial-gradient(circle, rgba(217,119,6,0.6) 0%, transparent 70%);"
      />
      <div
        class="absolute -bottom-10 -left-10 w-48 h-48 rounded-full pointer-events-none blur-3xl opacity-20"
        style="background: radial-gradient(circle, rgba(147,51,234,0.5) 0%, transparent 70%);"
      />
      <!-- Subtle Anamorphic Scope Line -->
      <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-amber-500/15 to-transparent pointer-events-none" />
      <!-- DaVinci 2.39:1 Framing Crosshairs -->
      <div class="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
        <div class="w-3 h-3 relative">
          <span class="absolute top-1/2 left-0 right-0 h-px bg-white" />
          <span class="absolute left-1/2 top-0 bottom-0 w-px bg-white" />
        </div>
        <div class="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-white" />
        <div class="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-white" />
        <div class="absolute bottom-3 left-3 w-2.5 h-2.5 border-b border-l border-white" />
        <div class="absolute bottom-3 right-3 w-2.5 h-2.5 border-b border-r border-white" />
      </div>
    </template>

    <!-- Background Grid (Linen Mode) -->
    <template v-else>
      <div
        class="poster-grid absolute inset-0 opacity-15 pointer-events-none"
        style="background-image: linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px); background-size: 20px 20px;"
      />
      <div class="poster-scan absolute inset-0 pointer-events-none" />
    </template>

    <!-- Top Bar: Cinema SMPTE Readout or Linen Decorative Lines -->
    <div class="relative z-10 flex items-center justify-between">
      <!-- Left: Indicator -->
      <div class="flex items-center gap-2">
        <span
          class="w-2 h-2 rounded-full animate-pulse"
          :class="theme === 'linen' ? 'bg-rose-500' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'"
        />
        <span
          class="text-[9px] font-mono tracking-widest uppercase font-bold"
          :class="theme === 'linen' ? 'text-neutral-800' : 'text-slate-300'"
        >
          {{ theme === 'linen' ? '工作室放映' : '电影级母带' }}
        </span>
      </div>

      <!-- Right: Live SMPTE Timecode Pill -->
      <div
        class="flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[9px] font-bold"
        :class="theme === 'linen' ? 'bg-black/5 text-neutral-700 border border-black/10' : 'bg-white/10 text-amber-300 border border-white/15 backdrop-blur-md'"
      >
        <span>TC 01:24:08:{{ displayIndex }}</span>
      </div>
    </div>

    <!-- Center Typography & Slate Number -->
    <div class="relative z-10 my-auto py-2 space-y-1">
      <div class="flex items-baseline gap-3">
        <span
          class="font-display font-black tracking-tighter leading-none"
          :class="theme === 'linen' ? 'text-neutral-900' : 'text-gradient drop-shadow-md'"
          :style="{ fontSize: numberFontSize }"
        >
          {{ displayIndex }}
        </span>
        <div class="space-y-0.5">
          <span
            v-if="category"
            class="text-[9px] md:text-[10px] font-mono tracking-widest uppercase block font-bold"
            :class="theme === 'linen' ? 'text-neutral-500' : 'text-amber-400/90'"
          >
            {{ category }}
          </span>
          <span
            class="text-[9px] font-mono block"
            :class="theme === 'linen' ? 'text-neutral-600' : 'text-slate-400'"
          >
            母带放映
          </span>
        </div>
      </div>

      <!-- Main Film Title -->
      <h3
        class="font-display font-extrabold text-xl md:text-2xl lg:text-3xl tracking-tight leading-tight line-clamp-1"
        :class="theme === 'linen' ? 'text-neutral-900' : 'text-white drop-shadow-sm'"
      >
        {{ title || '精选视频项目' }}
      </h3>
      <p
        class="text-[9px] font-mono uppercase tracking-widest"
        :class="theme === 'linen' ? 'text-neutral-500' : 'text-slate-400'"
      >
        {{ englishSub }}
      </p>
    </div>

    <!-- Bottom Meta Readout -->
    <div
      class="relative z-10 flex items-end justify-between pt-2 border-t"
      :class="theme === 'linen' ? 'border-neutral-900/15 text-neutral-700' : 'border-white/10 text-slate-300'"
    >
      <p class="text-[10px] md:text-[11px] font-sans max-w-[80%] leading-snug line-clamp-2">
        {{ description || '融合极致的镜头节奏与达芬奇电影级色彩科学，微雕视听艺术。' }}
      </p>

      <!-- Minimal Status Capsule -->
      <div class="flex items-center gap-1.5 flex-shrink-0 font-mono text-[9px] font-bold text-amber-400/80">
        <span>HDR 1000</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  index?: number | string
  category?: string
  description?: string
  theme?: 'cinema' | 'linen'
}>(), {
  title: '精选视频项目',
  index: '01',
  category: '',
  description: '融合极致的镜头节奏与达芬奇电影级色彩科学，微雕视听艺术。',
  theme: 'cinema'
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
  return 'clamp(2.4rem, 5vw, 4.2rem)'
})

const englishSub = computed(() => {
  return props.category ? props.category : '影视后期母带'
})
</script>

<style scoped>
.poster-linen {
  background: #f4efdf;
  color: #222;
}

.poster-cinema {
  background: #080a10;
  color: #f1f5f9;
}

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

.default-art-poster h3 {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), color 0.3s ease;
}

.group:hover .default-art-poster h3 {
  transform: translateX(3px);
  color: var(--color-bronze, #d97706);
}
</style>
