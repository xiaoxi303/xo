# -*- coding: utf-8 -*-
import re

# Read the admin index.vue file
with open(r'app/pages/[adminSuffix]/index.vue', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix password display template
old_template = '''                      <div class="mt-1.5 text-[10px] font-mono" style="color: var(--color-ink-5)">
                        \u89e3\u9501\u5bc6\u7801\uff1a<span class="font-bold text-amber-800 bg-amber-600/10 px-1.5 py-0.5 rounded">{{ getProjectPassword(r.projectSlug) || '\u672a\u8bbe\u7f6e\u5bc6\u7801/\u514d\u8d39\u516c\u5f00' }}</span>
                      </div>'''

new_template = '''                      <div class="mt-1.5 text-[10px] font-mono" style="color: var(--color-ink-5)">
                        \u89e3\u9501\u5bc6\u7801\uff1a
                        <span class="font-bold text-amber-800 bg-amber-600/10 px-1.5 py-0.5 rounded" v-if="getProjectPassword(r.projectSlug)">{{ getProjectPassword(r.projectSlug) }}</span>
                        <span class="font-bold text-emerald-700 bg-emerald-600/10 px-1.5 py-0.5 rounded" v-else-if="isProjectLocked(r.projectSlug)">\u5df2\u8bbe\u5bc6\u7801\u4fdd\u62a4 (\u52a8\u6001\u5bc6\u7801)</span>
                        <span class="font-bold text-slate-500 bg-slate-600/10 px-1.5 py-0.5 rounded" v-else>\u672a\u8bbe\u7f6e\u5bc6\u7801/\u514d\u8d39\u516c\u5f00</span>
                      </div>'''

content = content.replace(old_template, new_template)

# Fix getProjectPassword function
old_func = '''const getProjectPassword = (slug: string) => {
  const p = projectsList.value?.find((x: any) => x.slug === slug)
  return p ? p.password : ''
}'''

new_func = '''const getProjectPassword = (slug: string) => {
  const p = projectsList.value?.find((x: any) => x.slug === slug)
  if (!p) return ''
  if (!p.isPasswordProtected) return ''
  return p.activePassword || p.password || ''
}
const isProjectLocked = (slug: string) => {
  const p = projectsList.value?.find((x: any) => x.slug === slug)
  return p ? p.isPasswordProtected : false
}'''

content = content.replace(old_func, new_func)

# Fix clientName display - update the template to show formatted user info
old_client = '''                    <td class="py-4 px-6 font-bold" style="color: var(--color-ink-1)">{{ r.clientName }}</td>
                    <td class="py-4 px-6 font-mono" style="color: var(--color-ink-2)">{{ r.contact }}</td>'''

new_client = '''                    <td class="py-4 px-6 font-bold" style="color: var(--color-ink-1)">
                      <span>{{ r.clientUsername ? '\u76f4\u63a5\u5728\u7ebf\u83b7\u53d6 (\u8d26\u53f7: ' + r.clientUsername + ')' : r.clientName }}</span>
                    </td>
                    <td class="py-4 px-6 font-mono text-xs" style="color: var(--color-ink-2)">
                      <span v-if="r.contact">{{ r.contact }}</span>
                      <span v-if="r.ip" class="block text-[10px] opacity-60">IP: {{ r.ip }}</span>
                    </td>'''

content = content.replace(old_client, new_client)

with open(r'app/pages/[adminSuffix]/index.vue', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print('Admin index.vue fixed successfully')
