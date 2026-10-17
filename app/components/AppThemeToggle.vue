<template>
  <!-- Floating Left-Center Vertical Theme Controller -->
  <aside
    class="fixed left-3 sm:left-5 top-1/2 -translate-y-1/2 z-50 select-none group"
    aria-label="深浅色模式切换器"
  >
    <!-- Main Floating Capsule Container (Only Sun & Moon Switch Buttons) -->
    <div
      class="relative flex flex-col items-center p-1.5 rounded-full backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-[0_12px_36px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_44px_rgba(217,119,6,0.24)] hover:scale-105 active:scale-95"
      :class="isDark
        ? 'bg-[#12141c]/92 border border-amber-500/30 text-amber-100'
        : 'bg-white/92 border border-amber-800/15 text-slate-800'"
      style="box-shadow: var(--glass-shadow-lg);"
    >
      <!-- Subtle Ambient Hover Glow -->
      <div
        class="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-md"
        :style="{
          background: isDark
            ? 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(180,83,9,0.18) 0%, transparent 70%)'
        }"
      />

      <!-- Toggle Button (Sun: Light Mode / Auto Device) -->
      <button
        type="button"
        @click="handleSunClick"
        :aria-pressed="!isDark"
        class="relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10 cursor-pointer"
        :class="!isDark
          ? 'text-amber-800 font-bold'
          : 'text-slate-400 hover:text-amber-200'"
        :title="isAutoDevice && !isDark ? '当前已根据设备自动设为浅色（点击手动锁定）' : '切换为浅色暖亚麻模式（再次点击恢复跟随设备）'"
      >
        <!-- Sun Icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="w-4 h-4 transition-transform duration-500"
          :class="!isDark ? 'scale-110 rotate-90 text-amber-600' : 'scale-90'"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      </button>

      <!-- Toggle Button (Moon: Dark Mode / Auto Device) -->
      <button
        type="button"
        @click="handleMoonClick"
        :aria-pressed="isDark"
        class="relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10 cursor-pointer mt-1"
        :class="isDark
          ? 'text-amber-300 font-bold'
          : 'text-slate-400 hover:text-slate-800'"
        :title="isAutoDevice && isDark ? '当前已根据设备自动设为深色（点击手动锁定）' : '切换为深色胶片模式（再次点击恢复跟随设备）'"
      >
        <!-- Moon Icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="w-4 h-4 transition-transform duration-500"
          :class="isDark ? 'scale-110 text-amber-400 fill-amber-400/20' : 'scale-90'"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </button>

      <!-- Active Sliding Magnetic Indicator Pill -->
      <div
        class="absolute w-8 h-8 rounded-full pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-sm border"
        :style="{
          top: isDark ? '42px' : '6px',
          background: isDark
            ? 'linear-gradient(135deg, rgba(245,158,11,0.22), rgba(217,119,6,0.12))'
            : 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(254,243,199,0.85))',
          borderColor: isDark ? 'rgba(245,158,11,0.45)' : 'rgba(217,119,6,0.35)',
          boxShadow: isDark
            ? '0 0 14px rgba(245,158,11,0.35), inset 0 1px 0 rgba(255,255,255,0.15)'
            : '0 4px 12px rgba(180,83,9,0.18), inset 0 1px 0 #ffffff'
        }"
      >
        <!-- Device Auto mode indicator beacon -->
        <span
          v-if="isAutoDevice"
          class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-white/60 animate-pulse"
          title="自动跟随设备中"
        />
      </div>
    </div>

    <!-- Luxurious Floating Tooltip on Hover (Expanding to the right) -->
    <div
      class="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] whitespace-nowrap z-50"
    >
      <div
        class="px-3.5 py-2 rounded-xl backdrop-blur-2xl border shadow-xl flex items-center gap-2"
        :class="isDark
          ? 'bg-[#161822]/95 border-amber-500/30 text-white shadow-[0_12px_32px_rgba(0,0,0,0.5)]'
          : 'bg-white/95 border-amber-800/15 text-slate-900 shadow-[0_12px_32px_rgba(180,83,9,0.15)]'"
      >
        <span
          class="w-1.5 h-1.5 rounded-full flex-shrink-0"
          :class="isAutoDevice ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'"
        />
        <div class="flex flex-col text-left">
          <span class="text-xs font-bold font-sans">
            {{ isAutoDevice ? `自动跟随设备模式 (${isDark ? '深色' : '浅色'})` : `手动固定: ${isDark ? '深色' : '浅色'}` }}
          </span>
          <span class="text-[9px] font-mono text-slate-400 mt-0.5">
            {{ isAutoDevice ? '已实时对齐对方系统/手机设置' : '点击当前高亮项可恢复自动跟随' }}
          </span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeMode } from '~/composables/useThemeMode'

const {
  isDark,
  isAutoDevice,
  initTheme,
  setTheme,
  resetToAutoDevice
} = useThemeMode()

function handleSunClick() {
  if (!isDark.value && !isAutoDevice.value) {
    // Already in manual light mode -> revert to auto device!
    resetToAutoDevice()
  } else {
    setTheme('light')
  }
}

function handleMoonClick() {
  if (isDark.value && !isAutoDevice.value) {
    // Already in manual dark mode -> revert to auto device!
    resetToAutoDevice()
  } else {
    setTheme('dark')
  }
}

onMounted(() => {
  initTheme()
})
</script>
