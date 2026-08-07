<template>
  <div class="delivery-page min-h-screen font-sans">
    <div class="delivery-grid" aria-hidden="true" />

    <header class="delivery-header">
      <NuxtLink to="/" class="delivery-brand" aria-label="返回 Xo Studio 首页">
        <span class="delivery-brand-mark"><IconSax name="video-play" :size="18" /></span>
        <span>
          <strong>XO / DELIVERY</strong>
          <small>PRIVATE CLIENT NODE</small>
        </span>
      </NuxtLink>

      <div class="delivery-header-actions">
        <span class="delivery-secure-chip">
          <span class="delivery-status-dot" aria-hidden="true" />
          <span>安全交付通道</span>
        </span>
        <NuxtLink to="/client" class="delivery-back-link">
          客户中心
          <IconSax name="arrow-right" :size="14" />
        </NuxtLink>
      </div>
    </header>

    <main class="delivery-main">
      <section class="delivery-hero">
        <div class="delivery-hero-copy">
          <div class="delivery-eyebrow">
            <span class="delivery-eyebrow-line" />
            <span>EXCLUSIVE HANDOFF / 01</span>
          </div>

          <h1>专属交付，<em>只属于你。</em></h1>
          <p class="delivery-lead">
            这是为当前客户建立的独立交付节点。输入查看密钥后，系统只会展示已授权的项目与文件。
          </p>

          <div class="delivery-route-row">
            <span class="delivery-route-label">交付后缀</span>
            <code>/delivery/{{ suffix || '—' }}</code>
            <button
              type="button"
              class="icon-action"
              :title="copied ? '已复制交付入口' : '复制交付入口'"
              :aria-label="copied ? '已复制交付入口' : '复制交付入口'"
              @click="copyEntryLink"
            >
              <IconSax :name="copied ? 'tick' : 'copy'" :size="15" />
            </button>
          </div>

          <div class="delivery-trust-row">
            <div class="trust-item">
              <IconSax name="shield-security" :size="16" />
              <span>客户级隔离</span>
            </div>
            <div class="trust-item">
              <IconSax name="security-safe" :size="16" />
              <span>会话加密</span>
            </div>
            <div class="trust-item">
              <IconSax name="lock" :size="16" />
              <span>密钥验证</span>
            </div>
          </div>
        </div>

        <aside class="delivery-access-panel" aria-labelledby="delivery-access-title">
          <div class="panel-topline" />

          <div class="access-panel-heading">
            <div class="access-index">A<span> / 01</span></div>
            <div>
              <p class="panel-kicker">ACCESS CONTROL</p>
              <h2 id="delivery-access-title">验证查看密钥</h2>
            </div>
            <span class="panel-lock"><IconSax name="key" :size="18" /></span>
          </div>

          <div v-if="entry" class="entry-meta">
            <span>{{ entry.label || entry.title || 'PRIVATE DELIVERY NODE' }}</span>
            <span>为 {{ ownerLabel }} 设定</span>
          </div>

          <div v-if="entryLoading" class="access-loading" aria-live="polite">
            <span class="spinner" />
            <span>正在读取交付节点…</span>
          </div>

          <template v-else>
            <div v-if="entryError" class="delivery-alert delivery-alert-error" role="alert">
              <IconSax name="close" :size="18" />
              <div>
                <strong>入口暂不可用</strong>
                <p>{{ entryError }}</p>
                <NuxtLink v-if="authRequired" to="/login" class="alert-link">登录客户账号后继续</NuxtLink>
              </div>
            </div>

            <div v-if="accessState === 'blacklisted'" class="delivery-blocked" role="alert">
              <div class="blocked-icon"><IconSax name="lock" :size="24" /></div>
              <p class="panel-kicker">ACCESS REVOKED</p>
              <h3>此账号已被拉黑</h3>
              <p>{{ blockedText }}</p>
              <NuxtLink to="/" class="panel-secondary-action">返回首页</NuxtLink>
            </div>

            <div v-else-if="accessState === 'success'" class="access-granted" aria-live="polite">
              <div class="granted-icon"><IconSax name="tick" :size="22" /></div>
              <div>
                <p class="panel-kicker">ACCESS GRANTED</p>
                <h3>交付内容已解锁</h3>
                <p>{{ projects.length ? `已加载 ${projects.length} 个授权项目` : '当前节点暂未分配项目' }}</p>
              </div>
              <button type="button" class="reset-access" title="重新输入密钥" @click="resetAccess">
                <IconSax name="refresh-2" :size="15" />
              </button>
            </div>

            <template v-else>
              <div v-if="accessState === 'warning'" class="delivery-alert delivery-alert-warning" role="alert">
                <IconSax name="shield-security" :size="18" />
                <div>
                  <strong>第一次越权访问警告</strong>
                  <p>{{ warningText }}</p>
                </div>
              </div>

              <form class="access-form" @submit.prevent="unlockDelivery">
                <label for="delivery-key">专属查看密钥</label>
                <div class="key-input-wrap">
                  <IconSax name="key" :size="17" />
                  <input
                    id="delivery-key"
                    v-model="viewKey"
                    :type="showKey ? 'text' : 'password'"
                    inputmode="text"
                    autocomplete="current-password"
                    spellcheck="false"
                    placeholder="输入客户专属密钥"
                    :disabled="accessBusy"
                    required
                  />
                  <button
                    type="button"
                    class="icon-action key-toggle"
                    :title="showKey ? '隐藏密钥' : '显示密钥'"
                    :aria-label="showKey ? '隐藏密钥' : '显示密钥'"
                    @click="showKey = !showKey"
                  >
                    <IconSax :name="showKey ? 'eye-slash' : 'eye'" :size="16" />
                  </button>
                </div>
                <p class="key-note">密钥仅用于本次交付验证，不会显示在地址栏或公开页面。</p>

                <button type="submit" class="unlock-button" :disabled="accessBusy || !viewKey.trim()">
                  <span v-if="accessBusy" class="spinner spinner-light" />
                  <IconSax v-else name="arrow-right" :size="17" />
                  <span>{{ accessBusy ? '正在验证…' : '进入我的交付' }}</span>
                </button>
              </form>
            </template>
          </template>

          <div class="access-panel-footer">
            <span>节点状态</span>
            <strong :class="statusClass">{{ statusLabel }}</strong>
          </div>
        </aside>
      </section>

      <section class="delivery-workspace" aria-labelledby="authorized-title">
        <div class="workspace-heading">
          <div>
            <p class="panel-kicker">AUTHORIZED REEL</p>
            <h2 id="authorized-title">我的授权项目</h2>
          </div>
          <div v-if="accessState === 'success'" class="project-count">
            <span>{{ projects.length.toString().padStart(2, '0') }}</span>
            <small>PROJECTS</small>
          </div>
        </div>

        <div v-if="accessState === 'success' && projects.length" class="delivery-project-grid">
          <article v-for="(project, index) in projects" :key="project.slug || index" class="delivery-project-card">
            <div class="project-media">
              <video v-if="project.videoUrl" :src="String(project.videoUrl)" :poster="project.image || undefined" controls playsinline preload="metadata" />
              <img v-if="project.image" :src="project.image" :alt="project.title || '授权项目'" loading="lazy" />
              <div v-else class="project-media-empty"><IconSax name="video-play" :size="30" /></div>
              <span class="project-number">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="project-access-badge"><IconSax name="lock" :size="11" /> 已授权</span>
            </div>
            <div class="project-card-body">
              <p class="project-slug">{{ project.slug || 'DELIVERY NODE' }}</p>
              <h3>{{ project.title || project.slug || '未命名项目' }}</h3>
              <p v-if="project.description" class="project-description">{{ project.description }}</p>
              <NuxtLink v-if="project.slug" :to="projectLink(project)" class="project-open-link">
                查看项目
                <IconSax name="arrow-right" :size="15" />
              </NuxtLink>
            </div>
          </article>
        </div>

        <div v-else-if="accessState === 'success'" class="workspace-empty">
          <div class="workspace-empty-icon"><IconSax name="video-play" :size="26" /></div>
          <h3>当前节点还没有授权项目</h3>
          <p>请联系项目负责人确认交付范围。</p>
        </div>

        <div v-else class="workspace-locked">
          <div class="workspace-lock-icon"><IconSax name="lock" :size="25" /></div>
          <div>
            <h3>授权项目将在验证后显示</h3>
            <p>请先完成上方密钥验证，其他客户的项目不会出现在这里。</p>
          </div>
        </div>
      </section>

      <section class="delivery-rules" aria-labelledby="delivery-rules-title">
        <div class="rules-heading">
          <p class="panel-kicker">DELIVERY TERMS</p>
          <h2 id="delivery-rules-title">交付规则</h2>
        </div>
        <div class="rules-list">
          <div class="rule-item">
            <span class="rule-index">01</span>
            <IconSax name="shield-security" :size="19" />
            <div><strong>仅限本人查看</strong><p>每个客户只可访问自己被授权的项目。</p></div>
          </div>
          <div class="rule-item warning-rule">
            <span class="rule-index">02</span>
            <IconSax name="shield-security" :size="19" />
            <div><strong>越权先警告，继续即拉黑</strong><p>第一次越权访问会记录警告；再次违规将停止账号访问。</p></div>
          </div>
          <div class="rule-item refund-rule">
            <span class="rule-index">03</span>
            <IconSax name="document-text" :size="19" />
            <div><strong>违规后费用不退</strong><p>因违规被限制访问的订单，已支付费用不予退还。</p></div>
          </div>
        </div>
      </section>
    </main>

    <footer class="delivery-footer">
      <span>XO STUDIO / PRIVATE DELIVERY</span>
      <span>© {{ new Date().getFullYear() }} · ACCESS IS ACCOUNT-BOUND</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
