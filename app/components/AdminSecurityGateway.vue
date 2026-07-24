<template>
  <div class="glass-card p-8 space-y-6 my-6">
    <div class="flex items-center justify-between border-b pb-4 border-black/[0.06]">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full" :class="adminSession.loggedIn ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'" />
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-display font-bold text-lg text-[#121316]">安全网关阻断日志 (Security Gateway Map)</h3>
            <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 border border-purple-500/20">
              Real Session Guard
            </span>
          </div>
          <p class="text-xs text-slate-400 font-mono mt-0.5">Realtime API Interception & Admin Token Sentinel</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button @click="deleteAllLogs" class="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-700 border border-rose-500/20 hover:bg-rose-500/20">
          ✖ 清空日志
        </button>
        <span class="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
          REALTIME LIVE FEED
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 pb-2">
      <div class="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.04]">
        <span class="text-[9px] font-mono text-slate-400 block uppercase font-bold">拦截非法请求</span>
        <span class="font-display font-bold text-xl text-emerald-600">{{ totalBlocked }} 次</span>
      </div>
      <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
        <span class="text-[9px] font-mono text-amber-900 block uppercase font-bold">管理员 Token 会话守卫</span>
        <span class="font-display font-bold text-xl text-amber-900 font-mono">{{ formatAdminCountdown }}</span>
        <span class="block text-[10px] mt-1" :class="adminSession.loggedIn ? 'text-emerald-600' : 'text-rose-500'">
          {{ adminSession.loggedIn ? `管理员 ${adminSession.username} 已登录` : '管理员未登录或已过期' }}
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
            <th class="py-3 px-4">事件类型</th>
            <th class="py-3 px-4">终端 IP</th>
            <th class="py-3 px-4">详细信息</th>
            <th class="py-3 px-4">时间</th>
            <th class="py-3 px-4 text-right">状态</th>
          </tr>
        </thead>
        <tbody v-if="liveLogs.length" class="divide-y divide-black/[0.04] text-[11px]">
          <tr v-for="log in liveLogs" :key="log.id" class="hover:bg-black/[0.01] transition-all">
            <td class="py-3.5 px-4 font-bold text-[#121316] flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(log.status)" />
              <span>{{ formatEventType(log.type) }}</span>
            </td>
            <td class="py-3.5 px-4 text-slate-500 font-mono text-[10px]">{{ log.ip }}</td>
            <td class="py-3.5 px-4 text-slate-600">{{ formatEventAction(log.type, log.action) }}</td>
            <td class="py-3.5 px-4 text-slate-400">{{ formatRelativeTime(log.timestamp) }}</td>
            <td class="py-3.5 px-4 text-right font-bold flex items-center justify-end gap-2">
              {{ statusLabel(log.status) }}
              <button @click="deleteLog(log.id)" class="text-rose-400 hover:text-rose-600 text-[10px]" title="删除">✖</button>
            </td>
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


const adminSession = ref({
  loggedIn: false,
  username: '',
  createdAt: 0,
  expiresAt: 0,
  remainingSeconds: 0
})





const formatAdminCountdown = computed(() => {
  const sec = Math.max(0, adminSession.value.remainingSeconds || 0)
  const h = Math.floor(sec / 3600).toString().padStart(2, '0')
  const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
})

let countdownTimer: ReturnType<typeof setInterval> | null = null
let refreshTimer: ReturnType<typeof setInterval> | null = null
let eventSource: EventSource | null = null

const deleteLog = async (id: string) => {
  if (!confirm('确认删除这条安全日志吗？')) return
  try {
    await $fetch('/api/admin/security-logs', { method: 'DELETE', body: { id } })
    await refreshSecurityState()
  } catch (e) {
    alert('删除失败')
  }
}

const deleteAllLogs = async () => {
  if (!confirm('确认删除所有安全日志吗？此操作不可恢复！')) return
  try {
    await $fetch('/api/admin/security-logs', { method: 'DELETE', body: { deleteAll: true } })
    await refreshSecurityState()
  } catch (e) {
    alert('删除失败')
  }
}

const refreshSecurityState = async () => {
  try {
    const res = await $fetch<any>('/api/admin/security-logs')
    if (!res?.success) return

    adminSession.value = res.session || { loggedIn: false, username: '', createdAt: 0, expiresAt: 0, remainingSeconds: 0 }

    totalBlocked.value = res.totalBlocked || 0
    diskStatus.value = res.diskStatus || '暂无安全日志文件'
    liveLogs.value = Array.isArray(res.logs) ? res.logs : []
  } catch {
    adminSession.value = { loggedIn: false, username: '', createdAt: 0, expiresAt: 0, remainingSeconds: 0 }
  }
}

const tickCountdown = () => {
  if (adminSession.value.loggedIn) {
    adminSession.value.remainingSeconds = Math.max(0, (adminSession.value.remainingSeconds || 0) - 1)
    if (adminSession.value.remainingSeconds === 0) {
      refreshSecurityState()
    }
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

const formatEventType = (type: string) => {
  const typeMap: Record<string, string> = {
    'Client Login Guard': '🔐 客户登录',
    'Client Access Gate': '🟢 客户登录',
    'Client Token Guard': '🔐 客户会话',
    'Admin Login Guard': '🔑 管理员登录',
    'Admin Access Gate': '🟢 管理员登录',
    'Admin Force Logout': '⚠️ 强制登出',
    'Token Session Guard': '🔑 管理员会话',
    'Project Password Guard': '🔒 作品密码'
  }
  return typeMap[type] || type
}

const formatEventAction = (type: string, action: string) => {
  // Parse the action to show more friendly messages
  if (action.includes('non-existent user')) {
    const match = action.match(/"([^"]+)"/)
    const username = match ? match[1] : '未知'
    return `账户 "${username}" 不存在，尚未注册`
  }
  if (action.includes('non-existent admin')) {
    const match = action.match(/"([^"]+)"/)
    const username = match ? match[1] : '未知'
    return `管理员 "${username}" 不存在`
  }
  if (action.includes('Wrong password')) {
    const match = action.match(/"([^"]+)"/)
    const username = match ? match[1] : '未知'
    return `用户 "${username}" 密码输入错误`
  }
  if (action.includes('session issued')) {
    const match = action.match(/"([^"]+)"/)
    const username = match ? match[1] : '未知'
    return `用户 "${username}" 登录成功`
  }
  if (action.includes('forced logout')) {
    const match = action.match(/"([^"]+)"/)
    const username = match ? match[1] : '未知'
    return `用户 "${username}" 被强制登出`
  }
  if (action.includes('Failed password attempt')) {
    const match = action.match(/"([^"]+)"/)
    const slug = match ? match[1] : '未知'
    return `作品 "${slug}" 密码验证失败`
  }
  return action
}

onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer)
  if (refreshTimer) clearInterval(refreshTimer)
  eventSource?.close()
})
</script>
