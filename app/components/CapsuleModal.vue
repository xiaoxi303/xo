<template>
  <Teleport to="body">
    <Transition name="capsule-modal-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
        @click.self="close"
      >
        <div
          class="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[28px] p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 relative overflow-hidden transition-all transform animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-[#007AFF]" />
              <h3 class="text-lg font-bold text-slate-900 dark:text-white font-display">文章发布设置 (Publish Settings)</h3>
            </div>
            <button
              @click="close"
              class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors"
            >
              ✕
            </button>
          </div>

          <!-- Body Form -->
          <div class="space-y-5 pt-5">
            <!-- SEO Title / Slug input -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                SEO 友好 SLUG / 别名 URL
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">/blog/</span>
                <input
                  v-model="form.slug"
                  type="text"
                  placeholder="my-first-post"
                  class="w-full pl-16 pr-4 py-2.5 rounded-full bg-[#F8F8F8] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-mono focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 transition-all"
                />
              </div>
            </div>

            <!-- SEO Title -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                SEO 页面标题 (Page Title)
              </label>
              <input
                v-model="form.seoTitle"
                type="text"
                placeholder="设置包含关键字的页面标题..."
                class="w-full px-4 py-2.5 rounded-full bg-[#F8F8F8] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-[#007AFF] transition-all"
              />
            </div>

            <!-- Cover Image Drag & Drop -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                文章封面图 (Cover Image)
              </label>
              <div
                class="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-[#007AFF] transition-colors cursor-pointer bg-[#F8F8F8]/50 dark:bg-slate-800/30 group"
                @click="triggerImageSelect"
              >
                <div v-if="form.coverImage" class="relative group/img aspect-video rounded-xl overflow-hidden shadow-sm">
                  <img :src="form.coverImage" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    点击更换图片
                  </div>
                </div>
                <div v-else class="py-4 flex flex-col items-center gap-2">
                  <div class="w-10 h-10 rounded-full bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center text-xl">
                    🖼️
                  </div>
                  <p class="text-xs font-semibold text-slate-600 dark:text-slate-300">点击或拖拽上传封面图片</p>
                  <p class="text-[11px] text-slate-400">支持 JPG, PNG, WebP (建议 16:9)</p>
                </div>
              </div>
            </div>

            <!-- Input Pill Chips (Tags) -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                胶囊标签 (Input Pill Chips)
              </label>
              <div class="flex flex-wrap gap-2 p-2.5 rounded-2xl bg-[#F8F8F8] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 min-h-[46px] items-center">
                <span
                  v-for="(tag, idx) in form.tags"
                  :key="idx"
                  class="inline-flex items-center gap-1.5 px-3 py-1 bg-[#007AFF] text-white text-xs font-semibold rounded-full shadow-xs animate-in zoom-in-95 duration-150"
                >
                  #{{ tag }}
                  <button @click="removeTag(idx)" class="hover:text-rose-200 text-xs">✕</button>
                </span>
                <input
                  v-model="newTag"
                  type="text"
                  placeholder="输入标签按回车添加..."
                  class="flex-1 bg-transparent text-xs outline-none px-2 text-slate-700 dark:text-slate-200 min-w-[120px]"
                  @keydown.enter.prevent="addTag"
                />
              </div>
            </div>

            <!-- Category Selector -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                所属分类 (Category)
              </label>
              <select
                v-model="form.category"
                class="w-full px-4 py-2.5 rounded-full bg-[#F8F8F8] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#007AFF]"
              >
                <option v-for="cat in categories" :key="cat.id" :value="cat.name">
                  {{ cat.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              @click="close"
              class="px-5 py-2.5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              取消
            </button>
            <button
              @click="submit"
              class="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#007AFF] hover:bg-[#0062cc] shadow-[0_4px_15px_rgba(0,122,255,0.35)] active:scale-95 transition-all"
            >
              确认发布文章
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  initialData?: {
    slug: string
    seoTitle: string
    coverImage: string
    tags: string[]
    category: string
  }
}>()

const emit = defineEmits(['close', 'confirm'])

const blogStore = useBlogStore()
blogStore.init()
const categories = computed(() => blogStore.categories.value.filter(c => c.slug !== 'all'))

const form = reactive({
  slug: '',
  seoTitle: '',
  coverImage: '',
  tags: [] as string[],
  category: 'Design'
})

const newTag = ref('')

watch(
  () => props.isOpen,
  (val) => {
    if (val && props.initialData) {
      form.slug = props.initialData.slug
      form.seoTitle = props.initialData.seoTitle
      form.coverImage = props.initialData.coverImage
      form.tags = [...props.initialData.tags]
      form.category = props.initialData.category || 'Design'
    }
  },
  { immediate: true }
)

const addTag = () => {
  const val = newTag.value.trim()
  if (val && !form.tags.includes(val)) {
    form.tags.push(val)
    newTag.value = ''
  }
}

const removeTag = (index: number) => {
  form.tags.splice(index, 1)
}

const triggerImageSelect = () => {
  const sampleCovers = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'
  ]
  const randomCover = sampleCovers[Math.floor(Math.random() * sampleCovers.length)]
  form.coverImage = randomCover
}

const close = () => emit('close')
const submit = () => {
  emit('confirm', { ...form })
  close()
}
</script>

<style scoped>
.capsule-modal-fade-enter-active,
.capsule-modal-fade-leave-active {
  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.capsule-modal-fade-enter-from,
.capsule-modal-fade-leave-to {
  opacity: 0;
}
</style>
