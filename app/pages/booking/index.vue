<template>
  <div class="min-h-screen pt-28 pb-24 px-6">
    <div class="max-w-4xl mx-auto space-y-12">
      
      <!-- Back button -->
      <div class="">
        <NuxtLink to="/" class="btn-ghost inline-flex items-center gap-2 text-sm py-2 px-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"/>
          </svg>
          返回首页
        </NuxtLink>
      </div>

      <!-- Hero Section -->
      <div class="text-center space-y-6 reveal">
        <span class="text-6xl">📅</span>
        <h1 class="font-display text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
          合作预约
        </h1>
        <p class="text-lg text-slate-500 max-w-2xl mx-auto">
          期待与您的合作！无论是商业TVC、电影调色、短视频制作还是其他视觉项目，都欢迎预约咨询。
        </p>
      </div>

      <!-- Services Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 reveal">
        <div class="glass-card p-8 space-y-4 rounded-3xl border-2 border-black/10">
          <span class="text-3xl">🎬</span>
          <h3 class="font-display text-xl font-bold text-slate-900">商业TVC广告</h3>
          <p class="text-sm text-slate-500 leading-relaxed">
            专业的商业广告拍摄与后期制作，涵盖产品宣传片、品牌故事片、社交媒体广告等。
          </p>
          <ul class="space-y-2 text-sm text-slate-600">
            <li class="flex items-center gap-2"><span class="text-emerald-500">✓</span> 4K/8K超高清拍摄</li>
            <li class="flex items-center gap-2"><span class="text-emerald-500">✓</span> 电影级调色处理</li>
            <li class="flex items-center gap-2"><span class="text-emerald-500">✓</span> 专业音效设计</li>
          </ul>
        </div>

        <div class="glass-card p-8 space-y-4 rounded-3xl border-2 border-black/10">
          <span class="text-3xl">🎨</span>
          <h3 class="font-display text-xl font-bold text-slate-900">电影/纪录片调色</h3>
          <p class="text-sm text-slate-500 leading-relaxed">
            DaVinci Resolve专业调色，支持ACES色彩空间管理，打造电影级视觉质感。
          </p>
          <ul class="space-y-2 text-sm text-slate-600">
            <li class="flex items-center gap-2"><span class="text-emerald-500">✓</span> ACEScct色彩管理</li>
            <li class="flex items-center gap-2"><span class="text-emerald-500">✓</span> HDR/SDR双版本交付</li>
            <li class="flex items-center gap-2"><span class="text-emerald-500">✓</span> 胶片质感还原</li>
          </ul>
        </div>

        <div class="glass-card p-8 space-y-4 rounded-3xl border-2 border-black/10">
          <span class="text-3xl">📹</span>
          <h3 class="font-display text-xl font-bold text-slate-900">短视频制作</h3>
          <p class="text-sm text-slate-500 leading-relaxed">
            TikTok、抖音、小红书等平台短视频内容策划、拍摄与后期制作。
          </p>
          <ul class="space-y-2 text-sm text-slate-600">
            <li class="flex items-center gap-2"><span class="text-emerald-500">✓</span> 竖屏/横屏适配</li>
            <li class="flex items-center gap-2"><span class="text-emerald-500">✓</span> 快节奏剪辑</li>
            <li class="flex items-center gap-2"><span class="text-emerald-500">✓</span> 平台算法优化</li>
          </ul>
        </div>

        <div class="glass-card p-8 space-y-4 rounded-3xl border-2 border-black/10">
          <span class="text-3xl">🎵</span>
          <h3 class="font-display text-xl font-bold text-slate-900">音效/配乐设计</h3>
          <p class="text-sm text-slate-500 leading-relaxed">
            专业的音频后期处理，包括环境音设计、配乐编曲、混音母带等。
          </p>
          <ul class="space-y-2 text-sm text-slate-600">
            <li class="flex items-center gap-2"><span class="text-emerald-500">✓</span> 24-bit/96kHz高保真</li>
            <li class="flex items-center gap-2"><span class="text-emerald-500">✓</span> 环境音编织</li>
            <li class="flex items-center gap-2"><span class="text-emerald-500">✓</span> 版权音乐库</li>
          </ul>
        </div>
      </div>

      <!-- Process Section -->
      <div class="glass-card p-8 sm:p-12 space-y-8 rounded-3xl border-2 border-black/10 reveal">
        <h2 class="font-display text-2xl font-bold text-slate-900 text-center">合作流程</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="text-center space-y-3">
            <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-700 font-bold text-lg flex items-center justify-center mx-auto">1</div>
            <h4 class="font-bold text-slate-900">咨询沟通</h4>
            <p class="text-xs text-slate-500">了解项目需求、预算和时间节点</p>
          </div>
          <div class="text-center space-y-3">
            <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-700 font-bold text-lg flex items-center justify-center mx-auto">2</div>
            <h4 class="font-bold text-slate-900">方案报价</h4>
            <p class="text-xs text-slate-500">提供详细的创意方案和报价单</p>
          </div>
          <div class="text-center space-y-3">
            <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-700 font-bold text-lg flex items-center justify-center mx-auto">3</div>
            <h4 class="font-bold text-slate-900">签订合同</h4>
            <p class="text-xs text-slate-500">确认合作细节并签署正式合同</p>
          </div>
          <div class="text-center space-y-3">
            <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-700 font-bold text-lg flex items-center justify-center mx-auto">4</div>
            <h4 class="font-bold text-slate-900">项目交付</h4>
            <p class="text-xs text-slate-500">按约定时间高质量交付成品</p>
          </div>
        </div>
      </div>

      <!-- CTA Button -->
      <div class="text-center space-y-4 reveal">
        <NuxtLink to="/booking/form" class="btn-primary inline-flex items-center gap-2 py-4 px-8 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all">
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
