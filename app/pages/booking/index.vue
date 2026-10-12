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
          <span>PRODUCTION & GRADING BOOKING (2026)</span>
        </div>
        <h1 class="font-display text-4xl lg:text-6xl font-bold tracking-tight text-[var(--color-ink-1)]">
          商业合作与后期排期
        </h1>
        <p class="text-sm sm:text-base text-[var(--color-ink-4)] max-w-xl mx-auto font-sans leading-relaxed">
          专注于商业 TVC、品牌形象宣传片、概念短片与院线级调色。24 小时内快速响应，评估制作周期与技术方案。
        </p>
      </div>

      <!-- Services Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 reveal">
        <div class="glass-card p-8 space-y-4 rounded-3xl border-2 border-black/10 hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-[var(--xo-ease-spring)] group">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform duration-300 ease-[var(--xo-ease-spring)]">
            <IconSax name="video-play" :size="24" />
          </div>
          <h3 class="font-display text-xl font-bold text-slate-900 group-hover:text-amber-800 transition-colors">商业TVC广告</h3>
          <p class="text-sm text-slate-500 leading-relaxed">
            专业的商业广告拍摄与后期制作，涵盖产品宣传片、品牌故事片、社交媒体广告等。
          </p>
          <ul class="space-y-2 text-sm text-slate-600">
            <li class="flex items-center gap-2"><IconSax name="tick" :size="14" class="text-emerald-500 shrink-0" /> 4K/8K超高清拍摄</li>
            <li class="flex items-center gap-2"><IconSax name="tick" :size="14" class="text-emerald-500 shrink-0" /> 电影级调色处理</li>
            <li class="flex items-center gap-2"><IconSax name="tick" :size="14" class="text-emerald-500 shrink-0" /> 专业音效设计</li>
          </ul>
        </div>

        <div class="glass-card p-8 space-y-4 rounded-3xl border-2 border-black/10 hover:border-purple-500/40 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-[var(--xo-ease-spring)] group">
          <div class="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-700 group-hover:scale-110 transition-transform duration-300 ease-[var(--xo-ease-spring)]">
            <IconSax name="magic-star" :size="24" />
          </div>
          <h3 class="font-display text-xl font-bold text-slate-900 group-hover:text-purple-800 transition-colors">电影/纪录片调色</h3>
          <p class="text-sm text-slate-500 leading-relaxed">
            DaVinci Resolve专业调色，支持ACES色彩空间管理，打造电影级视觉质感。
          </p>
          <ul class="space-y-2 text-sm text-slate-600">
            <li class="flex items-center gap-2"><IconSax name="tick" :size="14" class="text-emerald-500 shrink-0" /> ACEScct色彩管理</li>
            <li class="flex items-center gap-2"><IconSax name="tick" :size="14" class="text-emerald-500 shrink-0" /> HDR/SDR双版本交付</li>
            <li class="flex items-center gap-2"><IconSax name="tick" :size="14" class="text-emerald-500 shrink-0" /> 胶片质感还原</li>
          </ul>
        </div>

        <div class="glass-card p-8 space-y-4 rounded-3xl border-2 border-black/10 hover:border-indigo-500/40 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-[var(--xo-ease-spring)] group">
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-700 group-hover:scale-110 transition-transform duration-300 ease-[var(--xo-ease-spring)]">
            <IconSax name="security-safe" :size="24" />
          </div>
          <h3 class="font-display text-xl font-bold text-slate-900 group-hover:text-indigo-800 transition-colors">短视频制作</h3>
          <p class="text-sm text-slate-500 leading-relaxed">
            TikTok、抖音、小红书等平台短视频内容策划、拍摄与后期制作。
          </p>
          <ul class="space-y-2 text-sm text-slate-600">
            <li class="flex items-center gap-2"><IconSax name="tick" :size="14" class="text-emerald-500 shrink-0" /> 竖屏/横屏适配</li>
            <li class="flex items-center gap-2"><IconSax name="tick" :size="14" class="text-emerald-500 shrink-0" /> 快节奏剪辑</li>
            <li class="flex items-center gap-2"><IconSax name="tick" :size="14" class="text-emerald-500 shrink-0" /> 平台算法优化</li>
          </ul>
        </div>

        <div class="glass-card p-8 space-y-4 rounded-3xl border-2 border-black/10 hover:border-emerald-500/40 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-[var(--xo-ease-spring)] group">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform duration-300 ease-[var(--xo-ease-spring)]">
            <IconSax name="crown" :size="24" />
          </div>
          <h3 class="font-display text-xl font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">音效/配乐设计</h3>
          <p class="text-sm text-slate-500 leading-relaxed">
            专业的音频后期处理，包括环境音设计、配乐编曲、混音母带等。
          </p>
          <ul class="space-y-2 text-sm text-slate-600">
            <li class="flex items-center gap-2"><IconSax name="tick" :size="14" class="text-emerald-500 shrink-0" /> 24-bit/96kHz高保真</li>
            <li class="flex items-center gap-2"><IconSax name="tick" :size="14" class="text-emerald-500 shrink-0" /> 环境音编织</li>
            <li class="flex items-center gap-2"><IconSax name="tick" :size="14" class="text-emerald-500 shrink-0" /> 版权音乐库</li>
          </ul>
        </div>
      </div>

      <!-- Process Section -->
      <div class="glass-card p-8 sm:p-12 space-y-8 rounded-3xl border-2 border-black/10 reveal">
        <h2 class="font-display text-2xl font-bold text-slate-900 text-center">合作流程</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="text-center space-y-3 group">
            <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-700 font-bold text-lg flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 ease-[var(--xo-ease-spring)] shadow-sm">1</div>
            <h4 class="font-bold text-slate-900">咨询沟通</h4>
            <p class="text-xs text-slate-500">了解项目需求、预算和时间节点</p>
          </div>
          <div class="text-center space-y-3 group">
            <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-700 font-bold text-lg flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 ease-[var(--xo-ease-spring)] shadow-sm">2</div>
            <h4 class="font-bold text-slate-900">方案报价</h4>
            <p class="text-xs text-slate-500">提供详细的创意方案和报价单</p>
          </div>
          <div class="text-center space-y-3 group">
            <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-700 font-bold text-lg flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 ease-[var(--xo-ease-spring)] shadow-sm">3</div>
            <h4 class="font-bold text-slate-900">签订合同</h4>
            <p class="text-xs text-slate-500">确认合作细节并签署正式合同</p>
          </div>
          <div class="text-center space-y-3 group">
            <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-700 font-bold text-lg flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 ease-[var(--xo-ease-spring)] shadow-sm">4</div>
            <h4 class="font-bold text-slate-900">项目交付</h4>
            <p class="text-xs text-slate-500">按约定时间高质量交付成品</p>
          </div>
        </div>
      </div>

      <!-- CTA Button -->
      <div class="text-center space-y-4 reveal">
        <NuxtLink to="/booking/form" class="xo-kinetic-btn btn-primary inline-flex items-center gap-2 py-4 px-8 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all">
          <span>📝</span>
          立即预约合作
        </NuxtLink>
        <p class="text-sm text-slate-400">填写预约表单，我们会在24小时内回复您</p>
      </div>

      <!-- FAQ Section -->
      <div class="glass-card p-8 sm:p-12 space-y-6 rounded-3xl border-2 border-black/10 reveal">
        <h2 class="font-display text-2xl font-bold text-slate-900 text-center">常见问题</h2>
        <div class="space-y-4">
          <div class="p-4 rounded-xl bg-black/[0.02]">
            <h4 class="font-bold text-slate-900 mb-2">Q: 最低起订量是多少？</h4>
            <p class="text-sm text-slate-500">A: 我们接受单条视频的合作，没有最低起订量限制。</p>
          </div>
          <div class="p-4 rounded-xl bg-black/[0.02]">
            <h4 class="font-bold text-slate-900 mb-2">Q: 交付周期一般多久？</h4>
            <p class="text-sm text-slate-500">A: 根据项目复杂度，一般3-15个工作日不等，具体会在合同中约定。</p>
          </div>
          <div class="p-4 rounded-xl bg-black/[0.02]">
            <h4 class="font-bold text-slate-900 mb-2">Q: 支持远程合作吗？</h4>
            <p class="text-sm text-slate-500">A: 是的，我们支持全国范围的远程合作，通过线上沟通即可完成项目。</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '合作预约 - XO Studio'
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
