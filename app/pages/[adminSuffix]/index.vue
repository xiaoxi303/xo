<template>
  <div class="min-h-screen pt-10 pb-20 px-6 font-sans relative">
    <AdminAiCopilot />

    <!-- AI Interactive Prompt Dialog: Notice Copy -->
    <div v-if="showAiNoticeModal" class="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none">
      <div class="glass-card p-6 rounded-2xl max-w-lg w-full space-y-4 border-2 border-purple-500/30 bg-white/95 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left font-sans">
        <div class="flex items-center justify-between border-b pb-3 border-black/10">
          <div class="flex items-center gap-2">
            <span class="text-lg">📢</span>
            <h3 class="font-bold text-sm text-[#121316]">AI 顶栏告示灵感生成器</h3>
          </div>
          <button type="button" @click="showAiNoticeModal = false" class="text-slate-400 hover:text-black font-bold text-sm px-2">✕</button>
        </div>

        <div class="space-y-2 text-xs">
          <label class="font-bold text-slate-700">请输入您希望 AI 撰写的宣传方向 / 诉求：</label>
          <textarea v-model="aiNoticePrompt" rows="3" class="form-input resize-none text-xs leading-relaxed" placeholder="例如：帮我写一句吸引 4K TVC 商业客户与 DaVinci 调色预约的告示..." />
          <div class="flex flex-wrap gap-1.5 pt-1">
            <span class="text-[10px] text-slate-400 font-bold">灵感预设:</span>
            <button type="button" @click="aiNoticePrompt = '商业 TVC 与电影 DI 调色开放预订中'" class="px-2 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 text-[10px] font-medium border border-purple-500/20">商业TVC预订</button>
            <button type="button" @click="aiNoticePrompt = '新发布：TikTok 纯实拍短视频剪辑与沉浸式声效设计作品'" class="px-2 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 text-[10px] font-medium border border-purple-500/20">新作品上线</button>
            <button type="button" @click="aiNoticePrompt = '2026 下半年限定折扣与 4K HDR 调色试用优惠开启'" class="px-2 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 text-[10px] font-medium border border-purple-500/20">限时优惠</button>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-black/10">
          <button type="button" @click="showAiNoticeModal = false" class="px-4 py-2 rounded-xl text-xs font-bold border border-black/10 hover:bg-black/5">取消</button>
          <button type="button" @click="confirmAiNoticeGeneration" :disabled="isAiNoticeGenerating" class="btn-primary px-5 py-2 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5 rounded-xl shadow-md">
            <span v-if="isAiNoticeGenerating" class="animate-spin">⏳</span>
            <span>🚀 开始 AI 大模型生成</span>
          </button>
        </div>
      </div>
    </div>

    <!-- AI Interactive Prompt Dialog: Soundscape Music -->
    <div v-if="showAiMusicModal" class="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none">
      <div class="glass-card p-6 rounded-2xl max-w-lg w-full space-y-4 border-2 border-purple-500/30 bg-white/95 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left font-sans">
        <div class="flex items-center justify-between border-b pb-3 border-black/10">
          <div class="flex items-center gap-2">
            <span class="text-lg">🎵</span>
            <h3 class="font-bold text-sm text-[#121316]">AI 律动音效灵感推荐器</h3>
          </div>
          <button type="button" @click="showAiMusicModal = false" class="text-slate-400 hover:text-black font-bold text-sm px-2">✕</button>
        </div>

        <div class="space-y-2 text-xs">
          <label class="font-bold text-slate-700">请输入您希望生成的背景音乐氛围 / 风格曲风：</label>
          <textarea v-model="aiMusicPrompt" rows="3" class="form-input resize-none text-xs leading-relaxed" placeholder="例如：极具科技动感与高级沉浸氛围的赛博律动电子乐..." />
          <div class="flex flex-wrap gap-1.5 pt-1">
            <span class="text-[10px] text-slate-400 font-bold">曲风预设:</span>
            <button type="button" @click="aiMusicPrompt = '赛博朋克极速电子律动 (Cyber Pulse)'" class="px-2 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 text-[10px] font-medium border border-purple-500/20">赛博律动</button>
            <button type="button" @click="aiMusicPrompt = '高级舒缓电影大刊环境音效 (Ambient Film Tone)'" class="px-2 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 text-[10px] font-medium border border-purple-500/20">电影大刊音效</button>
            <button type="button" @click="aiMusicPrompt = '商业 TVC 震撼重低音防盗水印音轨'" class="px-2 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 text-[10px] font-medium border border-purple-500/20">TVC重低音</button>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-black/10">
          <button type="button" @click="showAiMusicModal = false" class="px-4 py-2 rounded-xl text-xs font-bold border border-black/10 hover:bg-black/5">取消</button>
          <button type="button" @click="confirmAiMusicGeneration" :disabled="isAiMusicGenerating" class="btn-primary px-5 py-2 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5 rounded-xl shadow-md">
            <span v-if="isAiMusicGenerating" class="animate-spin">⏳</span>
            <span>🚀 开始 AI 大模型匹配</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 1. Auth check loading spinner -->
    <div v-if="isCheckingAuth" class="max-w-6xl mx-auto py-32 flex flex-col items-center justify-center space-y-4">
      <div class="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style="border-color: var(--color-bronze); border-top-color: transparent;" />
      <p class="text-xs font-mono tracking-widest uppercase" style="color: var(--color-ink-5)">正在验证安全会话...</p>
    </div>

    <!-- 2. Secure Login Panel -->
    <div v-else-if="!isLoggedIn" class="max-w-md mx-auto py-12 space-y-8">
      <div class="glass-card p-8 space-y-6 relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-[2px]" style="background: linear-gradient(90deg, transparent, var(--color-bronze), transparent);" />
        
        <div class="text-center space-y-2">
          <p class="section-label inline-block">Secure Gateway</p>
          <h2 class="font-display text-2xl font-bold tracking-tight" style="color: var(--color-ink-1)">后台系统验证</h2>
          <p class="text-[10px] font-mono uppercase tracking-wider" style="color: var(--color-ink-5)">Enter credentials to manage studio config</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-1.5">
            <label class="form-label font-mono uppercase text-[9px] tracking-wider">输入你的用户名</label>
            <input v-model="loginForm.username" type="text" required class="form-input" placeholder="输入你的用户名" :disabled="loginLoading" />
          </div>

          <div class="space-y-1.5">
            <label class="form-label font-mono uppercase text-[9px] tracking-wider">管理者密码</label>
            <input v-model="loginForm.password" type="password" required class="form-input" placeholder="••••••••" :disabled="loginLoading" />
          </div>

          <div v-if="loginError" class="p-3.5 rounded-xl text-xs flex items-center gap-2 transition-all duration-300" style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); color: #dc2626;">
            <span class="text-sm">⚠️</span>
            <span>{{ loginError }}</span>
          </div>

          <button type="submit" class="btn-primary w-full py-2.5 text-xs font-mono uppercase tracking-widest font-bold mt-2 flex items-center justify-center gap-2" :disabled="loginLoading">
            <span v-if="loginLoading" class="w-3.5 h-3.5 rounded-full border border-t-transparent animate-spin" style="border-color: currentColor; border-top-color: transparent;" />
            <span>{{ loginLoading ? '正在验证认证...' : '验证并登录' }}</span>
          </button>
        </form>
      </div>
    </div>

    <!-- 3. Config Panel (Authenticated) -->
    <div v-else :class="showLivePreview ? 'max-w-[1700px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8' : 'max-w-6xl mx-auto space-y-8'">

      <!-- Left Edit Column -->
      <div class="space-y-8 min-w-0">

      <!-- Header -->
      <div class="space-y-1 pb-4 border-b border-black/[0.05]">
        <p class="section-label">Admin</p>
        <h1 class="font-display text-3xl font-bold tracking-tight" style="color: var(--color-ink-1)">配置工作台</h1>
        <p class="text-xs font-mono uppercase tracking-wider" style="color: var(--color-ink-5)">Xo Studio · Site-Wide Configuration Panel</p>
      </div>

      <!-- Navigation & Action Row -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
        <!-- Tabs Menu (Horizontal Scrollable Capsule) -->
        <div class="flex items-center gap-1 p-1 rounded-xl overflow-x-auto max-w-full whitespace-nowrap scrollbar-none"
             style="background: rgba(140,115,80,0.08); border: 1px solid rgba(160,130,90,0.18); scrollbar-width: none; -ms-overflow-style: none;">
          <button
            v-for="t in tabs"
            :key="t.value"
            @click="activeTab = t.value"
            :class="[
              'relative px-3.5 py-2 rounded-lg text-[11px] font-semibold font-mono uppercase tracking-wider transition-all duration-300 ease-out flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 active:scale-95',
              activeTab === t.value
                ? 'bg-white shadow-sm font-bold scale-[1.02] tab-pill-active'
                : 'hover:bg-black/[0.03] hover:text-[#121316]'
            ]"
            :style="activeTab === t.value
              ? { color: 'var(--color-ink-1)', border: '1px solid rgba(180,150,110,0.3)' }
              : { color: 'var(--color-ink-4)', border: '1px solid transparent' }"
          >
            <span class="transition-transform duration-300 hover:rotate-12">{{ t.icon }}</span>{{ t.label }}
          </button>
        </div>

        <!-- Right Side Quick Actions -->
        <div class="flex items-center gap-3 flex-shrink-0 self-end lg:self-auto">
          <button @click="showLivePreview = !showLivePreview"
                  :class="[
                    'px-3.5 py-2 rounded-lg text-[11px] font-semibold font-mono uppercase tracking-wider transition-all duration-200 flex-shrink-0',
                    showLivePreview
                      ? 'bg-amber-700 text-white border border-amber-800 shadow-sm'
                      : 'hover:text-amber-700'
                  ]"
                  :style="showLivePreview
                    ? {}
                    : { color: 'var(--color-ink-4)', border: '1px solid var(--color-border-2)', background: 'transparent' }">
            {{ showLivePreview ? '关闭双屏' : '👁️ 双屏预览' }}
          </button>
          <button @click="handleLogout" class="px-3.5 py-2 rounded-lg text-[11px] font-semibold font-mono uppercase tracking-wider transition-all duration-200 hover:text-rose-500 hover:border-rose-500/30 flex-shrink-0"
                  style="color: var(--color-ink-4); border: 1px solid var(--color-border-2); background: transparent;">
            安全退出
          </button>
        </div>
      </div>

      <!-- Tab Content with Smooth Gliding Transition -->
      <div class="relative min-h-[400px]">
        <Transition name="tab-fade-slide" mode="out-in">
          <div v-if="activeTab === 'analytics'" key="analytics" class="space-y-6">
            <!-- TAB 0: ANALYTICS DASHBOARD -->
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold font-display" style="color: var(--color-ink-1)">系统监控与流量看板</h2>
              <p class="text-xs font-mono mt-0.5" style="color: var(--color-ink-5)">实时追踪个人主页的访客行为、点击路径与服务器性能。</p>
            </div>
            <div class="flex items-center gap-3">
              <button @click="fetchSystemStatus" class="text-xs font-mono px-3 py-1.5 rounded-lg transition-colors hover:bg-black/5" style="color: var(--color-ink-4); border: 1px solid var(--color-border)">
                🔄 刷新数据
              </button>
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider bg-emerald-50 border border-emerald-100 text-emerald-700">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                LIVE
              </div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <!-- Today PV -->
            <div class="glass-card p-5 flex flex-col gap-3">
              <div class="flex justify-between items-start">
                <span class="text-[9px] font-mono uppercase tracking-wider" style="color: var(--color-ink-5)">今日 PV</span>
                <span class="text-sm bg-amber-50 rounded-md px-1.5">📈</span>
              </div>
              <div>
                <div class="text-3xl font-display font-bold tabular-nums" style="color: var(--color-ink-1)">{{ systemStatus.todayViews }}</div>
                <div class="text-[10px] font-mono mt-0.5" :class="systemStatus.todayViews >= systemStatus.yesterdayViews ? 'text-emerald-600' : 'text-rose-500'">
                  {{ systemStatus.todayViews >= systemStatus.yesterdayViews ? '▲' : '▼' }}
                  较昨日 {{ systemStatus.yesterdayViews }} 次
                </div>
              </div>
              <!-- Live sparkline from real trend data -->
              <svg class="w-full h-7" viewBox="0 0 60 14" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="sg1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--color-bronze)" stop-opacity="0.4"/>
                    <stop offset="100%" stop-color="var(--color-bronze)" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <template v-if="sparkPoints.length >= 2">
                  <path :d="sparkFillPath" fill="url(#sg1)"/>
                </template>
              </svg>
            </div>

            <!-- 7-day total -->
            <div class="glass-card p-5 flex flex-col gap-3">
              <div class="flex justify-between items-start">
                <span class="text-[9px] font-mono uppercase tracking-wider" style="color: var(--color-ink-5)">7日累计</span>
                <span class="text-sm bg-amber-50 rounded-md px-1.5">📊</span>
              </div>
              <div>
                <div class="text-3xl font-display font-bold tabular-nums" style="color: var(--color-ink-1)">{{ systemStatus.weekViews }}</div>
                <div class="text-[10px] font-mono mt-0.5" style="color: var(--color-ink-5)">全部时间 {{ systemStatus.allTimeViews }} 次</div>
              </div>
            </div>

            <!-- Contact clicks -->
            <div class="glass-card p-5 flex flex-col gap-3">
              <div class="flex justify-between items-start">
                <span class="text-[9px] font-mono uppercase tracking-wider" style="color: var(--color-ink-5)">咨询点击 (7天)</span>
                <span class="text-sm bg-amber-50 rounded-md px-1.5">✉️</span>
              </div>
              <div>
                <div class="text-3xl font-display font-bold tabular-nums" style="color: var(--color-ink-1)">{{ systemStatus.contactClicks }}</div>
                <div class="text-[10px] font-mono mt-0.5 text-emerald-600">真实点击追踪</div>
              </div>
            </div>

            <!-- Server latency -->
            <div class="glass-card p-5 flex flex-col gap-3">
              <div class="flex justify-between items-start">
                <span class="text-[9px] font-mono uppercase tracking-wider" style="color: var(--color-ink-5)">响应延迟</span>
                <span class="text-sm bg-amber-50 rounded-md px-1.5">⚡</span>
              </div>
              <div>
                <div class="text-3xl font-display font-bold tabular-nums" style="color: var(--color-ink-1)">{{ systemStatus.latency }}</div>
                <div class="text-[10px] font-mono mt-0.5 text-emerald-600">● {{ systemStatus.status }}</div>
              </div>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- 7-day trend chart -->
            <div class="glass-card p-6 space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono uppercase tracking-wider" style="color: var(--color-ink-5)">近 7 日页面浏览量 (Page Views)</span>
                <span class="text-xs font-mono font-bold" style="color: var(--color-bronze)">{{ systemStatus.weekViews }} total</span>
              </div>
              <div class="relative w-full h-40">
                <!-- Y axis labels -->
                <div class="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[8px] font-mono" style="color: var(--color-ink-5)">
                  <span>{{ chartMaxY }}</span>
                  <span>{{ Math.round(chartMaxY / 2) }}</span>
                  <span>0</span>
                </div>
                <div class="absolute left-6 right-0 top-0 bottom-6">
                  <svg class="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="var(--color-bronze)" stop-opacity="0.18"/>
                        <stop offset="100%" stop-color="var(--color-bronze)" stop-opacity="0"/>
                      </linearGradient>
                    </defs>
                    <!-- Grid lines -->
                    <line x1="0" y1="0" x2="300" y2="0" stroke="rgba(0,0,0,0.04)" stroke-width="1"/>
                    <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(0,0,0,0.04)" stroke-width="1"/>
                    <line x1="0" y1="100" x2="300" y2="100" stroke="rgba(0,0,0,0.04)" stroke-width="1"/>
                    <!-- Trend line -->
                    <path v-if="chartPath" :d="chartPath" fill="none" stroke="var(--color-bronze)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path v-if="chartAreaPath" :d="chartAreaPath" fill="url(#chart-grad)"/>
                    <!-- Data points -->
                    <template v-if="chartPoints.length">
                      <circle v-for="(pt, i) in chartPoints" :key="i" :cx="pt.x" :cy="pt.y" r="3.5"
                        fill="var(--color-bronze)" stroke="white" stroke-width="1.5"/>
                    </template>
                  </svg>
                </div>
                <!-- X axis labels -->
                <div class="absolute left-6 right-0 bottom-0 flex justify-between text-[8px] font-mono" style="color: var(--color-ink-5)">
                  <span v-for="d in systemStatus.trend" :key="d.date">{{ d.label }}</span>
                </div>
              </div>
            </div>

            <!-- Referral breakdown (real data, fallback to direct) -->
            <div class="glass-card p-6 space-y-4">
              <span class="text-[10px] font-mono uppercase tracking-wider" style="color: var(--color-ink-5)">访客来源渠道 (Referral Sources)</span>
              <div class="space-y-3 pt-1">
                <div v-for="(ref, i) in systemStatus.referrals" :key="i" class="space-y-1">
                  <div class="flex justify-between text-xs">
                    <span class="font-medium truncate max-w-[200px]" style="color: var(--color-ink-2)">{{ ref.label }}</span>
                    <span class="font-mono font-bold ml-2 flex-shrink-0" style="color: var(--color-ink-1)">{{ ref.pct }}%</span>
                  </div>
                  <div class="h-1.5 w-full rounded-full overflow-hidden" style="background: rgba(0,0,0,0.04)">
                    <div class="h-full rounded-full transition-all duration-700"
                      :style="{ background: `var(--color-bronze)`, opacity: 1 - i * 0.18, width: ref.pct + '%' }"/>
                  </div>
                </div>
                <p v-if="!systemStatus.referrals?.length" class="text-xs font-mono py-4 text-center" style="color: var(--color-ink-5)">
                  暂无来源数据。待访客从外部链接点击进入后将自动统计。
                </p>
              </div>
            </div>
          </div>

          <!-- Bottom Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Project clicks ranking -->
            <div class="glass-card p-6 space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono uppercase tracking-wider" style="color: var(--color-ink-5)">🔥 作品点击热度排行 (Top Engagement)</span>
                <button @click="fetchSystemStatus" class="text-[10px] font-mono px-2 py-1 rounded bg-black/5 hover:bg-amber-600/10 hover:text-amber-800 transition-all flex items-center gap-1" style="color: var(--color-ink-4)" title="立刻刷新最新数据">
                  <span>🔄</span> 实时刷新
                </button>
              </div>
              <div class="space-y-3.5">
                <template v-if="systemStatus.projectClicks?.length">
                  <div v-for="(p, i) in systemStatus.projectClicks" :key="p.slug + '-' + p.clicks" class="space-y-1">
                    <div class="flex justify-between text-xs items-center">
                      <div class="flex items-center gap-2 truncate max-w-[220px]">
                        <span class="font-mono font-bold text-[9px] px-1.5 py-0.5 rounded bg-amber-700/10 text-amber-800 border border-amber-700/20 flex-shrink-0">TOP {{ i + 1 }}</span>
                        <span class="font-medium truncate" style="color: var(--color-ink-2)">{{ p.title || p.slug }}</span>
                      </div>
                      <span class="font-mono font-bold ml-2 flex-shrink-0 text-amber-800 text-xs">{{ p.clicks }} 次点击</span>
                    </div>
                    <div class="h-2 w-full rounded-full overflow-hidden" style="background: rgba(0,0,0,0.04)">
                      <div class="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-500 transition-all duration-700"
                        :style="{ width: Math.max(8, Math.round((p.clicks / (systemStatus.projectClicks[0].clicks || 1)) * 100)) + '%' }"/>
                    </div>
                  </div>
                </template>
                <p v-else class="text-xs font-mono py-8 text-center" style="color: var(--color-ink-5)">
                  暂无点击记录。访客点击作品后将在此实时显示。
                </p>
              </div>
            </div>

            <!-- System specs -->
            <div class="glass-card p-6 space-y-4">
              <span class="text-[10px] font-mono uppercase tracking-wider" style="color: var(--color-ink-5)">服务器环境规格 (System Specs)</span>
              <div class="divide-y text-xs font-mono" style="divide-color: var(--color-border)">
                <div class="py-2.5 flex justify-between">
                  <span style="color: var(--color-ink-4)">操作系统</span>
                  <span class="font-bold truncate max-w-[220px]" style="color: var(--color-ink-1)">{{ systemStatus.serverOs || 'Unknown OS' }}</span>
                </div>
                <div class="py-2.5 flex justify-between">
                  <span style="color: var(--color-ink-4)">处理器 (CPU)</span>
                  <span class="font-bold truncate max-w-[220px]" style="color: var(--color-ink-1)">{{ systemStatus.serverCpu || 'Unknown CPU' }}</span>
                </div>
                <div class="py-2.5 flex justify-between">
                  <span style="color: var(--color-ink-4)">物理内存 (RAM)</span>
                  <span class="font-bold" style="color: var(--color-ink-1)">{{ systemStatus.serverRam || '—' }}</span>
                </div>
                <div class="py-2.5 flex justify-between">
                  <span style="color: var(--color-ink-4)">系统运行时间</span>
                  <span class="font-bold" style="color: var(--color-ink-1)">{{ systemStatus.serverUptime || '—' }}</span>
                </div>
                <div class="py-2.5 flex justify-between">
                  <span style="color: var(--color-ink-4)">主磁盘空间 (Disk)</span>
                  <span class="font-bold" style="color: var(--color-ink-1)">{{ systemStatus.serverDisk || '150.0 GB' }}</span>
                </div>
                <div class="py-2.5 flex justify-between">
                  <span style="color: var(--color-ink-4)">存储引擎</span>
                  <span class="font-bold text-emerald-600">{{ systemStatus.engine }}</span>
                </div>
                <div class="py-2.5 flex justify-between">
                  <span style="color: var(--color-ink-4)">SSL 证书</span>
                  <span class="font-bold" style="color: var(--color-ink-1)">{{ systemStatus.ssl }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>


          <div v-else-if="activeTab === 'requests'" key="requests" class="space-y-6">
            <!-- TAB 1.5: PASSWORD REQUESTS -->
          <div class="glass-card p-6 flex items-center justify-between">
            <div class="space-y-1">
              <span class="text-[10px] font-mono uppercase tracking-wider" style="color: var(--color-ink-5)">密码获取申请</span>
              <div class="text-2xl font-display font-bold" style="color: var(--color-ink-1)">
                {{ passwordRequests.length }} <span class="text-sm font-normal" style="color: var(--color-ink-5)">条记录</span>
              </div>
            </div>
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: var(--color-bronze-bg)">🔑</div>
          </div>

          <div class="glass-card overflow-hidden">
            <div class="p-6 border-b" style="border-color: var(--color-border)">
              <h3 class="font-display font-bold text-sm" style="color: var(--color-ink-1)">申请列表</h3>
              <p class="text-xs mt-1" style="color: var(--color-ink-4)">这里展示了访客在前台申请获取作品密码的联系方式，您可以直接在此查看并联系他们提供密码。</p>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="text-[10px] font-mono uppercase tracking-wider border-b" style="color: var(--color-ink-4); border-color: var(--color-border); background: rgba(0,0,0,0.01)">
                    <th class="py-3.5 px-6 font-semibold">客户姓名 / 机构</th>
                    <th class="py-3.5 px-6 font-semibold">联系方式 (微信/邮箱)</th>
                    <th class="py-3.5 px-6 font-semibold">申请解锁作品</th>
                    <th class="py-3.5 px-6 font-semibold">申请时间</th>
                    <th class="py-3.5 px-6 font-semibold">审核状态</th>
                    <th class="py-3.5 px-6 font-semibold text-right">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y text-xs" style="divide-color: var(--color-border)">
                  <tr v-if="passwordRequests.length === 0">
                    <td colspan="6" class="py-12 text-center" style="color: var(--color-ink-5)">
                      <span class="text-2xl block mb-2">📥</span>
                      暂无专属授权密码申请记录。
                    </td>
                  </tr>
                  <tr v-for="r in passwordRequests" :key="r.id" class="hover:bg-black/[0.01] transition-colors">
                    <td class="py-4 px-6 font-bold" style="color: var(--color-ink-1)">{{ r.clientName }}</td>
                    <td class="py-4 px-6 font-mono" style="color: var(--color-ink-2)">{{ r.contact }}</td>
                    <td class="py-4 px-6">
                      <span class="font-semibold" style="color: var(--color-ink-3)">{{ r.projectTitle }}</span>
                      <span class="block text-[10px] font-mono opacity-50">/projects/{{ r.projectSlug }}</span>
                      <div v-if="r.reason" class="mt-1.5 text-[10px] leading-relaxed p-2 rounded-lg border border-black/[0.04] bg-black/[0.01]" style="color: var(--color-ink-3)">
                        <span class="font-bold text-amber-700">申请理由：</span>{{ r.reason }}
                      </div>
                      <div class="mt-1.5 text-[10px] font-mono" style="color: var(--color-ink-5)">
                        解锁密码：<span class="font-bold text-amber-800 bg-amber-600/10 px-1.5 py-0.5 rounded">{{ getProjectPassword(r.projectSlug) || '未设置密码/免费公开' }}</span>
                      </div>
                    </td>
                    <td class="py-4 px-6" style="color: var(--color-ink-4)">
                      {{ new Date(r.createdAt).toLocaleString('zh-CN', { hour12: false }) }}
                    </td>
                    <td class="py-4 px-6">
                      <span v-if="r.status === 'approved'" class="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-700">🟢 已通过 (自动授权)</span>
                      <span v-else-if="r.isBlacklisted || r.isAutoBlacklisted" class="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-700">🔴 待审核 (防刷/黑名单)</span>
                      <span v-else-if="r.status === 'rejected'" class="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-700">🔴 已拒绝</span>
                      <span v-else class="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-700">🟡 待手动审核</span>
                    </td>
                    <td class="py-4 px-6 text-right space-x-3">
                      <button
                        v-if="!r.status || r.status === 'pending'"
                        type="button"
                        @click="updateRequestStatus(r.id, 'approved')"
                        class="text-emerald-600 hover:text-emerald-500 font-bold hover:underline"
                      >
                        通过
                      </button>
                      <button
                        v-if="!r.status || r.status === 'pending'"
                        type="button"
                        @click="updateRequestStatus(r.id, 'rejected')"
                        class="text-amber-700 hover:text-amber-850 font-bold hover:underline"
                      >
                        拒绝
                      </button>
                      <button
                        v-if="r.status === 'approved'"
                        type="button"
                        @click="copyShareText(r)"
                        class="text-emerald-600 hover:text-emerald-500 font-bold hover:underline"
                      >
                        📋 复制通知模板
                      </button>
                      <button
                        type="button"
                        @click="toggleBlacklistRequestContact(r)"
                        :class="r.isBlacklisted || r.isAutoBlacklisted ? 'text-emerald-600 font-bold hover:underline' : 'text-rose-500 font-bold hover:underline'"
                      >
                        {{ r.isBlacklisted || r.isAutoBlacklisted ? '✅ 解除拉黑' : '🚫 拉黑该联系人' }}
                      </button>
                      <button
                        type="button"
                        @click="deletePasswordRequest(r.id)"
                        class="text-slate-400 hover:text-rose-400 font-medium hover:underline"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

          <div v-else-if="activeTab === 'users'" key="users" class="space-y-6">
            <!-- TAB 1.6: REGISTERED USERS -->
          <div class="glass-card p-6 flex items-center justify-between">
            <div class="space-y-1">
              <span class="text-[10px] font-mono uppercase tracking-wider" style="color: var(--color-ink-5)">注册客户账号</span>
              <div class="text-2xl font-display font-bold" style="color: var(--color-ink-1)">
                {{ registeredUsers.length }} <span class="text-sm font-normal" style="color: var(--color-ink-5)">个账号</span>
              </div>
            </div>
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: var(--color-bronze-bg)">👥</div>
          </div>

          <div class="glass-card overflow-hidden">
            <div class="p-6 border-b" style="border-color: var(--color-border)">
              <h3 class="font-display font-bold text-sm" style="color: var(--color-ink-1)">注册客户列表</h3>
              <p class="text-xs mt-1" style="color: var(--color-ink-4)">以下是所有在前台注册了客户账号的用户，您可以为他们发放专属的加密作品授权密码。</p>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="text-[10px] font-mono uppercase tracking-wider border-b" style="color: var(--color-ink-4); border-color: var(--color-border); background: rgba(0,0,0,0.01)">
                    <th class="py-3.5 px-6 font-semibold">客户用户名</th>
                    <th class="py-3.5 px-6 font-semibold">电子邮箱</th>
                    <th class="py-3.5 px-6 font-semibold">微信号</th>
                    <th class="py-3.5 px-6 font-semibold">角色级别</th>
                    <th class="py-3.5 px-6 font-semibold">风控模式</th>
                    <th class="py-3.5 px-6 font-semibold">注册时间</th>
                    <th class="py-3.5 px-6 font-semibold text-right">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y text-xs" style="divide-color: var(--color-border)">
                  <tr v-if="registeredUsers.length === 0">
                    <td colspan="7" class="py-12 text-center" style="color: var(--color-ink-5)">
                      <span class="text-2xl block mb-2">👥</span>
                      暂无注册客户账号。
                    </td>
                  </tr>
                  <tr v-for="u in registeredUsers" :key="u.id" class="hover:bg-black/[0.01] transition-colors">
                    <td class="py-4 px-6 font-bold" style="color: var(--color-ink-1)">{{ u.username }}</td>
                    <td class="py-4 px-6 font-mono" style="color: var(--color-ink-2)">{{ u.email || '—' }}</td>
                    <td class="py-4 px-6 font-mono" style="color: var(--color-ink-2)">{{ u.wechat || '—' }}</td>
                    <td class="py-4 px-6">
                      <span class="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-amber-700/5 text-amber-800 border border-amber-700/10">
                        {{ u.role }}
                      </span>
                    </td>
                    <td class="py-4 px-6">
                      <span v-if="u.isWhitelisted" class="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-800 flex items-center gap-1 w-max">
                        ⭐ 白名单 (防刷豁免)
                      </span>
                      <span v-else-if="u.isBlacklisted" class="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 border border-rose-500/30 text-rose-700 flex items-center gap-1 w-max">
                        🚫 已拉黑 (手动审核)
                      </span>
                      <span v-else class="px-2 py-0.5 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center gap-1 w-max">
                        🟢 正常
                      </span>
                    </td>
                    <td class="py-4 px-6" style="color: var(--color-ink-4)">
                      {{ new Date(u.createdAt).toLocaleString('zh-CN', { hour12: false }) }}
                    </td>
                    <td class="py-4 px-6 text-right space-x-3">
                      <button
                        type="button"
                        @click="toggleUserWhitelist(u)"
                        class="text-amber-700 hover:text-amber-800 font-bold hover:underline"
                      >
                        {{ u.isWhitelisted ? '取消白名单' : '⭐ 设为白名单' }}
                      </button>
                      <button
                        type="button"
                        @click="toggleUserBlacklist(u)"
                        :class="u.isBlacklisted ? 'text-emerald-600 font-bold hover:underline' : 'text-rose-500 font-bold hover:underline'"
                      >
                        {{ u.isBlacklisted ? '✅ 解除拉黑' : '🚫 拉黑用户' }}
                      </button>
                      <button
                        type="button"
                        @click="openEditUserModal(u)"
                        class="text-slate-600 hover:text-slate-900 font-medium hover:underline"
                      >
                        权限
                      </button>
                      <button
                        type="button"
                        @click="deleteUser(u.id)"
                        class="text-slate-400 hover:text-rose-400 font-medium hover:underline"
                      >
                        注销
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

          <div v-else-if="activeTab === 'projects'" key="projects" class="space-y-6">
            <!-- TAB 1: PROJECTS -->
          <!-- Stats -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div class="glass-card p-6 flex items-center justify-between">
              <div class="space-y-1">
                <span class="text-[10px] font-mono uppercase tracking-wider" style="color: var(--color-ink-5)">作品总数</span>
                <div class="text-2xl font-display font-bold" style="color: var(--color-ink-1)">{{ projectsList.length }} <span class="text-sm font-normal" style="color: var(--color-ink-5)">CLIPS</span></div>
              </div>
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: var(--color-bronze-bg)">🎬</div>
            </div>
            <div class="glass-card p-6 flex items-center justify-between">
              <div class="space-y-1">
                <span class="text-[10px] font-mono uppercase tracking-wider" style="color: var(--color-ink-5)">精选置顶</span>
                <div class="text-2xl font-display font-bold" style="color: var(--color-ink-1)">{{ featuredCount }} <span class="text-sm font-normal" style="color: var(--color-ink-5)">CLIPS</span></div>
              </div>
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: var(--color-bronze-bg)">✨</div>
            </div>
            <div class="glass-card p-6 flex items-center justify-between">
              <div class="space-y-1">
                <span class="text-[10px] font-mono uppercase tracking-wider" style="color: var(--color-ink-5)">色彩规格</span>
                <div class="text-xl font-display font-bold" style="color: var(--color-ink-1)">DaVinci ACES</div>
              </div>
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: var(--color-bronze-bg)">🎨</div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-between items-center pt-2">
            <h2 class="font-display text-lg font-bold" style="color: var(--color-ink-1)">视频项目列表</h2>
            <button @click="openCreateModal" class="btn-primary py-2 px-4 text-xs">录入新作品</button>
          </div>

          <!-- Table -->
          <div class="glass-card overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="text-[9px] font-mono uppercase tracking-wider" style="background: rgba(0,0,0,0.02); border-bottom: 1px solid var(--color-border); color: var(--color-ink-5)">
                    <th class="py-3.5 px-4 text-center w-28 whitespace-nowrap">
                      <span class="text-[10px] font-mono tracking-wider uppercase" style="color: var(--color-ink-5)">序号 / 排序</span>
                    </th>
                    <th class="py-3.5 px-6">作品预览 & 标题</th>
                    <th class="py-3.5 px-6 hidden md:table-cell">链接路径</th>
                    <th class="py-3.5 px-6 hidden sm:table-cell">后期软件</th>
                    <th class="py-3.5 px-6">精选</th>
                    <th class="py-3.5 px-6 text-right">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y text-xs font-sans" style="divide-color: var(--color-border)">
                  <tr
                    v-for="(p, i) in projectsList"
                    :key="p.slug"
                    @dragover.prevent="onDragOver(i)"
                    @drop="onDrop"
                    :class="[
                      'hover:bg-amber-500/[0.04] transition-colors group/row',
                      draggedProjectIndex === i ? 'opacity-40 bg-amber-100/50' : ''
                    ]"
                  >
                    <!-- Leftmost Direct Editable Column (≡ Drag Handle ONLY + Non-Draggable Number Input) -->
                    <td class="py-3.5 px-4 text-center">
                      <div class="inline-flex items-center justify-center gap-1 p-1 rounded-xl bg-black/[0.02] border border-black/[0.06] group-hover/row:border-amber-600/30 group-hover/row:bg-amber-500/5 transition-all select-none">
                        <!-- ONLY THIS HANDLE IS DRAGGABLE! -->
                        <span
                          draggable="true"
                          @dragstart="onDragStart(i, $event)"
                          class="cursor-grab active:cursor-grabbing text-slate-400 group-hover/row:text-amber-700 font-bold text-sm px-1.5 py-0.5 rounded hover:bg-amber-500/10 transition-colors"
                          title="按住 ≡ 拖拽此行调整顺序"
                        >
                          ≡
                        </span>

                        <!-- INPUT BOX: EXPLICITLY NON-DRAGGABLE! -->
                        <input
                          type="text"
                          draggable="false"
                          @mousedown.stop
                          @dragstart.prevent.stop
                          :value="p.displayNumber || (p.sortOrder ? (p.sortOrder < 10 ? `0${p.sortOrder}` : `${p.sortOrder}`) : (i + 1 < 10 ? `0${i + 1}` : `${i + 1}`))"
                          @change="updateProjectNumber(p, i, $event)"
                          @keydown.enter.prevent="($event.target as HTMLElement).blur()"
                          class="w-11 h-7 text-center font-mono font-bold text-xs rounded-md bg-white border border-amber-900/15 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-amber-900 shadow-2xs transition-all cursor-text"
                          title="点击可直接输入修改序号或海报数字（如 01, 02 或 1, 2）"
                        />

                        <!-- Up/Down buttons -->
                        <div class="flex flex-col gap-0.5 opacity-60 group-hover/row:opacity-100 transition-opacity pr-0.5" @mousedown.stop>
                          <button type="button" @click.stop="moveProjectUp(i)" :disabled="i === 0" class="text-[8px] text-slate-400 hover:text-amber-700 disabled:opacity-20 leading-none p-0.5 hover:bg-amber-100 rounded transition-all" title="向上移">▲</button>
                          <button type="button" @click.stop="moveProjectDown(i)" :disabled="i === projectsList.length - 1" class="text-[8px] text-slate-400 hover:text-amber-700 disabled:opacity-20 leading-none p-0.5 hover:bg-amber-100 rounded transition-all" title="向下移">▼</button>
                        </div>
                      </div>
                    </td>

                    <td class="py-4 px-6 flex items-center gap-4 min-w-[260px]">
                      <div class="w-14 h-9 rounded-lg overflow-hidden flex-shrink-0" style="background: var(--color-bg-2); border: 1px solid var(--color-border)">
                        <img :src="p.image" class="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <div class="font-semibold font-display text-sm group-hover/row:text-amber-700 transition-colors" style="color: var(--color-ink-1)">{{ p.title }}</div>
                        <div class="text-[11px] line-clamp-1 mt-0.5" style="color: var(--color-ink-5)">{{ p.description }}</div>
                      </div>
                    </td>
                    <td class="py-4 px-6 hidden md:table-cell font-mono" style="color: var(--color-ink-4)">/projects/{{ p.slug }}</td>
                    <td class="py-4 px-6 hidden sm:table-cell">
                      <div class="flex flex-wrap gap-1">
                        <span v-for="s in p.software" :key="s" class="badge text-[9px]">{{ s }}</span>
                      </div>
                    </td>
                    <td class="py-4 px-6">
                      <span v-if="p.featured" class="badge">FEATURED</span>
                      <span v-else style="color: var(--color-ink-5)">—</span>
                    </td>
                    <td class="py-4 px-6 text-right">
                      <div class="flex items-center justify-end gap-4 font-mono text-[11px]">
                        <button @click="openEditModal(p)" class="font-bold transition-colors hover:text-amber-700" style="color: var(--color-ink-1)">编辑</button>
                        <button @click="deleteProject(p.slug)" class="font-bold text-rose-500 hover:text-rose-400 transition-colors">删除</button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="projectsList.length === 0">
                    <td colspan="6" class="py-12 text-center font-mono text-xs" style="color: var(--color-ink-5)">暂无作品，点击"录入新作品"开始添加。</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

          <div v-else-if="activeTab === 'home'" key="home" class="glass-card p-8 space-y-8">
            <!-- TAB 2: HOME HERO CONFIG -->
          <div class="flex items-center justify-between pb-5" style="border-bottom: 1px solid var(--color-border)">
            <div>
              <h2 class="text-base font-semibold font-display" style="color: var(--color-ink-1)">首页 Hero 与数据看板配置</h2>
              <p class="text-xs font-mono mt-0.5" style="color: var(--color-ink-5)">编辑首页大标题、副文案、统计指标和个人磁贴卡片。</p>
            </div>
            <button @click="saveSiteConfig" class="btn-primary text-xs py-2 px-5">保存首页配置</button>
          </div>
          <div class="grid md:grid-cols-2 gap-8 items-start">
            <div class="space-y-6">
              <!-- Hero Titles -->
              <div class="space-y-2">
                <label class="form-label">Hero 大标题（3 行）</label>
                <div class="space-y-3">
                  <input v-model="siteConfig.home.heroTitle1" class="form-input" placeholder="第一行" />
                  <input v-model="siteConfig.home.heroTitle2" class="form-input" placeholder="第二行（斜体高亮行）" />
                  <input v-model="siteConfig.home.heroTitle3" class="form-input" placeholder="第三行" />
                </div>
              </div>
              <!-- Hero Subtitle -->
              <div class="space-y-1.5">
                <label class="form-label">Hero 副文案段落</label>
                <textarea v-model="siteConfig.home.heroSub" rows="3" class="form-input resize-none" />
              </div>
              <!-- Booking Status & Video Showreel -->
              <div class="space-y-4 pt-4" style="border-top: 1px solid var(--color-border)">
                <h3 class="text-xs font-mono font-semibold uppercase tracking-wider" style="color: var(--color-ink-3)">业务状态与首屏主样片</h3>
                <div class="space-y-1.5">
                  <label class="form-label">业务合作状态 (Booking Status)</label>
                  <input v-model="siteConfig.home.bookingStatus" class="form-input" placeholder="Booking Open (2026)" />
                </div>
                <div class="grid sm:grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label class="form-label">背景样片视频 MP4 URL</label>
                    <input v-model="siteConfig.home.heroVideoUrl" class="form-input font-mono" placeholder="https://..." />
                  </div>
                   <div class="space-y-1.5">
                    <label class="form-label">背景样片封面图片 URL</label>
                    <div class="flex gap-2">
                      <input v-model="siteConfig.home.heroVideoPoster" class="form-input font-mono flex-1" placeholder="https://..." />
                      <label class="btn-ghost text-xs py-2 px-4 cursor-pointer flex items-center justify-center border border-dashed rounded-xl" style="border-color: var(--color-border-2); background: transparent;">
                        <span>📤 上传</span>
                        <input type="file" accept="image/*" class="hidden" @change="uploadHeroPoster" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Stats -->
              <div class="grid sm:grid-cols-2 gap-4">
                <div class="p-4 rounded-xl space-y-3" style="background: rgba(0,0,0,0.02); border: 1px solid var(--color-border)">
                  <span class="text-[9px] font-mono uppercase" style="color: var(--color-ink-5)">数据指标 1</span>
                  <input v-model="siteConfig.home.statValue1" class="form-input font-mono font-bold" placeholder="120+" />
                  <input v-model="siteConfig.home.statLabel1" class="form-input text-[10px]" placeholder="剪辑交付量" />
                </div>
                <div class="p-4 rounded-xl space-y-3" style="background: rgba(0,0,0,0.02); border: 1px solid var(--color-border)">
                  <span class="text-[9px] font-mono uppercase" style="color: var(--color-ink-5)">数据指标 2</span>
                  <input v-model="siteConfig.home.statValue2" class="form-input font-mono font-bold" placeholder="4K HDR" />
                  <input v-model="siteConfig.home.statLabel2" class="form-input text-[10px]" placeholder="高规格支持" />
                </div>
              </div>

              <!-- Homepage Featured Projects Selector -->
              <div class="space-y-4 pt-4" style="border-top: 1px solid var(--color-border)">
                <h3 class="text-xs font-mono font-semibold uppercase tracking-wider" style="color: var(--color-ink-3)">首页卡片大图作品展示</h3>
                <p class="text-[10px] text-amber-700 leading-relaxed font-sans font-semibold">您可以指定在首页 Bento 磁贴网格上展示的两个核心作品。如果不指定，则会自动默认取作品库中排在前两位的作品。</p>
                <div class="grid sm:grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label class="form-label">首页作品位置一 (大图 1)</label>
                    <select v-model="siteConfig.home.featuredProject1" class="form-input">
                      <option value="">-- 默认使用第一部作品 --</option>
                      <option v-for="p in projectsList" :key="p.slug" :value="p.slug">
                        🎬 {{ p.title }} ({{ p.slug }})
                      </option>
                    </select>
                  </div>
                  <div class="space-y-1.5">
                    <label class="form-label">首页作品位置二 (大图 2)</label>
                    <select v-model="siteConfig.home.featuredProject2" class="form-input">
                      <option value="">-- 默认使用第二部作品 --</option>
                      <option v-for="p in projectsList" :key="p.slug" :value="p.slug">
                        🎬 {{ p.title }} ({{ p.slug }})
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <!-- Profile Card -->
              <div class="space-y-4 pt-4" style="border-top: 1px solid var(--color-border)">
                <h3 class="text-xs font-mono font-semibold uppercase tracking-wider" style="color: var(--color-ink-3)">个人磁贴卡片 (Profile Card)</h3>
                <div class="grid sm:grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label class="form-label">卡片姓名</label>
                    <input v-model="siteConfig.home.profileCardTitle" class="form-input" />
                  </div>
                  <div class="space-y-1.5">
                    <label class="form-label">卡片职位</label>
                    <input v-model="siteConfig.home.profileCardSub" class="form-input" />
                  </div>
                </div>
                <div class="space-y-1.5">
                  <label class="form-label">卡片描述</label>
                  <textarea v-model="siteConfig.home.profileCardDesc" rows="3" class="form-input resize-none" />
                </div>
                
                <div class="space-y-1.5 pt-2">
                  <label class="form-label flex justify-between">
                    <span>个人头像图片 (Avatar Image)</span>
                    <span class="text-[9px] text-amber-700 font-bold">支持链接地址或本地设备上传</span>
                  </label>
                  <div class="flex gap-2">
                    <input v-model="siteConfig.siteInfo.avatar" class="form-input font-mono flex-1 text-xs" placeholder="https://... 或上传本地文件" />
                    <label class="btn-ghost text-xs py-2 px-4 cursor-pointer flex items-center justify-center border border-dashed rounded-xl flex-shrink-0" style="border-color: var(--color-border-2); background: transparent;">
                      <span>📤 上传</span>
                      <input type="file" accept="image/*" class="hidden" @change="uploadAvatarFile" />
                    </label>
                  </div>
                  <!-- Avatar Preview -->
                  <div v-if="siteConfig.siteInfo.avatar" class="flex items-center gap-3 pt-2">
                    <div class="w-10 h-10 rounded-full overflow-hidden border border-black/10 flex-shrink-0">
                      <img :src="siteConfig.siteInfo.avatar" class="w-full h-full object-cover" />
                    </div>
                    <span class="text-[10px] font-mono text-slate-400">预览当前头像</span>
                    <button type="button" @click="siteConfig.siteInfo.avatar = ''" class="text-[10px] font-bold text-rose-500 hover:underline ml-auto">清除头像</button>
                  </div>
                </div>
              </div>
              <!-- Skills Tags -->
              <div class="space-y-2 pt-4" style="border-top: 1px solid var(--color-border)">
                <h3 class="text-xs font-mono font-semibold uppercase tracking-wider" style="color: var(--color-ink-3)">工具技能标签</h3>
                <div class="flex flex-wrap gap-1.5 p-2 rounded-xl min-h-[42px] items-center"
                     style="background: rgba(255,255,255,0.8); border: 1px solid var(--color-border-2)">
                  <span v-for="tag in siteConfig.home.skillsTags" :key="tag" class="badge inline-flex items-center gap-1">
                    {{ tag }}
                    <button type="button" @click="removeSkillsTag(tag)" class="ml-1 opacity-60 hover:opacity-100 font-bold text-xs">×</button>
                  </span>
                  <input v-model="tempSkillsTagInput" @keydown.enter.prevent="addSkillsTag" @keydown.comma.prevent="addSkillsTag"
                         placeholder="输入后回车添加"
                         class="flex-1 bg-transparent border-none text-xs focus:outline-none min-w-[120px]"
                         style="color: var(--color-ink-1)" />
                </div>
              </div>
              <!-- Hero Tech Stack Tags -->
              <div class="space-y-2 pt-4" style="border-top: 1px solid var(--color-border)">
                <h3 class="text-xs font-mono font-semibold uppercase tracking-wider" style="color: var(--color-ink-3)">首屏主图底部技术栈标签</h3>
                <div class="flex flex-wrap gap-1.5 p-2 rounded-xl min-h-[42px] items-center"
                     style="background: rgba(255,255,255,0.8); border: 1px solid var(--color-border-2)">
                  <span v-for="tag in siteConfig.home.heroTechStack" :key="tag" class="badge inline-flex items-center gap-1">
                    {{ tag }}
                    <button type="button" @click="removeHeroTechTag(tag)" class="ml-1 opacity-60 hover:opacity-100 font-bold text-xs">×</button>
                  </span>
                  <input v-model="tempHeroTechInput" @keydown.enter.prevent="addHeroTechTag" @keydown.comma.prevent="addHeroTechTag"
                         placeholder="输入后回车添加"
                         class="flex-1 bg-transparent border-none text-xs focus:outline-none min-w-[120px]"
                         style="color: var(--color-ink-1)" />
                </div>
              </div>

              <!-- Collaborative Brands Tags -->
              <div class="space-y-2 pt-4" style="border-top: 1px solid var(--color-border)">
                <h3 class="text-xs font-mono font-semibold uppercase tracking-wider" style="color: var(--color-ink-3)">合作与联合制作品牌 (Collaborative Brands)</h3>
                <div class="flex flex-wrap gap-1.5 p-2 rounded-xl min-h-[42px] items-center"
                     style="background: rgba(255,255,255,0.8); border: 1px solid var(--color-border-2)">
                  <span v-for="tag in siteConfig.home.collaborativeBrands" :key="tag" class="badge inline-flex items-center gap-1">
                    {{ tag }}
                    <button type="button" @click="removeBrandTag(tag)" class="ml-1 opacity-60 hover:opacity-100 font-bold text-xs">×</button>
                  </span>
                  <input v-model="tempBrandInput" @keydown.enter.prevent="addBrandTag" @keydown.comma.prevent="addBrandTag"
                         placeholder="输入后回车添加品牌名称"
                         class="flex-1 bg-transparent border-none text-xs focus:outline-none min-w-[120px]"
                         style="color: var(--color-ink-1)" />
                </div>
                <p class="text-[9px] text-slate-400 font-mono">输入公司、客户或制作品牌名称（例如：DJI、腾讯视频、比亚迪）并按下回车或逗号键添加，它们将在前台首页滚动跑马灯展示。</p>
              </div>
            </div>
            <!-- Preview -->
            <div class="p-6 rounded-2xl space-y-5" style="background: rgba(0,0,0,0.02); border: 1px dashed var(--color-border-2)">
              <span class="text-[9px] uppercase font-mono tracking-wider" style="color: var(--color-ink-5)">首页磁贴实时预览</span>
              <div class="glass-card p-6 space-y-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm"
                     style="background: linear-gradient(135deg, rgba(217,119,6,0.15), rgba(180,83,9,0.25)); color: var(--color-ink-1)">
                  {{ (siteConfig.home.profileCardTitle || 'Z').charAt(0) }}
                </div>
                <div class="space-y-0.5">
                  <h4 class="font-display font-bold text-base" style="color: var(--color-ink-1)">{{ siteConfig.home.profileCardTitle || 'Xo' }}</h4>
                  <p class="text-[9px] font-mono font-semibold uppercase tracking-wider" style="color: var(--color-bronze)">{{ siteConfig.home.profileCardSub || 'DI / Film Editor' }}</p>
                </div>
                <p class="text-xs leading-relaxed line-clamp-3" style="color: var(--color-ink-4)">{{ siteConfig.home.profileCardDesc || '描述待输入...' }}</p>
              </div>
              <div class="glass-card p-5 space-y-2">
                <div class="text-[9px] font-mono" style="color: var(--color-ink-5)">SKILLS PREVIEW</div>
                <div class="flex flex-wrap gap-1.5">
                  <span v-for="tag in siteConfig.home.skillsTags" :key="tag" class="badge">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

          <div v-else-if="activeTab === 'about'" key="about" class="glass-card p-8 space-y-8">
            <!-- TAB 3: ABOUT / PROFILE -->
          <div class="flex items-center justify-between pb-5" style="border-bottom: 1px solid var(--color-border)">
            <div>
              <h2 class="text-base font-semibold font-display" style="color: var(--color-ink-1)">个人履历与经历年谱</h2>
              <p class="text-xs font-mono mt-0.5" style="color: var(--color-ink-5)">编辑关于我页面的简介、技能条、工作履历和理念格言。</p>
            </div>
            <button @click="saveSiteConfig" class="btn-primary text-xs py-2 px-5">保存个人配置</button>
          </div>
          <div class="grid lg:grid-cols-2 gap-8 items-start">
            <div class="space-y-6">
              <!-- Bio -->
              <div class="space-y-4">
                <h3 class="text-xs font-mono font-semibold uppercase tracking-wider" style="color: var(--color-ink-3)">基本简历文案</h3>
                <div class="space-y-1.5">
                  <label class="form-label">职业身份 (Role)</label>
                  <input v-model="siteConfig.about.role" class="form-input font-mono" />
                </div>
                <div class="space-y-1.5">
                  <label class="form-label">主简介段落 (Bio)</label>
                  <textarea v-model="siteConfig.about.bio" rows="3" class="form-input resize-none" />
                </div>
                <div class="space-y-1.5">
                  <label class="form-label">哲学旁白引言 (Sub Bio)</label>
                  <textarea v-model="siteConfig.about.bioSub" rows="3" class="form-input resize-none" />
                </div>

                <div class="space-y-1.5 pt-2">
                  <label class="form-label flex justify-between">
                    <span>个人头像图片 (Avatar Image)</span>
                    <span class="text-[9px] text-amber-700 font-bold">支持链接地址或本地设备上传</span>
                  </label>
                  <div class="flex gap-2">
                    <input v-model="siteConfig.siteInfo.avatar" class="form-input font-mono flex-1 text-xs" placeholder="https://... 或上传本地文件" />
                    <label class="btn-ghost text-xs py-2 px-4 cursor-pointer flex items-center justify-center border border-dashed rounded-xl flex-shrink-0" style="border-color: var(--color-border-2); background: transparent;">
                      <span>📤 上传</span>
                      <input type="file" accept="image/*" class="hidden" @change="uploadAvatarFile" />
                    </label>
                  </div>
                  <!-- Avatar Preview -->
                  <div v-if="siteConfig.siteInfo.avatar" class="flex items-center gap-3 pt-2">
                    <div class="w-10 h-10 rounded-full overflow-hidden border border-black/10 flex-shrink-0">
                      <img :src="siteConfig.siteInfo.avatar" class="w-full h-full object-cover" />
                    </div>
                    <span class="text-[10px] font-mono text-slate-400">预览当前头像</span>
                    <button type="button" @click="siteConfig.siteInfo.avatar = ''" class="text-[10px] font-bold text-rose-500 hover:underline ml-auto">清除头像</button>
                  </div>
                </div>
              </div>
              <!-- Skills Sliders -->
              <div class="space-y-4 pt-4" style="border-top: 1px solid var(--color-border)">
                <div class="flex items-center justify-between">
                  <h3 class="text-xs font-mono font-semibold uppercase tracking-wider" style="color: var(--color-ink-3)">技能标定 (Skills Faders)</h3>
                  <button type="button" @click="addSkill" class="text-xs font-bold font-mono hover:text-amber-700 transition-colors" style="color: var(--color-ink-1)">+ 添加技能</button>
                </div>
                <div class="space-y-3">
                  <div v-for="(skill, idx) in siteConfig.about.skills" :key="idx"
                       class="p-4 rounded-xl space-y-3 relative" style="background: rgba(0,0,0,0.02); border: 1px solid var(--color-border)">
                    <button type="button" @click="removeSkill(idx)" class="absolute top-3 right-3 text-rose-500 hover:text-rose-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div class="grid grid-cols-6 gap-3 pr-6">
                      <div class="col-span-4 space-y-1">
                        <span class="text-[9px] font-mono uppercase" style="color: var(--color-ink-5)">技能名称</span>
                        <input v-model="skill.name" class="form-input text-xs" />
                      </div>
                      <div class="col-span-2 space-y-1">
                        <span class="text-[9px] font-mono uppercase" style="color: var(--color-ink-5)">掌握度 ({{ skill.level }}%)</span>
                        <input type="range" min="0" max="100" v-model.number="skill.level" class="w-full h-8 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Philosophies -->
              <div class="space-y-4 pt-4" style="border-top: 1px solid var(--color-border)">
                <div class="flex items-center justify-between">
                  <h3 class="text-xs font-mono font-semibold uppercase tracking-wider" style="color: var(--color-ink-3)">后期哲学理念</h3>
                  <button type="button" @click="addPhilosophy" class="text-xs font-bold font-mono hover:text-amber-700 transition-colors" style="color: var(--color-ink-1)">+ 添加理念</button>
                </div>
                <div class="space-y-3">
                  <div v-for="(phi, idx) in siteConfig.about.philosophies" :key="idx"
                       class="p-4 rounded-xl space-y-3 relative" style="background: rgba(0,0,0,0.02); border: 1px solid var(--color-border)">
                    <button type="button" @click="removePhilosophy(idx)" class="absolute top-3 right-3 text-rose-500 hover:text-rose-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div class="grid grid-cols-6 gap-2">
                      <input v-model="phi.emoji" class="form-input col-span-1 text-center font-bold" />
                      <input v-model="phi.title" class="form-input col-span-5 font-bold font-display" />
                    </div>
                    <input v-model="phi.desc" class="form-input" />
                  </div>
                </div>
              </div>
            </div>
            <!-- Experiences Timeline -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-mono font-semibold uppercase tracking-wider" style="color: var(--color-ink-3)">工作履历年谱</h3>
                <button type="button" @click="addExperience" class="text-xs font-bold font-mono hover:text-amber-700 transition-colors" style="color: var(--color-ink-1)">+ 添加经历</button>
              </div>
              <div class="space-y-4">
                <div v-for="(exp, idx) in siteConfig.about.experiences" :key="idx"
                     @dragover.prevent
                     @drop="onExpDrop(idx)"
                     class="p-5 rounded-2xl space-y-4 relative shadow-sm transition-all duration-200 border border-amber-500/20"
                     :class="[draggedExpIdx === idx ? 'opacity-40 border-dashed border-amber-500' : '']"
                     style="background: rgba(255,255,255,0.92); border: 1px solid var(--color-border)">
                  <!-- Scoped Luxury Reorder Bar (Only Handle is Draggable!) -->
                  <div class="flex items-center justify-between border-b pb-3 border-black/10 select-none">
                    <div class="flex items-center gap-2">
                      <!-- Scoped Drag Handle (Only this box is draggable) -->
                      <div 
                        draggable="true" 
                        @dragstart="onExpDragStart(idx)"
                        class="w-7 h-7 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/25 flex items-center justify-center cursor-grab active:cursor-grabbing transition-all hover:scale-105 shadow-sm"
                        title="按住此图标即可拖拽重排顺序"
                      >
                        <span class="text-amber-800 font-bold text-base leading-none">⠿</span>
                      </div>
                      <span class="text-xs font-bold font-mono text-amber-900 bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/30">履历位序 #{{ idx + 1 }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-xs font-mono font-bold">
                      <button type="button" @click.stop="moveExperienceUp(idx)" :disabled="idx === 0" :class="[idx === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-amber-500/10 hover:text-amber-800']" class="px-2.5 py-1 rounded-lg border border-black/10 transition-all flex items-center gap-1">
                        <span>↑</span><span>上移</span>
                      </button>
                      <button type="button" @click.stop="moveExperienceDown(idx)" :disabled="idx === siteConfig.about.experiences.length - 1" :class="[idx === siteConfig.about.experiences.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-amber-500/10 hover:text-amber-800']" class="px-2.5 py-1 rounded-lg border border-black/10 transition-all flex items-center gap-1">
                        <span>↓</span><span>下移</span>
                      </button>
                      <button type="button" @click.stop="removeExperience(idx)" class="px-2.5 py-1 rounded-lg border border-rose-500/30 text-rose-600 bg-rose-500/5 hover:bg-rose-500/15 transition-all">删除</button>
                    </div>
                  </div>
                  <div class="grid sm:grid-cols-2 gap-3">
                    <div class="space-y-1">
                      <span class="text-[9px] font-mono uppercase" style="color: var(--color-ink-5)">职位</span>
                      <input v-model="exp.role" class="form-input font-display font-semibold" />
                    </div>
                    <div class="space-y-1">
                      <span class="text-[9px] font-mono uppercase" style="color: var(--color-ink-5)">公司</span>
                      <input v-model="exp.company" class="form-input" />
                    </div>
                  </div>
                  <div class="grid sm:grid-cols-3 gap-3">
                    <div class="space-y-1 sm:col-span-1">
                      <span class="text-[9px] font-mono uppercase" style="color: var(--color-ink-5)">时期</span>
                      <input v-model="exp.period" class="form-input font-mono" />
                    </div>
                    <div class="space-y-1 sm:col-span-2">
                      <span class="text-[9px] font-mono uppercase" style="color: var(--color-ink-5)">描述</span>
                      <input v-model="exp.desc" class="form-input" />
                    </div>
                  </div>
                  <div class="space-y-1">
                    <span class="text-[9px] font-mono uppercase" style="color: var(--color-ink-5)">技能标签（回车添加）</span>
                    <div class="flex flex-wrap gap-1.5 p-2 rounded-xl min-h-[36px] items-center"
                         style="background: rgba(0,0,0,0.02); border: 1px solid var(--color-border)">
                      <span v-for="tag in exp.tags" :key="tag" class="badge inline-flex items-center gap-1 text-[9px]">
                        {{ tag }}
                        <button type="button" @click="removeExperienceTag(idx, tag)" class="ml-0.5 opacity-60 hover:opacity-100 font-bold">×</button>
                      </span>
                      <input
                        :value="tempExpInputs[idx] || ''"
                        @input="updateTempExpInput(idx, ($event.target as HTMLInputElement).value)"
                        @keydown.enter.prevent="addExperienceTag(idx)"
                        placeholder="回车确认"
                        class="flex-1 bg-transparent border-none text-[10px] focus:outline-none min-w-[70px]"
                        style="color: var(--color-ink-1)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

          <div v-else-if="activeTab === 'siteinfo'" key="siteinfo" class="glass-card p-8 space-y-8">
            <!-- TAB 4: SITE INFO -->
          <div class="flex items-center justify-between pb-5" style="border-bottom: 1px solid var(--color-border)">
            <div>
              <h2 class="text-base font-semibold font-display" style="color: var(--color-ink-1)">站点信息 & 社交媒体</h2>
              <p class="text-xs font-mono mt-0.5" style="color: var(--color-ink-5)">编辑品牌名、姓名、联系邮箱、社交链接和 SEO 元信息。</p>
            </div>
            <button @click="saveSiteConfig" class="btn-primary text-xs py-2 px-5">保存站点信息</button>
          </div>

          <div class="grid lg:grid-cols-2 gap-10">
            <!-- Left: Brand & Contact -->
            <div class="space-y-6">
              <div class="space-y-4">
                <h3 class="text-xs font-mono font-semibold uppercase tracking-wider" style="color: var(--color-ink-3)">品牌与个人信息</h3>
                <div class="grid sm:grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label class="form-label">品牌名称</label>
                    <input v-model="siteConfig.siteInfo.brandName" class="form-input font-display font-bold" placeholder="Xo" />
                  </div>
                  <div class="space-y-1.5">
                    <label class="form-label">持有人姓名</label>
                    <input v-model="siteConfig.siteInfo.ownerName" class="form-input" placeholder="Xo" />
                  </div>
                </div>
                <div class="grid sm:grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label class="form-label">头像首字母</label>
                    <input v-model="siteConfig.siteInfo.ownerInitial" class="form-input font-display font-bold text-center" maxlength="2" placeholder="Z" />
                  </div>
                  <div class="space-y-1.5">
                    <label class="form-label">联系邮箱</label>
                    <input v-model="siteConfig.siteInfo.contactEmail" class="form-input font-mono" type="email" placeholder="hello@xo.dev" />
                  </div>
                </div>
                
                <div class="space-y-1.5 pt-2">
                  <label class="form-label flex justify-between">
                    <span>个人头像图片 (Avatar Image)</span>
                    <span class="text-[9px] text-amber-700 font-bold">支持链接地址或本地设备上传</span>
                  </label>
                  <div class="flex gap-2">
                    <input v-model="siteConfig.siteInfo.avatar" class="form-input font-mono flex-1 text-xs" placeholder="https://... 或上传本地文件" />
                    <label class="btn-ghost text-xs py-2 px-4 cursor-pointer flex items-center justify-center border border-dashed rounded-xl flex-shrink-0" style="border-color: var(--color-border-2); background: transparent;">
                      <span>📤 上传</span>
                      <input type="file" accept="image/*" class="hidden" @change="uploadAvatarFile" />
                    </label>
                  </div>
                  <!-- Avatar Preview -->
                  <div v-if="siteConfig.siteInfo.avatar" class="flex items-center gap-3 pt-2">
                    <div class="w-10 h-10 rounded-full overflow-hidden border border-black/10 flex-shrink-0">
                      <img :src="siteConfig.siteInfo.avatar" class="w-full h-full object-cover" />
                    </div>
                    <span class="text-[10px] font-mono text-slate-400">预览当前头像</span>
                    <button type="button" @click="siteConfig.siteInfo.avatar = ''" class="text-[10px] font-bold text-rose-500 hover:underline ml-auto">清除头像</button>
                  </div>
                </div>
              </div>

              <!-- Social Links -->
              <div class="space-y-4 pt-4" style="border-top: 1px solid var(--color-border)">
                <div class="flex items-center justify-between">
                  <h3 class="text-xs font-mono font-semibold uppercase tracking-wider" style="color: var(--color-ink-3)">社交媒体链接</h3>
                  <button type="button" @click="addSocialSlot" class="text-[10px] font-bold font-mono text-amber-700 hover:underline">
                    ＋ 添加社交平台
                  </button>
                </div>
                
                <div class="space-y-3">
                  <div v-for="(slot, index) in socialSlots" :key="index" class="flex gap-2.5 items-center">
                    <!-- Custom simulated dropdown -->
                    <div class="relative social-dropdown-container flex-shrink-0">
                      <button 
                        type="button"
                        @click.stop="toggleSocialDropdown(index)"
                        class="form-input text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-between gap-1.5 cursor-pointer bg-black/[0.01] hover:bg-black/[0.03] transition-colors border border-black/10 select-none text-left"
                        style="width: 130px; height: 38px; color: var(--color-ink-1);"
                      >
                        <span class="flex items-center gap-1.5">
                          <span>{{ getPlatformInfo(slot.platform).icon }}</span>
                          <span>{{ getPlatformInfo(slot.platform).label }}</span>
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5 opacity-60 flex-shrink-0">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                      
                      <!-- Floating dropdown options -->
                      <transition name="dropdown-fade">
                        <div 
                          v-if="openDropdownIndex === index"
                          class="absolute left-0 mt-1.5 rounded-2xl border border-black/[0.08] shadow-xl py-1.5 z-50 overflow-hidden"
                          style="width: 140px; background: rgba(255, 255, 255, 0.90); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);"
                        >
                          <button
                            v-for="opt in platformOptions"
                            :key="opt.value"
                            type="button"
                            @click="selectSocialPlatform(index, opt.value)"
                            class="w-full px-3.5 py-2 text-left text-xs font-medium flex items-center gap-2 hover:bg-amber-700/5 hover:text-amber-800 transition-colors border-none outline-none cursor-pointer"
                            :style="slot.platform === opt.value ? 'color: var(--color-bronze); font-weight: 600; background: rgba(180, 83, 9, 0.04);' : 'color: var(--color-ink-2);'"
                          >
                            <span class="text-sm select-none">{{ opt.icon }}</span>
                            <span>{{ opt.label }}</span>
                          </button>
                        </div>
                      </transition>
                    </div>
                    
                    <!-- Input field -->
                    <input 
                      v-model="slot.value" 
                      @input="handleSocialSlotChange"
                      class="form-input font-mono text-xs flex-1"
                      :placeholder="getPlatformInfo(slot.platform).placeholder" 
                    />
                    
                    <!-- Delete button -->
                    <button 
                      type="button" 
                      @click="removeSocialSlot(index)" 
                      class="p-2.5 rounded-xl border border-black/5 hover:bg-rose-500/10 hover:text-rose-600 transition-colors flex-shrink-0 cursor-pointer"
                      style="color: var(--color-ink-4);"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: SEO -->
            <div class="space-y-6">
              <div class="space-y-4">
                <h3 class="text-xs font-mono font-semibold uppercase tracking-wider" style="color: var(--color-ink-3)">SEO 元信息</h3>
                <div class="space-y-1.5">
                  <label class="form-label">网站标题 (Title Tag)</label>
                  <input v-model="siteConfig.siteInfo.seoTitle" class="form-input" placeholder="Xo Studio · 影视后期剪辑与调色" />
                  <p class="text-[9px] font-mono mt-1" style="color: var(--color-ink-5)">建议 50–60 字符以内</p>
                </div>
                <div class="space-y-1.5">
                  <label class="form-label">网站描述 (Meta Description)</label>
                  <textarea v-model="siteConfig.siteInfo.seoDescription" rows="3" class="form-input resize-none" />
                  <p class="text-[9px] font-mono mt-1" style="color: var(--color-ink-5)">建议 120–160 字符以内</p>
                </div>
                <div class="space-y-1.5">
                  <label class="form-label">页脚标语</label>
                  <input v-model="siteConfig.siteInfo.footerTagline" class="form-input" placeholder="基于达芬奇色彩科学规范开发" />
                </div>
              </div>

              <!-- Preview card -->
              <div class="p-5 rounded-2xl space-y-3 mt-4" style="background: rgba(0,0,0,0.02); border: 1px dashed var(--color-border-2)">
                <span class="text-[9px] uppercase font-mono tracking-wider" style="color: var(--color-ink-5)">搜索结果预览</span>
                <div class="space-y-1.5">
                  <p class="text-sm font-semibold" style="color: #1a0dab">{{ siteConfig.siteInfo.seoTitle || '网站标题' }}</p>
                  <p class="text-[11px]" style="color: #006621">{{ siteConfig.siteInfo.contactEmail || 'xo.dev' }}</p>
                  <p class="text-xs leading-relaxed" style="color: var(--color-ink-4)">{{ siteConfig.siteInfo.seoDescription || '网站描述...' }}</p>
                </div>
              </div>

              <!-- Email Notification Settings -->
              <div class="glass-card p-6 space-y-4 mt-6">
                <div class="flex items-center justify-between border-b pb-2" style="border-color: var(--color-border)">
                  <h3 class="text-xs font-mono font-semibold uppercase tracking-wider" style="color: var(--color-ink-3)">✉️ 邮件通知设置 (SMTP)</h3>
                  <!-- Bulletproof Dropdown Selector -->
                  <select 
                    v-model="siteConfig.emailSettings.enabled" 
                    class="text-xs font-mono py-1 px-2.5 rounded-lg border border-black/10 bg-white"
                    style="color: var(--color-ink-1); outline: none;"
                  >
                    <option :value="false">❌ 已关闭</option>
                    <option :value="true">🟢 已开启</option>
                  </select>
                </div>

                <div v-if="siteConfig.emailSettings?.enabled" class="space-y-3.5 text-xs">
                  <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1.5">
                      <label class="form-label">SMTP 服务器主机</label>
                      <input v-model="siteConfig.emailSettings.smtpHost" class="form-input font-mono" placeholder="smtp.qq.com" />
                    </div>
                    <div class="space-y-1.5">
                      <label class="form-label">SMTP 端口</label>
                      <input v-model="siteConfig.emailSettings.smtpPort" type="number" class="form-input font-mono" placeholder="465" />
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <label class="form-label">发件人昵称 (Sender Name)</label>
                    <input v-model="siteConfig.emailSettings.senderName" class="form-input" placeholder="Xo Studio" />
                  </div>

                  <div class="space-y-1.5">
                    <label class="form-label">发件邮箱账户 (SMTP User)</label>
                    <input v-model="siteConfig.emailSettings.smtpUser" class="form-input font-mono" placeholder="your-email@qq.com" />
                  </div>

                  <div class="space-y-1.5">
                    <label class="form-label">展示发件邮箱 (Sender Email)</label>
                    <input v-model="siteConfig.emailSettings.senderEmail" class="form-input font-mono" placeholder="例如: noreply@xoxox.bond (留空则默认使用账户)" />
                    <p class="text-[9px] text-slate-400">如果是 QQ/163 邮箱请留空；如果是 Resend 自建域名邮箱，请务必填写您的域名邮箱地址（如 noreply@xoxox.bond）。</p>
                  </div>

                  <div class="space-y-1.5">
                    <label class="form-label">SMTP 授权码/密码 (SMTP Pass)</label>
                    <input v-model="siteConfig.emailSettings.smtpPass" type="password" class="form-input font-mono" placeholder="密码/授权码" />
                    <p class="text-[9px] text-slate-400">请使用网易或QQ邮箱的“客户端授权密码/授权码”，非邮箱登录密码。</p>
                  </div>

                  <div class="flex items-center gap-2 pt-1.5">
                    <input type="checkbox" id="smtp-secure-check" v-model="siteConfig.emailSettings.smtpSecure" class="rounded border-gray-300 text-amber-700 focus:ring-amber-500" />
                    <label for="smtp-secure-check" class="text-[10px] font-bold select-none cursor-pointer" style="color: var(--color-ink-3)">启用 SSL 安全链接 (默认启用)</label>
                  </div>
                </div>
                <p v-else class="text-[10px] text-slate-400 leading-relaxed">启用后，当管理员在后台审批通过申请，系统会自动向申请者的邮箱发送包含密码和观看链接的通知邮件。客户走直接自动通道获取密码时，也会收到密码备份通知。</p>
              </div>

              <!-- AI Model API Settings Card (支持对接真实大模型) -->
              <div class="glass-card p-6 space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">🤖</span>
                    <div>
                      <h3 class="font-display font-bold text-sm" style="color: var(--color-ink-1)">AI 大模型 API 对接</h3>
                      <p class="text-[11px]" style="color: var(--color-ink-5)">支持接入 DeepSeek、OpenAI、Gemini 或自定义中转 API，为【✨ AI 智能生成】提供真实 LLM 大模型推理</p>
                    </div>
                  </div>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-700/10 text-amber-800 border border-amber-700/20">内置/Key双引擎</span>
                </div>

                <div class="space-y-4 pt-2">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label class="form-label">模型服务商 (AI Provider)</label>
                      <select v-model="siteConfig.aiSettings.provider" class="form-input text-xs">
                        <option value="builtin">内置高奢解说引擎 (无需 API Key 秒级生成)</option>
                        <option value="deepseek">DeepSeek 官方 API (推荐)</option>
                        <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                        <option value="gemini">Google Gemini API</option>
                        <option value="custom">自定义 OpenAI 兼容中转 API</option>
                      </select>
                    </div>

                    <div class="space-y-1.5">
                      <label class="form-label">模型名称 (Model ID)</label>
                      <input
                        v-model="siteConfig.aiSettings.modelName"
                        class="form-input font-mono text-xs"
                        placeholder="deepseek-chat 或 gpt-4o-mini"
                      />
                    </div>
                  </div>

                  <div v-if="siteConfig.aiSettings?.provider !== 'builtin'" class="space-y-4 pt-1">
                    <div class="space-y-1.5">
                      <label class="form-label flex items-center justify-between">
                        <span>API Base Endpoint (接口地址)</span>
                        <span class="text-[9px] font-mono text-amber-700">默认: https://api.deepseek.com/v1</span>
                      </label>
                      <input
                        v-model="siteConfig.aiSettings.apiEndpoint"
                        class="form-input font-mono text-xs"
                        placeholder="https://api.deepseek.com/v1"
                      />
                    </div>

                    <div class="space-y-1.5">
                      <label class="form-label flex items-center justify-between">
                        <span>API Key (密钥)</span>
                        <span class="text-[9px] font-mono opacity-60">格式: sk-xxxxxxxxxxxx</span>
                      </label>
                      <input
                        v-model="siteConfig.aiSettings.apiKey"
                        type="password"
                        class="form-input font-mono text-xs"
                        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

          <div v-else-if="activeTab === 'advanced'" key="advanced" class="space-y-8">
            <!-- TAB 5: ADVANCED & PLAYGROUND -->
          <!-- Save Top Bar -->
          <div class="flex items-center justify-between p-6 glass-card">
            <div>
              <h2 class="text-base font-semibold font-display" style="color: var(--color-ink-1)">高级设置 & 主题玩法</h2>
              <p class="text-xs font-mono mt-0.5" style="color: var(--color-ink-5)">调节品牌视觉主题、开启顶栏通知广播、备份导出全站 JSON 数据以及一键应用预设身份。</p>
            </div>
            <button @click="saveSiteConfig" class="btn-primary text-xs py-2 px-5">保存高级配置</button>
          </div>

          <!-- 1. Project Password Manager -->
          <div class="glass-card p-8 space-y-6">
            <div class="border-b pb-4" style="border-color: var(--color-border)">
              <h3 class="font-display font-bold text-lg" style="color: var(--color-ink-1)">🔐 作品隐私锁状态概览 (Password Locks Overview)</h3>
              <p class="text-xs mt-1" style="color: var(--color-ink-4)">在此概览所有被密码保护的敏感商业作品或 NDA 项目。</p>
            </div>

            <!-- List of protected projects -->
            <div class="space-y-3">
              <template v-if="lockedProjects.length">
                <div v-for="p in lockedProjects" :key="p.slug" class="p-4 rounded-xl flex items-center justify-between shadow-sm bg-black/[0.01]" style="border: 1px solid var(--color-border)">
                  <div class="flex items-center gap-3">
                    <span class="text-lg">🔒</span>
                    <div>
                      <h4 class="font-bold text-sm" style="color: var(--color-ink-1)">{{ p.title }}</h4>
                      <p class="text-[10px] font-mono" style="color: var(--color-ink-5)">/projects/{{ p.slug }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="bg-amber-700/5 text-amber-700 text-xs px-3 py-1.5 rounded-lg border border-amber-800/10 font-mono font-bold">
                      密码: {{ p.password }}
                    </div>
                    <button @click="openEditModal(p)" class="text-xs font-semibold hover:underline" style="color: var(--color-ink-4)">
                      修改
                    </button>
                  </div>
                </div>
              </template>
              <div v-else class="text-center py-6 border border-dashed rounded-xl" style="border-color: var(--color-border-2)">
                <p class="text-xs font-mono" style="color: var(--color-ink-5)">当前无密码保护作品。您可在「作品管理」编辑中为特定视频设置授权密码。</p>
              </div>
            </div>

            <!-- Atmosphere Toggles -->
            <div class="space-y-2 pt-2">
              <label class="form-label">背景质感与动效图层</label>
              <div class="grid sm:grid-cols-2 gap-4">
                <label class="flex items-center justify-between cursor-pointer p-4 rounded-xl bg-black/[0.01]" style="border: 1px solid var(--color-border)">
                  <span class="text-xs font-medium" style="color: var(--color-ink-2)">动态背景光雾 (Atmosphere Orbs)</span>
                  <input type="checkbox" v-model="siteConfig.theme.showOrbs" class="w-4 h-4 accent-amber-700 cursor-pointer" />
                </label>
                <label class="flex items-center justify-between cursor-pointer p-4 rounded-xl bg-black/[0.01]" style="border: 1px solid var(--color-border)">
                  <span class="text-xs font-medium" style="color: var(--color-ink-2)">电影级胶片颗粒感 (Film Grain Overlay)</span>
                  <input type="checkbox" v-model="siteConfig.theme.showFilmGrain" class="w-4 h-4 accent-amber-700 cursor-pointer" />
                </label>
              </div>
            </div>
          </div>

          <!-- Admin Security Credentials -->
          <div class="glass-card p-8 space-y-6">
            <div class="border-b pb-4" style="border-color: var(--color-border)">
              <h3 class="font-display font-bold text-lg" style="color: var(--color-ink-1)">🔑 后台管理员账户设置 (Security Credentials)</h3>
              <p class="text-xs mt-1" style="color: var(--color-ink-4)">自主修改登录后台系统的用户名、管理密码，以及自定义后台管理地址后缀。</p>
            </div>

            <div class="grid md:grid-cols-2 gap-6" v-if="siteConfig.admin">
              <div class="space-y-1.5">
                <label class="form-label">修改用户名 (Admin Username)</label>
                <input v-model="siteConfig.admin.username" class="form-input font-mono" placeholder="admin" required />
              </div>
              <div class="space-y-1.5">
                <label class="form-label flex justify-between">
                  <span>修改管理密码 (Admin Password)</span>
                  <span class="text-[9px] text-amber-700 font-bold font-mono">留空则不更改密码</span>
                </label>
                <input v-model="adminNewPassword" type="password" class="form-input font-mono" placeholder="•••••••• (无修改请留空)" />
              </div>
            </div>

            <!-- Admin Path / URL Suffix -->
            <div class="p-5 rounded-xl space-y-4" style="background: rgba(180,83,9,0.04); border: 1px solid rgba(180,83,9,0.14)">
              <div class="flex items-start gap-3">
                <span class="text-2xl mt-0.5">🔗</span>
                <div class="space-y-1">
                  <h4 class="text-sm font-bold font-display" style="color: var(--color-ink-1)">自定义后台管理地址后缀 (Admin URL Suffix)</h4>
                  <p class="text-xs" style="color: var(--color-ink-4)">修改后台管理面板的访问路径（URL 后缀）。当前访问地址：<code class="font-mono text-amber-700 bg-amber-50 px-1 py-0.5 rounded">{{ $route.params.adminSuffix }}</code></p>
                </div>
              </div>

              <div class="space-y-2" v-if="siteConfig.admin">
                <label class="form-label">新后台路径 (仅限英文字母、数字、- 和 _)</label>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono px-3 py-2 rounded-lg" style="background: rgba(0,0,0,0.04); color: var(--color-ink-4)">你的域名/</span>
                  <input
                    v-model="siteConfig.admin.adminPath"
                    class="form-input font-mono flex-1"
                    placeholder="例如: studio2026 或 dashboard"
                    @input="siteConfig.admin.adminPath = ($event.target as HTMLInputElement).value.toLowerCase().replace(/[^a-z0-9_-]/g, '')"
                  />
                </div>
                <!-- Live Preview URL -->
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[10px] font-mono px-2 py-1 rounded" style="background: rgba(0,0,0,0.03); color: var(--color-ink-5)">
                    新地址预览：<span style="color: var(--color-bronze)" class="font-bold">{{ siteConfig.admin.adminPath || 'admin' }}</span>
                  </span>
                  <span v-if="siteConfig.admin.adminPath && siteConfig.admin.adminPath !== $route.params.adminSuffix"
                    class="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                    ⚠️ 保存后将自动跳转到新地址
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Broadcast Announcement Banner Sandbox -->
          <div class="glass-card p-8 space-y-6">
            <div class="flex items-center justify-between border-b pb-4" style="border-color: var(--color-border)">
              <div>
                <h3 class="font-display font-bold text-lg" style="color: var(--color-ink-1)">📢 顶栏与全局广播通知条</h3>
                <p class="text-xs mt-1" style="color: var(--color-ink-4)">在全站顶栏跑马灯或左下角浮动胶囊中呈现象征档期预订或重大公告消息。</p>
              </div>
              <label class="flex items-center gap-2 cursor-pointer bg-black/[0.03] px-3.5 py-1.5 rounded-full border border-black/10">
                <span class="text-xs font-bold font-mono" style="color: var(--color-ink-2)">开启广播条</span>
                <input type="checkbox" v-model="siteConfig.announcement.enabled" class="w-4 h-4 accent-amber-700 cursor-pointer" />
              </label>
            </div>

            <div class="space-y-4" :class="{ 'opacity-50 pointer-events-none': !siteConfig.announcement?.enabled }">
              <div class="grid md:grid-cols-3 gap-4">
                <div class="space-y-1 md:col-span-1">
                  <label class="form-label">展示位置 (Position)</label>
                  <select v-model="siteConfig.announcement.position" class="form-input text-xs">
                    <option value="capsule">左下角极奢胶囊 (Bottom Capsule)</option>
                    <option value="top-bar">全站顶部置顶跑马灯 (Top Sticky Bar)</option>
                  </select>
                </div>
                <div class="space-y-1 md:col-span-1">
                  <label class="form-label">播放动效 (Animation)</label>
                  <select v-model="siteConfig.announcement.animation" class="form-input text-xs">
                    <option value="pulse">微光呼吸 (Pulse)</option>
                    <option value="marquee">跑马灯流动 (Marquee)</option>
                    <option value="fade">柔和淡入 (Fade)</option>
                  </select>
                </div>
                <div class="space-y-1 md:col-span-1">
                  <label class="form-label">徽章配色 (Badge Color)</label>
                  <select v-model="siteConfig.announcement.badgeColor" class="form-input text-xs">
                    <option value="amber">香槟哑金 (Amber)</option>
                    <option value="emerald">极光冷翠 (Emerald)</option>
                    <option value="rose">炽焰红 (Rose)</option>
                    <option value="indigo">夜空蓝 (Indigo)</option>
                  </select>
                </div>
              </div>

              <div class="grid md:grid-cols-3 gap-4">
                <div class="space-y-1 md:col-span-1">
                  <label class="form-label">徽章文本 (Badge Text)</label>
                  <input v-model="siteConfig.announcement.badge" class="form-input font-mono uppercase" placeholder="NOTICE / HOT" />
                </div>
                <div class="space-y-1 md:col-span-2">
                  <div class="flex items-center justify-between">
                    <label class="form-label">广播文案 (Message Text)</label>
                    <button type="button" @click.stop.prevent="openNoticeAiModal" class="text-xs font-bold text-purple-700 bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-1 rounded-lg border border-purple-500/30 flex items-center gap-1 active:scale-95 transition-all cursor-pointer">
                      <span>✨ AI 一键撰写告示</span>
                    </button>
                  </div>
                  <input v-model="siteConfig.announcement.text" class="form-input" placeholder="例如：🎬 2026 下半年商业 TVC 档期与电影 DI 调色开放预订中" />
                </div>
              </div>

              <div class="grid md:grid-cols-3 gap-4">
                <div class="space-y-1 md:col-span-2">
                  <label class="form-label">跳转链接 (Link URL)</label>
                  <input v-model="siteConfig.announcement.link" class="form-input font-mono text-xs" placeholder="mailto:hello@xo.dev 或 https://..." />
                </div>
                <div class="space-y-1 md:col-span-1">
                  <label class="form-label">CTA 按钮文案 (Action Label)</label>
                  <input v-model="siteConfig.announcement.ctaText" class="form-input text-xs" placeholder="查看详情 →" />
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Ambient Music Player Configuration -->
          <div class="glass-card p-8 space-y-6" v-if="siteConfig.music">
            <div class="flex items-center justify-between border-b pb-4" style="border-color: var(--color-border)">
              <div>
                <div class="flex items-center justify-between w-full">
                <h3 class="font-display font-bold text-lg" style="color: var(--color-ink-1)">🎵 律动背景音乐与调色盘沙盒 (Soundscape & Palette Sandbox)</h3>
                <button type="button" @click.stop.prevent="openMusicAiModal" class="text-xs font-bold text-purple-700 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1 rounded-xl border border-purple-500/30 flex items-center gap-1 active:scale-95 transition-all cursor-pointer">
                  <span>✨ AI 音频律动推荐</span>
                </button>
              </div>
                <p class="text-xs mt-1" style="color: var(--color-ink-4)">为前台配置高保真背景环境音轨、沉浸式调色盘与体验防盗规则。</p>
              </div>
              <label class="flex items-center gap-2 cursor-pointer bg-black/[0.03] px-3.5 py-1.5 rounded-full border border-black/10">
                <span class="text-xs font-bold font-mono" style="color: var(--color-ink-2)">启用音乐播放器</span>
                <input type="checkbox" v-model="siteConfig.music.enabled" class="w-4 h-4 accent-amber-700 cursor-pointer" />
              </label>
            </div>

            <div class="space-y-4" :class="{ 'opacity-50 pointer-events-none': !siteConfig.music.enabled }">
              <div class="grid md:grid-cols-2 gap-4">
                <div class="space-y-1.5 md:col-span-2">
                  <label class="form-label">播放器显示名称 (Player Label)</label>
                  <input v-model="siteConfig.music.label" class="form-input font-mono text-xs uppercase" placeholder="AMBIENT AUDIO" />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="form-label flex justify-between">
                  <span>背景音乐 MP3 链接直链 (Soundtrack MP3 URL)</span>
                  <span class="text-[9px] text-[#b45309] font-bold">请填入高品质 MP3/AAC 格式直链</span>
                </label>
                <input v-model="siteConfig.music.url" class="form-input font-mono text-xs" placeholder="https://..." />
              </div>

              <div class="space-y-1.5">
                <label class="form-label flex justify-between">
                  <span>背景音量控制 (Volume): {{ siteConfig.music.volume ?? 70 }}%</span>
                </label>
                <input type="range" min="0" max="100" v-model.number="siteConfig.music.volume" class="w-full cursor-pointer accent-amber-700" />
              </div>
            </div>
          </div>

          <!-- 4. One-Click Backup & Restore Sandbox (升级全站 JSON 沙盒备份) -->
          <div class="glass-card p-8 space-y-6">
            <div class="border-b pb-4 flex items-center justify-between" style="border-color: var(--color-border)">
              <div>
                <h3 class="font-display font-bold text-lg" style="color: var(--color-ink-1)">💾 全站 JSON 沙盒备份与快照 (Full Backup & Sandbox)</h3>
                <p class="text-xs mt-1" style="color: var(--color-ink-4)">一键全量导出包含站点属性、作品集、注册用户、AI配置的全套 JSON 备份，或执行本地快照回滚。</p>
              </div>
              <span class="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-700/10 text-amber-800 border border-amber-700/20">Backup v2.0</span>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <button type="button" @click="exportFullBackup" class="btn-bronze px-5 py-2.5 rounded-xl text-xs font-bold font-mono inline-flex items-center gap-2 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5e12 9-9-9m9 9a9 9 0 01-9-9" /></svg>
                导出全站 JSON 备份包 (.json)
              </button>

              <label class="px-5 py-2.5 rounded-xl text-xs font-bold font-mono inline-flex items-center gap-2 border border-black/15 hover:bg-black/5 cursor-pointer transition-all" style="color: var(--color-ink-1)">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                导入 JSON 文件恢复
                <input type="file" accept=".json" @change="handleBackupFileSelect" class="hidden" />
              </label>

              <button type="button" @click="createLocalSnapshot" class="px-4 py-2.5 rounded-xl text-xs font-bold font-mono border border-amber-600/30 text-amber-800 hover:bg-amber-600/10 transition-all">
                📸 创建本地快照
              </button>

              <button type="button" @click="restoreLocalSnapshot" class="px-4 py-2.5 rounded-xl text-xs font-bold font-mono border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all">
                ⏪ 回滚到上次快照
              </button>

              <button type="button" @click="resetToFactoryDefaults" class="px-4 py-2.5 rounded-xl text-xs font-bold font-mono border border-rose-300 text-rose-700 hover:bg-rose-50 transition-all">
                ⚠️ 恢复出厂默认
              </button>
            </div>
          </div>

          <!-- Decoupled Luxury Sub-Components -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <AdminStudioCounter :site-config="siteConfig" @save="saveSiteConfig" @toast="showToast" />
            <AdminThemePalette :site-config="siteConfig" @save="saveSiteConfig" @toast="showToast" />
          </div>

          <AdminSecurityGateway />

          <!-- 5. Preset Persona Templates -->
          <div class="glass-card p-8 space-y-6">
            <div class="border-b pb-4" style="border-color: var(--color-border)">
              <h3 class="font-display font-bold text-lg" style="color: var(--color-ink-1)">⚡ 快捷身份模板预填 (Persona Templates)</h3>
              <p class="text-xs mt-1" style="color: var(--color-ink-4)">一键应用预设的大佬个人身份模板，快速体验不同视效领域的全套文案与标签。</p>
            </div>

            <div class="grid sm:grid-cols-3 gap-4">
              <button
                v-for="preset in personaPresets"
                :key="preset.id"
                type="button"
                @click="applyPersona(preset)"
                class="p-5 rounded-2xl border text-left space-y-2 hover:border-black/20 hover:shadow-md transition-all group"
                style="background: rgba(255,255,255,0.7); border: 1px solid var(--color-border)"
              >
                <span class="text-2xl block mb-1">{{ preset.emoji }}</span>
                <h4 class="font-display font-bold text-sm text-amber-900 group-hover:text-amber-700 transition-colors">{{ preset.title }}</h4>
                <p class="text-xs line-clamp-2" style="color: var(--color-ink-4)">{{ preset.desc }}</p>
                <span class="inline-block text-[10px] font-mono font-semibold uppercase text-amber-700 pt-1">点击套用预设 &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
      </div>
      </div>

      <!-- Right Live Preview Drawer Column (When Double-Screen Active) -->
      <div v-if="showLivePreview" class="relative sticky top-6 h-[calc(100vh-80px)] rounded-2xl overflow-hidden shadow-2xl border border-black/10 flex flex-col z-20" style="background: var(--glass-bg)">
        <div class="h-10 px-4 flex items-center justify-between border-b flex-shrink-0" style="background: rgba(0,0,0,0.03); border-color: var(--color-border)">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span class="text-[10px] font-mono ml-2 opacity-60">实时全双屏渲染画布 (Live Canvas)</span>
          </div>
          <button type="button" @click="refreshPreview" class="text-[10px] font-mono hover:underline opacity-80" style="color: var(--color-ink-1)">🔄 刷新预览</button>
        </div>
        <iframe ref="previewIframe" src="/" class="w-full flex-1 border-none" />
      </div>

    </div>

    <!-- Sliding Drawer Modal (For Projects) -->
    <Transition name="drawer">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex justify-end">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal" />
        <div class="relative w-full max-w-5xl h-full flex flex-col shadow-2xl overflow-hidden font-sans"
             style="background: var(--color-bg); border-left: 1px solid var(--color-border)">

          <div class="flex items-center justify-between p-6" style="border-bottom: 1px solid var(--color-border)">
            <div>
              <h2 class="font-display text-lg font-bold" style="color: var(--color-ink-1)">{{ isEditing ? '编辑作品' : '录入新作品' }}</h2>
            </div>
            <button @click="closeModal" class="p-1.5 rounded-lg hover:bg-black/5 transition-colors" style="color: var(--color-ink-4)">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
            <!-- Form -->
            <div class="flex-1 p-6 overflow-y-auto space-y-6" style="background: rgba(0,0,0,0.01); border-right: 1px solid var(--color-border)">
              
              <!-- ✨ AI Magic Auto-Fill Bar (带有微光流效) -->
              <div class="ai-shimmer-card p-4 rounded-2xl relative overflow-hidden mb-6 select-none" style="background: linear-gradient(135deg, rgba(217, 119, 6, 0.08), rgba(245, 158, 11, 0.03)); border: 1px solid rgba(217, 119, 6, 0.25);">
                <div class="ai-shimmer-stream" />
                <div class="relative z-10 space-y-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-base animate-pulse">✨</span>
                      <span class="font-display font-bold text-xs tracking-wide text-amber-800 uppercase">AI Magic Auto-Fill 智能一键生成</span>
                      <span class="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-700/10 text-amber-800 border border-amber-700/20">AIGC 剪辑/调色/规格全套生成</span>
                    </div>
                    <span class="text-[10px] font-mono text-amber-800/60 hidden sm:inline">支持广告/电影/MV/AI视频/科技/纪录片</span>
                  </div>

                  <div class="flex gap-2">
                    <input
                      v-model="aiPromptInput"
                      type="text"
                      placeholder="输入影片名称或简述（如：保时捷 911 概念商业广告、AI视频Sora生成短片、极简时尚MV）"
                      class="form-input text-xs flex-1 bg-white/80 backdrop-blur-sm border-amber-600/20 focus:border-amber-600 focus:ring-amber-500/20"
                      @keydown.enter.prevent="handleAiAutoFill"
                    />
                    <button
                      type="button"
                      @click="handleAiAutoFill"
                      :disabled="aiGenerating"
                      class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
                    >
                      <span v-if="aiGenerating" class="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span v-else>✨ AI 智能生成</span>
                    </button>
                  </div>
                </div>
              </div>

              <form @submit.prevent="saveProject" class="space-y-6">
                <div class="grid sm:grid-cols-3 gap-4">
                  <div class="space-y-1.5">
                    <label class="form-label">唯一 ID (Slug)</label>
                    <input v-model="form.slug" :disabled="isEditing" required class="form-input font-mono" placeholder="tvc-commercial" />
                  </div>
                  <div class="space-y-1.5">
                    <label class="form-label">项目名称</label>
                    <input v-model="form.title" required class="form-input font-display font-bold" placeholder="例如：TVC 商业广告" />
                  </div>
                  <div class="space-y-1.5">
                    <label class="form-label flex items-center justify-between">
                      <span>海报大字编号 (Display No.)</span>
                      <span class="text-[9px] text-amber-700 font-mono">1 - 999 自由填写</span>
                    </label>
                    <input v-model="form.displayNumber" class="form-input font-mono font-bold text-amber-800 text-center" placeholder="如 01, 08, 99 (留空自动按序)" />
                  </div>
                </div>
                <div class="space-y-4">
                  <div class="space-y-1.5">
                    <label class="form-label flex items-center justify-between">
                      <span>精修封面图片 URL</span>
                      <span class="text-[9px] font-normal text-amber-700 font-mono">(留空则自动生成动态视频封面)</span>
                    </label>
                    <div class="flex gap-2">
                      <input v-model="form.image" class="form-input font-mono flex-1" placeholder="https://... (留空自动生成动态封面)" />
                      <label class="btn-ghost text-xs py-2 px-4 cursor-pointer flex items-center justify-center border border-dashed rounded-xl" style="border-color: var(--color-border-2); background: transparent;">
                        <span>📤 上传</span>
                        <input type="file" accept="image/*" class="hidden" @change="uploadProjectCover" />
                      </label>
                    </div>
                  </div>
                  <div class="space-y-1.5">
                    <label class="form-label flex items-center justify-between">
                      <span>调色前对比原片 URL</span>
                      <span class="text-[9px] font-normal" style="color: var(--color-ink-5)">(可选，用于对比滑块)</span>
                    </label>
                    <input v-model="form.imageBefore" class="form-input font-mono" placeholder="https://... (不开启请留空)" />
                  </div>
                  <div class="space-y-1.5">
                    <label class="form-label flex items-center justify-between">
                      <span>视频 MP4 链接列表</span>
                      <span class="text-[9px] font-normal text-amber-700 font-mono">(可选，详情页播放器播放使用)</span>
                    </label>
                    <div class="space-y-2">
                      <div v-for="(_, idx) in form.videoUrls" :key="idx" class="flex gap-2">
                        <input
                          v-model="form.videoUrls[idx]"
                          class="form-input font-mono flex-1"
                          :placeholder="idx === 0 ? 'https://...mp4 (主播放视频)' : 'https://...mp4 (备用/多视角版本)'"
                        />
                        <button
                          type="button"
                          @click="removeProjectVideo(idx)"
                          class="btn-ghost text-xs px-3 text-rose-500 hover:text-rose-600 font-bold"
                          :disabled="form.videoUrls.length === 1"
                        >
                          删除
                        </button>
                      </div>
                      <button
                        type="button"
                        @click="addProjectVideo"
                        class="btn-ghost text-xs py-2 px-3 hover:text-amber-700 font-bold"
                        :disabled="form.videoUrls.length >= MAX_PROJECT_VIDEOS"
                      >
                        + 添加视频链接
                      </button>
                    </div>
                    <p class="text-[10px] leading-relaxed" style="color: var(--color-ink-5)">注：排在首位的链接将作为卡片封面预览视频。所有填入的链接均可在作品详情页进行多版本/机位自由切换播放。</p>
                  </div>
                </div>
                <!-- Featured & Password Protection Row -->
                 <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div class="flex items-center gap-2">
                     <input id="featured" type="checkbox" v-model="form.featured" class="w-4 h-4 rounded cursor-pointer" />
                     <label for="featured" class="text-xs select-none cursor-pointer" style="color: var(--color-ink-3)">设为首页精选置顶</label>
                   </div>
                   <div class="space-y-1.5">
                     <label class="form-label flex items-center gap-1">
                       <span>🔐 访问保护密码</span>
                       <span class="text-[9px] font-normal" style="color: var(--color-ink-5)">(留空则完全公开)</span>
                     </label>
                     <div class="flex gap-2">
                       <input v-model="form.password" type="text" class="form-input font-mono text-xs flex-1" placeholder="例如: client2026 (无密码请留空)" />
                       <button type="button" @click="form.password = generateRandomPassword()" class="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20 hover:bg-amber-500/20 whitespace-nowrap">随机生成</button>
                     </div>
                   </div>
                 </div>

                 <!-- Technical Specifications Grid -->
                 <div class="p-4 rounded-xl space-y-4" style="background: rgba(255, 255, 255, 0.4); border: 1px solid var(--color-border-2)">
                   <p class="text-[10px] font-bold font-mono tracking-wider" style="color: var(--color-ink-3)">🎥 视频技术规格与参数</p>
                   <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                     <div class="space-y-1">
                       <label class="text-[10px] font-medium" style="color: var(--color-ink-3)">发布年份</label>
                       <input v-model="form.releaseYear" class="form-input text-xs py-1.5 px-3" placeholder="例如: 2026" />
                     </div>
                     <div class="space-y-1">
                       <label class="text-[10px] font-medium" style="color: var(--color-ink-3)">剪辑/调色规格</label>
                       <input v-model="form.postSpecs" class="form-input text-xs py-1.5 px-3" placeholder="例如: 4K 60FPS HDR" />
                     </div>
                     <div class="space-y-1">
                       <label class="text-[10px] font-medium" style="color: var(--color-ink-3)">导演/后期指导</label>
                       <input v-model="form.director" class="form-input text-xs py-1.5 px-3" placeholder="例如: Xo" />
                     </div>
                     <div class="space-y-1 col-span-2 sm:col-span-1">
                       <label class="text-[10px] font-medium" style="color: var(--color-ink-3)">交付格式</label>
                       <input v-model="form.deliverFormat" class="form-input text-xs py-1.5 px-3 font-mono" placeholder="例如: ProRes 422 HQ" />
                     </div>
                     <div class="space-y-1 col-span-2">
                       <label class="text-[10px] font-medium" style="color: var(--color-ink-3)">音频编码规格</label>
                       <input v-model="form.audioFormat" class="form-input text-xs py-1.5 px-3 font-mono" placeholder="例如: 24-bit 48kHz" />
                     </div>
                   </div>
                 </div>

                <!-- Software -->
                <div class="space-y-2">
                  <label class="form-label">所用后期软件</label>
                  <div class="flex flex-wrap gap-2">
                    <button v-for="s in softwareList" :key="s" type="button" @click="toggleSoftware(s)"
                            :class="['px-3 py-1.5 rounded-full text-xs font-medium border transition-all', form.software.includes(s) ? 'shadow-sm' : '']"
                            :style="form.software.includes(s)
                              ? { background: 'var(--color-bronze-bg)', color: 'var(--color-bronze)', border: '1px solid rgba(180,83,9,0.2)' }
                              : { background: 'transparent', color: 'var(--color-ink-4)', border: '1px solid var(--color-border-2)' }">
                      {{ s }}
                    </button>
                  </div>
                </div>
                <!-- Tags -->
                <div class="space-y-2">
                  <label class="form-label">项目标签</label>
                  <div class="flex flex-wrap gap-1.5 p-2 rounded-xl min-h-[42px] items-center"
                       style="background: rgba(255,255,255,0.8); border: 1px solid var(--color-border-2)">
                    <span v-for="tag in form.tags" :key="tag" class="badge inline-flex items-center gap-1">
                      {{ tag }}
                      <button type="button" @click="removeTag(tag)" class="ml-1 opacity-60 hover:opacity-100 font-bold text-xs">×</button>
                    </span>
                    <input v-model="tempTagInput" @keydown.enter.prevent="addTag" @keydown.comma.prevent="addTag"
                           placeholder="输入后回车" class="flex-1 bg-transparent border-none text-xs focus:outline-none min-w-[100px]"
                           style="color: var(--color-ink-1)" />
                  </div>
                </div>

                <!-- Descriptions -->
                <div class="space-y-4">
                  <div class="space-y-1.5">
                    <label class="form-label">项目简短概述</label>
                    <input v-model="form.description" required class="form-input" />
                  </div>
                  <div class="space-y-1.5">
                    <label class="form-label">深度后期理念解析</label>
                    <textarea v-model="form.longDescription" rows="4" class="form-input resize-none" />
                  </div>
                </div>
                <!-- Workflow -->
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <label class="form-label">幕后制作工作流步骤</label>
                    <button type="button" @click="addWorkflowStep" class="text-xs font-bold hover:text-amber-700" style="color: var(--color-ink-1)">+ 添加步骤</button>
                  </div>
                  <div class="space-y-3">
                    <div v-for="(step, idx) in form.workflow" :key="idx"
                         class="p-4 rounded-xl space-y-3 relative shadow-sm" style="background: rgba(255,255,255,0.85); border: 1px solid var(--color-border)">
                      <button type="button" @click="removeWorkflowStep(idx)" class="absolute top-3 right-3 text-rose-500 hover:text-rose-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      <div class="grid grid-cols-6 gap-2">
                        <div class="col-span-1 relative">
                          <input
                            v-model="step.icon"
                            @focus="activeEmojiPickerIdx = idx"
                            @blur="handleEmojiBlur"
                            class="form-input text-center font-bold w-full"
                            placeholder="⚡"
                          />
                          <!-- Emoji Picker Dropdown -->
                          <Transition name="popover">
                            <div
                              v-if="activeEmojiPickerIdx === idx"
                              class="absolute top-full left-0 mt-2 p-2.5 rounded-xl z-30 grid grid-cols-6 gap-1 w-48 shadow-xl backdrop-blur-md"
                              style="background: rgba(251, 249, 245, 0.96); border: 1px solid rgba(180, 150, 110, 0.22); box-shadow: 0 10px 25px -5px rgba(80, 60, 30, 0.12);"
                            >
                              <button
                                v-for="emoji in presetEmojis"
                                :key="emoji"
                                type="button"
                                @mousedown.prevent="selectEmoji(idx, emoji)"
                                class="w-6.5 h-6.5 flex items-center justify-center text-sm rounded-lg transition-all duration-200 active:scale-90 hover:bg-amber-700/10 hover:text-amber-700"
                                style="color: var(--color-ink-2); background: transparent;"
                              >
                                {{ emoji }}
                              </button>
                            </div>
                          </Transition>
                        </div>
                        <input v-model="step.title" class="form-input col-span-5 font-display font-bold" />
                      </div>
                      <input v-model="step.desc" class="form-input" />
                    </div>
                  </div>
                </div>
                <button type="submit" ref="submitButtonRef" class="hidden">Submit</button>
              </form>
            </div>
            <!-- Preview -->
            <div class="w-full lg:w-96 p-6 overflow-y-auto flex flex-col justify-start space-y-6" style="background: rgba(0,0,0,0.02)">
              <h3 class="text-[10px] font-semibold uppercase tracking-wider font-mono" style="color: var(--color-ink-5)">卡片实时预览</h3>
              <div class="rounded-2xl overflow-hidden" style="border: 1px dashed var(--color-border-2)">
                <BentoItem :span="form.featured ? '12:6:8' : '12:6:4'" class="shadow-md">
                  <div class="h-44 relative overflow-hidden flex items-center justify-center" style="background: var(--color-bg-2)">
                    <img v-if="form.image && isValidImage" :src="form.image" class="w-full h-full object-cover" alt="" />
                    <DefaultArtPoster
                      v-else
                      :title="form.title || '创意视频'"
                      index="01"
                      :category="form.tags?.[0] || ''"
                      :description="form.description || '用创意点亮灵感，用镜头讲述故事...'"
                      class="w-full h-full"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  </div>
                  <div class="p-5 space-y-2.5">
                    <h4 class="font-display font-semibold text-sm line-clamp-1" style="color: var(--color-ink-1)">{{ form.title || '（未输入名称）' }}</h4>
                    <p class="text-[11px] line-clamp-1 mt-0.5" style="color: var(--color-ink-5)">{{ form.description || '一句话概述...' }}</p>
                    <div class="flex flex-wrap gap-1 pt-1">
                      <span v-for="tag in form.tags" :key="tag" class="badge text-[9px]">{{ tag }}</span>
                    </div>
                  </div>
                </BentoItem>
              </div>
            </div>
          </div>

          <div class="p-6 flex items-center justify-end gap-3" style="border-top: 1px solid var(--color-border)">
            <button type="button" @click="closeModal" class="btn-ghost text-xs py-2 px-4">取消</button>
            <button type="button" @click="triggerFormSubmit" class="btn-primary text-xs py-2 px-6">保存作品</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Sliding Drawer Modal (For Editing Users) -->
    <Transition name="drawer">
      <div v-if="isUserModalOpen" class="fixed inset-0 z-50 flex justify-end">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeUserModal" />
        <div class="relative w-full max-w-lg h-full flex flex-col shadow-2xl overflow-hidden font-sans"
             style="background: var(--color-bg); border-left: 1px solid var(--color-border)">

          <div class="flex items-center justify-between p-6" style="border-bottom: 1px solid var(--color-border)">
            <div>
              <h2 class="font-display text-lg font-bold" style="color: var(--color-ink-1)">编辑客户账号与权限</h2>
              <p class="text-[10px] font-mono uppercase tracking-wider mt-0.5" style="color: var(--color-ink-5)">Edit Account Credentials & Authorizations</p>
            </div>
            <button @click="closeUserModal" class="p-1.5 rounded-lg hover:bg-black/5 transition-colors" style="color: var(--color-ink-4)">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Account Info -->
            <div class="space-y-4">
              <h3 class="text-xs font-mono font-semibold uppercase tracking-wider pb-1 border-b" style="color: var(--color-ink-3)">基础账号信息</h3>
              
              <div class="space-y-1.5">
                <label class="form-label">用户名</label>
                <input :value="userForm.username" type="text" disabled class="form-input opacity-60 bg-black/[0.02]" />
              </div>

              <div class="space-y-1.5">
                <label class="form-label">电子邮件</label>
                <input v-model="userForm.email" type="email" class="form-input font-mono" placeholder="client@example.com" />
              </div>

              <div class="space-y-1.5">
                <label class="form-label">微信号</label>
                <input v-model="userForm.wechat" type="text" class="form-input font-mono" placeholder="wechat_123" />
              </div>

              <div class="space-y-1.5">
                <label class="form-label">账号角色 / 状态</label>
                <select v-model="userForm.role" class="form-input">
                  <option value="client">🟢 client (普通客户账号)</option>
                  <option value="disabled">🔴 disabled (禁用该账号登录)</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="form-label">重置账户密码</label>
                <input v-model="userForm.password" type="text" class="form-input font-mono" placeholder="留空表示不修改密码" />
                <p class="text-[9px] text-slate-400 font-mono">若客户遗失密码，在此处输入新密码（至少 6 位）保存即可重置。</p>
              </div>
            </div>

            <!-- Project Permissions -->
            <div class="space-y-4 pt-2">
              <h3 class="text-xs font-mono font-semibold uppercase tracking-wider pb-1 border-b" style="color: var(--color-ink-3)">作品授权范围</h3>
              <p class="text-[10px] text-amber-800 font-sans leading-relaxed">您可以限制该客户只能提取特定加密作品的访问密码。若不勾选任何项目，则默认授权访问<b>所有</b>加密作品。</p>
              
              <div class="space-y-2 max-h-60 overflow-y-auto p-3 rounded-xl border bg-black/[0.01]" style="border-color: var(--color-border-2)">
                <div v-for="p in lockedProjects" :key="p.slug" class="flex items-start gap-2.5 py-1.5">
                  <input
                    type="checkbox"
                    :id="'user-proj-' + p.slug"
                    :value="p.slug"
                    v-model="selectedUserProjects"
                    class="mt-0.5 rounded border-gray-300 text-amber-700 focus:ring-amber-500"
                  />
                  <label :for="'user-proj-' + p.slug" class="text-xs select-none cursor-pointer" style="color: var(--color-ink-2)">
                    <span class="font-semibold" style="color: var(--color-ink-1)">{{ p.title }}</span>
                    <span class="text-[10px] font-mono opacity-60 block mt-0.5">slug: {{ p.slug }}</span>
                  </label>
                </div>
                <div v-if="lockedProjects.length === 0" class="text-center py-6 text-[10px] text-slate-400">
                  当前未配置任何设置了访问密码的加密作品。
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 flex items-center justify-end gap-3" style="border-top: 1px solid var(--color-border)">
            <button type="button" @click="closeUserModal" class="btn-ghost text-xs py-2 px-4">取消</button>
            <button type="button" @click="saveUser" class="btn-primary text-xs py-2 px-6">保存资料与权限</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const showAiNoticeModal = ref(false)
const aiNoticePrompt = ref('2026 下半年商业 TVC 视觉制作与电影 DI 调色开放预订中')
const isAiNoticeGenerating = ref(false)

const showAiMusicModal = ref(false)
const aiMusicPrompt = ref('极具科技动感与高级沉浸氛围的赛博律动电子乐')
const isAiMusicGenerating = ref(false)

const openNoticeAiModal = () => {
  aiNoticePrompt.value = '2026 下半年商业 TVC 视觉制作与电影 DI 调色开放预订中'
  showAiNoticeModal.value = true
}

const openMusicAiModal = () => {
  aiMusicPrompt.value = '极具科技动感与高级沉浸氛围的赛博律动电子乐'
  showAiMusicModal.value = true
}

const confirmAiNoticeGeneration = async () => {
  isAiNoticeGenerating.value = true
  try {
    const res = await $fetch('/api/ai/assistant', {
      method: 'POST',
      body: { action: 'generate-notice-copy', prompt: aiNoticePrompt.value }
    }) as any
    if (res && res.text) {
      if (!siteConfig.value) siteConfig.value = {}
      if (!siteConfig.value.announcement) siteConfig.value.announcement = {}
      siteConfig.value.announcement.text = res.text
      if (res.badgeText) siteConfig.value.announcement.badge = res.badgeText
      showToast('✨ AI 灵感大模型已为您生成并成功填充顶栏告示！')
      showAiNoticeModal.value = false
    }
  } catch (e: any) {
    showToast('AI 生成异常: ' + (e.message || '网络问题'))
  } finally {
    isAiNoticeGenerating.value = false
  }
}

const confirmAiMusicGeneration = async () => {
  isAiMusicGenerating.value = true
  try {
    const res = await $fetch('/api/ai/assistant', {
      method: 'POST',
      body: { action: 'recommend-soundscape', prompt: aiMusicPrompt.value }
    }) as any
    if (res) {
      if (!siteConfig.value) siteConfig.value = {}
      if (!siteConfig.value.music) siteConfig.value.music = {}
      if (res.musicUrl) siteConfig.value.music.url = res.musicUrl
      if (res.musicTitle) siteConfig.value.music.title = res.musicTitle
      showToast('✨ AI 已根据您的律动诉求成功配置背景音效！')
      showAiMusicModal.value = false
    }
  } catch (e: any) {
    showToast('AI 音频推荐异常: ' + (e.message || '网络问题'))
  } finally {
    isAiMusicGenerating.value = false
  }
}
definePageMeta({
  validate: (route) => {
    const staticPages = ['login', 'register', 'about', 'projects']
    return !staticPages.includes(route.params.adminSuffix as string)
  }
})

const route = useRoute()
const router = useRouter()
const currentSuffix = route.params.adminSuffix as string

// Fetch config to validate suffix (only on client or SSR)
const { data: _rawConfig } = await useFetch<any>('/api/site-config')
const configuredPath = _rawConfig.value?.admin?.adminPath || 'admin'

// If the suffix in the URL doesn't match the configured admin path, redirect to 404
if (currentSuffix !== configuredPath) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found.' })
}

useHead({ title: '配置工作台 — xo.dev' })

const isLoggedIn = ref(false)
const isCheckingAuth = ref(true)
const loginLoading = ref(false)
const loginError = ref('')
const loginForm = ref({ username: '', password: '' })

const handlePresetAudioSelect = (e: Event) => {
  const val = (e.target as HTMLSelectElement).value
  if (val && val !== 'custom') {
    siteConfig.value.music.url = val
  }
}

const exportFullBackup = async () => {
  try {
    const [cfg, projs, usrs, bl] = await Promise.all([
      $fetch('/api/site-config'),
      $fetch('/api/admin/projects'),
      $fetch('/api/admin/users'),
      $fetch('/api/admin/blacklist')
    ])

    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      siteConfig: cfg,
      projects: projs,
      users: usrs,
      blacklist: bl
    }

    const jsonStr = JSON.stringify(backupData, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const dStr = new Date().toISOString().slice(0, 10)
    a.download = `xo-site-backup-${dStr}.json`
    a.click()
    URL.revokeObjectURL(url)
  } catch (err: any) {
    alert(err.statusMessage || '导出全站 JSON 备份失败。')
  }
}

const handleBackupFileSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (evt) => {
    try {
      const raw = evt.target?.result as string
      const data = JSON.parse(raw)

      if (!data || typeof data !== 'object') {
        alert('文件格式错误：请上传有效的 JSON 备份包。')
        return
      }

      const projCount = Array.isArray(data.projects) ? data.projects.length : 0
      const userCount = Array.isArray(data.users) ? data.users.length : 0

      const confirmMsg = `检测到备份包包含：\n- 站点全套配置\n- ${projCount} 个视频作品\n- ${userCount} 个注册客户账号\n\n确认要导入此备份并恢复站点设置吗？`
      if (!confirm(confirmMsg)) return

      if (data.siteConfig) {
        siteConfig.value = { ...siteConfig.value, ...data.siteConfig }
        await saveSiteConfig()
      }

      alert('✅ 全站 JSON 备份已成功导入并还原！')
    } catch (err) {
      alert('解析 JSON 备份文件失败，请确认文件完整性。')
    }
  }
  reader.readAsText(file)
}

