<template>
  <div
    class="default-art-poster relative w-full h-full overflow-hidden select-none font-sans flex flex-col justify-between p-4 md:p-6 transition-all duration-700 group/poster"
    :class="theme === 'linen' ? 'poster-linen' : 'poster-cinema'"
  >
    <!-- Background Texture & Ambient Dynamic Cinema Lights -->
    <template v-if="theme !== 'linen'">
      <!-- Deep Cinematic Stage Base (Rich dark canvas with subtle warm tint, not dead black) -->
      <div class="absolute inset-0 bg-gradient-to-br from-[#0c101c] via-[#121829] to-[#1c1228] pointer-events-none" />

      <!-- Global Dynamic Motion Glow 1: Cinema Amber Gold (Top-Right) -->
      <div
        class="poster-aurora-amber absolute -top-10 -right-10 w-80 h-80 rounded-full pointer-events-none blur-3xl"
        style="background: radial-gradient(circle, rgba(245,158,11,0.65) 0%, rgba(217,119,6,0.38) 45%, transparent 75%);"
      />

      <!-- Global Dynamic Motion Glow 2: DaVinci Teal / Cyan (Bottom-Left) -->
      <div
        class="poster-aurora-teal absolute -bottom-10 -left-10 w-80 h-80 rounded-full pointer-events-none blur-3xl"
        style="background: radial-gradient(circle, rgba(6,182,212,0.55) 0%, rgba(14,116,144,0.3) 50%, transparent 75%);"
      />

      <!-- Global Dynamic Motion Glow 3: Cinema Violet / Magenta (Center-Bloom) -->
      <div
        class="poster-aurora-violet absolute top-1/4 left-1/4 w-72 h-72 rounded-full pointer-events-none blur-3xl"
        style="background: radial-gradient(circle, rgba(168,85,247,0.45) 0%, rgba(126,34,206,0.2) 50%, transparent 75%);"
      />

      <!-- Center Ambient Core Light -->
      <div
        class="poster-aurora-core absolute inset-0 pointer-events-none opacity-40"
        style="background: radial-gradient(circle at 45% 45%, rgba(251,191,36,0.3) 0%, transparent 60%);"
      />

      <!-- Live DaVinci Resolve RGB Waveform / Oscilloscope Curves -->
      <div class="poster-oscilloscope absolute inset-x-0 bottom-12 h-20 pointer-events-none opacity-45 overflow-hidden">
        <svg class="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
          <!-- Waveform Channel R (Amber) -->
          <path
            d="M 0,45 Q 50,15 100,45 T 200,45 T 300,45 T 400,45"
            fill="none"
            stroke="#f59e0b"
            stroke-width="1.8"
            class="wave-path-1"
          />
          <!-- Waveform Channel G (Emerald Teal) -->
          <path
            d="M 0,40 Q 60,65 120,40 T 240,40 T 360,40 T 400,40"
            fill="none"
            stroke="#10b981"
            stroke-width="1.6"
            class="wave-path-2"
          />
          <!-- Waveform Channel B (Cyan) -->
          <path
            d="M 0,35 Q 40,10 80,35 T 180,35 T 280,35 T 400,35"
            fill="none"
            stroke="#06b6d4"
            stroke-width="1.6"
            class="wave-path-3"
          />
        </svg>
      </div>

      <!-- Sweeping Anamorphic Laser Lens Flare Beam -->
      <div class="poster-anamorphic-beam absolute inset-0 pointer-events-none" />

      <!-- Floating Cinema Dust Particles / Luminous Bokeh -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <span class="particle particle-1" />
        <span class="particle particle-2" />
        <span class="particle particle-3" />
        <span class="particle particle-4" />
        <span class="particle particle-5" />
      </div>

      <!-- Subtle Holographic Grid Pattern -->
      <div
        class="absolute inset-0 opacity-15 pointer-events-none"
        style="background-image: radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px); background-size: 20px 20px;"
      />

      <!-- Camera Viewfinder HUD: Corner Brackets & Crosshairs -->
      <div class="absolute inset-3 pointer-events-none transition-transform duration-500 group-hover/poster:scale-[0.98]">
        <!-- Top-left bracket -->
        <div class="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-400/50" />
        <!-- Top-right bracket -->
        <div class="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-400/50" />
        <!-- Bottom-left bracket -->
        <div class="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-400/50" />
        <!-- Bottom-right bracket -->
        <div class="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-400/50" />
        <!-- Center Target Crosshair -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 opacity-30">
          <span class="absolute top-1/2 left-0 right-0 h-px bg-white" />
          <span class="absolute left-1/2 top-0 bottom-0 w-px bg-white" />
        </div>
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

    <!-- Top Bar: Live SMPTE Broadcast Readout & REC Status -->
    <div class="relative z-10 flex items-center justify-between">
      <!-- Left: REC Recording / Broadcasting Dot -->
      <div class="flex items-center gap-2">
        <span
          class="w-2.5 h-2.5 rounded-full animate-ping"
          :class="theme === 'linen' ? 'bg-rose-500' : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,1)]'"
        />
        <div class="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider">
          <span :class="theme === 'linen' ? 'text-neutral-800' : 'text-slate-200 drop-shadow-xs'">
            {{ theme === 'linen' ? '工作室放映' : 'REC 24.000 FPS' }}
          </span>
          <span v-if="theme !== 'linen'" class="text-amber-400/90 hidden sm:inline">• 4K DCI</span>
        </div>
      </div>

      <!-- Right: Live SMPTE Timecode Pill with Live Frame Counter -->
      <div
        class="flex items-center gap-1.5 px-3 py-0.5 rounded-full font-mono text-[9px] font-bold shadow-md"
        :class="theme === 'linen' ? 'bg-black/5 text-neutral-700 border border-black/10' : 'bg-black/70 text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)]'"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>TC 01:24:08:{{ String(tcFrames).padStart(2, '0') }}</span>
      </div>
    </div>

    <!-- Center Typography & Golden Metallic Index Slate -->
    <div class="relative z-10 my-auto py-2 space-y-2">
      <div class="flex items-baseline gap-3">
        <!-- Golden Metallic Gradient Number -->
        <span
          class="poster-number font-display font-black tracking-tighter leading-none transition-transform duration-500 group-hover/poster:scale-105"
          :class="theme === 'linen' ? 'text-neutral-900' : 'poster-metallic-number drop-shadow-2xl'"
          :style="{ fontSize: numberFontSize }"
        >
          {{ displayIndex }}
        </span>

        <div class="space-y-1">
          <!-- Tag / Category Badge -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <span
              v-if="categoryText"
              class="px-2 py-0.5 rounded text-[9px] md:text-[10px] font-mono tracking-wider uppercase font-bold shadow-xs"
              :class="theme === 'linen' ? 'bg-neutral-200 text-neutral-700' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'"
            >
              {{ categoryText }}
            </span>
            <!-- Password Protected Tag if applicable -->
            <span
              v-if="isLocked"
              class="px-2 py-0.5 rounded text-[9px] font-mono tracking-wider font-bold shadow-xs flex items-center gap-1 bg-amber-950/80 text-amber-200 border border-amber-500/60"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-2.5 h-2.5 text-amber-400">
                <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
              </svg>
              密码保护
            </span>
          </div>

          <span
            class="text-[9px] font-mono block tracking-wider"
            :class="theme === 'linen' ? 'text-neutral-600' : 'text-slate-300 drop-shadow-xs'"
          >
            电影调色母带 · ACEScct
          </span>
        </div>
      </div>

      <!-- Main Film Title with Crisp Luminous Glow -->
      <h3
        class="font-display font-extrabold text-xl md:text-2xl lg:text-3xl tracking-tight leading-tight line-clamp-1 transition-all duration-300"
        :class="theme === 'linen' ? 'text-neutral-900' : 'text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] group-hover/poster:text-amber-200'"
      >
        {{ title || '精选视频作品' }}
      </h3>

      <p
        class="text-[9px] font-mono uppercase tracking-widest"
        :class="theme === 'linen' ? 'text-neutral-500' : 'text-amber-400/90 font-semibold'"
      >
        {{ englishSub }}
      </p>
    </div>

    <!-- Bottom Meta Readout with Live Audio VU Equalizer Meter -->
    <div
      class="relative z-10 flex items-end justify-between pt-2.5 border-t"
      :class="theme === 'linen' ? 'border-neutral-900/15 text-neutral-700' : 'border-white/20 text-slate-300'"
    >
      <p class="text-[10px] md:text-[11px] font-sans max-w-[65%] leading-snug line-clamp-2">
        {{ description || '融合极致的镜头节奏与达芬奇电影级色彩科学，微雕视听艺术。' }}
      </p>

      <!-- Right: Live Oscilloscope / VU Equalizer Bars & Badge -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <!-- Live Audio VU Equalizer Animation -->
        <div
          class="flex items-end gap-0.5 h-3.5 px-2 py-0.5 rounded shadow-inner"
          :class="theme === 'linen' ? 'bg-black/5 border border-black/10' : 'bg-black/60 border border-white/15 backdrop-blur-xs'"
        >
          <span class="w-0.5 bg-emerald-400 rounded-xs eq-bar-1" />
          <span class="w-0.5 bg-emerald-400 rounded-xs eq-bar-2" />
          <span class="w-0.5 bg-amber-400 rounded-xs eq-bar-3" />
          <span class="w-0.5 bg-amber-400 rounded-xs eq-bar-4" />
          <span class="w-0.5 bg-rose-400 rounded-xs eq-bar-5" />
        </div>

        <!-- Cinema Master Status Capsule -->
        <div
          class="flex items-center gap-1.5 font-mono text-[9px] font-bold px-2 py-0.5 rounded shadow-sm"
          :class="theme === 'linen' ? 'bg-black/5 text-neutral-800 border border-black/10' : 'bg-black/60 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(245,158,11,0.2)]'"
        >
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
  tags?: string[] | string
  description?: string
  theme?: 'cinema' | 'linen'
  isPasswordProtected?: boolean
  hasPassword?: boolean
}>(), {
  title: '精选视频作品',
  index: '01',
  category: '',
  description: '融合极致的镜头节奏与达芬奇电影级色彩科学，微雕视听艺术。',
  theme: 'cinema',
  isPasswordProtected: false,
  hasPassword: false
})

