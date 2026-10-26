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
              <span class="section-label">客户控制中枢</span>
              <span class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-800 border border-amber-500/20">
                尊享客户会员
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                端到端安全会话
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
            <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
              <IconSax name="card" :size="24" />
            </div>
            <div>
              <p class="text-[10px] font-mono font-bold uppercase tracking-wider text-[#82848c]">购买订单记录</p>
              <h3 class="font-display font-bold text-2xl text-[#121316] mt-0.5">
                {{ dashboardData.orders?.length || 0 }} <span class="text-xs font-sans font-normal text-[#82848c]">笔</span>
              </h3>
              <p class="text-[10px] font-mono text-emerald-700 mt-0.5 font-bold">
                已结: ¥{{ dashboardData.orderSummary?.totalPaid || '0.00' }}
              </p>
            </div>
          </div>

          <div class="glass-card p-5 rounded-2xl flex items-center gap-4 border border-black/[0.06]">
            <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-700 shrink-0">
              <IconSax name="shield-security" :size="24" />
            </div>
            <div>
              <p class="text-[10px] font-mono font-bold uppercase tracking-wider text-[#82848c]">放映室安全等级</p>
              <h3 class="font-display font-bold text-xs text-emerald-600 mt-1 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                256-Bit GCM 通道
              </h3>
              <p class="text-[10px] font-mono text-amber-800 mt-0.5 font-bold">
                {{ dashboardData.profile.role === 'admin' ? '系统最高管理员' : '认证 Pro 客户会员' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Dedicated delivery credentials (电影级母带专属交付放映室) -->
        <section class="glass-card p-6 sm:p-8 rounded-[32px] border border-amber-900/15 shadow-[0_20px_60px_rgba(180,120,40,0.06)] relative overflow-hidden reveal">
          <!-- Top subtle gold glow accent -->
          <div class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700" />
          <div class="absolute -right-20 -top-20 w-80 h-80 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div class="relative z-10 space-y-6">
            <!-- Header Row -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="space-y-1.5">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="section-label">专属交付放映室</span>
                  <span class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-800 border border-amber-500/20">
                    Hollywood DCI Suite
                  </span>
                  <span v-if="dashboardData.delivery?.booking" class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 flex items-center gap-1">
                    <span>⚡ 已关联商业排期工程</span>
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    端到端会话加密
                  </span>
                </div>
                <h2 class="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#121316]">
                  我的专属母带交付放映厅
                </h2>
                <p class="text-xs leading-relaxed text-[#5e6066] max-w-2xl">
                  您的影视制作项目已配置专用母带播放放映室。系统支持双屏杜比视界 / DCI-P3 高色域在线校对及云端高码率提取。
                </p>
              </div>

              <!-- Quick Action Link -->
              <div class="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
                <NuxtLink
                  v-if="dashboardData.profile.deliverySuffix"
                  :to="`/delivery/${dashboardData.profile.deliverySuffix}`"
                  target="_blank"
                  class="btn-bronze text-xs py-2.5 px-4 rounded-2xl shadow-sm flex items-center gap-1.5"
                >
                  <span>🎬 立即进入交付放映室 ↗</span>
                </NuxtLink>
              </div>
            </div>

            <!-- Linked Booking Project Card (if converted from booking) -->
            <div v-if="dashboardData.delivery?.booking" class="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div class="space-y-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-xs font-bold text-[#121316]">
                    {{ dashboardData.delivery.booking.company ? `${dashboardData.delivery.booking.company} · ` : '' }}{{ dashboardData.delivery.booking.name }}
                  </span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-900 font-bold">
                    {{ dashboardData.delivery.booking.serviceType === 'tvc' ? '商业TVC' : dashboardData.delivery.booking.serviceType === 'color' ? '院线/短片调色' : '影视定制' }}
                  </span>
                  <span v-if="dashboardData.delivery.booking.timeline" class="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold">
                    交期: {{ dashboardData.delivery.booking.timeline === 'urgent' ? '⚡ 加急排期' : '标准排期' }}
                  </span>
                </div>
                <p v-if="dashboardData.delivery.booking.description" class="text-xs text-[#5e6066] line-clamp-1">
                  {{ dashboardData.delivery.booking.description }}
                </p>
              </div>
              <div class="text-[11px] font-mono text-slate-400 shrink-0">
                关联单号: {{ dashboardData.delivery.booking.id }}
              </div>
            </div>

            <!-- 2 Key Credentials Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Card 1: 专属交付地址 -->
              <div class="p-4 sm:p-5 rounded-2xl bg-white/90 border border-black/[0.08] shadow-xs flex flex-col justify-between gap-3">
                <div class="space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-[#82848c]">专属交付地址 / SUITE URL</span>
                    <span class="text-[10px] text-emerald-700 font-mono font-bold">● 在线就绪</span>
                  </div>
                  <div class="font-mono text-sm font-bold text-[#121316] break-all select-all py-1">
                    /delivery/{{ dashboardData.profile.deliverySuffix || '生成中' }}
                  </div>
                </div>

                <div class="flex items-center justify-between gap-2 pt-2 border-t border-black/[0.04]">
                  <span class="text-[11px] text-[#82848c]">浏览器独立防泄密节点</span>
                  <div class="flex items-center gap-2">
                    <NuxtLink
                      v-if="dashboardData.profile.deliverySuffix"
                      :to="`/delivery/${dashboardData.profile.deliverySuffix}`"
                      target="_blank"
                      class="text-xs font-bold text-amber-800 hover:text-amber-900 hover:underline"
                    >
                      打开 ↗
                    </NuxtLink>
                    <button
                      type="button"
                      @click="copyClientDeliveryAddress"
                      class="text-xs font-bold px-3 py-1 rounded-xl bg-black/[0.05] hover:bg-black/10 text-[#121316] transition-colors cursor-pointer"
                    >
                      复制地址
                    </button>
                  </div>
                </div>
              </div>

              <!-- Card 2: 专属提取密钥 -->
              <div class="p-4 sm:p-5 rounded-2xl bg-white/90 border border-black/[0.08] shadow-xs flex flex-col justify-between gap-3">
                <div class="space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-[#82848c]">母带提取密钥 / SECRET KEY</span>
                    <button
                      type="button"
                      @click="showDeliveryKey = !showDeliveryKey"
                      class="text-[11px] text-amber-800 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>{{ showDeliveryKey ? '🙈 隐藏' : '👁️ 显示密钥' }}</span>
                    </button>
                  </div>
                  <div class="font-mono text-sm font-bold text-[#121316] tracking-wider break-all py-1 select-all">
                    <span v-if="effectiveDeliveryKey">
                      {{ showDeliveryKey ? effectiveDeliveryKey : `•••••••••••••••• 末四位 ${effectiveDeliveryKey.slice(-4)}` }}
                    </span>
                    <span v-else class="text-slate-400 font-normal">
                      •••••••••••• 末四位 {{ dashboardData.profile.deliveryKeyHint || '----' }}
                    </span>
                  </div>
                </div>

                <div class="flex items-center justify-between gap-2 pt-2 border-t border-black/[0.04]">
                  <span class="text-[11px] text-[#82848c]">机密提取凭证，切勿泄露</span>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      @click="generateDeliveryKey"
                      :disabled="deliveryGenerating"
                      class="text-xs text-[#82848c] hover:text-[#121316] underline disabled:opacity-50 cursor-pointer"
                      title="旧密钥将立即作废并生成新密钥"
                    >
                      {{ deliveryGenerating ? '轮换中...' : '轮换密钥' }}
                    </button>
                    <button
                      type="button"
                      @click="copyClientDeliveryKey"
                      class="text-xs font-bold px-3 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 transition-colors cursor-pointer"
                    >
                      复制密钥
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Master Bottom Action Bar -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-black/[0.06]">
              <div class="text-xs text-[#5e6066] flex items-center gap-1.5">
                <span class="text-amber-700">🔒</span>
                <span>放映室受会话指纹与物理隔离保护。复制凭证可直接发送给合作方审片人员。</span>
              </div>

              <div class="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  @click="copyClientDeliveryCredentials"
                  class="btn-bronze text-xs py-2 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>📋 一键复制交付凭证 (地址 + 密钥)</span>
                </button>
              </div>
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
              <div class="flex items-center gap-1 flex-wrap">
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

                <button 
                  @click="activeTab = 'orders'"
                  :class="[
                    'px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 flex items-center gap-2 cursor-pointer',
                    activeTab === 'orders'
                      ? 'bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-md'
                      : 'text-[#82848c] hover:text-[#121316]'
                  ]"
                >
                  <IconSax name="card" :size="16" />
                  <span>购买记录</span>
                  <span :class="['px-2 py-0.5 rounded-full text-[9px] font-mono font-bold', activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-black/5 text-slate-500']">
                    {{ dashboardData.orders?.length || 0 }}
                  </span>
                </button>
              </div>

              <!-- Search Filter Input (For projects and orders tab) -->
              <div v-if="activeTab === 'projects' || activeTab === 'orders'" class="px-1 relative">
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  :placeholder="activeTab === 'orders' ? '搜索订单/商品/单号...' : '搜索专属作品...'"
                  class="form-input text-xs py-2 pl-9 pr-3.5 rounded-xl border border-black/10 w-full sm:w-52 bg-white/90 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all"
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
                        专属通行权限
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

            <!-- Tab Content 3: Orders & Purchase Records -->
            <div v-if="activeTab === 'orders'" class="space-y-6">
              
              <!-- Subfilter & KPI Mini Stats -->
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white/90 border border-black/[0.06] shadow-xs">
                <!-- Status Filter Pills -->
                <div class="flex items-center gap-1.5 p-1 rounded-xl bg-black/[0.03]">
                  <button
                    type="button"
                    @click="orderStatusFilter = 'all'"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                      orderStatusFilter === 'all'
                        ? 'bg-white text-[#121316] shadow-xs'
                        : 'text-[#82848c] hover:text-[#121316]'
                    ]"
                  >
                    全部 ({{ dashboardData.orders?.length || 0 }})
                  </button>
                  <button
                    type="button"
                    @click="orderStatusFilter = 'paid'"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                      orderStatusFilter === 'paid'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-[#82848c] hover:text-emerald-700'
                    ]"
                  >
                    已付款 ({{ dashboardData.orderSummary?.paidCount || 0 }})
                  </button>
                  <button
                    type="button"
                    @click="orderStatusFilter = 'created'"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                      orderStatusFilter === 'created'
                        ? 'bg-amber-700 text-white shadow-xs'
                        : 'text-[#82848c] hover:text-amber-800'
                    ]"
                  >
                    待付款 ({{ dashboardData.orderSummary?.pendingCount || 0 }})
                  </button>
                </div>

                <!-- Total Amount Pill -->
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs font-mono font-bold self-end sm:self-auto">
                  <span class="text-[10px] text-amber-800 font-sans font-normal">已结清总额</span>
                  <span class="text-sm">¥{{ dashboardData.orderSummary?.totalPaid || '0.00' }}</span>
                </div>
              </div>

              <!-- Available Assigned Product / Quotation Cards (if any) -->
              <div v-if="dashboardData.orderSummary?.availableProducts?.length" class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-[#121316] flex items-center gap-1.5">
                    <span class="text-amber-600">⚡</span>
                    <span>专属定向商品 / 项目报价单</span>
                  </span>
                  <span class="text-[11px] font-mono text-slate-400">后台定向绑定商品</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="prod in dashboardData.orderSummary.availableProducts"
                    :key="prod.suffix"
                    class="p-5 rounded-2xl bg-gradient-to-br from-amber-500/[0.07] via-white to-amber-500/[0.03] border border-amber-500/25 shadow-xs flex flex-col justify-between gap-4"
                  >
                    <div class="space-y-2">
                      <div class="flex items-start justify-between gap-2">
                        <div>
                          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-900 font-bold uppercase">
                            /order/{{ prod.suffix }}
                          </span>
                          <h4 class="font-display font-bold text-base text-[#121316] mt-1.5">
                            {{ prod.subject }}
                          </h4>
                        </div>
                        <div class="text-right">
                          <span class="text-[10px] text-slate-400 block font-mono">固定价格</span>
                          <strong class="font-display font-bold text-lg text-amber-900">
                            <i>¥</i>{{ prod.amount }}
                          </strong>
                        </div>
                      </div>
                      <p v-if="prod.description" class="text-xs text-[#5e6066] leading-relaxed line-clamp-2">
                        {{ prod.description }}
                      </p>
                    </div>

                    <div class="flex items-center justify-between gap-2 pt-3 border-t border-amber-500/15">
                      <span class="text-[10px] font-mono text-slate-400">
                        {{ prod.isPaid ? '● 已存在支付记录' : '● 等待在线支付' }}
                      </span>
                      <div class="flex items-center gap-2">
                        <button
                          type="button"
                          @click="copyOrderPageUrl(prod.suffix)"
                          class="text-xs font-bold px-3 py-1.5 rounded-xl border border-black/10 hover:bg-black/5 text-[#121316] transition-colors cursor-pointer"
                        >
                          复制链接
                        </button>
                        <NuxtLink
                          :to="prod.pageUrl"
                          target="_blank"
                          class="btn-bronze text-xs py-1.5 px-3.5 rounded-xl shadow-xs flex items-center gap-1"
                        >
                          <span>前往付款 ↗</span>
                        </NuxtLink>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Orders List Grid -->
              <div v-if="filteredOrders.length" class="space-y-4">
                <div
                  v-for="order in filteredOrders"
                  :key="order.outTradeNo"
                  class="glass-card p-5 sm:p-6 rounded-[28px] border border-black/[0.06] hover:border-amber-600/30 transition-all duration-300 space-y-4 shadow-xs"
                >
                  <!-- Card Header: Title + Status + Price -->
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.05]">
                    <div class="space-y-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <h4 class="font-display font-bold text-base sm:text-lg text-[#121316]">
                          {{ order.pageSubject || order.subject }}
                        </h4>
                        <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/[0.04] text-slate-600">
                          #{{ order.suffix }}
                        </span>
                        <!-- Status Badge -->
                        <span
                          v-if="order.status === 'paid'"
                          class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 flex items-center gap-1"
                        >
                          <IconSax name="tick" :size="12" class="text-emerald-600" />
                          <span>已支付成功</span>
                        </span>
                        <span
                          v-else-if="order.status === 'created'"
                          class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/20 text-amber-800 flex items-center gap-1"
                        >
                          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>待支付</span>
                        </span>
                        <span
                          v-else
                          class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-500"
                        >
                          已关闭
                        </span>
                      </div>
                      <p v-if="order.pageDescription" class="text-xs text-[#5e6066] line-clamp-1">
                        {{ order.pageDescription }}
                      </p>
                    </div>

                    <!-- Price Column -->
                    <div class="text-left sm:text-right shrink-0">
                      <span class="text-[10px] font-mono text-slate-400 block uppercase">
                        {{ order.status === 'paid' ? '实付金额' : '应付金额' }}
                      </span>
                      <strong class="font-display font-bold text-2xl text-amber-900 tracking-tight">
                        <i class="text-base font-normal mr-0.5">¥</i>{{ order.amount }}
                      </strong>
                    </div>
                  </div>

                  <!-- Details Grid -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono text-[#5e6066] bg-black/[0.015] p-3.5 rounded-2xl border border-black/[0.03]">
                    <div class="flex items-center justify-between sm:justify-start gap-2">
                      <span class="text-slate-400">商户单号:</span>
                      <span class="font-bold text-[#121316] select-all truncate">{{ order.outTradeNo }}</span>
                    </div>

                    <div class="flex items-center justify-between sm:justify-start gap-2">
                      <span class="text-slate-400">下单时间:</span>
                      <span class="font-bold text-[#121316]">{{ formatDate(order.createdAt) }}</span>
                    </div>

                    <div class="flex items-center justify-between sm:justify-start gap-2">
                      <span class="text-slate-400">支付状态:</span>
                      <span class="font-bold" :class="order.status === 'paid' ? 'text-emerald-700' : 'text-amber-700'">
                        {{ order.status === 'paid' ? (order.paidAt ? formatDate(order.paidAt) : '付款成功') : '等待付款' }}
                      </span>
                    </div>

                    <div v-if="order.tradeNo" class="flex items-center justify-between sm:justify-start gap-2">
                      <span class="text-slate-400">Stripe 流水:</span>
                      <span class="font-bold text-[#121316] select-all truncate">{{ order.tradeNo }}</span>
                    </div>

                    <div v-if="order.buyerLogonId" class="flex items-center justify-between sm:justify-start gap-2">
                      <span class="text-slate-400">买家账号:</span>
                      <span class="font-bold text-[#121316] select-all truncate">{{ order.buyerLogonId }}</span>
                    </div>

                    <div v-if="order.note" class="flex items-center justify-between sm:justify-start gap-2 sm:col-span-2">
                      <span class="text-slate-400 shrink-0">备注说明:</span>
                      <span class="font-sans text-[#121316] truncate">{{ order.note }}</span>
                    </div>
                  </div>

                  <!-- Card Footer Actions -->
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div class="flex items-center gap-2">
                      <NuxtLink
                        :to="order.pageUrl"
                        target="_blank"
                        class="text-xs text-amber-800 hover:text-amber-900 hover:underline flex items-center gap-1"
                      >
                        <span>查看商品页面 /order/{{ order.suffix }} ↗</span>
                      </NuxtLink>
                    </div>

                    <div class="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                      <button
                        type="button"
                        @click="copyOrderNo(order.outTradeNo)"
                        class="text-xs font-bold px-3 py-1.5 rounded-xl border border-black/10 hover:bg-black/5 text-[#121316] transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <IconSax name="copy" :size="12" />
                        <span>复制单号</span>
                      </button>

                      <!-- If Pending: Pay Now -->
                      <NuxtLink
                        v-if="order.status === 'created'"
                        :to="order.pageUrl"
                        target="_blank"
                        class="btn-bronze text-xs py-1.5 px-4 rounded-xl shadow-xs flex items-center gap-1"
                      >
                        <span>💳 立即前往付款 ↗</span>
                      </NuxtLink>

                      <!-- If Paid: Open Delivery Suite -->
                      <NuxtLink
                        v-else-if="order.status === 'paid' && (dashboardData.profile.deliverySuffix || order.deliverySuffix)"
                        :to="`/delivery/${dashboardData.profile.deliverySuffix || order.deliverySuffix}`"
                        target="_blank"
                        class="btn-bronze text-xs py-1.5 px-4 rounded-xl shadow-xs flex items-center gap-1"
                      >
                        <span>🎬 进入交付放映厅 ↗</span>
                      </NuxtLink>
                    </div>
                  </div>

                </div>
              </div>

              <!-- Empty Orders State -->
              <div v-else class="glass-card p-12 rounded-[32px] text-center flex flex-col items-center justify-center space-y-3 border border-black/[0.06]">
                <div class="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 text-3xl">
                  🧾
                </div>
                <h4 class="font-display font-bold text-base text-[#121316]">暂无购买记录</h4>
                <p class="text-xs max-w-sm leading-relaxed text-[#82848c]">
                  您在此账号下暂无符合筛选条件的订单记录。当项目生成定金、尾款或专属报价单后，可在本栏目实时跟踪支付流水与母带交付进度。
                </p>
                <div v-if="orderStatusFilter !== 'all'" class="pt-2">
                  <button
                    type="button"
                    @click="orderStatusFilter = 'all'"
                    class="text-xs font-bold px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5 transition-colors cursor-pointer"
                  >
                    查看全部订单
                  </button>
                </div>
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
        <div class="relative glass-card p-6 sm:p-7 w-full max-w-md space-y-5 shadow-2xl z-10 rounded-[32px]" style="background: var(--glass-bg); border-color: var(--color-border-2);">
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

            <!-- Password & Current Password -->
            <div class="space-y-3 pt-1 border-t border-black/5">
              <div class="space-y-1">
                <label class="text-[10px] font-bold uppercase tracking-wider block text-[#5e6066]">新密码 (留空则保持原密码不变)</label>
                <input 
                  v-model="editForm.password" 
                  type="password" 
                  placeholder="•••••••• (至少 6 位)" 
                  class="form-input text-xs w-full px-3.5 py-2.5 border rounded-2xl border-black/10 bg-white/90 font-mono"
                />
              </div>

              <!-- Current Password Confirmation (Required when changing password) -->
              <div v-if="editForm.password" class="space-y-1 bg-amber-500/5 border border-amber-500/20 p-3 rounded-2xl">
                <label class="text-[10px] font-bold uppercase tracking-wider block text-amber-700">当前原密码 (修改密码时必填安全校验)</label>
                <input 
                  v-model="editForm.currentPassword" 
                  type="password" 
                  placeholder="请输入当前正在使用的原密码" 
                  class="form-input text-xs w-full px-3.5 py-2.5 border rounded-xl border-amber-500/30 bg-white font-mono text-amber-950 placeholder:text-amber-800/40"
                />
                <p class="text-[10px] text-amber-800/70">为确保账号安全，修改密码时需验证当前原密码。修改成功后将刷新登录会话。</p>
              </div>
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
  password: '',
  currentPassword: ''
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

// Delivery key and suite states
const showDeliveryKey = ref(false)
const effectiveDeliveryKey = computed(() => {
  return deliveryKeyDraft.value || dashboardData.value?.profile?.deliveryKey || dashboardData.value?.delivery?.key || ''
})

// Orders tab state and filters
const orderStatusFilter = ref<'all' | 'paid' | 'created'>('all')

const filteredOrders = computed(() => {
  const list = dashboardData.value?.orders || []
  let result = list

  if (orderStatusFilter.value !== 'all') {
    result = result.filter((o: any) => o.status === orderStatusFilter.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter((o: any) =>
      (o.subject || '').toLowerCase().includes(q) ||
      (o.outTradeNo || '').toLowerCase().includes(q) ||
      (o.suffix || '').toLowerCase().includes(q) ||
      (o.tradeNo || '').toLowerCase().includes(q) ||
      (o.note || '').toLowerCase().includes(q) ||
      (o.pageDescription || '').toLowerCase().includes(q)
    )
  }

  return result
})

const copyOrderNo = (no: string) => {
  if (!no || !import.meta.client) return
  navigator.clipboard.writeText(no).then(() => {
    showToast(`订单号已复制：${no}`)
  }).catch(() => {
    showToast('复制失败，请手动复制。')
  })
}

const copyOrderPageUrl = (suffix: string) => {
  if (!suffix || !import.meta.client) return
  const origin = window.location.origin
  const url = `${origin}/order/${suffix}`
  navigator.clipboard.writeText(url).then(() => {
    showToast(`订单付款地址已复制！\n${url}`)
  }).catch(() => {
    showToast(`复制失败，请手动复制：${url}`)
  })
}

const copyClientDeliveryAddress = async () => {
  if (!dashboardData.value?.profile?.deliverySuffix || !import.meta.client) return
  const origin = window.location.origin
  const url = `${origin}/delivery/${dashboardData.value.profile.deliverySuffix}`
  try {
    await navigator.clipboard.writeText(url)
    showToast(`专属交付地址已复制到剪贴板！\n${url}`)
  } catch {
    showToast(`复制失败，请手动复制：${url}`)
  }
}

const copyClientDeliveryKey = async () => {
  const key = effectiveDeliveryKey.value
  if (!key || !import.meta.client) {
    showToast('暂无完整密钥。如需新密钥，请点击“轮换密钥”。')
    return
  }
  try {
    await navigator.clipboard.writeText(key)
    showToast('专属提取密钥已复制，请妥善保存。')
  } catch {
    showToast('复制失败，请手动选择密钥。')
  }
}

const copyClientDeliveryCredentials = async () => {
  if (!import.meta.client) return
  const suffix = dashboardData.value?.profile?.deliverySuffix
  const key = effectiveDeliveryKey.value || `末四位 ${dashboardData.value?.profile?.deliveryKeyHint || '----'}`
  const origin = window.location.origin
  const url = suffix ? `${origin}/delivery/${suffix}` : '未生成'
  const text = `【XO Studio 专属母带交付凭证】\n放映室地址：${url}\n提取密钥：${key}\n（端到端加密通道，请妥善保管）`
  try {
    await navigator.clipboard.writeText(text)
    showToast('专属交付凭证（地址 + 密钥）已完整复制！')
  } catch {
    showToast('复制失败，请手动复制凭证。')
  }
}

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
  editForm.value.currentPassword = ''
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

  if (editForm.value.password) {
    if (editForm.value.password.trim().length < 6) {
      modalError.value = '新密码长度至少为 6 位。'
      modalSubmitting.value = false
      return
    }
    if (!editForm.value.currentPassword?.trim()) {
      modalError.value = '修改密码需输入当前原密码进行安全确认。'
      modalSubmitting.value = false
      return
    }
  }

  try {
    const res = await $fetch<any>('/api/client/profile', {
      method: 'POST',
      body: {
        nickname: editForm.value.nickname,
        email: editForm.value.email,
        wechat: editForm.value.wechat,
        avatar: editForm.value.avatar,
        password: editForm.value.password ? editForm.value.password : undefined,
        currentPassword: editForm.value.currentPassword ? editForm.value.currentPassword : undefined
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
