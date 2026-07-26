# -*- coding: utf-8 -*-
import codecs

# Restore the original booking form page with full UI
form_content = '''<template>
  <div class="min-h-screen pt-28 pb-24 px-6">
    <div class="max-w-2xl mx-auto space-y-8">
      
      <!-- Back button -->
      <div class="reveal">
        <NuxtLink to="/booking" class="btn-ghost inline-flex items-center gap-2 text-sm py-2 px-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"/>
          </svg>
          \u8fd4\u56de\u9884\u7ea6\u8bf4\u660e
        </NuxtLink>
      </div>

      <!-- Success Message -->
      <Transition name="fade">
        <div v-if="submitted" class="glass-card p-12 text-center space-y-6 rounded-3xl border-2 border-emerald-200 bg-emerald-50/50">
          <span class="text-6xl">\u2705</span>
          <h2 class="font-display text-2xl font-bold text-emerald-800">\u9884\u7ea6\u63d0\u4ea4\u6210\u529f\uff01</h2>
          <p class="text-emerald-600">\u611f\u8c22\u60a8\u7684\u9884\u7ea6\uff0c\u6211\u4eec\u4f1a\u572824\u5c0f\u65f6\u5185\u901a\u8fc7\u90ae\u4ef6\u6216\u7535\u8bdd\u4e0e\u60a8\u8054\u7cfb\u3002</p>
          <div class="flex items-center justify-center gap-4 pt-4">
            <NuxtLink to="/" class="btn-ghost py-2 px-6 text-sm">\u8fd4\u56de\u9996\u9875</NuxtLink>
            <NuxtLink to="/projects" class="btn-primary py-2 px-6 text-sm">\u67e5\u770b\u4f5c\u54c1\u96c6</NuxtLink>
          </div>
        </div>
      </Transition>

      <!-- Form -->
      <Transition name="fade">
        <div v-if="!submitted" class="glass-card p-8 sm:p-10 space-y-8 rounded-3xl border-2 border-black/10 shadow-2xl">
          <div class="text-center space-y-2">
            <span class="text-4xl">\U0001f4dd</span>
            <h1 class="font-display text-2xl font-bold text-slate-900">\u5408\u4f5c\u9884\u7ea6\u8868\u5355</h1>
            <p class="text-sm text-slate-500">\u8bf7\u586b\u5199\u4ee5\u4e0b\u4fe1\u606f\uff0c\u6211\u4eec\u4f1a\u5c3d\u5feb\u4e0e\u60a8\u8054\u7cfb</p>
          </div>

          <form @submit.prevent="submitForm" class="space-y-6">
            <!-- Name -->
            <div class="space-y-2">
              <label class="form-label font-semibold">
                <span class="text-rose-500">*</span> \u60a8\u7684\u59d3\u540d
              </label>
              <input v-model="form.name" type="text" required class="form-input" placeholder="\u8bf7\u8f93\u5165\u60a8\u7684\u59d3\u540d" />
            </div>

            <!-- Contact -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="form-label font-semibold">
                  <span class="text-rose-500">*</span> \u8054\u7cfb\u7535\u8bdd
                </label>
                <input v-model="form.phone" type="tel" required class="form-input" placeholder="\u624b\u673a\u53f7\u7801" />
              </div>
              <div class="space-y-2">
                <label class="form-label font-semibold">
                  <span class="text-rose-500">*</span> \u7535\u5b50\u90ae\u7bb1
                </label>
                <input v-model="form.email" type="email" required class="form-input" placeholder="your@email.com" />
              </div>
            </div>

            <!-- Company -->
            <div class="space-y-2">
              <label class="form-label font-semibold">\u516c\u53f8/\u54c1\u724c\u540d\u79f0</label>
              <input v-model="form.company" type="text" class="form-input" placeholder="\u9009\u586b" />
            </div>

            <!-- Service Type -->
            <div class="space-y-2">
              <label class="form-label font-semibold">
                <span class="text-rose-500">*</span> \u670d\u52a1\u7c7b\u578b
              </label>
              <select v-model="form.serviceType" required class="form-input">
                <option value="">\u8bf7\u9009\u62e9\u670d\u52a1\u7c7b\u578b</option>
                <option value="tvc">\U0001f3ac \u5546\u4e1aTVC\u5e7f\u544a</option>
                <option value="color">\U0001f3a8 \u7535\u5f71/\u7eaa\u5f55\u7247\u8c03\u8272</option>
                <option value="short">\U0001f4f9 \u77ed\u89c6\u9891\u5236\u4f5c</option>
                <option value="audio">\U0001f3b5 \u97f3\u6548/\u914d\u4e50\u8bbe\u8ba1</option>
                <option value="other">\U0001f4c1 \u5176\u4ed6\u670d\u52a1</option>
              </select>
            </div>

            <!-- Budget -->
            <div class="space-y-2">
              <label class="form-label font-semibold">\u9884\u7b97\u8303\u56f4</label>
              <select v-model="form.budget" class="form-input">
                <option value="">\u8bf7\u9009\u62e9\u9884\u7b97\u8303\u56f4</option>
                <option value="under5k">5,000 \u5143\u4ee5\u4e0b</option>
                <option value="5k-10k">5,000 - 10,000 \u5143</option>
                <option value="10k-30k">10,000 - 30,000 \u5143</option>
                <option value="30k-50k">30,000 - 50,000 \u5143</option>
                <option value="over50k">50,000 \u5143\u4ee5\u4e0a</option>
                <option value="negotiable">\u9762\u8bae</option>
              </select>
            </div>

            <!-- Timeline -->
            <div class="space-y-2">
              <label class="form-label font-semibold">\u671f\u671b\u4ea4\u4ed8\u65f6\u95f4</label>
              <select v-model="form.timeline" class="form-input">
                <option value="">\u8bf7\u9009\u62e9\u671f\u671b\u65f6\u95f4</option>
                <option value="urgent">\u26a1 \u52a0\u6025\uff083\u5929\u5185\uff09</option>
                <option value="1week">1\u5468\u5185</option>
                <option value="2weeks">2\u5468\u5185</option>
                <option value="1month">1\u4e2a\u6708\u5185</option>
                <option value="flexible">\u65f6\u95f4\u7075\u6d3b</option>
              </select>
            </div>

            <!-- Description -->
            <div class="space-y-2">
              <label class="form-label font-semibold">
                <span class="text-rose-500">*</span> \u9879\u76ee\u63cf\u8ff0
              </label>
              <textarea v-model="form.description" required rows="5" class="form-input resize-none" placeholder="\u8bf7\u7b80\u8981\u63cf\u8ff0\u60a8\u7684\u9879\u76ee\u9700\u6c42\u3001\u521b\u610f\u60f3\u6cd5\u6216\u53c2\u8003\u4f5c\u54c1..."></textarea>
            </div>

            <!-- Reference Links -->
            <div class="space-y-2">
              <label class="form-label font-semibold">\u53c2\u8003\u94fe\u63a5</label>
              <input v-model="form.referenceLinks" type="text" class="form-input" placeholder="\u5982\u6709\u53c2\u8003\u89c6\u9891/\u56fe\u7247\u94fe\u63a5\uff0c\u8bf7\u7c98\u8d34\u5728\u8fd9\u91cc" />
            </div>

            <!-- Submit -->
            <div class="pt-4">
              <button type="submit" :disabled="submitting" class="btn-primary w-full py-4 text-base font-semibold flex items-center justify-center gap-2 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                <span v-if="submitting" class="animate-spin">\u23f3</span>
                <span v-else>\U0001f4e8</span>
                {{ submitting ? '\u63d0\u4ea4\u4e2d...' : '\u63d0\u4ea4\u9884\u7ea6' }}
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
  title: '\u9884\u7ea6\u8868\u5355 - XO Studio'
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
    error.value = e.statusMessage || '\u63d0\u4ea4\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5'
  } finally {
    submitting.value = false
  }
}
</script>
'''

with codecs.open(r'D:\Git\zpj\app\pages\booking\form.vue', 'w', 'utf-8') as f:
    f.write(form_content)

print("Restored booking/form.vue with full UI")
