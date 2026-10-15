<template>
  <SecurityVerificationModal
    :model-value="modelValue"
    :title="title"
    :subtitle="subtitle"
    :action-name="actionName"
    @update:model-value="(val) => emit('update:modelValue', val)"
    @verified="(token) => emit('verified', token)"
    @close="emit('close')"
  />
</template>

<script setup lang="ts">
import SecurityVerificationModal from './SecurityVerificationModal.vue'

interface Props {
  modelValue: boolean
  title?: string
  subtitle?: string
  actionName?: string
}

withDefaults(defineProps<Props>(), {
  title: '安全人机核验',
  subtitle: '点击光影微感应器完成生物人机安全核验',
  actionName: '操作认证'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'verified', token: string): void
  (e: 'close'): void
}>()
</script>
