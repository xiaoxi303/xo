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
      <!-- Logo/Icon representation -->
      <div class="text-center space-y-2">
        <div class="w-12 h-12 rounded-full flex items-center justify-center text-xl mx-auto shadow-sm"
             style="background: var(--color-bg-2); border: 1px solid var(--color-border);">
          👥
        </div>
        <span class="text-[9px] font-mono tracking-[0.25em] uppercase text-amber-700 font-bold block">CLIENT PORTAL</span>
        <h1 class="font-display text-2xl font-bold text-slate-900">创建客户账号</h1>
        <p class="text-xs text-slate-500">注册专属账号以对接您的私人作品与授权需求。</p>
      </div>

      <!-- Success State -->
      <div v-if="success" class="text-center py-8 space-y-4">
        <span class="text-4xl block animate-bounce">🎉</span>
        <h2 class="font-bold text-base text-emerald-600">账号创建成功！</h2>
        <p class="text-xs leading-relaxed text-slate-500">
          您的用户账号 <span class="font-bold text-slate-800">{{ form.username }}</span> 已录入系统。<br>
          现在您可以联系管理员获取专属访问密码，直接解锁受 NDA 保护的商业项目。
        </p>
        <div class="pt-4">
          <NuxtLink to="/" class="btn-primary inline-flex py-2.5 px-6 text-xs justify-center font-semibold">
            返回首页
          </NuxtLink>
        </div>
      </div>

      <!-- Form State -->
      <form v-else @submit.prevent="handleRegister" class="space-y-4">
        <!-- Error alert -->
        <div v-if="error" class="p-3.5 rounded-xl text-xs bg-rose-50 border border-rose-100 text-rose-600 font-medium">
          ⚠️ {{ error }}
        </div>

        <div class="space-y-1">
          <label class="text-[10px] font-bold uppercase tracking-wider block" style="color: var(--color-ink-3)">用户名 (用于登录)</label>
          <input
            v-model="form.username"
            type="text"
            required
            minlength="3"
            class="form-input text-xs w-full py-2.5 px-3 rounded-xl"
            placeholder="请输入您的用户名"
            :disabled="loading"
          />
        </div>

        <div class="space-y-1">
          <label class="text-[10px] font-bold uppercase tracking-wider block" style="color: var(--color-ink-3)">电子邮箱 (选填)</label>
          <input
            v-model="form.email"
            type="email"
            class="form-input text-xs w-full py-2.5 px-3 rounded-xl"
            placeholder="例如: client@company.com"
            :disabled="loading"
          />
        </div>

        <div class="space-y-1">
          <label class="text-[10px] font-bold uppercase tracking-wider block" style="color: var(--color-ink-3)">账户密码</label>
          <input
            v-model="form.password"
            type="password"
            required
            minlength="6"
            class="form-input text-xs w-full py-2.5 px-3 rounded-xl font-mono"
            placeholder="请输入密码 (至少 6 位)"
            :disabled="loading"
          />
        </div>

        <div class="space-y-1">
          <label class="text-[10px] font-bold uppercase tracking-wider block" style="color: var(--color-ink-3)">确认密码</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            required
            minlength="6"
            class="form-input text-xs w-full py-2.5 px-3 rounded-xl font-mono"
            placeholder="请再次输入密码"
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
            {{ loading ? '正在创建账号...' : '立即注册客户账号' }}
          </button>
        </div>

        <div class="pt-2 text-center">
          <NuxtLink to="/" class="text-xs hover:underline text-slate-400">
            &larr; 返回首页
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

// Page Head
useHead({
  title: '注册客户账号 — xo.dev'
})

const handleRegister = async () => {
  error.value = ''
  
  if (form.value.password !== form.value.confirmPassword) {
    error.value = '两次输入的密码不一致。'
    return
  }

  loading.value = true

  try {
    const res = await $fetch<any>('/api/auth/register', {
      method: 'POST',
      body: {
        username: form.value.username,
        email: form.value.email,
        password: form.value.password
      }
    })
    
    if (res.success) {
      success.value = true
    }
  } catch (err: any) {
    error.value = err.data?.statusMessage || '注册失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}
</script>
