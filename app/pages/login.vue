<template>
  <div :class="['auth-page', `auth-page--${activeTab}`]">
    <div class="auth-lines" aria-hidden="true" />

    <header class="auth-header">
      <NuxtLink to="/" class="wordmark" aria-label="返回 Xo Studio 首页"><strong>xo</strong><i>.</i><small>STUDIO</small></NuxtLink>
      <div class="header-meta">
        <span>{{ activeTab === 'login' ? 'PRIVATE REVIEW / 01' : 'PROJECT SETUP / 02' }}</span>
        <NuxtLink to="/">返回首页 <b>↗</b></NuxtLink>
      </div>
    </header>

    <main class="auth-workbench">
      <section class="auth-intro">
        <div class="intro-topline"><span>{{ activeTab === 'login' ? 'CLIENT DESK' : 'CLIENT ONBOARDING' }}</span><span>XO—{{ activeTab === 'login' ? '01' : '02' }}</span></div>
        <div class="intro-copy">
          <p class="intro-kicker">{{ activeTab === 'login' ? '继续你的项目' : '建立你的项目档案' }}</p>
          <h1 v-if="activeTab === 'login'">让每次<br><em>交付清晰可见</em></h1>
          <h1 v-else>从一次<br><em>准确登记开始</em></h1>
          <p>{{ activeTab === 'login' ? '进入私人工作区，查看作品、交付信息与项目凭证。' : '填写必要信息，创建你的私人工作区，接收后续交付。' }}</p>
        </div>
        <div class="intro-index" aria-hidden="true">
          <span>01</span><i /><span>{{ activeTab === 'login' ? 'SESSION READY' : 'PROFILE SETUP' }}</span>
        </div>
        <div class="intro-footer"><span>XO STUDIO / CLIENT AREA</span><span class="signal"><i /> SECURE</span></div>
      </section>

      <section class="auth-sheet">
        <div class="sheet-heading">
          <div>
            <p class="sheet-eyebrow">{{ activeTab === 'login' ? 'SIGN IN' : 'SIGN UP' }} <span>/</span> Xo CLIENT</p>
            <h2>{{ activeTab === 'login' ? '欢迎回来' : '创建客户账号' }}</h2>
            <p>{{ activeTab === 'login' ? '登录后继续管理你的专属作品。' : '注册后即可接收作品与项目更新。' }}</p>
          </div>
          <div class="sheet-number">{{ activeTab === 'login' ? '01' : '02' }}<small>/02</small></div>
        </div>

        <nav class="mode-switch" aria-label="账户模式">
          <button type="button" :class="{ 'is-active': activeTab === 'login' }" @click="switchTab('login')">登录 <small>ACCESS</small></button>
          <button type="button" :class="{ 'is-active': activeTab === 'register' }" @click="switchTab('register')">注册 <small>JOIN</small></button>
        </nav>

        <Transition name="message">
          <div v-if="error" class="notice notice--error" role="alert"><IconSax name="close" :size="15" /><span>{{ error }}</span></div>
        </Transition>
        <Transition name="message">
          <div v-if="codeSentMsg" class="notice notice--success" role="status"><IconSax name="magic-star" :size="15" /><span>{{ codeSentMsg }}</span></div>
        </Transition>

        <div class="auth-form-host">
          <form v-if="activeTab === 'login'" key="login" class="auth-form" @submit.prevent="handleLogin">
            <div class="field">
              <label for="login-username">客户用户名 <b>*</b></label>
              <div class="input-line"><span class="input-index">01</span><input id="login-username" v-model="loginForm.username" type="text" required autocomplete="username" placeholder="输入你的用户名" :disabled="loading"><IconSax name="user" :size="17" /></div>
            </div>
            <div class="field">
              <label for="login-password">账户密码 <b>*</b></label>
              <div class="input-line"><span class="input-index">02</span><input id="login-password" v-model="loginForm.password" :type="showLoginPassword ? 'text' : 'password'" required autocomplete="current-password" placeholder="输入你的密码" :disabled="loading"><button class="password-toggle" type="button" :aria-label="showLoginPassword ? '隐藏密码' : '显示密码'" @click="showLoginPassword = !showLoginPassword"><IconSax :name="showLoginPassword ? 'eye-slash' : 'eye'" :size="15" /><span>{{ showLoginPassword ? '隐藏' : '显示' }}</span></button></div>
            </div>
            <button class="submit-button" type="submit" :disabled="loading"><span v-if="loading" class="spinner" /><span>{{ loading ? '正在验证登录' : '进入私人工作区' }}</span><IconSax name="arrow-right" :size="17" /></button>
            <div class="form-bottom"><p>还没有账号？ <button type="button" @click="switchTab('register')">创建账号 <b>↗</b></button></p><NuxtLink to="/"><IconSax name="arrow-left" :size="14" /> 返回首页</NuxtLink></div>
          </form>

          <form v-else key="register" class="auth-form auth-form--register" @submit.prevent="handleRegister">
            <div class="field"><label for="register-username">用户名 <b>*</b></label><div class="input-line"><span class="input-index">01</span><input id="register-username" v-model="registerForm.username" type="text" required autocomplete="username" @blur="checkRegistrationAvailability('username')" placeholder="至少 3 位字符" :disabled="loading"><IconSax name="user" :size="17" /></div></div>
            <div class="field"><label for="register-email">电子邮箱 <b>*</b></label><div class="input-pair"><div class="input-line"><span class="input-index">02</span><input id="register-email" v-model="registerForm.email" type="email" required autocomplete="email" @blur="checkRegistrationAvailability('email')" placeholder="接收验证码的邮箱" :disabled="loading"><IconSax name="mail" :size="17" /></div><button class="code-button" type="button" :disabled="cooldown > 0 || sendingCode" @click="handleSendCode"><span v-if="sendingCode" class="spinner spinner--small" />{{ cooldown > 0 ? `${cooldown}s` : '获取验证码' }}</button></div></div>
            <div class="field"><label for="register-code">邮箱验证码 <b>*</b><small>60 秒有效</small></label><div class="input-line"><span class="input-index">03</span><input id="register-code" v-model="registerForm.code" type="text" required maxlength="6" inputmode="numeric" autocomplete="one-time-code" placeholder="输入 6 位数字" :disabled="loading"><span class="input-suffix">6 DIGITS</span></div></div>
            <div class="field-grid">
              <div class="field"><label for="register-password">账户密码 <b>*</b></label><div class="input-line"><span class="input-index">04</span><input id="register-password" v-model="registerForm.password" :type="showRegisterPassword ? 'text' : 'password'" required autocomplete="new-password" placeholder="至少 6 位" :disabled="loading"><button class="password-toggle password-toggle--icon" type="button" :aria-label="showRegisterPassword ? '隐藏密码' : '显示密码'" @click="showRegisterPassword = !showRegisterPassword"><IconSax :name="showRegisterPassword ? 'eye-slash' : 'eye'" :size="15" /></button></div></div>
              <div class="field"><label for="register-confirm">确认密码 <b>*</b></label><div class="input-line"><span class="input-index">05</span><input id="register-confirm" v-model="registerForm.confirmPassword" :type="showRegisterPassword ? 'text' : 'password'" required autocomplete="new-password" placeholder="再次输入" :disabled="loading"><IconSax name="security-safe" :size="17" /></div></div>
            </div>
            <div class="field"><label for="register-wechat">微信号 <small>选填</small></label><div class="input-line"><span class="input-index">06</span><input id="register-wechat" v-model="registerForm.wechat" type="text" autocomplete="off" placeholder="方便后期沟通" :disabled="loading"><IconSax name="global" :size="17" /></div></div>
            <button class="submit-button" type="submit" :disabled="loading"><span v-if="loading" class="spinner" /><span>{{ loading ? '正在创建账号' : '创建并进入工作区' }}</span><IconSax name="arrow-right" :size="17" /></button>
            <div class="form-bottom"><p>已有客户账号？ <button type="button" @click="switchTab('login')">返回登录 <b>↗</b></button></p><NuxtLink to="/"><IconSax name="arrow-left" :size="14" /> 返回首页</NuxtLink></div>
          </form>
        </div>
      </section>
    </main>
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
    const res = await $fetch<any>('/api/auth/send-verification-code', { method: 'POST', body: { email } })
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