const createLocalSnapshot = () => {
  try {
    const snap = {
      timestamp: Date.now(),
      siteConfig: JSON.parse(JSON.stringify(siteConfig.value))
    }
    localStorage.setItem('xo_local_snapshot', JSON.stringify(snap))
    alert('📸 本地沙盒快照创建成功！已记录当前时刻的站点配置。')
  } catch (e) {
    alert('创建本地快照失败。')
  }
}

const restoreLocalSnapshot = () => {
  try {
    const raw = localStorage.getItem('xo_local_snapshot')
    if (!raw) {
      alert('未找到本地快照。请先点击【📸 创建本地快照】。')
      return
    }
    const snap = JSON.parse(raw)
    if (snap && snap.siteConfig) {
      const tStr = new Date(snap.timestamp).toLocaleString('zh-CN')
      if (!confirm(`确认要将全站配置回滚到【${tStr}】创建的快照吗？`)) return
      siteConfig.value = { ...siteConfig.value, ...snap.siteConfig }
      alert('⏪ 已成功恢复至上次快照版本！点击右上角【保存】即可写入生效。')
    }
  } catch (e) {
    alert('恢复本地快照失败。')
  }
}

const resetToFactoryDefaults = () => {
  if (!confirm('⚠️ 警告：确认要将站点恢复为出厂初始设置吗？此操作不可逆！')) return
  siteConfig.value = {
    siteInfo: {
      brandName: 'Xo Studio', ownerName: 'Xo', ownerInitial: 'Z', avatar: '',
      contactEmail: 'hello@xo.dev', vimeoUrl: '', githubUrl: '', twitterUrl: '', linkedinUrl: '',
      bilibiliUrl: '', youtubeUrl: '', instagramUrl: '', whatsappNumber: '', wechatId: '',
      seoTitle: 'Xo Studio · 影视剪辑 & DI 电影调色工作室', seoDescription: '专注极致剪辑节奏与 Quiet Luxury 高奢色彩科学。', footerTagline: '基于达芬奇色彩科学规范开发'
    },
    theme: { accentPreset: 'bronze', glassBlur: 'md', showOrbs: true, showFilmGrain: true },
    announcement: { enabled: true, position: 'capsule', animation: 'pulse', badge: 'NOTICE', badgeColor: 'amber', text: '🎬 2026 年下半年商业 TVC 档期与电影 DI 调色开放预订中', link: '' },
    music: { enabled: true, label: 'AMBIENT AUDIO', url: 'https://assets.mixkit.co/music/preview/mixkit-ambient-dream-12.mp3', volume: 70 },
    home: { heroTitle1: 'Xo Studio', heroTitle2: 'CRAFTING VISUAL RHYTHM', heroTitle3: '', heroSub: '结合极致节奏感的镜头拼贴、电影级调色与科技感三维包装。', statValue1: '120+', statLabel1: 'COMMERCIALS', statValue2: '15+', statLabel2: 'FILM AWARDS', profileCardTitle: '主理人剪辑师', profileCardSub: 'Xo · Senior Video Editor & DI Colorist', profileCardDesc: '拥有 8 年商业广告、电影短片与顶级大厂主视觉后期经验。', skillsTags: ['达芬奇调色', '商业卡点', '三维合成', '声音设计'], bookingStatus: '档期开放预订中', heroVideoUrl: '', heroVideoPoster: '', heroTechStack: ['DaVinci Resolve', 'Premiere Pro', 'After Effects', 'Cinema 4D'], featuredProject1: '', featuredProject2: '' },
    about: { role: '资深剪辑师 / DI 色彩总监', bio: '深耕商业 TVC、电影短片与 AIGC 视觉生成。', bioSub: '以 Quiet Luxury 奢华调色与极致剪辑节奏，诠释每一帧光影故事。', skills: [], experiences: [], philosophies: [] }
  }
  alert('⚠️ 已还原为出厂默认设置。点击【保存】使生效。')
}

