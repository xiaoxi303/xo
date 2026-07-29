<template>
  <div
    class="inline-flex items-center gap-1 p-1.5 rounded-full bg-slate-900/90 dark:bg-slate-800/95 text-white shadow-2xl backdrop-blur-xl border border-white/10 select-none transition-all duration-300"
  >
    <button
      v-for="item in toolbarItems"
      :key="item.id"
      @click="handleAction(item.id)"
      :title="item.label"
      class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white hover:bg-white/15 active:scale-95 transition-all"
    >
      <span v-if="item.icon" class="font-mono text-xs">{{ item.icon }}</span>
      <span v-else class="text-xs">{{ item.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['action'])

const toolbarItems = [
  { id: 'bold', label: 'Bold', icon: 'B' },
  { id: 'italic', label: 'Italic', icon: 'I' },
  { id: 'h2', label: 'H2', icon: 'H2' },
  { id: 'quote', label: 'Quote', icon: '“' },
  { id: 'link', label: 'Link', icon: '🔗' },
  { id: 'image', label: 'Image', icon: '🖼️' },
  { id: 'code', label: 'Code', icon: '</>' },
  { id: 'list', label: 'List', icon: '•' }
]

const handleAction = (id: string) => {
  emit('action', id)
}
</script>
