# -*- coding: utf-8 -*-
import codecs

# Update ClientTokenGuard to force logout expired sessions
component_content = '''<template>
  <div class="glass-card p-6 space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="w-3 h-3 rounded-full" :class="sessions.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'" />
        <div>
          <h3 class="font-display font-bold text-base text-[#121316]">\U0001f510 \u7528\u6237 Token \u4f1a\u8bdd\u5b88\u536b</h3>
          <p class="text-[10px] text-slate-400 font-mono">Client Session Guard</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-[10px] font-mono font-bold px-3 py-1.5 rounded-full" 
          :class="sessions.length > 0 ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' : 'bg-slate-100 text-slate-500 border border-slate-200'">
          {{ sessions.length }} \u4e2a\u6d3b\u8dc3\u4f1a\u8bdd
        </span>
      </div>
    </div>

    <!-- No active sessions -->
    <div v-if="sessions.length === 0" class="text-center py-6">
      <span class="text-4xl">\U0001f512</span>
      <p class="text-sm text-slate-400 mt-2">\u5f53\u524d\u65e0\u6d3b\u8dc3\u7528\u6237\u4f1a\u8bdd</p>
      <p class="text-[10px] text-slate-300 mt-1">\u7528\u6237\u767b\u5f55\u540e\u5c06\u5728\u6b64\u663e\u793a</p>
    </div>

    <!-- Active sessions list -->
    <div v-else class="space-y-3">
      <div v-for="sess in sessions" :key="sess.token" 
        class="p-4 rounded-xl bg-black/[0.02] border border-black/[0.04] hover:border-emerald-500/20 transition-all">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <span class="text-sm">\U0001f464</span>
            </div>
            <div>
              <span class="font-display font-bold text-sm text-[#121316]">{{ sess.username }}</span>
              <span class="text-[10px] text-slate-400 block">\u4f1a\u8bdd: {{ sess.token }}</span>
            </div>
          </div>
          <div class="text-right">
            <span class="font-display font-bold text-lg text-[#121316] font-mono">{{ formatCountdown(sess.remainingSeconds) }}</span>
            <span class="text-[10px] text-slate-400 block">\u5269\u4f59\u65f6\u95f4</span>
          </div>
        </div>
        <div class="flex items-center justify-between mt-3 pt-3 border-t border-black/[0.04]">
          <span class="text-[10px] text-slate-400">
            \u767b\u5f55: {{ formatTime(sess.createdAt) }}
          </span>
          <span class="text-[10px] text-slate-400">
            \u8fc7\u671f: {{ formatTime(sess.expiresAt) }}
          </span>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-mono px-2 py-0.5 rounded" 
              :class="sess.remainingSeconds > 3600 ? 'bg-emerald-500/10 text-emerald-600' : (sess.remainingSeconds > 600 ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600')">
              {{ sess.remainingSeconds > 3600 ? '\U0001f7e2 \u6b63\u5e38' : (sess.remainingSeconds > 600 ? '\U0001f7e1 \u5373\u5c06\u8fc7\u671f' : '\U0001f534 \u5373\u5c06\u5931\u6548') }}
            </span>
            <button @click="forceLogout(sess.fullToken)" 
              class="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500/20">
              \u5f3a\u5236\u767b\u51fa
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div v-if="sessions.length > 0" class="flex items-center justify-between pt-2 border-t border-black/[0.04]">
      <span class="text-[10px] text-slate-400">
        \u5171 {{ sessions.length }} \u4e2a\u7528\u6237\u5df2\u767b\u5f55\uff0c\u5012\u8ba1\u65f6\u7ed3\u675f\u540e\u81ea\u52a8\u5f3a\u5236\u767b\u51fa
      </span>
      <span class="text-[10px] font-mono text-emerald-600">
        \U0001f7e2 LIVE
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SessionInfo {
  token: string
  fullToken: string
  username: string
  createdAt: number
  expiresAt: number
  remainingSeconds: number
}

const sessions = ref<SessionInfo[]>([])
let refreshTimer: ReturnType<typeof setInterval> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null

const formatCountdown = (seconds: number) => {
  const sec = Math.max(0, seconds)
  const h = Math.floor(sec / 3600).toString().padStart(2, '0')
  const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

const formatTime = (timestamp: number) => {
  if (!timestamp) return '--'
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const forceLogout = async (token: string) => {
  if (!confirm('\u786e\u8ba4\u5f3a\u5236\u767b\u51fa\u8be5\u7528\u6237\uff1f')) return
  try {
    await $fetch('/api/admin/active-sessions', { 
      method: 'DELETE', 
      body: { token } 
    })
    await refreshSessions()
  } catch (e) {
    alert('\u64cd\u4f5c\u5931\u8d25')
  }
}

const refreshSessions = async () => {
  try {
    const res = await $fetch<any>('/api/admin/active-sessions')
    if (res?.success && Array.isArray(res.sessions)) {
      sessions.value = res.sessions
    } else {
      sessions.value = []
    }
  } catch {
    sessions.value = []
  }
}

const tickCountdown = () => {
  const expiredTokens: string[] = []
  
  sessions.value = sessions.value
    .map(s => {
      const newRemaining = Math.max(0, s.remainingSeconds - 1)
      if (newRemaining === 0) {
        expiredTokens.push(s.fullToken)
      }
      return {
        ...s,
        remainingSeconds: newRemaining
      }
    })
    .filter(s => s.remainingSeconds > 0)
  
  // Force logout expired sessions
  if (expiredTokens.length > 0) {
    for (const token of expiredTokens) {
      $fetch('/api/admin/active-sessions', { 
        method: 'DELETE', 
        body: { token } 
      }).catch(() => {})
    }
  }
}

onMounted(() => {
  refreshSessions()
  refreshTimer = setInterval(refreshSessions, 30000)
  countdownTimer = setInterval(tickCountdown, 1000)
})

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer)
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>
'''

with codecs.open(r'D:\Git\zpj\app\components\ClientTokenGuard.vue', 'w', 'utf-8') as f:
    f.write(component_content)

print("Updated ClientTokenGuard.vue")
