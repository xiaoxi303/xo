<template>
  <Transition name="preloader">
    <section
      v-if="visible"
      :class="['preloader', `preloader--${phase}`]"
      aria-label="页面加载中"
      aria-busy="true"
    >
      <div class="preloader__wash" aria-hidden="true" />
      <div class="preloader__grid" aria-hidden="true" />
      <div class="preloader__scan" aria-hidden="true" />

      <header class="preloader__top preloader__top--enter">
        <div class="brand-lockup">
          <span class="brand-lockup__dot" aria-hidden="true" />
          <span>XO / 影像工作室</span>
        </div>
        <div class="preloader__top-meta">
          <span class="preloader__sequence">SEQ 01 <i /> 04</span>
          <span class="preloader__year">创立于 2026</span>
          <button class="skip-button" type="button" @click="skipIntro">
            跳过开场
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </header>

      <main class="preloader__main preloader__main--enter">
        <div class="preloader__copy">
          <p class="eyebrow"><span>01</span> 序章 / 开始 <i aria-hidden="true" /></p>
          <h1>
            <span class="title-line">让灵感</span>
            <br>
            <em class="title-line title-line--accent">开始流动</em>
          </h1>
          <p class="description">记录影像、色彩与叙事，让每一帧都拥有自己的情绪。</p>

          <div class="preloader__specs" aria-label="作品集规格">
            <div><span>REEL</span><strong>2026 / 01</strong></div>
            <div><span>FORMAT</span><strong>4K · HDR</strong></div>
            <div><span>COLOR</span><strong>WARM / 01</strong></div>
          </div>
        </div>

        <div class="mark-wrap">
          <div class="mark" aria-hidden="true">
            <span class="mark__cross mark__cross--vertical" />
            <span class="mark__cross mark__cross--horizontal" />
            <i class="ring ring--outer" />
            <i class="ring ring--inner" />
            <i class="ring ring--orbit" />
            <i class="orbit-dot" />
            <img src="/logo.png" alt="" class="mark__logo">
            <span class="mark__index">XO</span>
          </div>
          <div class="mark-caption"><span>FRAME 01</span><span>LOADING SIGNAL</span></div>
        </div>
      </main>

      <footer class="preloader__bottom preloader__bottom--enter">
        <div class="status" role="status" aria-live="polite">
          <span class="status__indicator" aria-hidden="true" />
          <span>{{ status }}</span>
          <small>{{ networkLabel }}</small>
        </div>
        <div class="progress" aria-label="加载进度">
          <div class="progress__numbers"><strong>{{ String(Math.floor(progress)).padStart(2, '0') }}</strong><small>%</small></div>
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
const status = ref('正在整理工作室')
const networkLabel = ref('正在检测网络')
let frame = 0
let startedAt = 0
let loaded = false
let presentationMs = 2600
let networkScore = 18
let probeTimer: number | null = null
let finishTimer: number | null = null
let finishing = false

const finish = () => {
  if (finishing) return
  finishing = true
  progress.value = 100
  phase.value = 'exit'
  emit('reveal-start')
  finishTimer = window.setTimeout(() => {
    visible.value = false
    emit('complete')
  }, 1000)
}

const skipIntro = () => finish()

