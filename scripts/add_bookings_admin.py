# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\app\pages\[adminSuffix]\index.vue', 'r', 'utf-8')
content = f.read()
f.close()

# Add bookings tab
old_tabs = '''const tabs = [
  { label: '\u6570\u636e\u770b\u677f', value: 'analytics', icon: '\U0001f4ca' },
  { label: '\u4f5c\u54c1\u7ba1\u7406', value: 'projects', icon: '\U0001f3ac' },
  { label: '\u6388\u6743\u7533\u8bf7', value: 'requests', icon: '\U0001f511' },
  { label: '\u7528\u6237\u7ba1\u7406', value: 'users', icon: '\U0001f465' },
  { label: '\u9996\u9875\u914d\u7f6e', value: 'home', icon: '\U0001f3e0' },
  { label: '\u4e2a\u4eba\u5c65\u5386', value: 'about', icon: '\U0001f64b' },
  { label: '\u7ad9\u70b9\u4fe1\u606f', value: 'siteinfo', icon: '\U0001f310' },
  { label: '\u9ad8\u7ea7\u8bbe\u7f6e', value: 'advanced', icon: '\U0001f3a8' }
]'''

new_tabs = '''const tabs = [
  { label: '\u6570\u636e\u770b\u677f', value: 'analytics', icon: '\U0001f4ca' },
  { label: '\u4f5c\u54c1\u7ba1\u7406', value: 'projects', icon: '\U0001f3ac' },
  { label: '\u6388\u6743\u7533\u8bf7', value: 'requests', icon: '\U0001f511' },
  { label: '\u5408\u4f5c\u9884\u7ea6', value: 'bookings', icon: '\U0001f4c5' },
  { label: '\u7528\u6237\u7ba1\u7406', value: 'users', icon: '\U0001f465' },
  { label: '\u9996\u9875\u914d\u7f6e', value: 'home', icon: '\U0001f3e0' },
  { label: '\u4e2a\u4eba\u5c65\u5386', value: 'about', icon: '\U0001f64b' },
  { label: '\u7ad9\u70b9\u4fe1\u606f', value: 'siteinfo', icon: '\U0001f310' },
  { label: '\u9ad8\u7ea7\u8bbe\u7f6e', value: 'advanced', icon: '\U0001f3a8' }
]'''

if old_tabs in content:
    content = content.replace(old_tabs, new_tabs)
    print("1. Added bookings tab")

# Add bookings data and fetch function
old_fetch_users = '''const fetchUsers = async () => {'''

new_bookings_code = '''const bookings = ref<any[]>([])
const fetchBookings = async () => {
  try {
    const res = await $fetch('/api/admin/bookings?t=' + Date.now()) as any
    bookings.value = res?.bookings || []
  } catch {}
}

const updateBookingStatus = async (id: string, status: string) => {
  // For now just update locally
  const booking = bookings.value.find(b => b.id === id)
  if (booking) booking.status = status
}

const fetchUsers = async () => {'''

if old_fetch_users in content:
    content = content.replace(old_fetch_users, new_bookings_code)
    print("2. Added bookings data and fetch function")

# Add fetchBookings to the initialization
old_init = '''await Promise.all([fetchProjects(), fetchSiteConfig(), fetchSystemStatus(), fetchPasswordRequests(), fetchUsers()])'''

new_init = '''await Promise.all([fetchProjects(), fetchSiteConfig(), fetchSystemStatus(), fetchPasswordRequests(), fetchUsers(), fetchBookings()])'''

if old_init in content:
    content = content.replace(old_init, new_init)
    print("3. Added fetchBookings to initialization")

# Add bookings tab content before the users tab
old_users_tab = '''          <div v-else-if="activeTab === 'users'" key="users" class="space-y-6">'''

