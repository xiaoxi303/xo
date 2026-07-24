# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\server\api\system-status.get.ts', 'r', 'utf-8')
content = f.read()
f.close()

# Fix: Also add titles from page-views.json slugs that might not be in projects list
old_all_known = '''  const allKnownSlugs = new Set([
    ...Array.from(projectTitles.keys()),
    ...Object.keys(viewCounts),
    ...Object.keys(clickCounts),
    ...Object.keys(unifiedHeat)
  ])'''

new_all_known = '''  // Also collect slugs from page-views.json that start with /projects/
  const pageViewSlugs = new Set<string>()
  const statsFile = getRuntimeDataPath('page-views.json')
  if (fs.existsSync(statsFile)) {
    try {
      const stats = JSON.parse(fs.readFileSync(statsFile, 'utf-8'))
      for (const pathKey of Object.keys(stats)) {
        if (pathKey.startsWith('/projects/')) {
          const slug = pathKey.replace(/^\/projects\//, '').split('/')[0].split('?')[0]
          if (slug && slug !== 'get') pageViewSlugs.add(slug)
        }
      }
    } catch {}
  }

  const allKnownSlugs = new Set([
    ...Array.from(projectTitles.keys()),
    ...Object.keys(viewCounts),
    ...Object.keys(clickCounts),
    ...Object.keys(unifiedHeat),
    ...Array.from(pageViewSlugs)
  ])'''

if old_all_known in content:
    content = content.replace(old_all_known, new_all_known)
    print("1. Added pageViewSlugs to allKnownSlugs")

# Fix: Use slug as fallback title when not in projectTitles
old_title_map = '''    .map(([slug, clicks]) => ({ slug, title: String(projectTitles.get(slug) || slug), clicks }))'''

new_title_map = '''    .map(([slug, clicks]) => ({ 
      slug, 
      title: String(projectTitles.get(slug) || slug.replace(/-/g, ' ').replace(/\\b\\w/g, (c: string) => c.toUpperCase())), 
      clicks 
    }))'''

if old_title_map in content:
    content = content.replace(old_title_map, new_title_map)
    print("2. Updated title fallback to format slug nicely")

# Write the file
with codecs.open(r'D:\Git\zpj\server\api\system-status.get.ts', 'w', 'utf-8') as f:
    f.write(content)

print("\nFile saved!")
