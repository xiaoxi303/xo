<template>
  <div class="min-h-screen relative overflow-hidden" style="background: var(--color-bg, #faf8f5);">
    <!-- ===== Ambient Studio Luxury Backdrop Glows (High Visibility) ===== -->
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-0 animate-pulse"
      style="width: 1200px; height: 600px; background: radial-gradient(circle, rgba(217,119,6,0.28) 0%, rgba(147,51,234,0.18) 45%, transparent 75%); filter: blur(60px);"
    />
    <div
      class="absolute top-48 right-4 pointer-events-none z-0"
      style="width: 500px; height: 500px; background: radial-gradient(circle, rgba(217,119,6,0.2) 0%, transparent 70%); filter: blur(70px);"
    />

    <!-- ===== HERO SECTION (Luxury Editorial Gallery) ===== -->
    <section class="relative min-h-screen flex items-center pt-28 pb-20 px-6 z-10">
      <div class="max-w-6xl mx-auto w-full relative z-10">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          
          <!-- Left: Big Typography & CTA -->
          <div ref="heroTextRef" class="space-y-8">
            <!-- Elegant booking status badge -->
            <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full shadow-md backdrop-blur-xl group"
                 style="background: rgba(255,255,255,0.9); border: 1px solid rgba(217,119,6,0.35);">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping" />
              <span class="text-slate-800 text-[11px] font-bold uppercase tracking-wider font-mono">Status: {{ siteConfig?.home?.bookingStatus || 'Booking Open (2026)' }}</span>
              <span class="text-amber-800 text-[10px] font-mono font-bold border-l pl-2.5 px-2 py-0.5 rounded"
                    style="border-color: rgba(217,119,6,0.3); background: rgba(217,119,6,0.12);">4K DI Ready</span>
            </div>

            <!-- Main Heading (Luxury Editorial Serif & Gradient) -->
            <div class="space-y-3">
              <h1 class="font-display text-5xl lg:text-7xl font-bold leading-[1.08] tracking-tight">
                <span class="block text-slate-900 drop-shadow-sm">{{ siteConfig?.home?.heroTitle1 || '用剪辑' }}</span>
                <span class="block text-gradient italic font-normal my-1">{{ siteConfig?.home?.heroTitle2 || '重塑时间' }}</span>
                <span class="block text-slate-900">{{ siteConfig?.home?.heroTitle3 || '与故事' }}</span>
              </h1>
            </div>

            <!-- Description -->
            <p class="text-slate-700 text-sm sm:text-base leading-relaxed max-w-lg font-sans font-medium">
              {{ siteConfig?.home?.heroSub || '资深视频剪辑师 & 调色包装设计师。专注于 TVC 广告、品牌形象宣传片、科技感产品动效包装，以及高画质纪录片的后期全流程开发。' }}
            </p>

            <!-- CTA controls -->
            <div class="flex flex-wrap items-center gap-4">
              <NuxtLink to="/projects" class="btn-primary shadow-xl" style="box-shadow: 0 10px 25px rgba(217,119,6,0.25);">
                <span>浏览剪辑作品 (Projects)</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 ml-1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </NuxtLink>
              <a :href="'mailto:' + (siteConfig?.siteInfo?.contactEmail || 'hello@xo.dev')" class="btn-ghost shadow-sm hover:bg-black/5 active:scale-95 transition-all" @click="trackEvent('contact_click', 'homepage')">
                联系我 (Contact)
              </a>
            </div>

            <!-- Tech stack tag line -->
            <div class="flex flex-wrap gap-2 pt-2">
              <span v-for="tech in (siteConfig?.home?.heroTechStack && siteConfig.home.heroTechStack.length > 0 ? siteConfig.home.heroTechStack : techStack)" :key="tech" class="tag font-bold" style="border: 1px solid rgba(217,119,6,0.3); background: rgba(255,255,255,0.8);">
                {{ tech }}
              </span>
            </div>
          </div>

          <!-- Right: Minimalist Floating Monitor (DaVinci Resolve Style Monitor) -->
          <div ref="heroCardRef" class="relative">
            <!-- Ambient warm gold glow -->
            <div class="absolute -inset-4 rounded-3xl blur-2xl pointer-events-none"
                 style="background: linear-gradient(135deg, rgba(217,119,6,0.35) 0%, rgba(147,51,234,0.25) 50%, rgba(217,119,6,0.15) 100%); filter: blur(30px);" />
            
            <div class="glass-card relative p-0 overflow-hidden aspect-[4/3] flex flex-col justify-between group shadow-2xl"
                 style="border: 2px solid rgba(0,0,0,0.15); background: rgba(255,255,255,0.95); box-shadow: 0 20px 40px rgba(0,0,0,0.12);">
              
              <!-- Monitor Style Clean Minimal Header -->
              <div class="px-4 py-2.5 font-mono text-[10px] flex items-center justify-between z-20 select-none"
                   style="background: #0b0d12; color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.15);">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" style="box-shadow: 0 0 10px rgba(244,63,94,0.9);" />
                  <span class="font-bold tracking-wider text-slate-100">SHOWREEL.MP4</span>
                </div>
                <div class="flex items-center gap-3">
                  
                  <span class="font-bold text-slate-300">{{ heroVideoFps }}</span>
                </div>
              </div>

              <!-- Video Area -->
              <div class="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
                <MediaVideo
                  :src="siteConfig?.home?.heroVideoUrl || 'https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_30fps.mp4'"
                  :poster="siteConfig?.home?.heroVideoPoster || 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?w=800&q=80'"
                  title="SHOWREEL"
                  index="01"
                  category=""
                  :description="siteConfig?.home?.heroSub"
                  class="w-full h-full object-cover"
                />
                
                
              </div>

              <!-- Clean Stats footer -->
              <div class="px-6 py-4 backdrop-blur-md flex items-center justify-between z-20"
                   style="background: rgba(255,255,255,0.96); border-top: 1px solid rgba(0,0,0,0.1);">
                <div class="space-y-0.5">
                  <div class="text-2xl font-display font-bold text-slate-900 leading-none">{{ siteConfig?.home?.statValue1 || '120+' }}</div>
                  <div class="text-slate-600 text-[9px] uppercase font-mono tracking-wider font-bold">{{ siteConfig?.home?.statLabel1 || '剪辑交付量' }}</div>
                </div>
                <div class="h-7 w-px bg-black/15" />
                <div class="space-y-0.5">
                  <div class="text-2xl font-display font-bold text-slate-900 leading-none">{{ siteConfig?.home?.statValue2 || '4K HDR' }}</div>
                  <div class="text-slate-600 text-[9px] uppercase font-mono tracking-wider font-bold">{{ siteConfig?.home?.statLabel2 || '高规格支持' }}</div>
                </div>
                <div class="h-7 w-px bg-black/15" />
                <div class="space-y-0.5">
                  <div class="text-2xl font-display font-bold text-amber-800 leading-none">{{ statValue3 }}</div>
                  <div class="text-slate-600 text-[9px] uppercase font-mono tracking-wider font-bold">{{ statLabel3 }}</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Scroll down indicator -->
        <div class="flex justify-center mt-20">
          <button
            @click="scrollToBento"
            class="flex flex-col items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors group cursor-pointer"
          >
            <span class="text-[9px] tracking-widest font-mono uppercase font-bold text-slate-500">SCROLL DOWN</span>
            <div class="w-6 h-10 rounded-full border-2 border-black/15 flex items-start justify-center pt-2 group-hover:border-amber-600 transition-colors shadow-sm bg-white/60">
              <div class="w-1.5 h-2 rounded-full bg-amber-600 animate-bounce" />
            </div>
          </button>
        </div>
      </div>
    </section>

    <!-- ===== COOPERATIVE BRANDS (Cinematic Ribbon) ===== -->
    <section class="py-12 border-y overflow-hidden select-none reveal backdrop-blur-md"
             style="background: linear-gradient(90deg, rgba(0,0,0,0.03) 0%, rgba(217,119,6,0.08) 50%, rgba(0,0,0,0.03) 100%); border-color: rgba(0,0,0,0.12);">
      <div class="max-w-6xl mx-auto px-6 mb-4">
        <p class="section-label text-center font-mono text-[10px] font-bold text-slate-600">Collaborative Brands & Agencies · 合作与联合制作品牌</p>
      </div>
      <!-- Seamless Scrolling Wrapper -->
      <div class="relative w-full flex overflow-x-hidden">
        <div class="animate-marquee whitespace-nowrap flex items-center gap-16 text-xs sm:text-sm font-sans font-bold tracking-wide uppercase text-slate-800">
          <span v-for="(brand, idx) in defaultBrands" :key="'b1-' + idx" class="flex items-center gap-2.5 hover:text-amber-800 transition-colors cursor-default">
            <span class="text-amber-600 text-sm font-bold">✦</span> {{ brand }}
          </span>
        </div>
        <div class="animate-marquee whitespace-nowrap flex items-center gap-16 text-xs sm:text-sm font-sans font-bold tracking-wide uppercase text-slate-800 ml-16" aria-hidden="true">
          <span v-for="(brand, idx) in defaultBrands" :key="'b2-' + idx" class="flex items-center gap-2.5 hover:text-amber-800 transition-colors cursor-default">
            <span class="text-amber-600 text-sm font-bold">✦</span> {{ brand }}
          </span>
        </div>
      </div>
    </section>

    <!-- ===== BENTO GRID SECTION (Light Glass Tiles) ===== -->
    <section id="bento-section" class="relative py-24 px-6">
      <div class="max-w-6xl mx-auto space-y-14 relative z-10">
        
        <!-- Header -->
        <div ref="sectionHeaderRef" class="space-y-3 text-center reveal">
          <p class="text-amber-700 text-xs font-bold uppercase tracking-widest font-mono">Bento Gallery</p>
          <h2 class="font-display text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">后期剪辑与色彩美学</h2>
          <p class="text-slate-600 text-xs sm:text-sm max-w-md mx-auto font-sans leading-relaxed">以温润透亮的模块化 Bento 排版，解构后期制作的本真秩序与视听艺术。</p>
        </div>

        <!-- Grid -->
        <BentoContainer>
          <!-- Card 1: Showcase video -->
          <BentoItem v-if="tvcProject" span="12:12:8" :to="'/projects/' + tvcProject.slug" @click="trackProjectClick(tvcProject)" class="reveal shadow-2xl">
            <div class="h-full flex flex-col justify-between">
              <!-- Media cover -->
              <div class="h-80 relative overflow-hidden bg-slate-950 border-b border-black/5">
                <MediaVideo
                  :src="getProjectVideoUrl(tvcProject)"
                  :poster="tvcProject.image"
                  :title="tvcProject.title"
                  index="01"
                  :category="tvcProject.tags?.[0] || ''"
                  :description="tvcProject.description"
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                <div class="absolute top-4 right-4 flex items-center gap-2 z-20">
                  <span class="px-3 py-1 rounded-full text-[10px] font-mono font-bold text-amber-300 backdrop-blur-md shadow-md"
                        style="background: rgba(0,0,0,0.85); border: 1px solid rgba(245,158,11,0.4);">{{ tvcProjectNodes }}</span>
                  <span class="px-3 py-1 rounded-full text-[10px] font-mono font-bold text-white shadow-md"
                        style="background: #d97706; border: 1px solid rgba(251,191,36,0.4);">{{ tvcProjectBadge }}</span>
                </div>
              </div>

              <!-- Details info -->
              <div class="p-8 space-y-3 bg-white/90">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-600" />
                  <span v-if="tvcProject.tags?.[0]" class="text-amber-800 text-[11px] font-mono uppercase tracking-wider font-bold">{{ tvcProject.tags[0] }}</span>
                  <span v-if="tvcProject.postSpecs" class="text-slate-500 text-[10px] font-mono font-bold">· {{ tvcProject.postSpecs }}</span>
                </div>
                <h3 class="font-display font-bold text-slate-900 text-2xl group-hover:text-amber-800 transition-colors">
                  {{ tvcProject.title }}
                </h3>
                <p class="text-slate-600 text-sm leading-relaxed font-sans line-clamp-2">
                  {{ tvcProject.description }}
                </p>
              </div>
            </div>
          </BentoItem>

          <!-- Card 2: Personal Profile card -->
          <BentoItem span="12:6:4" to="/about" class="reveal shadow-2xl">
            <div class="p-8 h-full flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div class="space-y-4">
                <div class="relative w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-slate-800 font-display font-bold text-xl shadow-md"
                     style="background: linear-gradient(135deg, rgba(217,119,6,0.3) 0%, rgba(180,83,9,0.4) 100%); border: 3px solid rgba(217,119,6,0.5); box-shadow: 0 0 15px rgba(217,119,6,0.3);">
                  <img v-if="siteConfig?.siteInfo?.avatar" :src="siteConfig.siteInfo.avatar" class="w-full h-full object-cover" alt="" />
                  <span v-else>{{ siteConfig?.siteInfo?.ownerInitial || 'X' }}</span>
                </div>
                <div class="space-y-0.5">
                  <h3 class="font-display font-bold text-slate-900 text-2xl">{{ siteConfig?.home?.profileCardTitle || 'Xo' }}</h3>
                  <p class="text-amber-800 text-[11px] font-mono uppercase tracking-wider font-bold">{{ siteConfig?.home?.profileCardSub || '调色指导 / 视频剪辑' }}</p>
                </div>
                <p class="text-slate-600 text-xs sm:text-sm leading-relaxed font-sans">
                  {{ siteConfig?.home?.profileCardDesc || '专注于用节拍与叙事节奏微雕镜头。拥有 5 年影视及广告后期制作经验。' }}
                </p>
              </div>
              <div class="inline-flex items-center gap-2 text-xs text-amber-900 font-bold hover:text-amber-700 transition-colors font-sans group/link">
                <span>查看个人履历与经历年谱</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 group-hover/link:translate-x-1 transition-transform">
                  <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.63L9.7 5.47a.75.75 0 011.06-1.06l5.75 5.75a.75.75 0 010 1.06l-5.75 5.75a.75.75 0 11-1.06-1.06l4.68-4.68H3.75A.75.75 0 013 10z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>
          </BentoItem>

          <!-- Card 3: Professional Tools & Quiet Luxury Skill Bars -->
          <BentoItem span="12:6:4" class="reveal shadow-2xl">
            <div class="p-8 h-full flex flex-col justify-between relative overflow-hidden group">
              <div>
                <div class="space-y-1 mb-4">
                  <h3 class="font-display font-bold text-slate-900 text-xl">工具与工作流</h3>
                  <p class="text-amber-800 text-[10px] uppercase font-mono font-bold">达芬奇调色 & 剪辑栈</p>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <span v-for="t in (siteConfig?.home?.skillsTags && siteConfig.home.skillsTags.length > 0 ? siteConfig.home.skillsTags : ['Resolve', 'Premiere', 'After Effects', 'Cinema 4D', 'ACES 工作流', 'Logic Pro', 'Foley 音效'])" :key="t" class="tag font-semibold" style="border: 1px solid rgba(217,119,6,0.3); background: rgba(255,255,255,0.9);">
                    {{ t }}
                  </span>
                </div>
              </div>

              <!-- Quiet Luxury High-Visibility Skill Bars -->
              <div class="space-y-4 mt-6">
                <div v-for="skill in skills" :key="skill.name" class="space-y-1.5">
                  <div class="flex justify-between text-[11px] font-mono">
                    <span class="text-slate-800 font-sans font-bold">{{ skill.name }}</span>
                    <span class="text-amber-800 font-bold">{{ skill.level }}%</span>
                  </div>
                  <div class="w-full h-2.5 rounded-full overflow-hidden p-0.5 shadow-inner" style="background: rgba(0,0,0,0.12); border: 1px solid rgba(0,0,0,0.08);">
                    <div
                      class="h-full rounded-full shadow-md transition-all duration-1000"
                      :style="{ width: skill.level + '%', background: 'linear-gradient(90deg, #d97706 0%, #b45309 60%, #f59e0b 100%)' }"
                    />
                  </div>
                </div>
              </div>

            </div>
          </BentoItem>

          <!-- Card 4: Secondary Commercial Film Project -->
          <BentoItem v-if="gradingProject" span="12:12:8" :to="'/projects/' + gradingProject.slug" class="reveal shadow-2xl">
            <div class="h-full flex flex-col justify-between">
              
              <!-- Media area -->
              <div class="h-64 relative overflow-hidden bg-slate-950 border-b border-black/5">
                <MediaImage
                  :src="gradingProject.image"
                  :alt="gradingProject.title"
                  :title="gradingProject.title"
                  index="02"
                  :category="gradingProject.tags?.[0] || ''"
                  :description="gradingProject.description"
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                
                <!-- Play icon on hover -->
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div class="w-14 h-14 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-[0_8px_30px_rgba(180,83,9,0.3)] scale-75 group-hover:scale-100 transition-all duration-500 cubic-bezier(0.34,1.56,0.64,1) border border-white/80">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                         class="w-6 h-6 ml-0.5 text-[#b45309] transition-transform duration-300 group-hover:scale-110">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                    </svg>
                  </div>
                </div>

                <!-- Absolute specs sticker -->
                <div class="absolute top-4 left-4">
                  <span class="px-3 py-1 rounded text-[9px] font-mono font-bold uppercase shadow-md backdrop-blur-md text-amber-300"
                        style="background: rgba(0,0,0,0.85); border: 1px solid rgba(255,255,255,0.2);">ACES 色彩规范</span>
                </div>
              </div>

              <!-- Description -->
              <div class="p-8 flex flex-col justify-between flex-1 bg-white/90">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-600" />
                    <span v-if="gradingProject.tags?.[0]" class="text-amber-800 text-[11px] font-mono uppercase tracking-wider font-bold">{{ gradingProject.tags[0] }}</span>
                  </div>
                  <h3 class="font-display font-bold text-slate-900 text-2xl group-hover:text-amber-800 transition-colors">
                    {{ gradingProject.title }}
                  </h3>
                  <p class="text-slate-600 text-sm leading-relaxed font-sans line-clamp-2">
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