// Live SMPTE Frame Counter Simulation (00-24 fps cinema standard)
const tcFrames = ref(12)
let tcInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  if (process.client) {
    tcInterval = setInterval(() => {
      tcFrames.value = (tcFrames.value + 1) % 25
    }, 42)
  }
})

onUnmounted(() => {
  if (tcInterval) {
    clearInterval(tcInterval)
    tcInterval = null
  }
})

const isLocked = computed(() => {
  return Boolean(props.isPasswordProtected || props.hasPassword)
})

const categoryText = computed(() => {
  if (props.category) return props.category
  if (Array.isArray(props.tags) && props.tags.length > 0) return props.tags[0]
  if (typeof props.tags === 'string' && props.tags.trim()) return props.tags.split(/[,，]/)[0].trim()
  return ''
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
  return categoryText.value ? categoryText.value : '影视后期母带 · MASTER GRADE'
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

/* Luminous Metallic Gradient Typography */
.poster-metallic-number {
  background: linear-gradient(135deg, #ffffff 0%, #fef08a 25%, #f59e0b 60%, #b45309 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 25px rgba(245, 158, 11, 0.45));
}

/* Aurora Fluid Motion 1 (Amber Gold) */
@keyframes auroraFloatAmber {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.65;
  }
  50% {
    transform: translate(-35px, 25px) scale(1.22);
    opacity: 0.95;
  }
  100% {
    transform: translate(15px, -15px) scale(1.08);
    opacity: 0.75;
  }
}

/* Aurora Fluid Motion 2 (DaVinci Teal / Cyan) */
@keyframes auroraFloatTeal {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.55;
  }
  50% {
    transform: translate(40px, -30px) scale(1.25);
    opacity: 0.9;
  }
  100% {
    transform: translate(-20px, 15px) scale(1.05);
    opacity: 0.65;
  }
}

/* Aurora Fluid Motion 3 (Cinema Violet) */
@keyframes auroraFloatViolet {
  0% {
    transform: translate(0, 0) scale(0.95);
    opacity: 0.45;
  }
  50% {
    transform: translate(-20px, -20px) scale(1.18);
    opacity: 0.8;
  }
  100% {
    transform: translate(25px, 20px) scale(1);
    opacity: 0.5;
  }
}

.poster-aurora-amber {
  animation: auroraFloatAmber 8s ease-in-out infinite alternate;
}

.poster-aurora-teal {
  animation: auroraFloatTeal 10s ease-in-out infinite alternate;
}

.poster-aurora-violet {
  animation: auroraFloatViolet 9s ease-in-out infinite alternate;
}

/* Sweeping Anamorphic Lens Flare Beam */
@keyframes anamorphicSweep {
  0% {
    transform: translateX(-160%) skewX(-25deg);
    opacity: 0;
  }
  20% {
    opacity: 0.75;
  }
  80% {
    opacity: 0.75;
  }
  100% {
    transform: translateX(260%) skewX(-25deg);
    opacity: 0;
  }
}

.poster-anamorphic-beam {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(6, 182, 212, 0.25) 20%,
    rgba(255, 255, 255, 0.85) 50%,
    rgba(245, 158, 11, 0.5) 75%,
    transparent 100%
  );
  filter: drop-shadow(0 0 15px rgba(245, 158, 11, 0.8));
  animation: anamorphicSweep 5.5s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

/* DaVinci Scope Wave Paths Flow */
@keyframes waveFlow1 {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 200; }
}

