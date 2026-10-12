<template>
  <div class="min-h-screen pt-28 pb-24 px-6 relative overflow-hidden" style="background: var(--color-bg);">
    <!-- Ambient Studio Luxury Backdrop Glows -->
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-0 animate-pulse"
      style="width: 1000px; height: 500px; background: radial-gradient(circle, rgba(217,119,6,0.2) 0%, rgba(147,51,234,0.12) 45%, transparent 75%); filter: blur(60px);"
    />

    <div class="max-w-4xl mx-auto space-y-12 relative z-10">
      
      <!-- Back button -->
      <div>
        <NuxtLink to="/" class="btn-ghost inline-flex items-center gap-2 text-xs py-2 px-4 shadow-xs">
          <IconSax name="arrow-left" :size="14" />
          <span>返回首页</span>
        </NuxtLink>
      </div>

      <!-- Hero Section (Hollywood Editorial Style) -->
      <div class="text-center space-y-5 reveal">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[var(--color-bronze-dark)] text-xs font-mono font-bold"
             style="background: rgba(217,119,6,0.12); border: 1px solid rgba(217,119,6,0.3);">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-bronze)] animate-pulse" />
          <span>{{ siteConfig?.booking?.heroBadge || 'PRODUCTION & GRADING BOOKING (2026)' }}</span>
        </div>
        <h1 class="font-display text-4xl lg:text-6xl font-bold tracking-tight text-[var(--color-ink-1)]">
          {{ siteConfig?.booking?.heroTitle || '商业合作与后期排期' }}
        </h1>
        <p class="text-sm sm:text-base text-[var(--color-ink-4)] max-w-xl mx-auto font-sans leading-relaxed">
          {{ siteConfig?.booking?.heroSub || '专注于商业 TVC、品牌形象宣传片、概念短片与院线级调色。24 小时内快速响应，评估制作周期与技术方案。' }}
        </p>
      </div>

      <!-- Services Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 reveal">
        <div
          v-for="(service, idx) in services"
          :key="idx"
          class="glass-card p-8 space-y-4 rounded-3xl border-2 border-black/10 hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-[var(--xo-ease-spring)] group"
        >
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform duration-300 ease-[var(--xo-ease-spring)]">
            <IconSax :name="service.icon || 'video-play'" :size="24" />
          </div>
          <h3 class="font-display text-xl font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
            {{ service.title }}
          </h3>
          <p class="text-sm text-slate-500 leading-relaxed font-sans">
            {{ service.desc }}
          </p>
          <ul class="space-y-2 text-sm text-slate-600 font-sans" v-if="getServiceItems(service).length > 0">
            <li
              v-for="(item, itemIdx) in getServiceItems(service)"
              :key="itemIdx"
              class="flex items-center gap-2"
            >
              <IconSax name="tick" :size="14" class="text-emerald-500 shrink-0" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Process Section -->
      <div class="glass-card p-8 sm:p-12 space-y-8 rounded-3xl border-2 border-black/10 reveal">
        <h2 class="font-display text-2xl font-bold text-slate-900 text-center">合作流程</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div
            v-for="(step, idx) in processSteps"
            :key="idx"
            class="text-center space-y-3 group"
          >
            <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-700 font-bold text-lg flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 ease-[var(--xo-ease-spring)] shadow-sm">
              {{ step.num || (idx + 1) }}
            </div>
            <h4 class="font-bold text-slate-900 font-display">{{ step.title }}</h4>
            <p class="text-xs text-slate-500 font-sans leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </div>

      <!-- CTA Button -->
      <div class="text-center space-y-4 reveal">
        <NuxtLink to="/booking/form" class="xo-kinetic-btn btn-primary inline-flex items-center gap-2 py-4 px-8 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all">
          <span>📝</span>
          <span>立即预约合作</span>
        </NuxtLink>
        <p class="text-sm text-slate-400 font-sans">填写预约表单，我们会在24小时内回复您</p>
      </div>

      <!-- FAQ Section -->
      <div class="glass-card p-8 sm:p-12 space-y-6 rounded-3xl border-2 border-black/10 reveal">
        <h2 class="font-display text-2xl font-bold text-slate-900 text-center">常见问题</h2>
        <div class="space-y-4">
          <div
            v-for="(faq, idx) in faqs"
            :key="idx"
            class="p-4 rounded-xl bg-black/[0.02]"
          >
            <h4 class="font-bold text-slate-900 mb-2 font-sans">{{ faq.q }}</h4>
            <p class="text-sm text-slate-500 font-sans leading-relaxed">{{ faq.a }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '商业合作与后期排期 - XO Studio'
})

const { data: siteConfig } = useFetch<any>('/api/site-config', { lazy: true })

const defaultServices = [
  {
    icon: 'video-play',
    title: '商业TVC广告',
    desc: '专业的商业广告拍摄与后期制作，涵盖产品宣传片、品牌故事片、社交媒体广告等。',
    items: ['4K/8K超高清拍摄', '电影级调色处理', '专业音效设计']
  },
  {
    icon: 'magic-star',
    title: '电影/纪录片调色',
    desc: 'DaVinci Resolve专业调色，支持ACES色彩空间管理，打造电影级视觉质感。',
    items: ['ACEScct色彩管理', 'HDR/SDR双版本交付', '胶片质感还原']
  },
  {
    icon: 'security-safe',
    title: '短视频制作',
    desc: 'TikTok、抖音、小红书等平台短视频内容策划、拍摄与后期制作。',
    items: ['竖屏/横屏适配', '快节奏剪辑', '平台算法优化']
  },
  {
    icon: 'crown',
    title: '音效/配乐设计',
    desc: '专业的音频后期处理，包括环境音设计、配乐编曲、混音母带等。',
    items: ['24-bit/96kHz高保真', '环境音编织', '版权音乐库']
  }
]

const services = computed(() => {
  const custom = siteConfig.value?.booking?.services
  if (Array.isArray(custom) && custom.length > 0) return custom
  return defaultServices
})

const getServiceItems = (service: any): string[] => {
  if (Array.isArray(service.items)) return service.items
  if (typeof service.items === 'string') {
    return service.items.split(/[,，]/).map((s: string) => s.trim()).filter(Boolean)
  }
  return []
}

const defaultProcessSteps = [
  { num: '1', title: '咨询沟通', desc: '了解项目需求、预算和时间节点' },
  { num: '2', title: '方案报价', desc: '提供详细的创意方案和报价单' },
  { num: '3', title: '签订合同', desc: '确认合作细节并签署正式合同' },
  { num: '4', title: '项目交付', desc: '按约定时间高质量交付成品' }
]

const processSteps = computed(() => {
  const custom = siteConfig.value?.booking?.processSteps
  if (Array.isArray(custom) && custom.length > 0) return custom
  return defaultProcessSteps
})

const defaultFaqs = [
  { q: 'Q: 最低起订量是多少？', a: 'A: 我们接受单条视频的合作，没有最低起订量限制。' },
  { q: 'Q: 交付周期一般多久？', a: 'A: 根据项目复杂度，一般3-15个工作日不等，具体会在合同中约定。' },
  { q: 'Q: 支持远程合作吗？', a: 'A: 是的，我们支持全国范围的远程合作，通过线上沟通即可完成项目。' }
]

const faqs = computed(() => {
  const custom = siteConfig.value?.booking?.faqs
  if (Array.isArray(custom) && custom.length > 0) return custom
  return defaultFaqs
})

// Trigger reveal animations on mount
onMounted(() => {
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('in-view')
    })
  }, 100)
})
</script>
