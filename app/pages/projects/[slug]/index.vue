<template>
  <div class="min-h-screen pt-28 pb-24 px-6">
    <div class="max-w-4xl mx-auto space-y-12">

      <!-- Back button — always visible -->
      <div class="reveal">
        <NuxtLink
          to="/projects"
          class="btn-ghost inline-flex items-center gap-2 text-sm py-2 px-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"/>
          </svg>
          返回作品集
        </NuxtLink>
      </div>

      <!-- Password Protection Lock Screen — only when server says hasPassword=true -->
      <Transition name="fade">
        <div v-if="project && project.hasPassword && !isUnlocked" class="max-w-md mx-auto py-16 text-center space-y-6">
          <div class="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto shadow-sm"
               style="background: var(--color-bg-2); border: 1px solid var(--color-border)">
            🔐
          </div>
          <div class="space-y-2">
            <h1 class="font-display text-2xl font-bold" style="color: var(--color-ink-1)">该作品受访问密码保护</h1>
            <p class="text-xs leading-relaxed" style="color: var(--color-ink-4)">
              此项目包含未公开内容、商业合作机密或受到 NDA 限制。<br>
              请输入客户专属授权密码以解锁并查看详情。
            </p>
          </div>

          <form @submit.prevent="verifyPassword" class="space-y-4 pt-4">
            <input
              v-model="inputPassword"
              type="password"
              class="form-input text-center font-mono tracking-widest py-3 rounded-xl w-full"
              placeholder="请输入密码"
              required
              autofocus
              :disabled="passwordLoading"
            />
            <button type="submit" class="btn-primary w-full justify-center py-3 text-xs font-semibold flex items-center gap-2" :disabled="passwordLoading">
              <span v-if="passwordLoading" class="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style="border-color: currentColor; border-top-color: transparent;" />
              {{ passwordLoading ? '正在验证...' : '验证密码并解锁' }}
            </button>
          </form>

          <p v-if="passwordError" class="text-xs text-rose-500 font-semibold">
            ❌ {{ passwordError }}
          </p>

          <div class="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-semibold">
            <NuxtLink
              :to="`/projects/${slug}/get`"
              class="hover:opacity-80 transition-opacity underline text-amber-700 flex items-center gap-1"
            >
              🔗 在线直接获取密码 (去获取密码)
            </NuxtLink>
            
            <span class="text-slate-300 hidden sm:inline">|</span>
            
            <button
              type="button"
              @click="openRequestModal"
              class="hover:opacity-80 transition-opacity underline"
              style="color: var(--color-ink-3)"
            >
              📨 填写表单手动申请
            </button>
          </div>

          <div class="pt-4 border-t border-black/[0.05]">
            <NuxtLink to="/projects" class="text-xs hover:underline" style="color: var(--color-ink-4)">
              &larr; 返回作品集
            </NuxtLink>
          </div>
        </div>
      </Transition>

      <!-- Project detail — show when public (no password) or unlocked -->
      <Transition name="fade">
        <div v-if="project && (!project.hasPassword || isUnlocked)" class="space-y-10">

          <!-- Title block -->
          <div class="space-y-4 reveal">
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in project.tags" :key="tag" class="badge">{{ tag }}</span>
            </div>
            <h1 class="font-display text-4xl lg:text-5xl font-bold tracking-tight leading-tight"
                style="color: var(--color-ink-1)">
              {{ project.title }}
            </h1>
            <p class="text-sm font-mono" style="color: var(--color-ink-5)">
              发布日期：{{ project.releaseYear || '2026' }} 年 · 后期规格：{{ project.postSpecs || '4K 60FPS HDR' }}
            </p>
          </div>

          <!-- Media block: video player OR cover image fallback -->
          <div class="reveal">
            <!-- If has videoUrl: show ambilight video player -->
            <div v-if="activeVideoUrl" class="space-y-3">
              <div class="ambilight-container">
                <!-- Ambient backdrop blur video -->
                <video
                  ref="blurVideoRef"
                  :key="`blur-${activeVideoUrl}`"
                  :src="activeVideoUrl"
                  muted loop playsinline
                  class="ambilight-shadow"
                />
                <!-- Foreground main player -->
                <video
                  ref="mainVideoRef"
                  :key="`main-${activeVideoUrl}`"
                  :src="activeVideoUrl"
                  :poster="project.image"
                  controls autoplay muted playsinline
                  class="w-full rounded-2xl overflow-hidden relative z-10"
                  style="max-height: 520px; object-fit: cover; background: #000;"
                  @loadedmetadata="syncBlurVideo"
                />
              </div>

              <div
                v-if="projectVideoUrls.length > 1"
                class="flex flex-wrap gap-2 rounded-2xl p-2"
                style="background: rgba(140,115,80,0.08); border: 1px solid rgba(160,130,90,0.18);"
              >
                <button
                  v-for="(url, idx) in projectVideoUrls"
                  :key="url"
                  type="button"
                  @click="activeVideoIndex = idx"
                  :class="[
                    'px-3 py-2 rounded-xl text-[10px] font-mono font-semibold transition-all',
                    activeVideoIndex === idx ? 'shadow-sm' : 'hover:opacity-80'
                  ]"
                  :style="activeVideoIndex === idx
                    ? { background: 'rgba(252,248,242,0.95)', color: 'var(--color-ink-1)', border: '1px solid rgba(180,150,110,0.25)' }
                    : { color: 'var(--color-ink-4)', border: '1px solid transparent' }"
                >
                  VIDEO {{ String(idx + 1).padStart(2, '0') }}
                </button>
              </div>
            </div>

            <!-- If no videoUrl but has image: show cover image -->
            <div v-else-if="project.image" class="relative rounded-2xl overflow-hidden glass-card" style="max-height: 520px;">
              <img
                :src="project.image"
                :alt="project.title"
                class="w-full h-auto object-cover"
                style="max-height: 520px; display: block;"
              />
              <!-- No-video badge -->
              <div class="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-black/40 text-white backdrop-blur-sm">
                🖼️ 静帧作品
              </div>
            </div>

            <div v-else class="relative rounded-2xl overflow-hidden glass-card" style="height: min(520px, 56vw); min-height: 260px;">
              <DefaultArtPoster
                :title="project.title"
                index="01"
                :category="project.tags?.[0] || ''"
                :description="project.description"
                class="w-full h-full"
              />
            </div>
          </div>

          <!-- Interactive LUT Grade Comparison Slider (only if imageBefore is set) -->
          <div v-if="project.imageBefore && project.imageBefore.trim()" class="space-y-4 reveal">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-3">
                <span class="w-1 h-5 rounded-full" style="background: var(--color-bronze);" />
                <h2 class="font-display text-xl font-semibold" style="color: var(--color-ink-1)">🎥 影视调色前后对比</h2>
              </div>
              <span class="text-[10px] font-mono" style="color: var(--color-ink-5)">← 左右拖动对比调色前后 →</span>
            </div>

            <div
              class="relative w-full overflow-hidden rounded-2xl glass-card select-none cursor-ew-resize"
              style="aspect-ratio: 16/9;"
              @mousedown="sliderDragging = true"
              @mouseup="sliderDragging = false"
              @mouseleave="sliderDragging = false"
              @mousemove="handleSliderMove"
              @touchstart.prevent="sliderDragging = true"
              @touchend="sliderDragging = false"
              @touchmove.prevent="handleSliderMove"
              ref="sliderContainerRef"
            >
              <!-- Before Image (Log / Raw) -->
              <img
                :src="project.imageBefore"
                alt="Before grading"
                class="absolute inset-0 w-full h-full object-cover"
                draggable="false"
              />
              <div class="absolute bottom-4 left-4 z-20 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-black/60 text-white backdrop-blur-sm border border-white/10 uppercase tracking-widest">
                LOG 原片
              </div>

              <!-- After Image Container (Graded / Final) -->
              <div
                class="absolute inset-y-0 left-0 overflow-hidden"
                :style="{ width: sliderPosition + '%' }"
              >
                <img
                  :src="project.image"
                  alt="After grading"
                  class="absolute inset-0 h-full object-cover"
                  :style="{ width: containerWidth + 'px', maxWidth: 'none' }"
                  draggable="false"
                />
                <div class="absolute bottom-4 right-4 z-20 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#b45309]/80 text-white backdrop-blur-sm border border-amber-500/20 uppercase tracking-widest">
                  Graded 调色后
                </div>
              </div>

              <!-- Slider Handle -->
              <div
                class="absolute inset-y-0 z-30 flex items-center justify-center pointer-events-none"
                :style="{ left: 'calc(' + sliderPosition + '% - 1px)' }"
              >
                <div class="w-[2px] h-full bg-white shadow-[0_0_10px_rgba(0,0,0,0.6)]" />
                <div class="absolute w-9 h-9 rounded-full bg-white text-black shadow-lg flex items-center justify-center border border-black/10 text-sm font-bold">↔</div>
              </div>
            </div>
          </div>

          <!-- Content grid -->
          <div class="grid md:grid-cols-3 gap-8 items-start reveal">

            <!-- Left: About + Workflow -->
            <div class="md:col-span-2 space-y-6">

              <!-- Project overview card -->
              <div class="glass-card p-8 space-y-5">
                <div class="flex items-center gap-3">
                  <span class="w-1 h-5 rounded-full" style="background: var(--color-bronze);" />
                  <h2 class="font-display text-xl font-semibold" style="color: var(--color-ink-1)">项目概述</h2>
                </div>
                <p class="leading-relaxed text-[0.92rem]" style="color: var(--color-ink-2)">
                  {{ project.description }}
                </p>
                <p v-if="project.longDescription" class="leading-relaxed text-sm" style="color: var(--color-ink-4)">
                  {{ project.longDescription }}
                </p>
              </div>

              <!-- Workflow pipeline card -->
              <div v-if="project.workflow && project.workflow.length" class="glass-card p-8 space-y-6">
                <div class="flex items-center gap-3">
                  <span class="w-1 h-5 rounded-full" style="background: var(--color-bronze);" />
                  <h2 class="font-display text-xl font-semibold" style="color: var(--color-ink-1)">幕后制作工作流 (Pipeline)</h2>
                </div>

                <div class="space-y-0" style="border-top: 1px solid var(--color-border);">
                  <div
                    v-for="flow in project.workflow"
                    :key="flow.title"
                    class="py-5 space-y-2"
                    style="border-bottom: 1px solid var(--color-border);"
                  >
                    <div class="flex items-center gap-3">
                      <span class="text-xl flex-shrink-0">{{ flow.icon }}</span>
                      <h3 class="font-semibold text-sm" style="color: var(--color-ink-1)">{{ flow.title }}</h3>
                    </div>
                    <p class="text-sm leading-relaxed pl-9" style="color: var(--color-ink-4)">{{ flow.desc }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Specs + CTA -->
            <div class="space-y-6">

              <!-- DI Console Specs card -->
              <div class="glass-card p-6 space-y-5 relative overflow-hidden">
                <!-- Top accent line -->
                <div class="absolute top-0 inset-x-0 h-[2px] rounded-t-[inherit]"
                     style="background: linear-gradient(90deg, transparent, var(--color-bronze), transparent)" />

                <div class="flex items-center justify-between pt-1">
                  <h2 class="font-display text-sm font-bold uppercase tracking-wider"
                      style="color: var(--color-ink-1)">DI Console Specs</h2>
                  <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full animate-pulse" style="background: #16a34a" />
                    <span class="text-[10px] uppercase font-mono" style="color: var(--color-ink-5)">Graded</span>
                  </div>
                </div>

                <div class="space-y-0 font-mono text-xs" style="border-top: 1px solid var(--color-border);">
                  <div class="flex justify-between py-3" style="border-bottom: 1px solid var(--color-border);">
                    <span style="color: var(--color-ink-4)">后期导演 (Director)</span>
                    <span class="font-semibold" style="color: var(--color-ink-1)">{{ project.director || 'Xo' }}</span>
                  </div>
                  <div v-if="project.software?.[0]" class="flex justify-between py-3" style="border-bottom: 1px solid var(--color-border);">
                    <span style="color: var(--color-ink-4)">剪辑软件 (NLE)</span>
                    <span class="font-semibold" style="color: var(--color-ink-1)">{{ project.software[0] }}</span>
                  </div>
                  <div v-if="project.software?.[1]" class="flex justify-between py-3" style="border-bottom: 1px solid var(--color-border);">
                    <span style="color: var(--color-ink-4)">色彩分级 (DI)</span>
                    <span class="font-semibold" style="color: var(--color-ink-1)">{{ project.software[1] }}</span>
                  </div>
                  <div class="flex justify-between py-3" style="border-bottom: 1px solid var(--color-border);">
                    <span style="color: var(--color-ink-4)">交付格式</span>
                    <span class="font-semibold" style="color: var(--color-ink-1)">{{ project.deliverFormat || 'ProRes 422 HQ' }}</span>
                  </div>
                  <div class="flex justify-between py-3">
                    <span style="color: var(--color-ink-4)">声音编码</span>
                    <span class="font-semibold" style="color: var(--color-ink-1)">{{ project.audioFormat || '24-bit 48kHz' }}</span>
                  </div>
                </div>
              </div>

              <!-- CTA card -->
              <div class="glass-card p-6 space-y-4 overflow-hidden relative">
                <div class="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                     style="background: radial-gradient(circle, rgba(180,83,9,0.12) 0%, transparent 70%)" />
                <div class="space-y-1 relative z-10">
                  <h3 class="font-display text-base font-semibold" style="color: var(--color-ink-1)">
                    需要同类视频制作？
                  </h3>
                  <p class="text-xs leading-relaxed" style="color: var(--color-ink-4)">
                    我支持从视频分镜、后期精剪、调色降噪到动效合成的全流程定制服务。
                  </p>
                </div>
                <a :href="'mailto:' + (siteConfig?.siteInfo?.contactEmail || 'hello@xo.dev')" class="btn-primary w-full justify-center text-xs py-2.5 relative z-10">
                  发起项目咨询
                </a>
              </div>

            </div>
          </div>
        </div>
      </Transition>

      <!-- Not found state -->
      <div v-if="!project" class="text-center py-20 space-y-4 reveal">
        <p class="text-5xl">🎞️</p>
        <h1 class="font-display text-2xl font-bold" style="color: var(--color-ink-1)">未找到该作品</h1>
        <p style="color: var(--color-ink-4)">请返回作品集重新选择。</p>
        <NuxtLink to="/projects" class="btn-primary inline-flex">返回作品集</NuxtLink>
      </div>

    </div>

    <!-- Request Password Modal -->
    <Transition name="fade">
      <div v-if="isRequestModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeRequestModal" />
        <div
          class="relative w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-4"
          style="background: var(--color-bg); border: 1px solid var(--color-border); max-width: 400px;"
        >
          <div class="flex items-center justify-between border-b pb-3" style="border-color: var(--color-border)">
            <h3 class="font-display font-bold text-base" style="color: var(--color-ink-1)">申请专属授权密码</h3>
            <button @click="closeRequestModal" class="text-slate-400 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="requestSuccess" class="text-center py-6 space-y-3">
            <span class="text-3xl block">📨</span>
            <h4 class="font-bold text-sm text-emerald-600">申请提交成功！</h4>
            <p class="text-xs leading-relaxed" style="color: var(--color-ink-4)">
              您的申请已成功发送至后台。主理人收到后会通过您的联系方式与您联系并提供密码。
            </p>
            <button @click="closeRequestModal" class="btn-ghost text-xs py-2 px-4 mt-2">关闭窗口</button>
          </div>

          <form v-else @submit.prevent="submitRequest" class="space-y-4">
            <p class="text-xs leading-relaxed" style="color: var(--color-ink-4)">
              请填写您的基本信息，主理人审核后将通过您留下的联系方式（微信/邮箱）发送该作品的解锁密码。
            </p>

            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-wider block" style="color: var(--color-ink-3)">您的姓名 / 机构名称</label>
              <input
                v-model="requestForm.clientName"
                required
                class="form-input text-xs w-full py-2.5 px-3 rounded-xl"
                placeholder="例如: 某某导演 / 某某广告公司"
              />
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-wider block" style="color: var(--color-ink-3)">您的联系方式 (微信 / 邮箱)</label>
              <input
                v-model="requestForm.contact"
                required
                class="form-input text-xs w-full py-2.5 px-3 rounded-xl"
                placeholder="例如: 微信号: xx_123 或 xx@email.com"
              />
            </div>

            <div class="pt-2">
              <button
                type="submit"
                class="btn-primary w-full justify-center py-2.5 text-xs font-semibold"
                :disabled="requestSubmitting"
              >
                {{ requestSubmitting ? '正在提交...' : '提交授权申请' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const mainVideoRef = ref<HTMLVideoElement | null>(null)
const blurVideoRef = ref<HTMLVideoElement | null>(null)

// Fetch project list (passwords are NEVER returned — only hasPassword:boolean)
const { data: projects } = await useFetch<any[]>('/api/projects')
const project = computed(() => (projects.value || []).find(p => p.slug === slug))
const { data: siteConfig } = await useFetch<any>('/api/site-config')
const activeVideoIndex = ref(0)
const parseVideoUrls = (input: any) => {
  if (Array.isArray(input)) return input
  if (typeof input !== 'string') return []

  const trimmed = input.trim()
  if (!trimmed) return []

  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) return parsed
  } catch (e) {}

  return trimmed.split(/[\n,，]+/g)
}
const projectVideoUrls = computed(() => {
  const urls = parseVideoUrls(project.value?.videoUrls)
  const normalized = urls.map((url: string) => url?.trim()).filter(Boolean)
  const legacyUrl = project.value?.videoUrl?.trim()
  if (legacyUrl && !normalized.includes(legacyUrl)) normalized.unshift(legacyUrl)
  return normalized
})
const activeVideoUrl = computed(() => projectVideoUrls.value[activeVideoIndex.value] || '')

watch(projectVideoUrls, (urls) => {
  if (activeVideoIndex.value >= urls.length) activeVideoIndex.value = 0
})

// Check unlock status from server (uses HTTP-only cookie)
const { data: unlockStatus } = await useFetch<any>(`/api/projects/${slug}/check`)

const isUnlocked = ref(!!(unlockStatus.value?.unlocked))
const inputPassword = ref('')
const passwordError = ref<string>('')
const passwordLoading = ref(false)

// When project data loads, sync unlock state from server check result
watch(unlockStatus, async (val) => {
  if (val?.unlocked) {
    isUnlocked.value = true
    await nextTick()
    initReveal()
  }
}, { immediate: true })

const verifyPassword = async () => {
  if (!inputPassword.value.trim()) return
  passwordLoading.value = true
  passwordError.value = ''
  try {
    const res = await $fetch<any>(`/api/projects/${slug}/unlock`, {
      method: 'POST',
      body: { password: inputPassword.value }
    })
    if (res.success) {
      isUnlocked.value = true
      inputPassword.value = ''
      await nextTick()
      initReveal()
    }
  } catch (err: any) {
    passwordError.value = err.data?.statusMessage || '密码错误，请联系作者获取授权密码。'
    setTimeout(() => { passwordError.value = '' }, 2500)
  } finally {
    passwordLoading.value = false
  }
}

const isRequestModalOpen = ref(false)
const requestSubmitting = ref(false)
const requestSuccess = ref(false)
const requestForm = ref({
  clientName: '',
  contact: ''
})

const openRequestModal = () => {
  isRequestModalOpen.value = true
  requestSuccess.value = false
  requestForm.value.clientName = ''
  requestForm.value.contact = ''
}

const closeRequestModal = () => {
  isRequestModalOpen.value = false
}

const submitRequest = async () => {
  requestSubmitting.value = true
  try {
    await $fetch('/api/password-requests', {
      method: 'POST',
      body: {
        clientName: requestForm.value.clientName,
        contact: requestForm.value.contact,
        projectSlug: slug,
        projectTitle: project.value?.title || slug
      }
    })
    requestSuccess.value = true
  } catch (err: any) {
    alert(err.data?.statusMessage || '提交申请失败，请稍后重试。')
  } finally {
    requestSubmitting.value = false
  }
}

// Image LUT slider logic
const sliderContainerRef = ref<HTMLElement | null>(null)
const sliderPosition = ref(50)
const containerWidth = ref(800)
const sliderDragging = ref(false)

const handleSliderMove = (e: MouseEvent | TouchEvent) => {
  if (!sliderContainerRef.value) return
  // Only drag on mousedown held or touch
  if (e instanceof MouseEvent && !sliderDragging.value) return
  const rect = sliderContainerRef.value.getBoundingClientRect()
  containerWidth.value = rect.width
  let clientX = 0
  if (e instanceof MouseEvent) {
    clientX = e.clientX
  } else if (e instanceof TouchEvent && e.touches?.[0]) {
    clientX = e.touches[0].clientX
  }
  const x = clientX - rect.left
  let pct = (x / rect.width) * 100
  sliderPosition.value = Math.max(0, Math.min(100, pct))
}

if (import.meta.client) {
  window.addEventListener('mouseup', () => { sliderDragging.value = false })
  window.addEventListener('resize', () => {
    if (sliderContainerRef.value) {
      containerWidth.value = sliderContainerRef.value.getBoundingClientRect().width
    }
  })
}

const syncBlurVideo = () => {
  if (!mainVideoRef.value || !blurVideoRef.value) return
  const main = mainVideoRef.value
  const blur = blurVideoRef.value
  blur.currentTime = main.currentTime
  main.addEventListener('play', () => { blur.play().catch(() => {}) })
  main.addEventListener('pause', () => blur.pause())
  main.addEventListener('seeking', () => { blur.currentTime = main.currentTime })
  main.addEventListener('timeupdate', () => {
    if (Math.abs(blur.currentTime - main.currentTime) > 0.35) {
      blur.currentTime = main.currentTime
    }
  })
}

useHead({
  title: () => project.value ? `${project.value.title} — xo.dev` : '作品详情 — xo.dev',
  meta: [{ name: 'description', content: () => project.value ? project.value.description : '作品详情页' }]
})

let observer: IntersectionObserver | null = null

const initReveal = () => {
  if (!import.meta.client) return
  if (observer) observer.disconnect()
  observer = new IntersectionObserver(
    (entries) => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view') }) },
    { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
  )
  document.querySelectorAll('.reveal').forEach(el => observer?.observe(el))
}

onMounted(async () => {
  await nextTick()
  initReveal()
})
onBeforeUnmount(() => { if (observer) observer.disconnect() })
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.ambilight-container {
  position: relative;
  border-radius: 1rem;
  overflow: visible;
}

.ambilight-shadow {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 1rem;
  filter: blur(40px) saturate(1.5) brightness(0.7);
  transform: translateY(12px) scale(1.04);
  z-index: 0;
  opacity: 0.65;
  pointer-events: none;
}
</style>
