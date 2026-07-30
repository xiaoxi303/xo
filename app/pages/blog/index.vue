<template>
  <div class="min-h-screen pt-28 pb-24 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-[#F8F8F8] via-slate-50 to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
    <!-- Ambient Pastel Blue Glow -->
    <div
      class="absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[350px] pointer-events-none rounded-full blur-[100px] opacity-60"
      style="background: radial-gradient(circle, rgba(0,122,255,0.18) 0%, rgba(224,242,254,0.3) 50%, transparent 80%);"
    />

    <div class="max-w-6xl mx-auto relative z-10 space-y-12">
      <!-- Header Banner (Editable from Admin Workspace) -->
      <div class="text-center space-y-4 max-w-2xl mx-auto">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-xs backdrop-blur-md">
          <span class="w-2 h-2 rounded-full bg-[#007AFF] animate-ping" />
          <span class="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 font-mono">
            {{ siteConfig?.blog?.heroBadge || 'Modern Serenity Blog' }}
          </span>
        </div>
        <h1 class="text-4xl sm:text-5xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
          {{ siteConfig?.blog?.heroTitle || '灵感、技术与设计探索' }}
        </h1>
        <p class="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-sans font-medium">
          {{ siteConfig?.blog?.heroSub || '采用次世代胶囊美学设计系统 (Pill-shaped Design System)，记录极致前沿的切片与思考。' }}
        </p>
      </div>

      <!-- Centered Pill-Shaped Search Bar with Glass Glow & Quick Chips -->
      <div class="max-w-2xl mx-auto relative space-y-3">
        <div class="relative flex items-center group">
          <!-- Magnifying Glass Icon Badge -->
          <div class="absolute left-3.5 z-10 w-9 h-9 rounded-full bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center pointer-events-none group-focus-within:bg-[#007AFF] group-focus-within:text-white transition-colors duration-300 shadow-xs">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Input Field with Explicit Left & Right Padding -->
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="搜索文章标题、标签或关键字..."
            style="padding-left: 3.6rem; padding-right: 5rem;"
            class="w-full py-4 rounded-full bg-white/95 dark:bg-slate-900/95 border-2 border-slate-200/90 dark:border-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400/90 shadow-[0_8px_30px_rgba(0,122,255,0.06)] focus:outline-none focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/20 backdrop-blur-2xl transition-all duration-300"
          />

          <!-- Right Action: Clear or Shortcut Pill -->
          <div class="absolute right-4 flex items-center gap-2 z-10">
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-[11px] font-bold text-slate-600 transition-colors shadow-xs"
            >
              ✕ 清空
            </button>
            <span v-else class="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-400 border border-slate-200/80 dark:border-slate-700">
              ⌘ K
            </span>
          </div>
        </div>

        <!-- Quick Hot Search Pill Chips (Dynamically Generated from Published Articles) -->
        <div v-if="realHotTags.length > 0" class="flex flex-wrap items-center justify-center gap-2 text-xs pt-1">
          <span class="text-slate-400 text-[11px] font-bold">热门标签:</span>
          <button
            v-for="chip in realHotTags"
            :key="chip"
            @click="searchQuery = chip"
            :class="[
              'px-3.5 py-1 rounded-full text-[11px] font-semibold transition-all select-none border',
              searchQuery === chip
                ? 'bg-[#007AFF] text-white border-transparent shadow-[0_2px_10px_rgba(0,122,255,0.35)] scale-[1.02]'
                : 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-[#007AFF]/10 hover:text-[#007AFF] hover:border-[#007AFF]/40'
            ]"
          >
            #{{ chip }}
          </button>
        </div>
      </div>

      <!-- Category Selector: Floating Pill-Shaped Tab Bar (Only displays categories with published posts) -->
      <div v-if="visibleCategories.length > 1 || (visibleCategories.length === 1 && getCategoryCount(visibleCategories[0]) > 0)" class="flex items-center justify-center">
        <div class="flex items-center gap-2 p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 shadow-md backdrop-blur-xl overflow-x-auto max-w-full no-scrollbar">
          <NuxtLink
            v-for="cat in visibleCategories"
            :key="cat.id"
            :to="cat.slug === 'all' ? '/blog' : `/blog/category/${cat.slug}`"
            :class="[
              'px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-300 whitespace-nowrap select-none flex items-center gap-1.5',
              activeCategory === cat.slug
                ? 'bg-[#007AFF] text-white shadow-[0_4px_15px_rgba(0,122,255,0.35)] scale-[1.02]'
                : 'bg-[#F8F8F8] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
            ]"
          >
            <span>{{ cat.name }}</span>
            <span
              :class="[
                'text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold',
                activeCategory === cat.slug ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-slate-400'
              ]"
            >
              {{ getCategoryCount(cat) }}
            </span>
          </NuxtLink>
        </div>
      </div>

      <!-- Articles Grid -->
      <div v-if="filteredPosts.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <NuxtLink
          v-for="post in filteredPosts"
          :key="post.id"
          :to="`/blog/${post.slug}`"
          class="group flex flex-col bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200/70 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#007AFF]/30 transition-all duration-300 hover:-translate-y-1"
        >
          <!-- Card Image Cover with Top-Right Pill Badges -->
          <div class="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img
              :src="post.coverImage"
              :alt="post.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
            
            <!-- Top Right Pill Badges -->
            <div class="absolute top-3 right-3 flex items-center gap-1.5">
              <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 backdrop-blur-md shadow-xs border border-white/20">
                {{ post.readTime }}
              </span>
              <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-[#007AFF] text-white shadow-xs">
                {{ post.category }}
              </span>
            </div>
          </div>

          <!-- Card Content -->
          <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              <h2 class="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#007AFF] transition-colors leading-snug line-clamp-2">
                {{ post.title }}
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-sans">
                {{ post.excerpt }}
              </p>
            </div>

            <!-- Author & Tags -->
            <div class="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <img :src="post.author.avatar" class="w-6 h-6 rounded-full object-cover ring-2 ring-[#007AFF]/20" />
                <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">{{ post.author.name }}</span>
              </div>

              <div class="flex items-center gap-1">
                <span
                  v-for="(tag, idx) in post.tags.slice(0, 2)"
                  :key="idx"
                  class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F8F8F8] dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-[28px] border border-dashed border-slate-300 dark:border-slate-800 p-8 space-y-3">
        <div class="text-4xl">🔍</div>
        <h3 class="text-base font-bold text-slate-700 dark:text-slate-300">未找到符合条件的文章</h3>
        <p class="text-xs text-slate-400">尝试更换搜索关键字或切换上方分类 Tab</p>
        <button
          @click="searchQuery = ''"
          class="px-4 py-2 rounded-full bg-[#007AFF] text-white text-xs font-bold shadow-md hover:bg-[#0062cc] transition-colors"
        >
          查看全部文章
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: siteConfig } = await useFetch<any>('/api/site-config')

