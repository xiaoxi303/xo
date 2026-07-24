# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\app\pages\index.vue', 'r', 'utf-8')
content = f.read()
f.close()

# Add booking button after contact button
old_cta = '''            <a :href="'mailto:' + (siteConfig?.siteInfo?.contactEmail || 'hello@xo.dev')" class="btn-ghost shadow-sm hover:bg-black/5 active:scale-95 transition-all" @click="trackEvent('contact_click', 'homepage')">
                \u8054\u7cfb\u6211 (Contact)
              </a>'''

new_cta = '''            <a :href="'mailto:' + (siteConfig?.siteInfo?.contactEmail || 'hello@xo.dev')" class="btn-ghost shadow-sm hover:bg-black/5 active:scale-95 transition-all" @click="trackEvent('contact_click', 'homepage')">
                \u8054\u7cfb\u6211 (Contact)
              </a>
              <NuxtLink to="/booking" class="btn-ghost shadow-sm hover:bg-black/5 active:scale-95 transition-all">
                \U0001f4c5 \u5408\u4f5c\u9884\u7ea6 (Booking)
              </NuxtLink>'''

if old_cta in content:
    content = content.replace(old_cta, new_cta)
    print("1. Added booking button to homepage")

# Write the file
with codecs.open(r'D:\Git\zpj\app\pages\index.vue', 'w', 'utf-8') as f:
    f.write(content)

print("\nFile saved!")
