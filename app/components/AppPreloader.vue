<template>
  <Transition name="preloader">
    <section
      v-if="visible"
      :class="['preloader', `preloader--${phase}`]"
      aria-label="页面加载中"
      aria-busy="true"
    >
      <div class="preloader__backdrop" aria-hidden="true" />
      <div class="preloader__grid" aria-hidden="true" />
      <div class="preloader__halo preloader__halo--one" aria-hidden="true" />
      <div class="preloader__halo preloader__halo--two" aria-hidden="true" />
      <div class="preloader__grain" aria-hidden="true" />

      <header class="preloader__header">
        <div class="brand">
          <span class="brand__mark" aria-hidden="true"><span /></span>
          <span class="brand__name">XO 影像工作室</span>
          <span class="brand__divider" aria-hidden="true" />
          <span class="brand__sub">动效 / 影像</span>
        </div>

        <div class="header__meta">
          <span class="meta-chip"><i /> 系统就绪</span>
          <span class="meta-year">2026 / 01</span>
          <button class="skip-button" type="button" @click="skipIntro">
            <span>跳过开场</span>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" />
            </svg>
          </button>
        </div>
      </header>

      <main class="preloader__main">
        <div class="preloader__copy">
          <p class="eyebrow"><span>01</span> 开场序列 <i /></p>
          <h1>
            <span>让空间</span>
            <em>容纳情绪。</em>
          </h1>
          <p class="description">
            记录有温度的影像故事，让每一帧都拥有自己的节奏、视角与呼吸感。
          </p>

          <div class="feature-row" aria-label="工作室特点">
            <div class="feature">
              <span class="feature__number">01</span>
              <span class="feature__label">视觉叙事</span>
            </div>
            <div class="feature">
              <span class="feature__number">02</span>
              <span class="feature__label">安静细节</span>
            </div>
            <div class="feature">
              <span class="feature__number">03</span>
              <span class="feature__label">温暖信号</span>
            </div>
          </div>
        </div>

        <div class="preloader__visual">
          <div class="visual__topline">
            <span>XO / 核心</span>
            <span>实时信号 <i /></span>
          </div>

          <div class="core" aria-hidden="true">
            <div class="core__shadow" />
            <div class="core__ring core__ring--outer" />
            <div class="core__ring core__ring--middle" />
            <div class="core__ring core__ring--inner" />
            <div class="core__cross core__cross--vertical" />
            <div class="core__cross core__cross--horizontal" />
            <div class="core__orbit core__orbit--one"><i /></div>
            <div class="core__orbit core__orbit--two"><i /></div>
            <div class="core__logo"><img src="/logo.png?v=20260726" alt="" /></div>
            <div class="core__beam" />
          </div>

          <div class="visual__bottomline">
            <span>创立于 2026</span>
            <span>画面 <strong>{{ String(Math.floor(progress)).padStart(2, '0') }}</strong></span>
          </div>
        </div>
      </main>

      <footer class="preloader__footer">
        <div class="status" role="status" aria-live="polite">
          <span class="status__pulse" aria-hidden="true"><i /></span>
          <span class="status__copy">
            <strong>{{ status }}</strong>
            <small>{{ networkLabel }}</small>
          </span>
        </div>

        <div class="progress" aria-label="加载进度">
          <div class="progress__label"><strong>{{ String(Math.floor(progress)).padStart(2, '0') }}</strong><span>%</span></div>
          <div class="progress__rail" aria-hidden="true">
            <span class="progress__track" />
            <span class="progress__fill" :style="{ width: `${progress}%` }" />
            <i class="progress__marker" :style="{ left: `${progress}%` }" />
            <b v-for="tick in 5" :key="tick" :style="{ left: `${(tick - 1) * 25}%` }" />
          </div>
          <span class="progress__end">100</span>
        </div>
      </footer>
    </section>
  </Transition>
</template>

