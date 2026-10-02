<template>
  <div class="portfolio-page min-h-screen pt-28 pb-24 px-6 relative overflow-hidden" style="background: var(--color-bg);">
    <!-- Ambient Backdrop Light Glows -->
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-0 animate-pulse"
      style="width: 1100px; height: 500px; background: radial-gradient(circle, rgba(217,119,6,0.22) 0%, rgba(147,51,234,0.12) 50%, transparent 75%); filter: blur(60px);"
    />

    <div class="max-w-6xl mx-auto space-y-10 relative z-10">

      <!-- Header & Filter Bar Area -->
      <div class="portfolio-header space-y-6">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div class="space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[var(--color-bronze-dark)] text-[10px] font-mono font-bold"
                 style="background: rgba(217,119,6,0.12); border: 1px solid rgba(217,119,6,0.3);">
              <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-bronze)] animate-pulse" />
              <span>PORTFOLIO GALLERY (4K HDR)</span>
            </div>
            <h1 class="font-display text-5xl lg:text-6xl font-bold leading-none tracking-tight text-[var(--color-ink-1)]">
              全部作品集
            </h1>
            <p class="text-[var(--color-ink-4)] text-sm max-w-md leading-relaxed font-sans">
              结合极致节奏感的镜头拼贴、电影级调色与科技感三维包装。
            </p>
          </div>

          <!-- View Mode & Result Counter Controls -->
          <div class="flex items-center gap-3 self-start md:self-end">
            <!-- Counter Pill -->
            <div class="px-3.5 py-1.5 rounded-full bg-white/70 border border-amber-600/15 backdrop-blur-md shadow-xs flex items-center gap-2 text-xs font-mono text-slate-600 select-none">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-600" />
              <span>显示 <strong>{{ filteredProjects.length }}</strong> / 共 {{ (projects || []).length }} 部</span>
            </div>

            <!-- Layout Switcher (Grid vs Cinema Widescreen) -->
            <div class="p-1 rounded-xl bg-white/80 border border-amber-600/20 backdrop-blur-md shadow-xs flex items-center gap-1 select-none">
              <button
                type="button"
                @click="viewMode = 'grid'"
                class="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                :class="viewMode === 'grid' ? 'bg-amber-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'"
                title="网格视图 (Grid)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                  <path fill-rule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zm0 9A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zm9-9A2.25 2.25 0 0011 4.25v2.5A2.25 2.25 0 0013.25 9h2.5A2.25 2.25 0 0018 6.75v-2.5A2.25 2.25 0 0015.75 2h-2.5zm0 9A2.25 2.25 0 0011 13.25v2.5A2.25 2.25 0 0013.25 18h2.5A2.25 2.25 0 0018 15.75v-2.5A2.25 2.25 0 0015.75 11h-2.5z" clip-rule="evenodd" />
                </svg>
                <span class="hidden sm:inline">网格</span>
              </button>
              <button
                type="button"
                @click="viewMode = 'cinema'"
                class="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                :class="viewMode === 'cinema' ? 'bg-amber-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'"
                title="影院宽屏大图视图 (Cinema Reel)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                  <path fill-rule="evenodd" d="M2 4.75A2.75 2.75 0 014.75 2h10.5A2.75 2.75 0 0118 4.75v10.5A2.75 2.75 0 0115.75 18H4.75A2.75 2.75 0 012 15.75V4.75zm2.75-.75A.75.75 0 004 4.75v10.5c0 .414.336.75.75.75h10.5a.75.75 0 00.75-.75V4.75a.75.75 0 00-.75-.75H4.75z" clip-rule="evenodd" />
                  <path d="M6 7.5a.75.75 0 01.75-.75h6.5a.75.75 0 010 1.5h-6.5A.75.75 0 016 7.5zm0 5a.75.75 0 01.75-.75h6.5a.75.75 0 010 1.5h-6.5A.75.75 0 016 12.5z" />
                </svg>
                <span class="hidden sm:inline">影院</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Segmented Glass Filter Bar with Dynamic Count & Spring Indicator -->
        <div class="portfolio-filter-container overflow-x-auto pb-1 -mx-2 px-2 no-scrollbar">
          <div class="portfolio-filter inline-flex items-center gap-1.5 p-1.5 rounded-2xl sm:rounded-full bg-white/85 backdrop-blur-2xl border border-amber-600/20 shadow-md">
            <button
              v-for="f in visibleFilterOpts"
              :key="f.value"
              @click="setFilter(f.value)"
              :class="[
                'filter-pill px-3.5 py-1.5 rounded-xl sm:rounded-full text-xs font-bold tracking-wide transition-all duration-300 ease-out cursor-pointer flex items-center gap-2 select-none relative group',
                currentFilter === f.value
                  ? 'bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white shadow-md shadow-amber-900/25 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-black/[0.04] hover:scale-[1.01]'
              ]"
            >
              <IconSax v-if="currentFilter === f.value" name="magic-star" :size="12" class="text-amber-300 animate-pulse flex-shrink-0" />
              <span>{{ f.label }}</span>
              <!-- Project Count Badge -->
              <span
                class="filter-count-badge text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full transition-colors"
                :class="currentFilter === f.value ? 'bg-amber-950/40 text-amber-200 border border-amber-500/30' : 'bg-black/[0.05] text-slate-500 group-hover:bg-black/[0.08]'"
              >
                {{ f.count }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="portfolio-state flex flex-col items-center justify-center py-24 gap-4 glass-card rounded-3xl">
        <div class="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        <p class="font-display text-xs font-semibold text-[var(--color-ink-3)]">正在加载作品集...</p>
      </div>

      <!-- Empty State with Transition -->
      <Transition name="fade">
        <div v-if="!isLoading && filteredProjects.length === 0" class="portfolio-state flex flex-col items-center justify-center py-24 gap-4 glass-card rounded-3xl text-center px-4">
          <span class="text-5xl animate-bounce">🎬</span>
          <div class="space-y-1">
            <p class="font-display text-xl font-bold text-[var(--color-ink-2)]">暂无匹配的作品分类</p>
            <p class="text-xs text-slate-500 font-mono">当前分类 "{{ currentFilter }}" 下暂未收录作品</p>
          </div>
          <button @click="setFilter('all')" class="btn-primary text-xs px-6 py-2 mt-2">返回全部作品</button>
        </div>
      </Transition>

      <!-- Projects Grid with FLIP & Staggered Switching Animation -->
      <div v-if="!isLoading && filteredProjects.length > 0" class="relative min-h-[460px]">
        <TransitionGroup
          name="portfolio-anim"
          tag="div"
          :class="[
            'portfolio-grid',
            viewMode === 'cinema' ? 'grid grid-cols-1 gap-8' : 'bento-grid'
          ]"
          @before-leave="onBeforeLeave"
        >
          <BentoItem
            v-for="(project, i) in filteredProjects"
            :key="project.slug"
            :span="viewMode === 'cinema' ? '12:12:12' : (project.featured ? '12:12:8' : '12:6:4')"
            :to="'/projects/' + project.slug"
            class="portfolio-card group shadow-2xl transition-all duration-300 relative"
            :style="{
              '--card-stagger-delay': `${Math.min(i * 55, 300)}ms`
            }"
          >
            <!-- Media Area -->
            <div :class="[
              'relative overflow-hidden bg-slate-950 transition-all duration-500',
              viewMode === 'cinema' ? 'h-96 md:h-[460px]' : (project.featured ? 'h-80' : 'h-64')
            ]">
              <MediaImage
                :src="project.image"
                :alt="project.title"
                :title="project.title"
                :index="project.displayNumber || project.sortOrder || (i + 1)"
                :category="project.tags?.[0] || ''"
                :description="project.description"
                class="h-full w-full object-cover transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-105"
              />

              <!-- Ambient Edge Gradient Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

              <!-- Top Left Film Slate Stamp -->
              <div class="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono text-amber-200">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>{{ String(i + 1).padStart(2, '0') }} / {{ viewMode === 'cinema' ? 'CINEMA 4K' : '4K HDR' }}</span>
              </div>

              <!-- Badges Top-Right -->
              <div class="absolute top-4 right-4 flex gap-2 z-20">
                <span v-if="project.featured"
                  class="px-3 py-1 rounded-full text-[10px] font-mono font-bold shadow-md text-white backdrop-blur-md"
                  style="background: #d97706; border: 1px solid rgba(251,191,36,0.4);">
                  FEATURED
                </span>
                <span v-if="project.isColorGraded"
                  class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold backdrop-blur-md"
                  style="background: rgba(5, 150, 105, 0.3); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4);">
                  已调色
                </span>
              </div>

              <!-- Play Icon with Magnetic Spring Hover -->
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                <div class="w-16 h-16 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
                     style="box-shadow: 0 14px 40px rgba(217,119,6,0.45); border: 1px solid rgba(255,255,255,0.95);">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                       class="w-7 h-7 ml-0.5 text-[var(--color-bronze-dark)] transition-transform duration-200 group-hover:scale-110">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Content Details Area -->
            <div :class="['p-7 space-y-3 bg-white/90 backdrop-blur-md transition-colors', viewMode === 'cinema' ? 'md:p-9 space-y-4' : '']">
              <div class="space-y-1.5">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-[var(--color-bronze)]" />
                  <span v-if="project.tags?.[0]" class="text-[var(--color-bronze-dark)] text-[11px] font-mono uppercase tracking-wider font-bold">
                    {{ project.tags[0] }}
                  </span>
                  <span v-if="project.year" class="text-slate-400 text-[10px] font-mono">
                    · {{ project.year }}
                  </span>
                </div>
                <h2 :class="[
                  'font-display font-bold text-[var(--color-ink-1)] group-hover:text-[var(--color-bronze-dark)] transition-colors',
                  viewMode === 'cinema' ? 'text-2xl md:text-3xl' : 'text-xl'
                ]">
                  {{ project.title }}
                </h2>
                <p :class="[
                  'text-[var(--color-ink-4)] text-sm leading-relaxed font-sans pt-1',
                  viewMode === 'cinema' ? 'line-clamp-3 md:text-base max-w-3xl' : 'line-clamp-2'
                ]">
                  {{ project.description }}
                </p>
              </div>

              <!-- Tags Array -->
              <div class="flex flex-wrap gap-1.5 pt-1">
                <span
                  v-for="tag in project.tags"
                  :key="tag"
                  class="tag font-semibold transition-colors cursor-pointer hover:border-amber-600/50 hover:bg-amber-50/50"
                  :class="currentFilter === tag ? 'bg-amber-100 text-amber-900 border-amber-400' : ''"
                  style="border: 1px solid rgba(217,119,6,0.25); background: rgba(255,255,255,0.9);"
                  @click.stop="setFilter(tag)"
                >
                  {{ tag }}
                </span>
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
  title: '剪辑作品集 - Xo',
  meta: [{ name: 'description', content: '查看 Xo Studio 的剪辑、调色与后期作品。' }]
})

