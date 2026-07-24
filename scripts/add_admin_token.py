# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\app\components\AdminSecurityGateway.vue', 'r', 'utf-8')
content = f.read()
f.close()

# Find the template section with the stats grid
old_grid = '''    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 pb-2">
      <div class="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.04]">
        <span class="text-[9px] font-mono text-slate-400 block uppercase font-bold">\u62e6\u622a\u975e\u6cd5\u8bf7\u6c42</span>
        <span class="font-display font-bold text-xl text-emerald-600">{{ totalBlocked }} \u6b21</span>
      </div>
      <div class="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.04]">
        <span class="text-[9px] font-mono text-slate-400 block uppercase font-bold">\u7528\u6237 Token \u4f1a\u8bdd\u5b88\u536b</span>
        <span class="font-display font-bold text-xl text-[#121316] font-mono">{{ formatTokenCountdown }}</span>
        <span class="block text-[10px] mt-1" :class="(clientSession.loggedIn || adminSession.loggedIn) ? 'text-emerald-600' : 'text-rose-500'">
          {{ clientSession.loggedIn ? `\u7528\u6237 ${clientSession.username} \u5df2\u767b\u5f55` : (adminSession.loggedIn ? `\u7ba1\u7406\u5458 ${adminSession.username} \u5df2\u767b\u5f55` : '\u7528\u6237\u672a\u767b\u5f55\u6216\u5df2\u8fc7\u671f\uff0c\u9700\u8981\u524d\u7aef\u91cd\u65b0\u767b\u5f55') }}
        </span>
      </div>
      <div class="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
        <span class="text-[9px] font-mono text-purple-900 block uppercase font-bold">\u98ce\u9669\u8bc4\u4f30</span>
        <span class="font-display font-bold text-sm text-purple-900 block mt-1">
          {{ totalBlocked === 0 ? '\u5f53\u524d\u65e0\u771f\u5b9e\u62e6\u622a\u4e8b\u4ef6' : `${totalBlocked} \u6761\u771f\u5b9e\u62e6\u622a\u8bb0\u5f55` }}
        </span>
      </div>
      <div class="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.04]">
        <span class="text-[9px] font-mono text-slate-400 block uppercase font-bold">\u5b89\u5168\u65e5\u5fd7\u5b58\u50a8</span>
        <span class="font-display font-bold text-xs text-emerald-600 block mt-1">{{ diskStatus }}</span>
      </div>
    </div>'''

new_grid = '''    <div class="grid grid-cols-1 sm:grid-cols-5 gap-4 pb-2">
      <div class="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.04]">
        <span class="text-[9px] font-mono text-slate-400 block uppercase font-bold">\u62e6\u622a\u975e\u6cd5\u8bf7\u6c42</span>
        <span class="font-display font-bold text-xl text-emerald-600">{{ totalBlocked }} \u6b21</span>
      </div>
      <div class="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.04]">
        <span class="text-[9px] font-mono text-slate-400 block uppercase font-bold">\u7528\u6237 Token \u4f1a\u8bdd\u5b88\u536b</span>
        <span class="font-display font-bold text-xl text-[#121316] font-mono">{{ formatClientCountdown }}</span>
        <span class="block text-[10px] mt-1" :class="clientSession.loggedIn ? 'text-emerald-600' : 'text-rose-500'">
          {{ clientSession.loggedIn ? `\u7528\u6237 ${clientSession.username} \u5df2\u767b\u5f55` : '\u7528\u6237\u672a\u767b\u5f55\u6216\u5df2\u8fc7\u671f' }}
        </span>
      </div>
      <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
        <span class="text-[9px] font-mono text-amber-900 block uppercase font-bold">\u7ba1\u7406\u5458 Token \u4f1a\u8bdd\u5b88\u536b</span>
        <span class="font-display font-bold text-xl text-amber-900 font-mono">{{ formatAdminCountdown }}</span>
        <span class="block text-[10px] mt-1" :class="adminSession.loggedIn ? 'text-emerald-600' : 'text-rose-500'">
          {{ adminSession.loggedIn ? `\u7ba1\u7406\u5458 ${adminSession.username} \u5df2\u767b\u5f55` : '\u7ba1\u7406\u5458\u672a\u767b\u5f55\u6216\u5df2\u8fc7\u671f' }}
        </span>
      </div>
      <div class="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
        <span class="text-[9px] font-mono text-purple-900 block uppercase font-bold">\u98ce\u9669\u8bc4\u4f30</span>
        <span class="font-display font-bold text-sm text-purple-900 block mt-1">
          {{ totalBlocked === 0 ? '\u5f53\u524d\u65e0\u771f\u5b9e\u62e6\u622a\u4e8b\u4ef6' : `${totalBlocked} \u6761\u771f\u5b9e\u62e6\u622a\u8bb0\u5f55` }}
        </span>
      </div>
      <div class="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.04]">
        <span class="text-[9px] font-mono text-slate-400 block uppercase font-bold">\u5b89\u5168\u65e5\u5fd7\u5b58\u50a8</span>
        <span class="font-display font-bold text-xs text-emerald-600 block mt-1">{{ diskStatus }}</span>
      </div>
    </div>'''