onMounted(() => {
  startedAt = Date.now()
  requestAnimationFrame(() => {
    phase.value = 'active'
  })

  const connection = (navigator as Navigator & {
    connection?: { effectiveType?: string; saveData?: boolean }
  }).connection
  if (connection?.saveData || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
    presentationMs = 5600
  } else if (connection?.effectiveType === '3g') {
    presentationMs = 4500
  } else if (connection?.effectiveType === '4g') {
    presentationMs = 3200
  }

  loaded = document.readyState === 'complete'
  if (!loaded) window.addEventListener('load', () => { loaded = true }, { once: true })

  const probeNetwork = async () => {
    const started = performance.now()
    try {
      await fetch(`/api/system-status?preload=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'cache-control': 'no-cache' }
      })
      const rtt = performance.now() - started
      const currentConnection = (navigator as Navigator & {
        connection?: { downlink?: number; rtt?: number }
      }).connection
      const apiRtt = currentConnection?.rtt || rtt
      const downlink = currentConnection?.downlink || 0
      networkScore = Math.min(100, networkScore + (apiRtt < 180 ? 9 : apiRtt < 450 ? 5 : 2))
      if (downlink >= 8 || apiRtt < 120) networkLabel.value = '网络状态良好'
      else if (downlink >= 1.5 || apiRtt < 400) networkLabel.value = '网络状态稳定'
      else networkLabel.value = '网络较慢，正在继续加载'
    } catch {
      networkScore = Math.max(12, networkScore - 4)
      networkLabel.value = '网络响应较慢'
    }
    if (!loaded && !finishing) probeTimer = window.setTimeout(probeNetwork, 850)
  }
  probeNetwork()

  const tick = () => {
    if (finishing) return
    const elapsed = Date.now() - startedAt
    const timeProgress = Math.min(100, elapsed / presentationMs * 100)
    const networkProgress = Math.min(92, 18 + networkScore * 0.74)
    const target = loaded ? Math.max(timeProgress, 100) : Math.min(timeProgress, networkProgress)
    progress.value += (target - progress.value) * 0.08
    if (Math.abs(target - progress.value) < 0.1) progress.value = target
    status.value = progress.value < 35
      ? '正在整理工作室'
      : progress.value < 70
        ? '正在调和视觉氛围'
        : progress.value < 96
          ? '正在打开作品集'
          : '欢迎来到 Xo'
    if (loaded && elapsed > presentationMs * 0.76 && progress.value >= 99.8) {
      finish()
      return
    }
    frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  if (probeTimer !== null) window.clearTimeout(probeTimer)
  if (finishTimer !== null) window.clearTimeout(finishTimer)
})
</script>

<style scoped>
.preloader {
  --cream: #f3eee6;
  --ink: #171614;
  --muted: rgba(23, 22, 20, .54);
  --line: rgba(23, 22, 20, .16);
  --accent: #b06c28;
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(24px, 4.2vw, 64px) clamp(22px, 6.2vw, 104px);
  overflow: hidden;
  color: var(--ink);
  background: var(--cream);
  font-family: var(--font-sans, 'Xo Sans', system-ui, sans-serif);
  isolation: isolate;
  backface-visibility: hidden;
  will-change: opacity, transform;
}

.preloader__wash,
.preloader__grid,
.preloader__scan { position: absolute; inset: 0; pointer-events: none; }
.preloader__wash { z-index: -3; background: rgba(255, 255, 255, .16); }
.preloader__grid { z-index: -2; opacity: .52; background: linear-gradient(90deg, transparent calc(50% - .5px), var(--line) 50%, transparent calc(50% + .5px)), linear-gradient(0deg, transparent calc(50% - .5px), rgba(23, 22, 20, .06) 50%, transparent calc(50% + .5px)); }
.preloader__grid::after { position: absolute; inset: 7% 6%; border: 1px solid rgba(23, 22, 20, .08); content: ''; }
.preloader__scan { z-index: -1; top: -18%; bottom: auto; height: 1px; background: linear-gradient(90deg, transparent, rgba(176, 108, 40, .72), transparent); box-shadow: 0 0 22px rgba(176, 108, 40, .48); animation: scan 4.6s ease-in-out infinite; }

.preloader__top,
.preloader__bottom { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; width: 100%; border-bottom: 1px solid var(--line); padding-bottom: 14px; font-size: 10px; letter-spacing: .18em; text-transform: uppercase; }
.brand-lockup { display: inline-flex; align-items: center; gap: 10px; font-weight: 650; }
.brand-lockup__dot { width: 7px; height: 7px; border: 1px solid var(--accent); border-radius: 50%; box-shadow: 0 0 0 3px rgba(176, 108, 40, .11); }
.preloader__top-meta { display: flex; align-items: center; gap: clamp(16px, 3vw, 42px); color: var(--muted); }
.preloader__sequence { display: inline-flex; align-items: center; gap: 9px; color: var(--ink); font-family: var(--font-mono, monospace); font-size: 9px; letter-spacing: .14em; }
.preloader__sequence i { width: 24px; height: 1px; background: var(--accent); opacity: .7; }
.preloader__year { opacity: .7; }
.skip-button { display: inline-flex; align-items: center; gap: 8px; border: 0; padding: 4px 0; color: var(--muted); background: transparent; font: inherit; font-size: 9px; letter-spacing: .12em; cursor: pointer; transition: color .25s ease; }
.skip-button span { color: var(--accent); font-size: 14px; line-height: 0; transform: translateY(-1px); transition: transform .25s ease; }
.skip-button:hover { color: var(--ink); }
.skip-button:hover span { transform: translate(2px, -2px); }
.skip-button:focus-visible { outline: 1px solid var(--accent); outline-offset: 6px; }

.preloader__main { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(300px, .92fr); align-items: center; gap: clamp(42px, 8vw, 140px); width: min(100%, 1160px); margin: auto; }
.preloader__copy { min-width: 0; }
.eyebrow { display: flex; align-items: center; gap: 11px; margin: 0 0 clamp(20px, 3vw, 34px); color: var(--muted); font-family: var(--font-mono, monospace); font-size: 10px; letter-spacing: .18em; }
.eyebrow span { color: var(--accent); font-size: 11px; }
.eyebrow i { width: 35px; height: 1px; background: var(--accent); opacity: .7; }
h1 { margin: 0; font-family: var(--font-display, Georgia, serif); font-size: clamp(56px, 7.8vw, 118px); font-weight: 450; letter-spacing: .015em; line-height: .99; }
h1 em { color: var(--accent); font-style: normal; font-weight: 400; }
.description { max-width: 300px; margin: clamp(22px, 3vw, 34px) 0 0; color: var(--muted); font-size: 13px; letter-spacing: .08em; line-height: 1.95; }
.preloader__specs { display: grid; grid-template-columns: repeat(3, minmax(72px, 1fr)); gap: 16px; max-width: 420px; margin-top: clamp(34px, 5vw, 68px); padding-top: 15px; border-top: 1px solid var(--line); }
.preloader__specs div { display: flex; flex-direction: column; gap: 7px; min-width: 0; }
.preloader__specs span { color: var(--muted); font-family: var(--font-mono, monospace); font-size: 8px; letter-spacing: .16em; }
.preloader__specs strong { overflow: hidden; color: var(--ink); font-family: var(--font-mono, monospace); font-size: 10px; font-weight: 550; letter-spacing: .07em; text-overflow: ellipsis; white-space: nowrap; }

.mark-wrap { justify-self: center; width: min(100%, 390px); }
.mark { position: relative; display: grid; place-items: center; width: 100%; aspect-ratio: 1; border: 1px solid var(--line); border-radius: 50%; animation: breathe 5s ease-in-out infinite; }
.mark::before { position: absolute; inset: 15%; border: 1px solid rgba(176, 108, 40, .18); border-radius: 50%; content: ''; }
.mark__logo { position: relative; z-index: 2; width: 55%; height: 55%; object-fit: contain; animation: logo-enter 1.2s .35s cubic-bezier(.16, 1, .3, 1) both, mark-glow 3.4s 1.55s ease-in-out infinite; }
.mark__index { position: absolute; z-index: 3; right: 18%; bottom: 22%; color: var(--accent); font-family: var(--font-mono, monospace); font-size: 9px; letter-spacing: .12em; }
.mark__cross { position: absolute; background: var(--line); }
.mark__cross--vertical { top: 4%; bottom: 4%; left: 50%; width: 1px; }
.mark__cross--horizontal { top: 50%; right: 4%; left: 4%; height: 1px; }
.ring { position: absolute; border: 1px solid var(--accent); border-radius: 50%; }
.ring--outer { inset: 8%; opacity: .35; animation: spin 24s linear infinite; }
.ring--inner { inset: 25%; border-style: dashed; opacity: .42; animation: spin-reverse 11s linear infinite; }
.ring--orbit { inset: 3%; border-color: rgba(176, 108, 40, .16); border-style: dotted; animation: spin 36s linear infinite; }
.orbit-dot { position: absolute; top: 6%; left: 49%; z-index: 2; width: 7px; height: 7px; border: 2px solid var(--cream); border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 1px var(--accent), 0 0 15px rgba(176, 108, 40, .55); animation: orbit-dot 6s linear infinite; }
.mark-caption { display: flex; justify-content: space-between; margin-top: 13px; color: var(--muted); font-family: var(--font-mono, monospace); font-size: 8px; letter-spacing: .16em; }

.preloader__bottom { gap: 30px; border-top: 1px solid var(--line); border-bottom: 0; padding-top: 14px; padding-bottom: 0; }
.status { display: flex; align-items: center; gap: 9px; min-width: 0; color: var(--muted); font-size: 10px; letter-spacing: .08em; }
.status > span:not(.status__indicator) { white-space: nowrap; }
.status small { overflow: hidden; max-width: 180px; margin-left: 5px; color: var(--muted); font-family: var(--font-mono, monospace); font-size: 8px; letter-spacing: .06em; text-overflow: ellipsis; white-space: nowrap; }
.status__indicator { flex: 0 0 auto; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 4px rgba(176, 108, 40, .1); animation: pulse 1.4s ease-in-out infinite; }
.progress { display: grid; grid-template-columns: auto minmax(130px, min(31vw, 350px)) auto; align-items: center; gap: 12px; min-width: min(48vw, 450px); }
.progress__numbers { display: flex; align-items: baseline; gap: 3px; min-width: 43px; }
.progress strong { font-family: var(--font-mono, monospace); font-size: 17px; font-weight: 500; letter-spacing: .04em; }
.progress small, .progress__end { color: var(--muted); font-family: var(--font-mono, monospace); font-size: 8px; letter-spacing: .08em; }
.progress__rail { position: relative; height: 8px; }
.progress__track, .progress__fill { position: absolute; top: 3px; left: 0; height: 1px; }
.progress__track { width: 100%; background: rgba(23, 22, 20, .18); }
.progress__fill { background: var(--accent); box-shadow: 0 0 9px rgba(176, 108, 40, .45); transition: width 90ms linear; }
.progress__marker { position: absolute; top: 0; width: 7px; height: 7px; border: 2px solid var(--cream); border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 1px var(--accent); transform: translateX(-50%); transition: left 90ms linear; }
.progress__rail b { position: absolute; top: 1px; width: 3px; height: 5px; background: var(--ink); opacity: .22; transform: translateX(-50%); }

.title-line { display: inline-block; animation: title-rise .9s cubic-bezier(.16, 1, .3, 1) both; }
.title-line--accent { animation-delay: .12s; }
.description { animation: fade-up 1s .32s cubic-bezier(.16, 1, .3, 1) both; }
.preloader__top--enter { animation: top-enter 1s .1s cubic-bezier(.16, 1, .3, 1) both; }
.preloader__main--enter { animation: main-enter 1.15s .18s cubic-bezier(.16, 1, .3, 1) both; }
.preloader__bottom--enter { animation: bottom-enter .9s .4s cubic-bezier(.16, 1, .3, 1) both; }
.preloader--enter .preloader__top { opacity: 0; transform: translateY(-24px); }
.preloader--enter .preloader__main { opacity: 0; transform: translateY(30px) scale(.96); }
.preloader--enter .preloader__bottom { opacity: 0; transform: translateY(22px); }
.preloader--exit { opacity: 0; transform: translate3d(0, -24px, 0); transition: opacity 1s ease, transform 1s cubic-bezier(.76, 0, .24, 1); }
.preloader--exit .preloader__top { opacity: 0; transform: translateY(-18px); transition: opacity .4s ease, transform .4s ease; }
.preloader--exit .preloader__main { opacity: 0; transform: translateY(-12px) scale(1.035); transition: opacity .72s .06s cubic-bezier(.76, 0, .24, 1), transform .72s .06s cubic-bezier(.76, 0, .24, 1); }
.preloader--exit .preloader__bottom { opacity: 0; transform: translateY(14px); transition: opacity .36s ease, transform .36s ease; }
.preloader--exit .mark__logo { transform: scale(.55) rotate(18deg); opacity: 0; transition: opacity .66s cubic-bezier(.76, 0, .24, 1), transform .66s cubic-bezier(.76, 0, .24, 1); }
.preloader--exit .ring--outer, .preloader--exit .ring--orbit { opacity: 0; transform: scale(1.24) rotate(36deg); transition: opacity .75s ease, transform .75s cubic-bezier(.76, 0, .24, 1); }
.preloader--exit .ring--inner { opacity: 0; transform: scale(1.18) rotate(-36deg); transition: opacity .58s .04s ease, transform .58s .04s cubic-bezier(.76, 0, .24, 1); }

@keyframes breathe { 0%, 100% { transform: scale(.985); } 50% { transform: scale(1.015); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes spin-reverse { to { transform: rotate(-360deg); } }
@keyframes orbit-dot { to { transform: rotate(360deg) translateY(-1px) rotate(-360deg); } }
@keyframes pulse { 50% { opacity: .3; transform: scale(.72); } }
@keyframes scan { 0% { transform: translateY(0); opacity: 0; } 18% { opacity: .42; } 82% { opacity: .18; } 100% { transform: translateY(145vh); opacity: 0; } }
@keyframes title-rise { from { opacity: 0; transform: translateY(28px); clip-path: inset(100% 0 0); } to { opacity: 1; transform: translateY(0); clip-path: inset(0); } }
@keyframes fade-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes logo-enter { from { opacity: 0; transform: scale(.55) rotate(-18deg); } to { opacity: 1; transform: scale(1) rotate(0); } }
@keyframes mark-glow { 0%, 100% { opacity: .82; filter: drop-shadow(0 12px 22px rgba(23, 22, 20, .1)); } 50% { opacity: 1; filter: drop-shadow(0 12px 30px rgba(176, 108, 40, .38)); } }
@keyframes top-enter { from { opacity: 0; transform: translateY(-18px); } to { opacity: 1; transform: translateY(0); } }
@keyframes main-enter { from { opacity: 0; transform: translateY(22px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes bottom-enter { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 760px) {
  .preloader { padding: 22px 20px 24px; }
  .preloader__top { align-items: flex-start; }
  .preloader__top-meta { gap: 12px; }
  .preloader__sequence, .preloader__year { display: none; }
  .preloader__main { grid-template-columns: 1fr; gap: 34px; width: min(100%, 520px); }
  h1 { font-size: clamp(52px, 15vw, 82px); }
  .description { max-width: 270px; margin-top: 19px; }
  .preloader__specs { margin-top: 30px; }
  .mark-wrap { width: min(61vw, 280px); }
  .preloader__bottom { align-items: flex-end; gap: 18px; }
  .status { max-width: 132px; line-height: 1.45; }
  .status > span:not(.status__indicator) { white-space: normal; }
  .status small { display: none; }
  .progress { grid-template-columns: auto minmax(90px, 1fr) auto; min-width: 0; flex: 1; gap: 8px; }
}

@media (prefers-reduced-motion: reduce) {
  .preloader__scan, .mark, .ring, .orbit-dot, .status__indicator, .title-line, .description { animation: none; }
  .preloader--exit, .preloader--exit .preloader__top, .preloader--exit .preloader__main, .preloader--exit .preloader__bottom, .preloader--exit .mark__logo, .preloader--exit .ring--outer, .preloader--exit .ring--inner, .preloader--exit .ring--orbit { transition-duration: .01ms; }
}
</style>
