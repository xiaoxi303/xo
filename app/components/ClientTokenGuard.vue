<template>
  <div class="glass-card p-6 space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="w-3 h-3 rounded-full" :class="sessions.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'" />
        <div>
          <h3 class="font-display font-bold text-base text-[#121316]">🔐 用户 Token 会话守卫</h3>
          <p class="text-[10px] text-slate-400 font-mono">Client Session Guard</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-[10px] font-mono font-bold px-3 py-1.5 rounded-full" 
          :class="sessions.length > 0 ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' : 'bg-slate-100 text-slate-500 border border-slate-200'">
          {{ sessions.length }} 个活跃会话
        </span>
      </div>
    </div>

    <!-- No active sessions -->
    <div v-if="sessions.length === 0" class="text-center py-6">
      <span class="text-4xl">🔒</span>
      <p class="text-sm text-slate-400 mt-2">当前无活跃用户会话</p>
      <p class="text-[10px] text-slate-300 mt-1">用户登录后将在此显示</p>
    </div>

    <!-- Active sessions list -->
    <div v-else class="space-y-3">
      <div v-for="sess in sessions" :key="sess.token" 
        class="p-4 rounded-xl bg-black/[0.02] border border-black/[0.04] hover:border-emerald-500/20 transition-all">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <span class="text-sm">👤</span>
            </div>
            <div>
              <span class="font-display font-bold text-sm text-[#121316]">{{ sess.username }}</span>
              <span class="text-[10px] text-slate-400 block">会话: {{ sess.token }}</span>
            </div>
          </div>
          <div class="text-right">
            <span class="font-display font-bold text-lg text-[#121316] font-mono">{{ formatCountdown(sess.remainingSeconds) }}</span>
            <span class="text-[10px] text-slate-400 block">剩余时间</span>
          </div>
        </div>
        <div class="flex items-center justify-between mt-3 pt-3 border-t border-black/[0.04]">
          <span class="text-[10px] text-slate-400">
            登录: {{ formatTime(sess.createdAt) }}
          </span>
          <span class="text-[10px] text-slate-400">
            过期: {{ formatTime(sess.expiresAt) }}
          </span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded" 
            :class="sess.remainingSeconds > 3600 ? 'bg-emerald-500/10 text-emerald-600' : (sess.remainingSeconds > 600 ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600')">
            {{ sess.remainingSeconds > 3600 ? '🟢 正常' : (sess.remainingSeconds > 600 ? '🟡 即将过期' : '🔴 即将失效') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div v-if="sessions.length > 0" class="flex items-center justify-between pt-2 border-t border-black/[0.04]">
      <span class="text-[10px] text-slate-400">
        共 {{ sessions.length }} 个用户已登录，倒计时结束后自动清除
      </span>
      <span class="text-[10px] font-mono text-emerald-600">
        🟢 LIVE
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SessionInfo {
  token: string
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
  sessions.value = sessions.value
    .map(s => ({
      ...s,
      remainingSeconds: Math.max(0, s.remainingSeconds - 1)
    }))
    .filter(s => s.remainingSeconds > 0)  // Remove expired sessions
}

onMounted(() => {
  refreshSessions()
  refreshTimer = setInterval(refreshSessions, 30000)  // Refresh every 30s
  countdownTimer = setInterval(tickCountdown, 1000)     // Tick every second
})

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer)
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>