interface DeliveryProject {
  slug: string
  title?: string
  description?: string
  image?: string
  [key: string]: unknown
}

interface DeliveryEntry {
  suffix?: string
  title?: string
  label?: string
  ownerName?: string
  owner?: string | { username?: string; name?: string }
  projectCount?: number
  status?: string
  viewerStatus?: string
  authorized?: boolean
  isAuthorized?: boolean
  isBlacklisted?: boolean
  blacklisted?: boolean
  warningCount?: number
  rules?: string[]
  [key: string]: unknown
}

type AccessState = 'locked' | 'loading' | 'success' | 'warning' | 'blacklisted' | 'error'

const route = useRoute()
const suffix = computed(() => String(route.params.suffix || '').trim().replace(/^\/+|\/+$/g, ''))
const entry = ref<DeliveryEntry | null>(null)
const entryLoading = ref(true)
const entryError = ref('')
const authRequired = ref(false)
const viewKey = ref('')
const showKey = ref(false)
const accessBusy = ref(false)
const accessState = ref<AccessState>('loading')
const warningText = ref('该交付后缀不属于当前账号。请停止继续尝试，并联系项目负责人。')
const blockedText = ref('因重复越权访问，该账号已被系统限制继续查看交付内容。已支付费用不予退还。')
const projects = ref<DeliveryProject[]>([])
const accessTicket = ref('')
const copied = ref(false)

