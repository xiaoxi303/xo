<template>
  <div class="auth-page min-h-screen relative flex flex-col justify-between py-6 sm:py-10 px-4 sm:px-8 overflow-x-hidden selection:bg-amber-500 selection:text-white" style="background: var(--color-bg);">
    <!-- Studio Ambient Luxury Glows -->
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-0 animate-pulse"
      style="width: 1100px; height: 500px; background: radial-gradient(circle, rgba(217,119,6,0.18) 0%, rgba(147,51,234,0.12) 45%, transparent 75%); filter: blur(70px);"
    />
    <div
      class="absolute bottom-10 right-10 pointer-events-none z-0"
      style="width: 500px; height: 500px; background: radial-gradient(circle, rgba(217,119,6,0.12) 0%, transparent 70%); filter: blur(80px);"
    />

    <!-- Top Navigation Header -->
    <header class="max-w-5xl w-full mx-auto flex items-center justify-between z-10 relative mb-6 sm:mb-8">
      <NuxtLink to="/" class="inline-flex items-center gap-2 group cursor-pointer" aria-label="返回 Xo Studio 首页">
        <span class="font-display font-bold text-2xl sm:text-3xl tracking-tighter text-[#121316] group-hover:text-amber-800 transition-colors">
          xo<span class="text-amber-600">.</span>
        </span>
        <span class="text-[9px] font-mono tracking-[0.2em] uppercase font-bold text-slate-600 border-l border-black/15 pl-2 py-0.5">
          STUDIO
        </span>
      </NuxtLink>

      <div class="flex items-center gap-3">
        <span class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-800 border border-amber-600/20">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{{ activeTab === 'login' ? '客户审片专区 · 登录' : '项目档案建立 · 注册' }}</span>
        </span>
        <NuxtLink to="/" class="btn-ghost text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 border border-black/10 hover:bg-black/5 transition-all">
          <IconSax name="arrow-left" :size="13" />
          <span>返回首页</span>
        </NuxtLink>
      </div>
    </header>

    <!-- Main Central Card Workbench -->
    <main class="max-w-5xl w-full mx-auto my-auto relative z-10">
      <div class="glass-card rounded-[32px] sm:rounded-[38px] overflow-hidden border-2 border-amber-600/20 shadow-[0_25px_80px_rgba(180,120,40,0.14)] bg-white/95 backdrop-blur-2xl grid lg:grid-cols-12 min-h-[640px]">
        
        <!-- Left: Cinema Screener Room Showcase Panel (5 cols) -->
        <section class="lg:col-span-5 relative p-8 sm:p-10 flex flex-col justify-between text-white overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-[#1e150d] select-none">
          <!-- Background Ambient Flare Orbs -->
          <div class="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
          <div class="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-amber-700/25 blur-3xl pointer-events-none" />

          <!-- Top: Cinema SMPTE HUD Header -->
          <div class="relative z-10 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-white/10 text-[10px] font-mono">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span class="text-rose-300 font-bold tracking-wider">REC</span>
                <span class="text-white/30">•</span>
                <span class="text-amber-300 font-bold tracking-widest">01:24:08:12</span>
              </div>
              <span class="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-300/90 text-[9px] font-bold">
                ACEScct
              </span>
            </div>

            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold tracking-wider uppercase">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{{ activeTab === 'login' ? 'CLIENT PRIVATE DESK' : 'NEW ONBOARDING' }}</span>
            </div>
          </div>

          <!-- Middle: High-Impact Typography & Highlights -->
          <div class="relative z-10 py-8 space-y-6">
            <div class="space-y-2">
              <h1 v-if="activeTab === 'login'" class="font-display text-3xl sm:text-4xl font-bold leading-[1.15] tracking-tight">
                让每一次剪辑<br>
                <span class="text-gradient italic font-normal">母带清晰交付</span>
              </h1>
              <h1 v-else class="font-display text-3xl sm:text-4xl font-bold leading-[1.15] tracking-tight">
                开启专属档案<br>
                <span class="text-gradient italic font-normal">尊享母带视界</span>
              </h1>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans font-medium pt-1">
                {{ activeTab === 'login' ? '进入私人工作区，随时调取 4K 原片母带、专属解密密码及排期状态。' : '登记您的联系信息以创建私人工作区，成品渲染完成后即可接收推送。' }}
              </p>
            </div>

            <!-- Bullet Feature Badges -->
            <div class="space-y-2.5 pt-2">
              <div class="flex items-center gap-2.5 text-xs text-slate-200 font-sans">
                <span class="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] shrink-0 font-bold">✦</span>
                <span>4K DCI 原片母带高保真在线放映</span>
              </div>
              <div class="flex items-center gap-2.5 text-xs text-slate-200 font-sans">
                <span class="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] shrink-0 font-bold">✦</span>
                <span>ACES 电影级色彩空间与调色节点</span>
              </div>
              <div class="flex items-center gap-2.5 text-xs text-slate-200 font-sans">
                <span class="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] shrink-0 font-bold">✦</span>
                <span>端到端非对称加密安全交付通道</span>
              </div>
            </div>
          </div>

          <!-- Bottom: Security Status -->
          <div class="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span class="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              E2EE 安全连接
            </span>
            <span class="text-white/40">XO STUDIO · 2026</span>
          </div>
        </section>

        <!-- Right: Modern Luxury Interactive Form Panel (7 cols) -->
        <section class="lg:col-span-7 p-7 sm:p-12 flex flex-col justify-center bg-white/95 relative">
          
          <!-- Mode Switch Segmented Capsule -->
          <div class="mb-7">
            <div class="inline-flex p-1 rounded-2xl bg-black/[0.04] border border-black/[0.06] w-full max-w-xs shadow-inner">
              <button
                type="button"
                :class="[
                  'flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer',
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900'
                ]"
                @click="switchTab('login')"
              >
                <IconSax name="key" :size="14" />
                <span>客户登录</span>
              </button>
              <button
                type="button"
                :class="[
                  'flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer',
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900'
                ]"
                @click="switchTab('register')"
              >
                <IconSax name="user-add" :size="14" />
                <span>新客户注册</span>
              </button>
            </div>
          </div>

          <!-- Section Headings -->
          <div class="mb-6 space-y-1">
            <h2 class="font-display text-2xl sm:text-3xl font-bold text-[#121316] tracking-tight">
              {{ activeTab === 'login' ? '欢迎回来，客户伙伴' : '创建您的客户专属账号' }}
            </h2>
            <p class="text-xs text-slate-500 font-sans">
              {{ activeTab === 'login' ? '请输入已授权的用户名与密码登录工作区。' : '填写基本信息以登记专属档案并接收母带交付。' }}
            </p>
          </div>

          <!-- Notification Feedback Banners -->
          <Transition name="fade">
            <div v-if="error" class="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2" role="alert">
              <span class="text-base">⚠️</span>
              <span>{{ error }}</span>
            </div>
          </Transition>
          <Transition name="fade">
            <div v-if="codeSentMsg" class="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2" role="status">
              <span class="text-base">✨</span>
              <span>{{ codeSentMsg }}</span>
            </div>
          </Transition>

          <!-- Form Area -->
          <div>
            <!-- 1. LOGIN FORM -->
            <form v-if="activeTab === 'login'" key="login" class="space-y-4" @submit.prevent="handleLogin">
              <!-- Username -->
              <div class="space-y-1.5 text-left">
                <label for="login-username" class="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <span>客户用户名</span>
                  <span class="text-rose-500">*</span>
                </label>
                <div class="relative flex items-center">
                  <span class="absolute left-3.5 text-slate-400 pointer-events-none">
                    <IconSax name="user" :size="16" />
                  </span>
                  <input
                    id="login-username"
                    v-model="loginForm.username"
                    type="text"
                    required
                    autocomplete="username"
                    placeholder="请输入你的用户名"
                    :disabled="loading"
                    class="w-full pl-10 pr-4 py-3 rounded-2xl bg-black/[0.02] border border-black/10 focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10 text-xs text-slate-900 transition-all font-sans font-medium outline-none"
                  />
                </div>
              </div>

              <!-- Password -->
              <div class="space-y-1.5 text-left">
                <label for="login-password" class="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <span>账户密码</span>
                  <span class="text-rose-500">*</span>
                </label>
                <div class="relative flex items-center">
                  <span class="absolute left-3.5 text-slate-400 pointer-events-none">
                    <IconSax name="lock" :size="16" />
                  </span>
                  <input
                    id="login-password"
                    v-model="loginForm.password"
                    :type="showLoginPassword ? 'text' : 'password'"
                    required
                    autocomplete="current-password"
                    placeholder="请输入你的密码"
                    :disabled="loading"
                    class="w-full pl-10 pr-12 py-3 rounded-2xl bg-black/[0.02] border border-black/10 focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10 text-xs text-slate-900 transition-all font-mono font-medium outline-none"
                  />
                  <button
                    type="button"
                    class="absolute right-3.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    :aria-label="showLoginPassword ? '隐藏密码' : '显示密码'"
                    @click="showLoginPassword = !showLoginPassword"
                  >
                    <IconSax :name="showLoginPassword ? 'eye-slash' : 'eye'" :size="16" />
                  </button>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="pt-2">
                <button
                  type="submit"
                  :disabled="loading"
                  class="xo-kinetic-btn w-full py-3.5 px-6 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 hover:from-amber-700 hover:via-amber-600 hover:to-amber-800 border border-white/10 shadow-xl hover:shadow-[0_12px_36px_rgba(217,119,6,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span v-else class="flex items-center gap-1.5">
                    <span>{{ loading ? '正在验证登录...' : '进入私人工作区' }}</span>
                    <IconSax name="arrow-right" :size="14" class="transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </div>

              <!-- Bottom Links -->
              <div class="pt-4 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                <p>还没有账号？ <button type="button" class="text-amber-800 font-bold hover:underline cursor-pointer" @click="switchTab('register')">创建专属账号 ↗</button></p>
                <NuxtLink to="/" class="hover:text-slate-900 transition-colors flex items-center gap-1">
                  <span>返回主页</span>
                </NuxtLink>
              </div>
            </form>

            <!-- 2. REGISTER FORM -->
            <form v-else key="register" class="space-y-3.5" @submit.prevent="handleRegister">
              <!-- Username -->
              <div class="space-y-1 text-left">
                <label for="register-username" class="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>用户名 <span class="text-rose-500">*</span></span>
                  <span v-if="usernameAvailability === false" class="text-[10px] text-rose-500">用户名已被占用</span>
                  <span v-else-if="usernameAvailability === true" class="text-[10px] text-emerald-600">用户名可用</span>
                </label>
                <div class="relative flex items-center">
                  <span class="absolute left-3.5 text-slate-400 pointer-events-none">
                    <IconSax name="user" :size="16" />
                  </span>
                  <input
                    id="register-username"
                    v-model="registerForm.username"
                    type="text"
                    required
                    autocomplete="username"
                    placeholder="至少 3 位字符"
                    :disabled="loading"
                    @blur="checkRegistrationAvailability('username')"
                    class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/[0.02] border border-black/10 focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10 text-xs text-slate-900 transition-all font-sans font-medium outline-none"
                  />
                </div>
              </div>

              <!-- Email + Code -->
              <div class="space-y-1 text-left">
                <label for="register-email" class="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>电子邮箱 <span class="text-rose-500">*</span></span>
                  <span v-if="emailAvailability === false" class="text-[10px] text-rose-500">邮箱已被注册</span>
                  <span v-else-if="emailAvailability === true" class="text-[10px] text-emerald-600">邮箱可用</span>
                </label>
                <div class="flex gap-2">
                  <div class="relative flex-1 flex items-center">
                    <span class="absolute left-3.5 text-slate-400 pointer-events-none">
                      <IconSax name="mail" :size="16" />
                    </span>
                    <input
                      id="register-email"
                      v-model="registerForm.email"
                      type="email"
                      required
                      autocomplete="email"
                      placeholder="接收验证码与通知的邮箱"
                      :disabled="loading"
                      @blur="checkRegistrationAvailability('email')"
                      class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/[0.02] border border-black/10 focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10 text-xs text-slate-900 transition-all font-sans font-medium outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    :disabled="cooldown > 0 || sendingCode"
                    class="px-4 py-2.5 text-xs font-bold rounded-2xl border border-amber-600/30 bg-amber-500/10 text-amber-900 hover:bg-amber-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer shrink-0"
                    @click="handleSendCode"
                  >
                    <span v-if="sendingCode" class="w-3 h-3 border-2 border-amber-800/30 border-t-amber-800 rounded-full animate-spin inline-block mr-1" />
                    <span>{{ cooldown > 0 ? `${cooldown}s` : '获取验证码' }}</span>
                  </button>
                </div>
              </div>

              <!-- Code -->
              <div class="space-y-1 text-left">
                <label for="register-code" class="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>邮箱验证码 <span class="text-rose-500">*</span></span>
                  <span class="text-[10px] text-slate-400 font-mono">60 秒有效</span>
                </label>
                <div class="relative flex items-center">
                  <span class="absolute left-3.5 text-slate-400 pointer-events-none">
                    <IconSax name="shield-security" :size="16" />
                  </span>
                  <input
                    id="register-code"
                    v-model="registerForm.code"
                    type="text"
                    required
                    maxlength="6"
                    inputmode="numeric"
                    autocomplete="one-time-code"
                    placeholder="输入 6 位数字验证码"
                    :disabled="loading"
                    class="w-full pl-10 pr-20 py-2.5 rounded-2xl bg-black/[0.02] border border-black/10 focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10 text-xs text-slate-900 transition-all font-mono font-medium outline-none"
                  />
                  <span class="absolute right-3.5 text-[10px] font-mono text-slate-400 font-bold pointer-events-none">
                    6 位数字
                  </span>
                </div>
              </div>

              <!-- Password & Confirm Password (Grid) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="space-y-1 text-left">
                  <label for="register-password" class="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span>账户密码</span>
                    <span class="text-rose-500">*</span>
                  </label>
                  <div class="relative flex items-center">
                    <input
                      id="register-password"
                      v-model="registerForm.password"
                      :type="showRegisterPassword ? 'text' : 'password'"
                      required
                      autocomplete="new-password"
                      placeholder="至少 6 位字符"
                      :disabled="loading"
                      class="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-black/[0.02] border border-black/10 focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10 text-xs text-slate-900 transition-all font-mono outline-none"
                    />
                    <button
                      type="button"
                      class="absolute right-3 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      @click="showRegisterPassword = !showRegisterPassword"
                    >
                      <IconSax :name="showRegisterPassword ? 'eye-slash' : 'eye'" :size="15" />
                    </button>
                  </div>
                </div>

                <div class="space-y-1 text-left">
                  <label for="register-confirm" class="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span>确认密码</span>
                    <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="register-confirm"
                    v-model="registerForm.confirmPassword"
                    :type="showRegisterPassword ? 'text' : 'password'"
                    required
                    autocomplete="new-password"
                    placeholder="再次输入相同密码"
                    :disabled="loading"
                    class="w-full px-4 py-2.5 rounded-2xl bg-black/[0.02] border border-black/10 focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10 text-xs text-slate-900 transition-all font-mono outline-none"
                  />
                </div>
              </div>

              <!-- WeChat Contact (Optional) -->
              <div class="space-y-1 text-left">
                <label for="register-wechat" class="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>微信号</span>
                  <span class="text-[10px] text-slate-400 font-normal">选填 · 便于后期交付沟通</span>
                </label>
                <div class="relative flex items-center">
                  <span class="absolute left-3.5 text-slate-400 pointer-events-none">
                    <IconSax name="global" :size="16" />
                  </span>
                  <input
                    id="register-wechat"
                    v-model="registerForm.wechat"
                    type="text"
                    autocomplete="off"
                    placeholder="例如: wechat_id"
                    :disabled="loading"
                    class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/[0.02] border border-black/10 focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10 text-xs text-slate-900 transition-all font-sans font-medium outline-none"
                  />
                </div>
              </div>

              <!-- Submit Button -->
              <div class="pt-2">
                <button
                  type="submit"
                  :disabled="loading"
                  class="xo-kinetic-btn w-full py-3.5 px-6 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 hover:from-amber-700 hover:via-amber-600 hover:to-amber-800 border border-white/10 shadow-xl hover:shadow-[0_12px_36px_rgba(217,119,6,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span v-else class="flex items-center gap-1.5">
                    <span>{{ loading ? '正在创建账号...' : '创建档案并进入工作区' }}</span>
                    <IconSax name="arrow-right" :size="14" class="transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </div>

              <!-- Bottom Links -->
              <div class="pt-3 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                <p>已有客户账号？ <button type="button" class="text-amber-800 font-bold hover:underline cursor-pointer" @click="switchTab('login')">返回登录 ↗</button></p>
                <NuxtLink to="/" class="hover:text-slate-900 transition-colors flex items-center gap-1">
                  <span>返回主页</span>
                </NuxtLink>
              </div>
            </form>
          </div>

        </section>

      </div>
    </main>

    <!-- Bottom Copyright Tag -->
    <footer class="max-w-5xl w-full mx-auto text-center z-10 pt-6">
      <p class="text-[10px] font-mono text-slate-600">
        © {{ new Date().getFullYear() }} Xo Studio · 好莱坞工业级电影后期调色与母带制作全流程
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { encryptRsaHybrid } from '~/utils/rsa-hybrid'

