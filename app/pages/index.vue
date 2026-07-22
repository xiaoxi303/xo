<template>
  <div class="min-h-screen">
    <!-- ===== HERO SECTION (Luxury Editorial Gallery) ===== -->
    <section class="relative min-h-screen flex items-center pt-28 pb-20 px-6">
      <div class="max-w-6xl mx-auto w-full relative z-10">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          
          <!-- Left: Big Typography & CTA -->
          <div ref="heroTextRef" class="space-y-8">
            <!-- Elegant booking status badge -->
            <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-black/5 bg-white/60 shadow-sm backdrop-blur-md">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
              <span class="text-slate-500 text-[10px] font-bold uppercase tracking-wider font-mono">Status: {{ siteConfig?.home?.bookingStatus || 'Booking Open (2026)' }}</span>
            </div>

            <!-- Main Heading (Playfair Display Luxury Serif) -->
            <div class="space-y-3">
              <h1 class="font-display text-5xl lg:text-7xl font-bold leading-[1.08] tracking-tight">
                <span class="block text-slate-900">{{ siteConfig?.home?.heroTitle1 || '用剪辑' }}</span>
                <span class="block text-gradient italic font-normal my-1">{{ siteConfig?.home?.heroTitle2 || '重塑时间' }}</span>
                <span class="block text-slate-900">{{ siteConfig?.home?.heroTitle3 || '与故事' }}</span>
              </h1>
            </div>

            <!-- Description (Outfit style) -->
            <p class="text-slate-500 text-sm leading-relaxed max-w-lg font-sans">
              {{ siteConfig?.home?.heroSub || '资深视频剪辑师 & 调色包装设计师。专注于 TVC 广告、品牌形象宣传片、科技感产品动效包装，以及高画质纪录片的后期全流程开发。' }}
            </p>

            <!-- CTA controls -->
            <div class="flex flex-wrap items-center gap-4">
              <NuxtLink to="/projects" class="btn-primary">
                浏览剪辑作品 (Projects)
              </NuxtLink>
              <a :href="'mailto:' + (siteConfig?.siteInfo?.contactEmail || 'hello@xo.dev')" class="btn-ghost" @click="trackEvent('contact_click', 'homepage')">
                联系我 (Contact)
              </a>
            </div>

            <!-- Tech stack tag line -->
            <div class="flex flex-wrap gap-2 pt-2">
              <span v-for="tech in (siteConfig?.home?.heroTechStack && siteConfig.home.heroTechStack.length > 0 ? siteConfig.home.heroTechStack : techStack)" :key="tech" class="tag">{{ tech }}</span>
            </div>
          </div>

          <!-- Right: Minimalist Floating Frame (纯净悬浮电影视轨) -->
          <div ref="heroCardRef" class="relative">
            <!-- Ambient warm gold glow -->
            <div class="absolute -inset-4 bg-gradient-to-r from-amber-600/5 via-slate-400/5 to-transparent rounded-3xl blur-2xl pointer-events-none" />
            
            <div class="glass-card relative p-0 overflow-hidden aspect-[4/3] flex flex-col justify-between group shadow-xl">
              
              <!-- Clean Minimal Header -->
              <div class="px-4 py-2 bg-white/40 border-b border-black/5 font-mono text-[9px] text-slate-400 flex items-center justify-between z-20">
                <span class="font-bold">SHOWREEL.MP4</span>
                <span class="text-amber-700 font-semibold">23.976 FPS</span>
              </div>

              <!-- Video Area -->
              <div class="flex-1 relative bg-slate-950 flex items-center justify-center">
                <MediaVideo
                  :src="siteConfig?.home?.heroVideoUrl || 'https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_30fps.mp4'"
                  :poster="siteConfig?.home?.heroVideoPoster || 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?w=800&q=80'"
                  title="SHOWREEL"
                  index="01"
                  category=""
                  :description="siteConfig?.home?.heroSub"
                  class="w-full h-full"
                />
              </div>

              <!-- Clean Stats footer -->
              <div class="px-6 py-4 bg-white/80 border-t border-black/5 flex items-center justify-between z-20">
                <div class="space-y-0.5">
                  <div class="text-lg font-display font-bold text-slate-900 leading-none">{{ siteConfig?.home?.statValue1 || '120+' }}</div>
                  <div class="text-slate-400 text-[9px] uppercase font-mono tracking-wider">{{ siteConfig?.home?.statLabel1 || '剪辑交付量' }}</div>
                </div>
                <div class="h-6 w-px bg-black/5" />
                <div class="space-y-0.5">
                  <div class="text-lg font-display font-bold text-slate-900 leading-none">{{ siteConfig?.home?.statValue2 || '4K HDR' }}</div>
                  <div class="text-slate-400 text-[9px] uppercase font-mono tracking-wider">{{ siteConfig?.home?.statLabel2 || '高规格支持' }}</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Scroll down indicator -->
        <div class="flex justify-center mt-20">
          <button
            @click="scrollToBento"
            class="flex flex-col items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors group"
          >
            <span class="text-[9px] tracking-widest font-mono uppercase">SCROLL DOWN</span>
            <div class="w-5 h-9 rounded-full border border-black/10 flex items-start justify-center pt-1.5 group-hover:border-black/30 transition-colors">
              <div class="w-1 h-1 rounded-full bg-amber-600 animate-bounce" />
            </div>
          </button>
        </div>
      </div>
    </section>

    <!-- ===== COOPERATIVE BRANDS (Cinematic Ribbon) ===== -->
    <section v-if="siteConfig?.home?.collaborativeBrands?.length" class="py-10 border-y border-black/[0.04] bg-black/[0.01] overflow-hidden select-none reveal">
      <div class="max-w-6xl mx-auto px-6 mb-4">
        <p class="section-label text-center">Collaborative Brands & Agencies · 合作与联合制作品牌</p>
      </div>
      <!-- Seamless Scrolling Wrapper -->
      <div class="relative w-full flex overflow-x-hidden">
        <!-- Dual panels to create seamless infinite scroll -->
        <div class="animate-marquee whitespace-nowrap flex items-center gap-16 text-xs sm:text-sm font-sans font-medium tracking-wide uppercase" style="color: var(--color-ink-3)">
          <span v-for="(brand, idx) in siteConfig.home.collaborativeBrands" :key="'b1-' + idx" class="flex items-center gap-2">
            <span class="text-[#b45309] text-xs">✦</span> {{ brand }}
          </span>
        </div>
        <div class="animate-marquee whitespace-nowrap flex items-center gap-16 text-xs sm:text-sm font-sans font-medium tracking-wide uppercase ml-16" style="color: var(--color-ink-3)" aria-hidden="true">
          <span v-for="(brand, idx) in siteConfig.home.collaborativeBrands" :key="'b2-' + idx" class="flex items-center gap-2">
            <span class="text-[#b45309] text-xs">✦</span> {{ brand }}
          </span>
        </div>
      </div>
    </section>

    <!-- ===== BENTO GRID SECTION (Light Glass Tiles) ===== -->
    <section id="bento-section" class="relative py-20 px-6">
      <div class="max-w-6xl mx-auto space-y-12 relative z-10">
        
        <!-- Header -->
        <div ref="sectionHeaderRef" class="space-y-3 text-center reveal">
          <p class="text-amber-700 text-xs font-semibold uppercase tracking-widest font-mono">Bento Gallery</p>
          <h2 class="font-display text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">后期剪辑与色彩美学</h2>
          <p class="text-slate-400 text-xs max-w-md mx-auto font-sans">以温润透亮的模块化 Bento 排版，解构后期制作的本真秩序。</p>
        </div>

        <!-- Grid -->
        <BentoContainer>
          <!-- Card 1: Showcase video -->
          <BentoItem v-if="tvcProject" span="12:12:8" :to="'/projects/' + tvcProject.slug" class="reveal">
            <div class="h-full flex flex-col justify-between">
              <!-- Media cover -->
              <div class="h-80 relative overflow-hidden bg-slate-900 border-b border-black/5">
                <MediaVideo
                  :src="getProjectVideoUrl(tvcProject)"
                  :poster="tvcProject.image"
                  :title="tvcProject.title"
                  index="01"
                  :category="tvcProject.tags?.[0] || ''"
                  :description="tvcProject.description"
                  class="w-full h-full"
                />
                <!-- Overlay shade -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                <div class="absolute top-4 right-4">
                  <span class="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold bg-white/90 border border-black/5 text-amber-800 shadow-sm">FEATURED</span>
                </div>
              </div>

              <!-- Details info -->
              <div class="p-8 space-y-2">
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  <span v-if="tvcProject.tags?.[0]" class="text-slate-400 text-[9px] uppercase font-mono tracking-wider">{{ tvcProject.tags[0] }}</span>
                </div>
                <h3 class="font-display font-bold text-slate-900 text-2xl group-hover:text-amber-700 transition-colors">
                  {{ tvcProject.title }}
                </h3>
                <p class="text-slate-500 text-sm leading-relaxed font-sans">
                  {{ tvcProject.description }}
                </p>
              </div>
            </div>
          </BentoItem>

          <!-- Card 2: Personal Profile card -->
          <BentoItem span="12:6:4" to="/about" class="reveal">
            <div class="p-8 h-full flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div class="space-y-4">
                <div class="relative w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-slate-800 font-display font-bold text-xl shadow-sm border border-white"
                     style="background: linear-gradient(135deg, rgba(217,119,6,0.15), rgba(180,83,9,0.25))">
                  <img v-if="siteConfig?.siteInfo?.avatar" :src="siteConfig.siteInfo.avatar" class="w-full h-full object-cover" alt="" />
                  <span v-else>{{ siteConfig?.siteInfo?.ownerInitial || 'X' }}</span>
                </div>
                <div class="space-y-0.5">
                  <h3 class="font-display font-bold text-slate-900 text-xl">{{ siteConfig?.home?.profileCardTitle || 'Xo' }}</h3>
                  <p class="text-amber-700 text-[10px] font-mono uppercase tracking-wider font-semibold">{{ siteConfig?.home?.profileCardSub || '调色指导 / 视频剪辑' }}</p>
                </div>
                <p class="text-slate-500 text-xs leading-relaxed font-sans">
                  {{ siteConfig?.home?.profileCardDesc || '专注于用节拍与叙事节奏微雕镜头。拥有 5 年影视及广告后期制作经验。' }}
                </p>
              </div>
              <div class="inline-flex items-center gap-2 text-xs text-slate-900 font-semibold hover:text-amber-700 transition-colors font-sans">
                查看个人履历
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                  <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.63L9.7 5.47a.75.75 0 011.06-1.06l5.75 5.75a.75.75 0 010 1.06l-5.75 5.75a.75.75 0 11-1.06-1.06l4.68-4.68H3.75A.75.75 0 013 10z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>
          </BentoItem>

          <!-- Card 3: Professional Tools -->
          <BentoItem span="12:6:4" class="reveal">
            <div class="p-8 h-full flex flex-col justify-between relative overflow-hidden group">
              <div>
                <div class="space-y-1 mb-4">
                  <h3 class="font-display font-bold text-slate-900 text-xl">工具与工作流</h3>
                  <p class="text-slate-400 text-[9px] uppercase font-mono">达芬奇调色流程</p>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <span v-for="t in (siteConfig?.home?.skillsTags && siteConfig.home.skillsTags.length > 0 ? siteConfig.home.skillsTags : ['Resolve', 'Premiere', 'After Effects', 'Cinema 4D', 'ACES 工作流', 'Logic Pro', 'Foley 音效'])" :key="t" class="tag">{{ t }}</span>
                </div>
              </div>

              <!-- Quiet Luxury skill bars -->
              <div class="space-y-3.5 mt-6">
                <div v-for="skill in skills" :key="skill.name" class="space-y-1.5">
                  <div class="flex justify-between text-[10px] font-mono">
                    <span class="text-slate-500 font-sans">{{ skill.name }}</span>
                    <span class="text-slate-900 font-bold">{{ skill.level }}%</span>
                  </div>
                  <div class="w-full h-1 bg-black/5 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full bg-slate-800"
                      :style="{ width: skill.level + '%' }"
                    />
                  </div>
                </div>
              </div>

            </div>
          </BentoItem>

          <!-- Card 4: Secondary Commercial Film Project -->
          <BentoItem v-if="gradingProject" span="12:12:8" :to="'/projects/' + gradingProject.slug" class="reveal">
            <div class="h-full flex flex-col justify-between">
              
              <!-- Media area -->
              <div class="h-64 relative overflow-hidden bg-slate-900 border-b border-black/5">
                <MediaImage
                  :src="gradingProject.image"
                  :alt="gradingProject.title"
                  :title="gradingProject.title"
                  index="02"
                  :category="gradingProject.tags?.[0] || ''"
                  :description="gradingProject.description"
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                
                <!-- Absolute specs sticker -->
                <div class="absolute top-4 left-4">
                  <span class="px-2.5 py-0.5 rounded text-[8px] bg-white/95 border border-black/5 text-slate-800 font-mono font-bold uppercase shadow-sm">ACES 色彩规范</span>
                </div>
              </div>

              <!-- Description -->
              <div class="p-8 flex flex-col justify-between flex-1">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    <span v-if="gradingProject.tags?.[0]" class="text-slate-400 text-[9px] uppercase font-mono tracking-wider">{{ gradingProject.tags[0] }}</span>
                  </div>
                  <h3 class="font-display font-bold text-slate-900 text-2xl group-hover:text-amber-700 transition-colors">
                    {{ gradingProject.title }}
                  </h3>
                  <p class="text-slate-500 text-sm leading-relaxed font-sans">
                    {{ gradingProject.description }}
                  </p>
                </div>
              </div>

            </div>
          </BentoItem>
        </BentoContainer>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Page Head Metas
