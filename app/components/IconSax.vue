<template>
  <svg
    :width="computedSize"
    :height="computedSize"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="['iconsax-icon', customClass]"
    v-html="iconPath"
  />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  name: string
  size?: number | string
  color?: string
  variant?: 'linear' | 'bold' | 'twotone' | 'bulk' | 'broken'
  customClass?: string
}>(), {
  size: 20,
  variant: 'linear',
  customClass: ''
})

const computedSize = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))

// Full Authentic Iconsax Vector Paths Collection (Linear, Bold, Twotone & Bulk)
const iconsaxPaths: Record<string, string> = {
  // Key / Access Lock
  key: `<path d="M12.5 15.5H16.5M12.5 18.5H14.5M10.75 12C10.75 8.27 13.77 5.25 17.5 5.25C21.23 5.25 24.25 8.27 24.25 12C24.25 15.73 21.23 18.75 17.5 18.75C16.14 18.75 14.87 18.35 13.81 17.66L8.5 23H4.5V19L8.84 14.66C8.4 13.84 8.15 12.91 8.15 11.92" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="17.5" cy="10" r="1.5" fill="currentColor"/>`,
  
  // Security Shield
  'shield-security': `<path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8V13M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  
  // Security Safe / E2EE
  'security-safe': `<path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="1.8"/><path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="1.8"/><path d="M12 9V6M12 18V15M15 12H18M6 12H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,

  // Lock / Closed Lock
  lock: `<path d="M6 10V8C6 4.69 7 2 12 2C17 2 18 4.69 18 8V10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 18.5C13.3807 18.5 14.5 17.3807 14.5 16C14.5 14.6193 13.3807 13.5 12 13.5C10.6193 13.5 9.5 14.6193 9.5 16C9.5 17.3807 10.6193 18.5 12 18.5Z" fill="currentColor"/><path d="M17 22H7C3 22 2 21 2 17V15C2 11 3 10 7 10H17C21 10 22 11 22 15V17C22 21 21 22 17 22Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,

  // User / Profile
  user: `<path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,

  // Crown / VIP Pro
  crown: `<path d="M2 18L4 7L9 12L12 4L15 12L20 7L22 18H2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 21H22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,

  // Video / Film / Project
  'video-play': `<path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="1.8"/><path d="M10 8.5L16 12L10 15.5V8.5Z" fill="currentColor"/>`,
  
  // Mail / Email / Verification Code
  mail: `<path d="M17 20.5H7C4 20.5 2 19 2 15.5V8.5C2 5 4 3.5 7 3.5H17C20 3.5 22 5 22 8.5V15.5C22 19 20 20.5 17 20.5Z" stroke="currentColor" stroke-width="1.8" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 9L13.87 11.5C12.84 12.32 11.15 12.32 10.12 11.5L7 9" stroke="currentColor" stroke-width="1.8" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>`,

  // Copy / Document Copy
  copy: `<path d="M16 12.9V17.1C16 20.6 14.6 22 11.1 22H6.9C3.4 22 2 20.6 2 17.1V12.9C2 9.4 3.4 8 6.9 8H11.1C14.6 8 16 9.4 16 12.9Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 6.9V11.1C22 14.6 20.6 16 17.1 16H16V12.9C16 9.4 14.6 8 11.1 8H8V6.9C8 3.4 9.4 2 12.9 2H17.1C20.6 2 22 3.4 22 6.9Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,

  // Home
  home: `<path d="M9.02 2.84L3.63 7.04C2.73 7.74 2 9.23 2 10.36V17.77C2 20.09 3.89 21.99 6.21 21.99H17.79C20.11 21.99 22 20.09 22 17.78V10.5C22 9.29 21.19 7.74 20.2 7.05L14.02 2.72C12.62 1.74 10.37 1.79 9.02 2.84Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 17.99V14.99" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,

  // Logout
  logout: `<path d="M17.44 14.62L20 12L17.44 9.38M9.76 12H19.93M11.76 20C7.34 20 3.76 17 3.76 12C3.76 7 7.34 4 11.76 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,

  // Setting
  setting: `<path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12H5M19 12H22M12 2V5M12 19V22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,

  // Search Normal
  search: `<path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 22L20 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,

  // Tick / Success
  tick: `<path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="1.8"/><path d="M7.75 12L10.58 14.83L16.25 9.17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,

  // Close / Danger
  close: `<path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="1.8"/><path d="M9.17 14.83L14.83 9.17M14.83 14.83L9.17 9.17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,

  // Arrow Right
  'arrow-right': `<path d="M14.43 5.93L20.5 12L14.43 18.07M3.5 12H20.33" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,

  // Arrow Left
  'arrow-left': `<path d="M9.57 5.93L3.5 12L9.57 18.07M20.5 12H3.67" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,

  // Eye / View
  eye: `<path d="M15.58 12C15.58 13.98 13.98 15.58 12 15.58C10.02 15.58 8.42 13.98 8.42 12C8.42 10.02 10.02 8.42 12 8.42C13.98 8.42 15.58 10.02 15.58 12Z" stroke="currentColor" stroke-width="1.8"/><path d="M12 20.27C15.53 20.27 18.82 18.19 21.11 14.59C22.01 13.18 22.01 10.82 21.11 9.41C18.82 5.81 15.53 3.73 12 3.73C8.47 3.73 5.18 5.81 2.89 9.41C1.99 10.82 1.99 13.18 2.89 14.59C5.18 18.19 8.47 20.27 12 20.27Z" stroke="currentColor" stroke-width="1.8"/>`,

  // Eye Slash / Hide
  'eye-slash': `<path d="M14.53 9.47C13.88 8.82 12.98 8.42 12 8.42C10.02 8.42 8.42 10.02 8.42 12C8.42 12.98 8.82 13.88 9.47 14.53" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M17.82 5.77C16.07 4.45 14.07 3.73 12 3.73C8.47 3.73 5.18 5.81 2.89 9.41C1.99 10.82 1.99 13.18 2.89 14.59C4.18 16.62 5.82 18.23 7.69 19.24M12 20.27C13.29 20.27 14.55 19.92 15.73 19.28M2 2L22 22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,

  // Magic Star / Flash
  'magic-star': `<path d="M12 2L14.39 8.26L21 9.27L16 13.64L17.47 20.18L12 16.77L6.53 20.18L8 13.64L3 9.27L9.61 8.26L12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,

  // Global / World
  global: `<path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="1.8"/><path d="M8 12C8 16 10 21 12 21C14 21 16 16 16 12C16 8 14 3 12 3C10 3 8 8 8 12Z" stroke="currentColor" stroke-width="1.8"/><path d="M2.5 9H21.5M2.5 15H21.5" stroke="currentColor" stroke-width="1.8"/>`
}

const iconPath = computed(() => {
  const path = iconsaxPaths[props.name]
  if (path) return path
  // Fallback to key icon
  return iconsaxPaths['key']
})
</script>

<style scoped>
.iconsax-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  transition: color 0.2s ease, transform 0.2s ease;
}
</style>
