<template>
  <div
    class="default-art-poster relative w-full h-full overflow-hidden select-none font-sans flex flex-col justify-between p-4 md:p-6 transition-all duration-700 group/poster"
    :class="theme === 'linen' ? 'poster-linen' : 'poster-cinema'"
  >
    <!-- Background Texture & Ambient Glows (Cinema Mode) -->
    <template v-if="theme !== 'linen'">
      <!-- Deep Cinematic Velvet Base -->
      <div class="absolute inset-0 bg-gradient-to-br from-[#0a0d14] via-[#111622] to-[#181124] pointer-events-none" />

      <!-- Dynamic Flowing Ambient Aurora Glows -->
      <div
        class="poster-aurora-1 absolute -top-16 -right-16 w-72 h-72 rounded-full pointer-events-none blur-3xl opacity-60"
        style="background: radial-gradient(circle, rgba(217,119,6,0.65) 0%, rgba(245,158,11,0.3) 45%, transparent 70%);"
      />
      <div
        class="poster-aurora-2 absolute -bottom-16 -left-16 w-72 h-72 rounded-full pointer-events-none blur-3xl opacity-50"
        style="background: radial-gradient(circle, rgba(147,51,234,0.55) 0%, rgba(217,119,6,0.25) 50%, transparent 75%);"
      />

      <!-- Anamorphic Sweeping Lens Light Beam -->
      <div class="poster-anamorphic-beam absolute inset-0 pointer-events-none" />

      <!-- Film Grain / Scan Grid Texture -->
      <div
        class="absolute inset-0 opacity-20 pointer-events-none"
        style="background-image: radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px); background-size: 16px 16px;"
      />

      <!-- DaVinci 2.39:1 Framing Crosshairs Guides -->
      <div class="absolute inset-0 pointer-events-none opacity-30 flex items-center justify-center">
        <div class="w-4 h-4 relative">
          <span class="absolute top-1/2 left-0 right-0 h-px bg-white/80" />
          <span class="absolute left-1/2 top-0 bottom-0 w-px bg-white/80" />
        </div>
        <div class="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-white/40" />
        <div class="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-white/40" />
        <div class="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-white/40" />
        <div class="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-white/40" />
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

    <!-- Top Bar: Cinema SMPTE Live Readout -->
    <div class="relative z-10 flex items-center justify-between">
      <!-- Left: Indicator Badge -->
      <div class="flex items-center gap-2">
        <span
          class="w-2 h-2 rounded-full animate-ping"
          :class="theme === 'linen' ? 'bg-rose-500' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)]'"
        />
        <span
          class="text-[9px] font-mono tracking-widest uppercase font-bold"
          :class="theme === 'linen' ? 'text-neutral-800' : 'text-slate-200 drop-shadow-xs'"
        >
          {{ theme === 'linen' ? '工作室放映' : '电影级母带 · 4K DCI' }}
        </span>
      </div>

      <!-- Right: Live SMPTE Timecode Pill with Live Ticking Frame Counter -->
      <div
        class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold shadow-md"
        :class="theme === 'linen' ? 'bg-black/5 text-neutral-700 border border-black/10' : 'bg-black/60 text-amber-300 border border-amber-500/30 backdrop-blur-md'"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>TC 01:24:08:{{ String(tcFrames).padStart(2, '0') }}</span>
      </div>
    </div>

    <!-- Center Typography & Dynamic Interactive Slate -->
    <div class="relative z-10 my-auto py-2 space-y-1.5">
      <div class="flex items-baseline gap-3">
        <span
          class="font-display font-black tracking-tighter leading-none transition-transform duration-500 group-hover/poster:scale-105"
          :class="theme === 'linen' ? 'text-neutral-900' : 'text-gradient drop-shadow-lg'"
          :style="{ fontSize: numberFontSize }"
        >
          {{ displayIndex }}
        </span>
        <div class="space-y-0.5">
          <span
            v-if="category"
            class="text-[9px] md:text-[10px] font-mono tracking-widest uppercase block font-bold"
            :class="theme === 'linen' ? 'text-neutral-500' : 'text-amber-300'"
          >
            {{ category }}
          </span>
          <span
            class="text-[9px] font-mono block"
            :class="theme === 'linen' ? 'text-neutral-600' : 'text-slate-300'"
          >
            母带放映 · ACEScct
          </span>
        </div>
      </div>

      <!-- Main Film Title with Glow -->
      <h3
        class="font-display font-extrabold text-xl md:text-2xl lg:text-3xl tracking-tight leading-tight line-clamp-1 transition-colors duration-300"
        :class="theme === 'linen' ? 'text-neutral-900' : 'text-white drop-shadow-md group-hover/poster:text-amber-200'"
      >
        {{ title || '精选视频项目' }}
      </h3>
      <p
        class="text-[9px] font-mono uppercase tracking-widest"
        :class="theme === 'linen' ? 'text-neutral-500' : 'text-amber-400/80'"
      >
        {{ englishSub }}
      </p>
    </div>

    <!-- Bottom Meta Readout with Live Audio Scope VU Meter -->
    <div
      class="relative z-10 flex items-end justify-between pt-2.5 border-t"
      :class="theme === 'linen' ? 'border-neutral-900/15 text-neutral-700' : 'border-white/15 text-slate-300'"
    >
      <p class="text-[10px] md:text-[11px] font-sans max-w-[70%] leading-snug line-clamp-2">
        {{ description || '融合极致的镜头节奏与达芬奇电影级色彩科学，微雕视听艺术。' }}
      </p>

      <!-- Right: Live Oscilloscope / VU Equalizer Bars & Badge -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <!-- Live Audio VU Equalizer Animation -->
        <div class="flex items-end gap-0.5 h-3 px-1.5 py-0.5 rounded bg-black/50 border border-white/10 backdrop-blur-xs">
          <span class="w-0.5 bg-emerald-400 rounded-xs animate-[pulse_0.8s_ease-in-out_infinite]" style="height: 65%;" />
          <span class="w-0.5 bg-emerald-400 rounded-xs animate-[pulse_1.2s_ease-in-out_infinite]" style="height: 95%;" />
          <span class="w-0.5 bg-amber-400 rounded-xs animate-[pulse_0.6s_ease-in-out_infinite]" style="height: 75%;" />
          <span class="w-0.5 bg-rose-400 rounded-xs animate-[pulse_1.5s_ease-in-out_infinite]" style="height: 40%;" />
        </div>

        <!-- Minimal Status Capsule -->
        <div class="flex items-center gap-1.5 font-mono text-[9px] font-bold text-amber-300 px-2 py-0.5 rounded bg-white/10 border border-white/15 backdrop-blur-md">
          <span>HDR 1000</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

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

