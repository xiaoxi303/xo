<template>
  <div class="min-h-screen pt-24 pb-20 px-4 sm:px-6">
    <!-- Toast Floating Alert -->
    <Transition name="toast">
      <div 
        v-if="toastMessage" 
        class="fixed top-8 left-1/2 -translate-x-1/2 z-[300] px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl border text-xs font-semibold flex items-center gap-2"
        style="background: rgba(18, 19, 22, 0.92); color: #ffffff; border-color: rgba(217, 119, 6, 0.3); box-shadow: 0 10px 30px rgba(0,0,0,0.15);"
      >
        <span class="text-amber-400">✨</span>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <div class="max-w-6xl mx-auto space-y-8">
      
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 reveal">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="section-label">Client Control Hub</span>
            <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 border border-amber-500/20">
              PRO CLIENT
            </span>
          </div>
          <h1 class="font-display text-4xl font-bold tracking-tight text-[#121316]">
            客户控制中心
          </h1>
          <p class="text-xs max-w-lg font-sans leading-relaxed text-[#5e6066]">
            在此管理您的客户个人资料、提现专属加密项目凭证，以及实时追踪密码申请审批进度。
          </p>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="btn-ghost text-xs py-2.5 px-4 rounded-xl border border-black/[0.06] hover:bg-black/[0.03]">
            🏠 返回首页
          </NuxtLink>
          <button @click="handleLogout" class="btn-bronze text-xs py-2.5 px-4 rounded-xl shadow-sm">
            🚪 退出登录
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div v-if="dashboardData" class="space-y-8">
        
        <!-- KPI Dashboard Quick Stats Overview -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 reveal">
          <div class="glass-card p-5 flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl shrink-0">
              🎬
            </div>
            <div>
              <p class="text-[10px] font-mono font-bold uppercase tracking-wider text-[#82848c]">专属授权作品</p>
              <h3 class="font-display font-bold text-2xl text-[#121316] mt-0.5">
                {{ dashboardData.allowedProjects?.length || 0 }} <span class="text-xs font-sans font-normal text-[#82848c]">部</span>
              </h3>
            </div>
          </div>

          <div class="glass-card p-5 flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl shrink-0">
              📨
            </div>
            <div>
              <p class="text-[10px] font-mono font-bold uppercase tracking-wider text-[#82848c]">授权申请记录</p>
              <h3 class="font-display font-bold text-2xl text-[#121316] mt-0.5">
                {{ dashboardData.requests?.length || 0 }} <span class="text-xs font-sans font-normal text-[#82848c]">条</span>
              </h3>
            </div>
          </div>

          <div class="glass-card p-5 flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl shrink-0">
              🛡️
            </div>
            <div>
              <p class="text-[10px] font-mono font-bold uppercase tracking-wider text-[#82848c]">账号保护状态</p>
              <h3 class="font-display font-bold text-sm text-emerald-600 mt-1 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                安全加密连接
              </h3>
            </div>
          </div>
        </div>

        <!-- Main Layout: Grid 12 Cols -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Left Column: User Profile Card (4 cols) -->
          <div class="lg:col-span-4 space-y-6 reveal">
            <div class="glass-card p-6 flex flex-col items-center text-center space-y-5 relative overflow-hidden">
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
                  {{ dashboardData.profile.role === 'admin' ? '系统最高管理员' : '认证客户会员' }}
                </div>
              </div>

              <div class="w-full pt-4 border-t border-black/[0.04] text-left text-xs font-mono space-y-3 text-[#5e6066]">
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
                class="btn-ghost w-full justify-center py-2.5 text-xs font-semibold rounded-xl border border-black/[0.08] hover:bg-black/[0.03] transition-all"
              >
                ⚙️ 编辑个人资料与密码
              </button>
            </div>
          </div>

          <!-- Right Column: Projects & Requests Tabs (8 cols) -->
          <div class="lg:col-span-8 space-y-6 reveal">
            
            <!-- Controls Bar: Navigation Tabs + Search Filter -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-1.5 rounded-2xl bg-black/[0.03] border border-black/[0.05]">
              <div class="flex items-center gap-1">
                <button 
                  @click="activeTab = 'projects'"
                  :class="[
                    'px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-2',
                    activeTab === 'projects'
                      ? 'bg-white text-[#121316] shadow-sm border border-black/[0.06]'
                      : 'text-[#82848c] hover:text-[#121316]'
                  ]"
                >
                  <span>🎥 专属授权项目</span>
                  <span :class="['px-1.5 py-0.2 rounded-full text-[9px] font-mono', activeTab === 'projects' ? 'bg-amber-500/15 text-amber-800' : 'bg-black/5 text-slate-500']">
                    {{ dashboardData.allowedProjects?.length || 0 }}
                  </span>
                </button>

                <button 
                  @click="activeTab = 'requests'"
                  :class="[
                    'px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-2',
                    activeTab === 'requests'
                      ? 'bg-white text-[#121316] shadow-sm border border-black/[0.06]'
                      : 'text-[#82848c] hover:text-[#121316]'
                  ]"
                >
                  <span>📨 密码申请记录</span>
                  <span :class="['px-1.5 py-0.2 rounded-full text-[9px] font-mono', activeTab === 'requests' ? 'bg-amber-500/15 text-amber-800' : 'bg-black/5 text-slate-500']">
                    {{ dashboardData.requests?.length || 0 }}
                  </span>
                </button>
              </div>

              <!-- Search Filter Input (For projects tab) -->
              <div v-if="activeTab === 'projects'" class="px-2">
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  placeholder="🔍 搜索专属作品..."
                  class="form-input text-xs py-1.5 px-3 rounded-xl border border-black/[0.08] w-full sm:w-44 bg-white/80"
                />
              </div>
            </div>

            <!-- Tab Content 1: Allowed Projects -->
            <div v-if="activeTab === 'projects'" class="space-y-4">
              <div v-if="filteredProjects.length" class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div 
                  v-for="project in filteredProjects" 
                  :key="project.slug"
                  class="glass-card overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 border border-black/[0.06]"
                >
                  <!-- Thumbnail Container -->
                  <div class="relative h-44 overflow-hidden bg-black">
                    <img 
                      v-if="project.image" 
                      :src="project.image" 
                      :alt="project.title"
                      class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center bg-stone-900 text-4xl">🎬</div>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                      <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-600/90 text-white backdrop-blur-md uppercase">
                        EXCLUSIVE
                      </span>
                    </div>
                  </div>

                  <!-- Text Content -->
                  <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div class="space-y-1.5">
                      <h3 class="font-display font-bold text-base text-[#121316] group-hover:text-amber-700 transition-colors line-clamp-1">
                        {{ project.title }}
                      </h3>
                      <p class="text-xs line-clamp-2 leading-relaxed text-[#5e6066]">
                        {{ project.description }}
                      </p>
                    </div>

                    <!-- Actions / Password Copy Bar -->
                    <div class="space-y-3 pt-3 border-t border-black/[0.04]">
                      <div class="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15">
                        <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800">专属解密密码</span>
                        <div class="flex items-center gap-2">
                          <span class="font-mono font-bold text-sm tracking-widest text-[#121316]">
                            {{ project.password }}
                          </span>
                          <button 
                            @click="copyText(project.password)"
                            class="text-[10px] font-bold px-2 py-1 rounded bg-amber-600/10 text-amber-800 hover:bg-amber-600/20 transition-all"
                            title="复制密码"
                          >
                            📋 复制
                          </button>
                        </div>
                      </div>

                      <div class="flex gap-2">
                        <NuxtLink 
                          :to="'/projects/' + project.slug"
                          class="flex-1 btn-bronze text-center justify-center py-2 text-xs rounded-xl font-semibold shadow-sm"
                        >
                          🎥 立即观看作品
                        </NuxtLink>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty Filtered Projects -->
              <div v-else class="glass-card p-12 text-center flex flex-col items-center justify-center space-y-3">
                <span class="text-4xl">🎬</span>
                <p class="text-sm font-display font-medium text-[#2d2f34]">
                  {{ searchQuery ? '未搜索到匹配作品' : '暂无专属授权作品' }}
                </p>
                <p class="text-xs max-w-xs leading-relaxed text-[#82848c]">
                  {{ searchQuery ? '请尝试更换搜索关键字' : '您目前尚未获得任何加密作品的专属授权。您可以浏览主页并提交申请获取特定视频的密码。' }}
                </p>
                <NuxtLink v-if="!searchQuery" to="/" class="btn-bronze text-xs py-2.5 px-5 rounded-xl mt-2 shadow-sm">
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
                  class="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-black/[0.04] hover:border-black/[0.08] transition-all"
                >
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="text-sm">🎬</span>
                      <h4 class="font-bold text-xs sm:text-sm text-[#121316]">
                        {{ req.projectTitle }}
                      </h4>
                    </div>
                    <p class="text-[10px] font-mono text-[#82848c]">
                      申请时间：{{ formatDate(req.createdAt) }} · 联系方式：{{ req.contact }}
                    </p>
                    <p v-if="req.reason" class="text-[11px] text-[#5e6066] mt-1 bg-black/[0.02] p-2 rounded-lg border border-black/[0.03]">
                      💬 申请原由：{{ req.reason }}
                    </p>
                  </div>

                  <div class="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <!-- Status Badges -->
                    <span 
                      v-if="req.status === 'pending'"
                      class="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center gap-1"
                    >
                      <span>🟡</span> <span>审核中</span>
                    </span>
                    <span 
                      v-else-if="req.status === 'approved'"
                      class="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 flex items-center gap-1"
                    >
                      <span>🟢</span> <span>已授权通过</span>
                    </span>
                    <span 
                      v-else-if="req.status === 'rejected'"
                      class="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 border border-rose-500/20 text-rose-700 flex items-center gap-1"
                    >
                      <span>🔴</span> <span>审核未通过</span>
                    </span>

                    <!-- Action for approved -->
                    <NuxtLink 
                      v-if="req.status === 'approved'"
                      :to="'/projects/' + req.projectSlug"
                      class="btn-ghost text-[10px] font-bold py-1.5 px-3 rounded-lg border border-black/[0.08] hover:text-[#b45309]"
                    >
                      观看视频 &rarr;
                    </NuxtLink>
                  </div>
                </div>
              </div>

              <!-- Empty Requests -->
              <div v-else class="glass-card p-12 text-center flex flex-col items-center justify-center space-y-3">
                <span class="text-4xl">📨</span>
                <p class="text-sm font-display font-medium text-[#2d2f34]">暂无密码申请记录</p>
                <p class="text-xs max-w-xs leading-relaxed text-[#82848c]">
                  您尚未提交过任何作品的授权申请。如需查看受 NDA 保护的加密视频，请在作品页点击提交申请。
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
        <div class="relative glass-card p-6 w-full max-w-md space-y-5 shadow-2xl z-10" style="background: rgba(254, 252, 248, 0.98);">
          <div class="flex justify-between items-center border-b border-black/[0.06] pb-3">
            <h3 class="font-display font-bold text-base text-[#121316]">编辑个人资料</h3>
            <button @click="closeEditModal" class="text-slate-400 hover:text-slate-700 text-base font-bold">✕</button>
          </div>

          <form @submit.prevent="submitProfile" class="space-y-4 text-left">
            <!-- Nickname -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-wider block text-[#5e6066]">昵称 / 真实姓名</label>
              <input 
                v-model="editForm.nickname" 
                type="text" 
                placeholder="例如：张导演 / 某广告机构" 
                class="form-input text-xs w-full px-3 py-2.5 border rounded-xl"
              />
            </div>

            <!-- Email -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-wider block text-amber-800">电子邮箱 (邮箱与微信必填一项)</label>
              <input 
                v-model="editForm.email" 
                type="email" 
                placeholder="example@mail.com" 
                class="form-input text-xs w-full px-3 py-2.5 border rounded-xl"
              />
            </div>

            <!-- WeChat -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-wider block text-amber-800">微信号 (邮箱与微信必填一项)</label>
              <input 
                v-model="editForm.wechat" 
                type="text" 
                placeholder="例如: wechat_123" 
                class="form-input text-xs w-full px-3 py-2.5 border rounded-xl"
              />
            </div>

            <!-- Avatar Selector -->
            <div class="space-y-2">
              <label class="text-[10px] font-bold uppercase tracking-wider block text-[#5e6066]">个性头像 (点击选择或下方粘贴图片链接)</label>
              <div class="flex flex-wrap gap-2 p-3 rounded-xl bg-black/[0.02] border border-black/[0.04]">
                <button 
                  v-for="em in emojiOptions" 
                  :key="em" 
                  type="button"
                  @click="editForm.avatar = em"
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-black/5 active:scale-95 transition-all"
                  :class="{ 'bg-amber-500/20 border border-amber-600/30 text-amber-800 scale-105 shadow-sm': editForm.avatar === em }"
                >
                  {{ em }}
                </button>
              </div>
              <input 
                v-model="editForm.avatar" 
                type="text" 
                placeholder="或者粘贴自定义头像图片 URL" 
                class="form-input text-[11px] w-full px-3 py-2 border rounded-xl font-mono"
              />
            </div>

            <!-- Password -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-wider block text-[#5e6066]">新密码 (留空则保持原密码不变)</label>
              <input 
                v-model="editForm.password" 
                type="password" 
                placeholder="•••••••• (至少 6 位)" 
                class="form-input text-xs w-full px-3 py-2.5 border rounded-xl font-mono"
              />
            </div>

            <div v-if="modalError" class="text-[11px] text-rose-600 font-semibold bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-xl">
              ⚠️ {{ modalError }}
            </div>

            <div class="pt-2 flex gap-3">
              <button 
                type="button" 
                @click="closeEditModal" 
                class="flex-1 btn-ghost py-2.5 rounded-xl text-xs font-semibold justify-center border border-black/[0.08]"
              >
                取消
              </button>
              <button 
                type="submit" 
                class="flex-1 btn-bronze py-2.5 rounded-xl text-xs font-semibold justify-center shadow-sm"
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
