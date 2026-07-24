# -*- coding: utf-8 -*-
import codecs

# Simplify booking page - remove reveal class and ensure content shows
new_content = '''<template>
  <div class="min-h-screen pt-28 pb-24 px-6">
    <div class="max-w-4xl mx-auto space-y-12">
      
      <!-- Back button -->
      <div>
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm py-2 px-4 rounded-lg hover:bg-black/5 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"/>
          </svg>
          返回首页
        </NuxtLink>
      </div>

      <!-- Hero Section -->
      <div class="text-center space-y-6">
        <span class="text-6xl">\U0001f4c5</span>
        <h1 class="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
          \u5408\u4f5c\u9884\u7ea6
        </h1>
        <p class="text-lg text-slate-500 max-w-2xl mx-auto">
          \u671f\u5f85\u4e0e\u60a8\u7684\u5408\u4f5c\uff01\u65e0\u8bba\u662f\u5546\u4e1aTVC\u3001\u7535\u5f71\u8c03\u8272\u3001\u77ed\u89c6\u9891\u5236\u4f5c\u8fd8\u662f\u5176\u4ed6\u89c6\u89c9\u9879\u76ee\uff0c\u90fd\u6b22\u8fce\u9884\u7ea6\u54a8\u8be2\u3002
        </p>
      </div>

      <!-- Services Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-8 space-y-4 rounded-3xl border-2 border-black/10 bg-white shadow-sm">
          <span class="text-3xl">\U0001f3ac</span>
          <h3 class="text-xl font-bold text-slate-900">\u5546\u4e1aTVC\u5e7f\u544a</h3>
          <p class="text-sm text-slate-500 leading-relaxed">
            \u4e13\u4e1a\u7684\u5546\u4e1a\u5e7f\u544a\u62cd\u6444\u4e0e\u540e\u671f\u5236\u4f5c\uff0c\u6db5\u76d6\u4ea7\u54c1\u5ba3\u4f20\u7247\u3001\u54c1\u724c\u6545\u4e8b\u7247\u3001\u793e\u4ea4\u5a92\u4f53\u5e7f\u544a\u7b49\u3002
          </p>
          <ul class="space-y-2 text-sm text-slate-600">
            <li class="flex items-center gap-2"><span class="text-emerald-500">\u2713</span> 4K/8K\u8d85\u9ad8\u6e05\u62cd\u6444</li>
            <li class="flex items-center gap-2"><span class="text-emerald-500">\u2713</span> \u7535\u5f71\u7ea7\u8c03\u8272\u5904\u7406</li>
            <li class="flex items-center gap-2"><span class="text-emerald-500">\u2713</span> \u4e13\u4e1a\u97f3\u6548\u8bbe\u8ba1</li>
          </ul>
        </div>

        <div class="p-8 space-y-4 rounded-3xl border-2 border-black/10 bg-white shadow-sm">
          <span class="text-3xl">\U0001f3a8</span>
          <h3 class="text-xl font-bold text-slate-900">\u7535\u5f71/\u7eaa\u5f55\u7247\u8c03\u8272</h3>
          <p class="text-sm text-slate-500 leading-relaxed">
            DaVinci Resolve\u4e13\u4e1a\u8c03\u8272\uff0c\u652f\u6301ACES\u8272\u5f69\u7a7a\u95f4\u7ba1\u7406\uff0c\u6253\u9020\u7535\u5f71\u7ea7\u89c6\u89c9\u8d28\u611f\u3002
          </p>
          <ul class="space-y-2 text-sm text-slate-600">
            <li class="flex items-center gap-2"><span class="text-emerald-500">\u2713</span> ACEScct\u8272\u5f69\u7ba1\u7406</li>
            <li class="flex items-center gap-2"><span class="text-emerald-500">\u2713</span> HDR/SDR\u53cc\u7248\u672c\u4ea4\u4ed8</li>
            <li class="flex items-center gap-2"><span class="text-emerald-500">\u2713</span> \u80f6\u7247\u8d28\u611f\u8fd8\u539f</li>
          </ul>
        </div>

        <div class="p-8 space-y-4 rounded-3xl border-2 border-black/10 bg-white shadow-sm">
          <span class="text-3xl">\U0001f4f9</span>
          <h3 class="text-xl font-bold text-slate-900">\u77ed\u89c6\u9891\u5236\u4f5c</h3>
          <p class="text-sm text-slate-500 leading-relaxed">
            TikTok\u3001\u6296\u97f3\u3001\u5c0f\u7ea2\u4e66\u7b49\u5e73\u53f0\u77ed\u89c6\u9891\u5185\u5bb9\u7b56\u5212\u3001\u62cd\u6444\u4e0e\u540e\u671f\u5236\u4f5c\u3002
          </p>
          <ul class="space-y-2 text-sm text-slate-600">
            <li class="flex items-center gap-2"><span class="text-emerald-500">\u2713</span> \u7ad6\u5c4f/\u6a2a\u5c4f\u9002\u914d</li>
            <li class="flex items-center gap-2"><span class="text-emerald-500">\u2713</span> \u5feb\u8282\u594f\u526a\u8f91</li>
            <li class="flex items-center gap-2"><span class="text-emerald-500">\u2713</span> \u5e73\u53f0\u7b97\u6cd5\u4f18\u5316</li>
          </ul>
        </div>

        <div class="p-8 space-y-4 rounded-3xl border-2 border-black/10 bg-white shadow-sm">
          <span class="text-3xl">\U0001f3b5</span>
          <h3 class="text-xl font-bold text-slate-900">\u97f3\u6548/\u914d\u4e50\u8bbe\u8ba1</h3>
          <p class="text-sm text-slate-500 leading-relaxed">
            \u4e13\u4e1a\u7684\u97f3\u9891\u540e\u671f\u5904\u7406\uff0c\u5305\u62ec\u73af\u5883\u97f3\u8bbe\u8ba1\u3001\u914d\u4e50\u7f16\u66f2\u3001\u6df7\u97f3\u6bcd\u5e26\u7b49\u3002
          </p>
          <ul class="space-y-2 text-sm text-slate-600">
            <li class="flex items-center gap-2"><span class="text-emerald-500">\u2713</span> 24-bit/96kHz\u9ad8\u4fdd\u771f</li>
            <li class="flex items-center gap-2"><span class="text-emerald-500">\u2713</span> \u73af\u5883\u97f3\u7f16\u7ec7</li>
            <li class="flex items-center gap-2"><span class="text-emerald-500">\u2713</span> \u7248\u6743\u97f3\u4e50\u5e93</li>
          </ul>
        </div>
      </div>

      <!-- Process Section -->
      <div class="p-8 sm:p-12 space-y-8 rounded-3xl border-2 border-black/10 bg-white shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900 text-center">\u5408\u4f5c\u6d41\u7a0b</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="text-center space-y-3">
            <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-700 font-bold text-lg flex items-center justify-center mx-auto">1</div>
            <h4 class="font-bold text-slate-900">\u54a8\u8be2\u6c9f\u901a</h4>
            <p class="text-xs text-slate-500">\u4e86\u89e3\u9879\u76ee\u9700\u6c42\u3001\u9884\u7b97\u548c\u65f6\u95f4\u8282\u70b9</p>
          </div>
          <div class="text-center space-y-3">
            <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-700 font-bold text-lg flex items-center justify-center mx-auto">2</div>
            <h4 class="font-bold text-slate-900">\u65b9\u6848\u62a5\u4ef7</h4>
            <p class="text-xs text-slate-500">\u63d0\u4f9b\u8be6\u7ec6\u7684\u521b\u610f\u65b9\u6848\u548c\u62a5\u4ef7\u5355</p>
          </div>
          <div class="text-center space-y-3">
            <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-700 font-bold text-lg flex items-center justify-center mx-auto">3</div>
            <h4 class="font-bold text-slate-900">\u7b7e\u8ba2\u5408\u540c</h4>
            <p class="text-xs text-slate-500">\u786e\u8ba4\u5408\u4f5c\u7ec6\u8282\u5e76\u7b7e\u7f72\u6b63\u5f0f\u5408\u540c</p>
          </div>
          <div class="text-center space-y-3">
            <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-700 font-bold text-lg flex items-center justify-center mx-auto">4</div>
            <h4 class="font-bold text-slate-900">\u9879\u76ee\u4ea4\u4ed8</h4>
            <p class="text-xs text-slate-500">\u6309\u7ea6\u5b9a\u65f6\u95f4\u9ad8\u8d28\u91cf\u4ea4\u4ed8\u6210\u54c1</p>
          </div>
        </div>
      </div>

      <!-- CTA Button -->
      <div class="text-center space-y-4">
        <NuxtLink to="/booking/form" class="inline-flex items-center gap-2 py-4 px-8 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all bg-amber-600 text-white hover:bg-amber-700">
          <span>\U0001f4dd</span>
          \u7acb\u5373\u9884\u7ea6\u5408\u4f5c
        </NuxtLink>
        <p class="text-sm text-slate-400">\u586b\u5199\u9884\u7ea6\u8868\u5355\uff0c\u6211\u4eec\u4f1a\u572824\u5c0f\u65f6\u5185\u56de\u590d\u60a8</p>
      </div>

      <!-- FAQ Section -->
      <div class="p-8 sm:p-12 space-y-6 rounded-3xl border-2 border-black/10 bg-white shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900 text-center">\u5e38\u89c1\u95ee\u9898</h2>
        <div class="space-y-4">
          <div class="p-4 rounded-xl bg-slate-50">
            <h4 class="font-bold text-slate-900 mb-2">Q: \u6700\u4f4e\u8d77\u8ba2\u91cf\u662f\u591a\u5c11\uff1f</h4>
            <p class="text-sm text-slate-500">A: \u6211\u4eec\u63a5\u53d7\u5355\u6761\u89c6\u9891\u7684\u5408\u4f5c\uff0c\u6ca1\u6709\u6700\u4f4e\u8d77\u8ba2\u91cf\u9650\u5236\u3002</p>
          </div>
          <div class="p-4 rounded-xl bg-slate-50">
            <h4 class="font-bold text-slate-900 mb-2">Q: \u4ea4\u4ed8\u5468\u671f\u4e00\u822c\u591a\u4e45\uff1f</h4>
            <p class="text-sm text-slate-500">A: \u6839\u636e\u9879\u76ee\u590d\u6742\u5ea6\uff0c\u4e00\u822c3-15\u4e2a\u5de5\u4f5c\u65e5\u4e0d\u7b49\uff0c\u5177\u4f53\u4f1a\u5728\u5408\u540c\u4e2d\u7ea6\u5b9a\u3002</p>
          </div>
          <div class="p-4 rounded-xl bg-slate-50">
            <h4 class="font-bold text-slate-900 mb-2">Q: \u652f\u6301\u8fdc\u7a0b\u5408\u4f5c\u5417\uff1f</h4>
            <p class="text-sm text-slate-500">A: \u662f\u7684\uff0c\u6211\u4eec\u652f\u6301\u5168\u56fd\u8303\u56f4\u7684\u8fdc\u7a0b\u5408\u4f5c\uff0c\u901a\u8fc7\u7ebf\u4e0a\u6c9f\u901a\u5373\u53ef\u5b8c\u6210\u9879\u76ee\u3002</p>
          </div>
        </div>
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
    f.write(new_content)

print("Rewrote booking/index.vue with simpler classes")
