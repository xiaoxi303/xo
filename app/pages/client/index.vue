<template>
  <div class="min-h-screen pt-24 pb-20 px-4 sm:px-6 relative overflow-hidden font-sans">
    <!-- Atmospheric Background Orbs -->
    <div class="bg-orbs pointer-events-none">
      <div class="bg-orb bg-orb-1 opacity-50" />
      <div class="bg-orb bg-orb-2 opacity-40" />
      <div class="bg-orb bg-orb-3 opacity-30" />
    </div>

    <!-- Toast Floating Alert -->
    <Transition name="toast">
      <div 
        v-if="toastMessage" 
        class="fixed top-8 left-1/2 -translate-x-1/2 z-[300] px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border text-xs font-semibold flex items-center gap-2.5"
        style="background: rgba(18, 19, 22, 0.94); color: #ffffff; border-color: rgba(217, 119, 6, 0.35); box-shadow: 0 16px 40px rgba(0,0,0,0.25);"
      >
        <span class="text-amber-400 text-sm">✨</span>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <div class="max-w-6xl mx-auto space-y-8 relative z-10">
      
      <!-- Page Header Banner -->
      <div class="glass-card p-6 sm:p-8 rounded-[32px] border border-amber-900/10 shadow-[0_20px_60px_rgba(180,120,40,0.06)] relative overflow-hidden reveal">
        <!-- Top Accent Line -->
        <div class="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700" />
        <div class="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none" />

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div class="space-y-2">
            <div class="flex items-center gap-2.5 flex-wrap">
              <span class="section-label">CLIENT CONTROL HUB</span>
              <span class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-800 border border-amber-500/20">
                PRO CLIENT MEMBER
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                E2EE SAFE SESSION
              </span>
            </div>
            <h1 class="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#121316]">
              客户控制中心
            </h1>
            <p class="text-xs max-w-xl leading-relaxed text-[#5e6066]">
              欢迎回来！在此集中提取专属作品解密密钥、追踪密码申请进度，并管理账户安全凭证。
            </p>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <NuxtLink to="/" class="btn-ghost text-xs py-2.5 px-4 rounded-2xl border border-black/[0.08] hover:bg-black/[0.04] transition-colors flex items-center gap-1.5">
              <IconSax name="home" :size="15" class="text-amber-800" />
              <span>返回首页</span>
            </NuxtLink>
            <button @click="handleLogout" class="btn-bronze text-xs py-2.5 px-4 rounded-2xl shadow-sm cursor-pointer flex items-center gap-1.5">
              <IconSax name="logout" :size="15" />
              <span>退出登录</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div v-if="dashboardData" class="space-y-8">
        
        <!-- KPI Dashboard Quick Stats Overview (4 Cards Grid) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 reveal">
          <div class="glass-card p-5 rounded-2xl flex items-center gap-4 border border-black/[0.06]">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
              <IconSax name="video-play" :size="24" />
            </div>
            <div>
              <p class="text-[10px] font-mono font-bold uppercase tracking-wider text-[#82848c]">专属授权作品</p>
              <h3 class="font-display font-bold text-2xl text-[#121316] mt-0.5">
                {{ dashboardData.allowedProjects?.length || 0 }} <span class="text-xs font-sans font-normal text-[#82848c]">部</span>
              </h3>
            </div>
          </div>

          <div class="glass-card p-5 rounded-2xl flex items-center gap-4 border border-black/[0.06]">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 shrink-0">
              <IconSax name="mail" :size="24" />
            </div>
            <div>
              <p class="text-[10px] font-mono font-bold uppercase tracking-wider text-[#82848c]">密码申请记录</p>
              <h3 class="font-display font-bold text-2xl text-[#121316] mt-0.5">
                {{ dashboardData.requests?.length || 0 }} <span class="text-xs font-sans font-normal text-[#82848c]">条</span>
              </h3>
            </div>
          </div>

          <div class="glass-card p-5 rounded-2xl flex items-center gap-4 border border-black/[0.06]">
            <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-700 shrink-0">
              <IconSax name="shield-security" :size="24" />
            </div>
            <div>
              <p class="text-[10px] font-mono font-bold uppercase tracking-wider text-[#82848c]">E2EE 加密保护</p>
              <h3 class="font-display font-bold text-xs text-emerald-600 mt-1 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                256-Bit GCM 通道
              </h3>
            </div>
          </div>

          <div class="glass-card p-5 rounded-2xl flex items-center gap-4 border border-black/[0.06]">
            <div class="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-700 shrink-0">
              <IconSax name="crown" :size="24" />
            </div>
            <div>
              <p class="text-[10px] font-mono font-bold uppercase tracking-wider text-[#82848c]">账户身份等级</p>
              <h3 class="font-display font-bold text-xs text-amber-800 mt-1">
                {{ dashboardData.profile.role === 'admin' ? '系统最高管理员' : '认证 Pro 客户会员' }}
              </h3>
            </div>
          </div>
        </div>

        <!-- Dedicated delivery credentials -->
        <section class="glass-card p-6 sm:p-7 rounded-[28px] border border-emerald-900/10 shadow-[0_18px_50px_rgba(15,118,110,0.07)] reveal">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div class="space-y-2 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="section-label text-emerald-800">PRIVATE DELIVERY NODE</span>
                <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">ACCOUNT BOUND</span>
              </div>
              <h2 class="font-display text-xl sm:text-2xl font-bold text-[#121316]">我的专属交付入口</h2>
              <p class="text-xs leading-relaxed text-[#5e6066] max-w-2xl">把这个入口和一次性查看密钥交给对应客户。系统只展示已授权项目，首次越权会警告，再次越权将拉黑账号且费用不退。</p>
              <div class="flex flex-wrap items-center gap-2 pt-1">
                <code class="px-3 py-2 rounded-xl bg-black/[0.035] border border-black/[0.06] text-[11px] font-mono text-[#121316]">/delivery/{{ dashboardData.profile.deliverySuffix || '生成中' }}</code>
                <NuxtLink v-if="dashboardData.profile.deliverySuffix" :to="`/delivery/${dashboardData.profile.deliverySuffix}`" target="_blank" class="text-[11px] font-bold text-emerald-800 hover:underline">打开交付页 ↗</NuxtLink>
              </div>
            </div>

            <div class="w-full lg:w-[360px] shrink-0 space-y-3">
              <div class="flex items-center justify-between gap-3 p-3 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/15">
                <div class="min-w-0">
                  <p class="text-[9px] font-mono font-bold tracking-wider text-emerald-800 uppercase">查看密钥</p>
                  <p class="mt-1 text-xs font-mono font-bold tracking-widest text-[#121316] truncate">{{ deliveryKeyDraft || `•••••••••••• 末四位 ${dashboardData.profile.deliveryKeyHint || '----'}` }}</p>
                </div>
                <button v-if="deliveryKeyDraft" type="button" class="text-[10px] font-bold text-emerald-800 hover:underline shrink-0" @click="copyDeliveryKey">复制</button>
              </div>
              <div class="flex gap-2">
                <button type="button" class="flex-1 py-2.5 px-3 rounded-xl text-[11px] font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition-colors disabled:opacity-50" :disabled="deliveryGenerating" @click="generateDeliveryKey">
                  <span v-if="deliveryGenerating">正在生成…</span>
                  <span v-else>{{ deliveryKeyDraft ? '重新轮换密钥' : '生成我的查看密钥' }}</span>
                </button>
                <button v-if="deliveryKeyDraft" type="button" class="py-2.5 px-3 rounded-xl text-[11px] font-bold border border-black/10 hover:bg-black/[0.04]" @click="deliveryKeyDraft = ''">隐藏</button>
              </div>
              <p v-if="deliveryKeyDraft" class="text-[10px] leading-relaxed text-amber-700">完整密钥只在本次显示。轮换后旧密钥立即失效，请先复制保存。</p>
            </div>
          </div>
        </section>

        <!-- Main Layout: Grid 12 Cols -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Left Column: User Profile Card (4 cols) -->
          <div class="lg:col-span-4 space-y-6 reveal">
            <div class="glass-card p-6 sm:p-7 rounded-[32px] flex flex-col items-center text-center space-y-5 relative overflow-hidden border border-black/[0.06]">
              <!-- Decorative Top Accent -->
              <div class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700" />

              <!-- Avatar Display -->
              <div class="relative w-20 h-20 rounded-2xl border-2 border-white shadow-md bg-stone-100 flex items-center justify-center overflow-hidden group">
                <img 
                  v-if="isImageUrl(dashboardData.profile.avatar)" 
                  :src="dashboardData.profile.avatar" 
                  alt="Avatar"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-4xl">{{ dashboardData.profile.avatar || '👤' }}</span>
              </div>

              <!-- Profile Info -->
              <div class="space-y-1 w-full">
                <h2 class="font-display font-bold text-xl text-[#121316]">
                  {{ dashboardData.profile.nickname || dashboardData.profile.username }}
                </h2>
                <p class="text-xs font-mono text-[#82848c]">
                  @{{ dashboardData.profile.username }}
                </p>
                <div class="inline-block px-3 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider mt-2 bg-amber-500/10 text-amber-800 border border-amber-500/20">
                  {{ dashboardData.profile.role === 'admin' ? '系统最高管理员' : '认证 Pro 客户会员' }}
                </div>
              </div>

              <!-- Details Box -->
              <div class="w-full pt-4 border-t border-black/[0.05] text-left text-xs font-mono space-y-3 text-[#5e6066]">
                <div class="flex justify-between items-center">
                  <span>绑定电子邮箱</span>
                  <span class="font-bold text-[#121316]">{{ dashboardData.profile.email || '未绑定' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span>绑定微信号</span>
                  <span class="font-bold text-[#121316]">{{ dashboardData.profile.wechat || '未绑定' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span>注册加入时间</span>
                  <span class="font-bold text-[#121316]">{{ formatDate(dashboardData.profile.createdAt) }}</span>
                </div>
              </div>

              <!-- Edit Button -->
              <button 
                @click="openEditModal" 
                class="w-full py-3 px-4 text-xs font-bold rounded-2xl border border-black/10 bg-white/80 hover:bg-white hover:border-amber-600/40 hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                ⚙️ 编辑个人资料与密码
              </button>
            </div>
          </div>

          <!-- Right Column: Projects & Requests Tabs (8 cols) -->
          <div class="lg:col-span-8 space-y-6 reveal">
            
            <!-- Controls Bar: Navigation Tabs + Search Filter -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 rounded-2xl bg-black/[0.03] border border-black/[0.05]">
              <div class="flex items-center gap-1">
                <button 
                  @click="activeTab = 'projects'"
                  :class="[
                    'px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 flex items-center gap-2 cursor-pointer',
                    activeTab === 'projects'
                      ? 'bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-md'
                      : 'text-[#82848c] hover:text-[#121316]'
                  ]"
                >
                  <span>🎥 专属授权项目</span>
                  <span :class="['px-2 py-0.5 rounded-full text-[9px] font-mono font-bold', activeTab === 'projects' ? 'bg-white/20 text-white' : 'bg-black/5 text-slate-500']">
                    {{ dashboardData.allowedProjects?.length || 0 }}
                  </span>
                </button>

                <button 
                  @click="activeTab = 'projects'"
                  :class="[
                    'px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 flex items-center gap-2 cursor-pointer',
                    activeTab === 'projects'
                      ? 'bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-md'
                      : 'text-[#82848c] hover:text-[#121316]'
                  ]"
                >
                  <IconSax name="video-play" :size="16" />
                  <span>专属授权作品</span>
                  <span :class="['px-2 py-0.5 rounded-full text-[9px] font-mono font-bold', activeTab === 'projects' ? 'bg-white/20 text-white' : 'bg-black/5 text-slate-500']">
                    {{ dashboardData.allowedProjects?.length || 0 }}
                  </span>
                </button>

                <button 
                  @click="activeTab = 'requests'"
                  :class="[
                    'px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 flex items-center gap-2 cursor-pointer',
                    activeTab === 'requests'
                      ? 'bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-md'
                      : 'text-[#82848c] hover:text-[#121316]'
                  ]"
                >
                  <IconSax name="mail" :size="16" />
                  <span>密码申请记录</span>
                  <span :class="['px-2 py-0.5 rounded-full text-[9px] font-mono font-bold', activeTab === 'requests' ? 'bg-white/20 text-white' : 'bg-black/5 text-slate-500']">
                    {{ dashboardData.requests?.length || 0 }}
                  </span>
                </button>
              </div>

              <!-- Search Filter Input (For projects tab) -->
              <div v-if="activeTab === 'projects'" class="px-1 relative">
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  placeholder="搜索专属作品..."
                  class="form-input text-xs py-2 pl-9 pr-3.5 rounded-xl border border-black/10 w-full sm:w-48 bg-white/90 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all"
                />
                <IconSax name="search" :size="14" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <!-- Tab Content 1: Allowed Projects -->
            <div v-if="activeTab === 'projects'" class="space-y-4">
              <div v-if="filteredProjects.length" class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div 
                  v-for="project in filteredProjects" 
                  :key="project.slug"
                  class="glass-card overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 border border-black/[0.06] rounded-[28px]"
                >
                  <!-- Thumbnail Container -->
                  <div class="relative h-44 overflow-hidden bg-black">
                    <img 
                      v-if="project.image" 
                      :src="project.image" 
                      :alt="project.title"
                      class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center bg-stone-900 text-amber-500">
                      <IconSax name="video-play" :size="48" />
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    
                    <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                      <span class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-600/90 text-white backdrop-blur-md uppercase tracking-wider">
                        EXCLUSIVE PASS
                      </span>
                    </div>
                  </div>

                  <!-- Text Content -->
                  <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div class="space-y-1.5">
                      <h3 class="font-display font-bold text-base text-[#121316] group-hover:text-amber-800 transition-colors line-clamp-1">
                        {{ project.title }}
                      </h3>
                      <p class="text-xs line-clamp-2 leading-relaxed text-[#5e6066]">
                        {{ project.description }}
                      </p>
                    </div>

                    <!-- Actions / Password Copy Bar -->
                    <div class="space-y-3 pt-3 border-t border-black/[0.04]">
                      <div class="flex items-center justify-between p-3 rounded-2xl bg-amber-500/5 border border-amber-500/15">
                        <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                          <IconSax name="key" :size="12" />
                          <span>专属解密密码</span>
                        </span>
                        <div class="flex items-center gap-2">
                          <span class="font-mono font-bold text-sm tracking-widest text-[#121316] bg-white px-2.5 py-1 rounded-lg border border-black/5">
                            {{ project.password }}
                          </span>
                          <button 
                            @click="copyText(project.password)"
                            class="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-700/10 text-amber-900 hover:bg-amber-700 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                            title="复制密码"
                          >
                            <IconSax name="copy" :size="12" />
                            <span>复制</span>
                          </button>
                        </div>
                      </div>

                      <div class="flex gap-2">
                        <NuxtLink 
                          :to="'/projects/' + project.slug + (project.password ? '?pwd=' + encodeURIComponent(project.password) : '')"
                          class="flex-1 text-center justify-center py-2.5 text-xs rounded-xl font-bold shadow-md text-white transition-transform active:scale-[0.98] flex items-center gap-2"
                          style="background: linear-gradient(135deg, #c27a3d, #b45309);"
                        >
                          <IconSax name="video-play" :size="16" />
                          <span>立即观看作品</span>
                        </NuxtLink>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty Filtered Projects -->
              <div v-else class="glass-card p-12 rounded-[32px] text-center flex flex-col items-center justify-center space-y-3 border border-black/[0.06]">
                <div class="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
                  <IconSax name="video-play" :size="32" />
                </div>
                <p class="text-sm font-display font-bold text-[#2d2f34]">
                  {{ searchQuery ? '未搜索到匹配作品' : '暂无专属授权作品' }}
                </p>
                <p class="text-xs max-w-xs leading-relaxed text-[#82848c]">
                  {{ searchQuery ? '请尝试更换搜索关键字' : '您目前尚未获得任何加密作品的专属授权。您可以浏览主页并提交申请获取特定视频的密码。' }}
                </p>
                <NuxtLink v-if="!searchQuery" to="/" class="btn-bronze text-xs py-2.5 px-5 rounded-2xl mt-2 shadow-md">
                  浏览公开作品
                </NuxtLink>
              </div>
            </div>

            <!-- Tab Content 2: Request History -->
            <div v-if="activeTab === 'requests'" class="space-y-4">
              <div v-if="dashboardData.requests?.length" class="space-y-3">
                <div 
                  v-for="req in dashboardData.requests" 
                  :key="req.id"
                  class="glass-card p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-black/[0.05] hover:border-black/[0.1] transition-all"
                >
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <IconSax name="video-play" :size="16" class="text-amber-700" />
                      <h4 class="font-bold text-xs sm:text-sm text-[#121316]">
                        {{ req.projectTitle }}
                      </h4>
                    </div>
                    <p class="text-[10px] font-mono text-[#82848c]">
                      申请时间：{{ formatDate(req.createdAt) }} · 联系方式：{{ req.contact }}
                    </p>
                    <p v-if="req.reason" class="text-[11px] text-[#5e6066] mt-1 bg-black/[0.02] p-2.5 rounded-xl border border-black/[0.03]">
                      申请原由：{{ req.reason }}
                    </p>

                    <!-- Approved Password Display & Quick Copy -->
                    <div v-if="req.status === 'approved' && req.password" class="flex items-center gap-2 mt-2 p-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 w-fit">
                      <span class="text-[10px] font-mono font-bold text-amber-900 uppercase flex items-center gap-1">
                        <IconSax name="key" :size="12" />
                        <span>解密密码:</span>
                      </span>
                      <span class="font-mono font-bold text-xs text-[#121316] tracking-widest bg-white px-2 py-0.5 rounded border border-black/5">
                        {{ req.password }}
                      </span>
                      <button 
                        @click.stop="copyText(req.password)" 
                        class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-700/10 text-amber-900 hover:bg-amber-700 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                      >
                        <IconSax name="copy" :size="12" />
                        <span>复制密码</span>
                      </button>
                    </div>
                  </div>

                  <div class="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <!-- Status Badges -->
                    <span 
                      v-if="req.status === 'pending'"
                      class="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/20 text-amber-800 flex items-center gap-1.5"
                    >
                      <IconSax name="security-safe" :size="12" class="text-amber-600" />
                      <span>审核中</span>
                    </span>
                    <span 
                      v-else-if="req.status === 'approved'"
                      class="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 flex items-center gap-1.5"
                    >
                      <IconSax name="tick" :size="12" class="text-emerald-600" />
                      <span>已授权通过</span>
                    </span>
                    <span 
                      v-else-if="req.status === 'rejected'"
                      class="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 border border-rose-500/20 text-rose-800 flex items-center gap-1"
                    >
                      <span>🔴</span> <span>审核未通过</span>
                    </span>

                    <!-- Action for approved -->
                    <NuxtLink 
                      v-if="req.status === 'approved'"
                      :to="'/projects/' + req.projectSlug + (req.password ? '?pwd=' + encodeURIComponent(req.password) : '')"
                      class="text-[10px] font-bold py-1.5 px-3 rounded-xl border border-amber-700/20 bg-amber-50 text-amber-900 hover:bg-amber-100 transition-colors"
                    >
                      观看视频 &rarr;
                    </NuxtLink>
                  </div>
                </div>
              </div>

              <!-- Empty Requests -->
              <div v-else class="glass-card p-12 rounded-[32px] text-center flex flex-col items-center justify-center space-y-3 border border-black/[0.06]">
                <span class="text-4xl">📨</span>
                <p class="text-sm font-display font-bold text-[#2d2f34]">暂无密码申请记录</p>
                <p class="text-xs max-w-xs leading-relaxed text-[#82848c]">
                  您尚未提交过任何作品的授权申请。如需查看受保护的加密视频，请在作品页点击提交申请。
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- Loading State -->
      <div v-else class="py-32 text-center space-y-4">
        <span class="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin inline-block text-amber-700" style="border-color: currentColor; border-top-color: transparent;" />
        <p class="text-xs font-mono text-slate-500">正在安全加密连接载入客户控制台...</p>
      </div>

    </div>

    <!-- Edit Profile Modal -->
    <Transition name="fade">
      <div v-if="isEditModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center px-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-md" @click="closeEditModal" />
        
        <!-- Modal Card -->
        <div class="relative glass-card p-6 sm:p-7 w-full max-w-md space-y-5 shadow-2xl z-10 rounded-[32px]" style="background: rgba(255, 254, 250, 0.98);">
          <div class="flex justify-between items-center border-b border-black/[0.06] pb-3">
            <h3 class="font-display font-bold text-base text-[#121316]">编辑个人资料与密码</h3>
            <button @click="closeEditModal" class="text-slate-400 hover:text-slate-700 text-base font-bold cursor-pointer">✕</button>
          </div>

          <form @submit.prevent="submitProfile" class="space-y-4 text-left">
            <!-- Nickname -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-wider block text-[#5e6066]">昵称 / 真实姓名</label>
              <input 
                v-model="editForm.nickname" 
                type="text" 
                placeholder="例如：张导演 / 某广告机构" 
                class="form-input text-xs w-full px-3.5 py-2.5 border rounded-2xl border-black/10 bg-white/90"
              />
            </div>

            <!-- Email -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-wider block text-amber-900">电子邮箱</label>
              <input 
                v-model="editForm.email" 
                type="email" 
                placeholder="example@mail.com" 
                class="form-input text-xs w-full px-3.5 py-2.5 border rounded-2xl border-black/10 bg-white/90"
              />
            </div>

            <!-- WeChat -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-wider block text-amber-900">微信号</label>
              <input 
                v-model="editForm.wechat" 
                type="text" 
                placeholder="例如: wechat_123" 
                class="form-input text-xs w-full px-3.5 py-2.5 border rounded-2xl border border-black/10 bg-white/90"
              />
            </div>

            <!-- Avatar Selector -->
            <div class="space-y-2">
              <label class="text-[10px] font-bold uppercase tracking-wider block text-[#5e6066]">个性头像 (点击选择或下方粘贴图片链接)</label>
              <div class="flex flex-wrap gap-2 p-3 rounded-2xl bg-black/[0.02] border border-black/[0.04]">
                <button 
                  v-for="em in emojiOptions" 
                  :key="em" 
                  type="button"
                  @click="editForm.avatar = em"
                  class="w-8 h-8 rounded-xl flex items-center justify-center text-lg hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
                  :class="{ 'bg-amber-500/20 border border-amber-600/30 text-amber-800 scale-105 shadow-sm': editForm.avatar === em }"
                >
                  {{ em }}
                </button>
              </div>
              <input 
                v-model="editForm.avatar" 
                type="text" 
                placeholder="或者粘贴自定义头像图片 URL" 
                class="form-input text-[11px] w-full px-3.5 py-2 border rounded-xl font-mono border-black/10"
              />
            </div>

            <!-- Password -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-wider block text-[#5e6066]">新密码 (留空则保持原密码不变)</label>
              <input 
                v-model="editForm.password" 
                type="password" 
                placeholder="•••••••• (至少 6 位)" 
                class="form-input text-xs w-full px-3.5 py-2.5 border rounded-2xl border-black/10 bg-white/90 font-mono"
              />
            </div>

            <div v-if="modalError" class="text-[11px] text-rose-600 font-semibold bg-rose-50 border border-rose-100 p-3 rounded-2xl">
              ⚠️ {{ modalError }}
            </div>

            <div class="pt-2 flex gap-3">
              <button 
                type="button" 
                @click="closeEditModal" 
                class="flex-1 py-2.5 rounded-2xl text-xs font-bold justify-center border border-black/[0.08] hover:bg-black/5 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button 
                type="submit" 
                class="flex-1 py-2.5 rounded-2xl text-xs font-bold justify-center text-white shadow-md cursor-pointer"
                style="background: linear-gradient(135deg, #c27a3d, #b45309);"
                :disabled="modalSubmitting"
              >
                {{ modalSubmitting ? '保存中...' : '确认保存更改' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
useHead({
  title: '客户中心 — Xo Studio',
  meta: [{ name: 'description', content: '客户专属管理控制中心' }]
})

const dashboardData = ref<any>(null)
const activeTab = ref('projects')
const searchQuery = ref('')
const toastMessage = ref('')
const isEditModalOpen = ref(false)
const modalError = ref('')
const modalSubmitting = ref(false)
const deliveryKeyDraft = ref('')
const deliveryGenerating = ref(false)

const editForm = ref({
  nickname: '',
  email: '',
  wechat: '',
  avatar: '👤',
  password: ''
})

const emojiOptions = ['👤', '🎬', '🎥', '🎨', '💻', '🔊', '🎙️', '📷', '🍿', '💎', '🦊', '⚡', '👑', '🏆', '🔥']

// Trigger Toast alert
const showToast = (msg: string) => {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 2500)
}

// Filtered projects
const filteredProjects = computed(() => {
  const list = dashboardData.value?.allowedProjects || []
  if (!searchQuery.value.trim()) return list
  const q = searchQuery.value.toLowerCase().trim()
  return list.filter((p: any) => 
    (p.title || '').toLowerCase().includes(q) || 
    (p.description || '').toLowerCase().includes(q)
  )
})

// Fetch dashboard data
const fetchDashboard = async () => {
  try {
    dashboardData.value = await $fetch('/api/client/dashboard?t=' + Date.now()) as any
  } catch (err: any) {
    console.error('Failed to fetch client dashboard:', err)
  }
}

const handleLogout = async () => {
  if (!confirm('确认退出登录客户中心吗？')) return
  try {
    await $fetch('/api/auth/client-logout', { method: 'POST' })
    navigateTo('/login')
  } catch (err) {
    console.error('Failed to logout:', err)
  }
}

// Helpers
const formatDate = (isoString: string) => {
  if (!isoString) return '-'
  const date = new Date(isoString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const isImageUrl = (str: string) => {
  if (!str) return false
  return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/') || str.startsWith('.')
}

const copyText = (text: string) => {
  if (!text) return
  if (import.meta.client) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('密码已成功复制到剪贴板！')
    }).catch(() => {
      showToast('复制失败，请手动复制。')
    })
  }
}

const copyDeliveryKey = async () => {
  if (!deliveryKeyDraft.value || !import.meta.client) return
  try {
    await navigator.clipboard.writeText(deliveryKeyDraft.value)
    showToast('专属查看密钥已复制，请妥善保存。')
  } catch {
    showToast('复制失败，请手动选择密钥。')
  }
}

const generateDeliveryKey = async () => {
  if (deliveryGenerating.value) return
  deliveryGenerating.value = true
  try {
    const response = await $fetch<any>('/api/client/delivery-credentials', {
      method: 'POST',
      body: { rotate: true }
    })
    deliveryKeyDraft.value = String(response.deliveryKey || '')
    await fetchDashboard()
    if (deliveryKeyDraft.value) {
      showToast('新密钥已生成，仅本次显示完整内容。')
    }
  } catch (error: any) {
    showToast(error.data?.statusMessage || '生成密钥失败，请稍后重试。')
  } finally {
    deliveryGenerating.value = false
  }
}

// Modal handling
const openEditModal = () => {
  if (!dashboardData.value?.profile) return
  editForm.value.nickname = dashboardData.value.profile.nickname || ''
  editForm.value.email = dashboardData.value.profile.email || ''
  editForm.value.wechat = dashboardData.value.profile.wechat || ''
  editForm.value.avatar = dashboardData.value.profile.avatar || '👤'
  editForm.value.password = ''
  modalError.value = ''
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
}

const submitProfile = async () => {
  modalSubmitting.value = true
  modalError.value = ''
  
  if (!editForm.value.email.trim() && !editForm.value.wechat.trim()) {
    modalError.value = '邮箱与微信号必须选择填写一项。'
    modalSubmitting.value = false
    return
  }

  try {
    const res = await $fetch<any>('/api/client/profile', {
      method: 'POST',
      body: {
        nickname: editForm.value.nickname,
        email: editForm.value.email,
        wechat: editForm.value.wechat,
        avatar: editForm.value.avatar,
        password: editForm.value.password ? editForm.value.password : undefined
      }
    })
    if (res.success) {
      await fetchDashboard()
      closeEditModal()
      showToast('个人资料已成功保存更新！')
    }
  } catch (err: any) {
    modalError.value = err.data?.statusMessage || '保存失败，请重试。'
  } finally {
    modalSubmitting.value = false
  }
}

// Auth guard on mount
const { data: clientMe } = await useFetch<any>('/api/auth/client-me')

let observer: IntersectionObserver | null = null
onMounted(async () => {
  if (!clientMe.value?.loggedIn) {
    navigateTo('/login')
    return
  }
  
  await fetchDashboard()
  
  await nextTick()
  observer = new IntersectionObserver(
    (entries) => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view') }) },
    { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
  )
  document.querySelectorAll('.reveal').forEach(el => observer?.observe(el))
})

onBeforeUnmount(() => { if (observer) observer.disconnect() })
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px) scale(0.95);
}
</style>