<script setup lang="ts">
const emit = defineEmits<{ (event: 'complete'): void; (event: 'reveal-start'): void }>()
const visible = ref(true)
const phase = ref<'enter' | 'active' | 'exit'>('enter')
const progress = ref(0)
const status = ref('正在准备工作室')
const networkLabel = ref('正在检查网络连接')
let frame = 0
let startedAt = 0
let finishTimer: number | null = null
let fallbackTimer: number | null = null
let finishing = false
let pageLoaded = false
let ready = false
let minimumDisplayMs = 3200
let revealDurationMs = 2600
let loadHandler: (() => void) | null = null
let domContentLoadedHandler: (() => void) | null = null
let networkHandler: (() => void) | null = null
let connectionChangeHandler: (() => void) | null = null

type NetworkInformationLike = EventTarget & {
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
}

let networkConnection: NetworkInformationLike | null = null

const tasks = reactive({ document: 0, network: 0, api: 0, assets: 0, fonts: 0 })

const weightedProgress = () => (
  tasks.document * 18
  + tasks.network * 22
  + tasks.api * 30
  + tasks.assets * 20
  + tasks.fonts * 10
)

const updateNetworkTiming = (rtt: number) => {
  const effectiveType = networkConnection?.effectiveType
  const measuredRtt = Math.max(0, rtt || networkConnection?.rtt || 0)
  const isSlow = networkConnection?.saveData
    || effectiveType === 'slow-2g'
    || effectiveType === '2g'
    || measuredRtt > 700
  const isModerate = effectiveType === '3g' || measuredRtt > 260
  const networkFloor = isSlow ? 5600 : isModerate ? 3900 : 2500
  const latencyBuffer = Math.min(1900, Math.round(measuredRtt * (isSlow ? 1.15 : .7)))
  minimumDisplayMs = Math.min(7800, Math.max(2500, networkFloor + latencyBuffer))
  revealDurationMs = Math.min(6000, Math.max(2200, Math.round(minimumDisplayMs * .82)))
}

const finish = () => {
  if (finishing) return
  finishing = true
  progress.value = 100
  phase.value = 'exit'
  emit('reveal-start')
  finishTimer = window.setTimeout(() => {
    visible.value = false
    emit('complete')
  }, 780)
}

const skipIntro = () => {
  if (!finishing) finish()
}

