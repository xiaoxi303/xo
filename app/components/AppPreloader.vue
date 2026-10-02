<template>
  <div
    v-if="visible"
    :class="['xo-preloader', `xo-preloader--${phase}`]"
    role="dialog"
    aria-label="页面加载中"
    aria-busy="true"
    @click="skipIntro"
  >
    <!-- Warm Velvet Ambient Backdrop -->
    <div class="preloader-bg" aria-hidden="true">
      <div class="ambient-glow ambient-glow--1" />
      <div class="ambient-glow ambient-glow--2" />
      <div class="film-grain" />
    </div>

    <!-- Minimalist Top Bar with Real Network Telemetry -->
    <header class="preloader-header">
      <div class="brand-chip">
        <span class="brand-beacon" />
        <span class="brand-name font-mono">XO STUDIO</span>
        <span class="brand-sep font-mono">/</span>
        <span class="brand-edition font-mono">2026 EDITION</span>
      </div>

      <!-- Real Network Speed Indicator -->
      <div class="network-chip" :title="`网络类型: ${networkType.toUpperCase()} | 延迟: ${networkRtt}ms`">
        <span class="network-ping-dot" :class="networkQualityClass" />
        <span class="network-label font-mono">{{ networkLabel }}</span>
      </div>

      <button
        type="button"
        class="skip-trigger"
        @click.stop="skipIntro"
        title="按 ESC 快速跳过"
      >
        <span>跳过</span>
        <kbd>ESC</kbd>
      </button>
    </header>

    <!-- Centerpiece Stage: Elegant Typography & Real Progress Counter -->
    <main class="preloader-stage">
      <!-- Studio Emblem / Monogram -->
      <div class="monogram-wrapper" aria-hidden="true">
        <div class="monogram-halo" />
        <div class="monogram-disk">
          <img
            src="/logo.png?v=312k_v4"
            alt="XO"
            class="monogram-img"
          />
        </div>
      </div>

      <!-- Core Brand Slogan -->
      <div class="slogan-wrapper">
        <h1 class="slogan-title font-display">
          <span class="slogan-row slogan-row--1">用剪辑重塑时间</span>
          <span class="slogan-row slogan-row--2">与光影故事</span>
        </h1>
        <p class="slogan-desc font-mono">
          CRAFTING VISUAL RHYTHM &amp; COLOR SCIENCE
        </p>
      </div>

      <!-- Precision Minimalist Progress System (Bound to Real Assets) -->
      <div class="progress-system">
        <!-- Big Editorial Percentage Counter -->
        <div class="counter-display font-display">
          <span class="counter-number">{{ String(Math.floor(progress)).padStart(2, '0') }}</span>
          <span class="counter-percent font-mono">%</span>
        </div>

        <!-- Single Ultra-Thin Gold Horizon Line -->
        <div class="horizon-rail">
          <div class="horizon-track" />
          <div
            class="horizon-fill"
            :style="{ width: `${progress}%` }"
          >
            <span class="horizon-pin" />
          </div>
        </div>

        <!-- Dynamic Real Pipeline Status (反映真实加载阶段) -->
        <div class="status-indicator font-mono">
          <span class="status-dot" :class="{ 'status-dot--ready': isAllReady }" />
          <span class="status-label">{{ currentStatus }}</span>
        </div>
      </div>
    </main>

    <!-- Minimalist Bottom Footer with Loaded Resource Counter -->
    <footer class="preloader-footer">
      <span class="footer-tag font-mono">
        PIPELINE: {{ completedCount }}/{{ totalMilestones }} MILESTONES · 4K HDR
      </span>
      <span class="footer-tag font-mono">CLICK ANYWHERE TO ENTER [ESC]</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ (event: 'complete'): void; (event: 'reveal-start'): void }>()

const visible = ref(true)
const phase = ref<'enter' | 'active' | 'exit'>('enter')
const progress = ref(0)

