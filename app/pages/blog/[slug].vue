<template>
  <div class="min-h-screen pt-28 pb-24 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-[#F8F8F8] via-slate-50 to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] pointer-events-none rounded-full blur-[120px] opacity-70"
      style="background: radial-gradient(circle, rgba(0,122,255,0.2) 0%, rgba(224,242,254,0.4) 45%, transparent 75%);"
    />

    <div class="max-w-4xl mx-auto relative z-10 space-y-10">
      <div class="flex items-center justify-between">
        <NuxtLink
          to="/blog"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-xs text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#007AFF] transition-colors"
        >
          ← 返回文章列表
        </NuxtLink>
        <CapsuleTag v-if="post" variant="primary">{{ post.category }}</CapsuleTag>
      </div>

      <div v-if="!post" class="py-20 text-center space-y-4 bg-white/80 dark:bg-slate-900/80 rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-xl backdrop-blur-xl p-8 max-w-xl mx-auto">
        <div class="w-16 h-16 rounded-full bg-blue-50 dark:bg-slate-800 text-[#007AFF] flex items-center justify-center mx-auto text-2xl font-bold">✍️</div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">文章未找到或尚未发布</h2>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">前往管理后台即可创建并发布您的第一篇博客文章。</p>
        <NuxtLink to="/blog" class="px-5 py-2.5 rounded-full bg-[#007AFF] text-white text-xs font-bold shadow-md hover:bg-[#0062cc] transition-colors">返回博客前台</NuxtLink>
      </div>

      <template v-else>
        <div class="space-y-6 text-center max-w-3xl mx-auto">
          <h1 class="text-3xl sm:text-4xl font-extrabold font-display leading-[1.25] text-slate-900 dark:text-white tracking-tight">
            {{ post.title }}
          </h1>
          <div class="flex flex-wrap items-center justify-center gap-3">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 shadow-xs">
              <img :src="post.author.avatar" class="w-6 h-6 rounded-full object-cover" />
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200">{{ post.author.name }}</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] font-semibold">{{ post.author.role }}</span>
            </div>
            <span class="text-xs font-mono font-medium text-slate-500">{{ post.createdAt }}</span>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-[#F8F8F8] dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
              ⏱️ {{ formatReadTime(post.readTime, post.content) }}
            </span>
          </div>
        </div>

        <div class="aspect-[21/9] rounded-[28px] overflow-hidden shadow-2xl border border-slate-200/60 dark:border-slate-800">
          <img :src="post.coverImage" :alt="post.title" class="w-full h-full object-cover" />
        </div>

        <div class="bg-white/90 dark:bg-slate-900/90 rounded-[32px] p-8 sm:p-12 shadow-xl border border-slate-200/70 dark:border-slate-800 backdrop-blur-xl space-y-8">
          <div class="rounded-2xl border border-[#007AFF]/25 overflow-hidden bg-gradient-to-br from-[#007AFF]/5 via-blue-50/30 to-indigo-50/20 dark:from-[#007AFF]/10 dark:via-slate-900/50 dark:to-slate-900/30">
            <div class="flex items-center gap-2.5 px-5 py-3 border-b border-[#007AFF]/15 bg-[#007AFF]/8 dark:bg-[#007AFF]/15">
              <span class="w-2 h-2 rounded-full bg-[#007AFF] animate-pulse" />
              <span class="text-xs font-bold text-[#007AFF] tracking-wide uppercase font-mono">AI 智能总结</span>
              <span v-if="aiSummarySource === 'llm'" class="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#007AFF] text-white">LLM 智能生成</span>
              <span v-else-if="aiSummarySource" class="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">智能提取</span>
              <span v-if="aiSummaryLoading" class="ml-auto flex items-center gap-1 text-[10px] text-slate-400">
                <svg class="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                生成中...
              </span>
            </div>
            <div class="px-5 py-4 min-h-[56px]">
              <div v-if="aiSummaryLoading" class="space-y-2 animate-pulse">
                <div class="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
                <div class="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full w-4/5" />
                <div class="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full w-2/3" />
              </div>
              <p v-else class="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                {{ aiSummaryDisplayText }}<span v-if="aiSummaryTyping" class="inline-block w-0.5 h-4 bg-[#007AFF] ml-0.5 animate-pulse align-middle" />
              </p>
            </div>
          </div>

          <div class="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-base leading-relaxed space-y-6">
            <div v-html="renderedContent" />
          </div>

          <div class="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-bold text-slate-400">标签:</span>
              <span v-for="(tag, idx) in post.tags" :key="idx" class="px-3 py-1 rounded-full text-xs font-semibold bg-[#F8F8F8] dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                #{{ tag }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-400">分享文章:</span>
              <button @click="shareAction('link')" class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#F8F8F8] dark:bg-slate-800 hover:bg-[#007AFF] hover:text-white transition-colors border border-slate-200 dark:border-slate-700">
                🔗 复制链接
              </button>
              <button @click="shareAction('poster')" :disabled="isGeneratingPoster" class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#007AFF] text-white hover:bg-[#0062cc] shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isGeneratingPoster ? '⏳ 生成中...' : '🎨 生成胶囊海报' }}
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
blogStore.init()

const post = computed(() => blogStore.getPostBySlug(slugParam.value))

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
    const fallback = post.value?.excerpt || ''
    aiSummaryDisplayText.value = fallback
    aiSummaryText.value = fallback
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
  const fallback = post.value?.excerpt || ''
  aiSummaryText.value = fallback
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

// ── Canvas-based Poster Generator ────────────────────────────────────────────
// Draws the poster directly on a 2D canvas — no DOM capture, no CORS issues, no font hangs
const generatePoster = async () => {
  if (isGeneratingPoster.value) return
  if (!post.value) { alert('文章数据加载中，请稍后再试。'); return }
  isGeneratingPoster.value = true

  try {
    const W = 960
    const H = 1280
    const R = 40 // corner radius

    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!

    // ── Background gradient ────────────────────────────────────────────
    const bg = ctx.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, '#090d16')
    bg.addColorStop(0.5, '#1e1b4b')
    bg.addColorStop(1, '#0f172a')
    roundRect(ctx, 0, 0, W, H, R, bg)

    let curY = 52

    // ── Header bar ────────────────────────────────────────────────────
    ctx.fillStyle = '#007AFF'
    ctx.beginPath()
    ctx.arc(52, curY + 7, 7, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 26px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.fillText('XO STUDIO · 胶囊精选海报', 70, curY + 14)

    // Category pill
    const cat = post.value.category || 'Blog'
    const catW = ctx.measureText(cat).width + 28
    roundRect(ctx, W - catW - 44, curY - 6, catW, 36, 18, '#007AFF')
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 22px -apple-system, "PingFang SC", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(cat, W - 44 - catW / 2, curY + 16)
    ctx.textAlign = 'left'

    curY += 60

    // ── Divider ───────────────────────────────────────────────────────
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(44, curY)
    ctx.lineTo(W - 44, curY)
    ctx.stroke()
    curY += 32

    // ── Cover image ───────────────────────────────────────────────────
    const coverH = 360
    if (post.value.coverImage) {
      try {
        const img = await loadImage(post.value.coverImage)
        ctx.save()
        roundRect(ctx, 44, curY, W - 88, coverH, 24, 'clip')
        ctx.drawImage(img, 44, curY, W - 88, coverH)
        // dark overlay at bottom
        const imgGrad = ctx.createLinearGradient(0, curY, 0, curY + coverH)
        imgGrad.addColorStop(0.6, 'rgba(9,13,22,0)')
        imgGrad.addColorStop(1, 'rgba(9,13,22,0.85)')
        ctx.fillStyle = imgGrad
        ctx.fillRect(44, curY, W - 88, coverH)
        ctx.restore()
      } catch {
        // fallback: colored rect
        const fallback = ctx.createLinearGradient(44, curY, W - 44, curY + coverH)
        fallback.addColorStop(0, '#1e3a5f')
        fallback.addColorStop(1, '#1e1b4b')
        roundRect(ctx, 44, curY, W - 88, coverH, 24, fallback)
      }
    }
    curY += coverH + 40

    // ── Title ─────────────────────────────────────────────────────────
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 44px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'
    curY = wrapText(ctx, post.value.title, 44, curY, W - 88, 58, '#ffffff', 'bold 44px -apple-system, "PingFang SC", sans-serif', 2)
    curY += 32

    // ── AI Summary card ───────────────────────────────────────────────
    const summaryText = aiSummaryText.value || post.value.excerpt || ''
    if (summaryText) {
      const cardH = 200
      roundRect(ctx, 44, curY, W - 88, cardH, 22, 'rgba(255,255,255,0.06)')
      // card border
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.roundRect(44, curY, W - 88, cardH, 22)
      ctx.stroke()

      ctx.fillStyle = '#38bdf8'
      ctx.font = 'bold 20px -apple-system, "PingFang SC", sans-serif'
      ctx.fillText('🤖  AI 智能精炼要点', 68, curY + 36)

      curY = wrapText(ctx, summaryText, 68, curY + 64, W - 136, 36, '#cbd5e1', '22px -apple-system, "PingFang SC", sans-serif', 3)
      curY += 44
    }

    // ── Tags ──────────────────────────────────────────────────────────
    if (post.value.tags?.length) {
      let tagX = 44
      const tags = post.value.tags.slice(0, 5)
      for (const tag of tags) {
        const label = `#${tag}`
        ctx.font = '20px -apple-system, "PingFang SC", sans-serif'
        const tw = ctx.measureText(label).width + 28
        roundRect(ctx, tagX, curY, tw, 40, 20, 'rgba(255,255,255,0.08)')
        ctx.strokeStyle = 'rgba(255,255,255,0.12)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(tagX, curY, tw, 40, 20)
        ctx.stroke()
        ctx.fillStyle = '#94a3b8'
        ctx.font = '20px -apple-system, "PingFang SC", sans-serif'
        ctx.fillText(label, tagX + 14, curY + 26)
        tagX += tw + 12
      }
      curY += 64
    }

    // ── Footer divider ────────────────────────────────────────────────
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(44, H - 160)
    ctx.lineTo(W - 44, H - 160)
    ctx.stroke()

    // ── Author avatar ─────────────────────────────────────────────────
    const avatarY = H - 140
    try {
      const avatar = await loadImage(post.value.author?.avatar || '')
      ctx.save()
      ctx.beginPath()
      ctx.arc(88, avatarY + 36, 36, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(avatar, 52, avatarY, 72, 72)
      ctx.restore()
      // avatar ring
      ctx.strokeStyle = '#007AFF'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(88, avatarY + 36, 36, 0, Math.PI * 2)
      ctx.stroke()
    } catch {}

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 26px -apple-system, "PingFang SC", sans-serif'
    ctx.fillText(post.value.author?.name || 'Xo', 136, avatarY + 26)
    ctx.fillStyle = '#94a3b8'
    ctx.font = '20px -apple-system, "PingFang SC", sans-serif'
    ctx.fillText(`${post.value.author?.role || 'Editor'} · xo.xoxox.bond`, 136, avatarY + 56)

    // ── QR Code (real scannable, from QuickChart.io) ────────────────────
    await drawRealQR(ctx, W - 160, H - 156, 112)
    ctx.fillStyle = '#64748b'
    ctx.font = '18px -apple-system, "PingFang SC", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('扫码阅读全文', W - 104, H - 28)
    ctx.textAlign = 'left'

    // ── Download ──────────────────────────────────────────────────────
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `capsule-poster-${post.value.slug || 'article'}.png`
    link.href = dataUrl
    link.click()

    alert('🎨 胶囊海报生成成功！图片已自动下载。')
  } catch (err: any) {
    console.error('Poster generation error:', err)
    alert('海报生成失败: ' + (err?.message || '请重试'))
  } finally {
    isGeneratingPoster.value = false
  }
}

// Helper: load image via canvas-compatible proxy (avoids CORS)
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => {
      // retry without crossOrigin for external images
      const img2 = new Image()
      img2.onload = () => resolve(img2)
      img2.onerror = reject
      img2.src = src
    }
    img.src = src
  })
}