onMounted(() => {
  startedAt = Date.now()
  requestAnimationFrame(() => { phase.value = 'active' })

  networkConnection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection || null
  updateNetworkTiming(networkConnection?.rtt || 0)

  const updateNetworkLabel = () => {
    if (!navigator.onLine) {
      networkLabel.value = '当前离线 / 使用本地内容'
      return
    }
    const effectiveType = networkConnection?.effectiveType
    const downlink = networkConnection?.downlink || 0
    const rtt = networkConnection?.rtt || 0
    networkLabel.value = networkConnection?.saveData || effectiveType === 'slow-2g' || effectiveType === '2g' || rtt > 700
      ? '网络较慢 / 正在保留加载时间'
      : downlink >= 8 || (rtt > 0 && rtt < 180) || effectiveType === '4g'
        ? '网络良好 / 正在加载资源'
        : '正在读取网络信号'
  }

  const markPageLoaded = () => {
    pageLoaded = true
    tasks.document = 1
  }

  loadHandler = markPageLoaded
  domContentLoadedHandler = markPageLoaded
  networkHandler = updateNetworkLabel
  connectionChangeHandler = updateNetworkLabel
  if (document.readyState !== 'loading') markPageLoaded()
  else {
    document.addEventListener('DOMContentLoaded', domContentLoadedHandler, { once: true })
    window.addEventListener('load', loadHandler, { once: true })
  }
  window.addEventListener('online', networkHandler)
  window.addEventListener('offline', networkHandler)
  networkConnection?.addEventListener('change', connectionChangeHandler)
  updateNetworkLabel()

  const probeNetwork = async () => {
    const started = performance.now()
    try {
      await fetch(`/api/site-config?preload=${Date.now()}`, { cache: 'no-store', headers: { 'cache-control': 'no-cache' } })
      const rtt = performance.now() - started
      if (networkConnection && !networkConnection.rtt) networkConnection.rtt = rtt
      updateNetworkTiming(rtt)
      tasks.network = 1
      networkLabel.value = rtt < 180 ? '网络良好 / 正在加载资源' : rtt < 600 ? '网络稳定 / 正在加载资源' : '网络较慢 / 正在保留加载时间'
    } catch {
      updateNetworkTiming(networkConnection?.rtt || 900)
      tasks.network = 1
      networkLabel.value = navigator.onLine ? '网络响应稍慢 / 正在继续加载' : '当前离线 / 使用本地内容'
    }
  }

  const probeApi = async () => {
    try {
      await Promise.all([
        fetch(`/api/site-config?preload-config=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/projects?preload-projects=${Date.now()}`, { cache: 'no-store' })
      ])
    } finally {
      tasks.api = 1
    }
  }

  const preloadImage = (src: string) => new Promise<void>((resolve) => {
    const image = new Image()
    image.onload = () => resolve()
    image.onerror = () => resolve()
    image.src = src
  })

  void Promise.allSettled([
    probeNetwork(),
    probeApi(),
    preloadImage('/logo.png?v=20260726'),
    document.fonts?.ready ?? Promise.resolve()
  ]).then(() => {
    tasks.assets = 1
    tasks.fonts = 1
    ready = true
  })

  fallbackTimer = window.setTimeout(() => {
    ready = true
    tasks.document = 1
    tasks.network = 1
    tasks.api = 1
    tasks.assets = 1
    tasks.fonts = 1
  }, 10000)

  const tick = () => {
    if (finishing) return
    const elapsed = Date.now() - startedAt
    const minimumDisplayProgress = Math.min(16, elapsed / 900 * 16)
    const revealCeiling = elapsed < revealDurationMs ? Math.min(96, 8 + elapsed / revealDurationMs * 88) : 96
    const target = ready && pageLoaded && elapsed >= minimumDisplayMs
      ? 100
      : Math.min(revealCeiling, Math.max(minimumDisplayProgress, weightedProgress()))
    progress.value += (target - progress.value) * 0.12
    if (Math.abs(target - progress.value) < 0.1) progress.value = target
    status.value = progress.value < 35
      ? '正在准备工作室'
      : progress.value < 70
        ? '正在调和视觉氛围'
        : progress.value < 96
          ? '正在打开作品集'
          : '欢迎来到 XO'
    if (ready && pageLoaded && elapsed >= minimumDisplayMs && progress.value >= 99.5) {
      finish()
      return
    }
    frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  if (finishTimer !== null) window.clearTimeout(finishTimer)
  if (fallbackTimer !== null) window.clearTimeout(fallbackTimer)
  if (loadHandler) window.removeEventListener('load', loadHandler)
  if (domContentLoadedHandler) document.removeEventListener('DOMContentLoaded', domContentLoadedHandler)
  if (networkHandler) {
    window.removeEventListener('online', networkHandler)
    window.removeEventListener('offline', networkHandler)
  }
  if (connectionChangeHandler) networkConnection?.removeEventListener('change', connectionChangeHandler)
})
</script>

<style scoped>
.preloader {
  --ink: #151a28;
  --ink-soft: #546177;
  --line: rgba(32, 45, 74, .13);
  --accent: #2575d7;
  --accent-cyan: #37c4c0;
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(18px, 3.4vw, 52px) clamp(18px, 5.2vw, 84px);
  overflow: hidden;
  color: var(--ink);
  background: #eef8f7;
  font-family: var(--font-sans, system-ui, sans-serif);
  isolation: isolate;
  backface-visibility: hidden;
  will-change: opacity, transform;
}
.preloader__backdrop,
.preloader__grid,
.preloader__grain { position: absolute; inset: 0; pointer-events: none; }
.preloader__backdrop { z-index: -4; background: linear-gradient(135deg, #effcf7 0%, #e8f1fb 54%, #fff0e5 100%); }
.preloader__backdrop::after { position: absolute; inset: 0; background: linear-gradient(115deg, transparent 34%, rgba(255,255,255,.48) 49%, transparent 62%); content: ''; animation: light-sweep 10s ease-in-out infinite alternate; }
.preloader__grid { z-index: -3; opacity: .32; background-image: linear-gradient(rgba(45, 93, 128, .12) 1px, transparent 1px), linear-gradient(90deg, rgba(45, 93, 128, .12) 1px, transparent 1px); background-size: 72px 72px; mask-image: linear-gradient(to bottom, black, transparent 84%); }
.preloader__grain { z-index: 5; opacity: .08; mix-blend-mode: multiply; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.22'/%3E%3C/svg%3E"); }
.preloader::before { position: absolute; inset: 12px; z-index: -2; border: 1px solid rgba(255,255,255,.76); border-radius: 28px; box-shadow: 0 0 0 1px rgba(58, 111, 146, .08), inset 0 1px 0 rgba(255,255,255,.8); content: ''; pointer-events: none; }
.preloader__halo { position: absolute; z-index: -2; border-radius: 50%; filter: blur(4px); pointer-events: none; }
.preloader__halo--one { width: 44vw; height: 44vw; top: -25%; right: -8%; background: radial-gradient(circle, rgba(88, 215, 201, .32), transparent 68%); }
.preloader__halo--two { width: 38vw; height: 38vw; bottom: -25%; left: -10%; background: radial-gradient(circle, rgba(255, 191, 143, .24), transparent 68%); }
.preloader__header,
.preloader__footer { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 58px; padding: 8px 10px 8px 14px; border: 1px solid rgba(255,255,255,.8); border-radius: 20px; background: rgba(255,255,255,.4); box-shadow: 0 14px 38px rgba(67, 105, 132, .08), inset 0 1px 0 rgba(255,255,255,.9); backdrop-filter: blur(18px) saturate(1.35); -webkit-backdrop-filter: blur(18px) saturate(1.35); }
.brand, .header__meta, .meta-chip, .skip-button, .visual__topline, .visual__bottomline { display: flex; align-items: center; }
.brand { gap: 10px; min-width: 0; }
.brand__mark { display: grid; place-items: center; width: 27px; height: 27px; border: 1px solid rgba(36, 117, 215, .42); border-radius: 9px; background: rgba(255,255,255,.56); transform: rotate(45deg); }
.brand__mark span { width: 8px; height: 8px; border: 2px solid var(--accent); border-radius: 3px; }
.brand__name { font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; white-space: nowrap; }
.brand__divider { width: 1px; height: 15px; margin: 0 2px; background: var(--line); }
.brand__sub, .meta-year { color: var(--ink-soft); font-family: var(--font-mono, monospace); font-size: 9px; letter-spacing: .14em; text-transform: uppercase; }
.header__meta { gap: clamp(12px, 2.4vw, 28px); }
.meta-chip { gap: 7px; min-height: 28px; padding: 0 11px; border: 1px solid rgba(37,117,215,.14); border-radius: 999px; color: #31729d; background: rgba(220, 250, 247, .56); font-family: var(--font-mono, monospace); font-size: 9px; letter-spacing: .08em; text-transform: uppercase; white-space: nowrap; }
.meta-chip i { width: 6px; height: 6px; border-radius: 50%; background: var(--accent-cyan); box-shadow: 0 0 0 4px rgba(55,196,192,.15); animation: pulse 1.5s ease-in-out infinite; }
.skip-button { gap: 8px; min-height: 38px; padding: 0 13px; border: 1px solid rgba(37, 57, 87, .18); border-radius: 12px; color: var(--ink); background: rgba(255,255,255,.58); font: inherit; font-size: 10px; font-weight: 600; letter-spacing: .05em; cursor: pointer; transition: transform .25s ease, border-color .25s ease, background .25s ease; }
.skip-button svg { width: 15px; height: 15px; fill: none; stroke: var(--accent); stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.5; transition: transform .25s ease; }
.skip-button:hover { border-color: rgba(37,117,215,.42); background: #fff; transform: translateY(-2px); }
.skip-button:hover svg { transform: translateX(3px); }
.skip-button:active { transform: scale(.97); }
.skip-button:focus-visible { outline: 3px solid rgba(37,117,215,.26); outline-offset: 4px; }
.preloader__main { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, .92fr) minmax(330px, .8fr); align-items: center; gap: clamp(40px, 8vw, 138px); width: min(100%, 1110px); margin: auto; }
.eyebrow { display: inline-flex; align-items: center; gap: 10px; margin: 0 0 clamp(20px, 3vw, 30px); padding: 8px 11px; border: 1px solid rgba(255,255,255,.8); border-radius: 999px; color: var(--ink-soft); background: rgba(255,255,255,.43); font-family: var(--font-mono, monospace); font-size: 10px; letter-spacing: .11em; text-transform: uppercase; }
.eyebrow span { color: var(--accent); font-weight: 700; }
.eyebrow i { width: 28px; height: 1px; background: var(--accent); }
h1 { max-width: 620px; margin: 0; font-family: var(--font-display, Georgia, serif); font-size: clamp(58px, 8vw, 112px); font-weight: 450; letter-spacing: .01em; line-height: .93; }
h1 span, h1 em { display: block; animation: title-rise .9s cubic-bezier(.16,1,.3,1) both; }
h1 em { color: var(--accent); font-style: normal; animation-delay: .12s; }
.description { max-width: 370px; margin: clamp(23px, 3vw, 32px) 0 0; color: var(--ink-soft); font-size: 14px; letter-spacing: .01em; line-height: 1.75; animation: fade-up .9s .3s cubic-bezier(.16,1,.3,1) both; }
.feature-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; max-width: 470px; margin-top: clamp(30px, 4.4vw, 52px); }
.feature { min-width: 0; padding: 12px 13px; border-top: 1px solid rgba(38, 76, 104, .2); }
.feature__number { display: block; margin-bottom: 9px; color: var(--accent); font-family: var(--font-mono, monospace); font-size: 9px; letter-spacing: .12em; }
.feature__label { display: block; overflow: hidden; color: var(--ink); font-size: 11px; font-weight: 600; letter-spacing: .02em; text-overflow: ellipsis; white-space: nowrap; }
.preloader__visual { justify-self: center; width: min(100%, 420px); padding: 17px 18px 14px; border: 1px solid rgba(255,255,255,.82); border-radius: 30px; background: rgba(255,255,255,.34); box-shadow: 0 26px 70px rgba(54, 88, 120, .16), inset 0 1px 0 rgba(255,255,255,.9); backdrop-filter: blur(22px) saturate(1.2); -webkit-backdrop-filter: blur(22px) saturate(1.2); animation: visual-float 5s ease-in-out infinite; }
.visual__topline, .visual__bottomline { justify-content: space-between; color: var(--ink-soft); font-family: var(--font-mono, monospace); font-size: 8px; letter-spacing: .14em; text-transform: uppercase; }
.visual__topline i { display: inline-block; width: 5px; height: 5px; margin-left: 6px; border-radius: 50%; background: var(--accent-cyan); box-shadow: 0 0 0 3px rgba(55,196,192,.12); }
.visual__bottomline { padding-top: 12px; border-top: 1px solid rgba(37,57,87,.1); }
.visual__bottomline strong { color: var(--accent); font-weight: 500; }
.core { position: relative; display: grid; place-items: center; aspect-ratio: 1; margin: 8px 0 12px; border-radius: 50%; background: radial-gradient(circle at 45% 34%, rgba(255,255,255,.85), rgba(217,243,246,.42) 42%, rgba(177,213,236,.12) 68%, transparent 69%); }
.core__shadow { position: absolute; inset: 19%; border-radius: 50%; background: rgba(45, 104, 143, .1); filter: blur(25px); }
.core__ring, .core__cross, .core__orbit, .core__beam { position: absolute; }
.core__ring { border: 1px solid rgba(37,117,215,.4); border-radius: 50%; }
.core__ring--outer { inset: 6%; border-color: rgba(37,117,215,.28); animation: spin 24s linear infinite; }
.core__ring--middle { inset: 16%; border-style: dashed; border-color: rgba(55,196,192,.48); animation: spin-reverse 16s linear infinite; }
.core__ring--inner { inset: 29%; border-color: rgba(255,255,255,.95); box-shadow: 0 0 0 1px rgba(37,117,215,.12), 0 14px 28px rgba(45,105,143,.1); }
.core__cross { background: rgba(37, 71, 101, .13); }
.core__cross--vertical { top: 4%; bottom: 4%; left: 50%; width: 1px; }
.core__cross--horizontal { top: 50%; right: 4%; left: 4%; height: 1px; }
.core__orbit { inset: 9%; border: 1px solid transparent; border-top-color: rgba(37,117,215,.58); border-radius: 50%; transform: rotate(-35deg); animation: spin 8s linear infinite; }
.core__orbit--two { inset: 22%; border-top-color: rgba(55,196,192,.5); transform: rotate(48deg); animation-duration: 6s; animation-direction: reverse; }
.core__orbit i { position: absolute; top: -3px; left: 50%; width: 5px; height: 5px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 3px rgba(37,117,215,.15), 0 0 13px rgba(37,117,215,.52); }
.core__logo { position: relative; z-index: 2; display: grid; place-items: center; width: 39%; height: 39%; border: 1px solid rgba(255,255,255,.85); border-radius: 28%; background: rgba(255,255,255,.56); box-shadow: 0 18px 38px rgba(46, 96, 125, .16), inset 0 1px 0 rgba(255,255,255,.96); animation: logo-breathe 3.4s ease-in-out infinite; }
.core__logo img { width: 72%; height: 72%; object-fit: contain; }
.core__beam { top: 50%; left: 50%; z-index: 3; width: 46%; height: 2px; background: linear-gradient(90deg, transparent, rgba(55,196,192,.9), transparent); filter: blur(3px); transform: translate(-50%, -50%); animation: beam 2.6s ease-in-out infinite; }
.preloader__footer { gap: 30px; }
.status { display: flex; align-items: center; gap: 10px; min-width: 0; padding: 0 8px; }
.status__pulse { display: grid; place-items: center; width: 14px; height: 14px; border: 1px solid rgba(37,117,215,.28); border-radius: 50%; }
.status__pulse i { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); animation: pulse 1.2s ease-in-out infinite; }
.status__copy { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.status__copy strong { color: var(--ink); font-size: 11px; font-weight: 650; letter-spacing: .02em; white-space: nowrap; }
.status__copy small { overflow: hidden; max-width: 320px; color: var(--ink-soft); font-family: var(--font-mono, monospace); font-size: 8px; letter-spacing: .04em; text-overflow: ellipsis; white-space: nowrap; }
.progress { display: grid; grid-template-columns: auto minmax(150px, min(30vw, 330px)) auto; align-items: center; gap: 12px; min-width: min(47vw, 430px); padding: 6px 10px; border: 1px solid rgba(255,255,255,.84); border-radius: 999px; background: rgba(255,255,255,.48); }
.progress__label { display: flex; align-items: baseline; gap: 2px; min-width: 42px; }
.progress__label strong { font-family: var(--font-mono, monospace); font-size: 17px; font-weight: 500; }
.progress__label span, .progress__end { color: var(--ink-soft); font-family: var(--font-mono, monospace); font-size: 8px; letter-spacing: .08em; }
.progress__rail { position: relative; height: 10px; }
.progress__track, .progress__fill { position: absolute; top: 4px; left: 0; height: 2px; border-radius: 999px; }
.progress__track { width: 100%; background: rgba(31, 66, 96, .14); }
.progress__fill { background: linear-gradient(90deg, var(--accent), var(--accent-cyan)); box-shadow: 0 0 12px rgba(37,117,215,.36); transition: width 90ms linear; }
.progress__marker { position: absolute; top: 1px; width: 8px; height: 8px; border: 2px solid #eff8f7; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 1px var(--accent), 0 0 8px rgba(37,117,215,.38); transform: translateX(-50%); transition: left 90ms linear; }
.progress__rail b { position: absolute; top: 3px; width: 2px; height: 4px; background: var(--ink); opacity: .22; transform: translateX(-50%); }
.preloader--enter .preloader__header { opacity: 0; transform: translateY(-20px); }
.preloader--enter .preloader__main { opacity: 0; transform: translateY(24px) scale(.97); }
.preloader--enter .preloader__footer { opacity: 0; transform: translateY(20px); }
.preloader__header { animation: top-enter .85s .08s cubic-bezier(.16,1,.3,1) both; }
.preloader__main { animation: main-enter 1s .15s cubic-bezier(.16,1,.3,1) both; }
.preloader__footer { animation: bottom-enter .8s .32s cubic-bezier(.16,1,.3,1) both; }
.preloader--exit { opacity: 0; transform: translateY(-14px); transition: opacity .62s ease, transform .62s cubic-bezier(.76,0,.24,1); }
.preloader--exit .preloader__header { opacity: 0; transform: translateY(-16px); transition: opacity .35s ease, transform .35s ease; }
.preloader--exit .preloader__main { opacity: 0; transform: translateY(-10px) scale(1.03); transition: opacity .68s .04s cubic-bezier(.76,0,.24,1), transform .68s .04s cubic-bezier(.76,0,.24,1); }
.preloader--exit .preloader__footer { opacity: 0; transform: translateY(14px); transition: opacity .35s ease, transform .35s ease; }
.preloader--exit .core__logo { transform: scale(.7) rotate(10deg); opacity: 0; transition: opacity .58s ease, transform .58s ease; }
.preloader--exit .core__ring, .preloader--exit .core__orbit { opacity: 0; transform: scale(1.18) rotate(34deg); transition: opacity .65s ease, transform .65s cubic-bezier(.76,0,.24,1); }
@keyframes pulse { 50% { opacity: .3; transform: scale(.7); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes spin-reverse { to { transform: rotate(-360deg); } }
@keyframes light-sweep { from { transform: translateX(-12%) rotate(-8deg); } to { transform: translateX(12%) rotate(-8deg); } }
@keyframes visual-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
@keyframes logo-breathe { 0%, 100% { transform: scale(.98); } 50% { transform: scale(1.04); } }
@keyframes beam { 0%, 100% { opacity: .2; transform: translate(-50%, -50%) scaleX(.65); } 50% { opacity: .8; transform: translate(-50%, -50%) scaleX(1.1); } }
@keyframes title-rise { from { opacity: 0; transform: translateY(28px); clip-path: inset(100% 0 0); } to { opacity: 1; transform: translateY(0); clip-path: inset(0); } }
@keyframes fade-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes top-enter { from { opacity: 0; transform: translateY(-18px); } to { opacity: 1; transform: translateY(0); } }
@keyframes main-enter { from { opacity: 0; transform: translateY(22px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes bottom-enter { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 760px) {
  .preloader { padding: 16px 16px 18px; }
  .preloader::before { inset: 8px; border-radius: 22px; }
  .preloader__header { min-height: 54px; padding-left: 11px; }
  .brand__divider, .brand__sub, .meta-chip, .meta-year { display: none; }
  .brand__name { font-size: 11px; }
  .header__meta { margin-left: auto; }
  .skip-button { min-height: 36px; }
  .preloader__main { grid-template-columns: 1fr; gap: 28px; width: min(100%, 510px); }
  h1 { font-size: clamp(56px, 16vw, 84px); }
  .description { max-width: 310px; margin-top: 20px; font-size: 13px; }
  .feature-row { margin-top: 28px; }
  .feature { padding: 10px 8px; }
  .feature__label { font-size: 10px; }
  .preloader__visual { width: min(68vw, 300px); padding: 12px 13px 11px; border-radius: 24px; }
  .preloader__footer { align-items: center; gap: 12px; padding: 8px; }
  .status { flex: 0 1 132px; padding: 0 3px; }
  .status__copy strong { font-size: 10px; }
  .status__copy small { display: none; }
  .progress { grid-template-columns: auto minmax(76px, 1fr) auto; min-width: 0; flex: 1; gap: 7px; padding: 5px 8px; }
  .progress__label strong { font-size: 14px; }
}
@media (max-width: 420px) {
  .preloader__main { gap: 20px; }
  .eyebrow { margin-bottom: 18px; font-size: 9px; }
  h1 { font-size: clamp(50px, 15.5vw, 68px); }
  .feature-row { gap: 4px; }
  .preloader__visual { width: min(64vw, 250px); }
  .preloader__footer { padding: 7px; }
  .status { flex-basis: 112px; }
  .status__copy strong { max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}
@media (prefers-reduced-motion: reduce) {
  .preloader__backdrop::after, .preloader__halo, .preloader__grain, .meta-chip i, .core__ring, .core__orbit, .core__logo, .core__beam, .preloader__visual, .status__pulse i, h1 span, h1 em, .description { animation: none; }
  .preloader--exit, .preloader--exit .preloader__header, .preloader--exit .preloader__main, .preloader--exit .preloader__footer, .preloader--exit .core__logo, .preloader--exit .core__ring, .preloader--exit .core__orbit { transition-duration: .01ms; }
}
</style>