const props = defineProps<{ mode?: 'login' | 'register' }>()
const route = useRoute()
const router = useRouter()
const activeTab = ref<'login' | 'register'>(props.mode || (route.query.mode === 'register' ? 'register' : 'login'))

const switchTab = (tab: 'login' | 'register') => {
  activeTab.value = tab
  error.value = ''
  codeSentMsg.value = ''
  router.replace({ query: { mode: tab === 'register' ? 'register' : undefined } })
}

const loginForm = ref({ username: '', password: '' })
const registerForm = ref({ username: '', email: '', code: '', wechat: '', password: '', confirmPassword: '' })
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const loading = ref(false)
const sendingCode = ref(false)
const cooldown = ref(0)
const error = ref('')
const codeSentMsg = ref('')
const usernameAvailability = ref<boolean | null>(null)
const emailAvailability = ref<boolean | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

onUnmounted(() => { if (timer) clearInterval(timer) })

useHead({ title: '客户中心 — Xo Studio', meta: [{ name: 'description', content: '客户专属中心登录与注册' }] })

const startCooldown = (seconds = 60) => {
  cooldown.value = seconds
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (cooldown.value > 0) cooldown.value--
    else if (timer) { clearInterval(timer); timer = null }
  }, 1000)
}

const checkRegistrationAvailability = async (field: 'username' | 'email') => {
  const value = registerForm.value[field].trim()
  if (!value) {
    if (field === 'username') usernameAvailability.value = null
    else emailAvailability.value = null
    return
  }

  try {
    const query = field === 'username'
      ? { username: value }
      : { email: value }
    const result = await $fetch<{ usernameAvailable: boolean; emailAvailable: boolean }>(
      '/api/auth/check-availability',
      { query }
    )
    if (field === 'username') usernameAvailability.value = result.usernameAvailable
    else emailAvailability.value = result.emailAvailable
  } catch {
    // The submit-time server validation remains authoritative if this check is unavailable.
  }
}

