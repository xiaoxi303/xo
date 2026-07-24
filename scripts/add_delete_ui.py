# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\app\components\AdminSecurityGateway.vue', 'r', 'utf-8')
content = f.read()
f.close()

# Add delete functions to the script section
old_refresh = '''const refreshSecurityState = async () => {'''

new_functions = '''const deleteLog = async (id: string) => {
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

const refreshSecurityState = async () => {'''

if old_refresh in content:
    content = content.replace(old_refresh, new_functions)
    print("1. Added delete functions")
else:
    print("1. refreshSecurityState not found")

# Add delete buttons to the template - in the header area
old_header = '''      <span class="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
        REALTIME LIVE FEED
      </span>'''

new_header = '''      <div class="flex items-center gap-2">
        <button @click="deleteAllLogs" class="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-700 border border-rose-500/20 hover:bg-rose-500/20">
          \u2716 \u6e05\u7a7a\u65e5\u5fd7
        </button>
        <span class="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
          REALTIME LIVE FEED
        </span>
      </div>'''

if old_header in content:
    content = content.replace(old_header, new_header)
    print("2. Added clear all button in header")
else:
    print("2. Header not found")

# Add delete button to each log row
old_status = '''            <td class="py-3.5 px-4 text-right font-bold">{{ statusLabel(log.status) }}</td>'''

new_status = '''            <td class="py-3.5 px-4 text-right font-bold flex items-center justify-end gap-2">
              {{ statusLabel(log.status) }}
              <button @click="deleteLog(log.id)" class="text-rose-400 hover:text-rose-600 text-[10px]" title="\u5220\u9664">\u2716</button>
            </td>'''

if old_status in content:
    content = content.replace(old_status, new_status)
    print("3. Added delete button to each row")
else:
    print("3. Status column not found")

# Write the file
with codecs.open(r'D:\Git\zpj\app\components\AdminSecurityGateway.vue', 'w', 'utf-8') as f:
    f.write(content)

print("\nFile saved!")
