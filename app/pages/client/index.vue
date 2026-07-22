<template>
  <div class="min-h-screen pt-28 pb-20 px-6">
    <div class="max-w-6xl mx-auto space-y-10">
      
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 reveal">
        <div class="space-y-3">
          <p class="section-label">Client Space</p>
          <h1 class="font-display text-4xl font-bold tracking-tight" style="color: var(--color-ink-1)">
            客户控制中心
          </h1>
          <p class="text-xs max-w-md font-sans leading-relaxed" style="color: var(--color-ink-4)">
            在此管理您的客户资料、查看专属于您的授权项目，以及实时追踪密码申请审批状态。
          </p>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="btn-ghost text-xs py-2 px-4 rounded-xl">返回主页</NuxtLink>
          <button @click="handleLogout" class="btn-bronze text-xs py-2 px-4 rounded-xl">退出登录</button>
        </div>
      </div>

      <!-- Main Dashboard Grid -->
      <div v-if="dashboardData" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left Column: User Profile Card (4 cols) -->
        <div class="lg:col-span-4 space-y-6 reveal">
          <div class="glass-card p-6 flex flex-col items-center text-center space-y-5">
            <!-- Avatar Display -->
            <div class="relative w-20 h-20 rounded-full border border-black/[0.08] bg-black/[0.02] flex items-center justify-center overflow-hidden shadow-sm">
              <img 
                v-if="isImageUrl(dashboardData.profile.avatar)" 
                :src="dashboardData.profile.avatar" 
                alt="Avatar"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-4xl">{{ dashboardData.profile.avatar || '👤' }}</span>
            </div>

            <!-- Profile Info -->
            <div class="space-y-1">
              <h2 class="font-display font-bold text-lg" style="color: var(--color-ink-1)">
                {{ dashboardData.profile.nickname || dashboardData.profile.username }}
              </h2>
              <p class="text-xs font-mono" style="color: var(--color-ink-5)">
                账号：{{ dashboardData.profile.username }}
              </p>
              <div class="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider mt-1.5"
                   style="background: rgba(180,83,9,0.06); color: var(--color-bronze); border: 1px solid rgba(180,83,9,0.12);">
                {{ dashboardData.profile.role === 'admin' ? '系统管理员' : '认证客户' }}
              </div>
            </div>

            <div class="w-full pt-4 border-t border-black/[0.04] text-left text-xs font-mono space-y-2.5" style="color: var(--color-ink-4)">
              <div class="flex justify-between">
                <span>绑定邮箱</span>
                <span class="font-bold" style="color: var(--color-ink-2)">{{ dashboardData.profile.email || '未绑定' }}</span>
              </div>
              <div class="flex justify-between">
                <span>绑定微信</span>
                <span class="font-bold" style="color: var(--color-ink-2)">{{ dashboardData.profile.wechat || '未绑定' }}</span>
              </div>
              <div class="flex justify-between">
                <span>注册时间</span>
                <span class="font-bold" style="color: var(--color-ink-2)">{{ formatDate(dashboardData.profile.createdAt) }}</span>
              </div>
            </div>

            <!-- Edit Button -->
            <button 
              @click="openEditModal" 
              class="btn-ghost w-full justify-center py-2 text-xs font-semibold rounded-xl border border-black/[0.06]"
            >
              ⚙️ 编辑个人资料
            </button>
          </div>
        </div>

        <!-- Right Column: Projects & Requests tabs (8 cols) -->
        <div class="lg:col-span-8 space-y-6 reveal">
          <!-- Navigation tabs -->
          <div class="flex border-b border-black/[0.06] gap-6 text-sm">
            <button 
              @click="activeTab = 'projects'"
              class="pb-3 relative font-medium transition-colors"
              :class="activeTab === 'projects' ? 'text-[#b45309]' : 'text-slate-500 hover:text-slate-800'"
            >
              🎥 专属授权项目 ({{ dashboardData.allowedProjects?.length || 0 }})
              <span v-if="activeTab === 'projects'" class="absolute bottom-0 inset-x-0 h-0.5 bg-[#b45309]" />
            </button>
            <button 
              @click="activeTab = 'requests'"
              class="pb-3 relative font-medium transition-colors"
              :class="activeTab === 'requests' ? 'text-[#b45309]' : 'text-slate-500 hover:text-slate-800'"
            >
              📨 密码申请记录 ({{ dashboardData.requests?.length || 0 }})
              <span v-if="activeTab === 'requests'" class="absolute bottom-0 inset-x-0 h-0.5 bg-[#b45309]" />
            </button>
          </div>

          <!-- Tab Content 1: Allowed Projects -->
          <div v-if="activeTab === 'projects'" class="space-y-4">
            <div v-if="dashboardData.allowedProjects?.length" class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div 
                v-for="project in dashboardData.allowedProjects" 
                :key="project.slug"
                class="glass-card overflow-hidden flex flex-col group"
              >
                <!-- Image thumbnail -->
                <div class="relative h-40 overflow-hidden bg-black">
                  <img 
                    v-if="project.image" 
                    :src="project.image" 
                    :alt="project.title"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center bg-amber-950/20 text-4xl">🎬</div>
                  <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                <!-- Text Content -->
                <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div class="space-y-1">
                    <h3 class="font-display font-semibold text-base group-hover:text-amber-800 transition-colors" style="color: var(--color-ink-1)">
                      {{ project.title }}
                    </h3>
                    <p class="text-xs line-clamp-2 leading-relaxed" style="color: var(--color-ink-4)">
                      {{ project.description }}
                    </p>
                  </div>

                  <!-- Actions / Password copy -->
                  <div class="space-y-2 pt-3 border-t border-black/[0.04]">
                    <div class="flex items-center justify-between text-[11px]">
                      <span class="font-mono" style="color: var(--color-ink-5)">解锁密码:</span>
                      <span class="font-mono font-bold bg-amber-600/10 px-2 py-0.5 rounded text-amber-800">
                        {{ project.password }}
                      </span>
                    </div>

                    <div class="flex gap-2">
                      <NuxtLink 
                        :to="'/projects/' + project.slug"
                        class="flex-1 btn-bronze text-center justify-center py-2 text-[10px] rounded-lg font-semibold"
                      >
                        🎥 立即观看
                      </NuxtLink>
                      <button 
                        @click="copyText(project.password)"
                        class="btn-ghost py-2 px-3 text-[10px] rounded-lg border border-black/[0.06] font-semibold"
                      >
                        📋 复制密码
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty projects -->
            <div v-else class="glass-card p-12 text-center flex flex-col items-center justify-center space-y-3">
              <span class="text-4xl">🎬</span>
              <p class="text-sm font-display font-medium" style="color: var(--color-ink-3)">暂无专属授权作品</p>
              <p class="text-xs max-w-xs leading-relaxed" style="color: var(--color-ink-5)">
                您目前尚未获得任何加密作品的专属授权。您可以浏览主页并提交申请获取特定视频的密码。
              </p>
              <NuxtLink to="/" class="btn-bronze text-xs py-2 px-4 rounded-xl mt-2">浏览公开作品</NuxtLink>
            </div>
          </div>

          <!-- Tab Content 2: Request History -->
          <div v-if="activeTab === 'requests'" class="space-y-4">
            <div v-if="dashboardData.requests?.length" class="space-y-3">
              <div 
                v-for="req in dashboardData.requests" 
                :key="req.id"
                class="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xs">🎬</span>
                    <h4 class="font-semibold text-xs text-slate-800 sm:text-sm">
                      {{ req.projectTitle }}
                    </h4>
                  </div>
                  <p class="text-[10px] font-mono" style="color: var(--color-ink-5)">
                    申请时间：{{ formatDate(req.createdAt) }} · 联系方式：{{ req.contact }}
                  </p>
                </div>

                <div class="flex items-center gap-3 self-end sm:self-auto">
                  <!-- Status Badge -->
                  <span 
                    v-if="req.status === 'pending'"
                    class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/10 border border-amber-500/20 text-amber-700"
                  >
                    🟡 审核中
                  </span>
                  <span 
                    v-else-if="req.status === 'approved'"
                    class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-700"
                  >
                    🟢 已通过
                  </span>
                  <span 
                    v-else-if="req.status === 'rejected'"
                    class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-500/10 border border-rose-500/20 text-rose-700"
                  >
                    🔴 已拒绝
                  </span>

                  <!-- Action for approved -->
                  <NuxtLink 
                    v-if="req.status === 'approved'"
                    :to="'/projects/' + req.projectSlug"
                    class="btn-ghost text-[10px] font-bold py-1 px-2.5 rounded-lg border border-black/[0.06] hover:text-[#b45309]"
                  >
                    去观看 &rarr;
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- Empty Requests -->
            <div v-else class="glass-card p-12 text-center flex flex-col items-center justify-center space-y-3">
              <span class="text-4xl">📨</span>
              <p class="text-sm font-display font-medium" style="color: var(--color-ink-3)">暂无申请记录</p>
              <p class="text-xs max-w-xs leading-relaxed" style="color: var(--color-ink-5)">
                您尚未提交过任何作品的授权申请。如需查看加密视频，请在作品详情页提交申请。
              </p>
            </div>
          </div>

        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="py-24 text-center space-y-3">
        <span class="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin inline-block text-amber-700" style="border-color: currentColor; border-top-color: transparent;" />
        <p class="text-xs font-mono text-slate-500">正在载入客户控制台...</p>
      </div>

    </div>

    <!-- Edit Profile Modal -->
    <Transition name="fade">
      <div v-if="isEditModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center px-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="closeEditModal" />
        
        <!-- Modal Card -->
        <div class="relative glass-card p-6 w-full max-w-md space-y-5 animate-in fade-in zoom-in-95 duration-200" style="background: rgba(254, 252, 248, 0.98);">
          <div class="flex justify-between items-center border-b border-black/[0.05] pb-3">
            <h3 class="font-display font-bold text-base text-slate-900">修改个人资料</h3>
            <button @click="closeEditModal" class="text-slate-400 hover:text-slate-600 text-sm">✕</button>
          </div>

          <form @submit.prevent="submitProfile" class="space-y-4 text-left">
            <!-- Nickname -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-wider block" style="color: var(--color-ink-3)">昵称 / 姓名</label>
              <input 
                v-model="editForm.nickname" 
                type="text" 
                placeholder="例如：王小明" 
                class="form-input text-xs w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <!-- Email -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-wider block text-amber-800" style="color: var(--color-bronze)">电子邮箱 (邮箱与微信必填一项)</label>
              <input 
                v-model="editForm.email" 
                type="email" 
                placeholder="example@mail.com" 
                class="form-input text-xs w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <!-- WeChat -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-wider block text-amber-800" style="color: var(--color-bronze)">微信号 (邮箱与微信必填一项)</label>
              <input 
                v-model="editForm.wechat" 
                type="text" 
                placeholder="例如: wechat_123" 
                class="form-input text-xs w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <!-- Avatar selector -->
            <div class="space-y-2">
              <label class="text-[10px] font-bold uppercase tracking-wider block" style="color: var(--color-ink-3)">选择头像 (点击选择或下方粘贴图片链接)</label>
              <div class="flex flex-wrap gap-2.5 p-3 rounded-xl bg-black/[0.02] border border-black/[0.04]">
                <button 
                  v-for="em in emojiOptions" 
                  :key="em" 
                  type="button"
                  @click="editForm.avatar = em"
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-black/5 active:scale-95 transition-all"
                  :class="{ 'bg-amber-600/10 border border-amber-600/30 text-amber-800 scale-105': editForm.avatar === em }"
                >
                  {{ em }}
                </button>
              </div>
              <input 
                v-model="editForm.avatar" 
                type="text" 
                placeholder="也可以在此直接粘贴您的自定义头像图片 URL" 
                class="form-input text-[11px] w-full px-3 py-1.5 border rounded-xl font-mono"
              />
            </div>

            <!-- Password -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-wider block" style="color: var(--color-ink-3)">新密码 (留空则不修改)</label>
              <input 
                v-model="editForm.password" 
                type="password" 
                placeholder="•••••••• (至少 6 位)" 
                class="form-input text-xs w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div v-if="modalError" class="text-[11px] text-rose-600 font-semibold bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-xl">
              ⚠️ {{ modalError }}
            </div>

            <div class="pt-2 flex gap-3">
              <button 
                type="button" 
                @click="closeEditModal" 
                class="flex-1 btn-ghost py-2 rounded-xl text-xs font-semibold justify-center border border-black/[0.06]"
              >
                取消
              </button>
              <button 
                type="submit" 
                class="flex-1 btn-bronze py-2 rounded-xl text-xs font-semibold justify-center"
                :disabled="modalSubmitting"
              >
                {{ modalSubmitting ? '保存中...' : '确认保存' }}
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
  meta: [{ name: 'description', content: '客户管理中心' }]
})

const dashboardData = ref<any>(null)
const activeTab = ref('projects')
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

const emojiOptions = ['👤', '🎬', '🎥', '🎨', '💻', '🔊', '🎙️', '📷', '🍿', '💎', '🦊', '⚡']

// Fetch dashboard data
const fetchDashboard = async () => {
  try {
    dashboardData.value = await $fetch('/api/client/dashboard?t=' + Date.now()) as any
  } catch (err: any) {
    console.error('Failed to fetch client dashboard:', err)
  }
}

const handleLogout = async () => {
  if (!confirm('确认退出登录吗？')) return
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
      alert('密码已成功复制到剪贴板！')
    }).catch(() => {
      alert('复制失败，请手动选择复制。')
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
</style>