// Real Milestones Pipeline Tracking (真实资源与网络加载管道)
const tasks = reactive({
  document: 0,   // DOMContentLoaded / readyState
  network: 0,    // Live RTT probe
  api: 0,        // Core site-config & projects data fetch
  fonts: 0,      // WebFonts ready
  assets: 0      // Key media / images loaded
})

const totalMilestones = 5
const completedCount = computed(() => {
  return (tasks.document >= 1 ? 1 : 0) +
         (tasks.network >= 1 ? 1 : 0) +
         (tasks.api >= 1 ? 1 : 0) +
         (tasks.fonts >= 1 ? 1 : 0) +
         (tasks.assets >= 1 ? 1 : 0)
})

const isAllReady = computed(() => completedCount.value === totalMilestones)

// Real Network Environment Detection
const networkType = ref('4g')
const networkRtt = ref(0)
const networkLabel = ref('正在检测网络...')

const networkQualityClass = computed(() => {
  if (import.meta.client && typeof navigator !== 'undefined' && !navigator.onLine) return 'dot--offline'
  if (networkRtt.value > 0 && networkRtt.value < 100) return 'dot--excellent'
  if (networkRtt.value < 300) return 'dot--good'
  return 'dot--slow'
})

// Current status copy dynamically bound to real pending tasks
const currentStatus = computed(() => {
  if (tasks.document === 0) return '正在解析文档与 DOM 结构...'
  if (tasks.network === 0) return `正在检测网络链路 (${networkLabel.value})...`
  if (tasks.api === 0) return '正在加载 4K 作品集与工作室配置...'
  if (tasks.fonts === 0) return '正在下发 Xo Display 高精度字形库...'
  if (tasks.assets === 0) return '正在校验图形管线与交互资产...'
  return '全站资源就绪 · 欢迎来到 XO STUDIO'
})

// Genuine weighted target calculation (真实加权进度目标)
const computeRealTarget = () => {
  const target =
    tasks.document * 20 +
    tasks.network * 20 +
    tasks.api * 25 +
    tasks.fonts * 20 +
    tasks.assets * 15

  return Math.min(100, Math.max(0, target))
}

let rafId = 0
let startedAt = 0
let isExiting = false
let finishTimer: number | null = null
let safetyFallbackTimer: number | null = null

const triggerExit = () => {
  if (isExiting) return
  isExiting = true
  progress.value = 100
  phase.value = 'exit'

  emit('reveal-start')

  // Smooth curtain slide duration (800ms)
  finishTimer = window.setTimeout(() => {
    visible.value = false
    emit('complete')
    if (import.meta.client) {
      document.body.style.overflow = ''
    }
  }, 820)
}

const skipIntro = () => {
  if (!isExiting) triggerExit()
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' || e.key === 'Esc') {
    skipIntro()
  }
}

onMounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
  }

  startedAt = performance.now()
  requestAnimationFrame(() => {
    phase.value = 'active'
  })

  // 1. Genuine Document Milestone
  if (document.readyState === 'complete') {
    tasks.document = 1
  } else {
    tasks.document = 0.5
    window.addEventListener('DOMContentLoaded', () => { tasks.document = 0.9 }, { once: true })
    window.addEventListener('load', () => { tasks.document = 1 }, { once: true })
  }

  // 2. Genuine Network Telemetry & RTT Probe
  const probeNetwork = async () => {
    const conn = (navigator as any)?.connection
    if (conn) {
      networkType.value = conn.effectiveType || '4g'
      if (conn.rtt) networkRtt.value = conn.rtt
    }

    const t0 = performance.now()
    try {
      await fetch(`/api/site-config?network_probe=${Date.now()}`, { cache: 'no-store' })
      const rtt = Math.round(performance.now() - t0)
      networkRtt.value = rtt
      if (!navigator.onLine) {
        networkLabel.value = '离线模式'
      } else if (rtt < 80) {
        networkLabel.value = `极速网络 · ${rtt}ms`
      } else if (rtt < 240) {
        networkLabel.value = `良好网络 · ${rtt}ms`
      } else {
        networkLabel.value = `较慢网络 · ${rtt}ms`
      }
    } catch {
      networkLabel.value = navigator.onLine ? '网络响应正常' : '当前离线'
    } finally {
      tasks.network = 1
    }
  }

  // 3. Genuine API Payload Fetch
  const probeApi = async () => {
    try {
      await Promise.all([
        fetch(`/api/site-config?preload=${Date.now()}`),
        fetch(`/api/projects?preload=${Date.now()}`)
      ])
    } catch {} finally {
      tasks.api = 1
    }
  }

  // 4. Genuine WebFont Download State
  const probeFonts = async () => {
    try {
      if (document.fonts?.ready) {
        await document.fonts.ready
      }
    } catch {} finally {
      tasks.fonts = 1
    }
  }

  // 5. Genuine Media Assets Preload
  const probeAssets = async () => {
    const preloadImg = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => resolve()
        img.src = src
      })

    await Promise.allSettled([
      preloadImg('/logo.png?v=312k_v4')
    ])
    tasks.assets = 1
  }

  // Launch all real probes concurrently
  void Promise.allSettled([
    probeNetwork(),
    probeApi(),
    probeFonts(),
    probeAssets()
  ])

  // Safety fallback in case of extreme network timeout (max 7s)
  safetyFallbackTimer = window.setTimeout(() => {
    tasks.document = 1
    tasks.network = 1
    tasks.api = 1
    tasks.fonts = 1
    tasks.assets = 1
  }, 7000)

  // Minimum Ceremonial Pacing Window (保底黄金仪式感时长，约 2.2 秒)
  // 确保在极速网络或本地环境下，也有足够的呼吸感让访客看清品牌诗意标语、微标与进度递增，绝不出现 0.3 秒一闪而过的生硬感
  const MINIMUM_CEREMONY_MS = 2200

  // Fluid physics loop tracking real target progress with ceremonial pacing ceiling
  const updateLoop = (now: number) => {
    if (isExiting) return

    const elapsed = now - startedAt
    const timeRatio = Math.min(1, elapsed / MINIMUM_CEREMONY_MS)

    // Time-gated ceiling with natural sine easing: rises smoothly, settles comfortably near 99
    // Even if local network resolves in 10ms, progress gracefully takes ~2.2s to reach 100%
    const ceremonyProgressCeiling = elapsed >= MINIMUM_CEREMONY_MS ? 100 : Math.min(99, 100 * Math.sin((timeRatio * Math.PI) / 2))

    // Real target is bounded by genuine assets loading AND the ceremony pacing
    const realTarget = computeRealTarget()
    const effectiveTarget = isAllReady.value && elapsed >= MINIMUM_CEREMONY_MS ? 100 : Math.min(realTarget, ceremonyProgressCeiling)

    const diff = effectiveTarget - progress.value

    // Smooth physical lerp
    progress.value += diff * 0.12

    // Check if fully satisfied both real assets AND ceremony window
    if (isAllReady.value && elapsed >= MINIMUM_CEREMONY_MS && progress.value >= 98.8) {
      progress.value = 100
      // Brief 150ms celebratory pause at 100% to let user see "全站资源就绪"
      window.setTimeout(() => {
        triggerExit()
      }, 160)
      return
    }

    rafId = requestAnimationFrame(updateLoop)
  }

  rafId = requestAnimationFrame(updateLoop)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  if (finishTimer !== null) clearTimeout(finishTimer)
  if (safetyFallbackTimer !== null) clearTimeout(safetyFallbackTimer)
  if (import.meta.client) {
    window.removeEventListener('keydown', handleKeyDown)
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
/* ==========================================================================
   XO Luxury Cinematic Preloader Container
   ========================================================================== */
.xo-preloader {
  --preloader-bg: #0b0a09;
  --preloader-gold: #d97706;
  --preloader-gold-light: #fbbf24;
  --preloader-gold-glow: rgba(217, 119, 6, 0.35);
  --preloader-text: #f9fafb;
  --preloader-muted: #9ca3af;
  --preloader-dim: #4b5563;

  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(24px, 5vw, 56px) clamp(24px, 6vw, 72px);
  overflow: hidden;
  background-color: var(--preloader-bg);
  color: var(--preloader-text);
  font-family: var(--font-sans, system-ui, sans-serif);
  user-select: none;
  cursor: pointer;
  will-change: transform;
}

/* Background Atmosphere: Warm Velvety Radial Orbs */
.preloader-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
}