bookings_tab = '''          <!-- Bookings Tab -->
          <div v-else-if="activeTab === 'bookings'" key="bookings" class="space-y-6">
            <div class="glass-card p-8 space-y-6">
              <div class="flex items-center justify-between border-b pb-4" style="border-color: var(--color-border)">
                <div>
                  <h3 class="font-display font-bold text-lg" style="color: var(--color-ink-1)">\\U0001f4c5 \u5408\u4f5c\u9884\u7ea6\u7ba1\u7406</h3>
                  <p class="text-xs mt-1" style="color: var(--color-ink-4)">\u67e5\u770b\u548c\u7ba1\u7406\u5ba2\u6237\u7684\u5408\u4f5c\u9884\u7ea6\u7533\u8bf7</p>
                </div>
                <span class="text-xs font-mono px-3 py-1 rounded-full" style="background: var(--color-accent-10); color: var(--color-accent)">\u5171 {{ bookings.length }} \u6761\u9884\u7ea6</span>
              </div>

              <div v-if="bookings.length === 0" class="text-center py-12">
                <span class="text-4xl">\\U0001f4cb</span>
                <p class="text-sm mt-3" style="color: var(--color-ink-4)">\u6682\u65e0\u9884\u7ea6\u8bb0\u5f55</p>
              </div>

              <div v-else class="space-y-4">
                <div v-for="b in bookings" :key="b.id" class="p-5 rounded-2xl border" style="border-color: var(--color-border); background: var(--color-bg-2)">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: var(--color-accent-10)">
                        {{ b.serviceType === 'tvc' ? '\\U0001f3ac' : b.serviceType === 'color' ? '\\U0001f3a8' : b.serviceType === 'short' ? '\\U0001f4f9' : b.serviceType === 'audio' ? '\\U0001f3b5' : '\\U0001f4c1' }}
                      </div>
                      <div>
                        <span class="font-bold text-sm" style="color: var(--color-ink-1)">{{ b.name }}</span>
                        <span class="text-xs ml-2" style="color: var(--color-ink-4)">{{ b.company || '\u65e0\u516c\u53f8' }}</span>
                      </div>
                    </div>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded" 
                      :class="b.status === 'pending' ? 'bg-amber-500/10 text-amber-700' : b.status === 'approved' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-slate-100 text-slate-500'">
                      {{ b.status === 'pending' ? '\U0001f7e1 \u5f85\u5904\u7406' : b.status === 'approved' ? '\U0001f7e2 \u5df2\u786e\u8ba4' : '\u26aa \u5df2\u5f52\u6863' }}
                    </span>
                  </div>
                  
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                    <div><span style="color: var(--color-ink-4)">\u7535\u8bdd:</span> <span class="font-mono" style="color: var(--color-ink-1)">{{ b.phone }}</span></div>
                    <div><span style="color: var(--color-ink-4)">\u90ae\u7bb1:</span> <span class="font-mono" style="color: var(--color-ink-1)">{{ b.email }}</span></div>
                    <div><span style="color: var(--color-ink-4)">\u9884\u7b97:</span> <span style="color: var(--color-ink-1)">{{ b.budget || '\u672a\u586b\u5199' }}</span></div>
                    <div><span style="color: var(--color-ink-4)">\u65f6\u95f4:</span> <span style="color: var(--color-ink-1)">{{ b.timeline || '\u672a\u586b\u5199' }}</span></div>
                  </div>
                  
                  <p class="text-xs p-3 rounded-lg mb-3" style="background: var(--color-bg-1); color: var(--color-ink-2)">{{ b.description }}</p>
                  
                  <div class="flex items-center justify-between">
                    <span class="text-[10px]" style="color: var(--color-ink-5)">{{ new Date(b.createdAt).toLocaleString('zh-CN') }} | IP: {{ b.ip }}</span>
                    <div class="flex gap-2">
                      <button v-if="b.status === 'pending'" @click="updateBookingStatus(b.id, 'approved')" class="text-[10px] px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20">\u2705 \u786e\u8ba4</button>
                      <button v-if="b.status !== 'archived'" @click="updateBookingStatus(b.id, 'archived')" class="text-[10px] px-3 py-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200">\u26aa \u5f52\u6863</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'users'" key="users" class="space-y-6">'''

if old_users_tab in content:
    content = content.replace(old_users_tab, bookings_tab)
    print("4. Added bookings tab content")

# Write the file
with codecs.open(r'D:\Git\zpj\app\pages\[adminSuffix]\index.vue', 'w', 'utf-8') as f:
    f.write(content)

print("\nFile saved!")
