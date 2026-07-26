# -*- coding: utf-8 -*-
import codecs

# Create a simple form page
simple_form = '''<template>
  <div class="min-h-screen pt-28 pb-24 px-6">
    <div class="max-w-2xl mx-auto">
      
      <div class="mb-8">
        <NuxtLink to="/booking" class="text-amber-600 hover:text-amber-700">\u2190 \u8fd4\u56de\u9884\u7ea6\u8bf4\u660e</NuxtLink>
      </div>

      <h1 class="text-3xl font-bold mb-6">\u5408\u4f5c\u9884\u7ea6\u8868\u5355</h1>

      <div v-if="submitted" class="p-8 border rounded-lg bg-green-50 text-center">
        <p class="text-2xl mb-4">\u2705</p>
        <p class="text-lg font-bold text-green-700">\u9884\u7ea6\u63d0\u4ea4\u6210\u529f\uff01</p>
        <p class="text-green-600 mt-2">\u6211\u4eec\u4f1a\u572824\u5c0f\u65f6\u5185\u4e0e\u60a8\u8054\u7cfb</p>
        <NuxtLink to="/" class="inline-block mt-4 text-amber-600">\u8fd4\u56de\u9996\u9875</NuxtLink>
      </div>

      <form v-else @submit.prevent="submitForm" class="space-y-6">
        <div>
          <label class="block text-sm font-bold mb-2">\u59d3\u540d *</label>
          <input v-model="form.name" type="text" required class="w-full p-3 border rounded-lg" placeholder="\u8bf7\u8f93\u5165\u60a8\u7684\u59d3\u540d" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold mb-2">\u7535\u8bdd *</label>
            <input v-model="form.phone" type="tel" required class="w-full p-3 border rounded-lg" placeholder="\u624b\u673a\u53f7\u7801" />
          </div>
          <div>
            <label class="block text-sm font-bold mb-2">\u90ae\u7bb1 *</label>
            <input v-model="form.email" type="email" required class="w-full p-3 border rounded-lg" placeholder="your@email.com" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold mb-2">\u670d\u52a1\u7c7b\u578b *</label>
          <select v-model="form.serviceType" required class="w-full p-3 border rounded-lg">
            <option value="">\u8bf7\u9009\u62e9</option>
            <option value="tvc">\u5546\u4e1aTVC\u5e7f\u544a</option>
            <option value="color">\u7535\u5f71\u8c03\u8272</option>
            <option value="short">\u77ed\u89c6\u9891\u5236\u4f5c</option>
            <option value="audio">\u97f3\u6548\u8bbe\u8ba1</option>
            <option value="other">\u5176\u4ed6</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-bold mb-2">\u9879\u76ee\u63cf\u8ff0 *</label>
          <textarea v-model="form.description" required rows="4" class="w-full p-3 border rounded-lg" placeholder="\u8bf7\u63cf\u8ff0\u60a8\u7684\u9879\u76ee\u9700\u6c42"></textarea>
        </div>

        <div>
          <button type="submit" :disabled="submitting" class="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 disabled:opacity-50">
            {{ submitting ? '\u63d0\u4ea4\u4e2d...' : '\u63d0\u4ea4\u9884\u7ea6' }}
          </button>
        </div>

        <p v-if="error" class="text-red-500 text-center">{{ error }}</p>
      </form>

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
  serviceType: '',
  description: ''
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
    error.value = e.statusMessage || '\u63d0\u4ea4\u5931\u8d25'
  } finally {
    submitting.value = false
  }
}
</script>
'''

with codecs.open(r'D:\Git\zpj\app\pages\booking\form.vue', 'w', 'utf-8') as f:
    f.write(simple_form)

print("Created simple form page")
