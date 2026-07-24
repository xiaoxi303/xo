# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\app\components\AdminSecurityGateway.vue', 'r', 'utf-8')
content = f.read()
f.close()

# Update the table header to show more descriptive columns
old_thead = '''          <tr class="bg-black/[0.02] text-[9px] uppercase text-slate-400 border-b border-black/[0.05]">
            <th class="py-3 px-4">\u9632\u62a4\u7c7b\u578b</th>
            <th class="py-3 px-4">\u7ec8\u7aef IP</th>
            <th class="py-3 px-4">\u5904\u7f6e\u52a8\u4f5c / \u89e6\u53d1\u7b56\u7565</th>
            <th class="py-3 px-4">\u65f6\u95f4</th>
            <th class="py-3 px-4 text-right">\u72b6\u6001</th>
          </tr>'''

new_thead = '''          <tr class="bg-black/[0.02] text-[9px] uppercase text-slate-400 border-b border-black/[0.05]">
            <th class="py-3 px-4">\u4e8b\u4ef6\u7c7b\u578b</th>
            <th class="py-3 px-4">\u7ec8\u7aef IP</th>
            <th class="py-3 px-4">\u8be6\u7ec6\u4fe1\u606f</th>
            <th class="py-3 px-4">\u65f6\u95f4</th>
            <th class="py-3 px-4 text-right">\u72b6\u6001</th>
          </tr>'''

if old_thead in content:
    content = content.replace(old_thead, new_thead)
    print("1. Updated table header")

# Update the log display to show more friendly messages
old_log_display = '''            <td class="py-3.5 px-4 font-bold text-[#121316] flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(log.status)" />
              <span>{{ log.type }}</span>
            </td>
            <td class="py-3.5 px-4 text-slate-500">{{ log.ip }}</td>
            <td class="py-3.5 px-4 text-slate-600">{{ log.action }}</td>'''

new_log_display = '''            <td class="py-3.5 px-4 font-bold text-[#121316] flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(log.status)" />
              <span>{{ formatEventType(log.type) }}</span>
            </td>
            <td class="py-3.5 px-4 text-slate-500 font-mono text-[10px]">{{ log.ip }}</td>
            <td class="py-3.5 px-4 text-slate-600">{{ formatEventAction(log.type, log.action) }}</td>'''

if old_log_display in content:
    content = content.replace(old_log_display, new_log_display)
    print("2. Updated log display")

# Add the format functions before the closing </script> tag
old_script_end = '''onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer)
  if (refreshTimer) clearInterval(refreshTimer)
  eventSource?.close()
})
</script>'''

new_functions = '''const formatEventType = (type: string) => {
  const typeMap: Record<string, string> = {
    'Client Login Guard': '\U0001f510 \u5ba2\u6237\u767b\u5f55',
    'Client Access Gate': '\U0001f7e2 \u5ba2\u6237\u767b\u5f55',
    'Client Token Guard': '\U0001f510 \u5ba2\u6237\u4f1a\u8bdd',
    'Admin Login Guard': '\U0001f511 \u7ba1\u7406\u5458\u767b\u5f55',
    'Admin Access Gate': '\U0001f7e2 \u7ba1\u7406\u5458\u767b\u5f55',
    'Admin Force Logout': '\u26a0\ufe0f \u5f3a\u5236\u767b\u51fa',
    'Token Session Guard': '\U0001f511 \u7ba1\u7406\u5458\u4f1a\u8bdd',
    'Project Password Guard': '\U0001f512 \u4f5c\u54c1\u5bc6\u7801'
  }
  return typeMap[type] || type
}

const formatEventAction = (type: string, action: string) => {
  // Parse the action to show more friendly messages
  if (action.includes('non-existent user')) {
    const match = action.match(/"([^"]+)"/)
    const username = match ? match[1] : '\u672a\u77e5'
    return `\u8d26\u6237 "${username}" \u4e0d\u5b58\u5728\uff0c\u5c1a\u672a\u6ce8\u518c`
  }
  if (action.includes('non-existent admin')) {
    const match = action.match(/"([^"]+)"/)
    const username = match ? match[1] : '\u672a\u77e5'
    return `\u7ba1\u7406\u5458 "${username}" \u4e0d\u5b58\u5728`
  }
  if (action.includes('Wrong password')) {
    const match = action.match(/"([^"]+)"/)
    const username = match ? match[1] : '\u672a\u77e5'
    return `\u7528\u6237 "${username}" \u5bc6\u7801\u8f93\u5165\u9519\u8bef`
  }
  if (action.includes('session issued')) {
    const match = action.match(/"([^"]+)"/)
    const username = match ? match[1] : '\u672a\u77e5'
    return `\u7528\u6237 "${username}" \u767b\u5f55\u6210\u529f`
  }
  if (action.includes('forced logout')) {
    const match = action.match(/"([^"]+)"/)
    const username = match ? match[1] : '\u672a\u77e5'
    return `\u7528\u6237 "${username}" \u88ab\u5f3a\u5236\u767b\u51fa`
  }
  if (action.includes('Failed password attempt')) {
    const match = action.match(/"([^"]+)"/)
    const slug = match ? match[1] : '\u672a\u77e5'
    return `\u4f5c\u54c1 "${slug}" \u5bc6\u7801\u9a8c\u8bc1\u5931\u8d25`
  }
  return action
}

onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer)
  if (refreshTimer) clearInterval(refreshTimer)
  eventSource?.close()
})
</script>'''

if old_script_end in content:
    content = content.replace(old_script_end, new_functions)
    print("3. Added format functions")

# Write the file
with codecs.open(r'D:\Git\zpj\app\components\AdminSecurityGateway.vue', 'w', 'utf-8') as f:
    f.write(content)

print("\nFile saved!")
