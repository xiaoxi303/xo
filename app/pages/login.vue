<template>
  <div class="min-h-screen pt-16 pb-16 px-4 sm:px-6 flex items-center justify-center font-sans relative overflow-hidden">
    <!-- Atmospheric Background Orbs -->
    <div class="bg-orbs pointer-events-none">
      <div class="bg-orb bg-orb-1 opacity-60" />
      <div class="bg-orb bg-orb-2 opacity-50" />
      <div class="bg-orb bg-orb-3 opacity-40" />
    </div>

    <!-- Main Luxury Split Card -->
    <div
      class="w-full max-w-4xl rounded-[36px] shadow-[0_28px_90px_rgba(180,120,40,0.14)] border backdrop-blur-2xl relative z-10 grid grid-cols-1 md:grid-cols-12 overflow-hidden transition-all duration-300"
      style="background: rgba(255, 254, 250, 0.97); border-color: rgba(210, 190, 160, 0.35);"
    >
      <!-- Left Showcase Panel (Dark Luxury Studio Banner) -->
      <div
        class="hidden md:flex md:col-span-5 p-8 lg:p-10 flex-col justify-between relative overflow-hidden text-white"
        style="background: linear-gradient(150deg, #121316 0%, #1a1815 55%, #2a1f14 100%);"
      >
        <!-- Gold Accent Line -->
        <div class="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-amber-600 to-transparent" />
        <div class="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />

        <!-- Top Brand Header -->
        <div class="space-y-4 relative z-10">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-inner">
            <IconSax name="lock" :size="24" />
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
            <IconSax name="video-play" :size="18" class="text-amber-500 mt-0.5 shrink-0" />
            <div>
              <h4 class="text-xs font-bold text-amber-100">受保护作品交付</h4>
              <p class="text-[11px] text-slate-400 mt-0.5 leading-relaxed">查看与管理专属加密影片凭证与授权通道。</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <IconSax name="mail" :size="18" class="text-amber-500 mt-0.5 shrink-0" />
            <div>
              <h4 class="text-xs font-bold text-amber-100">SMTP 邮件验证码</h4>
              <p class="text-[11px] text-slate-400 mt-0.5 leading-relaxed">内置 60 秒极速邮件验证码，护航账户真实性。</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <IconSax name="shield-security" :size="18" class="text-amber-500 mt-0.5 shrink-0" />
            <div>
              <h4 class="text-xs font-bold text-amber-100">E2EE 256-Bit 加密传输</h4>
              <p class="text-[11px] text-slate-400 mt-0.5 leading-relaxed">世界级零知识防篡改证明，凭证无泄露安全通道。</p>
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
        <div class="md:hidden absolute top-0 left-8 right-8 h-[3px] bg-gradient-to-r from-transparent via-amber-600 to-transparent opacity-80 rounded-full" />

        <!-- Segmented Tab Bar (Zero-Lag Memory Switch with Sliding Active Pill) -->
        <div class="p-1 rounded-2xl bg-black/[0.04] border border-black/[0.04] relative flex items-center text-xs font-bold">
          <!-- Active Sliding Background Pill -->
          <div 
            class="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 shadow-md transition-all duration-300 ease-out pointer-events-none"
            :style="{ left: activeTab === 'login' ? '4px' : 'calc(50% + 0px)' }"
          />

          <button 
            type="button"
            @click="switchTab('login')" 
            class="flex-1 py-2.5 rounded-xl text-center relative z-10 transition-colors duration-200 cursor-pointer select-none"
            :class="activeTab === 'login' ? 'text-white' : 'text-slate-500 hover:text-slate-900'"
          >
            登录账号
          </button>
          <button 
            type="button"
            @click="switchTab('register')" 
            class="flex-1 py-2.5 rounded-xl text-center relative z-10 transition-colors duration-200 cursor-pointer select-none"
            :class="activeTab === 'register' ? 'text-white' : 'text-slate-500 hover:text-slate-900'"
          >
            注册新账号
          </button>
        </div>

        <!-- Header Section -->
        <div class="space-y-1.5">
          <h1 class="font-display text-2xl font-bold text-[#121316] tracking-tight">
            {{ activeTab === 'login' ? '客户登录中心' : '创建客户账号' }}
          </h1>
          <p class="text-xs text-[#64666e] leading-relaxed">
            {{ activeTab === 'login' ? '登录您的客户会员账号，一键提取与管理专属作品凭证。' : '注册专属账号以对接您的私人作品与加密凭证。' }}
          </p>
        </div>

        <!-- Global Error Alert -->
        <Transition name="fade">
          <div v-if="error" class="p-3.5 rounded-2xl text-xs bg-rose-50/90 border border-rose-200/80 text-rose-600 font-semibold flex items-center gap-2.5 shadow-sm">
            <IconSax name="close" :size="16" class="text-rose-500 shrink-0" />
            <span class="flex-1 leading-snug">{{ error }}</span>
          </div>
        </Transition>

        <!-- Global Code Sent Alert for Register -->
        <Transition name="fade">
          <div v-if="codeSentMsg" class="p-3.5 rounded-2xl text-xs bg-emerald-50/90 border border-emerald-200/80 text-emerald-700 font-semibold flex items-center gap-2.5 shadow-sm">
            <IconSax name="magic-star" :size="16" class="text-emerald-600 shrink-0" />
            <span class="flex-1 leading-snug">{{ codeSentMsg }}</span>
          </div>
        </Transition>

        <!-- Tab 1: LOGIN FORM -->
        <Transition name="tab-fade" mode="out-in">
          <form v-if="activeTab === 'login'" key="login-form" @submit.prevent="handleLogin" class="space-y-4">
            <!-- Username Field -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-semibold text-[#3a3c42] block">
                客户用户名 <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="loginForm.username"
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
                  v-model="loginForm.password"
                  :type="showLoginPassword ? 'text' : 'password'"
                  required
                  class="form-input text-xs w-full py-3 px-4 pr-16 rounded-2xl font-mono border border-black/10 bg-white/90 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all duration-200"
                  placeholder="请输入密码"
                  :disabled="loading"
                />
                <button
                  type="button"
                  @click="showLoginPassword = !showLoginPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-900 bg-amber-100/70 hover:bg-amber-200/80 px-2.5 py-1 rounded-lg transition-colors select-none cursor-pointer flex items-center gap-1"
                >
                  <IconSax :name="showLoginPassword ? 'eye-slash' : 'eye'" :size="12" />
                  <span>{{ showLoginPassword ? '隐藏' : '显示' }}</span>
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
                <span class="tracking-wide flex items-center gap-1.5">
                  <span>{{ loading ? '正在验证登录...' : '立即登录控制中心' }}</span>
                  <IconSax name="arrow-right" :size="14" />
                </span>
              </button>
            </div>

            <!-- Footer Links -->
            <div class="pt-4 border-t border-black/[0.05] text-center space-y-2">
              <p class="text-xs text-[#71737c]">
                还没有客户账号？
                <button type="button" @click="switchTab('register')" class="text-amber-800 font-bold hover:text-amber-900 hover:underline transition-colors cursor-pointer">
                  立即免费注册 &rarr;
                </button>
              </p>
              <NuxtLink to="/" class="text-xs hover:underline block text-[#64666e] font-medium transition-colors pt-0.5">
                &larr; 返回官网首页
              </NuxtLink>
            </div>
          </form>

          <!-- Tab 2: REGISTER FORM -->
          <form v-else key="register-form" @submit.prevent="handleRegister" class="space-y-3.5">
            <!-- Username -->
            <div class="space-y-1">
              <label class="text-[11px] font-semibold text-[#3a3c42] block">
                用户名 (用于登录) <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="registerForm.username"
                type="text"
                required
                class="form-input text-xs w-full py-2.5 px-4 rounded-2xl border border-black/10 bg-white/90 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all duration-200"
                placeholder="请输入用户名 (至少 3 位)"
                :disabled="loading"
              />
            </div>

            <!-- Email & Send Code Button -->
            <div class="space-y-1">
              <label class="text-[11px] font-semibold text-[#3a3c42] block">
                电子邮箱 (接收 60s 验证码) <span class="text-rose-500">*</span>
              </label>
              <div class="flex gap-2">
                <input
                  v-model="registerForm.email"
                  type="email"
                  required
                  class="form-input text-xs flex-1 py-2.5 px-4 rounded-2xl border border-black/10 bg-white/90 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all duration-200"
                  placeholder="例如: client@qq.com"
                  :disabled="loading"
                />
                <button
                  type="button"
                  @click="handleSendCode"
                  class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 flex-shrink-0 cursor-pointer select-none"
                  :class="[
                    cooldown > 0 || sendingCode
                      ? 'bg-black/5 text-slate-400 cursor-not-allowed border border-black/5'
                      : 'bg-amber-500/10 text-amber-900 border border-amber-500/25 hover:bg-amber-500/20'
                  ]"
                  :disabled="cooldown > 0 || sendingCode"
                >
                  <span v-if="sendingCode" class="w-3.5 h-3.5 rounded-full border-2 border-amber-700/30 border-t-amber-700 animate-spin inline-block mr-1" />
                  {{ cooldown > 0 ? `${cooldown}s 后重发` : '获取验证码' }}
                </button>
              </div>
            </div>

            <!-- Verification Code -->
            <div class="space-y-1">
              <label class="text-[11px] font-semibold text-[#3a3c42] block">
                邮箱验证码 (60 秒有效) <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="registerForm.code"
                type="text"
                required
                maxlength="6"
                class="form-input text-xs w-full py-2.5 px-4 rounded-2xl font-mono tracking-widest border border-black/10 bg-white/90 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all duration-200 text-center"
                placeholder="6 位 数 字 验 证 码"
                :disabled="loading"
              />
            </div>

            <!-- Password & Confirm Password Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-[11px] font-semibold text-[#3a3c42] block">
                  账户密码 <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <input
                    v-model="registerForm.password"
                    :type="showRegisterPassword ? 'text' : 'password'"
                    required
                    class="form-input text-xs w-full py-2.5 px-4 pr-14 rounded-2xl font-mono border border-black/10 bg-white/90 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all duration-200"
                    placeholder="至少 6 位"
                    :disabled="loading"
                  />
                  <button
                    type="button"
                    @click="showRegisterPassword = !showRegisterPassword"
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-amber-900 bg-amber-100/70 hover:bg-amber-200/80 px-2 py-0.5 rounded transition-colors select-none cursor-pointer"
                  >
                    {{ showRegisterPassword ? '隐藏' : '显示' }}
                  </button>
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-[11px] font-semibold text-[#3a3c42] block">
                  确认密码 <span class="text-rose-500">*</span>
                </label>
                <input
                  v-model="registerForm.confirmPassword"
                  :type="showRegisterPassword ? 'text' : 'password'"
                  required
                  class="form-input text-xs w-full py-2.5 px-4 rounded-2xl font-mono border border-black/10 bg-white/90 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all duration-200"
                  placeholder="再次输入密码"
                  :disabled="loading"
                />
              </div>
            </div>

            <!-- WeChat (Optional) -->
            <div class="space-y-1">
              <label class="text-[11px] font-semibold text-[#3a3c42] block">
                微信号 (选填，方便后期沟通)
              </label>
              <input
                v-model="registerForm.wechat"
                type="text"
                class="form-input text-xs w-full py-2.5 px-4 rounded-2xl border border-black/10 bg-white/90 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all duration-200"
                placeholder="例如: wechat_123"
                :disabled="loading"
              />
            </div>

            <!-- Submit Button -->
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
            <div class="pt-3 border-t border-black/[0.05] text-center space-y-1.5">
              <p class="text-xs text-[#71737c]">
                已有客户账号？
                <button type="button" @click="switchTab('login')" class="text-amber-800 font-bold hover:text-amber-900 hover:underline transition-colors cursor-pointer">
                  立即登录 &rarr;
                </button>
              </p>
              <NuxtLink to="/" class="text-xs hover:underline block text-[#64666e] font-medium transition-colors">
                &larr; 返回官网首页
              </NuxtLink>
            </div>
          </form>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { encryptE2EE } from '~/utils/e2ee'

const props = defineProps<{ mode?: 'login' | 'register' }>()
const route = useRoute()
const router = useRouter()

// Initialize active tab from props or query param ?mode=register or default to 'login'
const initialMode = props.mode || (route.query.mode === 'register' ? 'register' : 'login')
const activeTab = ref(initialMode)

const switchTab = (tab: 'login' | 'register') => {
  activeTab.value = tab
  error.value = ''
  codeSentMsg.value = ''
  // Sync URL query cleanly without page reload
  router.replace({ query: { mode: tab === 'register' ? 'register' : undefined } })
}

// Forms
const loginForm = ref({
  username: '',
  password: ''
})

const registerForm = ref({
  username: '',
  email: '',
  code: '',
  wechat: '',
  password: '',
  confirmPassword: ''
})

const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const loading = ref(false)
const sendingCode = ref(false)
const cooldown = ref(0)
const error = ref('')
const codeSentMsg = ref('')

let timer: any = null

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

useHead({
  title: '客户中心 — Xo Studio',
  meta: [{ name: 'description', content: '客户专属中心登录与注册' }]
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

  const email = registerForm.value.email.trim()
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

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    const encryptedPayload = await encryptE2EE(JSON.stringify(loginForm.value))
    const res = await $fetch<any>('/api/auth/client-login', {
      method: 'POST',
      body: encryptedPayload
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

const handleRegister = async () => {
  error.value = ''
  codeSentMsg.value = ''
  
  if (!registerForm.value.email.trim()) {
    error.value = '请填写电子邮箱。'
    return
  }

  if (!registerForm.value.code.trim()) {
    error.value = '请填写邮箱验证码。'
    return
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    error.value = '两次输入的密码不一致，请检查。'
    return
  }

  loading.value = true

  try {
    const encryptedPayload = await encryptE2EE(JSON.stringify({
      username: registerForm.value.username,
      email: registerForm.value.email,
      code: registerForm.value.code,
      wechat: registerForm.value.wechat,
      password: registerForm.value.password
    }))
    const res = await $fetch<any>('/api/auth/register', {
      method: 'POST',
      body: encryptedPayload
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
    error.value = err.data?.statusMessage || '注册失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
  backface-visibility: hidden;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate3d(0, -6px, 0);
}

.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.15s cubic-bezier(0.16, 1, 0.3, 1), transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
  backface-visibility: hidden;
}
.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
  transform: translate3d(0, 4px, 0);
}
</style>