.ambient-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
}

.ambient-glow--1 {
  width: 60vw;
  height: 60vw;
  top: 15%;
  left: 20%;
  background: radial-gradient(circle, rgba(217, 119, 6, 0.16) 0%, rgba(180, 83, 9, 0.04) 55%, transparent 75%);
  animation: glow-pulse 6s ease-in-out infinite alternate;
}

.ambient-glow--2 {
  width: 45vw;
  height: 45vw;
  bottom: 10%;
  right: 15%;
  background: radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, transparent 70%);
}

.film-grain {
  position: absolute;
  inset: 0;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

/* ==========================================================================
   Top Header Bar
   ========================================================================== */
.preloader-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 16px;
}

.brand-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
}

.brand-beacon {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--preloader-gold);
  box-shadow: 0 0 8px var(--preloader-gold);
  animation: beacon-breathe 1.5s infinite alternate;
}

.brand-name {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #fff;
}

.brand-sep {
  opacity: 0.25;
  font-size: 10px;
}

.brand-edition {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.15em;
  color: var(--preloader-muted);
}

/* Network Telemetry Chip */
.network-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(8px);
}

.network-ping-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot--excellent {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.7);
  animation: beacon-breathe 1.2s infinite alternate;
}

.dot--good {
  background: var(--preloader-gold);
  box-shadow: 0 0 8px var(--preloader-gold);
  animation: beacon-breathe 1.5s infinite alternate;
}

.dot--slow {
  background: #f97316;
  box-shadow: 0 0 8px rgba(249, 115, 22, 0.7);
}

.dot--offline {
  background: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.7);
}

.network-label {
  font-size: 10px;
  letter-spacing: 0.05em;
  color: #e5e7eb;
}

.skip-trigger {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 13px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--preloader-muted);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.skip-trigger kbd {
  font-family: var(--font-mono, monospace);
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--preloader-gold-light);
}

.skip-trigger:hover {
  background: rgba(217, 119, 6, 0.15);
  border-color: rgba(217, 119, 6, 0.4);
  color: #fff;
  transform: translateY(-1px);
}

/* ==========================================================================
   Center Stage: High-Fashion Monogram & Typography
   ========================================================================== */
.preloader-stage {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: clamp(28px, 4vw, 44px);
  margin: auto;
  max-width: 720px;
}

/* Monogram Disk */
.monogram-wrapper {
  position: relative;
  width: 76px;
  height: 76px;
  display: grid;
  place-items: center;
}

.monogram-halo {
  position: absolute;
  inset: -15%;
  border-radius: 50%;
  background: radial-gradient(circle, var(--preloader-gold-glow) 0%, transparent 70%);
  filter: blur(14px);
  animation: halo-scale 3s ease-in-out infinite alternate;
}

