# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\app\pages\[adminSuffix]\index.vue', 'r', 'utf-8')
content = f.read()
f.close()

# Add ClientTokenGuard before AdminSecurityGateway
old_section = '''          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <AdminStudioCounter :site-config="siteConfig" @save="saveSiteConfig" @toast="showToast" />
            <AdminThemePalette :site-config="siteConfig" @save="saveSiteConfig" @toast="showToast" />
          </div>

          <AdminSecurityGateway />'''

new_section = '''          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <AdminStudioCounter :site-config="siteConfig" @save="saveSiteConfig" @toast="showToast" />
            <AdminThemePalette :site-config="siteConfig" @save="saveSiteConfig" @toast="showToast" />
          </div>

          <!-- Client Token Guard Panel -->
          <ClientTokenGuard />

          <AdminSecurityGateway />'''

if old_section in content:
    content = content.replace(old_section, new_section)
    print("Added ClientTokenGuard component")
else:
    print("Section not found")

with codecs.open(r'D:\Git\zpj\app\pages\[adminSuffix]\index.vue', 'w', 'utf-8') as f:
    f.write(content)

print("File saved!")