if old_grid in content:
    content = content.replace(old_grid, new_grid)
    print("1. Updated grid to 5 columns with admin token panel")
else:
    print("1. Grid not found")

# Update the script section - change formatTokenCountdown to formatClientCountdown and add formatAdminCountdown
old_countdown = '''const formatTokenCountdown = computed(() => {
  const sec = Math.max(0, currentRemainingSec.value)
  const h = Math.floor(sec / 3600).toString().padStart(2, '0')
  const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
})'''

new_countdown = '''const formatClientCountdown = computed(() => {
  const sec = Math.max(0, clientSession.value.remainingSeconds || 0)
  const h = Math.floor(sec / 3600).toString().padStart(2, '0')
  const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
})

const formatAdminCountdown = computed(() => {
  const sec = Math.max(0, adminSession.value.remainingSeconds || 0)
  const h = Math.floor(sec / 3600).toString().padStart(2, '0')
  const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
})'''

if old_countdown in content:
    content = content.replace(old_countdown, new_countdown)
    print("2. Updated countdown computed properties")
else:
    print("2. Countdown not found")

# Remove the currentRemainingSec ref and related code since we now use session objects directly
# Remove the currentRemainingSec ref
old_ref = '''const currentRemainingSec = ref(0)'''
if old_ref in content:
    content = content.replace(old_ref, '')
    print("3. Removed currentRemainingSec ref")

# Update refreshSecurityState to not set currentRemainingSec
old_refresh_logic = '''    // \u4f18\u5148\u4f7f\u7528\u7528\u6237Token\uff08clientSession\uff09\uff0c\u6ca1\u6709\u7528\u6237\u767b\u5f55\u624d\u4f7f\u7528\u7ba1\u7406\u5458Token\uff08adminSession\uff09
    if (res.clientSession?.loggedIn) {
      currentRemainingSec.value = res.clientSession.remainingSeconds || 0
    } else if (res.session?.loggedIn) {
      currentRemainingSec.value = res.session.remainingSeconds || 0
    } else {
      currentRemainingSec.value = 0
    }'''

new_refresh_logic = ''  # Remove this block since we now use session objects directly

if old_refresh_logic in content:
    content = content.replace(old_refresh_logic, new_refresh_logic)
    print("4. Removed old countdown logic from refreshSecurityState")

# Update tickCountdown to use session objects directly
old_tick = '''const tickCountdown = () => {
  currentRemainingSec.value = Math.max(0, currentRemainingSec.value - 1)
  if (currentRemainingSec.value === 0 && (clientSession.value.loggedIn || adminSession.value.loggedIn)) {
    refreshSecurityState()
  }
}'''

new_tick = '''const tickCountdown = () => {
  if (clientSession.value.loggedIn) {
    clientSession.value.remainingSeconds = Math.max(0, (clientSession.value.remainingSeconds || 0) - 1)
  }
  if (adminSession.value.loggedIn) {
    adminSession.value.remainingSeconds = Math.max(0, (adminSession.value.remainingSeconds || 0) - 1)
  }
  if ((!clientSession.value.loggedIn && !adminSession.value.loggedIn) || 
      (clientSession.value.loggedIn && clientSession.value.remainingSeconds === 0) ||
      (adminSession.value.loggedIn && adminSession.value.remainingSeconds === 0)) {
    refreshSecurityState()
  }
}'''

if old_tick in content:
    content = content.replace(old_tick, new_tick)
    print("5. Updated tickCountdown")

# Update the catch block to remove currentRemainingSec
old_catch = '''    clientSession.value = { loggedIn: false, username: '', createdAt: 0, expiresAt: 0, remainingSeconds: 0 }
    adminSession.value = { loggedIn: false, username: '', createdAt: 0, expiresAt: 0, remainingSeconds: 0 }
    currentRemainingSec.value = 0'''

new_catch = '''    clientSession.value = { loggedIn: false, username: '', createdAt: 0, expiresAt: 0, remainingSeconds: 0 }
    adminSession.value = { loggedIn: false, username: '', createdAt: 0, expiresAt: 0, remainingSeconds: 0 }'''

if old_catch in content:
    content = content.replace(old_catch, new_catch)
    print("6. Updated catch block")

# Write the file
with codecs.open(r'D:\Git\zpj\app\components\AdminSecurityGateway.vue', 'w', 'utf-8') as f:
    f.write(content)

print("\nFile saved!")
