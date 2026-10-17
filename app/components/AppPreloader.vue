<template>
  <div
    v-if="visible"
    id="xo-global-preloader"
    :class="['xo-preloader', { 'xo-preloader--exit': isExiting }]"
    role="dialog"
    aria-label="XO STUDIO 加载中"
    aria-busy="true"
    @click="dismissIntro"
  >
    <!-- 1. Cinematic Theatrical Letterbox Shutters (电影级开合遮幅) -->
    <div class="shutter shutter--top" aria-hidden="true" />
    <div class="shutter shutter--bottom" aria-hidden="true" />

    <!-- 2. Ambient Velvet Glow & Celluloid Texture (GPU 加速纯净光晕) -->
    <div class="ambient-layer" aria-hidden="true">
      <div class="glow-orb glow-orb--amber" />
      <div class="glow-orb glow-orb--cyan" />
      <div class="film-grain" />
    </div>

    <!-- 3. Top Status Deck (极简高奢监视栏) -->
    <header class="preloader-header">
      <div class="brand-pill">
        <span class="beacon-dot" />
        <span class="brand-title font-mono">XO STUDIO</span>
        <span class="brand-div font-mono">/</span>
        <span class="brand-sub font-mono">MASTERING 2026</span>
      </div>

      <div class="header-right font-mono">
        <!-- Live Real-time Network Metric Badge -->
        <span class="milestone-badge network-badge" :title="`实时网络测速: ${networkLatencyMs ? networkLatencyMs + 'ms' : '测算中'}`">
          <span class="net-dot" :class="{ 'net-dot--fast': (networkLatencyMs || 0) < 60, 'net-dot--slow': (networkLatencyMs || 0) >= 150 }" />
          {{ networkMetricLabel }}
        </span>

        <!-- Live Milestones Count -->
        <span class="milestone-badge">{{ completedMilestones }}/5 READY</span>

        <!-- Quick Skip Button -->
        <button
          type="button"
          class="skip-pill"
          @click.stop="dismissIntro"
          title="点击或按 ESC 快速跳过"
        >
          <span>跳过</span>
          <kbd>ESC</kbd>
        </button>
      </div>
    </header>

    <!-- 4. Centerpiece Stage: Pure Optical Iris & Kinetic Brand (核心视觉舞台) -->
    <main class="preloader-main">
      <!-- Optical Reticle Dial & Emblem -->
      <div class="optical-stage" aria-hidden="true">
        <!-- SVG Precision Calibration Ring -->
        <svg class="reticle-svg" viewBox="0 0 160 160" fill="none">
          <!-- Outer Reference Ring -->
          <circle cx="80" cy="80" r="76" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />
          <circle cx="80" cy="80" r="70" stroke="rgba(217, 119, 6, 0.25)" stroke-width="1" stroke-dasharray="3 6" />

          <!-- Dynamic Progress Arc (GPU 驱动金色光环) -->
          <circle
            cx="80"
            cy="80"
            r="60"
            stroke="url(#preloaderGoldGrad)"
            stroke-width="2"
            stroke-linecap="round"
            stroke-dasharray="377"
            :stroke-dashoffset="377 - (displayProgress / 100) * 377"
            class="progress-arc"
          />

          <!-- Gradient Definition -->
          <defs>
            <linearGradient id="preloaderGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fbbf24" />
              <stop offset="50%" stop-color="#d97706" />
              <stop offset="100%" stop-color="#b45309" />
            </linearGradient>
          </defs>
        </svg>

        <!-- Brand Emblem Disc -->
        <div class="emblem-disc">
          <img
            src="/logo.png?v=312k_v4"
            alt="XO"
            class="emblem-asset"
          />
          <div class="emblem-glimmer" />
        </div>
      </div>

      <!-- Poetic Brand Headline -->
      <div class="brand-slogan">
        <h1 class="slogan-main font-display">
          <span class="slogan-w1">用剪辑重塑时间</span>
          <span class="slogan-w2">与光影故事</span>
        </h1>
        <p class="slogan-aux font-mono">
          COLOR SCIENCE · 4K HDR MASTERING · VISUAL RHYTHM
        </p>
      </div>

      <!-- Linear Horizon Progress Engine -->
      <div class="progress-box">
        <!-- Big Tabular Digits -->
        <div class="counter-wrap font-display">
          <span class="counter-val">{{ Math.round(displayProgress) }}</span>
          <span class="counter-unit font-mono">%</span>
        </div>

        <!-- Sleek Horizon Laser Rail -->
        <div class="horizon-track">
          <div
            class="horizon-meter"
            :style="{ transform: `scaleX(${displayProgress / 100})` }"
          />
        </div>

        <!-- Dynamic Status Message -->
        <div class="status-wrap font-mono">
          <span class="status-light" :class="{ 'status-light--ready': displayProgress >= 100 }" />
          <span class="status-msg">{{ statusMessage }}</span>
        </div>
      </div>
    </main>

    <!-- 5. Bottom Cine Specs Bar (底栏极简参数) -->
    <footer class="preloader-footer font-mono">
      <span class="spec-left">2.39:1 · ACEScc · REC.2020 · 24.000 FPS</span>
      <span class="spec-right">CLICK ANYWHERE TO ENTER [ESC]</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (event: 'complete'): void
  (event: 'reveal-start'): void
}>()