const activeEmojiPickerIdx = ref<number | null>(null)
const presetEmojis = [
  // 🎥 影视、摄像与监视 (Cinematography, Cameras & Monitoring)
  '🎬', '🎥', '🎞️', '📹', '📽️', '📼', '📺', '🖥️',
  // 🎨 剪辑、色彩与布光 (Editing, Color Grading & Lighting)
  '✂️', '🎨', '🖌️', '🌈', '🌓', '🔆', '🕯️', '🕶️',
  // 🎧 录音、声音设计与声效 (Audio & Sound Design)
  '🎧', '🔊', '🎙️', '🎤', '🎹', '📣', '🎵', '🎼',
  // ⚡ 流程、渲染与特效 (Rendering, VFX & Export)
  '⚡', '✨', '⚙️', '💡', '🔍', '🚀', '⏱️', '🔥',
  // 📂 介质、文件与交互 (Media, Storage & Input)
  '📂', '💿', '💾', '📎'
]

const activeTab = ref('analytics')
watch(activeTab, (newTab) => {
  if (newTab === 'analytics') {
    fetchSystemStatus()
  }
})
const tabs = [
  { label: '数据看板', value: 'analytics', icon: '📊' },
  { label: '作品管理', value: 'projects', icon: '🎥' },
  { label: '授权申请', value: 'requests', icon: '🔑' },
  { label: '用户管理', value: 'users', icon: '👥' },
  { label: '首页配置', value: 'home', icon: '🏠' },
  { label: '个人履历', value: 'about', icon: '🙋' },
  { label: '站点信息', value: 'siteinfo', icon: '🌐' },
  { label: '高级设置', value: 'advanced', icon: '🎨' }
]