@keyframes waveFlow2 {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -200; }
}

.wave-path-1 {
  stroke-dasharray: 40 10;
  animation: waveFlow1 12s linear infinite;
  filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.6));
}

.wave-path-2 {
  stroke-dasharray: 30 15;
  animation: waveFlow2 10s linear infinite;
  filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.6));
}

.wave-path-3 {
  stroke-dasharray: 50 12;
  animation: waveFlow1 14s linear infinite;
  filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.6));
}

/* Floating Cinematic Dust Particles */
.particle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(circle, #fff 0%, rgba(245,158,11,0.8) 60%, transparent 100%);
  filter: blur(1px);
}

@keyframes floatParticleUp {
  0% {
    transform: translateY(120px) scale(0.6);
    opacity: 0;
  }
  30% {
    opacity: 0.85;
  }
  80% {
    opacity: 0.85;
  }
  100% {
    transform: translateY(-80px) scale(1.2);
    opacity: 0;
  }
}

.particle-1 {
  width: 3px;
  height: 3px;
  left: 20%;
  bottom: 10%;
  animation: floatParticleUp 6s ease-in-out infinite;
}

.particle-2 {
  width: 4px;
  height: 4px;
  left: 65%;
  bottom: 25%;
  animation: floatParticleUp 8s ease-in-out infinite 1.5s;
}