.monogram-disk {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 24px;
  background: radial-gradient(circle at 35% 30%, #1f1d1b 0%, #0e0d0c 100%);
  border: 1px solid rgba(217, 119, 6, 0.35);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  display: grid;
  place-items: center;
}

.monogram-img {
  width: 58%;
  height: 58%;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
}

/* Slogan */
.slogan-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.slogan-title {
  margin: 0;
  font-size: clamp(34px, 5.5vw, 64px);
  font-weight: 450;
  letter-spacing: 0.02em;
  line-height: 1.15;
}

.slogan-row {
  display: block;
}

.slogan-row--1 {
  color: #ffffff;
}

.slogan-row--2 {
  background: linear-gradient(135deg, #ffffff 0%, #fef3c7 40%, var(--preloader-gold) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-style: italic;
}

.slogan-desc {
  margin: 0;
  font-size: clamp(9px, 1.2vw, 11px);
  font-weight: 600;
  letter-spacing: 0.24em;
  color: var(--preloader-muted);
}

/* Progress System */
.progress-system {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: min(100%, 360px);
}

.counter-display {
  display: flex;
  align-items: baseline;
  gap: 3px;
  line-height: 1;
}

.counter-number {
  font-size: clamp(40px, 6vw, 56px);
  font-weight: 500;
  letter-spacing: -0.02em;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

.counter-percent {
  font-size: 14px;
  font-weight: 600;
  color: var(--preloader-gold);
}

.horizon-rail {
  position: relative;
  width: 100%;
  height: 2px;
}

.horizon-track {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
}

.horizon-fill {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(90deg, transparent 0%, var(--preloader-gold) 60%, var(--preloader-gold-light) 100%);
  border-radius: 999px;
  box-shadow: 0 0 14px var(--preloader-gold-glow);
  transition: width 0.15s linear;
}

.horizon-pin {
  position: absolute;
  top: 50%;
  right: -3px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 10px var(--preloader-gold-light), 0 0 0 2px rgba(217, 119, 6, 0.6);
  transform: translateY(-50%);
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--preloader-muted);
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--preloader-gold);
  animation: beacon-breathe 1.2s infinite alternate;
}

.status-dot--ready {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

/* ==========================================================================
   Bottom Footer
   ========================================================================== */
.preloader-footer {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 9px;
  letter-spacing: 0.16em;
  color: rgba(255, 255, 255, 0.35);
}

/* ==========================================================================
   Exit Curtain Reveal (向上轻抚丝滑升起)
   ========================================================================== */
.xo-preloader--exit {
  transform: translateY(-100%);
  transition: transform 0.82s cubic-bezier(0.85, 0, 0.15, 1);
  pointer-events: none;
}

.xo-preloader--exit .preloader-header {
  opacity: 0;
  transform: translateY(-15px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.xo-preloader--exit .preloader-stage {
  opacity: 0;
  transform: scale(0.96) translateY(-25px);
  transition: opacity 0.4s ease, transform 0.6s cubic-bezier(0.85, 0, 0.15, 1);
}

.xo-preloader--exit .preloader-footer {
  opacity: 0;
  transition: opacity 0.25s ease;
}

/* ==========================================================================
   Keyframe Animations
   ========================================================================== */
@keyframes beacon-breathe {
  from { opacity: 0.4; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1.15); }
}

@keyframes glow-pulse {
  0% { transform: scale(0.92); opacity: 0.8; }
  100% { transform: scale(1.08); opacity: 1.2; }
}

@keyframes halo-scale {
  0% { transform: scale(0.88); opacity: 0.6; }
  100% { transform: scale(1.12); opacity: 1; }
}

/* ==========================================================================
   Responsive Adaptations
   ========================================================================== */
@media (max-width: 640px) {
  .xo-preloader {
    padding: 20px 20px 28px;
  }
  .brand-edition {
    display: none;
  }
  .brand-sep {
    display: none;
  }
  .network-chip {
    display: none;
  }
  .preloader-footer {
    justify-content: center;
    text-align: center;
  }
  .preloader-footer span:last-child {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ambient-glow,
  .brand-beacon,
  .monogram-halo,
  .status-dot {
    animation: none !important;
  }
  .xo-preloader--exit {
    transition-duration: 0.01ms !important;
  }
}
</style>