useHead({
  title: '视频作品集与调色工作室 — xo.dev',
  meta: [
    { name: 'description', content: '资深视频后期剪辑师 & 达芬奇调色指导的主页与控制台，包含旗舰商业 TVC 概念广告及纪录片后期流程。' }
  ]
})

// Refs
const heroTextRef = ref<HTMLElement | null>(null)
const heroCardRef = ref<HTMLElement | null>(null)
const sectionHeaderRef = ref<HTMLElement | null>(null)

// Data fetching sites config & projects list
const { data: siteConfig } = await useFetch<any>('/api/site-config')
const { data: projects } = await useFetch<any[]>('/api/projects')

// Fallback logic if database is empty
const tvcProject = computed(() => {
  const list = projects.value || []
  const selectedSlug = siteConfig.value?.home?.featuredProject1
  if (selectedSlug) {
    const found = list.find(p => p.slug === selectedSlug)
    if (found) return found
  }
  // Fallback to first project in the list
  if (list.length > 0) return list[0]
  return null
})

const gradingProject = computed(() => {
  const list = projects.value || []
  const selectedSlug = siteConfig.value?.home?.featuredProject2
  if (selectedSlug) {
    const found = list.find(p => p.slug === selectedSlug)
    if (found) return found
  }
  // Fallback to second project in the list
  if (list.length > 1) return list[1]
  return null
})

