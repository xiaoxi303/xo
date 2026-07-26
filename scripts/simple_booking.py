# -*- coding: utf-8 -*-
import codecs

# Create a simple test booking page
simple_content = '''<template>
  <div class="min-h-screen pt-28 pb-24 px-6">
    <div class="max-w-4xl mx-auto">
      
      <div class="mb-8">
        <NuxtLink to="/" class="text-amber-600 hover:text-amber-700">\u2190 \u8fd4\u56de\u9996\u9875</NuxtLink>
      </div>

      <h1 class="text-3xl font-bold mb-6">\u5408\u4f5c\u9884\u7ea6</h1>
      
      <p class="text-lg text-gray-600 mb-8">\u671f\u5f85\u4e0e\u60a8\u7684\u5408\u4f5c\uff01</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="p-6 border rounded-lg">
          <h3 class="font-bold text-lg mb-2">\U0001f3ac \u5546\u4e1aTVC\u5e7f\u544a</h3>
          <p class="text-gray-600">\u4e13\u4e1a\u7684\u5546\u4e1a\u5e7f\u544a\u62cd\u6444\u4e0e\u540e\u671f\u5236\u4f5c</p>
        </div>
        <div class="p-6 border rounded-lg">
          <h3 class="font-bold text-lg mb-2">\U0001f3a8 \u7535\u5f71\u8c03\u8272</h3>
          <p class="text-gray-600">DaVinci Resolve\u4e13\u4e1a\u8c03\u8272</p>
        </div>
        <div class="p-6 border rounded-lg">
          <h3 class="font-bold text-lg mb-2">\U0001f4f9 \u77ed\u89c6\u9891\u5236\u4f5c</h3>
          <p class="text-gray-600">TikTok\u3001\u6296\u97f3\u7b49\u5e73\u53f0\u77ed\u89c6\u9891</p>
        </div>
        <div class="p-6 border rounded-lg">
          <h3 class="font-bold text-lg mb-2">\U0001f3b5 \u97f3\u6548\u8bbe\u8ba1</h3>
          <p class="text-gray-600">\u4e13\u4e1a\u97f3\u9891\u540e\u671f\u5904\u7406</p>
        </div>
      </div>

      <div class="text-center">
        <NuxtLink to="/booking/form" class="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700">
          \u7acb\u5373\u9884\u7ea6
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '\u5408\u4f5c\u9884\u7ea6 - XO Studio'
})
</script>
'''

with codecs.open(r'D:\Git\zpj\app\pages\booking\index.vue', 'w', 'utf-8') as f:
    f.write(simple_content)

print("Created simple booking page")