const blogStore = useBlogStore()
blogStore.init()

const searchQuery = ref('')
const activeCategory = ref('all')

const categories = computed(() => blogStore.categories.value)

const realHotTags = computed(() => {
  const published = blogStore.getPublishedPosts()
  const tagCounts: Record<string, number> = {}
  published.forEach(post => {
    if (Array.isArray(post.tags)) {
      post.tags.forEach(tag => {
        const cleanTag = tag.trim()
        if (cleanTag) {
          tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1
        }
      })
    }
  })
  return Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]).slice(0, 6)
})

const getCategoryCount = (cat: any) => {
  const published = blogStore.getPublishedPosts()
  if (!cat || cat.slug === 'all') return published.length
  return published.filter(p => p.category.toLowerCase() === cat.name.toLowerCase() || p.category.toLowerCase() === cat.slug.toLowerCase()).length
}

const visibleCategories = computed(() => {
  return blogStore.categories.value.filter(cat => {
    if (cat.slug === 'all') return true
    return getCategoryCount(cat) > 0
  })
})

const filteredPosts = computed(() => {
  let list = blogStore.getPublishedPosts()
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    )
  }
  return list
})

useHead({
  title: '博客前台 - Modern Serenity 胶囊风 UI',
  meta: [
    { name: 'description', content: 'Modern Serenity 胶囊美学博客前台页面，展示最新切片与技术洞察。' }
  ]
})
</script>
