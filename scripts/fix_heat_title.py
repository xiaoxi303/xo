# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\server\api\system-status.get.ts', 'r', 'utf-8')
content = f.read()
f.close()

# Fix: Make sure to use the real title from projectTitles, and only fallback to formatted slug if not found
old_title_map = '''    .map(([slug, clicks]) => ({ 
      slug, 
      title: String(projectTitles.get(slug) || slug.replace(/-/g, ' ').replace(/\\b\\w/g, (c: string) => c.toUpperCase())), 
      clicks 
    }))'''

new_title_map = '''    .map(([slug, clicks]) => {
      const title = projectTitles.get(slug)
      return { 
        slug, 
        title: title && title !== slug ? title : slug,  // Use real title if available, otherwise slug
        clicks 
      }
    })'''

if old_title_map in content:
    content = content.replace(old_title_map, new_title_map)
    print("1. Updated title mapping to prefer real title")

# Write the file
with codecs.open(r'D:\Git\zpj\server\api\system-status.get.ts', 'w', 'utf-8') as f:
    f.write(content)

print("\nFile saved!")
