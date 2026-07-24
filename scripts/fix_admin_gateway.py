# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\app\components\AdminSecurityGateway.vue', 'r', 'utf-8')
content = f.read()
f.close()

# Update the header to remove user token reference
old_header = '''      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full" :class="clientSession.loggedIn ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'" />
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-display font-bold text-lg text-[#121316]">\u5b89\u5168\u7f51\u5173\u963b\u65ad\u65e5\u5fd7\u4e0e\u7528\u6237 Token \u5927\u5c4f (Security Gateway Map)</h3>
            <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 border border-purple-500/20">
              Real Session Guard
            </span>
          </div>
          <p class="text-xs text-slate-400 font-mono mt-0.5">Realtime API Interception & Client Token Sentinel</p>
        </div>
      </div>'''

new_header = '''      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full" :class="adminSession.loggedIn ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'" />
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-display font-bold text-lg text-[#121316]">\u5b89\u5168\u7f51\u5173\u963b\u65ad\u65e5\u5fd7 (Security Gateway Map)</h3>
            <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 border border-purple-500/20">
              Real Session Guard
            </span>
          </div>
          <p class="text-xs text-slate-400 font-mono mt-0.5">Realtime API Interception & Admin Token Sentinel</p>
        </div>
      </div>'''

if old_header in content:
    content = content.replace(old_header, new_header)
    print("1. Updated header")

# Remove clientSession ref if it still exists
old_client_ref = '''const clientSession = ref({
  loggedIn: false,
  username: '',
  createdAt: 0,
  expiresAt: 0,
  remainingSeconds: 0
})'''

if old_client_ref in content:
    content = content.replace(old_client_ref, '')
    print("2. Removed clientSession ref")

# Remove formatClientCountdown if it exists
old_client_countdown = '''const formatClientCountdown = computed(() => {
  const sec = Math.max(0, clientSession.value.remainingSeconds || 0)
  const h = Math.floor(sec / 3600).toString().padStart(2, '0')
  const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
})'''

if old_client_countdown in content:
    content = content.replace(old_client_countdown, '')
    print("3. Removed formatClientCountdown")

# Write the file
with codecs.open(r'D:\Git\zpj\app\components\AdminSecurityGateway.vue', 'w', 'utf-8') as f:
    f.write(content)

print("\nFile saved!")
