<template>
  <div class="booking-form-page min-h-screen pt-28 pb-32 px-4 sm:px-6 relative overflow-x-hidden selection:bg-amber-500 selection:text-white" style="background: var(--color-bg);">
    <!-- Studio Ambient Luxury Glows -->
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-0 animate-pulse"
      style="width: 1000px; height: 500px; background: radial-gradient(circle, rgba(217,119,6,0.18) 0%, rgba(147,51,234,0.12) 45%, transparent 75%); filter: blur(70px);"
    />
    <div
      class="absolute bottom-10 right-10 pointer-events-none z-0"
      style="width: 500px; height: 500px; background: radial-gradient(circle, rgba(217,119,6,0.1) 0%, transparent 70%); filter: blur(80px);"
    />

    <div class="max-w-3xl mx-auto space-y-8 relative z-10">
      
      <!-- Top Back Navigation -->
      <div class="flex items-center justify-between reveal">
        <NuxtLink to="/booking" class="btn-ghost inline-flex items-center gap-2 text-xs py-2 px-4 rounded-full border border-black/10 hover:border-amber-600/40 shadow-xs bg-white/80">
          <IconSax name="arrow-left" :size="14" />
          <span>返回合作与排期说明</span>
        </NuxtLink>

        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 text-[11px] font-mono font-semibold">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>制作排期受理中</span>
        </div>
      </div>

      <!-- Success Screen -->
      <Transition name="fade" mode="out-in">
        <div v-if="submitted" class="glass-card p-10 sm:p-14 text-center space-y-6 rounded-[36px] border-2 border-emerald-500/30 bg-white/95 shadow-2xl backdrop-blur-2xl">
          <div class="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-600 flex items-center justify-center mx-auto text-4xl shadow-lg animate-bounce">
            ✨
          </div>
          <div class="space-y-2">
            <h2 class="font-display text-3xl font-bold text-slate-900 tracking-tight">预约意向已成功送达！</h2>
            <p class="text-sm text-slate-600 max-w-md mx-auto font-sans leading-relaxed">
              感谢您的信任。制作团队已记录您的项目需求，将在 <strong class="text-amber-800">24 小时内</strong> 与您取得联系，推进技术与预算方案。
            </p>
          </div>

          <div v-if="bookingRefId" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/[0.03] border border-black/[0.08] text-xs font-mono text-slate-600">
            <span>意向档案编码:</span>
            <strong class="text-slate-900 font-bold">{{ bookingRefId }}</strong>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
            <NuxtLink to="/booking" class="btn-ghost py-3 px-6 rounded-full text-xs font-bold border border-black/10 hover:bg-black/5">
              返回合作说明
            </NuxtLink>
            <NuxtLink to="/projects" class="btn-primary py-3 px-7 rounded-full text-xs font-bold shadow-lg">
              浏览精选作品集
            </NuxtLink>
          </div>
        </div>

        <!-- Master Form Card -->
        <div v-else class="glass-card p-8 sm:p-12 space-y-8 rounded-[36px] border-2 border-amber-500/25 shadow-[0_24px_80px_rgba(217,119,6,0.14)] bg-white/95 backdrop-blur-2xl">
          <div class="text-center space-y-3">
            <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-800 text-[10px] font-mono font-bold border border-amber-500/20">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
              <span>CONFIDENTIAL INQUIRY FORM</span>
            </div>
            <h1 class="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              项目合作预约意向表
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto font-sans leading-relaxed">
              请填写以下项目基本信息，我们将快速评估技术周期并出具专属方案。全程受商业保密协议 (NDA) 保护。
            </p>
          </div>

          <form @submit.prevent="submitForm" class="space-y-6">
            <!-- Name & Company -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">
                  <span class="text-rose-500">*</span> 您的姓名 / 称呼
                </label>
                <input v-model="form.name" type="text" required class="form-input text-xs" placeholder="例如：张制片 / 李总监" />
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">公司或品牌名称</label>
                <input v-model="form.company" type="text" class="form-input text-xs" placeholder="选填（如：XX 影业 / 独立导演）" />
              </div>
            </div>

            <!-- Contact: Phone & Email -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">
                  <span class="text-rose-500">*</span> 联系手机
                </label>
                <input v-model="form.phone" type="tel" required class="form-input text-xs font-mono" placeholder="用于接收意向确认与微信同步" />
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">
                  <span class="text-rose-500">*</span> 电子邮箱
                </label>
                <input v-model="form.email" type="email" required class="form-input text-xs font-mono" placeholder="your@company.com" />
              </div>
            </div>

            <!-- Service Type Selector -->
            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-700">
                <span class="text-rose-500">*</span> 意向服务类型
              </label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  v-for="st in serviceTypeOptions"
                  :key="st.value"
                  type="button"
                  @click="form.serviceType = st.value"
                  :class="[
                    'p-2.5 rounded-xl text-xs font-medium border text-left transition-all flex items-center gap-2 cursor-pointer',
                    form.serviceType === st.value
                      ? 'bg-amber-700 text-white border-amber-800 shadow-sm font-bold'
                      : 'bg-white/80 border-black/10 text-slate-700 hover:border-amber-600/40 hover:bg-amber-50/30'
                  ]"
                >
                  <span>{{ st.icon }}</span>
                  <span class="truncate">{{ st.label }}</span>
                </button>
              </div>
            </div>

            <!-- Budget & Timeline -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">预估预算范围</label>
                <select v-model="form.budget" class="form-input text-xs cursor-pointer">
                  <option value="">请选择预算区间</option>
                  <option value="under5k">5,000 元以下</option>
                  <option value="5k-10k">5,000 - 10,000 元</option>
                  <option value="10k-30k">10,000 - 30,000 元</option>
                  <option value="30k-50k">30,000 - 50,000 元</option>
                  <option value="over50k">50,000 元以上</option>
                  <option value="negotiable">面议 / 根据方案测算</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">期望交付周期</label>
                <select v-model="form.timeline" class="form-input text-xs cursor-pointer">
                  <option value="">请选择期望交付节点</option>
                  <option value="urgent">⚡ 紧急加急（3天内）</option>
                  <option value="1week">1周内交付</option>
                  <option value="2weeks">2周内交付</option>
                  <option value="1month">1个月内交付</option>
                  <option value="flexible">时间充裕 / 长期排期</option>
                </select>
              </div>
            </div>

            <!-- Description -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700">
                <span class="text-rose-500">*</span> 项目简述与制作诉求
              </label>
              <textarea
                v-model="form.description"
                required
                rows="4"
                class="form-input text-xs resize-none font-sans"
                placeholder="请简要介绍项目类型、原片格式（如 ProRes / RAW / 4K）、预估时长、对标影片风格或具体交付诉求..."
              />
            </div>

            <!-- Reference Links -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700">参考视频或网盘链接</label>
              <input
                v-model="form.referenceLinks"
                type="text"
                class="form-input text-xs font-mono"
                placeholder="选填（如有成片对标样片、Moodboard 或分镜文档）"
              />
            </div>

            <!-- Security Badge & Submit -->
            <div class="pt-3 space-y-3">
              <button
                type="submit"
                :disabled="submitting"
                class="xo-kinetic-btn w-full py-4 text-sm font-bold text-white bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 hover:from-amber-600 hover:via-amber-500 hover:to-amber-700 border border-white/10 rounded-2xl shadow-xl hover:shadow-[0_12px_36px_rgba(217,119,6,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span v-if="submitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <IconSax v-else name="send-2" :size="16" class="opacity-90" />
                <span>{{ submitting ? '正在加密提交意向...' : '提交商业合作预约意向' }}</span>
              </button>

              <div class="flex items-center justify-between text-[11px] text-slate-600 font-mono px-1">
                <span>🔒 RSA-4096 混合高强加密传输</span>
                <span>✓ 24小时内极速反馈</span>
              </div>

              <p v-if="error" class="text-xs font-semibold text-rose-500 text-center pt-1">
                ❌ {{ error }}
              </p>
            </div>
          </form>
        </div>
      </Transition>

    </div>
  </div>
