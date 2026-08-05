<template>
  <div class="min-h-screen pt-24 pb-20 px-4 sm:px-8 bg-gradient-to-b from-[#F8F8F8] via-slate-50 to-blue-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
    <div class="max-w-7xl mx-auto space-y-6">
      
      <!-- Top Action Bar -->
      <div class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[24px] bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-md backdrop-blur-xl">
        <div class="flex items-center gap-3">
          <button
            @click="goBack"
            class="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-[#007AFF] hover:text-white text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 select-none"
          >
            <span>← 返回后台</span>
          </button>

          <div class="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <div>
            <h1 class="text-base font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
              <span>{{ isNew ? '写新文章 (Create Post)' : '编辑文章 (Edit Post)' }}</span>
              <CapsuleTag :variant="post.status === 'Published' ? 'published' : 'draft'" :dot="true">
                {{ post.status }}
              </CapsuleTag>
            </h1>
            <p class="text-[11px] font-mono text-slate-400">Slug: /blog/{{ post.slug || 'my-post' }}</p>
          </div>
        </div>

        <!-- Mode Switcher & Save / Publish Capsule Buttons -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- View Mode Selector Capsule Tabs -->
          <div class="flex items-center gap-1 p-1 rounded-full bg-[#F8F8F8] dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 select-none">
            <button
              v-for="m in viewModes"
              :key="m.id"
              @click="activeViewMode = m.id"
              :class="[
                'px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1',
                activeViewMode === m.id
                  ? 'bg-white dark:bg-slate-900 text-[#007AFF] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              ]"
            >
              <span>{{ m.icon }}</span>
              <span class="hidden md:inline">{{ m.label }}</span>
            </button>
          </div>

          <!-- Settings Modal Button -->
          <button
            @click="isModalOpen = true"
            class="px-4 py-2 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#007AFF] transition-all shadow-xs flex items-center gap-1.5"
          >
            <span>⚙️ 发布设置</span>
          </button>

          <!-- Save Draft Button -->
          <button
            @click="saveAsDraft"
            class="px-4 py-2 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all shadow-xs"
          >
            🔒 存为草稿
          </button>

          <!-- Publish / Save Solid Blue #007AFF Capsule -->
          <button
            @click="publishPost"
            class="px-6 py-2 rounded-full text-xs font-bold text-white bg-[#007AFF] hover:bg-[#0062cc] shadow-[0_4px_15px_rgba(0,122,255,0.35)] active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>🚀 {{ post.status === 'Published' ? '保存更新' : '发布文章' }}</span>
          </button>
        </div>
      </div>

      <!-- Quick Metadata Bar (Title, Category, Slug, Cover Image Preview) -->
      <div class="bg-white/90 dark:bg-slate-900/90 rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-4 backdrop-blur-xl">
        <!-- Main Title Input -->
        <div class="space-y-1">
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400">文章标题 (Article Title)</label>
          <input
            v-model="post.title"
            type="text"
            placeholder="在此输入吸引人的文章标题..."
            class="w-full px-5 py-3.5 rounded-2xl bg-[#F8F8F8] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 transition-all"
          />
        </div>

        <!-- Inline Quick Settings Ribbon -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <!-- Slug input -->
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">URL Slug 别名</label>
            <input
              v-model="post.slug"
              type="text"
              class="w-full px-3.5 py-2 rounded-full bg-[#F8F8F8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-none focus:border-[#007AFF]"
            />
          </div>

          <!-- Category selector -->
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">所属分类</label>
            <select
              v-model="post.category"
              class="w-full px-3.5 py-2 rounded-full bg-[#F8F8F8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-xs focus:outline-none focus:border-[#007AFF]"
            >
              <option v-for="cat in categories" :key="cat.id" :value="cat.name">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Tags input chips string -->
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">标签 (以逗号分隔)</label>
            <input
              v-model="tagsInput"
              type="text"
              placeholder="UI Design, Tutorial"
              class="w-full px-3.5 py-2 rounded-full bg-[#F8F8F8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-[#007AFF]"
            />
          </div>

          <!-- Cover Image Input & Thumbnail Live Preview -->
          <div class="space-y-1 sm:col-span-2 lg:col-span-4 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              文章封面图片 URL 链接 (Cover Image URL) &amp; 实时预览
            </label>
            <div class="flex items-center gap-3">
              <div class="relative w-16 h-11 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex-shrink-0 shadow-xs group">
                <img
                  :src="post.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80'"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="flex-1 flex items-center gap-2">
                <input
                  v-model="post.coverImage"
                  type="text"
                  placeholder="输入或粘贴自定义封面图片 URL 链接 (如 https://... 或 /images/cover.jpg)"
                  class="w-full px-4 py-2 rounded-full bg-[#F8F8F8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 transition-all"
                />
                <button
                  type="button"
                  @click="triggerRandomCover"
                  class="px-3.5 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-[#007AFF] hover:text-white text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors flex-shrink-0 whitespace-nowrap"
                  title="随机切换示例图片"
                >
                  随机示例 🎲
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Editor Workspace (Single, Split, or Preview Mode) -->
      <div class="bg-white/90 dark:bg-slate-900/90 rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden backdrop-blur-xl flex flex-col justify-between min-h-[600px]">
        
        <!-- Capsule Formatting Toolbar Header -->
        <div class="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-100/80 dark:bg-slate-900/80 relative z-10">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#007AFF]" />
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Capsule Toolbar</span>
          </div>

          <CapsuleEditorToolbar @action="applyFormat" />

          <div class="text-xs font-mono text-slate-400 hidden sm:block">
            ⏱️ 预计阅读: {{ computedReadTime }}
          </div>
        </div>

        <!-- Editor & Preview Grid -->
        <div :class="['grid flex-1 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800', gridColumns]">
          
          <!-- Left: Markdown Editor Textarea -->
          <div v-if="activeViewMode === 'edit' || activeViewMode === 'split'" class="p-6 flex flex-col justify-between">
            <textarea
              ref="editorRef"
              v-model="post.content"
              placeholder="在此撰写 Markdown 正文内容... 支持 HTML、代码块、标题与图片"
              class="w-full flex-1 bg-transparent text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 font-mono outline-none resize-y min-h-[500px] p-2"
            />
          </div>

          <!-- Right: Live Rendered Article Preview -->
          <div v-if="activeViewMode === 'preview' || activeViewMode === 'split'" class="p-6 sm:p-8 bg-[#F8F8F8]/40 dark:bg-slate-950/40 overflow-y-auto space-y-6">
            <div class="pb-4 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <span class="px-3 py-1 rounded-full text-xs font-bold bg-[#007AFF]/10 text-[#007AFF]">
                实时预览 (Live Render Preview)
              </span>
              <span class="text-xs font-mono text-slate-400">{{ post.category }}</span>
            </div>

            <!-- Preview Article Render -->
            <div class="space-y-4">
              <h1 class="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white leading-tight">
                {{ post.title || '尚未输入标题' }}
              </h1>

              <!-- Author Pill & Read Time Badge -->
              <div class="flex items-center gap-3">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                  <img :src="post.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'" class="w-5 h-5 rounded-full object-cover" />
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200">{{ post.author?.name || 'Antigravity' }}</span>
                </div>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F8F8F8] dark:bg-slate-800 text-slate-600 dark:text-slate-300 border">
                  {{ computedReadTime }}
                </span>
              </div>

              <!-- Cover Image -->
              <div v-if="post.coverImage" class="aspect-[16/9] rounded-2xl overflow-hidden border shadow-sm">
                <img :src="post.coverImage" class="w-full h-full object-cover" />
              </div>

              <!-- Rendered Content -->
              <div class="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 space-y-4 pt-2">
                <div v-html="renderedMarkdown" />
              </div>
            </div>
          </div>
        </div>

        <!-- Word Count & Keyboard Shortcuts Footer -->
        <div class="p-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-50/30 dark:bg-slate-900/30">
          <div class="flex items-center gap-4">
            <span>总字数 <strong>{{ post.content?.length || 0 }}</strong> 字</span>
            <span>段落数 <strong>{{ post.content ? post.content.split('\n\n').length : 0 }}</strong></span>
          </div>
          <div class="hidden sm:block">
            提示：更改将实时保存在本地状态中
          </div>
        </div>
      </div>

    </div>

    <!-- Capsule Modal Publish Settings -->
    <CapsuleModal
      :isOpen="isModalOpen"
      :initialData="{
        slug: post.slug,
        seoTitle: post.seoTitle || post.title,
        coverImage: post.coverImage,
        tags: post.tags,
        category: post.category
      }"
      @close="isModalOpen = false"
      @confirm="handleConfirmPublishModal"
    />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()
