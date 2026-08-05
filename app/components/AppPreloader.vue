<template>
  <Transition name="preloader">
    <section v-if="visible" :class="['preloader', `preloader--${phase}`]" aria-label="页面加载中">
      <div class="preloader__top preloader__top--enter">
        <span>XO / 影像工作室</span>
        <span class="muted">创立于 2026</span>
      </div>
      <div class="preloader__main preloader__main--enter">
        <div>
          <p class="index">序章 <span>/</span> 开始</p>
          <h1><span class="title-line">让灵感</span><br><em class="title-line title-line--accent">开始流动</em></h1>
          <p class="description">记录影像、色彩与叙事，让每一帧都拥有自己的情绪。</p>
        </div>
        <div class="mark" aria-hidden="true">
          <i class="ring ring--outer" /><i class="ring ring--inner" />
          <img src="/logo.png" alt="" class="mark__logo">
        </div>
      </div>
      <div class="preloader__bottom preloader__bottom--enter">
        <div class="status"><i />{{ status }}<small>{{ networkLabel }}</small></div>
        <div class="progress"><span><i :style="{ width: `${progress}%` }" /></span><strong>{{ String(Math.floor(progress)).padStart(2, '0') }}</strong><small>%</small></div>
      </div>
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
let presentationMs = 2200
let networkScore = 18
let probeTimer: number | null = null

onMounted(() => {
  startedAt = Date.now()
  requestAnimationFrame(() => {
    phase.value = 'active'
  })
  const connection = (navigator as Navigator & {
    connection?: { effectiveType?: string; saveData?: boolean }
  }).connection
  if (connection?.saveData || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
    presentationMs = 6800
  } else if (connection?.effectiveType === '3g') {
    presentationMs = 5400
  } else if (connection?.effectiveType === '4g') {
    presentationMs = 4200
  } else {
    presentationMs = 3600
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
      const connection = (navigator as Navigator & {
        connection?: { effectiveType?: string; downlink?: number; rtt?: number }
      }).connection
      const apiRtt = connection?.rtt || rtt
      const downlink = connection?.downlink || 0
      networkScore = Math.min(100, Math.max(networkScore + (apiRtt < 180 ? 9 : apiRtt < 450 ? 5 : 2), networkScore))
      if (downlink >= 8 || apiRtt < 120) networkLabel.value = '网络状态良好'
      else if (downlink >= 1.5 || apiRtt < 400) networkLabel.value = '网络状态稳定'
      else networkLabel.value = '网络较慢，正在继续加载'
    } catch {
      networkScore = Math.max(12, networkScore - 4)
      networkLabel.value = '网络响应较慢'
    }
    if (!loaded) probeTimer = window.setTimeout(probeNetwork, 850)
  }
  probeNetwork()

  const tick = () => {
    const elapsed = Date.now() - startedAt
    const timeProgress = Math.min(100, elapsed / presentationMs * 100)
    const networkProgress = Math.min(92, 18 + networkScore * 0.74)
    const target = loaded ? Math.max(timeProgress, 100) : Math.min(timeProgress, networkProgress)
    progress.value += (target - progress.value) * 0.08
    if (Math.abs(target - progress.value) < 0.1) progress.value = target
    status.value = progress.value < 35 ? '正在整理工作室' : progress.value < 70 ? '正在调和视觉氛围' : progress.value < 96 ? '正在打开作品集' : '欢迎来到 Xo'
    if (loaded && elapsed > presentationMs * 0.82 && progress.value >= 99.8) {
      progress.value = 100
      phase.value = 'exit'
      emit('reveal-start')
      window.setTimeout(() => { visible.value = false; emit('complete') }, 1200)
      return
    }
    frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
})
onBeforeUnmount(() => cancelAnimationFrame(frame))
onBeforeUnmount(() => {
  if (probeTimer !== null) window.clearTimeout(probeTimer)
})
</script>

