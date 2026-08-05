<template>
  <div class="min-h-screen relative overflow-hidden" style="background: var(--color-bg);">
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
                 style="background: var(--glass-bg); border: 1px solid var(--color-bronze-glow);">
              <span class="w-2.5 h-2.5 rounded-full bg-[var(--color-bronze)] animate-ping" />
              <span class="text-[var(--color-ink-2)] text-[11px] font-bold tracking-wider font-sans">
                状态: {{ siteConfig?.home?.bookingStatus || '接受预约中 (2026)' }}
              </span>
              <span class="text-[var(--color-bronze-dark)] text-[10px] font-sans font-bold border-l pl-2.5 px-2 py-0.5 rounded"
                    style="border-color: var(--color-bronze-glow); background: var(--color-bronze-bg);">
                AVAILABLE
              </span>
            </div>

            <!-- Main Heading (Luxury Editorial Serif & Gradient) -->
            <div class="space-y-3">
              <h1 class="font-display text-5xl lg:text-7xl font-bold leading-[1.08] tracking-tight">
                <span class="block text-[var(--color-ink-1)] drop-shadow-sm">{{ siteConfig?.home?.heroTitle1 || '用剪辑' }}</span>
                <span class="block text-gradient italic font-normal my-1">{{ siteConfig?.home?.heroTitle2 || '重塑时间' }}</span>
                <span class="block text-[var(--color-ink-1)]">{{ siteConfig?.home?.heroTitle3 || '与故事' }}</span>
              </h1>
            </div>

            <!-- Description -->
            <p class="text-[var(--color-ink-3)] text-sm sm:text-base leading-relaxed max-w-lg font-sans font-medium">
              {{ siteConfig?.home?.heroSub || '资深视频剪辑师 & 调色包装设计师。专注于 TVC 广告、品牌形象宣传片、科技感产品动效包装，以及高画质纪录片的后期全流程开发。' }}
            </p>

            <!-- CTA controls -->
            <div class="flex flex-wrap items-center gap-4">
              <NuxtLink to="/projects" class="btn-primary shadow-xl" style="box-shadow: 0 10px 25px rgba(217,119,6,0.25);">
                <span>浏览剪辑作品</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 ml-1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </NuxtLink>

              <AppContactBtn
                :href="'mailto:' + (siteConfig?.siteInfo?.contactEmail || 'hello@xo.studio')"
                customClass="px-6 py-3 text-xs font-bold text-[var(--color-ink-1)] bg-white/90 border border-amber-600/20 shadow-md"
                @click="trackEvent('contact_click', 'homepage')"
              >
                <span>联系我</span>
              </AppContactBtn>

              <NuxtLink to="/booking" class="btn-ghost shadow-sm hover:bg-black/5 active:scale-95 transition-all">
                📅 合作预约
              </NuxtLink>

              <NuxtLink to="/booking/form" class="btn-primary shadow-xl" style="background: linear-gradient(135deg, #059669, #10b981); box-shadow: 0 10px 25px rgba(16,185,129,0.25);">
                📋 填写表单
              </NuxtLink>
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
                  <span class="font-bold tracking-wider text-slate-100 font-sans">作品集预览 MP4</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="font-bold text-amber-400/90">{{ heroVideoCodec }}</span>
                  <span class="text-white/40">|</span>
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
                  :minimal="true"
                  :watermark-logo-enabled="siteConfig?.watermark?.logoEnabled ?? true"
                  :watermark-logo-text="siteConfig?.watermark?.logoText || 'Xo Studio'"
                  :watermark-invisible-enabled="siteConfig?.watermark?.invisibleEnabled ?? true"
                  :watermark-invisible-text="siteConfig?.watermark?.invisibleText || '© Xo Studio 2026'"
                  :watermark-invisible-opacity="siteConfig?.watermark?.invisibleOpacity ?? 3"
                  class="w-full h-full object-cover"
                />
              </div>

              <!-- Clean Stats footer -->
              <div class="px-6 py-4 backdrop-blur-md flex items-center justify-between z-20"
                   style="background: rgba(255,255,255,0.96); border-top: 1px solid rgba(0,0,0,0.1);">
                <div class="space-y-0.5">
                  <div class="text-2xl font-display font-bold text-[var(--color-ink-1)] leading-none">{{ siteConfig?.home?.statValue1 || '120+' }}</div>
                  <div class="text-[var(--color-ink-4)] text-[9px] uppercase font-mono tracking-wider font-bold">{{ siteConfig?.home?.statLabel1 || '剪辑交付量' }}</div>
                </div>
                <div class="h-7 w-px bg-black/15" />
                <div class="space-y-0.5">
                  <div class="text-2xl font-display font-bold text-[var(--color-ink-1)] leading-none">{{ siteConfig?.home?.statValue2 || '4K HDR' }}</div>
                  <div class="text-[var(--color-ink-4)] text-[9px] uppercase font-mono tracking-wider font-bold">{{ siteConfig?.home?.statLabel2 || '高规格支持' }}</div>
                </div>
                <div class="h-7 w-px bg-black/15" />
                <div class="space-y-0.5">
                  <div class="text-2xl font-display font-bold text-[var(--color-bronze-dark)] leading-none">{{ statValue3 }}</div>
                  <div class="text-[var(--color-ink-4)] text-[9px] uppercase font-mono tracking-wider font-bold">{{ statLabel3 }}</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Quiet Luxury Editorial Compass & Scroll Dock -->
        <div class="flex flex-col items-center justify-center mt-12 md:mt-16 relative z-20">
          <button
            type="button"
            @click="scrollToBento"
            class="group relative inline-flex items-center gap-4 px-6 py-3 rounded-full backdrop-blur-2xl bg-white/85 shadow-[0_8px_32px_rgba(180,120,50,0.1)] border border-amber-800/15 hover:border-amber-600/40 hover:shadow-[0_12px_40px_rgba(217,119,6,0.22)] hover:-translate-y-1 active:translate-y-0 transition-all duration-500 cursor-pointer overflow-hidden"
            aria-label="Scroll to Bento Section"
          >
            <!-- Background Radial Glow on Hover -->
            <div class="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <!-- Left: Rotating Dial Compass Icon -->
            <div class="relative w-7 h-7 flex items-center justify-center flex-shrink-0">
              <!-- Outer Rotating Dashed Ring -->
              <svg class="w-full h-full text-amber-700/40 animate-[spin_10s_linear_infinite] group-hover:text-amber-600 transition-colors" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3" />
              </svg>
              <!-- Center Golden Bead Drop -->
              <span class="absolute w-2 h-2 rounded-full bg-[#b45309] shadow-[0_0_8px_rgba(180,83,9,0.8)] group-hover:scale-125 transition-transform duration-300" />
            </div>

            <!-- Middle: Monospaced Coordinates & Label -->
            <div class="flex items-center gap-2.5 text-xs select-none">
              <span class="text-[10px] font-mono font-extrabold tracking-widest text-[#b45309]">01</span>
              <span class="w-3 h-px bg-amber-800/25 group-hover:w-5 group-hover:bg-amber-600 transition-all duration-300" />
              <span class="font-sans font-bold tracking-widest text-[#0a0b0e] group-hover:text-[#b45309] transition-colors">
                向下探索
              </span>
            </div>

            <!-- Right: Animated Bouncing Down Arrow Pill -->
            <div class="w-6 h-6 rounded-full bg-amber-500/10 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center text-[#b45309] transition-all duration-300 flex-shrink-0 shadow-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2.5"
                stroke="currentColor"
                class="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </section>

    <!-- ===== COOPERATIVE BRANDS (Cinematic Ribbon) ===== -->
    <section class="relative py-12 overflow-hidden select-none reveal my-12">
      <!-- Gradient border lines top and bottom -->
      <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-bronze)]/30 to-transparent" />
      <div class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--color-bronze)]/30 to-transparent" />
      
      <!-- Smooth Ambient Gradient Background -->
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/[0.05] to-transparent pointer-events-none" />

      <!-- Left and Right Smooth Edge Fade Overlays -->
      <div class="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[var(--color-bg-base)] to-transparent z-10 pointer-events-none" />
      <div class="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[var(--color-bg-base)] to-transparent z-10 pointer-events-none" />

      <div class="relative max-w-6xl mx-auto px-6 mb-4 z-10">
        <p class="section-label text-center font-sans text-xs font-bold text-[var(--color-ink-4)] tracking-widest uppercase">
          合作品牌与技术标准 / Trusted Brands & Industry Tools
        </p>
      </div>

      <!-- Seamless Scrolling Wrapper -->
      <div class="relative w-full flex overflow-x-hidden z-10">
        <div class="animate-marquee whitespace-nowrap flex items-center gap-16 text-xs sm:text-sm font-sans font-bold tracking-wide uppercase text-[var(--color-ink-2)]">
          <span v-for="(brand, idx) in defaultBrands" :key="'b1-' + idx" class="flex items-center gap-2.5 hover:text-[var(--color-bronze-dark)] transition-colors cursor-default">
            <span class="text-[var(--color-bronze)] text-sm font-bold">✦</span> {{ brand }}
          </span>
        </div>
        <div class="animate-marquee whitespace-nowrap flex items-center gap-16 text-xs sm:text-sm font-sans font-bold tracking-wide uppercase text-[var(--color-ink-2)] ml-16" aria-hidden="true">
          <span v-for="(brand, idx) in defaultBrands" :key="'b2-' + idx" class="flex items-center gap-2.5 hover:text-[var(--color-bronze-dark)] transition-colors cursor-default">
            <span class="text-[var(--color-bronze)] text-sm font-bold">✦</span> {{ brand }}
          </span>
        </div>
      </div>
    </section>

    <!-- ===== BENTO GRID SECTION (Light Glass Tiles) ===== -->
    <section id="bento-section" class="relative py-24 px-6">
      <div class="max-w-6xl mx-auto space-y-14 relative z-10">
        
        <!-- Header -->
        <div ref="sectionHeaderRef" class="space-y-3 text-center reveal">
          <p class="text-[var(--color-bronze-dark)] text-xs font-bold uppercase tracking-widest font-sans">后期艺术美学</p>
          <h2 class="font-display text-4xl lg:text-5xl font-bold text-[var(--color-ink-1)] tracking-tight">
            精雕细琢的视觉呈现
          </h2>
          <p class="text-[var(--color-ink-4)] text-xs sm:text-sm max-w-md mx-auto font-sans leading-relaxed">
            融合极致的色彩科学与叙事节奏，为商业广告、概念短片与纪录片注入震撼心灵的视听力量。
          </p>
        </div>

        <!-- Grid -->
        <BentoContainer>
          <!-- Card 1: Showcase video -->
          <BentoItem v-if="tvcProject" span="12:12:8" :to="'/projects/' + tvcProject.slug" class="reveal shadow-2xl">
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
                  :minimal="true"
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                <div class="absolute top-4 right-4 flex items-center gap-2 z-20">
                  <span class="px-3 py-1 rounded-full text-[10px] font-mono font-bold text-[var(--color-bronze-light)] backdrop-blur-md shadow-md"
                        style="background: rgba(0,0,0,0.85); border: 1px solid rgba(245,158,11,0.4);">{{ tvcProjectNodes }}</span>
                  <span class="px-3 py-1 rounded-full text-[10px] font-mono font-bold text-white shadow-md"
                        style="background: #d97706; border: 1px solid rgba(251,191,36,0.4);">{{ tvcProjectBadge }}</span>
                </div>
              </div>

              <!-- Details info -->
              <div class="p-8 space-y-3 bg-white/90">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-[var(--color-bronze)]" />
                  <span v-if="tvcProject.tags?.[0]" class="text-[var(--color-bronze-dark)] text-[11px] font-mono uppercase tracking-wider font-bold">{{ tvcProject.tags[0] }}</span>
                  <span v-if="tvcProject.postSpecs" class="text-[var(--color-ink-5)] text-[10px] font-mono font-bold">• {{ tvcProject.postSpecs }}</span>
                </div>
                <h3 class="font-display font-bold text-[var(--color-ink-1)] text-2xl group-hover:text-[var(--color-bronze-dark)] transition-colors">
                  {{ tvcProject.title }}
                </h3>
                <p class="text-[var(--color-ink-4)] text-sm leading-relaxed font-sans line-clamp-2">
                  {{ tvcProject.description }}
                </p>
              </div>
            </div>
          </BentoItem>

          <!-- Card 2: Personal Profile card -->
          <BentoItem span="12:6:4" to="/about" class="reveal shadow-2xl">
            <div class="p-8 h-full flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div class="space-y-4">
                <div class="relative w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-[var(--color-ink-2)] font-display font-bold text-xl shadow-md"
                     style="background: linear-gradient(135deg, rgba(217,119,6,0.3) 0%, rgba(180,83,9,0.4) 100%); border: 3px solid rgba(217,119,6,0.5); box-shadow: 0 0 15px rgba(217,119,6,0.3);">
                  <img v-if="siteConfig?.siteInfo?.avatar" :src="siteConfig.siteInfo.avatar" class="w-full h-full object-cover" alt="" />
                  <span v-else>{{ siteConfig?.siteInfo?.ownerInitial || 'X' }}</span>
                </div>
                <div class="space-y-0.5">
                  <h3 class="font-display font-bold text-[var(--color-ink-1)] text-2xl">{{ siteConfig?.home?.profileCardTitle || 'Xo' }}</h3>
                  <p class="text-[var(--color-bronze-dark)] text-[11px] font-mono uppercase tracking-wider font-bold">{{ siteConfig?.home?.profileCardSub || '调色指导 / 视频剪辑' }}</p>
                </div>
                <p class="text-[var(--color-ink-4)] text-xs sm:text-sm leading-relaxed font-sans">
                  {{ siteConfig?.home?.profileCardDesc || '专注于用节奏与叙事节奏微雕镜头。拥有 5 年影视及广告后期制作经验。' }}
                </p>
              </div>
              <div class="inline-flex items-center gap-2 text-xs text-[var(--color-bronze-dark)] font-bold hover:text-[var(--color-bronze-dark)] transition-colors font-sans group/link">
                <span>关于我与履历</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 group-hover/link:translate-x-1 transition-transform">
                  <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.63L9.7 5.47a.75.75 0 011.06-1.06l5.75 5.75a.75.75 0 010 1.06l-5.75 5.75a.75.75 0 11-1.06-1.06l4.68-4.68H3.75A.75.75 0 013 10z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>
          </BentoItem>

          <!-- Card 3: Professional Tools & Skill Bars -->
          <BentoItem span="12:6:4" class="reveal shadow-2xl">
            <div class="p-8 h-full flex flex-col justify-between relative overflow-hidden group">
              <div>
                <div class="space-y-1 mb-4">
                  <h3 class="font-display font-bold text-[var(--color-ink-1)] text-xl">工具与工作流</h3>
                  <p class="text-[var(--color-bronze-dark)] text-[10px] uppercase font-mono font-bold">达芬奇调色 & 专业后期系统</p>
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
                    <span class="text-[var(--color-ink-2)] font-sans font-bold">{{ skill.name }}</span>
                    <span class="text-[var(--color-bronze-dark)] font-bold">{{ skill.level }}%</span>
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
                  <span class="px-3 py-1 rounded text-[9px] font-mono font-bold uppercase shadow-md backdrop-blur-md text-[var(--color-bronze-light)]"
                        style="background: rgba(0,0,0,0.85); border: 1px solid rgba(255,255,255,0.2);">ACES 色彩规范</span>
                </div>
              </div>

              <!-- Description -->
              <div class="p-8 flex flex-col justify-between flex-1 bg-white/90">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-[var(--color-bronze)]" />
                    <span v-if="gradingProject.tags?.[0]" class="text-[var(--color-bronze-dark)] text-[11px] font-mono uppercase tracking-wider font-bold">{{ gradingProject.tags[0] }}</span>
                  </div>
                  <h3 class="font-display font-bold text-[var(--color-ink-1)] text-2xl group-hover:text-[var(--color-bronze-dark)] transition-colors">
                    {{ gradingProject.title }}
                  </h3>
                  <p class="text-[var(--color-ink-4)] text-sm leading-relaxed font-sans line-clamp-2">
                    {{ gradingProject.description }}
                  </p>
                </div>
              </div>

            </div>
          </BentoItem>
        </BentoContainer>
      </div>
    </section>

    <!-- ===== CAPSULE BLOG SECTION (Modern Serenity Preview) ===== -->
    <section class="py-20 px-6 relative z-10 bg-gradient-to-b from-transparent via-slate-100/50 to-transparent">
      <div class="max-w-6xl mx-auto space-y-10">
        <!-- Section Header -->
        <div class="flex flex-wrap items-end justify-between gap-6 border-b border-black/10 pb-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#007AFF]/10 text-[#007AFF] text-xs font-bold font-sans">
              <span class="w-2 h-2 rounded-full bg-[#007AFF] animate-ping" />
              <span>最新动态 / Insights</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold font-display text-[var(--color-ink-1)]">
              最新博客文章
            </h2>
          </div>

          <NuxtLink
            to="/blog"
            class="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#007AFF] hover:bg-[#0062cc] shadow-[0_4px_15px_rgba(0,122,255,0.35)] transition-all flex items-center gap-2"
          >
            <span>查看全部文章</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
              <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.63L9.7 5.47a.75.75 0 011.06-1.06l5.75 5.75a.75.75 0 010 1.06l-5.75 5.75a.75.75 0 11-1.06-1.06l4.68-4.68H3.75A.75.75 0 013 10z" clip-rule="evenodd"/>
            </svg>
          </NuxtLink>
        </div>

        <!-- Featured Posts Cards Flow -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <NuxtLink
            v-for="post in homeBlogPosts"
            :key="post.id"
            :to="`/blog/${post.slug}`"
            class="group bg-white/95 rounded-[24px] border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#007AFF]/40 transition-all duration-300 flex flex-col justify-between"
          >
            <div class="relative aspect-[16/9] overflow-hidden bg-slate-100">
              <img :src="post.coverImage" :alt="post.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div class="absolute top-3 right-3 flex items-center gap-1.5">
                <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-[#007AFF] text-white shadow-xs">
                  {{ post.category }}
                </span>
              </div>
            </div>

            <div class="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 class="text-base font-bold text-slate-900 group-hover:text-[#007AFF] transition-colors leading-snug line-clamp-2">
                  {{ post.title }}
                </h3>
                <p class="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {{ post.excerpt }}
                </p>
              </div>

              <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-400">{{ post.createdAt }}</span>
                <span class="text-xs font-bold text-[#007AFF] flex items-center gap-1">
                  <span>阅读全文</span>
                  <span class="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Page Head Metas
useHead({
  title: '视频作品集与调色工作室 — Xo',
  meta: [
    { name: 'description', content: '资深视频后期剪辑师 & 达芬奇调色指导的主页与控制台，包含旗舰商业 TVC 概念广告及纪录片后期流程。' }
  ]
})

// Refs
const heroTextRef = ref<HTMLElement | null>(null)
const heroCardRef = ref<HTMLElement | null>(null)
const sectionHeaderRef = ref<HTMLElement | null>(null)

// Data fetching sites config & projects list
const { data: siteConfig } = useFetch<any>('/api/site-config', { lazy: true })
const { data: projects } = useFetch<any[]>('/api/projects', { lazy: true })

// Blog store initialization for Homepage preview section
const blogStore = useBlogStore()
if (import.meta.client || import.meta.server) {
  blogStore.init?.()
}
const homeBlogPosts = computed(() => {
  return blogStore.getPublishedPosts ? blogStore.getPublishedPosts().slice(0, 3) : []
})

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

// Mock fallback for featured project 1
const defaultTvcProject = {
  slug: 'commercial-tvc-showcase',
  title: '旗舰品牌概念 TVC 剪辑',
  description: '极致节奏控场与色彩渲染，打造电影级视觉冲击。',
  image: 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?w=800&q=80',
  tags: ['Commercial TVC', 'Color Grading'],
  postSpecs: '4K DCI HDR'
}

// Mock fallback for featured project 2
const defaultGradingProject = {
  slug: 'aces-color-grading-showcase',
  title: '纪录片与电影级 DI 调色',
  description: '基于 ACES 胶片色彩科学调校，还原最精准细腻的自然光影与故事质感。',
  image: 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?w=800&q=80',
  tags: ['DI Color Science', 'Documentary']
}

// Safe Fallback logic if database is empty
const tvcProject = computed(() => {
  const list = projects.value || []
  const selectedSlug = siteConfig.value?.home?.featuredProject1
  if (selectedSlug) {
    const found = list.find(p => p.slug === selectedSlug)
    if (found) return found
  }
  if (list.length > 0) return list[0]
  return defaultTvcProject
})

const gradingProject = computed(() => {
  const list = projects.value || []
  const selectedSlug = siteConfig.value?.home?.featuredProject2
  if (selectedSlug) {
    const found = list.find(p => p.slug === selectedSlug)
    if (found) return found
  }
  if (list.length > 1) return list[1]
  return defaultGradingProject
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

let heroAnimated = false
const playHeroEntrance = async () => {
  if (!import.meta.client || heroAnimated) return
  heroAnimated = true
  const { gsap } = await import('gsap')

  if (heroTextRef.value) {
    gsap.fromTo(
      heroTextRef.value.children,
      { opacity: 0, y: 35, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 1.0, stagger: 0.06, ease: 'power3.out' }
    )
  }
  if (heroCardRef.value) {
    gsap.fromTo(
      heroCardRef.value,
      { opacity: 0, y: 45, scale: 0.91, rotateY: -5 },
      { opacity: 1, y: 0, scale: 1, rotateY: 0, duration: 1.15, ease: 'power3.out', delay: 0.08 }
    )
  }
}

// Setup observer safely
const setupRevealObserver = () => {
  if (!import.meta.client) return
  if (revealObserver) revealObserver.disconnect()

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
}

onMounted(async () => {
  await nextTick()

  if (import.meta.client) playHeroEntrance()

  setupRevealObserver()
})

// Re-observe elements when async data updates
watch([projects, siteConfig], async () => {
  await nextTick()
  setupRevealObserver()
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
