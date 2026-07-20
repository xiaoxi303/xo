<template>
  <div class="min-h-screen pt-28 pb-20 px-6">
    <div class="max-w-4xl mx-auto space-y-16">
      
      <!-- Hero Header (Elegant Light Paper Dossier Style) -->
      <div class="flex flex-col md:flex-row gap-12 items-start relative overflow-hidden p-8 glass-card reveal">
        <div class="absolute right-6 top-6 font-mono text-[9px] text-slate-400 select-none hidden sm:block">CONFIDENTIAL // {{ siteConfig?.siteInfo?.brandName || 'XO' }} STUDIO</div>
        <!-- Avatar Area -->
        <div class="flex-shrink-0">
          <div class="relative">
            <div class="absolute -inset-3 rounded-full bg-gradient-to-br from-amber-500/5 to-slate-500/5 blur-lg pointer-events-none" />
            <div class="relative w-28 h-28 rounded-full bg-gradient-to-br from-amber-100 via-slate-100 to-amber-200 flex items-center justify-center text-slate-850 font-display font-bold text-4xl shadow-sm border border-white">
              {{ siteConfig?.siteInfo?.ownerInitial || 'Z' }}
            </div>
          </div>
        </div>

        <!-- Biographic details -->
        <div class="space-y-4 flex-1">
          <div>
            <h1 class="font-display text-4xl font-bold text-slate-900 tracking-tight">{{ siteConfig?.siteInfo?.ownerName || 'Xo' }}</h1>
            <p class="text-amber-800 mt-1 font-semibold font-mono text-xs uppercase tracking-wider font-sans">{{ siteConfig?.about?.role || '影视后期剪辑指导 & DI 调色总监' }}</p>
          </div>
          
          <p class="text-slate-700 text-sm leading-relaxed font-sans">
            {{ siteConfig?.about?.bio || '你好，我是 Xo，一名专注于极致视觉体验与叙事节奏的后期制作人。拥有 5 年影视及商业视频后期制作经验，曾为多个头部数码硬件、高奢潮牌及汽车品牌交付主视觉概念片。' }}
          </p>
          <p class="text-slate-500 text-xs leading-relaxed border-l-2 border-amber-800/30 pl-4 italic font-sans">
            {{ siteConfig?.about?.bioSub || '我相信镜头是有呼吸的，每一个调色色键、每一段声音过渡都是对情感的潜意识引导。让画面本身说话，用节奏感编织出令人印象深刻的数字故事，是我持之以恒的追求。' }}
          </p>

          <div class="flex flex-wrap gap-3 pt-3">
            <a :href="'mailto:' + (siteConfig?.siteInfo?.contactEmail || 'hello@xo.dev')" class="btn-primary py-2 px-5 text-xs font-sans">
              发起合作咨询 (Email)
            </a>
            <a v-if="siteConfig?.siteInfo?.vimeoUrl" :href="siteConfig.siteInfo.vimeoUrl" target="_blank" rel="noopener" class="btn-ghost py-2 px-5 text-xs font-sans">
              Vimeo 频道
            </a>
          </div>
        </div>
      </div>

      <!-- Timeline: Experience (Elegant Chronicle) -->
      <section class="space-y-8">
        <div class="flex items-center justify-between border-b border-black/5 pb-3 reveal">
          <h2 class="font-display text-2xl font-bold text-slate-900">影视制作年谱 (Experience Log)</h2>
          <span class="font-mono text-[9px] text-slate-400 uppercase tracking-widest">Chronicle</span>
        </div>

        <div class="relative space-y-8">
          <!-- Central thin grey timeline rail -->
          <div class="absolute left-[17px] top-2 bottom-2 w-px bg-slate-200" />
          
          <div
            v-for="(exp, i) in experiences"
            :key="i"
            class="relative flex gap-6 reveal"
            :style="{ transitionDelay: `${i * 80}ms` }"
          >
            <!-- timeline bolt node -->
            <div class="flex-shrink-0 w-9 h-9 rounded-full border border-black/5 bg-white flex items-center justify-center z-10 timeline-dot-pulse shadow-sm">
              <div class="w-2 h-2 rounded-full bg-amber-600" />
            </div>

            <!-- Content Light Glass card -->
            <div class="glass-card p-6 flex-1 hover:border-black/10 transition-all duration-300 relative overflow-hidden group">
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                <div>
                  <h3 class="text-slate-900 font-display font-bold text-base group-hover:text-amber-800 transition-colors duration-300">
                    {{ exp.role }}
                  </h3>
                  <p class="text-amber-800 text-[10px] font-mono font-bold uppercase mt-0.5 tracking-wider font-sans">
                    {{ exp.company }}
                  </p>
                </div>
                <span class="text-slate-400 text-xs font-mono tracking-wider flex-shrink-0 pt-0.5">
                  {{ exp.period }}
                </span>
              </div>
              
              <p class="text-slate-600 text-xs leading-relaxed font-sans">
                {{ exp.desc }}
              </p>
              
              <div class="flex flex-wrap gap-1.5 mt-4">
                <span v-for="t in exp.tags" :key="t" class="tag text-[9px]">{{ t }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Values (Grid style) -->
      <section class="space-y-8 reveal">
        <div class="flex items-center justify-between border-b border-black/5 pb-3">
          <h2 class="font-display text-2xl font-bold text-slate-900">后期哲学理念 (DI Philosophy)</h2>
          <span class="font-mono text-[9px] text-slate-400 uppercase tracking-widest">Principles</span>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <div
            v-for="value in values"
            :key="value.title"
            class="glass-card p-6 group hover:border-black/10 relative overflow-hidden transition-all duration-300"
          >
            <!-- Elastic icon bounce -->
            <div class="text-2xl mb-3 transform group-hover:scale-110 transition-all duration-300 select-none w-10">
              {{ value.emoji }}
            </div>
            
            <h3 class="text-slate-900 font-display font-bold mb-2 group-hover:text-amber-800 transition-colors duration-300 text-base">
              {{ value.title }}
            </h3>
            
            <p class="text-slate-600 text-xs leading-relaxed font-sans">
              {{ value.desc }}
            </p>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
// Metas
useHead({
  title: '剪辑总监履历 — xo.dev',
  meta: [{ name: 'description', content: '了解电影调色指导 Xo 的工作年谱、调色流程与后期制作观念。' }]
})

// Data fetch siteconfig
const { data: siteConfig } = await useFetch<any>('/api/site-config')

const experiences = computed(() => {
  return siteConfig.value?.about?.experiences || [
    {
      role: '资深剪辑指导 / DI 调色总监',
      company: 'TechCreative Studio',
      period: '2023 — 至今',
      desc: '主导商业 TVC、高端品牌概念宣传片、高端数码新品主视觉的剪辑与色彩把控。建立并优化了达芬奇 DI 至 ACES 高规格色彩空间的高保真代理协作流程。',
      tags: ['剪辑指导', '达芬奇 DI', 'ACES 色彩科学', 'TVC 后期']
    },
    {
      role: '影视后期总监',
      company: 'StartupMedia',
      period: '2021 — 2023',
      desc: '负责线上多媒体产品包装与微电影后期流程。独立或协同交付 80 余支高质感商业短片，引入云端协作剪辑，让跨地域审片周期缩短 40%。',
      tags: ['后期总监', '三维动效包装', '云工作流', 'AE 合成']
    },
    {
      role: '自由职业剪辑师 / 独立后期',
      company: '独立制片与工作室协作',
      period: '2019 — 2021',
      desc: '为多家新锐潮牌、数码品牌提供前期创意与后期精剪一站式方案，擅长重节拍快节奏转场剪辑与叙事声音设计。',
      tags: ['独立制片', '街头蒙太奇', '声音设计', '创意短片']
    }
  ]
})

const values = computed(() => {
  return siteConfig.value?.about?.philosophies || [
    { emoji: '⚡', title: '节奏即灵魂', desc: '剪辑是对时间的微雕。切准那一帧画面的呼吸点，才能让故事在观众心里产生化学反应。' },
    { emoji: '🎨', title: '色彩传递情绪', desc: '调色不仅是色彩还原，更是通过冷暖虚实的色彩空间，潜意识引导剧情张力与氛围感。' },
    { emoji: '🔊', title: '声画不可分割', desc: '声音是画面的另一半翅膀。通过拟音与音效设计，让平面的屏幕呈现出三维物理深度。' }
  ]
})

// Entrance scroll reveals
let observer: IntersectionObserver | null = null

onMounted(async () => {
  await nextTick()
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('in-view')
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  )
  document.querySelectorAll('.reveal').forEach((el) => observer?.observe(el))
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>
