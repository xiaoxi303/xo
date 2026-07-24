<template>
  <div class="glass-card p-6 space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="w-3 h-3 rounded-full" :class="clientSession.loggedIn ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'" />
        <div>
          <h3 class="font-display font-bold text-base text-[#121316]">🔐 用户 Token 会话守卫</h3>
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
        <span class="text-[9px] font-mono text-slate-400 block uppercase font-bold">倒计时</span>
        <span class="font-display font-bold text-2xl text-[#121316] font-mono">{{ formatCountdown }}</span>
      </div>
      <div class="p-3 rounded-xl bg-black/[0.02] border border-black/[0.04]">
        <span class="text-[9px] font-mono text-slate-400 block uppercase font-bold">用户信息</span>
        <span class="font-display font-bold text-sm text-[#121316] block mt-1">
          {{ clientSession.loggedIn ? clientSession.username : '未登录' }}
        </span>
        <span class="text-[10px] text-slate-400 block mt-0.5">
          {{ clientSession.loggedIn ? `创建于 ${formatTime(clientSession.createdAt)}` : '需要前端登录' }}
        </span>
      </div>
    </div>

    <div class="flex items-center justify-between pt-2 border-t border-black/[0.04]">
      <span class="text-[10px] text-slate-400">
        {{ clientSession.loggedIn ? `过期时间: ${formatTime(clientSession.expiresAt)}` : '请在前端登录以激活会话' }}
      </span>
      <span class="text-[10px] font-mono" :class="clientSession.loggedIn ? 'text-emerald-600' : 'text-rose-500'">
        {{ clientSession.loggedIn ? `剩余 ${formatCountdown}` : '会话已过期' }}
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
