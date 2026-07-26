# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\app\pages\booking\index.vue', 'r', 'utf-8')
content = f.read()
f.close()

# Remove reveal class to show content immediately
content = content.replace('class="reveal"', 'class=""')
content = content.replace('class="reveal"', 'class=""')

# Also add a simple onMounted to trigger reveal
old_script = '''<script setup lang="ts">
useHead({
  title: '\u5408\u4f5c\u9884\u7ea6 - XO Studio'
})
</script>'''

new_script = '''<script setup lang="ts">
useHead({
  title: '\u5408\u4f5c\u9884\u7ea6 - XO Studio'
})

// Trigger reveal animations on mount
onMounted(() => {
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('in-view')
    })
  }, 100)
})
</script>'''

if old_script in content:
    content = content.replace(old_script, new_script)
    print("Added onMounted to trigger reveal")

with codecs.open(r'D:\Git\zpj\app\pages\booking\index.vue', 'w', 'utf-8') as f:
    f.write(content)

print("Fixed booking/index.vue")