const unwrap = (value: any): any => {
  if (value?.data && typeof value.data === 'object' && !Array.isArray(value.data)) return value.data
  if (value?.result && typeof value.result === 'object' && !Array.isArray(value.result)) return value.result
  return value || {}
}

const normalizeProjects = (value: any): DeliveryProject[] => {
  if (!Array.isArray(value)) return []
  return value
    .filter(Boolean)
    .map((project: any) => ({
      ...project,
      slug: String(project.slug || project.projectSlug || '').trim()
    }))
    .filter(project => project.slug)
}

const extractError = (error: any) => {
  const payload = error?.data || error?.response?._data || {}
  const statusCode = Number(error?.statusCode || payload?.statusCode || error?.status || 0)
  const message = String(payload?.statusMessage || payload?.message || error?.statusMessage || error?.message || '').trim()
  const code = String(payload?.code || payload?.status || error?.code || '').toLowerCase()
  const blacklisted = Boolean(payload?.blacklisted || payload?.isBlacklisted || /blacklist|拉黑|封禁|revoked|blocked/.test(`${code} ${message}`) || statusCode === 423)
  const warning = Boolean(payload?.warning || payload?.firstWarning || code.includes('warning') || /越权|警告|unauthorized|not.*owner/.test(`${code} ${message}`))
  return { statusCode, message, blacklisted, warning }
}

