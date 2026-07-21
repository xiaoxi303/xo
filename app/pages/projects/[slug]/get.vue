<template>
  <div class="min-h-screen pt-28 pb-24 px-6 flex items-center justify-center font-sans">
    <!-- Premium Warm Atmosphere Background -->
    <div class="bg-orbs pointer-events-none">
      <div class="bg-orb bg-orb-1" />
      <div class="bg-orb bg-orb-2" />
      <div class="bg-orb bg-orb-3" />
    </div>

    <!-- MAIN PANEL CARD -->
    <div
      class="w-full max-w-md p-8 rounded-3xl shadow-[0_24px_60px_rgba(80,60,30,0.07)] border backdrop-blur-xl relative z-10 space-y-6"
      style="background: rgba(255, 252, 248, 0.88); border-color: rgba(200, 185, 160, 0.3); max-width: 420px;"
    >
      
      <!-- STATE 1: LOADING PAGE STATUS -->
      <div v-if="checkingSession" class="text-center py-12 space-y-4">
        <span class="w-8 h-8 rounded-full border-3 border-amber-700 border-t-transparent animate-spin inline-block" />
        <p class="text-xs text-slate-500 font-mono">正在验证客户安全令牌...</p>
      </div>

      <!-- STATE 2: CLIENT NOT LOGGED IN -> RENDER SEAMLESS CLIENT LOGIN FORM -->
      <div v-else-if="!isClientLoggedIn" class="space-y-6">
        <div class="text-center space-y-2">
          <div class="w-12 h-12 rounded-full flex items-center justify-center text-xl mx-auto shadow-sm"
               style="background: var(--color-bg-2); border: 1px solid var(--color-border);">
            🔐
          </div>
          <span class="text-[9px] font-mono tracking-[0.25em] uppercase text-amber-700 font-bold block">客户登录验证</span>
          <h1 class="font-display text-2xl font-bold text-slate-900">客户身份验证</h1>
          <p class="text-xs text-slate-500 leading-relaxed">
            该加密作品 <span class="font-bold text-slate-800">《{{ projectTitle }}》</span> 的在线密码提取功能仅限内部注册客户使用，请登录后获取密码。
          </p>
        </div>

        <form @submit.prevent="handleClientLogin" class="space-y-4">
          <div v-if="loginError" class="p-3.5 rounded-xl text-xs bg-rose-50 border border-rose-100 text-rose-600 font-medium">
            ⚠️ {{ loginError }}
          </div>

          <div class="space-y-1">
            <label class="text-[10px] font-bold uppercase tracking-wider block" style="color: var(--color-ink-3)">客户用户名</label>
            <input
              v-model="loginForm.username"
              type="text"
              required
              class="form-input text-xs w-full py-2.5 px-3 rounded-xl"
              placeholder="请输入您的用户名"
              :disabled="loginLoading"
            />
          </div>

          <div class="space-y-1">
            <label class="text-[10px] font-bold uppercase tracking-wider block" style="color: var(--color-ink-3)">账户密码</label>
            <input
              v-model="loginForm.password"
              type="password"
              required
              class="form-input text-xs w-full py-2.5 px-3 rounded-xl font-mono"
              placeholder="请输入密码"
              :disabled="loginLoading"
            />
          </div>

          <div class="pt-2">
            <button
              type="submit"
              class="btn-primary w-full justify-center py-3 text-xs font-semibold flex items-center gap-2"
              :disabled="loginLoading"
            >
              <span v-if="loginLoading" class="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style="border-color: currentColor; border-top-color: transparent;" />
              登录并自动提取密码
            </button>
          </div>
        </form>

        <div class="pt-4 border-t border-black/[0.04] text-center space-y-2">
          <p class="text-xs text-slate-400">
            没有客户账号？
            <NuxtLink to="/register" class="text-amber-700 font-semibold hover:underline">立即免费注册 &rarr;</NuxtLink>
          </p>
          <NuxtLink :to="'/projects/' + slug" class="text-xs hover:underline block text-slate-500 font-medium">
            &larr; 返回作品页
          </NuxtLink>
        </div>
      </div>

      <!-- STATE 3: CLIENT LOGGED IN -> RENDER RETRIEVED PASSWORD VIEW -->
      <div v-else class="space-y-6">
        <!-- Key Icon animation -->
        <div class="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto shadow-sm animate-bounce"
             style="background: var(--color-bg-2); border: 1px solid var(--color-border); animation-duration: 2s;">
          🔑
        </div>

        <div class="text-center space-y-2">
          <span class="text-[9px] font-mono tracking-[0.25em] uppercase text-emerald-700 font-bold block">授权认证成功</span>
          <h1 class="font-display text-2xl font-bold text-slate-900">专属访问密码已生成</h1>
          <p class="text-xs text-slate-500 leading-relaxed">
            尊敬的客户 <span class="font-bold text-slate-800">{{ clientUsername }}</span>，您已通过身份验证。<br>
            您正在查看加密作品 <span class="font-bold text-slate-800">《{{ projectTitle }}》</span> 的专属密码。
          </p>
        </div>

        <!-- Password Output Box -->
        <div class="p-6 rounded-2xl border bg-black/[0.02] border-black/[0.04] text-center space-y-2">
          <span class="text-[9px] font-mono tracking-widest text-slate-400 block">项目访问密码</span>
          <div v-if="loading" class="h-8 flex items-center justify-center">
            <span class="w-5 h-5 rounded-full border-2 border-amber-700 border-t-transparent animate-spin" />
          </div>
          <div v-else-if="error" class="text-xs text-rose-500 font-semibold">
            ❌ {{ error }}
          </div>
          <div v-else class="text-3xl font-mono font-bold tracking-widest text-amber-900 select-all">
            {{ password }}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3 pt-2 text-center">
          <button
            @click="copyAndGoBack"
            :disabled="loading || !!error"
            class="btn-primary w-full justify-center py-3 text-xs font-semibold flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0A2.25 2.25 0 0113.5 3.75h-3a2.25 2.25 0 01-2.166-1.5m7.332 0v.885m-7.332 0v.885m7.332 0a.75.75 0 00.75-.75v-.885m-9 0a.75.75 0 01.75-.75v.885m12 3.522v12.13a2.25 2.25 0 01-2.25 2.25H5.25a2.25 2.25 0 01-2.25-2.25V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M7.5 14.25L5.106 11.856m0 0L7.5 9.462m-2.394 2.394H12.75" />
            </svg>
            {{ copied ? '已复制！正在返回...' : '一键复制并返回解锁' }}
          </button>
          
          <NuxtLink
            :to="'/projects/' + slug"
            class="text-xs hover:underline block text-slate-500 font-medium"
          >
            直接返回作品页 &rarr;
          </NuxtLink>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const slug = route.params.slug as string

