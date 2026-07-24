# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\app\pages\index.vue', 'r', 'utf-8')
content = f.read()
f.close()

# Add booking form button
old_booking_btn = '''              <NuxtLink to="/booking" class="btn-ghost shadow-sm hover:bg-black/5 active:scale-95 transition-all">
                \U0001f4c5 \u5408\u4f5c\u9884\u7ea6 (Booking)
              </NuxtLink>'''

new_booking_btn = '''              <NuxtLink to="/booking" class="btn-ghost shadow-sm hover:bg-black/5 active:scale-95 transition-all">
                \U0001f4c5 \u5408\u4f5c\u9884\u7ea6 (Booking)
              </NuxtLink>
              <NuxtLink to="/booking/form" class="btn-primary shadow-xl" style="background: linear-gradient(135deg, #059669, #10b981); box-shadow: 0 10px 25px rgba(16,185,129,0.25);">
                \U0001f4dd \u7acb\u5373\u9884\u7ea6 (\u586b\u5199\u8868\u5355)
              </NuxtLink>'''

if old_booking_btn in content:
    content = content.replace(old_booking_btn, new_booking_btn)
    print("Added booking form button")
else:
    print("Booking button not found")

# Write the file
with codecs.open(r'D:\Git\zpj\app\pages\index.vue', 'w', 'utf-8') as f:
    f.write(content)

print("File saved!")