const readEntry = async () => {
  if (!suffix.value) {
    entryLoading.value = false
    entryError.value = '交付后缀为空，请检查入口地址。'
    accessState.value = 'error'
    return
  }

  entryLoading.value = true
  entryError.value = ''
  authRequired.value = false
  try {
    const response = await $fetch<any>(`/api/delivery/${encodeURIComponent(suffix.value)}`)
    const payload = unwrap(response) as DeliveryEntry
    entry.value = payload
    const availableProjects = normalizeProjects(payload.projects || payload.authorizedProjects || payload.allowedProjects)
    if (availableProjects.length) projects.value = availableProjects

    if (payload.isBlacklisted || payload.blacklisted || /blacklist|blocked|revoked|拉黑|封禁/i.test(String(payload.status || payload.viewerStatus || ''))) {
      accessState.value = 'blacklisted'
    } else if (payload.authorized || payload.isAuthorized || availableProjects.length) {
      accessState.value = 'success'
    } else {
      accessState.value = 'locked'
    }
  } catch (error: any) {
    const info = extractError(error)
    if (info.blacklisted) {
      accessState.value = 'blacklisted'
      blockedText.value = info.message || blockedText.value
    } else {
      accessState.value = 'locked'
      entryError.value = info.message || '无法读取该交付入口，请稍后重试。'
      authRequired.value = info.statusCode === 401
    }
  } finally {
    entryLoading.value = false
  }
}

const unlockDelivery = async () => {
  const key = viewKey.value.trim()
  if (!key || accessBusy.value || !suffix.value) return

  accessBusy.value = true
  entryError.value = ''
  authRequired.value = false
  warningText.value = '该交付后缀不属于当前账号。请停止继续尝试，并联系项目负责人。'
  try {
    const response = await $fetch<any>(`/api/delivery/${encodeURIComponent(suffix.value)}/access`, {
      method: 'POST',
      body: { key, viewKey: key }
    })
    const payload = unwrap(response)
    const grantedProjects = normalizeProjects(payload.projects || payload.authorizedProjects || payload.allowedProjects)
    projects.value = grantedProjects
    accessTicket.value = String(payload.accessTicket || payload.deliveryTicket || payload.ticket || payload.token || '')
    accessState.value = 'success'
    viewKey.value = ''
  } catch (error: any) {
    const info = extractError(error)
    if (info.blacklisted) {
      accessState.value = 'blacklisted'
      blockedText.value = info.message || blockedText.value
    } else if (info.warning) {
      accessState.value = 'warning'
      warningText.value = info.message || warningText.value
    } else {
      accessState.value = 'error'
      entryError.value = info.message || '密钥无效或已过期，请检查后重试。'
      authRequired.value = info.statusCode === 401
    }
  } finally {
    accessBusy.value = false
  }
}

const resetAccess = () => {
  accessState.value = 'locked'
  viewKey.value = ''
  accessTicket.value = ''
  entryError.value = ''
  authRequired.value = false
}

const shareUrl = computed(() => {
  if (import.meta.client) return `${window.location.origin}/delivery/${encodeURIComponent(suffix.value)}`
  return `/delivery/${encodeURIComponent(suffix.value)}`
})

const copyEntryLink = async () => {
  if (!suffix.value) return
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    window.setTimeout(() => { copied.value = false }, 1600)
  } catch {
    copied.value = false
  }
}

const projectLink = (project: DeliveryProject) => {
  // Access is kept in the HttpOnly delivery cookie set by the API. Never place
  // the returned ticket in a URL where it could leak through history/referrer logs.
  return `/projects/${encodeURIComponent(project.slug)}`
}

const ownerLabel = computed(() => {
  const owner = entry.value?.owner
  if (typeof owner === 'string') return owner
  return entry.value?.ownerName || (owner && (owner.name || owner.username)) || '专属客户'
})

const statusLabel = computed(() => {
  if (accessState.value === 'blacklisted') return 'ACCESS REVOKED'
  if (accessState.value === 'success') return 'VERIFIED'
  if (accessState.value === 'warning') return 'WARNING LOGGED'
  if (accessState.value === 'error') return 'CHECK REQUIRED'
  if (entryLoading.value) return 'CONNECTING'
  return 'LOCKED'
})

const statusClass = computed(() => {
  if (accessState.value === 'blacklisted') return 'status-red'
  if (accessState.value === 'success') return 'status-green'
  if (accessState.value === 'warning') return 'status-amber'
  return 'status-muted'
})

useHead(() => ({
  title: `专属交付 / ${suffix.value || '入口'} · Xo Studio`
}))

