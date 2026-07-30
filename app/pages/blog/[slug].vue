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
            <span v-if="aiSummarySource === 'llm'" class="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#007AFF] text-white">LLM 智能生成</span>
            <span v-else-if="aiSummarySource" class="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">智能提取</span>
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

  <!-- Capsule Poster Template (Rendered Off-Screen with full width and layout) -->
  <div
    id="capsule-poster"
    style="position: fixed; left: -9999px; top: 0; width: 480px; z-index: -9999; visibility: visible; display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"
  >
    <div style="background: linear-gradient(145deg, #090d16 0%, #1e1b4b 50%, #0f172a 100%); border-radius: 28px; padding: 28px; border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); color: #ffffff;">
      <!-- Header Bar -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-b: 1px solid rgba(255,255,255,0.1); padding-bottom: 14px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background: #007AFF;"></div>
          <span style="font-size: 13px; font-weight: 800; tracking-wide: 0.05em; color: #ffffff;">XO STUDIO · 胶囊精选海报</span>
        </div>
        <div style="padding: 4px 12px; background: #007AFF; color: #ffffff; border-radius: 999px; font-size: 11px; font-weight: 800;">
          {{ post?.category || 'Blog' }}
        </div>
      </div>

      <!-- Cover Image -->
      <div v-if="post?.coverImage" style="width: 100%; height: 230px; border-radius: 20px; overflow: hidden; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.1);">
        <img
          :src="post.coverImage"
          style="width: 100%; height: 100%; object-fit: cover;"
          crossorigin="anonymous"
        />
      </div>

      <!-- Main Title -->
      <h1 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 14px 0; line-height: 1.35; letter-spacing: -0.01em;">
        {{ post?.title || '文章标题' }}
      </h1>

      <!-- AI Core Summary / Excerpt Highlights Card -->
      <div style="background: rgba(255, 255, 255, 0.07); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 18px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; items-center; gap: 6px; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em;">🤖 AI 智能精炼要点</span>
        </div>
        <p style="font-size: 13px; color: #cbd5e1; margin: 0; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;">
          {{ aiSummaryText || post?.excerpt || '探讨现代 Web 核心架构与胶囊设计规范，提供高清原片视觉呈现。' }}
        </p>
      </div>

      <!-- Tags Pills -->
      <div v-if="post?.tags?.length" style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 22px;">
        <span
          v-for="(tag, idx) in post.tags.slice(0, 4)"
          :key="idx"
          style="padding: 4px 10px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #94a3b8; border-radius: 999px; font-size: 10px; font-weight: 600;"
        >
          #{{ tag }}
        </span>
      </div>

      <!-- Author & Real QR Code Footer -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 18px; border-top: 1px solid rgba(255, 255, 255, 0.12);">
        <!-- Author Profile -->
        <div style="display: flex; align-items: center; gap: 12px;">
          <img
            :src="post?.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'"
            style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #007AFF;"
            crossorigin="anonymous"
          />
          <div>
            <div style="font-size: 13px; font-weight: 800; color: #ffffff;">{{ post?.author?.name || 'Xo' }}</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">{{ post?.author?.role || 'Senior Editor' }} · xo.xoxox.bond</div>
          </div>
        </div>

        <!-- Real Vector QR Code Component -->
        <div style="display: flex; flex-col; align-items: center; gap: 4px;">
          <div id="capsule-poster-qr" style="width: 76px; height: 76px; background: #ffffff; border-radius: 12px; padding: 4px; border: 1px solid rgba(255,255,255,0.2); overflow: hidden; display: flex; align-items: center; justify-content: center;">
            <!-- Injected via generateQRCodeSVG dynamically -->
          </div>
          <span style="font-size: 9px; font-weight: 600; color: #64748b; margin-top: 4px;">扫码阅读全文</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { generateOfflineQRSVG, generateQRCodeSVG } from '~/utils/qrcode'

const route = useRoute()
const slugParam = computed(() => route.params.slug as string)

const blogStore = useBlogStore()
blogStore.init()

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
  if (!post.value?.content) {
    aiSummaryLoading.value = false
    aiSummaryDisplayText.value = post.value?.excerpt || ''
    aiSummaryText.value = post.value?.excerpt || ''
    return
  }

  aiSummaryLoading.value = true
  try {
    const res = await $fetch<{ success: boolean; summary?: string; source?: string }>('/api/blog/summary', {
      method: 'POST',
      body: { content: post.value.content, title: post.value.title }
    })

    if (res?.success && res?.summary) {
      aiSummarySource.value = (res.source || 'extract') as any
      aiSummaryLoading.value = false
      aiSummaryText.value = res.summary
      startTypewriter(res.summary)
      return
    }
  } catch (e) {}

  aiSummaryLoading.value = false
  aiSummaryText.value = post.value?.excerpt || ''
  aiSummaryDisplayText.value = post.value?.excerpt || ''
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
  if (isGeneratingPoster.value) return
  isGeneratingPoster.value = true

  try {
    const { toPng } = await import('html-to-image')
    const posterEl = document.getElementById('capsule-poster')
    if (!posterEl) {
      alert('海报模板加载失败。')
      return
    }

    // 1. Inject real QR Code SVG
    const qrContainer = document.getElementById('capsule-poster-qr')
    if (qrContainer) {
      const pageUrl = window.location.href
      qrContainer.innerHTML = generateOfflineQRSVG(68)
    }

    // 2. Preload images inside poster element with 400ms safety timeout
    const imgs = Array.from(posterEl.querySelectorAll('img'))
    const preloadPromise = Promise.all(imgs.map(img => {
      if (img.complete) return Promise.resolve()
      return new Promise(res => {
        img.onload = res
        img.onerror = res
      })
    }))
    const timeoutPromise = new Promise(res => setTimeout(res, 400))
    await Promise.race([preloadPromise, timeoutPromise])

    // 3. Render PNG using html-to-image (skipFonts prevents network font fetching hangs)
    const dataUrl = await toPng(posterEl, {
      quality: 0.95,
      pixelRatio: 2,
      skipFonts: true,
      cacheBust: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#090d16',
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left'
      }
    })

    // 4. Download trigger
    const link = document.createElement('a')
    link.download = `capsule-poster-${post.value?.slug || 'article'}.png`
    link.href = dataUrl
    link.click()

    alert('🎨 胶囊海报生成成功！图片已自动下载到本地。')
  } catch (error: any) {
    console.error('海报生成失败:', error)
    alert('海报生成失败: ' + (error.message || '请重试'))
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
