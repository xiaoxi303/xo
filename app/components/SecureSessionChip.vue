<template>
  <span class="secure-session-chip" :class="{ 'is-ready': session.ready }" :title="chipTitle">
    <span class="secure-session-icon" aria-hidden="true">{{ session.ready ? '✓' : '·' }}</span>
    <span>{{ session.ready ? '安全会话' : '建立安全会话' }}</span>
    <small v-if="session.ready">{{ session.fingerprint }}</small>
  </span>
</template>

<script setup lang="ts">
const { session, init } = useSecureSession()
const chipTitle = computed(() => session.value.ready
  ? `${session.value.algorithm} · ${session.value.fingerprint}`
  : session.value.error || '正在初始化浏览器安全会话')

onMounted(init)
</script>

<style scoped>
.secure-session-chip{display:inline-flex;align-items:center;gap:7px;color:#526579;font-size:11px;white-space:nowrap}.secure-session-icon{display:grid;place-items:center;width:18px;height:18px;border:1px solid rgba(76,105,126,.24);border-radius:50%;color:#6e8298;background:rgba(255,255,255,.26);font-size:11px;font-weight:700;box-shadow:0 1px 0 rgba(255,255,255,.8) inset}.secure-session-chip.is-ready{color:#176d68}.secure-session-chip.is-ready .secure-session-icon{color:#fff;border-color:rgba(23,168,88,.45);background:linear-gradient(145deg,#28ba73,#159456);box-shadow:0 4px 12px rgba(21,148,86,.2),0 1px 0 rgba(255,255,255,.5) inset}.secure-session-chip small{padding-left:4px;color:#8294a8;font:700 9px/1 'Xo Mono',monospace;letter-spacing:.08em}
</style>