.particle-3 {
  width: 2.5px;
  height: 2.5px;
  left: 45%;
  bottom: 15%;
  animation: floatParticleUp 7s ease-in-out infinite 3s;
}

.particle-4 {
  width: 3.5px;
  height: 3.5px;
  left: 80%;
  bottom: 30%;
  animation: floatParticleUp 9s ease-in-out infinite 2s;
}

.particle-5 {
  width: 2px;
  height: 2px;
  left: 30%;
  bottom: 40%;
  animation: floatParticleUp 6.5s ease-in-out infinite 4s;
}

/* Live Equalizer Dancing Bars */
@keyframes eqDance1 {
  0%, 100% { height: 40%; }
  50% { height: 90%; }
}
@keyframes eqDance2 {
  0%, 100% { height: 85%; }
  50% { height: 35%; }
}
@keyframes eqDance3 {
  0%, 100% { height: 50%; }
  50% { height: 100%; }
}
@keyframes eqDance4 {
  0%, 100% { height: 95%; }
  50% { height: 45%; }
}
@keyframes eqDance5 {
  0%, 100% { height: 30%; }
  50% { height: 80%; }
}

.eq-bar-1 { animation: eqDance1 0.7s ease-in-out infinite; }
.eq-bar-2 { animation: eqDance2 0.9s ease-in-out infinite 0.1s; }
.eq-bar-3 { animation: eqDance3 0.6s ease-in-out infinite 0.2s; }
.eq-bar-4 { animation: eqDance4 0.8s ease-in-out infinite 0.15s; }
.eq-bar-5 { animation: eqDance5 1.1s ease-in-out infinite 0.3s; }

/* Scan line for Linen mode */
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
  color: var(--color-bronze-light, #fbbf24);
}
</style>
