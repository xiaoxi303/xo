# -*- coding: utf-8 -*-
import codecs

# Read the project detail page
f = codecs.open(r'D:\Git\zpj\app\pages\projects\[slug]\index.vue', 'r', 'utf-8')
content = f.read()
f.close()

# Fix 1: Video player - support vertical video by using object-fit: contain
old_video_style = '''class="w-full h-full block cursor-pointer"
                    :style="{ maxHeight: isFullscreen ? 'none' : '520px', height: isFullscreen ? '100%' : '100%', objectFit: 'cover', background: '#000' }"'''

new_video_style = '''class="w-full h-full block cursor-pointer"
                    :style="{ maxHeight: isFullscreen ? 'none' : '700px', height: isFullscreen ? '100%' : '100%', objectFit: 'contain', background: '#000' }"'''

if old_video_style in content:
    content = content.replace(old_video_style, new_video_style)
    print("1. Updated video style to contain for vertical videos")

# Fix 1b: Update container to support vertical videos
old_container = '''class="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black select-none z-10 aspect-video max-h-[520px]" style="border: 2px solid rgba(217,119,6,0.35); box-shadow: 0 20px 50px rgba(0,0,0,0.25);"'''

new_container = '''class="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black select-none z-10 max-h-[700px]" style="border: 2px solid rgba(217,119,6,0.35); box-shadow: 0 20px 50px rgba(0,0,0,0.25); aspect-ratio: auto;"'''

if old_container in content:
    content = content.replace(old_container, new_container)
    print("2. Updated container to auto aspect ratio")

# Write the file
with codecs.open(r'D:\Git\zpj\app\pages\projects\[slug]\index.vue', 'w', 'utf-8') as f:
    f.write(content)

print("\nFile saved!")
