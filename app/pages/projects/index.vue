<template>
  <div class="portfolio-page min-h-screen pt-28 pb-24 px-6 relative overflow-hidden" style="background: var(--color-bg);">
    <!-- Ambient Studio Backdrop Light Glows -->
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-0 animate-pulse"
      style="width: 1200px; height: 550px; background: radial-gradient(circle, rgba(217,119,6,0.25) 0%, rgba(147,51,234,0.15) 45%, transparent 75%); filter: blur(65px);"
    />
    <div
      class="absolute top-72 right-4 pointer-events-none z-0"
      style="width: 450px; height: 450px; background: radial-gradient(circle, rgba(217,119,6,0.18) 0%, transparent 70%); filter: blur(70px);"
    />

    <div class="max-w-6xl mx-auto space-y-12 relative z-10">

      <!-- ===== Header & Studio Overview Area ===== -->
      <div class="portfolio-header space-y-6">
        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div class="space-y-4 max-w-2xl">
            <!-- Studio Quality Badge -->
            <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-mono font-bold shadow-md backdrop-blur-xl group"
                 style="background: var(--glass-bg); border: 1px solid var(--color-bronze-glow);">
              <span class="w-2 h-2 rounded-full bg-[var(--color-bronze)] animate-ping" />
              <span class="text-[var(--color-ink-2)] text-[11px] font-sans font-bold">
                影视母带作品库
              </span>
              <span class="text-[var(--color-bronze-dark)] text-[10px] font-mono border-l pl-2" style="border-color: var(--color-bronze-glow);">
                4K HDR · ACEScct
              </span>
            </div>

            <!-- Main Heading -->
            <h1 class="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-[var(--color-ink-1)]">
              <span>作品集与视听切片</span>
              <span class="block text-gradient italic font-normal text-3xl sm:text-4xl lg:text-5xl mt-1">
                用剪辑重塑时间与光影
              </span>
            </h1>

            <p class="text-[var(--color-ink-4)] text-xs sm:text-sm leading-relaxed font-sans font-medium">
              融合极致的镜头节奏、达芬奇电影级色彩科学与全流程工业级视听包装。涵盖商业 TVC、品牌概念片、微电影及院线纪录片。
            </p>
          </div>

          <!-- Studio Live Metrics HUD -->
          <div class="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-amber-600/15 shadow-md select-none self-start lg:self-end">
            <div class="px-3.5 py-1.5 text-center">
              <div class="text-xl font-display font-bold text-[var(--color-ink-1)] leading-none">{{ (projects || []).length }}</div>
              <div class="text-[9px] font-mono text-[var(--color-ink-5)] uppercase tracking-wider mt-1 font-bold">收录作品</div>
            </div>
            <div class="h-7 w-px bg-black/10 hidden sm:block" />
            <div class="px-3.5 py-1.5 text-center">
              <div class="text-xl font-display font-bold text-amber-700 leading-none">4K DCI</div>
              <div class="text-[9px] font-mono text-[var(--color-ink-5)] uppercase tracking-wider mt-1 font-bold">母带画质</div>
            </div>
            <div class="h-7 w-px bg-black/10 hidden sm:block" />
            <div class="px-3.5 py-1.5 text-center">
              <div class="text-xl font-display font-bold text-emerald-700 leading-none">ACES</div>
              <div class="text-[9px] font-mono text-[var(--color-ink-5)] uppercase tracking-wider mt-1 font-bold">广色域规范</div>
            </div>
          </div>
        </div>

        <!-- ===== Interactive Control Dock: Search, Sort & Layout Switcher ===== -->
        <div class="pt-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-t border-black/10">
          
          <!-- Left: Instant Search Bar -->
          <div class="relative flex-1 max-w-md">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <IconSax name="search-normal" :size="16" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索作品名称、标签、软件或项目描述..."
              class="w-full pl-10 pr-10 py-2.5 rounded-full text-xs font-sans bg-white/90 border border-amber-800/15 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 shadow-xs outline-none transition-all placeholder:text-slate-400"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              type="button"
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <span class="text-xs font-bold">✕</span>
            </button>
          </div>

          <!-- Right: Sort & Layout Switchers -->
          <div class="flex flex-wrap items-center gap-3">
            <!-- Sort Selector -->
            <div class="flex items-center gap-1.5 bg-white/85 px-3 py-1.5 rounded-full border border-amber-600/15 shadow-xs text-xs font-mono">
              <span class="text-slate-400 text-[10px]">排序:</span>
              <select
                v-model="sortBy"
                class="bg-transparent border-none text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1"
              >
                <option value="featured">推荐优先</option>
                <option value="newest">最新发布</option>
                <option value="title">名称字母</option>
              </select>
            </div>

            <!-- Layout Mode Switcher (Grid vs Cinema Scope vs Archive Table) -->
            <div class="p-1 rounded-full bg-white/85 border border-amber-600/20 backdrop-blur-md shadow-xs flex items-center gap-1 select-none">
              <button
                type="button"
                @click="viewMode = 'grid'"
                class="px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                :class="viewMode === 'grid' ? 'bg-amber-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'"
                title="磁贴网格视图 (Bento Grid)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                  <path fill-rule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zm0 9A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zm9-9A2.25 2.25 0 0011 4.25v2.5A2.25 2.25 0 0013.25 9h2.5A2.25 2.25 0 0018 6.75v-2.5A2.25 2.25 0 0015.75 2h-2.5zm0 9A2.25 2.25 0 0011 13.25v2.5A2.25 2.25 0 0013.25 18h2.5A2.25 2.25 0 0018 15.75v-2.5A2.25 2.25 0 0015.75 11h-2.5z" clip-rule="evenodd" />
                </svg>
                <span class="hidden sm:inline">网格</span>
              </button>

              <button
                type="button"
                @click="viewMode = 'cinema'"
                class="px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                :class="viewMode === 'cinema' ? 'bg-amber-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'"
                title="影院巨幕大图视图 (Cinema Scope 21:9)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                  <path fill-rule="evenodd" d="M2 4.75A2.75 2.75 0 014.75 2h10.5A2.75 2.75 0 0118 4.75v10.5A2.75 2.75 0 0115.75 18H4.75A2.75 2.75 0 012 15.75V4.75zm2.75-.75A.75.75 0 004 4.75v10.5c0 .414.336.75.75.75h10.5a.75.75 0 00.75-.75V4.75a.75.75 0 00-.75-.75H4.75z" clip-rule="evenodd" />
                  <path d="M6 7.5a.75.75 0 01.75-.75h6.5a.75.75 0 010 1.5h-6.5A.75.75 0 016 7.5zm0 5a.75.75 0 01.75-.75h6.5a.75.75 0 010 1.5h-6.5A.75.75 0 016 12.5z" />
                </svg>
                <span class="hidden sm:inline">巨幕</span>
              </button>

              <button
                type="button"
                @click="viewMode = 'table'"
                class="px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                :class="viewMode === 'table' ? 'bg-amber-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'"
                title="年谱档案清单 (Archive Table)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                  <path fill-rule="evenodd" d="M2 3.75A.75.75 0 012.75 3h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zm0 4.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 8zm0 4.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 4.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
                </svg>
                <span class="hidden sm:inline">目录</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ===== Elegant Quiet Luxury Tag & Topic Filter ===== -->
        <div class="space-y-2.5 pt-1">
          <!-- Filter Header Bar -->
          <div class="flex items-center justify-between text-xs font-mono">
            <div class="flex items-center gap-2">
              <span class="text-amber-800 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                <span>分类题材筛选</span>
              </span>
              <span class="text-slate-300">|</span>
              <span v-if="currentFilter !== 'all'" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-900 border border-amber-500/30 text-[10px] font-bold">
                <span>已选: {{ currentFilter }}</span>
                <button @click="currentFilter = 'all'" class="hover:text-amber-700 ml-1 cursor-pointer font-bold">✕</button>
              </span>
              <span v-else class="text-slate-400 text-[11px]">
                共收录 {{ visibleFilterOpts.length - 1 }} 个题材方向
              </span>
            </div>

            <!-- Expand / Scroll controls -->
            <div class="flex items-center gap-1 text-slate-500">
              <!-- Scroll left -->
              <button
                v-if="!isFilterExpanded"
                type="button"
                @click="scrollFilters('left')"
                class="w-6 h-6 rounded-full bg-white/90 border border-slate-200/90 hover:bg-white hover:border-amber-600/40 hover:text-slate-900 flex items-center justify-center text-xs shadow-2xs transition-all cursor-pointer"
                title="向左滚动"
              >
                ‹
              </button>
              <!-- Scroll right -->
              <button
                v-if="!isFilterExpanded"
                type="button"
                @click="scrollFilters('right')"
                class="w-6 h-6 rounded-full bg-white/90 border border-slate-200/90 hover:bg-white hover:border-amber-600/40 hover:text-slate-900 flex items-center justify-center text-xs shadow-2xs transition-all cursor-pointer"
                title="向右滚动"
              >
                ›
              </button>
              <!-- Expand / Collapse -->
              <button
                type="button"
                @click="isFilterExpanded = !isFilterExpanded"
                class="ml-1 px-2.5 py-0.5 rounded-full bg-white/90 border border-slate-200/90 hover:bg-white hover:border-amber-600/40 text-[11px] font-sans font-medium text-slate-600 hover:text-amber-900 flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
              >
                <span>{{ isFilterExpanded ? '收起横排' : '展开全部' }}</span>
                <span class="text-[9px]">{{ isFilterExpanded ? '▲' : '▼' }}</span>
              </button>
            </div>
          </div>

          <!-- Tag Capsules Container -->
          <div
            ref="filterTrackRef"
            :class="[
              'no-scrollbar transition-all duration-300 py-1',
              isFilterExpanded
                ? 'flex flex-wrap items-center gap-2'
                : 'flex items-center gap-2 overflow-x-auto scroll-smooth'
            ]"
          >
            <button
              v-for="f in visibleFilterOpts"
              :key="f.value"
              @click="setFilter(f.value)"
              type="button"
              :class="[
                'shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer select-none group',
                currentFilter === f.value
                  ? 'bg-slate-900 text-amber-200 font-bold border border-slate-900 shadow-sm shadow-slate-950/20 scale-[1.02]'
                  : 'bg-white/85 backdrop-blur-sm text-slate-700 font-medium border border-slate-200/80 hover:border-amber-600/40 hover:text-amber-950 hover:bg-white shadow-2xs hover:scale-[1.01]'
              ]"
            >
              <span v-if="f.value === 'all'" class="text-amber-400 text-xs">✨</span>
              <span v-else-if="currentFilter === f.value" class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>{{ f.label }}</span>
              <span
                :class="[
                  'text-[10px] font-mono px-1.5 py-0.2 rounded-full transition-colors ml-0.5',
                  currentFilter === f.value
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                    : 'bg-slate-100 text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-800'
                ]"
              >
                {{ f.count }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- ===== Loading State ===== -->
      <div v-if="isLoading" class="portfolio-state flex flex-col items-center justify-center py-28 gap-4 glass-card rounded-3xl">
        <div class="w-9 h-9 border-3 border-amber-500/20 border-t-amber-600 rounded-full animate-spin" />
        <p class="font-display text-xs font-bold text-amber-800 tracking-wider">正在加载好莱坞电影工业作品库...</p>
      </div>

      <!-- ===== Empty State ===== -->
      <Transition name="fade">
        <div v-if="!isLoading && finalProjects.length === 0" class="portfolio-state flex flex-col items-center justify-center py-24 gap-4 glass-card rounded-3xl text-center px-4">
          <div class="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl">🎬</div>
          <div class="space-y-1 max-w-sm">
            <p class="font-display text-xl font-bold text-[var(--color-ink-1)]">未搜索到匹配的项目</p>
            <p class="text-xs text-slate-500 font-sans leading-relaxed">
              {{ searchQuery ? `没有找到包含 "${searchQuery}" 的作品` : `当前分类 "${currentFilter}" 下暂无作品` }}
            </p>
          </div>
          <button
            @click="resetFilters"
            class="xo-kinetic-btn btn-primary text-xs px-6 py-2.5 mt-2"
          >
            重置所有筛选条件
          </button>
        </div>
      </Transition>

      <!-- ===== VIEW MODE 1 & 2: BENTO GRID / CINEMA SCOPE ===== -->
      <div v-if="!isLoading && finalProjects.length > 0 && viewMode !== 'table'" class="relative min-h-[460px]">
        <TransitionGroup
          name="portfolio-anim"
          tag="div"
          :class="[
            'portfolio-grid',
            viewMode === 'cinema' ? 'grid grid-cols-1 gap-10' : 'bento-grid'
          ]"
          @before-leave="onBeforeLeave"
        >
          <BentoItem
            v-for="(project, i) in finalProjects"
            :key="project.slug"
            :span="viewMode === 'cinema' ? '12:12:12' : (project.featured ? '12:12:8' : '12:6:4')"
            :to="'/projects/' + project.slug"
            class="portfolio-card group shadow-2xl transition-all duration-300 relative rounded-3xl overflow-hidden border-2 border-black/[0.06] hover:border-amber-500/40"
            :style="{
              '--card-stagger-delay': `${Math.min(i * 50, 250)}ms`
            }"
          >
            <!-- Media Container -->
            <div :class="[
              'relative overflow-hidden bg-slate-950 transition-all duration-500 flex flex-col justify-between',
              viewMode === 'cinema' ? 'h-96 md:h-[480px]' : (project.featured ? 'h-84' : 'h-64')
            ]">
              <!-- Image / Art Poster -->
              <MediaImage
                :src="project.image"
                :alt="project.title"
                :title="project.title"
                :index="project.displayNumber || project.sortOrder || (i + 1)"
                :category="project.tags?.[0] || ''"
                :tags="project.tags"
                :description="project.description"
                :is-password-protected="project.isPasswordProtected || project.hasPassword"
                class="h-full w-full object-cover transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-105"
              />

              <!-- Ambient Edge Gradient Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

              <!-- Cinema Framing Guides (2.39:1 crop markers) -->
              <div class="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-40 group-hover:opacity-80 transition-opacity">
                <div class="w-3.5 h-3.5 relative">
                  <span class="absolute top-1/2 left-0 right-0 h-px bg-white/70" />
                  <span class="absolute left-1/2 top-0 bottom-0 w-px bg-white/70" />
                </div>
                <div class="absolute top-3.5 left-3.5 w-3 h-3 border-t border-l border-white/40" />
                <div class="absolute top-3.5 right-3.5 w-3 h-3 border-t border-r border-white/40" />
                <div class="absolute bottom-3.5 left-3.5 w-3 h-3 border-b border-l border-white/40" />
                <div class="absolute bottom-3.5 right-3.5 w-3 h-3 border-b border-r border-white/40" />
              </div>

              <!-- Top Left: Slate Number & Timecode HUD -->
              <div class="absolute top-3.5 left-3.5 z-20 flex items-center gap-2">
                <div class="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-mono text-amber-200 flex items-center gap-1.5 shadow-md">
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span class="font-bold tracking-wider font-mono">场次 {{ String(project.displayNumber || project.sortOrder || (i + 1)).padStart(2, '0') }}</span>
                  <span class="text-white/25">•</span>
                  <span class="text-white/80 text-[9px]">{{ project.postSpecs ? '4K DCI' : 'ACEScct' }}</span>
                </div>
              </div>

              <!-- Top Right: Featured & Protection Chips -->
              <div class="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5">
                <span
                  v-if="project.featured"
                  class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold shadow-lg text-white backdrop-blur-md flex items-center gap-1"
                  style="background: linear-gradient(135deg, #d97706, #b45309); border: 1px solid rgba(251,191,36,0.5);"
                >
                  <span>✦</span>
                  <span>精选推荐</span>
                </span>
                <span
                  v-if="project.isColorGraded"
                  class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold backdrop-blur-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                >
                  已调色
                </span>
                <span
                  v-if="project.hasPassword"
                  class="px-2 py-1 rounded-full text-[10px] font-mono font-bold backdrop-blur-md bg-black/60 text-amber-200 border border-white/20 shadow-sm"
                  title="受访问密码保护"
                >
                  🔒
                </span>
              </div>

              <!-- Center: Magnetic Kinetic Play Button -->
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                <div
                  class="w-16 h-16 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) border border-white/80"
                  style="box-shadow: 0 16px 45px rgba(217,119,6,0.45);"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-7 h-7 ml-0.5 text-amber-700 transition-transform duration-200 group-hover:scale-110">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                  </svg>
                </div>
              </div>

              <!-- Bottom Overlay Bar inside Media (for Cinema Mode) -->
              <div v-if="viewMode === 'cinema'" class="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-[10px] font-mono text-white/80 pointer-events-none">
                <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                  <span class="text-amber-400 font-bold">{{ project.director || 'Xo Studio' }}</span>
                  <span>|</span>
                  <span>{{ project.releaseYear || '2026' }}</span>
                  <span>|</span>
                  <span>{{ project.postSpecs || '4K 24FPS Scope 2.39:1' }}</span>
                </div>
              </div>
            </div>

            <!-- Content Details Area -->
            <div :class="[
              'p-7 space-y-4 bg-white/95 backdrop-blur-md transition-colors',
              viewMode === 'cinema' ? 'md:p-9 space-y-5' : ''
            ]">
              <div class="space-y-2">
                <!-- Tag & Specs Bar -->
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-[var(--color-bronze)]" />
                    <span v-if="project.tags?.[0]" class="text-[var(--color-bronze-dark)] text-[11px] font-mono uppercase tracking-wider font-bold">
                      {{ project.tags[0] }}
                    </span>
                    <span v-if="project.releaseYear" class="text-slate-400 text-[10px] font-mono font-medium">
                      • {{ project.releaseYear }}
                    </span>
                  </div>

                  <span v-if="project.postSpecs && viewMode !== 'cinema'" class="text-[10px] font-mono text-slate-400 font-medium hidden sm:inline truncate max-w-[160px]" :title="project.postSpecs">
                    {{ project.postSpecs }}
                  </span>
                </div>

                <!-- Film Title -->
                <h2 :class="[
                  'font-display font-bold text-[var(--color-ink-1)] group-hover:text-[var(--color-bronze-dark)] transition-colors tracking-tight',
                  viewMode === 'cinema' ? 'text-2xl md:text-3xl' : 'text-xl'
                ]">
                  {{ project.title }}
                </h2>

                <!-- Description -->
                <p :class="[
                  'text-[var(--color-ink-4)] text-xs sm:text-sm leading-relaxed font-sans',
                  viewMode === 'cinema' ? 'line-clamp-3 md:text-base max-w-3xl' : 'line-clamp-2'
                ]">
                  {{ project.description }}
                </p>
              </div>

              <!-- Bottom Meta Row: Software Stack & Enter Link -->
              <div class="pt-3 border-t border-black/[0.06] flex items-center justify-between gap-3 flex-wrap">
                <!-- Software Chips -->
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="sw in (project.software || []).slice(0, 3)"
                    :key="sw"
                    class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-black/5"
                  >
                    {{ sw }}
                  </span>
                  <span
                    v-if="project.software && project.software.length > 3"
                    class="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400"
                  >
                    +{{ project.software.length - 3 }}
                  </span>
                </div>

                <!-- Kinetic Explore Link -->
                <div class="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-bronze-dark)] font-sans group-hover:translate-x-1 transition-transform">
                  <span>{{ viewMode === 'cinema' ? '放映正片 & 技术拆解' : '查看详情' }}</span>
                  <span class="font-mono">→</span>
                </div>
              </div>
            </div>
          </BentoItem>
        </TransitionGroup>
      </div>

      <!-- ===== VIEW MODE 3: EDITORIAL ARCHIVE TABLE ===== -->
      <div v-else-if="!isLoading && finalProjects.length > 0 && viewMode === 'table'" class="glass-card rounded-3xl overflow-hidden border border-black/10 shadow-2xl bg-white/95">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-[10px] font-mono uppercase tracking-wider bg-black/[0.02] border-b border-black/10 text-slate-500">
                <th class="py-4 px-6 w-20 text-center">序号</th>
                <th class="py-4 px-6">作品海报与标题</th>
                <th class="py-4 px-6 hidden sm:table-cell">分类标签</th>
                <th class="py-4 px-6 hidden md:table-cell">后期规格</th>
                <th class="py-4 px-6 hidden lg:table-cell">后期软件</th>
                <th class="py-4 px-6 text-center">调色</th>
                <th class="py-4 px-6 text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-black/5 text-xs font-sans">
              <tr
                v-for="(p, i) in finalProjects"
                :key="p.slug"
                class="hover:bg-amber-500/[0.04] transition-colors group/row cursor-pointer"
                @click="$router.push('/projects/' + p.slug)"
              >
                <!-- Slate Number -->
                <td class="py-4 px-6 text-center font-mono font-bold text-amber-800">
                  {{ String(p.displayNumber || p.sortOrder || (i + 1)).padStart(2, '0') }}
                </td>

                <!-- Thumbnail & Title -->
                <td class="py-4 px-6">
                  <div class="flex items-center gap-4 min-w-[220px]">
                    <div class="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900 border border-black/10 shadow-xs relative">
                      <MediaImage
                        :src="p.image"
                        :alt="p.title"
                        :title="p.title"
                        :index="i + 1"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div class="font-bold font-display text-sm text-slate-900 group-hover/row:text-amber-800 transition-colors line-clamp-1">
                        {{ p.title }}
                      </div>
                      <div class="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {{ p.description }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Tags -->
                <td class="py-4 px-6 hidden sm:table-cell">
                  <div class="flex flex-wrap gap-1">
                    <span v-for="tag in (p.tags || []).slice(0, 2)" :key="tag" class="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/10 text-amber-900">
                      {{ tag }}
                    </span>
                  </div>
                </td>

                <!-- Specs -->
                <td class="py-4 px-6 hidden md:table-cell font-mono text-[11px] text-slate-600">
                  {{ p.postSpecs || '4K DCI HDR' }}
                </td>

                <!-- Software -->
                <td class="py-4 px-6 hidden lg:table-cell">
                  <div class="flex flex-wrap gap-1">
                    <span v-for="sw in (p.software || []).slice(0, 2)" :key="sw" class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                      {{ sw }}
                    </span>
                  </div>
                </td>

                <!-- Graded Status -->
                <td class="py-4 px-6 text-center">
                  <span v-if="p.isColorGraded" class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700">
                    ACEScct
                  </span>
                  <span v-else class="text-slate-400 font-mono text-[11px]">—</span>
                </td>

                <!-- Action -->
                <td class="py-4 px-6 text-right">
                  <NuxtLink
                    :to="'/projects/' + p.slug"
                    class="xo-kinetic-btn px-4 py-1.5 rounded-full text-xs font-bold text-amber-900 bg-amber-500/15 hover:bg-amber-600 hover:text-white transition-all inline-flex items-center gap-1 shadow-xs"
                    @click.stop
                  >
                    <span>放映正片</span>
                    <span class="font-mono">→</span>
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ===== Closing Commercial Production Banner ===== -->
      <section class="portfolio-cta pt-12 pb-6">
        <div class="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-amber-600/25 shadow-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white flex flex-col sm:flex-row items-center justify-between gap-8">
          <div class="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
          <div class="space-y-2.5 max-w-xl relative z-10 text-center sm:text-left">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-[10px] font-mono font-bold">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>全流程后期定制</span>
            </div>
            <h3 class="font-display text-2xl sm:text-3xl font-bold text-white">
              有全新商业片或调色项目需要交付？
            </h3>
            <p class="text-slate-300 text-xs sm:text-sm font-sans leading-relaxed">
              随时发起合作洽谈。我们提供从粗剪节奏微调、达芬奇广色域色彩科学管理到杜比视界高规格母带的全流程定制。
            </p>
          </div>

          <div class="flex items-center gap-3 relative z-10 flex-shrink-0">
            <NuxtLink
              to="/booking/form"
              class="xo-kinetic-btn px-7 py-3.5 rounded-full text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 shadow-xl hover:scale-105 transition-all"
            >
              填写商业预约意向
            </NuxtLink>
            <NuxtLink
              to="/booking"
              class="xo-kinetic-btn px-6 py-3.5 rounded-full text-xs font-bold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
            >
              了解排期流程
            </NuxtLink>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '视频作品集与剪辑调色工程 — Xo Studio',
  meta: [
    { name: 'description', content: '浏览 Xo Studio 的商业 TVC、品牌形象宣传片、科技感产品动效包装，以及高画质纪录片的后期全流程作品集。' }
  ]
})

