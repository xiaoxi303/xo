<template>
  <div class="min-h-screen pt-28 pb-24 px-6">
    <div class="max-w-4xl mx-auto space-y-12">

      <!-- Back button -->
      <div class="reveal">
        <NuxtLink
          to="/projects"
          class="btn-ghost inline-flex items-center gap-2 text-sm py-2 px-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"/>
          </svg>
          返回作品集
        </NuxtLink>
      </div>

      <!-- Project detail -->
      <div v-if="project" class="space-y-10">

        <!-- Title block -->
        <div class="space-y-4 reveal">
          <div class="flex flex-wrap gap-2">
            <span v-for="tag in project.tags" :key="tag" class="badge">{{ tag }}</span>
          </div>
          <h1 class="font-display text-4xl lg:text-5xl font-bold tracking-tight leading-tight"
              style="color: var(--color-ink-1)">
            {{ project.title }}
          </h1>
          <p class="text-sm font-mono" style="color: var(--color-ink-5)">
            发布日期：2026 年 · 后期规格：4K 60FPS HDR
          </p>
        </div>

        <!-- Ambilight Video Player -->
        <div class="ambilight-container reveal">
          <!-- Ambient backdrop blur video -->
          <video
            ref="blurVideoRef"
            :src="project.videoUrl"
            muted loop playsinline
            class="ambilight-shadow"
          />
          <!-- Foreground main player -->
          <video
            ref="mainVideoRef"
            :src="project.videoUrl"
            :poster="project.image"
            controls autoplay muted playsinline
            class="w-full h-full object-cover relative z-10 glass-card overflow-hidden"
            @loadedmetadata="syncBlurVideo"
          />
        </div>

        <!-- Content grid -->
        <div class="grid md:grid-cols-3 gap-8 items-start reveal">

          <!-- Left: About + Workflow -->
          <div class="md:col-span-2 space-y-6">

            <!-- Project overview card -->
            <div class="glass-card p-8 space-y-5">
              <div class="flex items-center gap-3">
                <span class="w-1 h-5 rounded-full" style="background: var(--color-bronze);" />
                <h2 class="font-display text-xl font-semibold" style="color: var(--color-ink-1)">项目概述</h2>
              </div>
              <p class="leading-relaxed text-[0.92rem]" style="color: var(--color-ink-2)">
                {{ project.description }}
              </p>
              <p class="leading-relaxed text-sm" style="color: var(--color-ink-4)">
                {{ project.longDescription }}
              </p>
            </div>

            <!-- Workflow pipeline card -->
            <div class="glass-card p-8 space-y-6">
              <div class="flex items-center gap-3">
                <span class="w-1 h-5 rounded-full" style="background: var(--color-bronze);" />
                <h2 class="font-display text-xl font-semibold" style="color: var(--color-ink-1)">幕后制作工作流 (Pipeline)</h2>
              </div>

              <div class="space-y-0" style="border-top: 1px solid var(--color-border);">
                <div
                  v-for="flow in project.workflow"
                  :key="flow.title"
                  class="py-5 space-y-2"
                  style="border-bottom: 1px solid var(--color-border);"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-xl flex-shrink-0">{{ flow.icon }}</span>
                    <h3 class="font-semibold text-sm" style="color: var(--color-ink-1)">{{ flow.title }}</h3>
                  </div>
                  <p class="text-sm leading-relaxed pl-9" style="color: var(--color-ink-4)">{{ flow.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Specs + CTA -->
          <div class="space-y-6">

            <!-- DI Console Specs card -->
            <div class="glass-card p-6 space-y-5 relative overflow-hidden">
              <!-- Top accent line — bronze gold -->
              <div class="absolute top-0 inset-x-0 h-[2px] rounded-t-[inherit]"
                   style="background: linear-gradient(90deg, transparent, var(--color-bronze), transparent)" />

              <div class="flex items-center justify-between pt-1">
                <h2 class="font-display text-sm font-bold uppercase tracking-wider"
                    style="color: var(--color-ink-1)">DI Console Specs</h2>
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full animate-pulse"
                        style="background: #16a34a" />
                  <span class="text-[10px] uppercase font-mono" style="color: var(--color-ink-5)">Graded</span>
                </div>
              </div>

              <div class="space-y-0 font-mono text-xs" style="border-top: 1px solid var(--color-border);">
                <div class="flex justify-between py-3" style="border-bottom: 1px solid var(--color-border);">
                  <span style="color: var(--color-ink-4)">后期导演 (Director)</span>
                  <span class="font-semibold" style="color: var(--color-ink-1)">Xo</span>
                </div>
                <div v-if="project.software?.[0]" class="flex justify-between py-3" style="border-bottom: 1px solid var(--color-border);">
                  <span style="color: var(--color-ink-4)">剪辑软件 (NLE)</span>
                  <span class="font-semibold" style="color: var(--color-ink-1)">{{ project.software[0] }}</span>
                </div>
                <div v-if="project.software?.[1]" class="flex justify-between py-3" style="border-bottom: 1px solid var(--color-border);">
                  <span style="color: var(--color-ink-4)">色彩分级 (DI)</span>
                  <span class="font-semibold" style="color: var(--color-ink-1)">{{ project.software[1] }}</span>
                </div>
                <div class="flex justify-between py-3" style="border-bottom: 1px solid var(--color-border);">
                  <span style="color: var(--color-ink-4)">交付格式</span>
                  <span class="font-semibold" style="color: var(--color-ink-1)">ProRes 422 HQ</span>
                </div>
                <div class="flex justify-between py-3">
                  <span style="color: var(--color-ink-4)">声音编码</span>
                  <span class="font-semibold" style="color: var(--color-ink-1)">24-bit 48kHz</span>
                </div>
              </div>
            </div>

            <!-- CTA card -->
            <div class="glass-card p-6 space-y-4 overflow-hidden relative">
              <!-- Warm amber glow top-right -->
              <div class="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                   style="background: radial-gradient(circle, rgba(180,83,9,0.12) 0%, transparent 70%)" />
              <div class="space-y-1 relative z-10">
                <h3 class="font-display text-base font-semibold" style="color: var(--color-ink-1)">
                  需要同类视频制作？
                </h3>
                <p class="text-xs leading-relaxed" style="color: var(--color-ink-4)">
                  我支持从视频分镜、后期精剪、调色降噪到动效合成的全流程定制服务。
                </p>
              </div>
              <a href="mailto:hello@xo.dev" class="btn-primary w-full justify-center text-xs py-2.5 relative z-10">
                发起项目咨询
              </a>
            </div>

          </div>
        </div>
      </div>

      <!-- Not found state -->
      <div v-else class="text-center py-20 space-y-4 reveal">
        <p class="text-5xl">🎞️</p>
        <h1 class="font-display text-2xl font-bold" style="color: var(--color-ink-1)">未找到该作品</h1>
        <p style="color: var(--color-ink-4)">请返回作品集重新选择。</p>
        <NuxtLink to="/projects" class="btn-primary inline-flex">返回作品集</NuxtLink>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const mainVideoRef = ref<HTMLVideoElement | null>(null)
const blurVideoRef = ref<HTMLVideoElement | null>(null)

const { data: projects } = await useFetch<any[]>('/api/projects')
const project = computed(() => (projects.value || []).find(p => p.slug === slug))

const syncBlurVideo = () => {
  if (!mainVideoRef.value || !blurVideoRef.value) return
  const main = mainVideoRef.value
  const blur = blurVideoRef.value
  main.addEventListener('play', () => blur.play())
  main.addEventListener('pause', () => blur.pause())
  main.addEventListener('seeking', () => { blur.currentTime = main.currentTime })
  main.addEventListener('timeupdate', () => {
    if (Math.abs(blur.currentTime - main.currentTime) > 0.35) {
      blur.currentTime = main.currentTime
    }
  })
}

useHead({
  title: () => project.value ? `${project.value.title} — xo.dev` : '作品详情 — xo.dev',
  meta: [{ name: 'description', content: () => project.value ? project.value.description : '作品详情页' }]
})

let observer: IntersectionObserver | null = null
onMounted(async () => {
  await nextTick()
  observer = new IntersectionObserver(
    (entries) => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view') }) },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  )
  document.querySelectorAll('.reveal').forEach(el => observer?.observe(el))
})
onBeforeUnmount(() => { if (observer) observer.disconnect() })
</script>
