<template>
  <div class="min-h-screen pt-28 pb-24 px-6 relative overflow-hidden" style="background: var(--color-bg, #faf8f5);">
    <!-- Ambient Backdrop Light Glows -->
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-0 animate-pulse"
      style="width: 1100px; height: 500px; background: radial-gradient(circle, rgba(217,119,6,0.22) 0%, rgba(147,51,234,0.12) 50%, transparent 75%); filter: blur(60px);"
    />

    <div class="max-w-6xl mx-auto space-y-12 relative z-10">

      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="space-y-3">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-amber-800 text-[10px] font-mono font-bold"
               style="background: rgba(217,119,6,0.12); border: 1px solid rgba(217,119,6,0.3);">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            <span>PORTFOLIO GALLERY (4K HDR)</span>
          </div>
          <h1 class="font-display text-5xl lg:text-6xl font-bold leading-none tracking-tight text-slate-900">全部作品集</h1>
          <p class="text-slate-600 text-sm max-w-md leading-relaxed font-sans">
            结合极致节奏感的镜头拼贴、电影级调色与科技感三维包装。
          </p>
        </div>

        <!-- Filter pills -->
        <div class="flex flex-wrap items-center gap-2 p-2 rounded-2xl self-start md:self-auto shadow-md backdrop-blur-xl"
             style="background: rgba(255,255,255,0.85); border: 1px solid rgba(217,119,6,0.25);">
          <button
            v-for="f in visibleFilterOpts"
            :key="f.value"
            @click="currentFilter = f.value"
            :class="[
              'relative px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 ease-out active:scale-95 cursor-pointer',
              currentFilter === f.value
                ? 'bg-amber-600 text-white shadow-md scale-[1.02]'
                : 'text-slate-700 hover:bg-black/5 hover:text-slate-900'
            ]"
          >
            {{ f.label }}
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredProjects.length === 0" class="flex flex-col items-center justify-center py-24 gap-4 glass-card rounded-3xl">
        <span class="text-5xl animate-bounce">🎬</span>
        <p class="font-display text-xl font-bold text-slate-800">暂无匹配的作品分类</p>
        <button @click="currentFilter = 'all'" class="btn-primary text-xs px-6 py-2">返回全部作品</button>
      </div>

      <!-- Projects Grid -->
      <div v-else class="relative min-h-[400px]">
        <TransitionGroup name="list" tag="div" class="bento-grid">
          <BentoItem
            v-for="(project, i) in filteredProjects"
            :key="project.slug"
            :span="project.featured ? '12:12:8' : '12:6:4'"
            :to="'/projects/' + project.slug"
            class="group shadow-2xl transition-all duration-500"
            :style="{ transitionDelay: `${i * 45}ms` }"
            @click="trackProjectClick(project)"
          >
            <!-- Media area -->
            <div :class="['relative overflow-hidden bg-slate-950', project.featured ? 'h-80' : 'h-64']">
              <MediaImage
                :src="project.image"
                :alt="project.title"
                :title="project.title"
                :index="project.displayNumber || project.sortOrder || (i + 1)"
                :category="project.tags?.[0] || ''"
                :description="project.description"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <!-- Gradient overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

              <!-- Badges top-right -->
              <div class="absolute top-4 right-4 flex gap-2 z-20">
                <span v-if="project.featured"
                  class="px-3 py-1 rounded-full text-[10px] font-mono font-bold shadow-md text-white"
                  style="background: #d97706; border: 1px solid rgba(251,191,36,0.4);">
                  FEATURED
                </span>
              </div>

              <!-- Play icon on hover -->
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                <div class="w-14 h-14 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-all duration-500 cubic-bezier(0.34,1.56,0.64,1)"
                     style="box-shadow: 0 10px 30px rgba(217,119,6,0.4); border: 1px solid rgba(255,255,255,0.9);">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                       class="w-6 h-6 ml-0.5 text-amber-800 transition-transform duration-300 group-hover:scale-110">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Content -->
            <div class="p-7 space-y-3 bg-white/90 backdrop-blur-md">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-600" />
                  <span v-if="project.tags?.[0]" class="text-amber-800 text-[11px] font-mono uppercase tracking-wider font-bold">{{ project.tags[0] }}</span>
                </div>
                <h2 class="font-display font-bold text-xl text-slate-900 group-hover:text-amber-800 transition-colors">
                  {{ project.title }}
                </h2>
                <p class="text-slate-600 text-sm line-clamp-2 leading-relaxed font-sans pt-1">
                  {{ project.description }}
                </p>
              </div>
              <!-- Tags -->
              <div class="flex flex-wrap gap-1.5 pt-1">
                <span v-for="tag in project.tags" :key="tag" class="tag font-semibold" style="border: 1px solid rgba(217,119,6,0.25); background: rgba(255,255,255,0.9);">{{ tag }}</span>
              </div>
            </div>
          </BentoItem>
        </TransitionGroup>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '剪辑作品集 - xo.dev',
  meta: [{ name: 'description', content: '查看 Xo Studio 的剪辑、调色与后期作品。' }]
})

const { data: projects } = await useFetch<any[]>('/api/projects')
const currentFilter = ref('all')

const visibleFilterOpts = computed(() => {
  const list = projects.value || []
  const categories = Array.from(new Set(
    list.flatMap((project: any) => Array.isArray(project.tags) ? project.tags : [])
      .map((tag: any) => String(tag || '').trim())
      .filter(Boolean)
  ))
  return [
    { label: '全部作品', value: 'all' },
    ...categories.map((category) => ({ label: category, value: category }))
  ]
})

watch(visibleFilterOpts, (filters) => {
  if (!filters.some((filter) => filter.value === currentFilter.value)) {
    currentFilter.value = 'all'
  }
})

const filteredProjects = computed(() => {
  const list = projects.value || []
  if (currentFilter.value === 'all') return list
  return list.filter((project: any) => {
    return Array.isArray(project.tags) && project.tags.some((t: string) => t.toLowerCase().includes(currentFilter.value.toLowerCase()) || currentFilter.value.toLowerCase().includes(t.toLowerCase()))
  })
})

import { recordProjectClickEvent } from '~/utils/analytics'

const trackProjectClick = (project: any) => {
  if (!import.meta.client || !project?.slug) return
  recordProjectClickEvent(project.slug, project.title)
}
</script>
