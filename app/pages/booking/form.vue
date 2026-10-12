<template>
  <div class="min-h-screen pt-28 pb-24 px-6 relative overflow-hidden" style="background: var(--color-bg);">
    <!-- Ambient Studio Luxury Backdrop Glows -->
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-0 animate-pulse"
      style="width: 900px; height: 500px; background: radial-gradient(circle, rgba(217,119,6,0.18) 0%, rgba(147,51,234,0.1) 45%, transparent 75%); filter: blur(60px);"
    />

    <div class="max-w-2xl mx-auto space-y-8 relative z-10">
      
      <!-- Back button -->
      <div class="reveal">
        <NuxtLink to="/booking" class="btn-ghost inline-flex items-center gap-2 text-xs py-2 px-4 shadow-xs">
          <IconSax name="arrow-left" :size="14" />
          <span>返回预约说明</span>
        </NuxtLink>
      </div>

      <!-- Success Message -->
      <Transition name="fade">
        <div v-if="submitted" class="glass-card p-12 text-center space-y-6 rounded-3xl border-2 border-emerald-300 bg-white/95 shadow-2xl">
          <span class="text-6xl animate-bounce">✨</span>
          <h2 class="font-display text-3xl font-bold text-slate-900">预约意向已送达！</h2>
          <p class="text-slate-600 text-sm max-w-md mx-auto">感谢您的预约，我们会在 24 小时内通过邮件或电话与您取得联系，推进技术排期。</p>
          <div class="flex items-center justify-center gap-4 pt-4">
            <NuxtLink to="/" class="btn-ghost py-2.5 px-6 text-xs">返回首页</NuxtLink>
            <NuxtLink to="/projects" class="btn-primary py-2.5 px-6 text-xs shadow-lg">查看作品集</NuxtLink>
          </div>
        </div>
      </Transition>

      <!-- Form -->
      <Transition name="fade">
        <div v-if="!submitted" class="glass-card p-8 sm:p-12 space-y-8 rounded-3xl border-2 border-black/10 shadow-2xl bg-white/95">
          <div class="text-center space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 text-[10px] font-mono font-bold border border-amber-500/20">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
              <span>项目合作意向表</span>
            </div>
            <h1 class="font-display text-3xl font-bold text-slate-900 tracking-tight">合作预约意向表单</h1>
            <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">请填写以下项目基本信息，我们将快速评估周期与预算方案。</p>
          </div>

          <form @submit.prevent="submitForm" class="space-y-6">
            <!-- Name -->
            <div class="space-y-2">
              <label class="form-label font-semibold">
                <span class="text-rose-500">*</span> 您的姓名
              </label>
              <input v-model="form.name" type="text" required class="form-input" placeholder="请输入您的姓名" />
            </div>

            <!-- Contact -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="form-label font-semibold">
                  <span class="text-rose-500">*</span> 联系电话
                </label>
                <input v-model="form.phone" type="tel" required class="form-input" placeholder="手机号码" />
              </div>
              <div class="space-y-2">
                <label class="form-label font-semibold">
                  <span class="text-rose-500">*</span> 电子邮箱
                </label>
                <input v-model="form.email" type="email" required class="form-input" placeholder="your@email.com" />
              </div>
            </div>

            <!-- Company -->
            <div class="space-y-2">
              <label class="form-label font-semibold">公司/品牌名称</label>
              <input v-model="form.company" type="text" class="form-input" placeholder="选填" />
            </div>

            <!-- Service Type -->
            <div class="space-y-2">
              <label class="form-label font-semibold">
                <span class="text-rose-500">*</span> 服务类型
              </label>
              <select v-model="form.serviceType" required class="form-input">
                <option value="">请选择服务类型</option>
                <option value="tvc">🎬 商业TVC广告</option>
                <option value="color">🎨 电影/纪录片调色</option>
                <option value="short">📹 短视频制作</option>
                <option value="audio">🎵 音效/配乐设计</option>
                <option value="other">📁 其他服务</option>
              </select>
            </div>

            <!-- Budget -->
            <div class="space-y-2">
              <label class="form-label font-semibold">预算范围</label>
              <select v-model="form.budget" class="form-input">
                <option value="">请选择预算范围</option>
                <option value="under5k">5,000 元以下</option>
                <option value="5k-10k">5,000 - 10,000 元</option>
                <option value="10k-30k">10,000 - 30,000 元</option>
                <option value="30k-50k">30,000 - 50,000 元</option>
                <option value="over50k">50,000 元以上</option>
                <option value="negotiable">面议</option>
              </select>
            </div>

            <!-- Timeline -->
            <div class="space-y-2">
              <label class="form-label font-semibold">期望交付时间</label>
              <select v-model="form.timeline" class="form-input">
                <option value="">请选择期望时间</option>
                <option value="urgent">⚡ 加急（3天内）</option>
                <option value="1week">1周内</option>
                <option value="2weeks">2周内</option>
                <option value="1month">1个月内</option>
                <option value="flexible">时间灵活</option>
              </select>
            </div>

            <!-- Description -->
            <div class="space-y-2">
              <label class="form-label font-semibold">
                <span class="text-rose-500">*</span> 项目描述
              </label>
              <textarea v-model="form.description" required rows="5" class="form-input resize-none" placeholder="请简要描述您的项目需求、创意想法或参考作品..."></textarea>
            </div>

            <!-- Reference Links -->
            <div class="space-y-2">
              <label class="form-label font-semibold">参考链接</label>
              <input v-model="form.referenceLinks" type="text" class="form-input" placeholder="如有参考视频/图片链接，请粘贴在这里" />
            </div>

            <!-- Submit -->
            <div class="pt-4">
              <button
                type="submit"
                :disabled="submitting"
                class="xo-kinetic-btn w-full py-4 text-sm font-bold text-white bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 hover:from-amber-600 hover:via-amber-500 hover:to-amber-700 border border-white/10 rounded-2xl shadow-xl hover:shadow-[0_12px_36px_rgba(217,119,6,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span v-if="submitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <IconSax v-else name="send-2" :size="16" class="opacity-90" />
                <span>{{ submitting ? '正在提交意向...' : '提交合作预约意向' }}</span>
              </button>
            </div>

            <p v-if="error" class="text-xs font-semibold text-rose-500 text-center">❌ {{ error }}</p>
          </form>
        </div>
      </Transition>

    </div>
  </div>
</template>

<script setup lang="ts">
import { encryptRsaHybrid } from '../../utils/rsa-hybrid'

useHead({
  title: '预约表单 - XO Studio'
})

const submitted = ref(false)
const submitting = ref(false)
const error = ref('')

const form = ref({
  name: '',
  phone: '',
  email: '',
  company: '',
  serviceType: '',
  budget: '',
  timeline: '',
  description: '',
  referenceLinks: ''
})

const submitForm = async () => {
  submitting.value = true
  error.value = ''
  
  try {
    await $fetch('/api/booking', {
      method: 'POST',
      body: await encryptRsaHybrid(form.value)
    })
    submitted.value = true
  } catch (e: any) {
    error.value = e.statusMessage || '提交失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>
