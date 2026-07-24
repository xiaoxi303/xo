<template>
  <div class="min-h-screen pt-28 pb-24 px-6">
    <div class="max-w-2xl mx-auto">
      
      <div class="mb-8">
        <NuxtLink to="/booking" class="text-amber-600 hover:text-amber-700">← 返回预约说明</NuxtLink>
      </div>

      <h1 class="text-3xl font-bold mb-6">合作预约表单</h1>

      <div v-if="submitted" class="p-8 border rounded-lg bg-green-50 text-center">
        <p class="text-2xl mb-4">✅</p>
        <p class="text-lg font-bold text-green-700">预约提交成功！</p>
        <p class="text-green-600 mt-2">我们会在24小时内与您联系</p>
        <NuxtLink to="/" class="inline-block mt-4 text-amber-600">返回首页</NuxtLink>
      </div>

      <form v-else @submit.prevent="submitForm" class="space-y-6">
        <div>
          <label class="block text-sm font-bold mb-2">姓名 *</label>
          <input v-model="form.name" type="text" required class="w-full p-3 border rounded-lg" placeholder="请输入您的姓名" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold mb-2">电话 *</label>
            <input v-model="form.phone" type="tel" required class="w-full p-3 border rounded-lg" placeholder="手机号码" />
          </div>
          <div>
            <label class="block text-sm font-bold mb-2">邮箱 *</label>
            <input v-model="form.email" type="email" required class="w-full p-3 border rounded-lg" placeholder="your@email.com" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold mb-2">服务类型 *</label>
          <select v-model="form.serviceType" required class="w-full p-3 border rounded-lg">
            <option value="">请选择</option>
            <option value="tvc">商业TVC广告</option>
            <option value="color">电影调色</option>
            <option value="short">短视频制作</option>
            <option value="audio">音效设计</option>
            <option value="other">其他</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-bold mb-2">项目描述 *</label>
          <textarea v-model="form.description" required rows="4" class="w-full p-3 border rounded-lg" placeholder="请描述您的项目需求"></textarea>
        </div>

        <div>
          <button type="submit" :disabled="submitting" class="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 disabled:opacity-50">
            {{ submitting ? '提交中...' : '提交预约' }}
          </button>
        </div>

        <p v-if="error" class="text-red-500 text-center">{{ error }}</p>
      </form>

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
    error.value = e.statusMessage || '提交失败'
  } finally {
    submitting.value = false
  }
}
</script>