const visible = ref(true)
const isExiting = ref(false)
const displayProgress = ref(0)

// Real Milestones Pipeline
const milestones = reactive({
  dom: false,
  network: false,
  api: false,
  fonts: false,
  assets: false
})

const completedMilestones = computed(() => {
  return (milestones.dom ? 1 : 0) +
         (milestones.network ? 1 : 0) +
         (milestones.api ? 1 : 0) +
         (milestones.fonts ? 1 : 0) +
         (milestones.assets ? 1 : 0)
})

// Real-time Network Metrics
const networkLatencyMs = ref<number | null>(null)
const networkBandwidthStr = ref('DETECTING')

const networkMetricLabel = computed(() => {
  if (networkLatencyMs.value !== null) {
    return `${networkBandwidthStr.value} · ${networkLatencyMs.value}ms`
  }
  return '链路测算中...'
})

const statusMessage = computed(() => {
  if (displayProgress.value >= 100) return '光影母带资源就绪 · 欢迎进入'
  if (displayProgress.value < 28) return '正在构建 DOM 与色彩骨架...'
  if (displayProgress.value < 60) return `正在测定网络链路 (${networkMetricLabel.value})...`
  if (displayProgress.value < 85) return '正在加载 4K HDR 作品集与调色配置...'
  if (displayProgress.value < 96) return '正在载入 Xo Display 高精字形库...'
  return '正在校准交互管线与电影级母带舞台...'
})

let rafId = 0
let startedAt = 0
let exitTimer: number | null = null

// Smooth Exit Reveal
const triggerExit = () => {
  if (isExiting.value) return
  isExiting.value = true
  displayProgress.value = 100

  emit('reveal-start')

  // Snappy, silky 420ms theatrical reveal duration
  exitTimer = window.setTimeout(() => {
    visible.value = false
    emit('complete')
    if (import.meta.client) {
      document.body.style.overflow = ''
    }
  }, 420)
}

// User-initiated Instant Skip
const dismissIntro = () => {
  if (!isExiting.value) {
    triggerExit()
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' || e.key === 'Esc' || e.key === ' ') {
    dismissIntro()
  }
}

onMounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    // Detect Connection Profile
    if (typeof navigator !== 'undefined' && (navigator as any).connection) {
      const conn = (navigator as any).connection
      const eff = (conn.effectiveType || '').toUpperCase()
      const dl = conn.downlink ? `${conn.downlink}M` : ''
      networkBandwidthStr.value = eff ? `${eff} ${dl}`.trim() : '5G/FIBER'
      if (conn.rtt) networkLatencyMs.value = conn.rtt
    } else {
      networkBandwidthStr.value = '5G/FIBER'
    }
  }

  startedAt = performance.now()

  // 1. DOM Milestone (支持 interactive 与 complete)
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    milestones.dom = true
  } else {
    window.addEventListener('DOMContentLoaded', () => { milestones.dom = true }, { once: true })
    window.addEventListener('load', () => { milestones.dom = true }, { once: true })
  }

  // 2. Real Network Probe (Measuring real latency RTT)
  const probeNet = async () => {
    const t0 = performance.now()
    try {
      await fetch(`/api/site-config?probe=${Date.now()}`, { cache: 'no-store' })
      const rtt = Math.round(performance.now() - t0)
      networkLatencyMs.value = rtt
    } catch {
      if (networkLatencyMs.value === null) networkLatencyMs.value = 35
    } finally {
      milestones.network = true
    }
  }

  // 3. Real API Preload
  const probeApi = async () => {
    try {
      await Promise.all([
        fetch(`/api/site-config?p=${Date.now()}`),
        fetch(`/api/projects?p=${Date.now()}`)
      ])
    } catch {} finally {
      milestones.api = true
    }
  }

  // 4. Real Fonts Ready
  const probeFonts = async () => {
    try {
      if (document.fonts?.ready) await document.fonts.ready
    } catch {} finally {
      milestones.fonts = true
    }
  }

  // 5. Assets Preload
  const probeAssets = async () => {
    const img = new Image()
    img.src = '/logo.png?v=312k_v4'
    img.onload = () => { milestones.assets = true }
    img.onerror = () => { milestones.assets = true }
  }

  void Promise.allSettled([probeNet(), probeApi(), probeFonts(), probeAssets()])

  // 绝对自愈保底：2.4 秒后若仍在开场阶段，强制解封并退出，杜绝任何意外卡死
  const safetyTimeout = window.setTimeout(() => {
    milestones.dom = true
    milestones.network = true
    milestones.api = true
    milestones.fonts = true
    milestones.assets = true
    triggerExit()
  }, 2400)

  // Adaptive Ceremony Duration (based on real network condition)
  // Even on Gigabit local/fiber network, gives a dignified 1.8s ~ 2.4s cinema opening
  const getTargetDuration = () => {
    const rtt = networkLatencyMs.value ?? 30
    if (rtt > 220) return 2600
    if (rtt > 100) return 2200
    return 1800
  }

  const updateLoop = (now: number) => {
    if (isExiting.value) return

    const elapsed = now - startedAt
    const totalDuration = getTargetDuration()
    const timeRatio = Math.min(1, elapsed / totalDuration)

    // Smooth organic S-curve progression (cubic Hermite)
    const smoothTime = timeRatio * timeRatio * (3 - 2 * timeRatio)
    const timeProgress = smoothTime * 100

    // Gated milestones: 动态阶梯递增
    let gatedCeiling = 100
    if (!milestones.dom) gatedCeiling = Math.min(gatedCeiling, 35)
    else if (!milestones.network) gatedCeiling = Math.min(gatedCeiling, 65)
    else if (!milestones.api) gatedCeiling = Math.min(gatedCeiling, 82)
    else if (!milestones.fonts || !milestones.assets) gatedCeiling = Math.min(gatedCeiling, 92)

    // 超过 1.5 秒自动解除所有里程碑闸门
    if (elapsed > 1500) {
      gatedCeiling = 100
    }

    const targetProgress = Math.min(gatedCeiling, timeProgress)

    // 确保数字平滑且必然前移（最小步长 0.8%，杜绝停滞在 0）
    const diff = targetProgress - displayProgress.value
    if (diff > 0) {
      displayProgress.value = Math.min(targetProgress, displayProgress.value + Math.max(0.8, diff * 0.16))
    }

    const allReady = completedMilestones.value >= 5

    // Completion condition: 满足进度或达到规定时长即刻完成
    if ((displayProgress.value >= 98 || elapsed >= totalDuration) && (allReady || elapsed >= 1600)) {
      displayProgress.value = 100
      clearTimeout(safetyTimeout)
      window.setTimeout(() => {
        triggerExit()
      }, 180)
      return
    }

    rafId = requestAnimationFrame(updateLoop)
  }

  rafId = requestAnimationFrame(updateLoop)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  if (exitTimer !== null) clearTimeout(exitTimer)
  if (import.meta.client) {
    window.removeEventListener('keydown', handleKeyDown)
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
/* ==========================================================================
   XO Studio Ultra-Smooth Cinema Master Preloader
   ========================================================================== */
.xo-preloader {
  --loader-gold: #d97706;
  --loader-gold-light: #fbbf24;
  --loader-bg: #090807;

  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(20px, 4vw, 44px) clamp(24px, 5vw, 60px);
  background: var(--loader-bg);
  color: #f9fafb;
  font-family: var(--font-sans, system-ui, sans-serif);
  user-select: none;
  cursor: pointer;
  overflow: hidden;
  transition: opacity 0.42s cubic-bezier(0.16, 1, 0.3, 1), transform 0.42s cubic-bezier(0.16, 1, 0.3, 1);
}

/* 1. Theatrical Shutters */
.shutter {
  position: absolute;
  left: 0;
  right: 0;
  height: 50.5%;
  background: #090807;
  z-index: 1;
  pointer-events: none;
  transition: transform 0.42s cubic-bezier(0.85, 0, 0.15, 1);
  will-change: transform;
}

.shutter--top {
  top: 0;
  transform-origin: top center;
  border-bottom: 1px solid rgba(217, 119, 6, 0.12);
}

.shutter--bottom {
  bottom: 0;
  transform-origin: bottom center;
  border-top: 1px solid rgba(217, 119, 6, 0.12);
}

/* Exit Animation: Silky split and fade */
.xo-preloader--exit {
  opacity: 0;
  pointer-events: none;
}

.xo-preloader--exit .shutter--top {
  transform: translate3d(0, -100%, 0);
}

.xo-preloader--exit .shutter--bottom {
  transform: translate3d(0, 100%, 0);
}

.xo-preloader--exit .preloader-main {
  transform: translate3d(0, -12px, 0) scale(0.97);
  opacity: 0;
  transition: opacity 0.25s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

/* 2. Ambient Atmosphere */
.ambient-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  overflow: hidden;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(60px);
}

.glow-orb--amber {
  width: 45vw;
  height: 45vw;
  top: 15%;
  left: 25%;
  background: radial-gradient(circle, rgba(217, 119, 6, 0.14) 0%, transparent 65%);
}

.glow-orb--cyan {
  width: 35vw;
  height: 35vw;
  bottom: 15%;
  right: 20%;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.06) 0%, transparent 60%);
}

