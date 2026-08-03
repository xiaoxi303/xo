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
            👥
          </div>
          <div>
            <span class="text-[9px] font-mono tracking-[0.3em] uppercase text-amber-500/90 font-bold block mb-1">NEW CLIENT REGISTRATION</span>
            <h2 class="font-display text-2xl font-bold tracking-wider text-amber-50">Xo Studio</h2>
            <p class="text-xs text-amber-200/70 mt-1 leading-relaxed">高级客户控制中心 · 注册开通专属账号</p>
          </div>
        </div>

        <!-- Middle Feature Bullets -->
        <div class="space-y-4 py-8 relative z-10">
          <div class="flex items-start gap-3">
            <span class="text-amber-500 text-sm mt-0.5">✦</span>
            <div>
              <h4 class="text-xs font-bold text-amber-100">60 秒安全验证</h4>
              <p class="text-[11px] text-slate-400 mt-0.5 leading-relaxed">SMTP 真实发件服务，保障账号唯一真实性。</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <span class="text-amber-500 text-sm mt-0.5">✦</span>
            <div>
              <h4 class="text-xs font-bold text-amber-100">注册自动免密登录</h4>
              <p class="text-[11px] text-slate-400 mt-0.5 leading-relaxed">注册成功后无需重新输入密码，极速开启权限。</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <span class="text-amber-500 text-sm mt-0.5">✦</span>
            <div>
              <h4 class="text-xs font-bold text-amber-100">加密通道对接</h4>
              <p class="text-[11px] text-slate-400 mt-0.5 leading-relaxed">绑定作品密码请求，实时接收主理人授权通知。</p>
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
          <NuxtLink to="/login" class="py-2.5 rounded-xl text-center transition-all duration-200 text-slate-500 hover:text-slate-900">
            登录账号
          </NuxtLink>
          <NuxtLink to="/register" class="py-2.5 rounded-xl text-center transition-all duration-200 bg-gradient-to-r from-amber-700 to-amber-800 text-white font-bold shadow-md">
            注册新账号
          </NuxtLink>
        </div>

        <!-- Header Section -->
        <div class="space-y-1.5">
          <h1 class="font-display text-2xl font-bold text-[#121316] tracking-tight">创建客户账号</h1>
          <p class="text-xs text-[#64666e] leading-relaxed">
            注册专属账号以对接您的私人作品与加密凭证。
          </p>
        </div>

        <!-- Success State with Auto-login -->
        <transition name="fade">
          <div v-if="success" class="text-center py-6 space-y-4">
            <div class="w-16 h-16 rounded-full bg-emerald-100/90 border border-emerald-300 flex items-center justify-center text-2xl mx-auto animate-bounce shadow-md">
              🎉
            </div>
            <h2 class="font-bold text-lg text-emerald-800">账号创建成功！</h2>
            <p class="text-xs leading-relaxed text-[#5e6066] max-w-xs mx-auto">
              客户账号 <span class="font-bold text-[#121316] px-2 py-0.5 rounded bg-amber-100/60 font-mono">{{ form.username }}</span> 已成功注册。<br>
              <span class="text-amber-800 font-semibold block mt-1.5">✨ 已为您自动完成登录，正在进入控制中心...</span>
            </p>
            <div class="pt-3">
              <NuxtLink to="/client" class="w-full justify-center py-3.5 px-6 text-xs font-bold inline-flex items-center gap-2 rounded-2xl shadow-lg text-white" style="background: linear-gradient(135deg, #c27a3d, #b45309);">
                进入客户控制中心 &rarr;
              </NuxtLink>
            </div>
          </div>

          <!-- Form State -->
          <form v-else @submit.prevent="handleRegister" class="space-y-4">
            <!-- Error Alert -->
            <transition name="fade">
              <div v-if="error" class="p-3.5 rounded-2xl text-xs bg-rose-50/90 border border-rose-200/80 text-rose-600 font-semibold flex items-center gap-2.5 shadow-sm">
                <span class="text-sm">⚠️</span>
                <span class="flex-1 leading-snug">{{ error }}</span>
              </div>
            </transition>

            <!-- Code Sent Toast Alert -->
            <transition name="fade">
              <div v-if="codeSentMsg" class="p-3.5 rounded-2xl text-xs bg-emerald-50/90 border border-emerald-200/80 text-emerald-700 font-semibold flex items-center gap-2.5 shadow-sm">
                <span class="text-sm">✉️</span>
                <span class="flex-1 leading-snug">{{ codeSentMsg }}</span>
              </div>
            </transition>

            <!-- Username Field -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-semibold text-[#3a3c42] block">
                用户名 (用于登录) <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="form.username"
                type="text"
                required
                minlength="3"
                class="form-input text-xs w-full py-3 px-4 rounded-2xl border border-black/10 bg-white/90 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all duration-200"
                placeholder="请输入用户名 (至少 3 位)"
                :disabled="loading"
              />
            </div>

            <!-- Email & Verification Code Trigger -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-semibold text-amber-900/90 block">
                电子邮箱 (接收 60s 验证码) <span class="text-rose-500">*</span>
              </label>
              <div class="flex gap-2">
                <input
                  v-model="form.email"
                  type="email"
                  required
                  class="form-input text-xs flex-1 py-3 px-4 rounded-2xl border border-black/10 bg-white/90 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all duration-200"
                  placeholder="例如: client@qq.com"
                  :disabled="loading || sendingCode"
                />
                <button
                  type="button"
                  @click="handleSendCode"
                  :disabled="sendingCode || cooldown > 0 || !form.email.trim()"
                  class="px-4 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 border shadow-sm flex items-center gap-1.5 select-none"
                  :class="cooldown > 0 || !form.email.trim() ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-gradient-to-r from-amber-700 to-amber-800 text-white border-amber-800/20 hover:brightness-110 hover:shadow-md active:scale-95 cursor-pointer'"
                >
                  <span v-if="sendingCode" class="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>{{ sendingCode ? '发送中...' : cooldown > 0 ? `${cooldown}s 后重发` : '获取验证码' }}</span>
                </button>
              </div>
            </div>

            <!-- 6-digit Verification Code Input -->
            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <label class="text-[11px] font-semibold text-amber-900/90 block">
                  邮箱验证码 (60 秒有效) <span class="text-rose-500">*</span>
                </label>
                <span class="text-[10px] font-mono text-amber-700 font-semibold" v-if="cooldown > 0">⏱️ 剩余 {{ cooldown }}s</span>
              </div>
              <input
                v-model="form.code"
                type="text"
                required
                maxlength="6"
                class="form-input text-xs w-full py-3 px-4 rounded-2xl font-mono tracking-[0.35em] text-center text-sm border border-black/10 bg-white/90 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all duration-200"
                placeholder="6 位数字验证码"
                :disabled="loading"
              />
            </div>

            <!-- WeChat Handle (Optional) -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-semibold text-[#3a3c42] block">
                微信号 (选填，方便沟通)
              </label>
              <input
                v-model="form.wechat"
                type="text"
                class="form-input text-xs w-full py-3 px-4 rounded-2xl border border-black/10 bg-white/90 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all duration-200"
                placeholder="例如: wechat_123"
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
                  minlength="6"
                  class="form-input text-xs w-full py-3 px-4 pr-16 rounded-2xl font-mono border border-black/10 bg-white/90 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all duration-200"
                  placeholder="请输入密码 (至少 6 位)"
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

            <!-- Confirm Password Field -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-semibold text-[#3a3c42] block">
                确认密码 <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="form.confirmPassword"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  minlength="6"
                  class="form-input text-xs w-full py-3 px-4 pr-16 rounded-2xl font-mono border border-black/10 bg-white/90 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all duration-200"
                  placeholder="请再次输入密码"
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
                <span class="tracking-wide">{{ loading ? '正在注册并自动登录...' : '注册并自动登录 →' }}</span>
              </button>
            </div>

            <!-- Footer Links -->
            <div class="pt-4 border-t border-black/[0.05] text-center space-y-2">
              <p class="text-xs text-[#71737c]">
                已有客户账号？
                <NuxtLink to="/login" class="text-amber-800 font-bold hover:text-amber-900 hover:underline transition-colors">
                  立即登录 &rarr;
                </NuxtLink>
              </p>
              <NuxtLink to="/" class="text-xs hover:underline block text-[#64666e] font-medium transition-colors pt-0.5">
                &larr; 返回官网首页
              </NuxtLink>
            </div>
          </form>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

const form = ref({
  username: '',
  email: '',
  code: '',
  wechat: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const loading = ref(false)
const sendingCode = ref(false)
const cooldown = ref(0)
const error = ref('')
const codeSentMsg = ref('')
const success = ref(false)

let timer: any = null

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

useHead({
  title: '注册客户账号 — Xo Studio',
  meta: [{ name: 'description', content: '客户中心账号注册' }]
})

const startCooldown = (seconds = 60) => {
  cooldown.value = seconds
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (cooldown.value > 0) {
      cooldown.value--
    } else {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

const handleSendCode = async () => {
  error.value = ''
  codeSentMsg.value = ''

  const email = form.value.email.trim()
  if (!email || !email.includes('@')) {
    error.value = '请输入格式正确的电子邮箱地址。'
    return
  }

  sendingCode.value = true

  try {
    const res = await $fetch<any>('/api/auth/send-verification-code', {
      method: 'POST',
      body: { email }
    })

    if (res.success) {
      codeSentMsg.value = res.message || '验证码已发送至您的邮箱（60 秒内有效），请注意查收。'
      startCooldown(60)
    }
  } catch (err: any) {
    error.value = err.data?.statusMessage || '发送验证码失败，请检查邮箱或稍后重试。'
  } finally {
    sendingCode.value = false
  }
}

const handleRegister = async () => {
  error.value = ''
  codeSentMsg.value = ''
  
  if (!form.value.email.trim()) {
    error.value = '请填写电子邮箱。'
    return
  }

  if (!form.value.code.trim()) {
    error.value = '请填写邮箱验证码。'
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
        code: form.value.code,
        wechat: form.value.wechat,
        password: form.value.password
      }
    })

    if (res.success) {
      success.value = true
      // Auto-redirect to client center after brief delay
      setTimeout(() => {
        router.push('/client')
      }, 1200)
    }
  } catch (err: any) {
    error.value = err.data?.statusMessage || '注册失败，请稍后重试。'
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
