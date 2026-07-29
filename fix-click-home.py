# -*- coding: utf-8 -*-
with open(r'app/pages/index.vue', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the duplicate @click handler on BentoItem for tvcProject
old_click = "@click=\"trackProjectClick(tvcProject)\""
content = content.replace(old_click, '')

# Remove the unused trackProjectClick function and import
old_func = """import { recordProjectClickEvent } from '~/utils/analytics'

const trackProjectClick = (project: any) => {
  if (!import.meta.client || !project?.slug) return
  recordProjectClickEvent(project.slug, project.title)
}"""
content = content.replace(old_func, '')

with open(r'app/pages/index.vue', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print('Fixed: Removed duplicate click tracking from index.vue')
