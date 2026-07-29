<template>
  <div class="min-h-screen pt-28 pb-24 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-[#F8F8F8] via-slate-50 to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
    <!-- Ambient Soft Pastel Blue Glow -->
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] pointer-events-none rounded-full blur-[120px] opacity-70"
      style="background: radial-gradient(circle, rgba(0,122,255,0.2) 0%, rgba(224,242,254,0.4) 45%, transparent 75%);"
    />

    <div class="max-w-4xl mx-auto relative z-10 space-y-10">
      <!-- Top Navigation & Category Pill -->
      <div class="flex items-center justify-between">
        <NuxtLink
          to="/blog"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-xs text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#007AFF] transition-colors"
        >
          ← 返回文章列表
        </NuxtLink>
        
        <CapsuleTag v-if="post" variant="primary">
          {{ post.category }}
        </CapsuleTag>
      </div>

      <!-- Article Not Found / Empty State -->
      <div v-if="!post" class="py-20 text-center space-y-4 bg-white/80 dark:bg-slate-900/80 rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-xl backdrop-blur-xl p-8 max-w-xl mx-auto">
        <div class="w-16 h-16 rounded-full bg-blue-50 dark:bg-slate-800 text-[#007AFF] flex items-center justify-center mx-auto text-2xl font-bold">
          ✍️
        </div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">文章未找到或尚未发布</h2>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">
          此博客网址暂无发布内容。前往管理后台即可创建并发布您的第一篇博客文章。
        </p>
        <div class="pt-2 flex items-center justify-center gap-3">
          <NuxtLink
            to="/blog"
            class="px-5 py-2.5 rounded-full bg-[#007AFF] text-white text-xs font-bold shadow-md hover:bg-[#0062cc] transition-colors"
          >
            返回博客前台
          </NuxtLink>
        </div>
      </div>

      <template v-else>
      <div class="space-y-6 text-center max-w-3xl mx-auto">
        <h1 class="text-3xl sm:text-4xl lg:text-[36px] font-extrabold font-display leading-[1.25] text-slate-900 dark:text-white tracking-tight">
          {{ post?.title || '文章加载中...' }}
        </h1>

        <!-- Author Pill Badge & Metadata -->
        <div class="flex flex-wrap items-center justify-center gap-3">
          <!-- Author Pill -->
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 shadow-xs">
            <img :src="post?.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'" class="w-6 h-6 rounded-full object-cover" />
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200">{{ post?.author.name }}</span>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] font-semibold">{{ post?.author.role }}</span>
          </div>

          <span class="text-xs font-semibold text-slate-400">•</span>
          <span class="text-xs font-mono font-medium text-slate-500">{{ post?.createdAt }}</span>
          <span class="text-xs font-semibold text-slate-400">•</span>
          
          <!-- Read Time Pill -->
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-[#F8F8F8] dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
            ⏱️ {{ post?.readTime }}
          </span>
        </div>
      </div>

      <!-- Cover Image -->
      <div class="aspect-[21/9] rounded-[28px] overflow-hidden shadow-2xl border border-slate-200/60 dark:border-slate-800 relative group">
        <img :src="post?.coverImage" :alt="post?.title" class="w-full h-full object-cover" />
      </div>

      <!-- Article Main Content Card -->
      <div class="bg-white/90 dark:bg-slate-900/90 rounded-[32px] p-8 sm:p-12 shadow-xl border border-slate-200/70 dark:border-slate-800 backdrop-blur-xl space-y-8">
        <!-- Lead Excerpt -->
        <div class="p-6 rounded-2xl bg-[#007AFF]/5 border border-[#007AFF]/20 text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed font-medium">
          💡 {{ post?.excerpt }}
        </div>

        <!-- Rendered Typography & Code Blocks -->
        <div class="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-base leading-relaxed space-y-6">
          <div v-html="renderedContent" />
        </div>

        <!-- Code Block Special Rounded Showcase -->
        <div class="relative rounded-[20px] overflow-hidden bg-slate-950 border border-slate-800 p-5 shadow-2xl font-mono text-xs text-slate-200 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-rose-500/80" />
              <span class="w-3 h-3 rounded-full bg-amber-500/80" />
              <span class="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span class="text-[11px] text-slate-400 font-bold ml-2">capsule-demo.js</span>
            </div>
            <!-- Top Right Pill Copy Code Button -->
            <button
              @click="copyCode"
              class="px-3.5 py-1 rounded-full bg-white/10 hover:bg-[#007AFF] text-white text-[11px] font-bold transition-all shadow-xs border border-white/15 flex items-center gap-1.5"
            >
              <span>{{ copied ? '✓ 已复制' : '📋 Copy Code' }}</span>
            </button>
          </div>
          <pre class="overflow-x-auto text-emerald-400 py-2"><code>// Modern Serenity Capsule System
const capsuleConfig = {
  theme: 'Pill Architecture',
  primaryColor: '#007AFF',
  borderRadius: '9999px',
  activeState: true
};</code></pre>
        </div>

        <!-- Tags & Capsule Share Buttons -->
        <div class="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <!-- Tags Pills -->
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-bold text-slate-400">标签:</span>
            <span
              v-for="(tag, idx) in post?.tags"
              :key="idx"
              class="px-3 py-1 rounded-full text-xs font-semibold bg-[#F8F8F8] dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              #{{ tag }}
            </span>
          </div>

          <!-- Capsule Share Buttons -->
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-400">分享文章:</span>
            <button
              @click="shareAction('link')"
              class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#F8F8F8] dark:bg-slate-800 hover:bg-[#007AFF] hover:text-white transition-colors border border-slate-200 dark:border-slate-700"
            >
              🔗 复制链接
            </button>
            <button
              @click="shareAction('poster')"
              class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#007AFF] text-white hover:bg-[#0062cc] shadow-md transition-colors"
            >
              🎨 生成胶囊海报
            </button>
          </div>
        </div>
      </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slugParam = computed(() => route.params.slug as string)

const blogStore = useBlogStore()
await blogStore.init()

const post = computed(() => blogStore.getPostBySlug(slugParam.value))

onMounted(() => {
  if (import.meta.client && slugParam.value && post.value) {
    recordProjectClickEvent(slugParam.value, post.value?.title)
    $fetch(`/api/projects/${slugParam.value}/view`, { method: 'POST' }).catch(() => {})
  }
})

const copied = ref(false)
const copyCode = () => {
  if (process.client) {
    navigator.clipboard.writeText(`// Modern Serenity Capsule System\nconst capsuleConfig = {\n  theme: 'Pill Architecture',\n  primaryColor: '#007AFF',\n  borderRadius: '9999px',\n  activeState: true\n};`)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

const shareAction = (type: string) => {
  if (process.client) {
    if (type === 'link') {
      navigator.clipboard.writeText(window.location.href)
      alert('文章链接已复制到剪贴板！')
    } else {
      alert('胶囊海报已准备完成，右键保存分享。')
    }
  }
}

const renderedContent = computed(() => {
  return `
    <h2 style="font-size: 1.5rem; font-weight: 800; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #007AFF;">1. 胶囊视觉设计的核心哲学</h2>
    <p>Modern Serenity 风格核心在于通过<strong>大弧度圆角 (Pill Badges)</strong> 与柔和微光背景，为前端和后台系统打造无比丝滑的感知体验。无论是文章筛选的 Floating Tab，还是状态切换指令，都能带来极其舒适的物理触感反馈。</p>
    
    <h2 style="font-size: 1.5rem; font-weight: 800; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #007AFF;">2. 代码块与信息交互呈现</h2>
    <p>我们在博客正文中特别设计了 16-24px 圆角的大号代码框，搭配右上角独有的 Copy Code 胶囊小按键，让程序员与设计师在浏览排版时获得最佳阅读体验。</p>
  `
})

useHead({
  title: computed(() => (post.value?.title || '文章详情') + ' - Modern Serenity 胶囊风博客'),
  meta: [
    { name: 'description', content: computed(() => post.value?.excerpt || '文章详情') }
  ]
})
</script>