const handleSendCode = async () => {
  error.value = ''
  codeSentMsg.value = ''
  const email = registerForm.value.email.trim()
  if (!email || !email.includes('@')) { error.value = '请输入格式正确的电子邮箱地址。'; return }
  sendingCode.value = true
  try {
    const payload = await encryptRsaHybrid({ email })
    const res = await $fetch<any>('/api/auth/send-verification-code', { method: 'POST', body: payload })
    if (res.success) { codeSentMsg.value = res.message || '验证码已发送至您的邮箱（60 秒内有效），请注意查收。'; startCooldown() }
  } catch (err: any) { error.value = err.data?.statusMessage || '发送验证码失败，请检查邮箱或稍后重试。' }
  finally { sendingCode.value = false }
}

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    const encryptedPayload = await encryptRsaHybrid(loginForm.value)
    const res = await $fetch<any>('/api/auth/client-login', { method: 'POST', body: encryptedPayload })
    if (res.success) { router.push('/client'); if (import.meta.client) setTimeout(() => { window.location.href = '/client' }, 100) }
  } catch (err: any) { error.value = err.data?.statusMessage || '登录失败，请检查您的用户名和密码。' }
  finally { loading.value = false }
}

const handleRegister = async () => {
  error.value = ''
  codeSentMsg.value = ''
  if (usernameAvailability.value === false) { error.value = '该用户名已被注册，请更换用户名。'; return }
  if (emailAvailability.value === false) { error.value = '该电子邮箱已被注册，请更换邮箱。'; return }
  await checkRegistrationAvailability('username')
  await checkRegistrationAvailability('email')
  if (usernameAvailability.value === false) { error.value = '该用户名已被注册，请更换用户名。'; return }
  if (emailAvailability.value === false) { error.value = '该电子邮箱已被注册，请更换邮箱。'; return }
  if (!registerForm.value.email.trim()) { error.value = '请填写电子邮箱。'; return }
  if (!registerForm.value.code.trim()) { error.value = '请填写邮箱验证码。'; return }
  if (registerForm.value.password !== registerForm.value.confirmPassword) { error.value = '两次输入的密码不一致，请检查。'; return }
  loading.value = true
  try {
    const encryptedPayload = await encryptRsaHybrid({
      username: registerForm.value.username,
      email: registerForm.value.email,
      code: registerForm.value.code,
      wechat: registerForm.value.wechat,
      password: registerForm.value.password
    })
    const res = await $fetch<any>('/api/auth/register', { method: 'POST', body: encryptedPayload })
    if (res.success) { router.push('/client'); if (import.meta.client) setTimeout(() => { window.location.href = '/client' }, 100) }
  } catch (err: any) { error.value = err.data?.statusMessage || '注册失败，请稍后重试。' }
  finally { loading.value = false }
}
</script>