// Dynamic Computed Getters for Ultra-Safe Bindings
const heroVideoCodec = computed(() => siteConfig.value?.home?.heroVideoCodec || 'PRORES 4444 XQ')
const heroVideoFps = computed(() => siteConfig.value?.home?.heroVideoFps || '23.976 FPS')
const statValue3 = computed(() => siteConfig.value?.home?.statValue3 || 'ACEScct')
const statLabel3 = computed(() => siteConfig.value?.home?.statLabel3 || '色彩科学')
const tvcProjectNodes = computed(() => siteConfig.value?.home?.tvcProjectNodes || '16 NODES')
const tvcProjectBadge = computed(() => siteConfig.value?.home?.tvcProjectBadge || 'FEATURED')

// Default Brands Fallback for Ribbon
const defaultBrands = computed(() => {
  const custom = siteConfig.value?.home?.collaborativeBrands
  if (Array.isArray(custom) && custom.length > 0) return custom
  return [
    'Tencent Video (腾讯视频)',
    'DaVinci Resolve Studio',
    'RED Digital Cinema',
    'TikTok Commercial Studio',
    'Sony Cine 4K HDR',
    'ProRes 4444 Master',
    'Apple Final Cut Pro'
  ]
})

// Fallback logic if database is empty
const tvcProject = computed(() => {
  const list = projects.value || []
  const selectedSlug = siteConfig.value?.home?.featuredProject1
  if (selectedSlug) {
    const found = list.find(p => p.slug === selectedSlug)
    if (found) return found
  }
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

import { recordProjectClickEvent } from '~/utils/analytics'

const trackProjectClick = (project: any) => {
  if (!import.meta.client || !project?.slug) return
  recordProjectClickEvent(project.slug, project.title)
}

// Scroll reveals Entrance animations
let revealObserver: IntersectionObserver | null = null

onMounted(async () => {
  await nextTick()

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
