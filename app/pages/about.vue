<template>
  <div class="min-h-screen pt-28 pb-24 px-6 relative overflow-hidden">
    <!-- Ambient Studio Backdrop Light Glows -->
    <div class="absolute top-10 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-500/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none z-0" />

    <div class="max-w-4xl mx-auto space-y-14 relative z-10">

      <!-- Profile Header Hero Card -->
      <div class="glass-card p-8 sm:p-10 rounded-3xl border-2 border-[var(--color-border)] shadow-2xl relative overflow-hidden group hover:border-amber-500/40 transition-all duration-500 bg-[var(--glass-bg)] backdrop-blur-xl">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-8">
          
          <!-- Avatar Frame -->
          <div class="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-[var(--color-ink-2)] font-display font-bold text-3xl shadow-xl border-4 border-white ring-4 ring-amber-500/20 flex-shrink-0"
               style="background: linear-gradient(135deg, var(--color-bronze-bg), rgba(180,83,9,0.3))">
            <img v-if="siteConfig?.siteInfo?.avatar" :src="siteConfig.siteInfo.avatar" class="w-full h-full object-cover" alt="" />
            <span v-else>{{ siteConfig?.siteInfo?.ownerInitial || 'X' }}</span>
          </div>

          <!-- Info & Intro -->
          <div class="space-y-4 text-center sm:text-left flex-1">
            <div class="space-y-1">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-[var(--color-bronze-dark)] text-[10px] font-mono font-bold border border-amber-500/20">
                <span class="w-2 h-2 rounded-full bg-[var(--color-bronze)] animate-pulse" />
                <span>{{ siteConfig?.about?.role || '资深剪辑指导 / DI 调色总监' }}</span>
              </div>
              <h1 class="font-display text-4xl sm:text-5xl font-bold text-[var(--color-ink-1)] tracking-tight pt-1">
                {{ siteConfig?.siteInfo?.title || 'Xo Studio' }}
              </h1>
            </div>

            <p class="text-[var(--color-ink-3)] text-sm sm:text-base leading-relaxed font-sans font-medium">
              {{ siteConfig?.about?.bio || '你好，我是 Xo。一名专注于极客视觉体验与故事节奏的后期制作人。拥有 5 年影视及商业视频后期制作经验，曾为多个头部数码硬件、高端品牌及汽车品牌交付主视觉概念片。' }}
            </p>

            <blockquote class="p-4 rounded-2xl bg-black/[0.03] border-l-4 border-amber-600 text-[var(--color-ink-4)] text-xs sm:text-sm italic font-sans leading-relaxed">
              “{{ siteConfig?.about?.bioSub || '我相信镜头是会呼吸的。每一个颜色调性，每一段声音速度都是对情感的尊贵引导。让画面本身说话，细节剪辑更向光绽放故事。' }}”
            </blockquote>

            <div class="pt-2">
              <a 
                :href="'mailto:' + (siteConfig?.siteInfo?.contactEmail || 'hello@Xo')" 
                class="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-white/10 shadow-lg hover:from-amber-600 hover:via-amber-500 hover:to-amber-700 hover:border-amber-400/40 hover:shadow-[0_12px_32px_rgba(217,119,6,0.45)] hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <span>发起合作咨询 (Email)</span>
                <IconSax name="arrow-right" :size="16" class="ml-1 opacity-90 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:scale-110" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Experience Log Timeline Section -->
      <div class="space-y-8">
        <div class="flex items-center justify-between border-b pb-4 border-[var(--color-border)]">
          <div>
            <span class="text-[var(--color-bronze-dark)] text-xs font-bold tracking-widest font-sans">年谱与履历</span>
            <h2 class="font-display text-3xl font-bold text-[var(--color-ink-1)] tracking-tight">影视制作年谱</h2>
          </div>
          
        </div>

        <div class="relative space-y-8">
          <!-- Central thin timeline rail -->
          <div class="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-amber-600 via-slate-300 to-amber-600/20" />
          
          <div
            v-for="(exp, i) in experiences"
            :key="i"
            class="relative flex gap-6 group"
          >
            <!-- timeline bolt node -->
            <div class="flex-shrink-0 w-10 h-10 rounded-full border-2 border-amber-500/40 bg-white flex items-center justify-center z-10 shadow-md group-hover:scale-110 transition-transform">
              <span class="text-xs font-mono font-bold text-[var(--color-bronze-dark)]">0{{ i + 1 }}</span>
            </div>

            <!-- Content Light Glass card -->
            <div class="glass-card p-7 flex-1 border-2 border-[var(--color-border)] hover:border-amber-500/40 transition-all duration-300 relative overflow-hidden group shadow-xl bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl">
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                <div>
                  <h3 class="text-[var(--color-ink-1)] font-display font-bold text-xl group-hover:text-[var(--color-bronze-dark)] transition-colors duration-300">
                    {{ exp.role }}
                  </h3>
                  <p class="text-[var(--color-bronze-dark)] text-xs font-mono font-bold uppercase mt-0.5 tracking-wider">
                    {{ exp.company }}
                  </p>
                </div>
                <span class="text-amber-900 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider flex-shrink-0">
                  {{ exp.period }}
                </span>
              </div>

              <p class="text-[var(--color-ink-4)] text-xs sm:text-sm leading-relaxed font-sans mb-4">
                {{ exp.desc }}
              </p>

              <!-- Tags -->
              <div class="flex flex-wrap gap-1.5">
                <span v-for="tag in exp.tags" :key="tag" class="tag hover:border-amber-500/40 font-semibold text-xs">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '剪辑总监履历 — Xo',
  meta: [{ name: 'description', content: '了解电影调色指导 Xo 的工作年谱、调色流程与后期制作观念。' }]
})

const { data: siteConfig } = useFetch<any>('/api/site-config', {
  key: 'site-config-about'
})

const experiences = computed(() => {
  const configuredExperiences = siteConfig.value?.about?.experiences
  if (Array.isArray(configuredExperiences) && configuredExperiences.length > 0) {
    return configuredExperiences
  }

  return [
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
      desc: '负责线上多媒体产品包装与微电影后期流程。独立完成多部获奖短片，引入三维动作包装，让故事线画面剪辑降本增效 40%。',
      tags: ['后期总监', '三维特效包装', '云工作流', 'AE 合成']
    },
    {
      role: '自由职业剪辑师 / 独立后期',
      company: '独立制片与工作室合作',
      period: '2019 — 2021',
      desc: '为多家新锐潮牌、数码品牌提供前期策划与后期剪辑一体化方案，擅长重音快节奏剪辑与故事声音设计。',
      tags: ['独立剪辑', '镜头感太强', '声音设计', '创意短片']
    }
  ]
})
</script>
