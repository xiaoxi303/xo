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
      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="w-12 h-12 rounded-full flex items-center justify-center text-xl mx-auto shadow-sm"
             style="background: var(--color-bg-2); border: 1px solid var(--color-border);">
          📝
        </div>
        <span class="text-[9px] font-mono tracking-[0.25em] uppercase text-amber-700 font-bold block">申请访问权限</span>
        <h1 class="font-display text-2xl font-bold" style="color: var(--color-ink-1)">{{ projectTitle }}</h1>
        <p class="text-xs leading-relaxed" style="color: var(--color-ink-4)">
          填写以下表单申请访问 <span class="font-bold" style="color: var(--color-ink-2)">{{ projectTitle }}</span> 的权限
        </p>
      </div>

      <!-- Success State - Manual Apply (No Password Display) -->
      <div v-if="submitSuccess" class="text-center py-8 space-y-5">
        <div class="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto"
             style="background: rgba(5, 150, 105, 0.1); border: 1px solid rgba(5, 150, 105, 0.2);">
          ✉️
        </div>
        <h2 class="font-display text-xl font-bold" style="color: var(--color-ink-1)">✉️ 申请已成功提交！</h2>
        <div class="p-4 rounded-xl text-left space-y-2" style="background: var(--color-bg-2); border: 1px solid var(--color-border);">
          <p class="text-xs leading-relaxed" style="color: var(--color-ink-3)">
            您的访问申请已通知作者，最新密码（或审核结果）将通过邮件发送至您的联系方式，请注意查收。
          </p>
          <p class="text-xs leading-relaxed" style="color: var(--color-ink-4)">
            📨 申请信息：
          </p>
          <ul class="text-xs space-y-1 pl-4" style="color: var(--color-ink-4)">
            <li>• 姓名：{{ form.clientName }}</li>
            <li>• 联系方式：{{ form.contact }}</li>
          </ul>
        </div>
        <div class="flex flex-col gap-3 pt-2">
          <NuxtLink to="/projects" class="btn-primary inline-flex items-center justify-center gap-2 text-xs">
            返回作品集
          </NuxtLink>
        </div>
      </div>

      <!-- Request Form -->
      <form v-else @submit.prevent="submitRequest" class="space-y-4">
        <div v-if="submitError" class="p-3.5 rounded-xl text-xs bg-rose-50 border border-rose-100 text-rose-600 font-medium">
          ❌ {{ submitError }}
        </div>

        <div class="space-y-1">
          <label class="text-[10px] font-bold uppercase tracking-wider block" style="color: var(--color-ink-3)">您的姓名</label>
          <input
            v-model="form.clientName"
            type="text"
            required
            class="form-input text-xs w-full py-2.5 px-3 rounded-xl"
            placeholder="请输入您的姓名"
            :disabled="submitLoading"
          />
        </div>

        <div class="space-y-1">
          <label class="text-[10px] font-bold uppercase tracking-wider block" style="color: var(--color-ink-3)">联系方式</label>
          <input
            v-model="form.contact"
            type="text"
            required
            class="form-input text-xs w-full py-2.5 px-3 rounded-xl"
            placeholder="邮箱或微信号"
            :disabled="submitLoading"
          />
        </div>

        <div class="space-y-1">
          <label class="text-[10px] font-bold uppercase tracking-wider block" style="color: var(--color-ink-3)">申请理由</label>
          <textarea
            v-model="form.reason"
            required
            class="form-input text-xs w-full py-2.5 px-3 rounded-xl resize-none"
            rows="4"
            placeholder="请简要说明您申请访问的理由"
            :disabled="submitLoading"
          />
        </div>

        <button
          type="submit"
          class="btn-primary w-full justify-center py-3 text-xs font-semibold flex items-center gap-2"
          :disabled="submitLoading"
        >
          <span v-if="submitLoading" class="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style="border-color: currentColor; border-top-color: transparent;" />
          {{ submitLoading ? '提交中...' : '提交申请' }}
        </button>
      </form>

      <!-- Back Link -->
      <div class="pt-4 border-t" style="border-color: var(--color-border)">
        <NuxtLink :to="`/projects/${slug}`" class="text-xs hover:underline" style="color: var(--color-ink-4)">
          &larr; 返回作品详情
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { encryptE2EE, isE2EESupported } from '../../../utils/e2ee'

const route = useRoute()
const slug = route.params.slug as string

const projectTitle = ref('')
const submitLoading = ref(false)
const submitSuccess = ref(false)
const submitError = ref('')

const form = ref({
  clientName: '',
  contact: '',
  reason: ''
})

// Fetch project info
const { data: projects } = await useFetch<any[]>('/api/projects')
const project = computed(() => (projects.value || []).find(p => p.slug === slug))

// Auto-fill form with logged-in user info
const { data: userInfo } = await useFetch<any>('/api/auth/client-me')
if (userInfo.value?.loggedIn) {
  form.value.clientName = userInfo.value.username || ''
  form.value.contact = userInfo.value.email || userInfo.value.wechat || ''
}

onMounted(() => {
  if (project.value) {
    projectTitle.value = project.value.title || '未知作品'
  }
})

useHead({
  title: () => `申请访问 - ${projectTitle.value || '作品'}`
})

const submitRequest = async () => {
  if (submitLoading.value) return
  
  submitLoading.value = true
  submitError.value = ''
  
  try {
    let e2eeData: any = null
    try {
      if (isE2EESupported()) {
        e2eeData = await encryptE2EE(JSON.stringify({
          contact: form.value.contact,
          reason: form.value.reason,
          ts: Date.now()
        }))
      }
    } catch {}

    await $fetch('/api/password-requests', {
      method: 'POST',
      body: {
        projectSlug: slug,
        projectTitle: projectTitle.value,
        clientName: form.value.clientName,
        contact: form.value.contact,
        reason: form.value.reason,
        e2eePayload: e2eeData
      }
    })
    
    submitSuccess.value = true
  } catch (e: any) {
    submitError.value = e.statusMessage || '提交失败，请稍后重试。'
  } finally {
    submitLoading.value = false
  }
}
</script>
