<template>
  <div class="min-h-screen flex items-center justify-center p-6 text-center">
    <div class="space-y-4">
      <div class="w-12 h-12 rounded-full bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center mx-auto text-xl animate-spin">
        ⏳
      </div>
      <p class="text-sm font-bold text-slate-700 dark:text-slate-300">分类与标签管理已整合进主管理后台，正在跳转...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
onMounted(() => {
  navigateTo('/admin')
})
</script>