<style scoped>
.auth-page { --paper: #fbfaf7; --ink: #252633; --muted: rgba(37, 38, 51, .54); --accent: #5364b3; position: relative; display: flex; min-height: 100svh; flex-direction: column; align-items: center; justify-content: center; overflow-x: hidden; overflow-y: auto; padding: 28px clamp(18px, 5vw, 82px); color: var(--ink); background: #e4e5f0; }
.auth-page--register { --ink: #302a2b; --muted: rgba(48, 42, 43, .54); --accent: #b35d3e; background: #f0e2d9; }
.auth-lines { position: absolute; inset: 0; opacity: .48; pointer-events: none; background-image: linear-gradient(rgba(37, 38, 51, .055) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 38, 51, .055) 1px, transparent 1px); background-size: 64px 64px; }
.auth-lines::before, .auth-lines::after { position: absolute; content: ''; pointer-events: none; }.auth-lines::before { inset: 7% 4%; border: 1px solid rgba(37, 38, 51, .12); }.auth-lines::after { top: -25%; right: 18%; width: 1px; height: 150%; background: rgba(83, 100, 179, .24); transform: rotate(26deg); }
.auth-page--register .auth-lines::after { background: rgba(179, 93, 62, .24); transform: rotate(-24deg); }
.auth-header { position: relative; z-index: 1; display: flex; width: min(100%, 1180px); align-items: center; justify-content: space-between; margin-bottom: clamp(24px, 4vw, 48px); }.wordmark { display: inline-flex; align-items: baseline; color: var(--ink); text-decoration: none; }.wordmark strong { font-family: var(--font-display, Georgia, serif); font-size: 28px; letter-spacing: -.08em; }.wordmark i { color: var(--accent); font-size: 20px; font-style: normal; }.wordmark small { margin-left: 10px; color: var(--muted); font-family: var(--font-mono, monospace); font-size: 8px; letter-spacing: .18em; }.header-meta { display: flex; align-items: center; gap: 22px; color: var(--muted); font-family: var(--font-mono, monospace); font-size: 8px; letter-spacing: .12em; }.header-meta a { color: var(--ink); text-decoration: none; }.header-meta a b { color: var(--accent); font-size: 13px; font-weight: 400; }
.auth-workbench { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(320px, .8fr) minmax(500px, 1.2fr); width: min(100%, 1180px); min-height: 620px; border: 1px solid rgba(37, 38, 51, .15); background: var(--paper); box-shadow: 0 24px 70px rgba(60, 60, 80, .12); }
.auth-intro { display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; padding: clamp(32px, 5vw, 68px); color: #f9f7f1; background: #343748; }.auth-page--register .auth-intro { color: #332b2b; background: #edcbbb; }
.intro-topline, .intro-footer { display: flex; align-items: center; justify-content: space-between; font-family: var(--font-mono, monospace); font-size: 8px; letter-spacing: .15em; }.intro-topline { color: rgba(249, 247, 241, .54); }.auth-page--register .intro-topline { color: rgba(51, 43, 43, .5); }.intro-copy { margin: auto 0; padding: 58px 0; }.intro-kicker { margin: 0 0 20px; color: #a9b5f1; font-family: var(--font-mono, monospace); font-size: 10px; letter-spacing: .15em; }.auth-page--register .intro-kicker { color: #a14f36; }.intro-copy h1 { margin: 0; font-family: var(--font-display, Georgia, serif); font-size: clamp(42px, 5.5vw, 74px); font-weight: 450; letter-spacing: .01em; line-height: 1.06; }.intro-copy h1 em { color: #bdc7ff; font-style: normal; }.auth-page--register .intro-copy h1 em { color: #a14f36; }.intro-copy > p:last-child { max-width: 250px; margin: 25px 0 0; color: rgba(249, 247, 241, .62); font-size: 12px; line-height: 1.9; }.auth-page--register .intro-copy > p:last-child { color: rgba(51, 43, 43, .62); }.intro-index { display: flex; align-items: center; gap: 10px; color: rgba(249, 247, 241, .58); font-family: var(--font-mono, monospace); font-size: 8px; letter-spacing: .12em; }.auth-page--register .intro-index { color: rgba(51, 43, 43, .52); }.intro-index span:first-child { color: #bdc7ff; font-size: 13px; }.auth-page--register .intro-index span:first-child { color: #a14f36; }.intro-index i { width: 28px; height: 1px; background: currentColor; opacity: .55; }.intro-footer { border-top: 1px solid rgba(249, 247, 241, .16); padding-top: 16px; color: rgba(249, 247, 241, .4); }.auth-page--register .intro-footer { border-color: rgba(51, 43, 43, .16); color: rgba(51, 43, 43, .42); }.signal { color: #bdc7ff; }.auth-page--register .signal { color: #a14f36; }.signal i { display: inline-block; width: 5px; height: 5px; margin-right: 5px; border-radius: 50%; background: currentColor; }
.auth-sheet { display: flex; flex-direction: column; justify-content: center; padding: clamp(32px, 5vw, 74px); }.sheet-heading { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 30px; }.sheet-eyebrow { margin: 0 0 13px; color: var(--accent); font-family: var(--font-mono, monospace); font-size: 9px; letter-spacing: .15em; }.sheet-eyebrow span { margin: 0 5px; opacity: .5; }.sheet-heading h2 { margin: 0; color: var(--ink); font-family: var(--font-display, Georgia, serif); font-size: clamp(30px, 4vw, 50px); font-weight: 450; line-height: 1.08; }.sheet-heading > div:first-child > p:last-child { margin: 11px 0 0; color: var(--muted); font-size: 12px; }.sheet-number { color: var(--accent); font-family: var(--font-mono, monospace); font-size: 22px; letter-spacing: .08em; }.sheet-number small { color: var(--muted); font-size: 9px; }
.mode-switch { display: flex; gap: 22px; margin-bottom: 28px; border-bottom: 1px solid rgba(37, 38, 51, .14); }.mode-switch button { position: relative; border: 0; padding: 0 0 12px; color: var(--muted); background: transparent; font-size: 14px; font-weight: 650; cursor: pointer; }.mode-switch button + button { margin-left: 10px; }.mode-switch button::after { position: absolute; right: 0; bottom: -1px; left: 0; height: 2px; background: var(--accent); content: ''; opacity: 0; transform: scaleX(.4); transition: opacity .25s ease, transform .25s ease; }.mode-switch button.is-active { color: var(--ink); }.mode-switch button.is-active::after { opacity: 1; transform: scaleX(1); }.mode-switch small { margin-left: 6px; color: var(--muted); font-family: var(--font-mono, monospace); font-size: 7px; letter-spacing: .12em; }
.notice { display: flex; align-items: center; gap: 9px; margin: -8px 0 17px; border-left: 3px solid; padding: 10px 12px; font-size: 11px; line-height: 1.5; }.notice--error { border-color: #be514b; color: #9d3f3a; background: rgba(190, 81, 75, .08); }.notice--success { border-color: #4f8b70; color: #3a6d55; background: rgba(79, 139, 112, .08); }
.auth-form { display: grid; gap: 22px; }.auth-form--register { gap: 15px; }.field { display: grid; gap: 8px; }.field label { color: var(--ink); font-size: 11px; font-weight: 650; }.field label b { color: var(--accent); }.field label small { margin-left: 6px; color: var(--muted); font-size: 9px; font-weight: 400; }.input-line { display: flex; min-height: 46px; align-items: center; gap: 10px; border-bottom: 1px solid rgba(37, 38, 51, .22); color: rgba(37, 38, 51, .42); transition: border-color .2s ease, color .2s ease; }.input-line:focus-within { border-color: var(--accent); color: var(--accent); }.input-index { width: 18px; color: var(--muted); font-family: var(--font-mono, monospace); font-size: 8px; }.input-line input { min-width: 0; flex: 1; border: 0; outline: 0; padding: 9px 0; color: var(--ink); background: transparent; font: inherit; font-size: 12px; }.input-line input::placeholder { color: rgba(37, 38, 51, .32); }.input-line input:disabled { opacity: .5; }.input-suffix { color: var(--muted); font-family: var(--font-mono, monospace); font-size: 7px; letter-spacing: .1em; white-space: nowrap; }.password-toggle { display: inline-flex; align-items: center; gap: 5px; border: 0; color: var(--accent); background: transparent; font-size: 9px; cursor: pointer; }.password-toggle--icon { padding: 5px; }.input-pair { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 12px; }.code-button { min-height: 35px; border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent); padding: 0 12px; color: var(--accent); background: transparent; font-size: 10px; font-weight: 650; white-space: nowrap; cursor: pointer; }.code-button:hover:not(:disabled) { background: color-mix(in srgb, var(--accent) 10%, transparent); }.code-button:disabled { border-color: rgba(37, 38, 51, .12); color: var(--muted); background: rgba(37, 38, 51, .04); cursor: not-allowed; }.field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }.submit-button { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; margin-top: 7px; border: 0; padding: 14px 18px; color: #fff; background: var(--ink); font-size: 11px; font-weight: 650; letter-spacing: .05em; cursor: pointer; transition: transform .25s ease, background .25s ease, box-shadow .25s ease; }.submit-button:hover:not(:disabled) { background: var(--accent); box-shadow: 0 10px 25px color-mix(in srgb, var(--accent) 28%, transparent); transform: translateY(-2px); }.submit-button:disabled { cursor: wait; opacity: .6; }.spinner { width: 14px; height: 14px; border: 2px solid rgba(255, 255, 255, .35); border-top-color: #fff; border-radius: 50%; animation: auth-spin .8s linear infinite; }.spinner--small { display: inline-block; width: 11px; height: 11px; border-color: color-mix(in srgb, var(--accent) 25%, transparent); border-top-color: var(--accent); vertical-align: -2px; }.form-bottom { display: grid; gap: 9px; border-top: 1px solid rgba(37, 38, 51, .11); padding-top: 17px; text-align: center; }.form-bottom p { margin: 0; color: var(--muted); font-size: 11px; }.form-bottom button { border: 0; padding: 0; color: var(--accent); background: transparent; font: inherit; font-weight: 650; cursor: pointer; }.form-bottom button b { font-weight: 400; }.form-bottom a { display: inline-flex; align-items: center; justify-content: center; gap: 5px; color: var(--muted); font-size: 10px; text-decoration: none; }.form-bottom a:hover { color: var(--ink); }
.message-enter-active, .message-leave-active { transition: opacity .16s ease, transform .16s ease; }
.message-enter-from, .message-leave-to { opacity: 0; transform: translateY(4px); }
.auth-form-host { position: relative; }
@keyframes auth-spin { to { transform: rotate(360deg); } }
@media (max-width: 820px) { .auth-page { align-items: flex-start; padding: 20px 15px 30px; }.auth-header { margin-bottom: 24px; }.header-meta > span { display: none; }.auth-workbench { grid-template-columns: 1fr; min-height: auto; max-width: 560px; }.auth-intro { min-height: 270px; padding: 28px; }.intro-copy { padding: 34px 0; }.intro-copy h1 { font-size: 48px; }.auth-sheet { padding: 31px 28px 30px; } }
@media (max-width: 480px) { .auth-page { padding: 0 0 26px; }.auth-header { width: 100%; padding: 0 20px; }.wordmark small, .header-meta a { display: none; }.auth-workbench { width: 100%; border-right: 0; border-left: 0; }.auth-intro { min-height: 235px; padding: 24px 22px; }.intro-copy { padding: 27px 0; }.intro-copy h1 { font-size: 42px; }.auth-sheet { padding: 28px 21px; }.sheet-number { font-size: 17px; }.field-grid, .input-pair { grid-template-columns: 1fr; gap: 14px; }.code-button { width: 100%; }.auth-form--register { gap: 16px; } }
@media (prefers-reduced-motion: reduce) { .spinner { animation: none; } }
</style>

<style scoped>
/* Refined client desk: calmer surfaces, stronger hierarchy, and a distinct register tone. */
.auth-page {
  --paper: #fcfbf8;
  --ink: #202431;
  --muted: rgba(32, 36, 49, .58);
  --accent: #5167c9;
  min-height: 100svh;
  padding: clamp(20px, 3.5vw, 52px) clamp(16px, 5vw, 88px);
  background: #e9ebf4;
}
.auth-page--register {
  --ink: #322a2b;
  --muted: rgba(50, 42, 43, .58);
  --accent: #bd6849;
  background: #f3e8e0;
}
.auth-lines { opacity: .3; background-size: 72px 72px; }
.auth-lines::before { inset: 5% 3%; border-color: rgba(32, 36, 49, .1); }
.auth-header { margin-bottom: clamp(22px, 3vw, 36px); }
.wordmark strong { font-size: 31px; letter-spacing: -.1em; }
.header-meta { gap: 18px; font-size: 9px; }
.header-meta a {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border-bottom: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
  padding-bottom: 4px;
}
.auth-workbench {
  width: min(100%, 1160px);
  min-height: 650px;
  overflow: hidden;
  border: 1px solid rgba(32, 36, 49, .13);
  border-radius: 22px;
  background: var(--paper);
  box-shadow: 0 28px 80px rgba(39, 43, 66, .16), 0 4px 16px rgba(39, 43, 66, .08);
}
.auth-intro {
  position: relative;
  isolation: isolate;
  padding: clamp(30px, 4.5vw, 62px);
  background: #303448;
}
.auth-intro::after {
  position: absolute;
  right: -18%;
  bottom: -14%;
  width: 72%;
  aspect-ratio: 1;
  border: 1px solid rgba(180, 193, 255, .23);
  border-radius: 50%;
  content: '';
  box-shadow: 0 0 0 26px rgba(180, 193, 255, .035), 0 0 0 52px rgba(180, 193, 255, .025);
  pointer-events: none;
}
.auth-page--register .auth-intro {
  background: #e9c6b5;
}
.auth-page--register .auth-intro::after {
  border-color: rgba(117, 59, 42, .2);
  box-shadow: 0 0 0 26px rgba(117, 59, 42, .035), 0 0 0 52px rgba(117, 59, 42, .025);
}
.intro-copy { position: relative; z-index: 1; }
.intro-copy h1 {
  max-width: 390px;
  font-size: clamp(44px, 5.2vw, 72px);
  letter-spacing: -.015em;
}
.intro-copy > p:last-child { max-width: 290px; font-size: 13px; }
.auth-sheet {
  justify-content: flex-start;
  padding: clamp(34px, 5vw, 72px) clamp(28px, 6vw, 78px);
}
.sheet-heading { margin-bottom: 28px; }
.sheet-heading h2 { font-size: clamp(34px, 4vw, 54px); letter-spacing: -.02em; }
.sheet-heading > div:first-child > p:last-child { font-size: 13px; }
.sheet-number { margin-top: 4px; font-size: 25px; }
.mode-switch { gap: 28px; margin-bottom: 30px; }
.mode-switch button { padding-bottom: 13px; font-size: 15px; }
.notice { border-radius: 10px; margin-top: -5px; }
.auth-form { gap: 24px; }
.auth-form--register { gap: 17px; }
.field { gap: 9px; }
.field label { font-size: 12px; }
.input-line {
  min-height: 52px;
  gap: 12px;
  border: 1px solid rgba(32, 36, 49, .14);
  border-radius: 11px;
  padding: 0 13px;
  background: rgba(255, 255, 255, .56);
}
.input-line:focus-within {
  border-color: color-mix(in srgb, var(--accent) 70%, white);
  background: #fff;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 12%, transparent);
}
.input-index { color: color-mix(in srgb, var(--accent) 70%, var(--muted)); }
.input-line input { font-size: 13px; }
.input-pair { gap: 10px; }
.code-button {
  min-height: 52px;
  border-radius: 11px;
  padding: 0 15px;
  background: color-mix(in srgb, var(--accent) 8%, transparent);
}
.field-grid { gap: 14px; }
.submit-button {
  min-height: 54px;
  margin-top: 4px;
  border-radius: 11px;
  background: #202431;
  box-shadow: 0 8px 18px rgba(32, 36, 49, .12);
}
.auth-page--register .submit-button { background: #322a2b; }
.submit-button:hover:not(:disabled) { transform: translateY(-2px); }
.form-bottom { margin-top: 3px; padding-top: 20px; }
.form-bottom p { font-size: 12px; }
.form-bottom a { font-size: 11px; }

@media (max-width: 820px) {
  .auth-workbench { border-radius: 18px; }
  .auth-intro { min-height: 300px; }
  .auth-sheet { padding: 34px 30px 32px; }
}
@media (max-width: 480px) {
  .auth-page { background: #eef0f7; }
  .auth-page--register { background: #f5ebe5; }
  .auth-header { padding: 0 18px; }
  .auth-workbench { border-radius: 0; }
  .auth-intro { min-height: 245px; }
  .auth-sheet { padding: 30px 20px 28px; }
  .sheet-heading h2 { font-size: 36px; }
  .input-line, .code-button { min-height: 50px; }
}
</style>