// Helper: rounded rect fill or clip
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient | 'clip') {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  if (fill === 'clip') {
    ctx.clip()
  } else {
    ctx.fillStyle = fill
    ctx.fill()
  }
}

// Helper: wrap text, return new Y position
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number, color: string, font: string, maxLines: number): number {
  ctx.font = font
  ctx.fillStyle = color
  const words = text.split('')
  let line = ''
  let lineCount = 0
  let curY = y
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i]
    if (ctx.measureText(testLine).width > maxW && line.length > 0) {
      ctx.fillText(line, x, curY)
      line = words[i]
      curY += lineH
      lineCount++
      if (lineCount >= maxLines) {
        // truncate with ellipsis
        let truncated = line + words.slice(i + 1).join('')
        while (ctx.measureText(truncated + '…').width > maxW && truncated.length > 0) {
          truncated = truncated.slice(0, -1)
        }
        ctx.fillText(truncated + '…', x, curY)
        curY += lineH
        return curY
      }
    } else {
      line = testLine
    }
  }
  if (line) {
    ctx.fillText(line, x, curY)
    curY += lineH
  }
  return curY
}

// Helper: draw a REAL scannable QR code using QuickChart.io API
async function drawRealQR(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  // White rounded background
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.roundRect(x, y, size, size, 14)
  ctx.fill()

  try {
    // Get current page URL or use site URL for the QR content
    const qrText = encodeURIComponent(window.location.href)
    // QuickChart.io generates real, scannable QR codes as PNG images
    const qrUrl = `https://quickchart.io/qr?text=${qrText}&size=200&margin=1&ecLevel=M&format=png&dark=0f172a&light=ffffff`
    const qrImg = await loadImage(qrUrl)
    // Draw QR code inside the white background with 6px padding
    const pad = 6
    ctx.drawImage(qrImg, x + pad, y + pad, size - pad * 2, size - pad * 2)
  } catch (e) {
    // Fallback: draw simple placeholder text
    ctx.fillStyle = '#94a3b8'
    ctx.font = `${size * 0.12}px monospace`
    ctx.textAlign = 'center'
    ctx.fillText('QR Code', x + size / 2, y + size / 2)
    ctx.textAlign = 'left'
  }
}

