# -*- coding: utf-8 -*-
with open(r'app/components/BentoItem.vue', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix: Add stopPropagation and preventDefault to handleClick
old_handler = '''const handleClick = (e: MouseEvent) => {
  emit('click', e)

  if (props.to && props.to.startsWith('/projects/')) {
    recordProjectClickEvent(props.to)
  }

  if (props.to) {
    navigateTo(props.to)
  }
}'''

new_handler = '''const handleClick = (e: MouseEvent) => {
  e.stopPropagation()
  e.preventDefault()
  
  if (props.to && props.to.startsWith('/projects/')) {
    recordProjectClickEvent(props.to)
  }

  if (props.to) {
    navigateTo(props.to)
  }
}'''

content = content.replace(old_handler, new_handler)

with open(r'app/components/BentoItem.vue', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print('Fixed: Added stopPropagation to handleClick')