blogStore.init()

const postId = computed(() => route.params.id as string)
const isNew = computed(() => !postId.value || postId.value === 'new')

const post = reactive({
  id: '',
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'Design',
  tags: ['UI Design', 'Tutorial'],
  author: {
    name: 'Antigravity Design',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'Lead Designer'
  },
  readTime: '3 min read',
  coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  status: 'Published' as 'Published' | 'Draft',
  seoTitle: ''
})

const editorRef = ref<HTMLTextAreaElement | null>(null)
const isModalOpen = ref(false)
const activeViewMode = ref<'edit' | 'split' | 'preview'>('split')

const viewModes = [
  { id: 'edit', label: '纯编辑器', icon: '✏️' },
  { id: 'split', label: '双栏对比', icon: '⚖️' },
  { id: 'preview', label: '纯预览', icon: '🔍' }
]

const categories = computed(() => blogStore.categories.value.filter(c => c.slug !== 'all'))

const tagsInput = computed({
  get: () => post.tags.join(', '),
  set: (val: string) => {
    post.tags = val.split(',').map(s => s.trim()).filter(Boolean)
  }
})

const gridColumns = computed(() => {
  if (activeViewMode.value === 'split') return 'lg:grid-cols-2'
  return 'grid-cols-1'
})

const computedReadTime = computed(() => {
  const words = (post.content || '').length
  const minutes = Math.max(1, Math.ceil(words / 300))
  return `预计 ${minutes} 分钟`
})

