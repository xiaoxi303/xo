<template>
  <div class="fixed bottom-6 left-6 z-[999999] pointer-events-auto select-none">
    <!-- Compact Trigger Button (Left-Bottom, Smaller Size) -->
    <button 
      type="button" 
      @click="toggleModal"
      class="w-11 h-11 rounded-full bg-gradient-to-r from-purple-600 via-amber-600 to-indigo-600 text-white shadow-xl flex items-center justify-center font-bold border border-white/60 hover:scale-110 active:scale-95 transition-all duration-300 ring-2 ring-purple-500/20 cursor-pointer group relative"
      title="点击召唤 Xo AI Neural Copilot 全局神经元对话面板"
    >
      <span class="text-base group-hover:rotate-12 transition-transform">🤖</span>
      <span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white animate-pulse" />
    </button>

    <!-- Expanded Large AI Copilot Chat Dialog -->
    <div 
      v-if="isOpen" 
      class="absolute bottom-14 left-0 w-[420px] sm:w-[500px] rounded-2xl glass-card border-2 border-purple-500/40 p-5 shadow-2xl space-y-3.5 bg-white/95 backdrop-blur-2xl ring-1 ring-black/10 text-left font-sans"
    >
      <div class="flex items-center justify-between border-b pb-3 border-black/10">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
          <span class="font-bold text-sm text-[#121316]">Xo AI Neural Copilot (全局大模型助手)</span>
        </div>
        <button type="button" @click="isOpen = false" class="text-slate-400 hover:text-black font-bold text-sm px-2 py-0.5 rounded hover:bg-black/5">✕</button>
      </div>

      <div class="h-80 overflow-y-auto space-y-3 p-3.5 rounded-xl bg-black/[0.02] border border-black/[0.05] text-xs">
        <div v-for="(msg, idx) in messages" :key="idx" :class="[msg.role === 'user' ? 'text-right' : 'text-left']">
          <div 
            :class="[
              'inline-block p-3 rounded-2xl max-w-[90%] text-left whitespace-pre-wrap shadow-sm leading-relaxed text-xs',
              msg.role === 'user' ? 'bg-amber-600 text-white font-medium' : 'bg-purple-600/10 text-purple-950 border border-purple-500/20'
            ]"
          >
            {{ msg.text }}
          </div>
        </div>
      </div>

      <div class="flex gap-2 pt-1">
        <input 
          v-model="promptInput" 
          @keydown.enter="sendMessage" 
          placeholder="输入任何 AI 指令 (如: 诊断系统健康、优化作品文案)..." 
          class="form-input text-xs flex-1 py-2.5 px-3.5 rounded-xl"
        />
        <button 
          type="button" 
          @click="sendMessage" 
          :disabled="isLoading"
          class="btn-primary py-2.5 px-4 text-xs bg-purple-600 hover:bg-purple-700 text-white border-none rounded-xl font-bold flex items-center gap-1 active:scale-95"
        >
          <span v-if="isLoading" class="animate-spin">⏳</span>
          <span v-else>发送</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const isOpen = ref(false)
const isLoading = ref(false)
const promptInput = ref('')

const messages = ref<Array<{ role: string; text: string }>>([
  { role: 'ai', text: '🤖 您好！我是 Xo 全面板 AI 神经元 Copilot。我已 100% 挂载于作品、客户锁、广播条、音效调色沙盒与安全大屏。请输入任何 AI 指令！' }
])

const toggleModal = () => {
  isOpen.value = !isOpen.value
}

const sendMessage = async () => {
  if (!promptInput.value.trim() || isLoading.value) return
  const userText = promptInput.value.trim()
  messages.value.push({ role: 'user', text: userText })
  promptInput.value = ''
  isLoading.value = true

  try {
    const res = await $fetch('/api/ai/assistant', {
      method: 'POST',
      body: { action: 'copilot-command', prompt: userText }
    }) as any
    if (res && res.success) {
      messages.value.push({ role: 'ai', text: res.reply })
    }
  } catch (e) {
    messages.value.push({ role: 'ai', text: '🤖 AI 神经元连接异常，请重试。' })
  } finally {
    isLoading.value = false
  }
}
</script>
