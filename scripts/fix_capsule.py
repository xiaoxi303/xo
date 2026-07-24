# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\app\layouts\default.vue', 'r', 'utf-8')
content = f.read()
f.close()

# Update capsule announcement
old_capsule = '''          <a
            v-if="announcement.link"
            :href="announcement.link"
            class="inline-block text-[10px] font-bold hover:opacity-80 transition-opacity underline"
            style="color: var(--color-brand-accent)"
          >
            {{ announcement.ctaText || '\u67e5\u770b\u8be6\u60c5 \u2192' }}
          </a>'''

new_capsule = '''          <a
            v-if="announcement.link"
            :href="announcement.link"
            class="inline-block text-[10px] font-bold hover:opacity-80 transition-opacity underline"
            style="color: var(--color-brand-accent)"
          >
            {{ announcement.ctaText || '\u67e5\u770b\u8be6\u60c5 \u2192' }}
          </a>
          <button
            v-else
            @click="showAnnouncementDetail = true"
            class="inline-block text-[10px] font-bold hover:opacity-80 transition-opacity underline"
            style="color: var(--color-brand-accent)"
          >
            {{ announcement.ctaText || '\u67e5\u770b\u8be6\u60c5 \u2192' }}
          </button>'''

if old_capsule in content:
    content = content.replace(old_capsule, new_capsule)
    print("Updated capsule announcement")

# Write the file
with codecs.open(r'D:\Git\zpj\app\layouts\default.vue', 'w', 'utf-8') as f:
    f.write(content)

print("File saved!")