const techStack = ['Pr / Resolve / AE', 'Cinema 4D', 'VFX Compositing', 'DI Color Science']
const skills = computed(() => {
  return siteConfig.value?.about?.skills || [
    { name: 'Video Editing', level: 95 },
    { name: 'Color Grading', level: 90 },
    { name: 'Motion VFX', level: 85 },
    { name: 'Sound Design', level: 80 }
  ]
})

const getProjectVideoUrl = (project: any) => {
  const urls = Array.isArray(project?.videoUrls) ? project.videoUrls : []
  const firstUrl = urls.map((url: string) => url?.trim()).find(Boolean)
  return firstUrl || project?.videoUrl || ''
}

// Scroll actions
const scrollToBento = () => {
  document.getElementById('bento-section')?.scrollIntoView({ behavior: 'smooth' })
}

// Scroll reveals Entrance animations
let revealObserver: IntersectionObserver | null = null

onMounted(async () => {
  await nextTick()

  // GSAP animations for hero card dynamic slide
  if (import.meta.client) {
    const { gsap } = await import('gsap')
    if (heroTextRef.value) {
      gsap.fromTo(
        heroTextRef.value.children,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', delay: 0.1 }
      )
    }
    if (heroCardRef.value) {
      gsap.fromTo(
        heroCardRef.value,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.25 }
      )
    }
  }

  // IntersectionObserver for remaining sections scroll-reveals
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view')
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -45px 0px' }
  )

  document.querySelectorAll('.reveal').forEach((el) => {
    revealObserver?.observe(el)
  })
})

onBeforeUnmount(() => {
  if (revealObserver) {
    revealObserver.disconnect()
  }
})

// Analytics helpers
const trackEvent = (eventName: string, meta: any) => {
  if (!import.meta.client) return
  $fetch('/api/analytics/event', { method: 'POST', body: { event: eventName, meta } }).catch(() => {})
}
</script>

<style scoped>
@keyframes marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-100%); }
}
.animate-marquee {
  display: inline-flex;
  animation: marquee 30s linear infinite;
}
.animate-marquee:hover {
  animation-play-state: paused;
}
</style>