const { data: projects, status: projectsStatus } = useFetch<any[]>('/api/projects')
const isLoading = computed(() => projectsStatus.value === 'pending' || (projects.value === null && projectsStatus.value !== 'error'))

// Controls
const currentFilter = ref('all')
const searchQuery = ref('')
const sortBy = ref<'featured' | 'newest' | 'title'>('featured')
const viewMode = ref<'grid' | 'cinema' | 'table'>('grid')
const isFilterExpanded = ref(false)
const filterTrackRef = ref<HTMLElement | null>(null)

const scrollFilters = (direction: 'left' | 'right') => {
  if (!filterTrackRef.value) return
  const offset = direction === 'left' ? -260 : 260
  filterTrackRef.value.scrollBy({ left: offset, behavior: 'smooth' })
}

// Filter options with dynamic counts
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

const resetFilters = () => {
  currentFilter.value = 'all'
  searchQuery.value = ''
}

// Multi-dimension Filtering & Sorting
const finalProjects = computed(() => {
  let list = [...(projects.value || [])]

  // 1. Tag Filtering
  if (currentFilter.value !== 'all') {
    list = list.filter((project: any) => {
      return Array.isArray(project.tags) && project.tags.some((t: string) =>
        t.toLowerCase().includes(currentFilter.value.toLowerCase()) ||
        currentFilter.value.toLowerCase().includes(t.toLowerCase())
      )
    })
  }

  // 2. Search Query Filtering
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter((p: any) => {
      const titleMatch = (p.title || '').toLowerCase().includes(q)
      const descMatch = (p.description || '').toLowerCase().includes(q)
      const directorMatch = (p.director || '').toLowerCase().includes(q)
      const postSpecsMatch = (p.postSpecs || '').toLowerCase().includes(q)
      const tagMatch = Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase().includes(q))
      const swMatch = Array.isArray(p.software) && p.software.some((s: string) => s.toLowerCase().includes(q))
      return titleMatch || descMatch || directorMatch || postSpecsMatch || tagMatch || swMatch
    })
  }

  // 3. Sorting
  if (sortBy.value === 'featured') {
    list.sort((a: any, b: any) => {
      const sa = Number(a.sortOrder) || 0
      const sb = Number(b.sortOrder) || 0
      if (sa > 0 && sb > 0 && sa !== sb) return sa - sb
      if (sa > 0 && sb === 0) return -1
      if (sa === 0 && sb > 0) return 1
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
    })
  } else if (sortBy.value === 'newest') {
    list.sort((a: any, b: any) => {
      const yearA = parseInt(a.releaseYear || '0', 10)
      const yearB = parseInt(b.releaseYear || '0', 10)
      return yearB - yearA
    })
  } else if (sortBy.value === 'title') {
    list.sort((a: any, b: any) => (a.title || '').localeCompare(b.title || ''))
  }

  return list
})

/**
 * Vue FLIP Grid Transition Hook for silky smooth repositioning
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

.portfolio-anim-move {
  transition: transform 0.54s cubic-bezier(0.16, 1, 0.3, 1);
}

.portfolio-anim-enter-active {
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
              filter 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--card-stagger-delay, 0ms);
}

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

.filter-pill {
  backface-visibility: hidden;
  will-change: transform, background-color;
}

.filter-pill:active {
  transform: scale(0.96);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

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
