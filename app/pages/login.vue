<template>
  <div class="min-h-screen pt-28 pb-24 px-6 flex items-center justify-center font-sans">
    <!-- Premium Warm Atmosphere Background -->
    <div class="bg-orbs pointer-events-none">
      <div class="bg-orb bg-orb-1" />
      <div class="bg-orb bg-orb-2" />
      <div class="bg-orb bg-orb-3" />
    </div>

    <!-- Main Card -->
    <div
      class="w-full max-w-md p-8 rounded-3xl shadow-[0_24px_60px_rgba(80,60,30,0.07)] border backdrop-blur-xl relative z-10 space-y-6"
      style="background: rgba(255, 252, 248, 0.88); border-color: rgba(200, 185, 160, 0.3); max-width: 420px;"
    >
      <div class="text-center space-y-2">
        <div class="w-12 h-12 rounded-full flex items-center justify-center text-xl mx-auto shadow-sm"
             style="background: var(--color-bg-2); border: 1px solid var(--color-border);">
          🔐
        </div>
        <span class="text-[9px] font-mono tracking-[0.25em] uppercase text-amber-700 font-bold block">客户登录</span>
        <h1 class="font-display text-2xl font-bold text-slate-900">客户登录</h1>
        <p class="text-xs text-slate-500">登录客户账号以在线提取受保护作品密码。</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- Error alert -->
        <div v-if="error" class="p-3.5 rounded-xl text-xs bg-rose-50 border border-rose-100 text-rose-600 font-medium">
          ⚠️ {{ error }}
        </div>

        <div class="space-y-1">
          <label class="text-[10px] font-bold uppercase tracking-wider block" style="color: var(--color-ink-3)">客户用户名</label>
          <input
            v-model="form.username"
            type="text"
            required
            class="form-input text-xs w-full py-2.5 px-3 rounded-xl"
            placeholder="请输入您的用户名"
            :disabled="loading"
          />
        </div>

        <div class="space-y-1">
          <label class="text-[10px] font-bold uppercase tracking-wider block" style="color: var(--color-ink-3)">账户密码</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="form-input text-xs w-full py-2.5 px-3 rounded-xl font-mono"
            placeholder="请输入密码"
            :disabled="loading"
          />
        </div>

        <div class="pt-2">
          <button
            type="submit"
            class="btn-primary w-full justify-center py-3 text-xs font-semibold flex items-center gap-2"
            :disabled="loading"
          >
            <span v-if="loading" class="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style="border-color: currentColor; border-top-color: transparent;" />
            立即登录
          </button>
        </div>

        <div class="pt-4 border-t border-black/[0.04] text-center space-y-2">
          <p class="text-xs text-slate-400">
            没有客户账号？
            <NuxtLink to="/register" class="text-amber-700 font-semibold hover:underline">立即免费注册 &rarr;</NuxtLink>
          </p>
          <NuxtLink to="/" class="text-xs hover:underline block text-slate-500 font-medium">
            &larr; 返回首页
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

// Page Head
useHead({
  title: '客户登录 — Xo Studio'
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
      // Redirect to client portal
      router.push('/client')
      // Trigger a window refresh to update client portal state
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