const SAMPLE_ARTICLE_MARKDOWN = `## 核心设计规范 (Design Principles)

1. **小胶囊导航栏 (Floating Pill Bar)**
   - 当用户滚动时悬浮于顶部，使用 \`#007AFF\` 活跃颜色、轻薄玻璃态背景、无边框阴影以及 \`#F8F8F8\` 的轻盈底色。

2. **胶囊标签位置 (Pill Badges)**
   - 文字右侧以浅灰配色 (如 \`5 min read\`)，让这些小标签如 \`tutorial\` 以轻柔的样式呈现。

\`\`\`javascript
// 示例 胶囊风格色彩计算
function getCapsuleStyle(isActive) {
  return {
    backgroundColor: isActive ? '#007AFF' : '#F8F8F8',
    color: isActive ? '#FFFFFF' : '#333333',
    borderRadius: '9999px',
    padding: '6px 20px',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  }
}
\`\`\`

## 页面等级的代码块 (Code Block UX)

正文中代码块采用 \`18px\` 大圆角等线框、右上角提供人性量感 **Copy Code** 按置置到以自然勾通。

\`\`\`bash
npm install @capsule-design/ui
\`\`\``

onMounted(() => {
  if (!isNew.value) {
    const found = blogStore.getPostById(postId.value) || blogStore.getPostBySlug(postId.value)
    if (found) {
      Object.assign(post, found)
    } else {
      // Default initial mock if id not found
      post.id = 'post-' + Date.now()
      post.title = '探索 Modern Serenity：胶囊美学设计规范'
      post.slug = 'modern-serenity-capsule'
      post.content = SAMPLE_ARTICLE_MARKDOWN
    }
  } else {
    post.id = 'post-' + Date.now()
    post.title = '新建精选切片文章'
    post.slug = 'my-new-post'
    post.content = SAMPLE_ARTICLE_MARKDOWN
  }
})