const projectTitle = ref(slug)
const password = ref('')
const loading = ref(false)
const error = ref('')
const copied = ref(false)

// Session Auth States
const checkingSession = ref(true)
const isClientLoggedIn = ref(false)
const clientUsername = ref('')

// Login Form States
const loginForm = ref({ username: '', password: '' })
const loginLoading = ref(false)
const loginError = ref('')

// Page Head
useHead({
  title: '在线提取访问密码 — Xo Studio'
})

// Check if client session is valid
const checkClientSession = async () => {
  checkingSession.value = true
  try {
    const res = await $fetch<any>('/api/auth/client-me')
    if (res.loggedIn) {
      isClientLoggedIn.value = true
      clientUsername.value = res.username
      // Automatically load password if logged in
      await loadPasswordDirectly()
    } else {
      isClientLoggedIn.value = false
    }
  } catch (err) {
    isClientLoggedIn.value = false
  } finally {
    checkingSession.value = false
  }
}

// Load password after authentication
const loadPasswordDirectly = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await $fetch<any>(`/api/projects/${slug}/get-password-direct`)
    if (res.password) {
      password.value = res.password
    } else {
      error.value = '该作品未设置访问密码。'
    }
  } catch (err: any) {
    error.value = err.data?.statusMessage || '获取密码失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

// Handle login submission
const handleClientLogin = async () => {
  loginError.value = ''
  loginLoading.value = true
  try {
    const res = await $fetch<any>('/api/auth/client-login', {
      method: 'POST',
      body: loginForm.value
    })
    if (res.success) {
      isClientLoggedIn.value = true
      clientUsername.value = res.username
      loginForm.value = { username: '', password: '' }
      // Trigger password fetch
      await loadPasswordDirectly()
    }
  } catch (err: any) {
    loginError.value = err.data?.statusMessage || err.statusMessage || '密码或账号不正确。'
  } finally {
    loginLoading.value = false
  }
}

onMounted(async () => {
  // 1. Fetch the project name
  try {
    const projects = await $fetch<any[]>('/api/projects')
    const p = projects.find(item => item.slug === slug)
    if (p) {
      projectTitle.value = p.title
    }
  } catch (e) {}

  // 2. Validate session
  await checkClientSession()
})

const copyAndGoBack = async () => {
  if (!password.value) return
  
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(password.value)
    } else {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = password.value
      textarea.style.position = 'fixed'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    
    copied.value = true
    setTimeout(() => {
      router.push(`/projects/${slug}`)
    }, 800)
  } catch (err) {
    console.error('Failed to copy password:', err)
    router.push(`/projects/${slug}`)
  }
}
</script>