const { data: projects, status: projectsStatus } = useFetch<any[]>('/api/projects')
const isLoading = computed(() => projectsStatus.value === 'pending' || (projects.value === null && projectsStatus.value !== 'error'))
const currentFilter = ref('all')
const viewMode = ref<'grid' | 'cinema'>('grid')

// Filter options with real-time match count
const visibleFilterOpts = computed(() => {
  const list = projects.value || []
  const categories = Array.from(new Set(
    list.flatMap((project: any) => Array.isArray(project.tags) ? project.tags : [])
      .map((tag: any) => String(tag || '').trim())
      .filter(Boolean)
  ))

  return [
    { label: '全部作品', value: 'all', count: list.length },
    ...categories.map((category) => {
      const matchCount = list.filter((p: any) =>
        Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase() === category.toLowerCase())
      ).length
      return { label: category, value: category, count: matchCount }
    })
  ]
})

watch(visibleFilterOpts, (filters) => {
  if (!filters.some((filter) => filter.value === currentFilter.value)) {
    currentFilter.value = 'all'
  }
})

const setFilter = (val: string) => {
  currentFilter.value = val
}

const filteredProjects = computed(() => {
  const list = projects.value || []
  if (currentFilter.value === 'all') return list
  return list.filter((project: any) => {
    return Array.isArray(project.tags) && project.tags.some((t: string) =>
      t.toLowerCase().includes(currentFilter.value.toLowerCase()) ||
      currentFilter.value.toLowerCase().includes(t.toLowerCase())
    )
  })
})