const triggerRandomCover = () => {
  const sampleCovers = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'
  ]
  post.coverImage = sampleCovers[Math.floor(Math.random() * sampleCovers.length)]
}

const applyFormat = (actionId: string) => {
  const el = editorRef.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const selected = post.content.substring(start, end)

  let formatted = selected
  switch (actionId) {
    case 'bold': formatted = `**${selected || '加粗文字'}**`; break
    case 'italic': formatted = `*${selected || '斜体文字'}*`; break
    case 'h2': formatted = `\n## ${selected || '二级标题'}\n`; break
    case 'quote': formatted = `\n> ${selected || '引用内容'}\n`; break
    case 'link': formatted = `[${selected || '链接文本'}](https://yoursite.com)`; break
    case 'image': formatted = `![${selected || '图片描述'}](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80)`; break
    case 'code': formatted = `\`\`\`js\n${selected || 'console.log("Modern Capsule")'}\n\`\`\``; break
    case 'list': formatted = `\n- ${selected || '列表项目'}\n`; break
  }

  post.content = post.content.substring(0, start) + formatted + post.content.substring(end)
  nextTick(() => {
    if (el) {
      el.focus()
      const newPos = start + formatted.length
      el.setSelectionRange(newPos, newPos)
    }
  })
}

const saveAsDraft = async () => {
  post.status = 'Draft'
  post.readTime = computedReadTime.value
  post.excerpt = post.content.substring(0, 90) + '...'
  
  if (blogStore.getPostById(post.id)) {
    await blogStore.updatePost(post.id, { ...post })
  } else {
    await blogStore.createPost({ ...post })
  }
  alert('草稿保存成功！已写入服务器磁盘。')
  router.push('/admin')
}

const publishPost = async () => {
  post.status = 'Published'
  post.readTime = computedReadTime.value
  post.excerpt = post.content.substring(0, 100) + '...'

  if (blogStore.getPostById(post.id)) {
    await blogStore.updatePost(post.id, { ...post })
  } else {
    await blogStore.createPost({ ...post })
  }
  alert('文章发布成功！已永久写入服务器磁盘，全网实时可用于 /blog/' + post.slug)
  router.push('/admin')
}

const handleConfirmPublishModal = (data: any) => {
  post.slug = data.slug
  post.seoTitle = data.seoTitle
  post.coverImage = data.coverImage || post.coverImage
  post.tags = data.tags
  post.category = data.category
  publishPost()
}

const goBack = () => {
  router.push('/admin')
}

const renderedMarkdown = computed(() => {
  if (!post.content) return '<p style="color: #94a3b8;">暂无内容预览...</p>'
  
  // Basic markdown to html renderer
  let html = post.content
    .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.15rem; font-weight: 700; color: #007AFF; margin-top: 1rem;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.35rem; font-weight: 800; color: #007AFF; margin-top: 1.25rem;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="font-size: 1.6rem; font-weight: 800; color: #007AFF; margin-top: 1.5rem;">$1</h1>')
    .replace(/^\> (.*$)/gim, '<blockquote style="border-left: 4px solid #007AFF; padding-left: 1rem; color: #475569; font-style: italic; background: rgba(0,122,255,0.05); padding-top: 0.5rem; padding-bottom: 0.5rem; border-radius: 0 12px 12px 0;">$1</blockquote>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/gim, '<pre style="background: #0f172a; color: #34d399; padding: 1rem; border-radius: 16px; font-family: monospace; font-size: 0.85rem; overflow-x: auto;"><code>$1</code></pre>')
    .replace(/\n\n/g, '<br/><br/>')
  return html
})

useHead({
  title: computed(() => (isNew.value ? '写新文章' : '编辑文章: ' + post.title) + ' - 博客后台')
})
</script>
