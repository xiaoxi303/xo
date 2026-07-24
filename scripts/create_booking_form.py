# -*- coding: utf-8 -*-
import codecs

# Create booking form page
form_page = '''<template>
  <div class="min-h-screen pt-28 pb-24 px-6">
    <div class="max-w-2xl mx-auto space-y-8">
      
      <!-- Back button -->
      <div class="reveal">
        <NuxtLink to="/booking" class="btn-ghost inline-flex items-center gap-2 text-sm py-2 px-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"/>
          </svg>
          返回预约说明
        </NuxtLink>
      </div>

      <!-- Success Message -->
      <Transition name="fade">
        <div v-if="submitted" class="glass-card p-12 text-center space-y-6 rounded-3xl border-2 border-emerald-200 bg-emerald-50/50">
          <span class="text-6xl">\u2705</span>
          <h2 class="font-display text-2xl font-bold text-emerald-800">预约提交成功！</h2>
          <p class="text-emerald-600">感谢您的预约，我们会在24小时内通过邮件或电话与您联系。</p>
          <div class="flex items-center justify-center gap-4 pt-4">
            <NuxtLink to="/" class="btn-ghost py-2 px-6 text-sm">返回首页</NuxtLink>
            <NuxtLink to="/projects" class="btn-primary py-2 px-6 text-sm">查看作品集</NuxtLink>
          </div>
        </div>
      </Transition>

      <!-- Form -->
      <Transition name="fade">
        <div v-if="!submitted" class="glass-card p-8 sm:p-10 space-y-8 rounded-3xl border-2 border-black/10 shadow-2xl">
          <div class="text-center space-y-2">
            <span class="text-4xl">\U0001f4dd</span>
            <h1 class="font-display text-2xl font-bold text-slate-900">合作预约表单</h1>
            <p class="text-sm text-slate-500">请填写以下信息，我们会尽快与您联系</p>
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
                <option value="tvc">\U0001f3ac 商业TVC广告</option>
                <option value="color">\U0001f3a8 电影/纪录片调色</option>
                <option value="short">\U0001f4f9 短视频制作</option>
                <option value="audio">\U0001f3b5 音效/配乐设计</option>
                <option value="other">\U0001f4c1 其他服务</option>
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
                <option value="urgent">\u26a1 加急（3天内）</option>
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
              <button type="submit" :disabled="submitting" class="btn-primary w-full py-4 text-base font-semibold flex items-center justify-center gap-2 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                <span v-if="submitting" class="animate-spin">\u23f3</span>
                <span v-else>\U0001f4e8</span>
                {{ submitting ? '提交中...' : '提交预约' }}
              </button>
            </div>

            <p v-if="error" class="text-sm text-rose-500 text-center">\u274c {{ error }}</p>
          </form>
        </div>
      </Transition>

    </div>
  </div>
</template>

<script setup lang="ts">
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
      body: form.value
    })
    submitted.value = true
  } catch (e: any) {
    error.value = e.statusMessage || '提交失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>
'''

with codecs.open(r'D:\Git\zpj\app\pages\booking\form.vue', 'w', 'utf-8') as f:
    f.write(form_page)

print("Created booking/form.vue")