<style scoped>
.preloader{--cream:#f3eee6;--ink:#171614;--line:rgba(23,22,20,.18);position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;justify-content:space-between;padding:clamp(24px,4vw,58px) clamp(22px,6vw,96px);overflow:hidden;color:var(--ink);background:var(--cream);font-family:Arial,Helvetica,sans-serif}
.preloader:before{position:absolute;inset:0;background:linear-gradient(to right,transparent 0,transparent calc(50% - .5px),var(--line) 50%,transparent calc(50% + .5px));content:'';pointer-events:none}.preloader:after{position:absolute;left:0;top:-20%;width:100%;height:1px;background:linear-gradient(90deg,transparent,#8c6d42,transparent);box-shadow:0 0 20px #8c6d42;content:'';opacity:.35;animation:scan 3.2s ease-in-out infinite}
.preloader__top,.preloader__bottom{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line);padding-bottom:14px;font-size:10px;letter-spacing:.2em;text-transform:uppercase}.muted{opacity:.48}
.preloader__main{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;align-items:center;width:min(100%,980px);margin:auto}.index{margin:0 0 24px;font-size:11px;letter-spacing:.24em}.index span{opacity:.35}h1{margin:0;font-family:'Noto Serif SC','Songti SC','STSong',Georgia,serif;font-size:clamp(46px,7.2vw,98px);font-weight:500;letter-spacing:.02em;line-height:1.04}h1 em{color:#8c6d42;font-style:normal;font-weight:400}.description{max-width:285px;margin:30px 0 0;color:rgba(23,22,20,.58);font-size:13px;letter-spacing:.08em;line-height:1.9}
.mark{position:relative;display:grid;place-items:center;width:min(34vw,330px);aspect-ratio:1;justify-self:center;border:1px solid var(--line);border-radius:50%;animation:breathe 4s ease-in-out infinite}.mark__logo{position:relative;z-index:2;width:58%;height:58%;object-fit:contain;animation:logo-enter 1.2s .35s cubic-bezier(.16,1,.3,1) both,mark-glow 3.2s 1.55s ease-in-out infinite}.ring{position:absolute;border:1px solid #8c6d42;border-radius:50%}.ring--outer{inset:8%;opacity:.34;animation:spin 24s linear infinite}.ring--inner{inset:24%;border-style:dashed;opacity:.48;animation:spin-reverse 10s linear infinite}
.preloader__bottom{border-top:1px solid var(--line);border-bottom:0;padding-top:14px;padding-bottom:0}.status{display:flex;align-items:center;gap:9px;opacity:.58}.status small{margin-left:5px;opacity:.62;font-size:9px;letter-spacing:.06em}.status i,.status>i:before{width:6px;height:6px;border-radius:50%;background:#8c6d42;content:''}.status i{animation:pulse 1.4s ease-in-out infinite}.progress{display:flex;align-items:baseline;gap:4px;min-width:min(36vw,330px)}.progress>span{width:100%;height:1px;margin-right:15px;background:rgba(23,22,20,.2)}.progress>span i{display:block;height:100%;background:#8c6d42;transition:width 80ms linear}.progress strong{font-size:18px;font-weight:400}.progress small{opacity:.45;font-size:10px}
.title-line{display:inline-block;animation:title-rise .9s cubic-bezier(.16,1,.3,1) both}.title-line--accent{animation-delay:.12s}.description{animation:fade-up 1s .32s cubic-bezier(.16,1,.3,1) both}.preloader__top--enter{animation:top-enter 1s .1s cubic-bezier(.16,1,.3,1) both}.preloader__main--enter{animation:main-enter 1.15s .18s cubic-bezier(.16,1,.3,1) both}.preloader__bottom--enter{animation:bottom-enter .9s .4s cubic-bezier(.16,1,.3,1) both}.preloader-enter-active,.preloader-leave-active{transition:opacity .9s ease,transform .9s cubic-bezier(.76,0,.24,1)}.preloader-leave-to{opacity:0;transform:translateY(-24px)}.preloader-leave-active .preloader__top{animation:top-exit .45s ease forwards}.preloader-leave-active .preloader__main{animation:main-exit .72s .08s cubic-bezier(.76,0,.24,1) forwards}.preloader-leave-active .preloader__bottom{animation:bottom-exit .4s ease forwards}.preloader-leave-active .mark__logo{animation:logo-exit .58s cubic-bezier(.76,0,.24,1) forwards}.preloader-leave-active .ring--outer{animation:exit-ring .72s cubic-bezier(.76,0,.24,1) forwards}.preloader-leave-active .ring--inner{animation:exit-ring .55s .05s cubic-bezier(.76,0,.24,1) forwards}@keyframes breathe{0%,100%{transform:scale(.98)}50%{transform:scale(1.02)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes spin-reverse{to{transform:rotate(-360deg)}}@keyframes pulse{50%{opacity:.3;transform:scale(.7)}}@keyframes scan{0%{transform:translateY(0);opacity:0}18%{opacity:.45}82%{opacity:.2}100%{transform:translateY(145vh);opacity:0}}@keyframes title-rise{from{opacity:0;transform:translateY(28px);clip-path:inset(100% 0 0)}to{opacity:1;transform:translateY(0);clip-path:inset(0)}}@keyframes fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes logo-enter{from{opacity:0;transform:scale(.55) rotate(-18deg)}to{opacity:1;transform:scale(1) rotate(0)}}@keyframes logo-exit{to{opacity:0;transform:scale(.38) rotate(22deg)}}@keyframes mark-glow{0%,100%{opacity:.82;filter:drop-shadow(0 12px 22px rgba(23,22,20,.1))}50%{opacity:1;filter:drop-shadow(0 12px 30px rgba(140,109,66,.42))}}@keyframes top-enter{from{opacity:0;transform:translateY(-18px)}to{opacity:1;transform:translateY(0)}}@keyframes main-enter{from{opacity:0;transform:translateY(22px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes bottom-enter{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}@keyframes top-exit{to{opacity:0;transform:translateY(-14px)}}@keyframes main-exit{to{opacity:0;transform:translateY(-12px) scale(1.025)}}@keyframes bottom-exit{to{opacity:0;transform:translateY(16px)}}@keyframes exit-ring{to{opacity:0;transform:scale(1.28) rotate(40deg)}}
@media(max-width:640px){.preloader__main{grid-template-columns:1fr;gap:48px}.mark{width:min(52vw,250px)}.description{margin-top:22px}.preloader__bottom{align-items:flex-end;gap:20px}.status{max-width:120px;line-height:1.4}}
@media(prefers-reduced-motion:reduce){.mark,.mark b,.ring,.ring--inner,.status i,.title-line,.description,.preloader:after{animation:none}}
.preloader{backface-visibility:hidden;will-change:opacity,transform}
.preloader-leave-active{will-change:opacity,transform}
.preloader-leave-to{transform:translate3d(0,-18px,0)}
.preloader-leave-active .preloader__top,
.preloader-leave-active .preloader__main,
.preloader-leave-active .preloader__bottom,
.preloader-leave-active .mark__logo,
.preloader-leave-active .ring--outer,
.preloader-leave-active .ring--inner{animation:none!important}
.preloader--enter .preloader__top{opacity:0;transform:translateY(-24px)}
.preloader--enter .preloader__main{opacity:0;transform:translateY(30px) scale(.96)}
.preloader--enter .preloader__bottom{opacity:0;transform:translateY(22px)}
.preloader--active .preloader__top{animation:top-enter 1s cubic-bezier(.16,1,.3,1) both}
.preloader--active .preloader__main{animation:main-enter 1.15s .15s cubic-bezier(.16,1,.3,1) both}
.preloader--active .preloader__bottom{animation:bottom-enter .9s .35s cubic-bezier(.16,1,.3,1) both}
.preloader--exit{opacity:0;transform:translate3d(0,-26px,0);transition:opacity 1.05s ease,transform 1.05s cubic-bezier(.76,0,.24,1)}
.preloader--exit .preloader__top{opacity:0;transform:translateY(-18px);transition:opacity .45s ease,transform .45s ease}
.preloader--exit .preloader__main{opacity:0;transform:translateY(-12px) scale(1.04);transition:opacity .75s .08s cubic-bezier(.76,0,.24,1),transform .75s .08s cubic-bezier(.76,0,.24,1)}
.preloader--exit .preloader__bottom{opacity:0;transform:translateY(16px);transition:opacity .4s ease,transform .4s ease}
.preloader--exit .mark__logo{transform:scale(.55) rotate(18deg);opacity:0;transition:opacity .7s cubic-bezier(.76,0,.24,1),transform .7s cubic-bezier(.76,0,.24,1)}
.preloader--exit .ring--outer{opacity:0;transform:scale(1.3) rotate(40deg);transition:opacity .8s ease,transform .8s cubic-bezier(.76,0,.24,1)}
.preloader--exit .ring--inner{opacity:0;transform:scale(1.18) rotate(-40deg);transition:opacity .6s .05s ease,transform .6s .05s cubic-bezier(.76,0,.24,1)}
</style>
