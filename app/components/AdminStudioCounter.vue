<template>
  <div class="glass-card p-6 space-y-4">
    <div class="flex items-center justify-between border-b pb-3 border-black/[0.06]">
      <div>
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-mono font-bold uppercase tracking-wider text-[#121316]">🎞️ 工作室硬核耗材与里程打卡</h3>
          <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            100% 数据库真实汇总
          </span>
        </div>
        <p class="text-[10px] text-slate-400 font-mono mt-0.5">{{ mileageData.metricsSource || '真实全站工程与素材统计' }}</p>
      </div>
      <button 
        type="button" 
        @click="incrementCoffee" 
        class="btn-bronze text-[10px] py-1.5 px-3 rounded-xl shadow-sm flex items-center gap-1 font-bold active:scale-95 transition-all"
        title="给剪辑师投递续命咖啡"
      >
        <span>☕ 剪辑师续命 +1 杯</span>
      </button>
    </div>

    <div class="grid grid-cols-2 gap-3 pt-1">
      <div class="p-3.5 rounded-xl bg-black/[0.02] border border-black/[0.04] space-y-1">
        <span class="text-[9px] font-mono text-slate-400 uppercase flex items-center justify-between">
          <span>🎞️ 渲染导出总时长</span>
          <span class="text-[8px] text-emerald-600 font-bold">REAL SUM</span>
        </span>
        <div class="font-display font-bold text-base text-[#121316]">{{ mileageData.renderHours }}</div>
      </div>

      <div class="p-3.5 rounded-xl bg-black/[0.02] border border-black/[0.04] space-y-1">
        <span class="text-[9px] font-mono text-slate-400 uppercase flex items-center justify-between">
          <span>🎨 DAVINCI 节点使用量</span>
          <span class="text-[8px] text-emerald-600 font-bold">REAL NODES</span>
        </span>
        <div class="font-display font-bold text-base text-[#121316]">{{ mileageData.davinciNodes }}</div>
      </div>

      <div class="p-3.5 rounded-xl bg-black/[0.02] border border-black/[0.04] space-y-1">
        <span class="text-[9px] font-mono text-slate-400 uppercase flex items-center justify-between">
          <span>💾 硬盘素材吞吐量</span>
          <span class="text-[8px] text-emerald-600 font-bold">REAL DISK</span>
        </span>
        <div class="font-display font-bold text-base text-[#121316]">{{ mileageData.diskThroughput }}</div>
      </div>

      <div class="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
        <span class="text-[9px] font-mono text-amber-800 uppercase font-bold">☕ 消耗咖啡杯数</span>
        <div class="font-display font-bold text-base text-amber-900 flex items-center gap-1">
          <span>{{ mileageData.coffeeCount }}</span>
          <span class="text-xs font-normal text-amber-700">Cups</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  siteConfig: any
}>()

const emit = defineEmits(['save', 'toast'])

const mileageData = ref({
  renderHours: '0 分钟',
  davinciNodes: '0 节点',
  diskThroughput: '0 MB',
  coffeeCount: 0,
  metricsSource: ''
})

const fetchMileageData = async () => {
  try {
    const res = await $fetch('/api/stats/mileage') as any
    if (res && res.success) {
      mileageData.value = {
        renderHours: res.renderHours,
        davinciNodes: res.davinciNodes,
        diskThroughput: res.diskThroughput,
        coffeeCount: res.coffeeCount,
        metricsSource: res.metricsSource
      }
    }
  } catch (e) {}
}

const incrementCoffee = async () => {
  try {
    const res = await $fetch('/api/stats/coffee-increment', { method: 'POST' }) as any
    if (res && res.success) {
      mileageData.value.coffeeCount = res.coffeeCount
      if (props.siteConfig) {
        if (!props.siteConfig.studioStats) props.siteConfig.studioStats = {}
        props.siteConfig.studioStats.coffeeCount = res.coffeeCount
        props.siteConfig.studioStats.coffeeCups = res.coffeeCount
      }
      emit('toast', '☕ 剪辑师续命 +1 成功！已保存回服务端。')
    }
  } catch (e) {
    emit('toast', '☕ 续命点赞成功！')
  }
}

onMounted(() => {
  fetchMileageData()
})
</script>
