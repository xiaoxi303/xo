<template>
  <div class="min-h-screen pt-24 pb-20 px-4 sm:px-8 bg-slate-50 dark:bg-slate-950">
    <div class="max-w-7xl mx-auto space-y-8">
      
      <!-- Topbar & Navigation Tabs: Pill-shaped Menu Items ('Posts', 'Categories', 'Analytics', 'Settings') -->
      <div class="flex flex-wrap items-center justify-between gap-4 p-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md backdrop-blur-xl">
        <!-- Pill Menu -->
        <div class="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <NuxtLink
            to="/admin/posts"
            class="px-5 py-2 rounded-full text-xs font-bold bg-[#007AFF] text-white shadow-[0_4px_12px_rgba(0,122,255,0.3)] select-none"
          >
            📝 文章管理 (Posts)
          </NuxtLink>
          <NuxtLink
            to="/admin"
            class="px-5 py-2 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-[#F8F8F8] dark:hover:bg-slate-800 transition-colors select-none"
          >
            ⚙️ 主控制台 (Admin)
          </NuxtLink>
          <NuxtLink
            to="/blog"
            target="_blank"
            class="px-5 py-2 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-[#F8F8F8] dark:hover:bg-slate-800 transition-colors select-none"
          >
            🌐 前台效果 (View Blog)
          </NuxtLink>
        </div>

        <!-- Top Right Actions -->
        <div class="flex items-center gap-2">
          <NuxtLink
            to="/admin/posts/new"
            class="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#007AFF] hover:bg-[#0062cc] shadow-[0_4px_12px_rgba(0,122,255,0.35)] active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>+ 新建文章 (New Post)</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Main Dashboard Header & Filter Bar -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <span>文章列表与状态卡片</span>
            <span class="text-xs px-3 py-1 rounded-full bg-[#007AFF]/10 text-[#007AFF] font-mono">Total: {{ posts.length }}</span>
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            快速管理发布状态 (Published / Draft)，进行胶囊编辑与可视化配置。
          </p>
        </div>

        <!-- Status Filter Pill Bar -->
        <div class="flex items-center gap-1.5 p-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <button
            v-for="status in ['All', 'Published', 'Draft']"
            :key="status"
            @click="filterStatus = status"
            :class="[
              'px-4 py-1.5 rounded-full text-xs font-bold transition-all select-none',
              filterStatus === status
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            {{ status }}
          </button>
        </div>
      </div>

      <!-- Post List Table with Pill-Shaped Status Badges -->
      <div class="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-[#F8F8F8]/50 dark:bg-slate-800/40">
                <th class="py-4 px-6">文章标题 / Slug</th>
                <th class="py-4 px-4">所属分类</th>
                <th class="py-4 px-4">状态 Badge</th>
                <th class="py-4 px-4">创建日期</th>
                <th class="py-4 px-4 text-center">浏览量</th>
                <th class="py-4 px-6 text-right">操作 (Actions)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              <tr
                v-for="post in filteredPosts"
                :key="post.id"
                class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group"
              >
                <!-- Title & Slug -->
                <td class="py-4 px-6 max-w-md">
                  <div class="flex items-center gap-3">
                    <img :src="post.coverImage" class="w-10 h-10 rounded-xl object-cover flex-shrink-0 shadow-xs" />
                    <div class="space-y-0.5 min-w-0">
                      <p class="font-bold text-slate-900 dark:text-white truncate group-hover:text-[#007AFF] transition-colors">
                        {{ post.title }}
                      </p>
                      <p class="font-mono text-[11px] text-slate-400 truncate">
                        /blog/{{ post.slug }}
                      </p>
                    </div>
                  </div>
                </td>

                <!-- Category -->
                <td class="py-4 px-4">
                  <span class="px-3 py-1 rounded-full text-xs font-semibold bg-[#F8F8F8] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                    {{ post.category }}
                  </span>
                </td>

                <!-- Status Pill Badge ('Published' in green #34C759, 'Draft' in yellow/grey #FFCC00) -->
                <td class="py-4 px-4">
                  <CapsuleTag
                    :variant="post.status === 'Published' ? 'published' : 'draft'"
                    :dot="true"
                  >
                    {{ post.status === 'Published' ? 'Published (已发布)' : 'Draft (草稿)' }}
                  </CapsuleTag>
                </td>

                <!-- Date -->
                <td class="py-4 px-4 font-mono text-slate-500">
                  {{ post.createdAt }}
                </td>

                <!-- Views -->
                <td class="py-4 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                  {{ post.views }}
                </td>

                <!-- Icon-Only Pill Buttons ('Edit', 'Delete') -->
                <td class="py-4 px-6 text-right">
                  <div class="inline-flex items-center gap-1.5">
                    <NuxtLink
                      :to="`/admin/posts/edit/${post.id}`"
                      class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-[#007AFF] hover:text-white flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors shadow-xs"
                      title="编辑文章"
                    >
                      ✏️
                    </NuxtLink>
                    <button
                      @click="toggleStatus(post)"
                      class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors shadow-xs"
                      :title="post.status === 'Published' ? '设为草稿' : '发布文章'"
                    >
                      {{ post.status === 'Published' ? '🔒' : '🚀' }}
                    </button>
                    <button
                      @click="deletePost(post.id)"
                      class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors shadow-xs"
                      title="删除文章"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const blogStore = useBlogStore()
blogStore.init()

const posts = computed(() => blogStore.posts.value)
const filterStatus = ref('All')

const filteredPosts = computed(() => {
  if (filterStatus.value === 'All') return posts.value
  return posts.value.filter(p => p.status === filterStatus.value)
})

const toggleStatus = (post: any) => {
  const newStatus = post.status === 'Published' ? 'Draft' : 'Published'
  blogStore.updatePost(post.id, { status: newStatus })
}

const deletePost = (id: string) => {
  if (confirm('确定要删除这篇文章吗？')) {
    blogStore.deletePost(id)
  }
}

useHead({
  title: '文章管理列表 - 博客后台 Dashboard'
})
</script>
