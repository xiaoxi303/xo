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
          👥
        </div>
        <span class="text-[9px] font-mono tracking-[0.25em] uppercase text-amber-700 font-bold block">CLIENT REGISTRATION</span>
        <h1 class="font-display text-2xl font-bold text-[#121316]">创建客户账号</h1>
        <p class="text-xs text-[#5e6066] leading-relaxed">
          注册专属账号以对接您的私人作品与加密凭证。
        </p>
      </div>

      <!-- Success State -->
      <div v-if="success" class="text-center py-6 space-y-4">
        <span class="text-4xl block animate-bounce">🎉</span>
        <h2 class="font-bold text-base text-emerald-600">账号创建成功！</h2>
        <p class="text-xs leading-relaxed text-[#5e6066]">
          您的用户账号 <span class="font-bold text-[#121316]">{{ form.username }}</span> 已成功注册。<br>
          系统现已为您开通客户控制中心。
        </p>
        <div class="pt-4">
          <NuxtLink to="/login" class="btn-primary inline-flex py-3 px-6 text-xs justify-center font-semibold rounded-xl shadow-sm">
            立即登录客户控制中心 &rarr;
          </NuxtLink>
        </div>
      </div>

      <!-- Form State -->
      <form v-else @submit.prevent="handleRegister" class="space-y-4">
        <!-- Error alert -->
        <div v-if="error" class="p-3.5 rounded-xl text-xs bg-rose-50 border border-rose-100 text-rose-600 font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{{ error }}</span>
        </div>

        <div class="space-y-1">
          <label class="text-[10px] font-bold uppercase tracking-wider block text-[#5e6066]">用户名 (用于登录)</label>
          <input
            v-model="form.username"
            type="text"
            required
            minlength="3"
            class="form-input text-xs w-full py-2.5 px-3 rounded-xl border border-black/[0.08]"
            placeholder="请输入您的用户名 (至少 3 位)"
            :disabled="loading"
          />
        </div>

        <!-- Contact details: WeChat or Email required -->
        <div class="space-y-1">
          <label class="text-[10px] font-bold uppercase tracking-wider block text-amber-800">
            电子邮箱 (邮箱与微信必填一项)
          </label>
          <input
            v-model="form.email"
            type="email"
            class="form-input text-xs w-full py-2.5 px-3 rounded-xl border border-black/[0.08]"
            placeholder="例如: client@gmail.com"
            :disabled="loading"
          />
        </div>

        <div class="space-y-1">
          <label class="text-[10px] font-bold uppercase tracking-wider block text-amber-800">
            微信号 (邮箱与微信必填一项)
          </label>
          <input
            v-model="form.wechat"
            type="text"
            class="form-input text-xs w-full py-2.5 px-3 rounded-xl border border-black/[0.08]"
            placeholder="例如: wechat_123"
            :disabled="loading"
          />
        </div>

        <div class="space-y-1">
          <label class="text-[10px] font-bold uppercase tracking-wider block text-[#5e6066]">账户密码</label>
          <input
            v-model="form.password"
            type="password"
            required
            minlength="6"
            class="form-input text-xs w-full py-2.5 px-3 rounded-xl font-mono border border-black/[0.08]"
            placeholder="请输入密码 (至少 6 位)"
            :disabled="loading"
          />
        </div>

        <div class="space-y-1">
          <label class="text-[10px] font-bold uppercase tracking-wider block text-[#5e6066]">确认密码</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            required
            minlength="6"
            class="form-input text-xs w-full py-2.5 px-3 rounded-xl font-mono border border-black/[0.08]"
            placeholder="请再次输入密码"
            :disabled="loading"
          />
        </div>

        <div class="pt-2">
          <button
            type="submit"
            class="btn-primary w-full justify-center py-3 text-xs font-semibold flex items-center gap-2 rounded-xl shadow-sm"
            :disabled="loading"
          >
            <span v-if="loading" class="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style="border-color: currentColor; border-top-color: transparent;" />
            <span>{{ loading ? '正在创建账号...' : '立即注册客户账号' }}</span>
          </button>
        </div>

        <div class="pt-4 border-t border-black/[0.04] text-center space-y-2">
          <p class="text-xs text-[#82848c]">
            已有客户账号？
            <NuxtLink to="/login" class="text-amber-800 font-bold hover:underline">立即登录 &rarr;</NuxtLink>
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
const form = ref({
  username: '',
  email: '',
  wechat: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

useHead({
  title: '注册客户账号 — Xo Studio',
  meta: [{ name: 'description', content: '客户中心账号注册' }]
})

const handleRegister = async () => {
  error.value = ''
  
  if (!form.value.email.trim() && !form.value.wechat.trim()) {
    error.value = '邮箱与微信号必须选择填写一项，以便主理人与您联系。'
    return
  }

  if (form.value.password !== form.value.confirmPassword) {
    error.value = '两次输入的密码不一致，请检查。'
    return
  }

  loading.value = true

  try {
    const res = await $fetch<any>('/api/auth/register', {
      method: 'POST',
      body: {
        username: form.value.username,
        email: form.value.email,
        wechat: form.value.wechat,
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