/**
 * Vue FLIP Grid Transition Hook:
 * Captures pixel-exact rect before an element leaves so surviving items
 * can smoothly glide into their new grid positions without layout collapses.
 */
const onBeforeLeave = (el: Element) => {
  const htmlEl = el as HTMLElement
  const { width, height } = htmlEl.getBoundingClientRect()
  htmlEl.style.width = `${width}px`
  htmlEl.style.height = `${height}px`
  htmlEl.style.left = `${htmlEl.offsetLeft}px`
  htmlEl.style.top = `${htmlEl.offsetTop}px`
  htmlEl.style.position = 'absolute'
}
</script>

<style scoped>
/* ==========================================================================
   Portfolio Grid FLIP & Staggered Transitions
   ========================================================================== */

/* The move transition powers the silky smooth FLIP repositioning */
.portfolio-anim-move {
  transition: transform 0.54s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Entering cards: Staggered scale & slide up from blur */
.portfolio-anim-enter-active {
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
              filter 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--card-stagger-delay, 0ms);
}

/* Leaving cards: Shrink and fade upward smoothly while unblocking grid flow */
.portfolio-anim-leave-active {
  transition: opacity 0.36s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.36s cubic-bezier(0.16, 1, 0.3, 1),
              filter 0.36s cubic-bezier(0.16, 1, 0.3, 1);
  position: absolute !important;
  z-index: 0;
  pointer-events: none;
}

.portfolio-anim-enter-from {
  opacity: 0;
  transform: translateY(32px) scale(0.95);
  filter: blur(8px);
}

.portfolio-anim-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.92);
  filter: blur(8px);
}

/* Filter pills smooth micro-interactions */
.filter-pill {
  backface-visibility: hidden;
  will-change: transform, background-color;
}

.filter-pill:active {
  transform: scale(0.95);
}

/* Hide horizontal scrollbar while keeping drag/swipe smooth */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Card hover lift & specular border */
.portfolio-card {
  will-change: transform, opacity;
}

@media (prefers-reduced-motion: reduce) {
  .portfolio-anim-move,
  .portfolio-anim-enter-active,
  .portfolio-anim-leave-active {
    transition: none !important;
  }
}
</style>
