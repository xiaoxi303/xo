# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\app\layouts\default.vue', 'r', 'utf-8')
content = f.read()
f.close()

# Update top bar announcement - add detail view when no link
old_top_bar_link = '''          <!-- Link -->
          <a
            v-if="announcement.link"
            :href="announcement.link"
            class="text-[11px] font-bold hover:underline flex items-center gap-1 flex-shrink-0 opacity-90 hover:opacity-100 transition-opacity"
          >
            {{ announcement.ctaText || '\u67e5\u770b\u8be6\u60c5 \u2192' }}
          </a>'''

new_top_bar_link = '''          <!-- Link or Detail -->
          <a
            v-if="announcement.link"
            :href="announcement.link"
            class="text-[11px] font-bold hover:underline flex items-center gap-1 flex-shrink-0 opacity-90 hover:opacity-100 transition-opacity"
          >
            {{ announcement.ctaText || '\u67e5\u770b\u8be6\u60c5 \u2192' }}
          </a>
          <button
            v-else
            @click="showAnnouncementDetail = true"
            class="text-[11px] font-bold hover:underline flex items-center gap-1 flex-shrink-0 opacity-90 hover:opacity-100 transition-opacity"
          >
            {{ announcement.ctaText || '\u67e5\u770b\u8be6\u60c5 \u2192' }}
          </button>'''

if old_top_bar_link in content:
    content = content.replace(old_top_bar_link, new_top_bar_link)
    print("1. Updated top bar announcement")

# Find and update the capsule announcement as well
old_capsule_link = '''          <a
            v-if="announcement.link"
            :href="announcement.link"
            class="text-[11px] font-bold hover:underline flex items-center gap-1"
          >
            {{ announcement.ctaText || '\u67e5\u770b\u8be6\u60c5 \u2192' }}
          </a>'''

new_capsule_link = '''          <a
            v-if="announcement.link"
            :href="announcement.link"
            class="text-[11px] font-bold hover:underline flex items-center gap-1"
          >
            {{ announcement.ctaText || '\u67e5\u770b\u8be6\u60c5 \u2192' }}
          </a>
          <button
            v-else
            @click="showAnnouncementDetail = true"
            class="text-[11px] font-bold hover:underline flex items-center gap-1"
          >
            {{ announcement.ctaText || '\u67e5\u770b\u8be6\u60c5 \u2192' }}
          </button>'''

if old_capsule_link in content:
    content = content.replace(old_capsule_link, new_capsule_link)
    print("2. Updated capsule announcement")

# Add announcement detail modal before closing template tag
old_template_end = '''</template>'''

announcement_modal = '''
    <!-- Announcement Detail Modal -->
    <Transition name="fade">
      <div v-if="showAnnouncementDetail" class="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" @click.self="showAnnouncementDetail = false">
        <div class="glass-card p-8 rounded-3xl max-w-lg w-full space-y-6 border-2 border-amber-500/30 bg-white/95 shadow-2xl">
          <div class="flex items-center justify-between border-b pb-4 border-black/10">
            <div class="flex items-center gap-3">
              <span class="text-2xl">\U0001f4e2</span>
              <h3 class="font-bold text-lg text-[#121316]">\u5e7f\u64ad\u8be6\u60c5</h3>
            </div>
            <button type="button" @click="showAnnouncementDetail = false" class="text-slate-400 hover:text-black font-bold text-xl">\u2715</button>
          </div>
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold font-mono uppercase px-2 py-0.5 rounded-full" :class="getBadgeClass(announcement?.badgeColor)">
                {{ announcement?.badge || 'BROADCAST' }}
              </span>
            </div>
            <p class="text-sm text-slate-700 leading-relaxed">{{ announcement?.text }}</p>
          </div>
          <div class="flex justify-end pt-4 border-t border-black/10">
            <button type="button" @click="showAnnouncementDetail = false" class="btn-primary px-6 py-2 text-sm">\u77e5\u9053\u4e86</button>
          </div>
        </div>
      </div>
    </Transition>
</template>'''

if old_template_end in content:
    content = content.replace(old_template_end, announcement_modal)
    print("3. Added announcement detail modal")

# Add showAnnouncementDetail ref in script
old_script = '''const showBanner = ref(true)'''

new_script = '''const showAnnouncementDetail = ref(false)
const showBanner = ref(true)'''

if old_script in content:
    content = content.replace(old_script, new_script)
    print("4. Added showAnnouncementDetail ref")

# Write the file
with codecs.open(r'D:\Git\zpj\app\layouts\default.vue', 'w', 'utf-8') as f:
    f.write(content)

print("\nFile saved!")
