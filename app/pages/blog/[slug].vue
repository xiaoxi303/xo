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
          此博客网站暂无发布内容。前往管理后台即可创建并发布您的第一篇博客文章。
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

          <span class="text-xs font-semibold text-slate-400">—</span>
          <span class="text-xs font-mono font-medium text-slate-500">{{ post?.createdAt }}</span>
          <span class="text-xs font-semibold text-slate-400">—</span>
          
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
        <!-- AI 智能总结 -->
        <div class="rounded-2xl border border-[#007AFF]/25 overflow-hidden bg-gradient-to-br from-[#007AFF]/5 via-blue-50/30 to-indigo-50/20 dark:from-[#007AFF]/10 dark:via-slate-900/50 dark:to-slate-900/30">
          <!-- Header Bar -->
          <div class="flex items-center gap-2.5 px-5 py-3 border-b border-[#007AFF]/15 bg-[#007AFF]/8 dark:bg-[#007AFF]/15">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-[#007AFF] animate-pulse" />
              <span class="text-xs font-bold text-[#007AFF] tracking-wide uppercase font-mono">AI 智能总结</span>
            </div>
            <span v-if="aiSummarySource === 'llm'" class="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#007AFF] text-white">LLM</span>
            <span v-else-if="aiSummarySource === 'extract'" class="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">智能提取</span>
            <span v-if="aiSummaryLoading" class="ml-auto flex items-center gap-1 text-[10px] text-slate-400">
              <svg class="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              生成中...
            </span>
          </div>
          <!-- Content -->
          <div class="px-5 py-4 min-h-[56px]">
            <!-- Loading skeleton -->
            <div v-if="aiSummaryLoading" class="space-y-2 animate-pulse">
              <div class="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
              <div class="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full w-4/5" />
              <div class="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full w-2/3" />
            </div>
            <!-- Typewriter text -->
            <p v-else class="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {{ aiSummaryDisplayText }}<span v-if="aiSummaryTyping" class="inline-block w-0.5 h-4 bg-[#007AFF] ml-0.5 animate-pulse align-middle" />
            </p>
          </div>
        </div>

        <!-- Rendered Typography & Code Blocks -->
        <div class="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-base leading-relaxed space-y-6">
          <div v-html="renderedContent" />
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
              :disabled="isGeneratingPoster"
              class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#007AFF] text-white hover:bg-[#0062cc] shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isGeneratingPoster ? '⏳ 生成中...' : '🎨 生成胶囊海报' }}
            </button>
          </div>
        </div>
      </div>
      </template>
    </div>
  </div>

  <!-- Capsule Poster Template (Hidden, used for generation) -->
  <div id="capsule-poster" style="display: none; position: fixed; left: -9999px; top: 0; width: 400px; padding: 0;">
    <div style="background: linear-gradient(135deg, #f8f8f8 0%, #e8f4ff 50%, #f0f4ff 100%); border-radius: 28px; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <!-- Cover Image -->
      <div style="width: 100%; height: 220px; overflow: hidden; position: relative;">
        <img
          :src="post?.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'"
          style="width: 100%; height: 100%; object-fit: cover;"
          crossorigin="anonymous"
        />
        <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 60px; background: linear-gradient(transparent, rgba(248,248,248,0.9));"></div>
      </div>
      
      <!-- Content -->
      <div style="padding: 24px 28px 28px;">
        <!-- Category Badge -->
        <div style="display: inline-block; padding: 4px 12px; background: #007AFF; color: white; border-radius: 999px; font-size: 11px; font-weight: 700; margin-bottom: 12px;">
          {{ post?.category || 'Design' }}
        </div>
        
        <!-- Title -->
        <h1 style="font-size: 20px; font-weight: 800; color: #1e293b; margin: 0 0 12px 0; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          {{ post?.title || '文章标题' }}
        </h1>
        
        <!-- Excerpt -->
        <p style="font-size: 13px; color: #64748b; margin: 0 0 20px 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
          {{ post?.excerpt || '文章摘要...' }}
        </p>
        
        <!-- Author & Footer -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <img
              :src="post?.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'"
              style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;"
              crossorigin="anonymous"
            />
            <div>
              <div style="font-size: 12px; font-weight: 700; color: #1e293b;">{{ post?.author?.name || 'Antigravity Design' }}</div>
              <div style="font-size: 10px; color: #94a3b8;">{{ post?.author?.role || 'Designer' }}</div>
            </div>
          </div>
          
          <!-- QR Code Placeholder -->
          <div style="width: 56px; height: 56px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 2px solid #e2e8f0;">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="12" height="12" rx="2" fill="#1e293b"/>
              <rect x="24" y="4" width="12" height="12" rx="2" fill="#1e293b"/>
              <rect x="4" y="24" width="12" height="12" rx="2" fill="#1e293b"/>
              <rect x="8" y="8" width="4" height="4" rx="1" fill="white"/>
              <rect x="28" y="8" width="4" height="4" rx="1" fill="white"/>
              <rect x="8" y="28" width="4" height="4" rx="1" fill="white"/>
              <rect x="20" y="20" width="4" height="4" rx="1" fill="#007AFF"/>
              <rect x="28" y="20" width="4" height="4" rx="1" fill="#1e293b"/>
              <rect x="20" y="28" width="4" height="4" rx="1" fill="#1e293b"/>
              <rect x="28" y="28" width="4" height="4" rx="1" fill="#1e293b"/>
            </svg>
          </div>
        </div>
        
        <!-- Brand Footer -->
        <div style="text-align: center; margin-top: 16px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
          <div style="font-size: 10px; color: #94a3b8; font-weight: 600;">Modern Serenity 胶囊风博客</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slugParam = computed(() => route.params.slug as string)

const blogStore = useBlogStore()
await blogStore.init()

const post = computed(() => blogStore.getPostBySlug(slugParam.value))

// ── AI Summary State ───────────────────────────────────────────────────
const aiSummaryLoading = ref(false)
const aiSummaryText = ref('')
const aiSummaryDisplayText = ref('')
const aiSummaryTyping = ref(false)
const aiSummarySource = ref<'llm' | 'extract' | ''>('')

const startTypewriter = (text: string) => {
  aiSummaryDisplayText.value = ''
  aiSummaryTyping.value = true
  let i = 0
  const interval = setInterval(() => {
    if (i < text.length) {
      aiSummaryDisplayText.value += text[i]
      i++
    } else {
      aiSummaryTyping.value = false
      clearInterval(interval)
    }
  }, 28)
}

const fetchAiSummary = async () => {
  const fallback = post.value?.excerpt || ''
  if (!post.value?.content) {
    // No content at all → show excerpt immediately, no loading
    aiSummaryLoading.value = false
    aiSummaryDisplayText.value = fallback
    return
  }

  // First: probe whether AI is configured (fast check)
  aiSummaryLoading.value = true
  try {
    const res = await $fetch<{ success: boolean; summary?: string; source?: string; noKey?: boolean }>('/api/blog/summary', {
      method: 'POST',
      body: { content: post.value.content, title: post.value.title }
    })

    if (res.noKey) {
      // No API key configured → show excerpt directly, no animation, no loading
      aiSummaryLoading.value = false
      aiSummaryDisplayText.value = fallback
      return
    }

    if (res.success && res.summary) {
      // AI summary ready → typewriter animation
      aiSummarySource.value = res.source as 'llm' | 'extract'
      aiSummaryLoading.value = false
      startTypewriter(res.summary)
      return
    }
  } catch {}

  // Any error → show excerpt directly
  aiSummaryLoading.value = false
  aiSummaryDisplayText.value = fallback
}

onMounted(() => {
  if (import.meta.client && slugParam.value && post.value) {
    recordProjectClickEvent(slugParam.value, post.value?.title)
    $fetch(`/api/projects/${slugParam.value}/view`, { method: 'POST' }).catch(() => {})
    fetchAiSummary()
  }
})

const isGeneratingPoster = ref(false)

const shareAction = async (type: string) => {
  if (!process.client) return

  if (type === 'link') {
    navigator.clipboard.writeText(window.location.href)
    alert('文章链接已复制到剪贴板！')
  } else if (type === 'poster') {
    await generatePoster()
  }
}

const generatePoster = async () => {
  isGeneratingPoster.value = true

  try {
    const { toPng } = await import('html-to-image')
    const posterEl = document.getElementById('capsule-poster')
    if (!posterEl) {
      alert('海报模板加载失败')
      return
    }

    // 显示海报容器
    posterEl.style.display = 'block'

    const dataUrl = await toPng(posterEl, {
      quality: 1,
      pixelRatio: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left'
      }
    })

    // 隐藏海报容器
    posterEl.style.display = 'none'

    // 触发下载
    const link = document.createElement('a')
    link.download = `capsule-poster-${post.value?.slug || 'article'}.png`
    link.href = dataUrl
    link.click()

    alert('海报生成成功！已开始下载。')
  } catch (error) {
    console.error('海报生成失败:', error)
    alert('海报生成失败，请重试。')
  } finally {
    isGeneratingPoster.value = false
  }
}

// Simple markdown to HTML renderer
const renderMarkdown = (text: string): string => {
  if (!text) return ''
  
  let html = text
    // Headers
    .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.15rem; font-weight: 700; color: #007AFF; margin-top: 1.25rem; margin-bottom: 0.5rem;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.35rem; font-weight: 800; color: #007AFF; margin-top: 1.5rem; margin-bottom: 0.75rem;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="font-size: 1.6rem; font-weight: 800; color: #007AFF; margin-top: 1.75rem; margin-bottom: 1rem;">$1</h1>')
    // Blockquotes
    .replace(/^\> (.*$)/gim, '<blockquote style="border-left: 4px solid #007AFF; padding: 0.75rem 1rem; margin: 1rem 0; color: #475569; font-style: italic; background: rgba(0,122,255,0.05); border-radius: 0 12px 12px 0;">$1</blockquote>')
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/gim, '<pre style="background: #0f172a; color: #34d399; padding: 1rem; border-radius: 16px; font-family: monospace; font-size: 0.85rem; overflow-x: auto; margin: 1rem 0;"><code>$1</code></pre>')
    // Inline code
    .replace(/`(.*?)`/gim, '<code style="background: #f1f5f9; color: #0f172a; padding: 0.15rem 0.4rem; border-radius: 6px; font-family: monospace; font-size: 0.9em;">$1</code>')
    // Images
    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 16px; margin: 1rem 0;" />')
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" style="color: #007AFF; text-decoration: underline;">$1</a>')
    // Unordered lists
    .replace(/^\- (.*$)/gim, '<li style="margin-left: 1.5rem; margin-bottom: 0.25rem;">$1</li>')
    // Paragraphs (double newline)
    .replace(/\n\n/gim, '</p><p style="margin-bottom: 1rem;">')
    // Single newlines
    .replace(/\n/gim, '<br/>')
  
  // Wrap in paragraph if not starting with a block element
  if (!html.startsWith('<h') && !html.startsWith('<blockquote') && !html.startsWith('<pre')) {
    html = '<p style="margin-bottom: 1rem;">' + html + '</p>'
  }
  
  return html
}

const renderedContent = computed(() => {
  const content = post.value?.content
  if (!content) return '<p style="color: #94a3b8; text-align: center;">暂无正文内容...</p>'
  return renderMarkdown(content)
})

useHead({
  title: computed(() => (post.value?.title || '文章详情') + ' - Modern Serenity 胶囊风博客'),
  meta: [
    { name: 'description', content: computed(() => post.value?.excerpt || '文章详情') }
  ]
})
</script>