// Live SMPTE Frame Counter Simulation (00-24 fps)
const tcFrames = ref(12)
let tcInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  if (process.client) {
    tcInterval = setInterval(() => {
      tcFrames.value = (tcFrames.value + 1) % 25
    }, 45)
  }
})

onUnmounted(() => {
  if (tcInterval) {
    clearInterval(tcInterval)
    tcInterval = null
  }
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
  background: #090c14;
  color: #f1f5f9;
}

.poster-grid {
  mask-image: radial-gradient(circle at center, black 60%, transparent 100%);
}

@keyframes auroraFloat1 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-20px, 20px) scale(1.15);
    opacity: 0.85;
  }
}

@keyframes auroraFloat2 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translate(25px, -15px) scale(1.2);
    opacity: 0.75;
  }
}

.poster-aurora-1 {
  animation: auroraFloat1 7s ease-in-out infinite;
}

.poster-aurora-2 {
  animation: auroraFloat2 9s ease-in-out infinite;
}

@keyframes anamorphicSweep {
  0% {
    transform: translateX(-120%) skewX(-20deg);
    opacity: 0;
  }
  30% {
    opacity: 0.35;
  }
  70% {
    opacity: 0.35;
  }
  100% {
    transform: translateX(220%) skewX(-20deg);
    opacity: 0;
  }
}

.poster-anamorphic-beam {
  background: linear-gradient(90deg, transparent 0%, rgba(217,119,6,0.15) 30%, rgba(245,158,11,0.4) 50%, rgba(147,51,234,0.2) 70%, transparent 100%);
  animation: anamorphicSweep 6s cubic-bezier(0.25, 1, 0.5, 1) infinite;
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

.group:hover .default-art-poster h3,
.group\/poster:hover .default-art-poster h3 {
  transform: translateX(4px);
  color: var(--color-bronze, #d97706);
}
</style>
