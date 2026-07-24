<template>
  <div class="glass-card p-8 space-y-6 my-6">
    <div class="flex items-center justify-between border-b pb-4 border-black/[0.06]">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full" :class="session.loggedIn ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'" />
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-display font-bold text-lg text-[#121316]">安全网关阻断日志与防撞库大屏 (Security Gateway Map)</h3>
            <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 border border-purple-500/20">
              Real Session Guard
            </span>
          </div>
          <p class="text-xs text-slate-400 font-mono mt-0.5">Realtime API Interception & Admin Token Sentinel</p>
        </div>
      </div>
      <span class="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
        REALTIME LIVE FEED
      </span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 pb-2">
      <div class="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.04]">
        <span class="text-[9px] font-mono text-slate-400 block uppercase font-bold">拦截非法请求</span>
        <span class="font-display font-bold text-xl text-emerald-600">{{ totalBlocked }} 次</span>
      </div>
      <div class="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.04]">
        <span class="text-[9px] font-mono text-slate-400 block uppercase font-bold">Token 会话守卫</span>
        <span class="font-display font-bold text-xl text-[#121316] font-mono">{{ formatTokenCountdown }}</span>
        <span class="block text-[10px] mt-1" :class="session.loggedIn ? 'text-emerald-600' : 'text-rose-500'">
          {{ session.loggedIn ? `用户 ${session.username} 已登录` : '未登录或已过期，需要重新登录' }}
        </span>
      </div>
      <div class="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
        <span class="text-[9px] font-mono text-purple-900 block uppercase font-bold">风险评估</span>
        <span class="font-display font-bold text-sm text-purple-900 block mt-1">
          {{ totalBlocked === 0 ? '当前无真实拦截事件' : `${totalBlocked} 条真实拦截记录` }}
        </span>
      </div>
      <div class="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.04]">
        <span class="text-[9px] font-mono text-slate-400 block uppercase font-bold">安全日志存储</span>
        <span class="font-display font-bold text-xs text-emerald-600 block mt-1">{{ diskStatus }}</span>
      </div>
    </div>

    <div class="overflow-x-auto rounded-2xl border border-black/[0.05]">
      <table class="w-full text-left text-xs font-mono border-collapse">
        <thead>
          <tr class="bg-black/[0.02] text-[9px] uppercase text-slate-400 border-b border-black/[0.05]">
            <th class="py-3 px-4">防护类型</th>
            <th class="py-3 px-4">终端 IP</th>
            <th class="py-3 px-4">处置动作 / 触发策略</th>
            <th class="py-3 px-4">时间</th>
            <th class="py-3 px-4 text-right">状态</th>
          </tr>
        </thead>
        <tbody v-if="liveLogs.length" class="divide-y divide-black/[0.04] text-[11px]">
          <tr v-for="log in liveLogs" :key="log.id" class="hover:bg-black/[0.01] transition-all">
            <td class="py-3.5 px-4 font-bold text-[#121316] flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(log.status)" />
              <span>{{ log.type }}</span>
            </td>
            <td class="py-3.5 px-4 text-slate-500">{{ log.ip }}</td>
            <td class="py-3.5 px-4 text-slate-600">{{ log.action }}</td>
            <td class="py-3.5 px-4 text-slate-400">{{ formatRelativeTime(log.timestamp) }}</td>
            <td class="py-3.5 px-4 text-right font-bold">{{ statusLabel(log.status) }}</td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="5" class="py-8 px-4 text-center text-slate-400 text-xs">
              暂无真实安全事件。登录失败、Token 过期访问、未授权修改等行为发生后会实时推送到这里。
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
type SecurityLog = {
  id: string
  type: string
  ip: string
  action: string
  timestamp: number
  status: 'blocked' | 'success' | 'warning'
}

const totalBlocked = ref(0)
const diskStatus = ref('读取中...')
const liveLogs = ref<SecurityLog[]>([])
const session = ref({
  loggedIn: false,
  username: '',
  createdAt: 0,
  expiresAt: 0,
  remainingSeconds: 0
})

const currentRemainingSec = ref(0)

const formatTokenCountdown = computed(() => {
  const sec = Math.max(0, currentRemainingSec.value)
  const h = Math.floor(sec / 3600).toString().padStart(2, '0')
  const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
})

let countdownTimer: ReturnType<typeof setInterval> | null = null
let refreshTimer: ReturnType<typeof setInterval> | null = null
let eventSource: EventSource | null = null

const refreshSecurityState = async () => {
  try {
    const res = await $fetch<any>('/api/admin/security-logs')
    if (!res?.success) return

    session.value = res.session
    currentRemainingSec.value = res.session?.remainingSeconds || 0
    totalBlocked.value = res.totalBlocked || 0
    diskStatus.value = res.diskStatus || '暂无安全日志文件'
    liveLogs.value = Array.isArray(res.logs) ? res.logs : []
  } catch {
    session.value = { loggedIn: false, username: '', createdAt: 0, expiresAt: 0, remainingSeconds: 0 }
    currentRemainingSec.value = 0
  }
}

const tickCountdown = () => {
  currentRemainingSec.value = Math.max(0, currentRemainingSec.value - 1)
  if (currentRemainingSec.value === 0 && session.value.loggedIn) {
    refreshSecurityState()
  }
}

const formatRelativeTime = (timestamp: number) => {
  const diff = Math.max(0, Math.floor((Date.now() - Number(timestamp || 0)) / 1000))
  if (diff < 10) return '刚刚'
  if (diff < 60) return `${diff} 秒前`
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  return new Date(timestamp).toLocaleString()
}

const statusLabel = (status: SecurityLog['status']) => {
  if (status === 'blocked') return '已拦截'
  if (status === 'success') return '安全授权'
  return '警告'
}

const statusDotClass = (status: SecurityLog['status']) => {
  if (status === 'blocked') return 'bg-rose-500'
  if (status === 'success') return 'bg-emerald-500'
  return 'bg-amber-500'
}

onMounted(() => {
  refreshSecurityState()
  countdownTimer = setInterval(tickCountdown, 1000)
  refreshTimer = setInterval(refreshSecurityState, 30000)

  eventSource = new EventSource('/api/analytics/stream')
  eventSource.addEventListener('update', refreshSecurityState)
})

onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer)
  if (refreshTimer) clearInterval(refreshTimer)
  eventSource?.close()
})
</script>