.film-grain {
  position: absolute;
  inset: 0;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

/* 3. Header */
.preloader-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.brand-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 13px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.beacon-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--loader-gold);
  box-shadow: 0 0 8px var(--loader-gold);
}

.brand-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #fff;
}

.brand-div {
  opacity: 0.3;
  font-size: 10px;
}

.brand-sub {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--loader-gold-light);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.milestone-badge {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.45);
}

.network-badge {
  display: inline-flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.6);
}

.net-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
  margin-right: 5px;
}

.net-dot--fast {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.net-dot--slow {
  background: #f59e0b;
  box-shadow: 0 0 6px #f59e0b;
}

.skip-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #9ca3af;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.skip-pill kbd {
  font-family: var(--font-mono, monospace);
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--loader-gold-light);
}

.skip-pill:hover {
  background: rgba(217, 119, 6, 0.15);
  border-color: rgba(217, 119, 6, 0.4);
  color: #fff;
}

/* 4. Centerpiece Stage */
.preloader-main {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: clamp(24px, 3.5vw, 36px);
  margin: auto;
  max-width: 680px;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.optical-stage {
  position: relative;
  width: 120px;
  height: 120px;
  display: grid;
  place-items: center;
}

.reticle-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.progress-arc {
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dashoffset 0.1s linear;
}

.emblem-disc {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: radial-gradient(circle at 35% 30%, #1e1b17 0%, #0c0b0a 100%);
  border: 1px solid rgba(217, 119, 6, 0.45);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.7);
  display: grid;
  place-items: center;
  overflow: hidden;
}

.emblem-asset {
  width: 58%;
  height: 58%;
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5));
}

.emblem-glimmer {
  position: absolute;
  inset: -10%;
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent 0deg, rgba(251, 191, 36, 0.2) 30deg, transparent 60deg);
  animation: emblem-spin 4s linear infinite;
  pointer-events: none;
}

/* Slogan */
.brand-slogan {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slogan-main {
  margin: 0;
  font-size: clamp(30px, 4.5vw, 54px);
  font-weight: 450;
  letter-spacing: 0.03em;
  line-height: 1.15;
}

.slogan-w1 {
  display: block;
  color: #ffffff;
}

.slogan-w2 {
  display: block;
  background: linear-gradient(135deg, #ffffff 0%, #fef3c7 45%, var(--loader-gold) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-style: italic;
}

.slogan-aux {
  margin: 0;
  font-size: clamp(9px, 1.1vw, 11px);
  font-weight: 600;
  letter-spacing: 0.22em;
  color: #9ca3af;
}

/* Progress Box */
.progress-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: min(100%, 340px);
}

.counter-wrap {
  display: flex;
  align-items: baseline;
  gap: 3px;
  line-height: 1;
}

.counter-val {
  font-size: clamp(38px, 5.5vw, 52px);
  font-weight: 500;
  letter-spacing: -0.02em;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

.counter-unit {
  font-size: 13px;
  font-weight: 600;
  color: var(--loader-gold-light);
}

.horizon-track {
  position: relative;
  width: 100%;
  height: 2px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
}

.horizon-meter {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(90deg, var(--loader-gold) 0%, var(--loader-gold-light) 100%);
  transform-origin: left center;
  transition: transform 0.08s linear;
  box-shadow: 0 0 12px rgba(217, 119, 6, 0.5);
  will-change: transform;
}

.status-wrap {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: #9ca3af;
}

.status-light {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--loader-gold);
  transition: background-color 0.2s ease;
}

.status-light--ready {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

/* 5. Footer */
.preloader-footer {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 9px;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.3);
}

@keyframes emblem-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Mobile Adaptations */
@media (max-width: 640px) {
  .xo-preloader {
    padding: 16px 16px 20px;
  }
  .brand-sub,
  .brand-div,
  .spec-right {
    display: none;
  }
  .preloader-footer {
    justify-content: center;
    text-align: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shutter {
    transition: none !important;
  }
  .xo-preloader {
    transition-duration: 0.01ms !important;
  }
  .emblem-glimmer {
    animation: none !important;
  }
}
</style>