const showLivePreview = ref(false)
const previewIframe = ref<HTMLIFrameElement | null>(null)
const refreshPreview = () => {
  if (previewIframe.value) {
    previewIframe.value.src = previewIframe.value.src
  }
}

const accentOptions = [
  { label: '古铜哑金', value: 'bronze', color: '#b45309' },
  { label: '翡翠松绿', value: 'emerald', color: '#059669' },
  { label: '湛蓝深海', value: 'blue', color: '#2563eb' },
  { label: '紫罗兰影', value: 'violet', color: '#7c3aed' },
  { label: '玄武暗炭', value: 'slate', color: '#27272a' }
]

const personaPresets = [
  {
    id: 'colorist',
    emoji: '🎨',
    title: '电影级 DI 调色总监',
    desc: '主打高精色彩科学（ACES / DaVinci Resolve）、胶片质感及大片视觉张力。',
    home: {
      heroTitle1: '用色彩',
      heroTitle2: '唤醒情绪',
      heroTitle3: '与视觉',
      heroSub: '资深 DI 调色总监。深耕达芬奇色彩科学规范与 ACES 协作流，主导过多部院线电影、高端汽车 TVC 的调色美学搭建。',
      skillsTags: ['Resolve', 'Color Grading', 'ACES Workflow', 'Film Emulation', 'HDR Mastering'],
      heroTechStack: ['DaVinci Resolve', 'ACES workflow', 'Color Management', 'HDR Grading']
    },
    about: {
      role: '电影后期调色指导 & 达芬奇认证调色师',
      bio: '你好，我是 Xo，一名追求极致色彩科学与情绪传递的调色师。拥有 5 年高规项目调色经验，曾为多个豪车品牌、院线电影提供后期调色与画面风格定制方案。',
      bioSub: '色彩不仅是亮度和色相的堆叠，更是镜头之下不可分割的情感催化剂。我专注于搭建完美的色彩管线，实现从监视器到最终发行的最高保真度呈现。',
      skills: [
        { name: 'Color Grading', level: 98 },
        { name: 'Color Science', level: 95 },
        { name: 'HDR Calibration', level: 90 },
        { name: 'VFX Conform', level: 85 }
      ]
    }
  },
  {
    id: 'editor',
    emoji: '📹',
    title: 'TVC 商业广告剪辑指导',
    desc: '重节拍、极强节奏感、新潮转场、蒙太奇风格，主攻数码新品、运动潮流类商业短片。',
    home: {
      heroTitle1: '用镜头',
      heroTitle2: '剪刻节奏',
      heroTitle3: '与潮流',
      heroSub: '新锐商业视频剪辑指导。擅长重节拍、创意转场与赛博朋克风蒙太奇，为顶级数码大厂、潮流街头品牌打造过数十支百万级播放爆款短片。',
      skillsTags: ['Premiere Pro', 'Speed Ramp', 'Sound Design', 'Hip-Hop Beat', 'Match Cut'],
      heroTechStack: ['Pr / Resolve', 'Logic Pro Foley', 'Kinetic Typography', 'Sound Design']
    },
    about: {
      role: '商业广告剪辑指导 & 声画设计总监',
      bio: '你好，我是 Xo，一名专注于将潮流节奏与叙事冲突完美融合的剪辑指导。主导过近百支商业 TVC 的精剪与音效微调，擅长通过非线性蒙太奇捕获年轻一代的注意力。',
      bioSub: '剪辑是重组时空的魔术。在适当的时刻切准拍子，搭配拟真的声音微雕，能让一块平面的屏幕迸发出三维的空间深度和窒息的节奏感。',
      skills: [
        { name: 'Video Editing', level: 98 },
        { name: 'Sound Foley', level: 90 },
        { name: 'Speed Ramping', level: 95 },
        { name: 'Creative Montages', level: 92 }
      ]
    }
  },
  {
    id: 'vfx',
    emoji: '✨',
    title: '三维动效与 VFX 特效师',
    desc: '主攻 Cinema 4D、Octane / Redshift 渲染、超现实科技感产品动效以及高维视觉包装。',
    home: {
      heroTitle1: '构建',
      heroTitle2: '超现实',
      heroTitle3: '数字维度',
      heroSub: '高级三维动效设计师 & VFX 合成师。主攻 C4D 三维数字资产建模、光影物理渲染与超强未来科技感创意包装，实现天马行空的想象落地。',
      skillsTags: ['Cinema 4D', 'Octane Render', 'After Effects', 'Particle Physics', '3D Modeling'],
      heroTechStack: ['C4D / Octane', 'After Effects VFX', 'Redshift Rendering', 'Compositing']
    },
    about: {
      role: '三维视觉包装总监 & 创意 CG 特效师',
      bio: '你好，我是 Xo，一名热衷于探索虚拟光影边界的三维动效设计师。精通三维硬表面建模、动力学模拟与复杂后期通道合成，擅长用数字艺术重组未来的可能性。',
      bioSub: '从无到有地渲染出一个发光的元宇宙世界是最令人兴奋的事。用写实的光栅折射、精细的表面材质和超现实 the 物理粒子，搭建极致的科技美学空间。',
      skills: [
        { name: '3D CGI Modeling', level: 95 },
        { name: 'Physically Rendering', level: 92 },
        { name: 'VFX Compositing', level: 90 },
        { name: 'Dynamics Physics', level: 88 }
      ]
    }
  }
]