</template>

<script setup lang="ts">
import { encryptRsaHybrid } from '../../utils/rsa-hybrid'

useHead({
  title: '预约意向表单 - XO Studio'
})

const submitted = ref(false)
const submitting = ref(false)
const error = ref('')
const bookingRefId = ref('')

const form = ref({
  name: '',
  phone: '',
  email: '',
  company: '',
  serviceType: 'tvc',
  budget: '',
  timeline: '',
  description: '',
  referenceLinks: ''
})

const serviceTypeOptions = [
  { value: 'tvc', label: '商业TVC广告', icon: '🎬' },
  { value: 'color', label: '院线/短片调色', icon: '🎨' },
  { value: 'short', label: '品牌概念/短视频', icon: '📹' },
  { value: 'audio', label: '声场/配乐设计', icon: '🎵' },
  { value: 'vfx', label: '三维/后期视效', icon: '✨' },
  { value: 'other', label: '全案/其他定制', icon: '📁' }
]

const submitForm = async () => {
  submitting.value = true
  error.value = ''
  
  try {
    const res: any = await $fetch('/api/booking', {
      method: 'POST',
      body: await encryptRsaHybrid(form.value)
    })
    bookingRefId.value = res?.id || ''
    submitted.value = true
  } catch (e: any) {
    error.value = e.statusMessage || e.data?.message || '提交失败，请检查网络或稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>