// Simple markdown to HTML renderer
const renderMarkdown = (text: string): string => {
  if (!text) return ''
  let html = text
    .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.15rem; font-weight: 700; color: #007AFF; margin-top: 1.25rem; margin-bottom: 0.5rem;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.35rem; font-weight: 800; color: #007AFF; margin-top: 1.5rem; margin-bottom: 0.75rem;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="font-size: 1.6rem; font-weight: 800; color: #007AFF; margin-top: 1.75rem; margin-bottom: 1rem;">$1</h1>')
    .replace(/^\> (.*$)/gim, '<blockquote style="border-left: 4px solid #007AFF; padding: 0.75rem 1rem; margin: 1rem 0; color: #475569; font-style: italic; background: rgba(0,122,255,0.05); border-radius: 0 12px 12px 0;">$1</blockquote>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/gim, '<pre style="background: #0f172a; color: #34d399; padding: 1rem; border-radius: 16px; font-family: monospace; font-size: 0.85rem; overflow-x: auto; margin: 1rem 0;"><code>$1</code></pre>')
    .replace(/`(.*?)`/gim, '<code style="background: #f1f5f9; color: #0f172a; padding: 0.15rem 0.4rem; border-radius: 6px; font-family: monospace; font-size: 0.9em;">$1</code>')
    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 16px; margin: 1rem 0;" />')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" style="color: #007AFF; text-decoration: underline;">$1</a>')
    .replace(/^\- (.*$)/gim, '<li style="margin-left: 1.5rem; margin-bottom: 0.25rem;">$1</li>')
    .replace(/\n\n/gim, '</p><p style="margin-bottom: 1rem;">')
    .replace(/\n/gim, '<br/>')
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
  meta: [{ name: 'description', content: computed(() => post.value?.excerpt || '文章详情') }]
})
</script>
