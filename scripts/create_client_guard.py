# -*- coding: utf-8 -*-
import codecs

# Create a new component for client token guard
component_content = '''<template>
  <div class="glass-card p-6 space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="w-3 h-3 rounded-full" :class="clientSession.loggedIn ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'" />
        <div>
          <h3 class="font-display font-bold text-base text-[#121316]">\U0001f510 \u7528\u6237 Token \u4f1a\u8bdd\u5b88\u536b</h3>
          <p class="text-[10px] text-slate-400 font-mono">Client Session Guard</p>
        </div>
      </div>
      <span class="text-[10px] font-mono font-bold px-3 py-1.5 rounded-full" 
        :class="clientSession.loggedIn ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-700 border border-rose-500/20'">
        {{ clientSession.loggedIn ? 'ACTIVE' : 'INACTIVE' }}
      </span>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="p-3 rounded-xl bg-black/[0.02] border border-black/[0.04]">
        <span class="text-[9px] font-mono text-slate-400 block uppercase font-bold">\u5012\u8ba1\u65f6</span>
        <span class="font-display font-bold text-2xl text-[#121316] font-mono">{{ formatCountdown }}</span>
      </div>
      <div class="p-3 rounded-xl bg-black/[0.02] border border-black/[0.04]">
        <span class="text-[9px] font-mono text-slate-400 block uppercase font-bold">\u7528\u6237\u4fe1\u606f</span>
        <span class="font-display font-bold text-sm text-[#121316] block mt-1">
          {{ clientSession.loggedIn ? clientSession.username : '\u672a\u767b\u5f55' }}
        </span>
        <span class="text-[10px] text-slate-400 block mt-0.5">
          {{ clientSession.loggedIn ? `\u521b\u5efa\u4e8e ${formatTime(clientSession.createdAt)}` : '\u9700\u8981\u524d\u7aef\u767b\u5f55' }}
        </span>
      </div>
    </div>

    <div class="flex items-center justify-between pt-2 border-t border-black/[0.04]">
      <span class="text-[10px] text-slate-400">
        {{ clientSession.loggedIn ? `\u8fc7\u671f\u65f6\u95f4: ${formatTime(clientSession.expiresAt)}` : '\u8bf7\u5728\u524d\u7aef\u767b\u5f55\u4ee5\u6fc0\u6d3b\u4f1a\u8bdd' }}
      </span>
      <span class="text-[10px] font-mono" :class="clientSession.loggedIn ? 'text-emerald-600' : 'text-rose-500'">
        {{ clientSession.loggedIn ? `\u5269\u4f59 ${formatCountdown}` : '\u4f1a\u8bdd\u5df2\u8fc7\u671f' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const clientSession = ref({
  loggedIn: false,
  username: '',
  createdAt: 0,
  expiresAt: 0,
  remainingSeconds: 0
})

let countdownTimer: ReturnType<typeof setInterval> | null = null

const formatCountdown = computed(() => {
  const sec = Math.max(0, clientSession.value.remainingSeconds || 0)
  const h = Math.floor(sec / 3600).toString().padStart(2, '0')
  const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
})

const formatTime = (timestamp: number) => {
  if (!timestamp) return '--'
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const refreshSession = async () => {
  try {
    const res = await $fetch<any>('/api/auth/client-me')
    if (res?.loggedIn) {
      clientSession.value = {
        loggedIn: true,
        username: res.username || '',
        createdAt: res.createdAt || 0,
        expiresAt: res.expiresAt || 0,
        remainingSeconds: res.remainingSeconds || 0
      }
    } else {
      clientSession.value = { loggedIn: false, username: '', createdAt: 0, expiresAt: 0, remainingSeconds: 0 }
    }
  } catch {
    clientSession.value = { loggedIn: false, username: '', createdAt: 0, expiresAt: 0, remainingSeconds: 0 }
  }
}

const tickCountdown = () => {
  if (clientSession.value.loggedIn) {
    clientSession.value.remainingSeconds = Math.max(0, (clientSession.value.remainingSeconds || 0) - 1)
    if (clientSession.value.remainingSeconds === 0) {
      refreshSession()
    }
  }
}

onMounted(() => {
  refreshSession()
  countdownTimer = setInterval(tickCountdown, 1000)
})

onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>
'''

with codecs.open(r'D:\Git\zpj\app\components\ClientTokenGuard.vue', 'w', 'utf-8') as f:
    f.write(component_content)

print("Created ClientTokenGuard.vue")