const applyPersona = (preset: any) => {
  if (confirm(`确定要套用“${preset.title}”的模板预设吗？这将覆盖您当前的部分首页和个人履历信息（未保存至服务器前不会写入物理文件）。`)) {
    siteConfig.value.home.heroTitle1 = preset.home.heroTitle1
    siteConfig.value.home.heroTitle2 = preset.home.heroTitle2
    siteConfig.value.home.heroTitle3 = preset.home.heroTitle3
    siteConfig.value.home.heroSub = preset.home.heroSub
    siteConfig.value.about.role = preset.about.role
    siteConfig.value.about.bio = preset.about.bio
    siteConfig.value.about.bioSub = preset.about.bioSub
    siteConfig.value.about.skills = JSON.parse(JSON.stringify(preset.about.skills))
    siteConfig.value.home.skillsTags = [...preset.home.skillsTags]
    siteConfig.value.home.heroTechStack = [...preset.home.heroTechStack]
  }
}

const exportBackup = () => {
  const data = {
    siteConfig: siteConfig.value,
    timestamp: new Date().toISOString()
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `xo-studio-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const importBackup = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const file = input.files[0]
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      if (data && data.siteConfig) {
        if (confirm('解析备份成功！确定要将备份数据导入并覆盖当前全站配置吗？（点击保存后才会永久存盘）')) {
          siteConfig.value = data.siteConfig
          initSocialSlots()
          alert('配置已导入，请点击页面顶部的“保存配置”按钮以永久写入服务器！')
        }
      } else {
        alert('无效的备份文件：未包含 siteConfig 节点。')
      }
    } catch (err) {
      alert('解析 JSON 备份文件失败，请检查文件格式。')
    }
  }
  reader.readAsText(file)
}

const systemStatus = ref<any>({
  engine: 'Local File System',
  status: 'Operational',
  latency: '—',
  ssl: 'Active (TLS 1.3)',
  dbHealth: '100%',
  todayViews: 0,
  yesterdayViews: 0,
  weekViews: 0,
  allTimeViews: 0,
  contactClicks: 0,
  trend: [],
  referrals: [],
  projectClicks: []
})

const projectsList = ref<any[]>([])
const siteConfig = useState<any>('site-config', () => ({
  siteInfo: {
    brandName: 'Xo', ownerName: 'Xo', ownerInitial: 'Z', avatar: '',
    contactEmail: 'hello@xo.dev', vimeoUrl: '', githubUrl: '', twitterUrl: '', linkedinUrl: '',
    bilibiliUrl: '', youtubeUrl: '', instagramUrl: '', whatsappNumber: '', wechatId: '',
    seoTitle: '', seoDescription: '', footerTagline: ''
  },
  theme: {
    accentPreset: 'bronze', glassBlur: 'md', showOrbs: true, showFilmGrain: true
  },
  announcement: {
    enabled: true, text: '', link: '', badge: 'NOTICE'
  },
  music: {
    enabled: true, label: 'AMBIENT AUDIO', url: ''
  },
  home: {
    heroTitle1: '', heroTitle2: '', heroTitle3: '', heroSub: '',
    statValue1: '', statLabel1: '', statValue2: '', statLabel2: '',
    profileCardTitle: '', profileCardSub: '', profileCardDesc: '',
    skillsTags: [], bookingStatus: '', heroVideoUrl: '', heroVideoPoster: '', heroTechStack: [],
    featuredProject1: '', featuredProject2: '', collaborativeBrands: []
  },
  about: { role: '', bio: '', bioSub: '', skills: [], experiences: [], philosophies: [] },
  admin: { username: 'admin', adminPath: 'admin' },
  emailSettings: {
    enabled: false,
    smtpHost: 'smtp.qq.com',
    smtpPort: 465,
    smtpSecure: true,
    smtpUser: '',
    smtpPass: '',
    senderName: 'Xo Studio',
    senderEmail: ''
  }
}))

const isModalOpen = ref(false)
const isEditing = ref(false)

const isUserModalOpen = ref(false)
const selectedUserProjects = ref<string[]>([])
const userForm = ref({
  id: '',
  username: '',
  email: '',
  wechat: '',
  role: 'client',
  password: '',
  allowedProjects: ''
})

const openEditUserModal = (u: any) => {
  userForm.value = {
    id: u.id,
    username: u.username,
    email: u.email || '',
    wechat: u.wechat || '',
    role: u.role || 'client',
    password: '',
    allowedProjects: u.allowedProjects || ''
  }
  selectedUserProjects.value = u.allowedProjects
    ? u.allowedProjects.split(',').map((s: string) => s.trim()).filter(Boolean)
    : []
  isUserModalOpen.value = true
}

const closeUserModal = () => {
  isUserModalOpen.value = false
}

const saveUser = async () => {
  try {
    userForm.value.allowedProjects = selectedUserProjects.value.join(',')
    await $fetch('/api/admin/users', {
      method: 'PUT',
      body: userForm.value
    })
    await fetchUsers()
    closeUserModal()
  } catch (err: any) {
    alert(err.data?.statusMessage || '保存用户信息失败。')
  }
}
const softwareList = [
  'Premiere Pro', 'DaVinci Resolve', 'After Effects', 'Cinema 4D',
  '即梦 AI', 'Runway Gen-3', 'Luma Dream Machine', '可灵 AI', 'ComfyUI', 'Midjourney', 'Sora',
  'Logic Pro', 'FCPX', 'Redshift', 'Octane', 'Stable Diffusion', 'Blender'
]
const tempTagInput = ref('')
const tempSkillsTagInput = ref('')
const tempHeroTechInput = ref('')
const tempExpInputs = ref<Record<number, string>>({})
const submitButtonRef = ref<HTMLButtonElement | null>(null)

const form = ref<any>({
  slug: '', title: '', image: '', imageBefore: '', videoUrl: '', videoUrls: [''], software: [], tags: [], featured: false, description: '', longDescription: '', workflow: [], password: '',
  releaseYear: '', postSpecs: '', director: '', isGraded: true, deliverFormat: '', audioFormat: ''
})

const MAX_PROJECT_VIDEOS = 10
const featuredCount = computed(() => projectsList.value.filter(p => p.featured).length)
const lockedProjects = computed(() => (projectsList.value || []).filter((p: any) => p.password && p.password.trim() !== ''))
const isValidImage = computed(() => form.value.image && /^https?:\/\/.*?\.(jpg|jpeg|png|webp|avif|gif)/i.test(form.value.image))

const normalizeProjectVideos = () => {
  const urls = Array.isArray(form.value.videoUrls)
    ? form.value.videoUrls
    : String(form.value.videoUrls || '').split(/[\n,，]+/g)
  const normalized = urls.map((url: string) => url?.trim()).filter(Boolean)
  const legacyUrl = form.value.videoUrl?.trim()
  if (legacyUrl && !normalized.includes(legacyUrl)) normalized.unshift(legacyUrl)
  const capped = normalized.slice(0, MAX_PROJECT_VIDEOS)
  form.value.videoUrls = capped.length ? capped : ['']
  form.value.videoUrl = capped[0] || ''
  return capped
}

const addProjectVideo = () => {
  if (!Array.isArray(form.value.videoUrls)) form.value.videoUrls = ['']
  if (form.value.videoUrls.length >= MAX_PROJECT_VIDEOS) return
  form.value.videoUrls.push('')
}

const removeProjectVideo = (idx: number) => {
  if (!Array.isArray(form.value.videoUrls) || form.value.videoUrls.length <= 1) return
  form.value.videoUrls.splice(idx, 1)
}

// ── Chart computed helpers ────────────────────────────────────────────
const chartMaxY = computed(() => {
  const vals = (systemStatus.value.trend || []).map((d: any) => d.views)
  return Math.max(...vals, 1)
})

const chartPoints = computed(() => {
  const trend = systemStatus.value.trend || []
  if (trend.length === 0) return []
  const maxV = Math.max(...trend.map((d: any) => d.views), 1)
  return trend.map((d: any, i: number) => ({
    x: (i / (trend.length - 1)) * 300,
    y: 100 - (d.views / maxV) * 95
  }))
})

const chartPath = computed(() => {
  const pts = chartPoints.value
  if (pts.length === 0) return ''
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
})

const chartAreaPath = computed(() => {
  const pts = chartPoints.value
  if (pts.length === 0) return ''
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  return `${line} L${pts[pts.length - 1].x.toFixed(1)},100 L0,100 Z`
})

// Tiny sparkline for today PV card (60x14 viewBox)
const sparkPoints = computed(() => {
  const trend = systemStatus.value.trend || []
  if (trend.length === 0) return []
  const maxV = Math.max(...trend.map((d: any) => d.views), 1)
  return trend.map((d: any, i: number) => ({
    x: (i / (trend.length - 1)) * 60,
    y: 14 - (d.views / maxV) * 12
  }))
})

const sparkPath = computed(() => {
  const pts = sparkPoints.value
  if (pts.length < 2) return ''
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
})

const sparkFillPath = computed(() => {
  const pts = sparkPoints.value
  if (pts.length < 2) return ''
  const lastX = pts[pts.length - 1].x.toFixed(1)
  const firstX = pts[0].x.toFixed(1)
  return `${sparkPath.value} L${lastX},14 L${firstX},14 Z`
})

const fetchProjects = async () => { projectsList.value = await $fetch('/api/admin/projects?t=' + Date.now()) as any[] }
const passwordRequests = ref<any[]>([])
const fetchPasswordRequests = async () => {
  try {
    passwordRequests.value = await $fetch('/api/password-requests?t=' + Date.now()) as any[]
  } catch (err) {
    console.error('Failed to fetch password requests:', err)
  }
}
const registeredUsers = ref<any[]>([])
const fetchUsers = async () => {
  try {
    registeredUsers.value = await $fetch('/api/admin/users?t=' + Date.now()) as any[]
  } catch (err) {
    console.error('Failed to fetch registered users:', err)
  }
}
const deleteUser = async (id: number | string) => {
  if (!confirm('确认要删除该注册用户账号吗？')) return
  try {
    await $fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
    await fetchUsers()
  } catch (err: any) {
    alert(err.statusMessage || '删除用户失败。')
  }
}

const toggleBlacklistRequestContact = async (r: any) => {
  const isCurrentlyBlocked = r.isBlacklisted || r.isAutoBlacklisted
  const target = r.contact || r.clientUsername || r.clientName
  const actionText = isCurrentlyBlocked ? '解除拉黑' : '拉黑防刷'
  
  if (!confirm(`确认要对【${target}】执行【${actionText}】操作吗？`)) return
  
  try {
    await $fetch('/api/admin/blacklist', {
      method: 'POST',
      body: {
        action: isCurrentlyBlocked ? 'remove' : 'add',
        value: target,
        type: 'contact',
        reason: '管理员手动操作'
      }
    })
    await fetchPasswordRequests()
    alert(`已成功对【${target}】执行 ${actionText}！`)
  } catch (err: any) {
    alert(err.statusMessage || '操作失败。')
  }
}

const toggleUserWhitelist = async (u: any) => {
  const nextVal = !u.isWhitelisted
  const actionText = nextVal ? '设置白名单（永不上锁防刷）' : '取消白名单'
  if (!confirm(`确认要将客户【${u.username}】${actionText}吗？`)) return
  try {
    await $fetch('/api/admin/users', {
      method: 'PUT',
      body: {
        id: u.id,
        email: u.email,
        wechat: u.wechat,
        role: u.role,
        allowedProjects: u.allowedProjects,
        isWhitelisted: nextVal
      }
    })
    await fetchUsers()
  } catch (err: any) {
    alert(err.statusMessage || '更新白名单状态失败。')
  }
}

const toggleUserBlacklist = async (u: any) => {
  const nextVal = !u.isBlacklisted
  const actionText = nextVal ? '拉黑用户（申请需手动审核）' : '解除拉黑'
  if (!confirm(`确认要将客户【${u.username}】${actionText}吗？`)) return
  try {
    await $fetch('/api/admin/users', {
      method: 'PUT',
      body: {
        id: u.id,
        email: u.email,
        wechat: u.wechat,
        role: u.role,
        allowedProjects: u.allowedProjects,
        isBlacklisted: nextVal
      }
    })
    await fetchUsers()
  } catch (err: any) {
    alert(err.statusMessage || '更新拉黑状态失败。')
  }
}

const fetchSiteConfig = async () => {
  const data = await $fetch('/api/site-config') as any
  if (!data.siteInfo) data.siteInfo = {}
  if (!data.theme) data.theme = {}
  if (!data.announcement) data.announcement = {}
  siteConfig.value = {
    siteInfo: {
      brandName: 'Xo', ownerName: 'Xo', ownerInitial: 'Z', avatar: '',
      contactEmail: 'hello@xo.dev', vimeoUrl: '', githubUrl: '', twitterUrl: '', linkedinUrl: '',
      bilibiliUrl: '', youtubeUrl: '', instagramUrl: '', whatsappNumber: '', wechatId: '',
      seoTitle: '', seoDescription: '', footerTagline: '基于达芬奇色彩科学规范开发',
      ...data.siteInfo
    },
    theme: {
      accentPreset: 'bronze', glassBlur: 'md', showOrbs: true, showFilmGrain: true,
      ...data.theme
    },
    announcement: {
      enabled: true, text: '', link: '', badge: 'NOTICE',
      ...data.announcement
    },
    music: {
      enabled: true, label: 'AMBIENT AUDIO', url: 'https://assets.mixkit.co/music/preview/mixkit-ambient-dream-12.mp3',
      ...data.music
    },
    home: { 
      heroTitle1: '', heroTitle2: '', heroTitle3: '', heroSub: '', 
      statValue1: '', statLabel1: '', statValue2: '', statLabel2: '', 
      profileCardTitle: '', profileCardSub: '', profileCardDesc: '', 
      skillsTags: [], bookingStatus: '', heroVideoUrl: '', heroVideoPoster: '', heroTechStack: [],
      featuredProject1: '', featuredProject2: '',
      ...data.home 
    },
    about: { role: '', bio: '', bioSub: '', skills: [], experiences: [], philosophies: [], ...data.about },
    admin: {
      username: 'admin',
      adminPath: 'admin',
      ...data.admin
    },
    emailSettings: {
      enabled: false,
      smtpHost: 'smtp.qq.com',
      smtpPort: 465,
      smtpSecure: true,
      smtpUser: '',
      smtpPass: '',
      senderName: 'Xo Studio',
      senderEmail: '',
      ...data.emailSettings
    },
    aiSettings: {
      provider: 'builtin',
      apiKey: '',
      apiEndpoint: 'https://api.deepseek.com/v1',
      modelName: 'deepseek-chat',
      ...data.aiSettings
    }
  }
  initSocialSlots()
}

// Dynamic Social Slots configuration helpers
const socialSlots = ref<{ platform: string; value: string }[]>([])

const platformOptions = [
  { value: 'vimeo', label: 'Vimeo', icon: '🎬', placeholder: 'https://vimeo.com/your-channel' },
  { value: 'bilibili', label: 'Bilibili', icon: '📺', placeholder: 'https://space.bilibili.com/your-uid' },
  { value: 'youtube', label: 'YouTube', icon: '🎥', placeholder: 'https://youtube.com/@your-channel' },
  { value: 'github', label: 'GitHub', icon: '🐙', placeholder: 'https://github.com/your-username' },
  { value: 'twitter', label: 'Twitter / X', icon: '𝕏', placeholder: 'https://twitter.com/your-username' },
  { value: 'instagram', label: 'Instagram', icon: '📸', placeholder: 'https://instagram.com/your-username' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/in/your-username' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬', placeholder: '例如: +86188xxxxxxxx' },
  { value: 'wechat', label: '微信 ID', icon: '💬', placeholder: '例如: wx_123456 (点击自动复制)' },
]

const getPlatformInfo = (platform: string) => {
  return platformOptions.find(o => o.value === platform) || { value: 'other', label: '自定义', icon: '🔗', placeholder: '请输入链接' }
}

const initSocialSlots = () => {
  const info = siteConfig.value?.siteInfo || {}
  const slots: { platform: string; value: string }[] = []
  
  const mapping: { [key: string]: keyof typeof info } = {
    vimeo: 'vimeoUrl',
    bilibili: 'bilibiliUrl',
    youtube: 'youtubeUrl',
    github: 'githubUrl',
    twitter: 'twitterUrl',
    instagram: 'instagramUrl',
    linkedin: 'linkedinUrl',
    whatsapp: 'whatsappNumber',
    wechat: 'wechatId'
  }
  
  Object.keys(mapping).forEach(platform => {
    const field = mapping[platform]
    const val = info[field]
    if (val !== undefined && val !== null && val !== '') {
      slots.push({ platform, value: String(val) })
    }
  })
  
  if (slots.length === 0) {
    slots.push({ platform: 'vimeo', value: '' })
    slots.push({ platform: 'github', value: '' })
    slots.push({ platform: 'twitter', value: '' })
    slots.push({ platform: 'linkedin', value: '' })
  }
  
  socialSlots.value = slots
}

const handleSocialSlotChange = () => {
  const info = siteConfig.value?.siteInfo
  if (!info) return
  
  info.vimeoUrl = ''
  info.bilibiliUrl = ''
  info.youtubeUrl = ''
  info.githubUrl = ''
  info.twitterUrl = ''
  info.instagramUrl = ''
  info.linkedinUrl = ''
  info.whatsappNumber = ''
  info.wechatId = ''
  
  const mapping: { [key: string]: string } = {
    vimeo: 'vimeoUrl',
    bilibili: 'bilibiliUrl',
    youtube: 'youtubeUrl',
    github: 'githubUrl',
    twitter: 'twitterUrl',
    instagram: 'instagramUrl',
    linkedin: 'linkedinUrl',
    whatsapp: 'whatsappNumber',
    wechat: 'wechatId'
  }
  
  socialSlots.value.forEach(slot => {
    const field = mapping[slot.platform]
    if (field) {
      info[field] = (slot.value || '').trim()
    }
  })
}

const addSocialSlot = () => {
  socialSlots.value.push({ platform: 'vimeo', value: '' })
  handleSocialSlotChange()
}

const removeSocialSlot = (index: number) => {
  socialSlots.value.splice(index, 1)
  handleSocialSlotChange()
}

// Custom simulated dropdown states & handlers
const openDropdownIndex = ref<number | null>(null)

const toggleSocialDropdown = (index: number) => {
  openDropdownIndex.value = openDropdownIndex.value === index ? null : index
}

const selectSocialPlatform = (index: number, platform: string) => {
  socialSlots.value[index].platform = platform
  openDropdownIndex.value = null
  handleSocialSlotChange()
}

if (import.meta.client) {
  window.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.social-dropdown-container')) {
      openDropdownIndex.value = null
    }
  })
}

const fetchSystemStatus = async () => {
  try {
    const res = await $fetch('/api/system-status?t=' + Date.now()) as any
    systemStatus.value = { ...res }
  } catch (e) {
    console.error('Failed to fetch system status:', e)
  }
}

const checkAuth = async () => {
  try {
    const user = await $fetch('/api/auth/me') as any
    if (user && user.username) {
      // Pre-load all data before revealing the panel — prevents blank screen on refresh
      await Promise.all([fetchProjects(), fetchSiteConfig(), fetchSystemStatus(), fetchPasswordRequests(), fetchUsers()])
      await nextTick()
      isLoggedIn.value = true
    }
  } catch (err) {
    isLoggedIn.value = false
  } finally {
    isCheckingAuth.value = false
  }
}

const handleLogin = async () => {
  loginLoading.value = true
  loginError.value = ''
  try {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: loginForm.value
    }) as any
    if (res.success) {
      // Fetch all data FIRST, then reveal the panel — prevents blank screen
      await Promise.all([fetchProjects(), fetchSiteConfig(), fetchSystemStatus(), fetchPasswordRequests(), fetchUsers()])
      await nextTick()
      isLoggedIn.value = true
      loginForm.value = { username: '', password: '' }
    }
  } catch (err: any) {
    loginError.value = err.data?.statusMessage || err.statusMessage || '登录认证失败，请检查用户名和密码。'
  } finally {
    loginLoading.value = false
  }
}

const handleLogout = async () => {
  if (!confirm('确认要退出登录吗？')) return
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    isLoggedIn.value = false
    projectsList.value = []
  } catch (err: any) {
    alert(err.statusMessage || '退出失败')
  }
}

let statusTimer: any = null
let sseSource: EventSource | null = null

onMounted(() => {
  checkAuth()
  const observer = new IntersectionObserver(
    (entries) => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view') }) },
    { threshold: 0.1 }
  )
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))

  if (import.meta.client) {
    // Unconditional fast status polling every 1.5 seconds for instant zero-lag updates
    statusTimer = setInterval(() => {
      if (isLoggedIn.value) {
        fetchSystemStatus()
      }
    }, 1500)

    // Real-time SSE push connection for zero-delay instant updates
    try {
      sseSource = new EventSource('/api/analytics/stream')
      const handleUpdate = () => {
        if (isLoggedIn.value) {
          fetchSystemStatus()
        }
      }
      sseSource.onmessage = handleUpdate
      sseSource.addEventListener('update', handleUpdate)
    } catch {}
  }
})

onBeforeUnmount(() => {
  if (statusTimer) clearInterval(statusTimer)
  if (sseSource) {
    try { sseSource.close() } catch {}
  }
})

const adminNewPassword = ref('')

const saveSiteConfig = async () => {
  try {
    // Validate adminPath: must be non-empty, lowercase, no spaces or special chars
    const newPath = (siteConfig.value.admin?.adminPath || 'admin').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
    if (!newPath) {
      alert('后台路径不能为空，请输入有效的路径名称（仅限英文字母、数字、-、_）。')
      return
    }
    siteConfig.value.admin.adminPath = newPath

    if (adminNewPassword.value.trim() !== '') {
      if (!siteConfig.value.admin) siteConfig.value.admin = {}
      siteConfig.value.admin.newPassword = adminNewPassword.value
    }

    const oldPath = currentSuffix
    await $fetch('/api/site-config', { method: 'PUT', body: siteConfig.value })

    // Clear local inputs and clean up payload key
    adminNewPassword.value = ''
    if (siteConfig.value.admin) {
      delete siteConfig.value.admin.newPassword
    }

    alert('🎉 配置保存成功！')

    // If admin path changed, redirect to the new URL
    if (newPath !== oldPath) {
      await router.push(`/${newPath}`)
    } else if (showLivePreview.value) {
      setTimeout(refreshPreview, 300)
    }
  } catch (e: any) { alert(e.statusMessage || '保存失败。') }
}

const updateTempExpInput = (idx: number, val: string) => { tempExpInputs.value[idx] = val }

const addSkillsTag = () => {
  const val = tempSkillsTagInput.value.replace(/[,，;；]/g, '').trim()
  if (val && !siteConfig.value.home.skillsTags.includes(val)) siteConfig.value.home.skillsTags.push(val)
  tempSkillsTagInput.value = ''
}
const removeSkillsTag = (tag: string) => { siteConfig.value.home.skillsTags = siteConfig.value.home.skillsTags.filter((t: string) => t !== tag) }

const addHeroTechTag = () => {
  const val = tempHeroTechInput.value.replace(/[,，;；]/g, '').trim()
  if (!siteConfig.value.home.heroTechStack) siteConfig.value.home.heroTechStack = []
  if (val && !siteConfig.value.home.heroTechStack.includes(val)) siteConfig.value.home.heroTechStack.push(val)
  tempHeroTechInput.value = ''
}
const removeHeroTechTag = (tag: string) => {
  if (siteConfig.value.home.heroTechStack) {
    siteConfig.value.home.heroTechStack = siteConfig.value.home.heroTechStack.filter((t: string) => t !== tag)
  }
}

const tempBrandInput = ref('')
const addBrandTag = () => {
  const val = tempBrandInput.value.replace(/[,，;；]/g, '').trim()
  if (!siteConfig.value.home.collaborativeBrands) siteConfig.value.home.collaborativeBrands = []
  if (val && !siteConfig.value.home.collaborativeBrands.includes(val)) siteConfig.value.home.collaborativeBrands.push(val)
  tempBrandInput.value = ''
}
const removeBrandTag = (tag: string) => {
  if (siteConfig.value.home.collaborativeBrands) {
    siteConfig.value.home.collaborativeBrands = siteConfig.value.home.collaborativeBrands.filter((t: string) => t !== tag)
  }
}

const selectEmoji = (idx: number, emoji: string) => {
  form.value.workflow[idx].icon = emoji
  activeEmojiPickerIdx.value = null
}
const handleEmojiBlur = () => {
  setTimeout(() => {
    activeEmojiPickerIdx.value = null
  }, 200)
}

const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  
  const res = await $fetch('/api/upload', {
    method: 'POST',
    body: formData
  }) as any
  
  if (res && res.url) {
    return res.url
  }
  throw new Error('Upload failed')
}

const uploadProjectCover = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  
  try {
    const url = await uploadFile(file)
    form.value.image = url
  } catch (err: any) {
    alert(err.data?.statusMessage || err.statusMessage || '图片上传失败，请重试。')
  } finally {
    target.value = ''
  }
}




const uploadHeroPoster = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  
  try {
    const url = await uploadFile(file)
    siteConfig.value.home.heroVideoPoster = url
  } catch (err: any) {
    alert(err.data?.statusMessage || err.statusMessage || '图片上传失败，请重试。')
  } finally {
    target.value = ''
  }
}

const uploadAvatarFile = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  
  try {
    const url = await uploadFile(file)
    if (!siteConfig.value.siteInfo) siteConfig.value.siteInfo = {}
    siteConfig.value.siteInfo.avatar = url
  } catch (err: any) {
    alert(err.data?.statusMessage || err.statusMessage || '头像图片上传失败，请重试。')
  } finally {
    target.value = ''
  }
}

const draggedExpIdx = ref<number | null>(null)

const onExpDragStart = (idx: number) => {
  draggedExpIdx.value = idx
}

const onExpDrop = (targetIdx: number) => {
  if (draggedExpIdx.value === null || draggedExpIdx.value === targetIdx) return
  const list = siteConfig.value?.about?.experiences
  if (Array.isArray(list)) {
    const item = list.splice(draggedExpIdx.value, 1)[0]
    list.splice(targetIdx, 0, item)
    showToast('✨ 履历顺序拖拽重排成功！')
  }
  draggedExpIdx.value = null
}

const moveExperienceUp = (idx: number) => {
  if (idx <= 0) return
  const list = siteConfig.value?.about?.experiences
  if (Array.isArray(list)) {
    const item = list.splice(idx, 1)[0]
    list.splice(idx - 1, 0, item)
    showToast('✨ 履历已上移！')
  }
}

const moveExperienceDown = (idx: number) => {
  const list = siteConfig.value?.about?.experiences
  if (Array.isArray(list) && idx < list.length - 1) {
    const item = list.splice(idx, 1)[0]
    list.splice(idx + 1, 0, item)
    showToast('✨ 履历已下移！')
  }
}

const addExperience = () => { siteConfig.value.about.experiences.push({ role: '', company: '', period: '', desc: '', tags: [] }) }
const removeExperience = (idx: number) => { siteConfig.value.about.experiences.splice(idx, 1) }
const addExperienceTag = (idx: number) => {
  const val = (tempExpInputs.value[idx] || '').replace(/[,，;；]/g, '').trim()
  if (val) {
    const exp = siteConfig.value.about.experiences[idx]
    if (!exp.tags) exp.tags = []
    if (!exp.tags.includes(val)) exp.tags.push(val)
  }
  tempExpInputs.value[idx] = ''
}
const removeExperienceTag = (idx: number, tag: string) => {
  const exp = siteConfig.value.about.experiences[idx]
  if (exp?.tags) exp.tags = exp.tags.filter((t: string) => t !== tag)
}
const addPhilosophy = () => { siteConfig.value.about.philosophies.push({ emoji: '⚡', title: '', desc: '' }) }
const removePhilosophy = (idx: number) => { siteConfig.value.about.philosophies.splice(idx, 1) }
const addSkill = () => { siteConfig.value.about.skills.push({ name: '', level: 80 }) }
const removeSkill = (idx: number) => { siteConfig.value.about.skills.splice(idx, 1) }

const addWorkflowStep = () => form.value.workflow.push({ icon: '⚡', title: '', desc: '' })
const removeWorkflowStep = (idx: number) => form.value.workflow.splice(idx, 1)
const addTag = () => {
  const val = tempTagInput.value.replace(/[,，;；]/g, '').trim()
  if (val && !form.value.tags.includes(val)) form.value.tags.push(val)
  tempTagInput.value = ''
}
const removeTag = (tag: string) => { form.value.tags = form.value.tags.filter((t: string) => t !== tag) }
const toggleSoftware = (soft: string) => {
  if (form.value.software.includes(soft)) form.value.software = form.value.software.filter((s: string) => s !== soft)
  else form.value.software.push(soft)
}

const aiPromptInput = ref('')
const aiGenerating = ref(false)

const handleAiAutoFill = async () => {
  const prompt = aiPromptInput.value.trim()
  if (!prompt) {
    alert('请先输入影片名称或一句话简述（例如：保时捷 911 概念商业广告 或 AI视频Sora生成短片）。')
    return
  }

  aiGenerating.value = true
  try {
    const res = await $fetch<any>('/api/admin/ai-generate-project', {
      method: 'POST',
      body: { prompt }
    })

    if (res.success && res.data) {
      const d = res.data
      form.value.title = d.title || form.value.title
      if (!isEditing.value || !form.value.slug) {
        form.value.slug = d.slug || form.value.slug
      }
      form.value.description = d.description || ''
      form.value.longDescription = d.longDescription || ''
      form.value.postSpecs = d.postSpecs || ''
      form.value.deliverFormat = d.deliverFormat || ''
      form.value.audioFormat = d.audioFormat || ''
      if (Array.isArray(d.software) && d.software.length) {
        form.value.software = [...d.software]
      }
      if (Array.isArray(d.tags) && d.tags.length) {
        form.value.tags = [...d.tags]
      }
      if (Array.isArray(d.workflow) && d.workflow.length) {
        form.value.workflow = JSON.parse(JSON.stringify(d.workflow))
      }
      if (res.source && res.source.startsWith('real_model')) {
        const providerName = res.source.replace('real_model_', '').toUpperCase()
        alert(`🤖 真实 ${providerName} 大模型在线推理成功！已为您实时撰写并自动填充全套大刊级资料！`)
      } else {
        alert('✨ 已通过内置高奢 AI 引擎为您自动填充全套作品资料！\n\n💡 提示：如需使用 DeepSeek / OpenAI 真实在线大模型，请在【站点设置】中配置 API Key、确认 API Provider 不是“内置”，并点击右上角【保存配置】存盘。')
      }
    }
  } catch (err: any) {
    alert(err.data?.statusMessage || 'AI 生成资料失败，请稍后重试。')
  } finally {
    aiGenerating.value = false
  }
}

// Project Reorder & Drag-and-Drop Handlers
const draggedProjectIndex = ref<number | null>(null)
const isReordering = ref(false)

const onDragStart = (index: number, e: DragEvent) => {
  draggedProjectIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }
}

const onDragOver = (index: number) => {
  if (draggedProjectIndex.value === null || draggedProjectIndex.value === index) return
  const item = projectsList.value.splice(draggedProjectIndex.value, 1)[0]
  projectsList.value.splice(index, 0, item)
  draggedProjectIndex.value = index
}

const onDrop = async () => {
  draggedProjectIndex.value = null
  await saveReorderedProjects()
}

const moveProjectUp = async (index: number) => {
  if (index <= 0) return
  const item = projectsList.value.splice(index, 1)[0]
  projectsList.value.splice(index - 1, 0, item)
  await saveReorderedProjects()
}

const moveProjectDown = async (index: number) => {
  if (index >= projectsList.value.length - 1) return
  const item = projectsList.value.splice(index, 1)[0]
  projectsList.value.splice(index + 1, 0, item)
  await saveReorderedProjects()
}

const saveReorderedProjects = async () => {
  isReordering.value = true
  try {
    const slugs = projectsList.value.map((p: any) => p.slug)
    await $fetch('/api/admin/reorder-projects', {
      method: 'POST',
      body: { slugs }
    })
  } catch (err) {
    console.error('Failed to save project reorder:', err)
  } finally {
    isReordering.value = false
  }
}

const updateProjectNumber = async (project: any, index: number, e: Event) => {
  const inputEl = e.target as HTMLInputElement
  const rawVal = inputEl.value.trim()
  if (!rawVal) return

  const numVal = parseInt(rawVal, 10)
  if (!isNaN(numVal) && numVal > 0) {
    project.sortOrder = numVal
    project.displayNumber = numVal < 10 ? `0${numVal}` : `${numVal}`
  } else {
    project.displayNumber = rawVal
  }

  try {
    await $fetch('/api/projects', { method: 'PUT', body: project })
    await fetchProjects()
  } catch (err) {
    console.error('Failed to update project number:', err)
  }
}

const openCreateModal = () => {
  isEditing.value = false
  aiPromptInput.value = ''
  form.value = {
    slug: '', title: '', displayNumber: '', sortOrder: projectsList.value.length + 1, image: '', imageBefore: '', videoUrl: '', videoUrls: [''], software: ['Premiere Pro', 'DaVinci Resolve'],
    tags: ['剪辑节奏', '达芬奇调色'], featured: false, description: '', longDescription: '',
    workflow: [{ icon: '⚡', title: 'Offline 粗剪', desc: '根据背景声轨与击鼓声的峰值波形进行精确画面切割与卡位。' }],
    password: '',
    releaseYear: '2026',
    postSpecs: '4K 60FPS HDR',
    director: 'Xo',
    deliverFormat: 'ProRes 422 HQ',
    audioFormat: '24-bit 48kHz'
  }
  tempTagInput.value = ''
  isModalOpen.value = true
}
const openEditModal = (project: any) => {
  isEditing.value = true
  form.value = { displayNumber: '', sortOrder: 0, ...project, software: [...(project.software || [])], tags: [...(project.tags || [])], workflow: JSON.parse(JSON.stringify(project.workflow || [])) }
  form.value.videoUrls = Array.isArray(project.videoUrls) && project.videoUrls.length ? [...project.videoUrls] : [project.videoUrl || '']
  normalizeProjectVideos()
  tempTagInput.value = ''
  isModalOpen.value = true
}
const closeModal = () => { isModalOpen.value = false }
const triggerFormSubmit = () => {
  if (tempTagInput.value.trim()) addTag()
  submitButtonRef.value?.click()
}
const generateRandomPassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const saveProject = async () => {
  try {
    const videos = normalizeProjectVideos()
    if (!form.value.image?.trim() && videos.length === 0) {
      alert('请至少填入【封面图片 URL】或【视频 MP4 URL】中的一个。')
      return
    }
    if (isEditing.value) await $fetch('/api/projects', { method: 'PUT', body: form.value })
    else await $fetch('/api/projects', { method: 'POST', body: form.value })
    await fetchProjects()
    closeModal()
  } catch (e: any) { alert(e.statusMessage || '保存失败。') }
}
const deleteProject = async (slug: string) => {
  if (!confirm('确认彻底删除该视频作品吗？')) return
  try {
    await $fetch(`/api/projects?slug=${slug}`, { method: 'DELETE' })
    await fetchProjects()
  } catch (e: any) { alert(e.statusMessage || '删除失败。') }
}
const deletePasswordRequest = async (id: number | string) => {
  if (!confirm('确认要删除这条授权申请记录吗？')) return
  try {
    await $fetch(`/api/password-requests?id=${id}`, { method: 'DELETE' })
    const requests = await $fetch('/api/password-requests?t=' + Date.now()) as any[]
    passwordRequests.value = requests
  } catch (e: any) {
    alert(e.statusMessage || '删除失败。')
  }
}
const updateRequestStatus = async (id: number | string, status: 'approved' | 'rejected') => {
  const actionName = status === 'approved' ? '审核通过' : '审核拒绝'
  if (!confirm(`确认将该条授权申请标记为【${actionName}】吗？`)) return
  try {
    await $fetch('/api/password-requests', {
      method: 'PUT',
      body: { id, status }
    })
    const requests = await $fetch('/api/password-requests?t=' + Date.now()) as any[]
    passwordRequests.value = requests
  } catch (e: any) {
    alert(e.statusMessage || '审批操作失败。')
  }
}
const getProjectPassword = (slug: string) => {
  const p = projectsList.value?.find((x: any) => x.slug === slug)
  return p ? p.password : ''
}
const copyShareText = (r: any) => {
  const pwd = getProjectPassword(r.projectSlug)
  const host = window.location.origin
  const shareText = `您好！您申请观摩的作品《${r.projectTitle}》已审核通过。\n访问密码：${pwd || '无'}\n直接观看链接：${host}/projects/${r.projectSlug}\n期待与您的进一步合作！`
  
  if (import.meta.client) {
    navigator.clipboard.writeText(shareText).then(() => {
      alert('通知模板已成功复制到剪贴板，您可以直接粘贴并发送给客户！')
    }).catch(() => {
      alert('复制失败，请手动通过浏览器接口进行拷贝。')
    })
  }
}
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}

.popover-enter-active, .popover-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.popover-enter-from, .popover-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.dropdown-fade-enter-active, .dropdown-fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-fade-enter-from, .dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

.drawer-enter-active, .drawer-leave-active { transition: opacity 0.4s ease; }
.drawer-enter-active > div:last-child, .drawer-leave-active > div:last-child { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.drawer-enter-from { opacity: 0; }
.drawer-enter-from > div:last-child { transform: translateX(100%); }
.drawer-leave-to { opacity: 0; }
.drawer-leave-to > div:last-child { transform: translateX(100%); }

input[type="range"] {
  background: rgba(180,83,9,0.12);
  border-radius: 9999px;
  height: 4px;
  outline: none;
  width: 100%;
  appearance: none;
}
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px; height: 16px;
  border-radius: 50%;
  background: var(--color-bronze);
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(180,83,9,0.25);
  cursor: pointer;
  transition: transform 0.1s ease;
}
input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.2); }

.ai-shimmer-card {
  position: relative;
}
.ai-shimmer-stream {
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(251, 191, 36, 0.25) 50%,
    transparent 100%
  );
  transform: skewX(-25deg);
  animation: aiShimmer 3.5s infinite;
  pointer-events: none;
}
@keyframes aiShimmer {
  0% { left: -100%; }
  35% { left: 200%; }
  100% { left: 200%; }
}
</style>
