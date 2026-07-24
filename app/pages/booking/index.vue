<template>
  <div class="min-h-screen pt-28 pb-24 px-6">
    <div class="max-w-4xl mx-auto">
      
      <div class="mb-8">
        <NuxtLink to="/" class="text-amber-600 hover:text-amber-700">← 返回首页</NuxtLink>
      </div>

      <h1 class="text-3xl font-bold mb-6">合作预约</h1>
      
      <p class="text-lg text-gray-600 mb-8">期待与您的合作！</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="p-6 border rounded-lg">
          <h3 class="font-bold text-lg mb-2">🎬 商业TVC广告</h3>
          <p class="text-gray-600">专业的商业广告拍摄与后期制作</p>
        </div>
        <div class="p-6 border rounded-lg">
          <h3 class="font-bold text-lg mb-2">🎨 电影调色</h3>
          <p class="text-gray-600">DaVinci Resolve专业调色</p>
        </div>
        <div class="p-6 border rounded-lg">
          <h3 class="font-bold text-lg mb-2">📹 短视频制作</h3>
          <p class="text-gray-600">TikTok、抖音等平台短视频</p>
        </div>
        <div class="p-6 border rounded-lg">
          <h3 class="font-bold text-lg mb-2">🎵 音效设计</h3>
          <p class="text-gray-600">专业音频后期处理</p>
        </div>
      </div>

      <div class="text-center">
        <NuxtLink to="/booking/form" class="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700">
          立即预约
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '合作预约 - XO Studio'
})
</script>