onMounted(readEntry)
watch(suffix, () => {
  if (import.meta.client) readEntry()
})
</script>

<style scoped>
.delivery-page {
  --delivery-ink: #111827;
  --delivery-muted: #667085;
  --delivery-line: rgba(17, 24, 39, 0.11);
  --delivery-accent: #0f766e;
  --delivery-accent-deep: #115e59;
  --delivery-warm: #c2410c;
  position: relative;
  overflow: hidden;
  color: var(--delivery-ink);
  background: #f5f7f6;
}

.delivery-grid {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.42;
  background-image: linear-gradient(rgba(15, 118, 110, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 118, 110, 0.05) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent 72%);
}

.delivery-header {
  position: relative;
  z-index: 2;
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px 28px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.delivery-brand,
.delivery-header-actions,
.delivery-secure-chip,
.delivery-back-link,
.delivery-route-row,
.delivery-trust-row,
.trust-item,
.access-panel-heading,
.access-granted,
.workspace-heading,
.rules-list,
.rule-item,
.project-open-link,
.delivery-footer {
  display: flex;
  align-items: center;
}

.delivery-brand { gap: 11px; color: var(--delivery-ink); text-decoration: none; }
.delivery-brand-mark { width: 34px; height: 34px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: #fff; background: var(--delivery-ink); box-shadow: 0 8px 18px rgba(17, 24, 39, 0.15); }
.delivery-brand strong { display: block; font-family: 'Xo Display', system-ui, sans-serif; font-size: 13px; letter-spacing: 0.12em; }
.delivery-brand small { display: block; margin-top: 3px; color: #84908f; font: 600 9px/1 'Xo Mono', monospace; letter-spacing: 0.12em; }
.delivery-header-actions { gap: 18px; }
.delivery-secure-chip { gap: 7px; color: var(--delivery-accent-deep); font: 700 10px/1 'Xo Mono', monospace; letter-spacing: 0.08em; text-transform: uppercase; }
.delivery-status-dot { width: 7px; height: 7px; border-radius: 999px; background: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.13); }
.delivery-back-link { gap: 6px; color: #667085; font-size: 11px; font-weight: 700; text-decoration: none; transition: color 0.2s ease; }
.delivery-back-link:hover { color: var(--delivery-accent-deep); }

.delivery-main { position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; padding: 76px 28px 36px; }
.delivery-hero { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(360px, 0.9fr); gap: clamp(40px, 7vw, 100px); align-items: center; min-height: 560px; }
.delivery-hero-copy { max-width: 640px; }
.delivery-eyebrow { display: flex; align-items: center; gap: 11px; color: var(--delivery-accent-deep); font: 700 10px/1.2 'Xo Mono', monospace; letter-spacing: 0.18em; }
.delivery-eyebrow-line { width: 30px; height: 1px; background: var(--delivery-accent); }
.delivery-hero h1 { margin: 24px 0 20px; color: #17202b; font: 700 clamp(3rem, 7vw, 6.3rem)/0.98 'Xo Display', 'Noto Serif CJK SC', serif; letter-spacing: -0.03em; }
.delivery-hero h1 em { display: block; color: var(--delivery-accent); font-style: normal; }
.delivery-lead { max-width: 500px; color: var(--delivery-muted); font-size: 14px; line-height: 1.85; }
.delivery-route-row { gap: 12px; margin-top: 34px; width: fit-content; max-width: 100%; padding: 10px 12px 10px 15px; border: 1px solid var(--delivery-line); background: rgba(255, 255, 255, 0.62); }
.delivery-route-label { color: #8b9696; font: 700 9px/1 'Xo Mono', monospace; letter-spacing: 0.11em; text-transform: uppercase; }
.delivery-route-row code { max-width: min(330px, 50vw); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--delivery-ink); font: 700 12px/1.2 'Xo Mono', monospace; }
.icon-action { width: 30px; height: 30px; flex: 0 0 30px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--delivery-line); border-radius: 8px; color: #60706e; background: #fff; cursor: pointer; transition: all 0.2s ease; }
.icon-action:hover { color: var(--delivery-accent-deep); border-color: rgba(15, 118, 110, 0.4); background: #f0fdfa; }
.delivery-trust-row { flex-wrap: wrap; gap: 18px; margin-top: 32px; }
.trust-item { gap: 7px; color: #7b8785; font-size: 11px; }
.trust-item svg { color: var(--delivery-accent); }

.delivery-access-panel { position: relative; padding: 32px; border: 1px solid rgba(17, 24, 39, 0.13); background: rgba(255, 255, 255, 0.84); box-shadow: 0 24px 70px rgba(17, 24, 39, 0.11); }
.panel-topline { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--delivery-accent), #34d399, #f59e0b); }
.access-panel-heading { gap: 13px; }
.access-index { align-self: flex-start; color: var(--delivery-accent); font: 700 18px/1 'Xo Mono', monospace; }
.access-index span { color: #aab5b2; font-size: 9px; }
.panel-kicker { margin: 0; color: #82918e; font: 700 9px/1.3 'Xo Mono', monospace; letter-spacing: 0.16em; text-transform: uppercase; }
.access-panel-heading h2 { margin: 7px 0 0; font: 700 23px/1.2 'Xo Display', 'Noto Serif CJK SC', serif; }
.panel-lock { width: 38px; height: 38px; margin-left: auto; display: inline-flex; align-items: center; justify-content: center; color: var(--delivery-accent); border: 1px solid rgba(15, 118, 110, 0.22); background: #ecfdf5; }
.entry-meta { display: flex; justify-content: space-between; gap: 12px; margin-top: 18px; padding: 9px 10px; color: #82918e; border-top: 1px solid var(--delivery-line); border-bottom: 1px solid var(--delivery-line); font: 700 9px/1.35 'Xo Mono', monospace; letter-spacing: 0.04em; }
.entry-meta span:last-child { color: #a0aaa8; text-align: right; }
.access-loading { display: flex; align-items: center; gap: 10px; min-height: 170px; color: var(--delivery-muted); font-size: 12px; }
.spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid rgba(15, 118, 110, 0.22); border-top-color: var(--delivery-accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
.spinner-light { border-color: rgba(255, 255, 255, 0.35); border-top-color: #fff; }
@keyframes spin { to { transform: rotate(360deg); } }
.delivery-alert { display: flex; gap: 11px; align-items: flex-start; padding: 12px 13px; margin-top: 24px; font-size: 11px; line-height: 1.6; }
.delivery-alert strong { display: block; font-size: 12px; }
.delivery-alert p { margin-top: 2px; color: inherit; opacity: 0.78; }
.alert-link { display: inline-block; margin-top: 7px; color: currentColor; font-size: 10px; font-weight: 700; text-decoration: underline; text-underline-offset: 2px; }
.delivery-alert-error { color: #be123c; border: 1px solid rgba(225, 29, 72, 0.15); background: #fff1f2; }
.delivery-alert-warning { color: #a16207; border: 1px solid rgba(217, 119, 6, 0.24); background: #fffbeb; }
.delivery-blocked { padding: 32px 0 22px; text-align: center; }
.blocked-icon, .granted-icon { width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
.blocked-icon { color: #be123c; border: 1px solid rgba(225, 29, 72, 0.2); background: #fff1f2; }
.delivery-blocked h3, .access-granted h3 { margin-top: 7px; font: 700 21px/1.25 'Xo Display', 'Noto Serif CJK SC', serif; }
.delivery-blocked > p:not(.panel-kicker) { margin: 10px auto 20px; max-width: 300px; color: var(--delivery-muted); font-size: 12px; line-height: 1.75; }
.panel-secondary-action { display: inline-flex; align-items: center; justify-content: center; padding: 10px 18px; color: #475467; border: 1px solid var(--delivery-line); font-size: 11px; font-weight: 700; text-decoration: none; transition: all 0.2s ease; }
.panel-secondary-action:hover { color: var(--delivery-accent-deep); border-color: rgba(15, 118, 110, 0.35); }
.access-granted { position: relative; gap: 13px; min-height: 183px; padding: 30px 0 18px; }
.granted-icon { flex: 0 0 56px; margin: 0; color: #047857; border: 1px solid rgba(5, 150, 105, 0.22); background: #ecfdf5; }
.access-granted > div:nth-child(2) p:last-child { margin-top: 8px; color: var(--delivery-muted); font-size: 11px; }
.reset-access { position: absolute; top: 24px; right: 0; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; color: #8b9696; border: 0; background: transparent; cursor: pointer; }
.reset-access:hover { color: var(--delivery-accent-deep); }
.access-form { margin-top: 28px; }
.access-form > label { display: block; margin-bottom: 9px; color: #465350; font-size: 11px; font-weight: 700; }
.key-input-wrap { display: flex; align-items: center; gap: 10px; padding: 4px 6px 4px 13px; border: 1px solid rgba(17, 24, 39, 0.16); background: #fff; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
.key-input-wrap:focus-within { border-color: rgba(15, 118, 110, 0.7); box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.1); }
.key-input-wrap > svg { color: var(--delivery-accent); }
.key-input-wrap input { min-width: 0; width: 100%; height: 38px; border: 0; outline: 0; color: var(--delivery-ink); background: transparent; font: 600 13px/1 'Xo Mono', monospace; letter-spacing: 0.05em; }
.key-input-wrap input::placeholder { color: #a0aaa8; font-family: 'Xo Sans', sans-serif; font-weight: 400; letter-spacing: 0; }
.key-toggle { border: 0; background: transparent; }
.key-note { margin: 9px 0 0; color: #97a3a0; font-size: 10px; line-height: 1.6; }
.unlock-button { display: flex; align-items: center; justify-content: center; gap: 9px; width: 100%; height: 46px; margin-top: 20px; color: #fff; border: 0; background: var(--delivery-ink); font-size: 12px; font-weight: 700; cursor: pointer; transition: transform 0.2s ease, background 0.2s ease; }
.unlock-button:hover:not(:disabled) { background: var(--delivery-accent-deep); transform: translateY(-1px); }
.unlock-button:disabled { opacity: 0.5; cursor: not-allowed; }
.access-panel-footer { display: flex; justify-content: space-between; gap: 12px; margin-top: 21px; padding-top: 15px; border-top: 1px solid var(--delivery-line); color: #9aa5a3; font: 700 9px/1 'Xo Mono', monospace; letter-spacing: 0.08em; text-transform: uppercase; }
.status-green { color: #047857; }
.status-amber { color: #b45309; }
.status-red { color: #be123c; }
.status-muted { color: #7c8986; }

.delivery-workspace { margin-top: 90px; padding-top: 28px; border-top: 1px solid rgba(17, 24, 39, 0.14); }
.workspace-heading { justify-content: space-between; gap: 18px; margin-bottom: 25px; }
.workspace-heading h2, .rules-heading h2 { margin-top: 9px; font: 700 31px/1.15 'Xo Display', 'Noto Serif CJK SC', serif; }
.project-count { display: flex; align-items: baseline; gap: 8px; color: #9ba7a4; font: 700 10px/1 'Xo Mono', monospace; letter-spacing: 0.12em; }
.project-count span { color: var(--delivery-accent-deep); font-size: 25px; letter-spacing: 0; }
.delivery-project-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.delivery-project-card { overflow: hidden; border: 1px solid rgba(17, 24, 39, 0.11); background: rgba(255, 255, 255, 0.8); box-shadow: 0 12px 32px rgba(17, 24, 39, 0.06); transition: transform 0.25s ease, box-shadow 0.25s ease; }
.delivery-project-card:hover { transform: translateY(-4px); box-shadow: 0 19px 40px rgba(17, 24, 39, 0.11); }
.project-media { position: relative; height: 176px; overflow: hidden; background: #1b2525; }
.project-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.project-media video { width: 100%; height: 100%; object-fit: cover; display: block; }
.delivery-project-card:hover .project-media img { transform: scale(1.04); }
.project-media::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, rgba(10, 18, 18, 0.55), transparent 55%); pointer-events: none; }
.project-media-empty { display: flex; align-items: center; justify-content: center; height: 100%; color: rgba(255, 255, 255, 0.7); }
.project-number { position: absolute; z-index: 1; top: 12px; left: 13px; color: rgba(255, 255, 255, 0.7); font: 700 10px/1 'Xo Mono', monospace; letter-spacing: 0.14em; }
.project-access-badge { position: absolute; z-index: 1; right: 12px; bottom: 11px; display: inline-flex; align-items: center; gap: 5px; color: #d1fae5; font: 700 9px/1 'Xo Mono', monospace; letter-spacing: 0.08em; }
.project-card-body { padding: 20px; }
.project-slug { overflow: hidden; color: var(--delivery-accent); font: 700 9px/1 'Xo Mono', monospace; letter-spacing: 0.12em; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; }
.project-card-body h3 { margin-top: 8px; color: #17202b; font: 700 20px/1.2 'Xo Display', 'Noto Serif CJK SC', serif; }
.project-description { display: -webkit-box; margin-top: 8px; overflow: hidden; color: var(--delivery-muted); font-size: 11px; line-height: 1.65; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.project-open-link { justify-content: space-between; gap: 8px; margin-top: 18px; color: var(--delivery-ink); font-size: 11px; font-weight: 700; text-decoration: none; }
.project-open-link:hover { color: var(--delivery-accent-deep); }
.workspace-locked, .workspace-empty { display: flex; align-items: center; gap: 17px; min-height: 150px; padding: 28px 30px; border: 1px dashed rgba(17, 24, 39, 0.18); background: rgba(255, 255, 255, 0.45); }
.workspace-lock-icon, .workspace-empty-icon { width: 50px; height: 50px; flex: 0 0 50px; display: flex; align-items: center; justify-content: center; color: #899491; border: 1px solid rgba(17, 24, 39, 0.13); background: rgba(255, 255, 255, 0.72); }
.workspace-locked h3, .workspace-empty h3 { color: #34413f; font: 700 18px/1.25 'Xo Display', 'Noto Serif CJK SC', serif; }
.workspace-locked p, .workspace-empty p { margin-top: 6px; color: var(--delivery-muted); font-size: 11px; line-height: 1.65; }
.workspace-empty-icon { color: var(--delivery-accent); }

.delivery-rules { display: grid; grid-template-columns: 0.7fr 1.3fr; gap: 54px; margin-top: 88px; padding: 30px 0 4px; border-top: 1px solid rgba(17, 24, 39, 0.14); }
.rules-list { align-items: stretch; gap: 10px; }
.rule-item { flex: 1; align-items: flex-start; gap: 12px; min-width: 0; padding: 16px; border: 1px solid rgba(17, 24, 39, 0.1); background: rgba(255, 255, 255, 0.54); }
.rule-index { color: #9ba7a4; font: 700 10px/1.5 'Xo Mono', monospace; }
.rule-item > svg { flex: 0 0 auto; color: var(--delivery-accent); }
.rule-item strong { display: block; color: #34413f; font-size: 11px; line-height: 1.35; }
.rule-item p { margin-top: 5px; color: #7b8785; font-size: 10px; line-height: 1.6; }
.warning-rule > svg { color: #d97706; }
.refund-rule > svg { color: #be123c; }
.delivery-footer { justify-content: space-between; gap: 20px; max-width: 1180px; margin: 80px auto 0; padding: 22px 28px 30px; color: #97a3a0; border-top: 1px solid rgba(17, 24, 39, 0.1); font: 700 9px/1.5 'Xo Mono', monospace; letter-spacing: 0.08em; }

@media (max-width: 900px) {
  .delivery-hero { grid-template-columns: 1fr; min-height: 0; }
  .delivery-hero-copy { max-width: none; }
  .delivery-hero h1 { max-width: 620px; }
  .delivery-access-panel { max-width: 620px; width: 100%; }
  .delivery-project-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .delivery-rules { grid-template-columns: 1fr; gap: 25px; }
}

@media (max-width: 620px) {
  .delivery-header { padding: 22px 18px 0; align-items: flex-start; }
  .delivery-header-actions { flex-direction: column; align-items: flex-end; gap: 10px; }
  .delivery-secure-chip { font-size: 9px; }
  .delivery-main { padding: 56px 18px 24px; }
  .delivery-hero h1 { margin-top: 20px; font-size: clamp(2.75rem, 15vw, 4.5rem); }
  .delivery-route-row { width: 100%; }
  .delivery-route-row code { max-width: none; flex: 1; }
  .delivery-trust-row { gap: 12px; }
  .delivery-access-panel { padding: 25px 20px 20px; }
  .delivery-project-grid { grid-template-columns: 1fr; }
  .project-media { height: 190px; }
  .delivery-workspace { margin-top: 64px; }
  .delivery-rules { margin-top: 64px; }
  .rules-list { flex-direction: column; }
  .delivery-footer { flex-direction: column; align-items: flex-start; margin-top: 55px; padding: 20px 18px 26px; }
}
</style>
