<template>
  <div class="min-h-screen pt-24 pb-20 px-4 sm:px-6 flex items-center justify-center font-sans">
    <!-- Background atmosphere orbs -->
    <div class="bg-orbs pointer-events-none">
      <div class="bg-orb bg-orb-1" />
      <div class="bg-orb bg-orb-2" />
      <div class="bg-orb bg-orb-3" />
    </div>

    <!-- Main Card -->
    <div
      class="w-full max-w-md p-8 rounded-3xl shadow-[0_24px_60px_rgba(80,60,30,0.07)] border backdrop-blur-xl relative z-10 space-y-6"
      style="background: rgba(255, 252, 248, 0.92); border-color: rgba(200, 185, 160, 0.3); max-width: 420px;"
    >
      <div class="text-center space-y-2">
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-sm"
             style="background: var(--color-bg-2); border: 1px solid var(--color-border);">
          🔐
        </div>
        <span class="text-[9px] font-mono tracking-[0.25em] uppercase text-amber-700 font-bold block">CLIENT PORTAL</span>
        <h1 class="font-display text-2xl font-bold text-[#121316]">客户登录中心</h1>
        <p class="text-xs text-[#5e6066] leading-relaxed">
          登录您的客户会员账号，一键提取与管理专属受保护作品凭证。
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- Error alert -->
        <div v-if="error" class="p-3.5 rounded-xl text-xs bg-rose-50 border border-rose-100 text-rose-600 font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{{ error }}</span>
        </div>

        <div class="space-y-1">
          <label class="text-[10px] font-bold uppercase tracking-wider block text-[#5e6066]">客户用户名</label>
          <input
            v-model="form.username"
            type="text"
            required
            class="form-input text-xs w-full py-2.5 px-3 rounded-xl border border-black/[0.08]"
            placeholder="请输入您的客户用户名"
            :disabled="loading"
          />
        </div>

        <div class="space-y-1">
          <label class="text-[10px] font-bold uppercase tracking-wider block text-[#5e6066]">账户密码</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="form-input text-xs w-full py-2.5 px-3 rounded-xl font-mono border border-black/[0.08]"
            placeholder="请输入密码"
            :disabled="loading"
          />
        </div>

        <div class="pt-2">
          <button
            type="submit"
            class="btn-primary w-full justify-center py-3 text-xs font-semibold flex items-center gap-2 shadow-sm rounded-xl"
            :disabled="loading"
          >
            <span v-if="loading" class="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style="border-color: currentColor; border-top-color: transparent;" />
            <span>{{ loading ? '正在验证登录...' : '立即登录控制中心' }}</span>
          </button>
        </div>

        <div class="pt-4 border-t border-black/[0.04] text-center space-y-2">
          <p class="text-xs text-[#82848c]">
            还没有客户账号？
            <NuxtLink to="/register" class="text-amber-800 font-bold hover:underline">立即免费注册 &rarr;</NuxtLink>
          </p>
          <NuxtLink to="/" class="text-xs hover:underline block text-[#5e6066] font-medium pt-1">
            &larr; 返回官网首页
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

const form = ref({
  username: '',
  password: ''
})

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
