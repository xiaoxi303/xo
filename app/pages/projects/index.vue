<template>
  <div class="min-h-screen pt-28 pb-24 px-6">
    <div class="max-w-6xl mx-auto space-y-12">

      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="space-y-3">
          <p class="section-label">Portfolio</p>
          <h1 class="font-display text-5xl lg:text-6xl font-bold leading-none tracking-tight"
              style="color: var(--color-ink-1)">全部作品</h1>
          <p class="text-sm max-w-md leading-relaxed" style="color: var(--color-ink-4)">
            结合极致节奏感的镜头拼贴、电影级调色与科技感三维包装。
          </p>
        </div>

        <!-- Filter pills -->
        <div class="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl self-start md:self-auto"
             style="background: rgba(140,115,80,0.08); border: 1px solid rgba(160,130,90,0.18);">
          <button
            v-for="f in filterOpts"
            :key="f.value"
            @click="currentFilter = f.value"
            :class="[
              'px-4 py-2 rounded-xl text-xs font-medium tracking-wide transition-all duration-200',
              currentFilter === f.value
                ? 'font-semibold shadow-sm'
                : 'hover:opacity-80'
            ]"
            :style="currentFilter === f.value
              ? { background: 'rgba(252,248,242,0.95)', color: 'var(--color-ink-1)', border: '1px solid rgba(180,150,110,0.25)' }
              : { color: 'var(--color-ink-4)', border: '1px solid transparent' }"
          >
            {{ f.label }}
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredProjects.length === 0" class="flex flex-col items-center justify-center py-24 gap-4">
        <span class="text-4xl">🎬</span>
        <p class="font-display text-xl" style="color: var(--color-ink-3)">暂无匹配的作品</p>
        <button @click="currentFilter = 'all'" class="btn-ghost text-sm">返回全部</button>
      </div>

      <!-- Projects Grid -->
      <div v-else class="relative min-h-[400px]">
        <TransitionGroup name="list" tag="div" class="bento-grid">
          <BentoItem
            v-for="(project, i) in filteredProjects"
            :key="project.slug"
            :span="project.featured ? '12:12:8' : '12:6:4'"
            :to="'/projects/' + project.slug"
            class="group"
            :style="{ transitionDelay: `${i * 45}ms` }"
            @click="trackProjectClick(project)"
          >
            <!-- Media area -->
            <div :class="['relative overflow-hidden', project.featured ? 'h-80' : 'h-52']">
              <MediaImage
                :src="project.image"
                :alt="project.title"
                :title="project.title"
                :index="i + 1"
                :category="project.tags?.[0] || 'CREATIVE VIDEO'"
                :description="project.description"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <!-- Gradient overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

              <!-- Badges top-right -->
              <div class="absolute top-4 right-4 flex gap-2">
                <span v-if="project.featured"
                  class="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold shadow-sm"
                  style="background: rgba(255,255,255,0.94); color: var(--color-bronze); border: 1px solid rgba(180,83,9,0.15);">
                  FEATURED
                </span>
              </div>

              <!-- Play icon on hover -->
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div class="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                       class="w-5 h-5 ml-0.5" style="color: var(--color-ink-1)">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-3">
              <div>
                <h2 class="font-display font-semibold text-lg transition-colors duration-300"
                    style="color: var(--color-ink-1);"
                    :style="{ color: 'var(--color-ink-1)' }">
                  <span class="group-hover:text-amber-700 transition-colors duration-300">{{ project.title }}</span>
                </h2>
                <p class="text-sm mt-1 line-clamp-2 leading-relaxed" style="color: var(--color-ink-4)">
                  {{ project.description }}
                </p>
              </div>
              <!-- Tags -->
              <div class="flex flex-wrap gap-1.5">
                <span v-for="tag in project.tags" :key="tag" class="badge">{{ tag }}</span>
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
  title: '剪辑作品集 — xo.dev',
  meta: [{ name: 'description', content: '查看 Xo Studio 精心打磨的全部剪辑、调色与三维特效后期作品。' }]
})

const { data: projects } = await useFetch<any[]>('/api/projects')
const currentFilter = ref('all')
const filterOpts = [
  { label: '全部作品', value: 'all' },
  { label: '商业广告 TVC', value: 'tvc' },
  { label: 'DI 电影调色', value: 'color' },
  { label: '创意剪辑 / VFX', value: 'edit' }
]

const filteredProjects = computed(() => {
  const list = projects.value || []
  if (currentFilter.value === 'all') return list
  if (currentFilter.value === 'tvc') return list.filter(p => p.tags?.some((t: string) => t.includes('广告') || t.includes('TVC')))
  if (currentFilter.value === 'color') return list.filter(p => p.tags?.some((t: string) => t.includes('调色') || t.includes('DI')))
  if (currentFilter.value === 'edit') return list.filter(p => p.tags?.some((t: string) => t.includes('剪辑') || t.includes('VFX') || t.includes('特效')))
  return list
})

let observer: IntersectionObserver | null = null
onMounted(async () => {
  await nextTick()
  observer = new IntersectionObserver(
    (entries) => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view') }) },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  )
  document.querySelectorAll('.reveal').forEach(el => observer?.observe(el))
})
onBeforeUnmount(() => { if (observer) observer.disconnect() })

const trackProjectClick = (project: any) => {
  if (!import.meta.client) return
  $fetch('/api/analytics/event', {
    method: 'POST',
    body: { event: 'project_click', meta: JSON.stringify({ slug: project.slug, title: project.title }) }
  }).catch(() => {})
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(14px);
}
.list-move {
  transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
}
.list-leave-active {
  position: absolute;
  max-width: 32%;
}
@media (max-width: 768px) {
  .list-leave-active { max-width: 100%; }
}
</style>
