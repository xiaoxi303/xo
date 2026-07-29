<template>
  <div class="min-h-screen pt-28 pb-24 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-[#F8F8F8] via-slate-50 to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
    <div class="max-w-6xl mx-auto relative z-10 space-y-12">
      <!-- Category Banner -->
      <div class="text-center space-y-4 max-w-2xl mx-auto">
        <NuxtLink to="/blog" class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-xs text-xs font-bold text-[#007AFF] hover:bg-slate-100 transition-colors">
          ← 返回全部文章
        </NuxtLink>
        <h1 class="text-4xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white capitalize">
          分类：<span class="text-[#007AFF]">{{ currentCategoryName }}</span>
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          {{ currentCategoryDesc }}
        </p>
      </div>

      <!-- Category Selector Tabs -->
      <div class="flex items-center justify-center">
        <div class="flex items-center gap-2 p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 shadow-md backdrop-blur-xl overflow-x-auto max-w-full no-scrollbar">
          <NuxtLink
            v-for="cat in visibleCategories"
            :key="cat.id"
            :to="cat.slug === 'all' ? '/blog' : `/blog/category/${cat.slug}`"
            :class="[
              'px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-300 whitespace-nowrap flex items-center gap-1.5',
              categoryParam === cat.slug
                ? 'bg-[#007AFF] text-white shadow-[0_4px_15px_rgba(0,122,255,0.35)] scale-[1.02]'
                : 'bg-[#F8F8F8] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
            ]"
          >
            <span>{{ cat.name }}</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Articles Grid -->
      <div v-if="posts.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <NuxtLink
          v-for="post in posts"
          :key="post.id"
          :to="`/blog/${post.slug}`"
          class="group flex flex-col bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200/70 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#007AFF]/30 transition-all duration-300 hover:-translate-y-1"
        >
          <div class="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img :src="post.coverImage" :alt="post.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div class="absolute top-3 right-3 flex items-center gap-1.5">
              <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-[#007AFF] text-white shadow-xs">
                {{ post.category }}
              </span>
            </div>
          </div>
          <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              <h2 class="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#007AFF] transition-colors leading-snug">
                {{ post.title }}
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {{ post.excerpt }}
              </p>
            </div>
            <div class="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ post.createdAt }}</span>
              <span class="text-xs font-bold text-[#007AFF]">阅读全文 →</span>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="text-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-[28px] border border-dashed border-slate-300 dark:border-slate-800 p-8 space-y-3">
        <div class="text-4xl">📁</div>
        <h3 class="text-base font-bold text-slate-700 dark:text-slate-300">该分类下暂无文章</h3>
        <NuxtLink to="/blog" class="inline-block px-4 py-2 rounded-full bg-[#007AFF] text-white text-xs font-bold shadow-md">
          返回博客首页
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const categoryParam = computed(() => (route.params.category as string) || 'all')

const blogStore = useBlogStore()
blogStore.init()

const categories = computed(() => blogStore.categories.value)
const currentCategoryObj = computed(() => categories.value.find(c => c.slug.toLowerCase() === categoryParam.value.toLowerCase()))
const currentCategoryName = computed(() => currentCategoryObj.value?.name || categoryParam.value)
const currentCategoryDesc = computed(() => currentCategoryObj.value?.description || '分类筛选文章列表')

const posts = computed(() => blogStore.getPostsByCategory(categoryParam.value))

const visibleCategories = computed(() => {
  const published = blogStore.getPublishedPosts()
  return blogStore.categories.value.filter(cat => {
    if (cat.slug === 'all' || cat.slug.toLowerCase() === categoryParam.value.toLowerCase()) return true
    return published.some(p => p.category.toLowerCase() === cat.name.toLowerCase() || p.category.toLowerCase() === cat.slug.toLowerCase())
  })
})
</script>
