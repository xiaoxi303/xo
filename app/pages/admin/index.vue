<template>
  <div class="min-h-screen pt-28 pb-20 px-6 font-sans">
    
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
            <label class="form-label font-mono uppercase text-[9px] tracking-wider">管理者账户</label>
            <input v-model="loginForm.username" type="text" required class="form-input" placeholder="admin" :disabled="loginLoading" />
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
    <div v-else class="max-w-6xl mx-auto space-y-8">

      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="space-y-1">
          <p class="section-label">Admin</p>
          <h1 class="font-display text-3xl font-bold tracking-tight" style="color: var(--color-ink-1)">配置工作台</h1>
          <p class="text-xs font-mono uppercase tracking-wider" style="color: var(--color-ink-5)">Xo Studio · Site-Wide Configuration Panel</p>
        </div>
        <!-- Tabs & Logout -->
        <div class="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <div class="flex items-center gap-1 p-1 rounded-xl"
               style="background: rgba(140,115,80,0.08); border: 1px solid rgba(160,130,90,0.18);">
            <button
              v-for="t in tabs"
              :key="t.value"
              @click="activeTab = t.value"
              :class="[
                'px-3.5 py-2 rounded-lg text-[11px] font-semibold font-mono uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5',
                activeTab === t.value
                  ? 'bg-white shadow-sm font-bold'
                  : 'hover:opacity-80'
              ]"
              :style="activeTab === t.value
                ? { color: 'var(--color-ink-1)', border: '1px solid rgba(180,150,110,0.25)' }
                : { color: 'var(--color-ink-4)', border: '1px solid transparent' }"
            >
              <span>{{ t.icon }}</span>{{ t.label }}
            </button>
          </div>
          <button @click="handleLogout" class="px-3.5 py-2 rounded-lg text-[11px] font-semibold font-mono uppercase tracking-wider transition-all duration-200 hover:text-rose-500 hover:border-rose-500/30"
                  style="color: var(--color-ink-4); border: 1px solid var(--color-border-2); background: transparent;">
            安全退出
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="relative min-h-[400px]">

        <!-- ===== TAB 0: ANALYTICS DASHBOARD ===== -->
        <div v-if="activeTab === 'analytics'" class="space-y-6">
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
                  <path :d="sparkPath" fill="none" stroke="var(--color-bronze)" stroke-width="1.8" stroke-linecap="round"/>
                  <path :d="sparkPath + ` L${sparkPoints[sparkPoints.length-1].x},14 L${sparkPoints[0].x},14 Z`" fill="url(#sg1)"/>
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
              <span class="text-[10px] font-mono uppercase tracking-wider" style="color: var(--color-ink-5)">作品点击热度排行 (Top Engagement)</span>
              <div class="space-y-3.5">
                <template v-if="systemStatus.projectClicks?.length">
                  <div v-for="(p, i) in systemStatus.projectClicks" :key="p.slug" class="space-y-1">
                    <div class="flex justify-between text-xs">
                      <span class="font-medium truncate max-w-[220px]" style="color: var(--color-ink-2)">{{ p.title || p.slug }}</span>
                      <span class="font-mono font-bold ml-2 flex-shrink-0" style="color: var(--color-ink-4)">{{ p.clicks }} 次</span>
                    </div>
                    <div class="h-1.5 w-full rounded-full overflow-hidden" style="background: rgba(0,0,0,0.04)">
                      <div class="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-500"
                        :style="{ width: Math.round((p.clicks / (systemStatus.projectClicks[0].clicks || 1)) * 100) + '%' }"/>
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
                  <span style="color: var(--color-ink-4)">运行时引擎</span>
                  <span class="font-bold" style="color: var(--color-ink-1)">Nuxt 4 / Nitro</span>
                </div>
                <div class="py-2.5 flex justify-between">
                  <span style="color: var(--color-ink-4)">数据存储引擎</span>
                  <span class="font-bold text-emerald-600">{{ systemStatus.engine }}</span>
                </div>
                <div class="py-2.5 flex justify-between">
                  <span style="color: var(--color-ink-4)">数据库健康</span>
                  <span class="font-bold text-emerald-600">{{ systemStatus.dbHealth }} Connected</span>
                </div>
                <div class="py-2.5 flex justify-between">
                  <span style="color: var(--color-ink-4)">SSL 证书</span>
                  <span class="font-bold" style="color: var(--color-ink-1)">{{ systemStatus.ssl }}</span>
                </div>
                <div class="py-2.5 flex justify-between">
                  <span style="color: var(--color-ink-4)">API 响应</span>
                  <span class="font-bold" style="color: var(--color-ink-1)">{{ systemStatus.latency }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>


        <!-- ===== TAB 1: PROJECTS ===== -->
        <div v-if="activeTab === 'projects'" class="space-y-6">
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
                    <th class="py-3.5 px-6">作品预览 & 标题</th>
                    <th class="py-3.5 px-6 hidden md:table-cell">链接路径</th>
                    <th class="py-3.5 px-6 hidden sm:table-cell">后期软件</th>
                    <th class="py-3.5 px-6">精选</th>
                    <th class="py-3.5 px-6 text-right">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y text-xs font-sans" style="divide-color: var(--color-border)">
                  <tr v-for="p in projectsList" :key="p.slug" class="hover:bg-black/[0.01] transition-colors group/row">
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
                    <td colspan="5" class="py-12 text-center font-mono text-xs" style="color: var(--color-ink-5)">暂无作品，点击"录入新作品"开始添加。</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ===== TAB 2: HOME HERO CONFIG ===== -->
        <div v-if="activeTab === 'home'" class="glass-card p-8 space-y-8">
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

        <!-- ===== TAB 3: ABOUT / PROFILE ===== -->
        <div v-if="activeTab === 'about'" class="glass-card p-8 space-y-8">
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
              </div>
              <!-- Skills Sliders -->
              <div class="space-y-4 pt-4" style="border-top: 1px solid var(--color-border)">
                <h3 class="text-xs font-mono font-semibold uppercase tracking-wider" style="color: var(--color-ink-3)">技能标定 (Skills Faders)</h3>
                <div class="p-5 rounded-2xl space-y-4" style="background: rgba(0,0,0,0.02); border: 1px solid var(--color-border)">
                  <div v-for="skill in siteConfig.about.skills" :key="skill.name" class="space-y-2">
                    <div class="flex items-center justify-between text-xs font-mono">
                      <span style="color: var(--color-ink-3)">{{ skill.name }}</span>
                      <span class="font-bold" style="color: var(--color-ink-1)">{{ skill.level }}%</span>
                    </div>
                    <input type="range" min="0" max="100" v-model.number="skill.level" class="w-full cursor-pointer" />
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
                     class="p-5 rounded-2xl space-y-4 relative shadow-sm" style="background: rgba(255,255,255,0.85); border: 1px solid var(--color-border)">
                  <button type="button" @click="removeExperience(idx)" class="absolute top-4 right-4 text-xs font-bold font-mono text-rose-500 hover:text-rose-400">删除</button>
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

        <!-- ===== TAB 4: SITE INFO ===== -->
        <div v-if="activeTab === 'siteinfo'" class="glass-card p-8 space-y-8">
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
              </div>

              <!-- Social Links -->
              <div class="space-y-4 pt-4" style="border-top: 1px solid var(--color-border)">
                <h3 class="text-xs font-mono font-semibold uppercase tracking-wider" style="color: var(--color-ink-3)">社交媒体链接</h3>
                <div class="space-y-3">
                  <div class="space-y-1.5">
                    <label class="form-label">🎬 Vimeo 频道 URL</label>
                    <input v-model="siteConfig.siteInfo.vimeoUrl" class="form-input font-mono" type="url" placeholder="https://vimeo.com/..." />
                  </div>
                  <div class="space-y-1.5">
                    <label class="form-label">🐙 GitHub URL</label>
                    <input v-model="siteConfig.siteInfo.githubUrl" class="form-input font-mono" type="url" placeholder="https://github.com/..." />
                  </div>
                  <div class="space-y-1.5">
                    <label class="form-label">𝕏 Twitter / X URL</label>
                    <input v-model="siteConfig.siteInfo.twitterUrl" class="form-input font-mono" type="url" placeholder="https://twitter.com/..." />
                  </div>
                  <div class="space-y-1.5">
                    <label class="form-label">💼 LinkedIn URL</label>
                    <input v-model="siteConfig.siteInfo.linkedinUrl" class="form-input font-mono" type="url" placeholder="https://linkedin.com/in/..." />
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
            </div>
          </div>
        </div>

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
              <form @submit.prevent="saveProject" class="space-y-6">
                <div class="grid sm:grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label class="form-label">唯一 ID (Slug)</label>
                    <input v-model="form.slug" :disabled="isEditing" required class="form-input font-mono" placeholder="tvc-commercial" />
                  </div>
                  <div class="space-y-1.5">
                    <label class="form-label">项目名称 (Title)</label>
                    <input v-model="form.title" required class="form-input font-display font-bold" placeholder="TVC 商业广告" />
                  </div>
                </div>
                <div class="space-y-4">
                  <div class="space-y-1.5">
                    <label class="form-label">封面图片 URL</label>
                    <div class="flex gap-2">
                      <input v-model="form.image" required class="form-input font-mono flex-1" placeholder="https://..." />
                      <label class="btn-ghost text-xs py-2 px-4 cursor-pointer flex items-center justify-center border border-dashed rounded-xl" style="border-color: var(--color-border-2); background: transparent;">
                        <span>📤 上传</span>
                        <input type="file" accept="image/*" class="hidden" @change="uploadProjectCover" />
                      </label>
                    </div>
                  </div>
                  <div class="space-y-1.5">
                    <label class="form-label">视频 MP4 URL</label>
                    <input v-model="form.videoUrl" required class="form-input font-mono" placeholder="https://...mp4" />
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
                <!-- Featured -->
                <div class="flex items-center gap-2">
                  <input id="featured" type="checkbox" v-model="form.featured" class="w-4 h-4 rounded cursor-pointer" />
                  <label for="featured" class="text-xs select-none cursor-pointer" style="color: var(--color-ink-3)">设为首页精选置顶</label>
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
                                class="w-6.5 h-6.5 flex items-center justify-center text-sm rounded-lg transition-all duration-200 active:scale-90"
                                style="color: var(--color-ink-2); background: transparent;"
                                onmouseover="this.style.background='rgba(180, 83, 9, 0.08)'; this.style.color='var(--color-bronze)'"
                                onmouseout="this.style.background='transparent'; this.style.color='var(--color-ink-2)'"
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
                    <video v-if="form.videoUrl && isValidVideo" :src="form.videoUrl" muted autoplay loop playsinline class="w-full h-full object-cover pointer-events-none" />
                    <img v-else-if="form.image && isValidImage" :src="form.image" class="w-full h-full object-cover" alt="" />
                    <div v-else class="absolute inset-0 flex items-center justify-center text-xs" style="color: var(--color-ink-5)">等待载入媒体...</div>
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
  </div>
</template>

<script setup lang="ts">
useHead({ title: '配置工作台 — xo.dev' })

const isLoggedIn = ref(false)
const isCheckingAuth = ref(true)
const loginLoading = ref(false)
const loginError = ref('')
const loginForm = ref({ username: '', password: '' })

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
const tabs = [
  { label: '数据看板', value: 'analytics', icon: '📊' },
  { label: '作品管理', value: 'projects', icon: '🎥' },
  { label: '首页配置', value: 'home', icon: '🏠' },
  { label: '个人履历', value: 'about', icon: '🙋' },
  { label: '站点信息', value: 'siteinfo', icon: '🌐' },
]

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
const siteConfig = ref<any>({
  siteInfo: {
    brandName: 'Xo', ownerName: 'Xo', ownerInitial: 'Z',
    contactEmail: 'hello@xo.dev', vimeoUrl: '', githubUrl: '', twitterUrl: '', linkedinUrl: '',
    seoTitle: '', seoDescription: '', footerTagline: ''
  },
  home: {
    heroTitle1: '', heroTitle2: '', heroTitle3: '', heroSub: '',
    statValue1: '', statLabel1: '', statValue2: '', statLabel2: '',
    profileCardTitle: '', profileCardSub: '', profileCardDesc: '',
    skillsTags: [], bookingStatus: '', heroVideoUrl: '', heroVideoPoster: '', heroTechStack: []
  },
  about: { role: '', bio: '', bioSub: '', skills: [], experiences: [], philosophies: [] }
})

const isModalOpen = ref(false)
const isEditing = ref(false)
const softwareList = ['Premiere Pro', 'DaVinci Resolve', 'After Effects', 'Cinema 4D', 'Logic Pro', 'FCPX', 'Redshift', 'Octane']
const tempTagInput = ref('')
const tempSkillsTagInput = ref('')
const tempHeroTechInput = ref('')
const tempExpInputs = ref<Record<number, string>>({})
const submitButtonRef = ref<HTMLButtonElement | null>(null)

const form = ref<any>({
  slug: '', title: '', image: '', videoUrl: '', software: [], tags: [], featured: false, description: '', longDescription: '', workflow: []
})

const featuredCount = computed(() => projectsList.value.filter(p => p.featured).length)
const isValidImage = computed(() => form.value.image && /^https?:\/\/.*?\.(jpg|jpeg|png|webp|avif|gif)/i.test(form.value.image))
const isValidVideo = computed(() => form.value.videoUrl && /^https?:\/\/.*?\.(mp4|mov|avi|m3u8|webm)/i.test(form.value.videoUrl))

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

const fetchProjects = async () => { projectsList.value = await $fetch('/api/projects') as any[] }
const fetchSiteConfig = async () => {
  const data = await $fetch('/api/site-config') as any
  // Merge defaults so new siteInfo node always exists
  if (!data.siteInfo) data.siteInfo = {}
  siteConfig.value = {
    siteInfo: {
      brandName: 'Xo', ownerName: 'Xo', ownerInitial: 'Z',
      contactEmail: 'hello@xo.dev', vimeoUrl: '', githubUrl: '', twitterUrl: '', linkedinUrl: '',
      seoTitle: '', seoDescription: '', footerTagline: '基于达芬奇色彩科学规范开发',
      ...data.siteInfo
    },
    home: { 
      heroTitle1: '', heroTitle2: '', heroTitle3: '', heroSub: '', 
      statValue1: '', statLabel1: '', statValue2: '', statLabel2: '', 
      profileCardTitle: '', profileCardSub: '', profileCardDesc: '', 
      skillsTags: [], bookingStatus: '', heroVideoUrl: '', heroVideoPoster: '', heroTechStack: [],
      ...data.home 
    },
    about: { role: '', bio: '', bioSub: '', skills: [], experiences: [], philosophies: [], ...data.about }
  }
}

const fetchSystemStatus = async () => {
  try {
    systemStatus.value = await $fetch('/api/system-status') as any
  } catch (e) {
    console.error('Failed to fetch system status:', e)
  }
}

const checkAuth = async () => {
  try {
    const user = await $fetch('/api/auth/me') as any
    if (user && user.username) {
      isLoggedIn.value = true
      await fetchProjects()
      await fetchSiteConfig()
      await fetchSystemStatus()
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
      isLoggedIn.value = true
      await fetchProjects()
      await fetchSiteConfig()
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

onMounted(() => {
  checkAuth()
  const observer = new IntersectionObserver(
    (entries) => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view') }) },
    { threshold: 0.1 }
  )
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
})

const saveSiteConfig = async () => {
  try {
    await $fetch('/api/site-config', { method: 'PUT', body: siteConfig.value })
    alert('🎉 配置保存成功！')
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

const openCreateModal = () => {
  isEditing.value = false
  form.value = {
    slug: '', title: '', image: '', videoUrl: '', software: ['Premiere Pro', 'DaVinci Resolve'],
    tags: ['剪辑节奏', '达芬奇调色'], featured: false, description: '', longDescription: '',
    workflow: [{ icon: '⚡', title: 'Offline 粗剪', desc: '根据背景声轨与击鼓声的峰值波形进行精确画面切割与卡位。' }]
  }
  tempTagInput.value = ''
  isModalOpen.value = true
}
const openEditModal = (project: any) => {
  isEditing.value = true
  form.value = { ...project, software: [...(project.software || [])], tags: [...(project.tags || [])], workflow: JSON.parse(JSON.stringify(project.workflow || [])) }
  tempTagInput.value = ''
  isModalOpen.value = true
}
const closeModal = () => { isModalOpen.value = false }
const triggerFormSubmit = () => {
  if (tempTagInput.value.trim()) addTag()
  submitButtonRef.value?.click()
}
const saveProject = async () => {
  try {
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
</script>

<style scoped>
.popover-enter-active, .popover-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.popover-enter-from, .popover-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
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
</style>
