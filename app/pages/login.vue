<template>
  <div class="min-h-screen pt-16 pb-16 px-4 sm:px-6 flex items-center justify-center font-sans relative overflow-hidden">
    <!-- Atmospheric Background Orbs -->
    <div class="bg-orbs pointer-events-none">
      <div class="bg-orb bg-orb-1 opacity-60" />
      <div class="bg-orb bg-orb-2 opacity-50" />
      <div class="bg-orb bg-orb-3 opacity-40" />
    </div>

    <!-- Main Split Card -->
    <div
      class="w-full max-w-4xl rounded-[36px] shadow-[0_28px_80px_rgba(180,120,40,0.12)] border backdrop-blur-2xl relative z-10 grid grid-cols-1 md:grid-cols-12 overflow-hidden transition-all duration-300"
      style="background: rgba(255, 254, 250, 0.96); border-color: rgba(210, 190, 160, 0.35);"
    >
      <!-- Left Showcase Panel (Dark Luxury Studio Banner) -->
      <div
        class="hidden md:flex md:col-span-5 p-8 lg:p-10 flex-col justify-between relative overflow-hidden text-white"
        style="background: linear-gradient(150deg, #141519 0%, #1c1916 55%, #2b2118 100%);"
      >
        <!-- Gold Accent Line -->
        <div class="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-amber-600 to-transparent"></div>
        <div class="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-amber-600/10 blur-3xl pointer-events-none"></div>

        <!-- Top Brand Header -->
        <div class="space-y-4 relative z-10">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl shadow-inner">
            🔐
          </div>
          <div>
            <span class="text-[9px] font-mono tracking-[0.3em] uppercase text-amber-500/90 font-bold block mb-1">CLIENT ACCESS GATEWAY</span>
            <h2 class="font-display text-2xl font-bold tracking-wider text-amber-50">Xo Studio</h2>
            <p class="text-xs text-amber-200/70 mt-1 leading-relaxed">高级客户控制中心 · 专属作品受保护通道</p>
          </div>
        </div>

        <!-- Middle Feature Bullets -->
        <div class="space-y-4 py-8 relative z-10">
          <div class="flex items-start gap-3">
            <span class="text-amber-500 text-sm mt-0.5">✦</span>
            <div>
              <h4 class="text-xs font-bold text-amber-100">受保护作品交付</h4>
              <p class="text-[11px] text-slate-400 mt-0.5 leading-relaxed">查看与管理专属加密影片凭证与授权通道。</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <span class="text-amber-500 text-sm mt-0.5">✦</span>
            <div>
              <h4 class="text-xs font-bold text-amber-100">SMTP 邮件认证</h4>
              <p class="text-[11px] text-slate-400 mt-0.5 leading-relaxed">内置 60 秒极速邮件验证码，护航账户安全。</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <span class="text-amber-500 text-sm mt-0.5">✦</span>
            <div>
              <h4 class="text-xs font-bold text-amber-100">一键自动登录</h4>
              <p class="text-[11px] text-slate-400 mt-0.5 leading-relaxed">注册即开通专属会话，无缝直达控制中心。</p>
            </div>
          </div>
        </div>

        <!-- Bottom Quote -->
        <div class="border-t border-amber-500/15 pt-4 relative z-10">
          <p class="text-[10px] font-mono text-amber-200/60 italic leading-normal">
            “以技术呈现艺术，以安全护航灵感。”
          </p>
          <span class="text-[9px] font-mono tracking-widest text-slate-500 uppercase block mt-1">© Xo Studio Member System</span>
        </div>
      </div>

      <!-- Right Form Panel -->
      <div class="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6 relative">
        <!-- Top Luxury Gold Accent Bar for Mobile -->
        <div class="md:hidden absolute top-0 left-8 right-8 h-[3px] bg-gradient-to-r from-transparent via-amber-600 to-transparent opacity-80 rounded-full"></div>

        <!-- Unified Segmented Navigation Tabs -->
        <div class="p-1 rounded-2xl bg-black/[0.04] border border-black/[0.04] grid grid-cols-2 text-xs font-semibold">
          <NuxtLink to="/login" class="py-2.5 rounded-xl text-center transition-all duration-200 bg-gradient-to-r from-amber-700 to-amber-800 text-white font-bold shadow-md">
            登录账号
          </NuxtLink>
          <NuxtLink to="/register" class="py-2.5 rounded-xl text-center transition-all duration-200 text-slate-500 hover:text-slate-900">
            注册新账号
          </NuxtLink>
        </div>

        <!-- Header Section -->
        <div class="space-y-1.5">
          <h1 class="font-display text-2xl font-bold text-[#121316] tracking-tight">客户登录中心</h1>
          <p class="text-xs text-[#64666e] leading-relaxed">
            登录您的客户会员账号，一键提取与管理专属作品凭证。
          </p>
        </div>

        <!-- Form Section -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Error Alert -->
          <transition name="fade">
            <div v-if="error" class="p-3.5 rounded-2xl text-xs bg-rose-50/90 border border-rose-200/80 text-rose-600 font-semibold flex items-center gap-2.5 shadow-sm">
              <span class="text-sm">⚠️</span>
              <span class="flex-1 leading-snug">{{ error }}</span>
            </div>
          </transition>

          <!-- Username Field -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-semibold text-[#3a3c42] block">
              客户用户名 <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="form.username"
              type="text"
              required
              class="form-input text-xs w-full py-3 px-4 rounded-2xl border border-black/10 bg-white/90 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all duration-200"
              placeholder="请输入您的用户名"
              :disabled="loading"
            />
          </div>

          <!-- Password Field -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-semibold text-[#3a3c42] block">
              账户密码 <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="form-input text-xs w-full py-3 px-4 pr-16 rounded-2xl font-mono border border-black/10 bg-white/90 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all duration-200"
                placeholder="请输入密码"
                :disabled="loading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-900 bg-amber-100/70 hover:bg-amber-200/80 px-2.5 py-1 rounded-lg transition-colors select-none"
              >
                {{ showPassword ? '隐藏' : '显示' }}
              </button>
            </div>
          </div>

          <!-- Action Button -->
          <div class="pt-2">
            <button
              type="submit"
              class="w-full justify-center py-3.5 px-6 text-xs font-bold flex items-center gap-2 rounded-2xl shadow-lg transition-all duration-200 text-white active:scale-[0.98] select-none cursor-pointer"
              style="background: linear-gradient(135deg, #c27a3d, #b45309); box-shadow: 0 8px 24px rgba(180, 83, 9, 0.28);"
              :disabled="loading"
            >
              <span v-if="loading" class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span class="tracking-wide">{{ loading ? '正在验证登录...' : '立即登录控制中心 →' }}</span>
            </button>
          </div>

          <!-- Footer Links -->
          <div class="pt-4 border-t border-black/[0.05] text-center space-y-2">
            <p class="text-xs text-[#71737c]">
              还没有客户账号？
              <NuxtLink to="/register" class="text-amber-800 font-bold hover:text-amber-900 hover:underline transition-colors">
                立即免费注册 &rarr;
              </NuxtLink>
            </p>
            <NuxtLink to="/" class="text-xs hover:underline block text-[#64666e] font-medium transition-colors pt-0.5">
              &larr; 返回官网首页
            </NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

const form = ref({
  username: '',
  password: ''
})

const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

useHead({
  title: '客户登录 — Xo Studio',
  meta: [{ name: 'description', content: '客户专属中心登录' }]
})

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    const res = await $fetch<any>('/api/auth/client-login', {
      method: 'POST',
      body: form.value
    })
    
    if (res.success) {
      router.push('/client')
      if (import.meta.client) {
        setTimeout(() => {
          window.location.href = '/client'
        }, 100)
      }
    }
  } catch (err: any) {
    error.value = err.data?.statusMessage || '登录失败，请检查您的用户名和密码。'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
