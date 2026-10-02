<template>
  <div class="glass-card p-6 sm:p-8 space-y-6 announcement-sandbox">
    <!-- Header & Toggle Switch -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-black/[0.08]">
      <div class="space-y-1">
        <div class="flex items-center gap-2.5">
          <span class="admin-stat-icon text-amber-700 bg-amber-500/10 border-amber-600/20">
            <IconSax name="notification" :size="18" />
          </span>
          <h3 class="font-display font-bold text-lg text-[#121316]">
            全站广播公告与弹窗系统
          </h3>
          <span
            class="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border transition-colors"
            :class="announcement.enabled ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'"
          >
            {{ announcement.enabled ? '● 正在运行' : '○ 已停用' }}
          </span>
        </div>
        <p class="text-xs text-slate-500">
          支持置顶流光跑马灯、左下角极奢悬浮胶囊与进站首屏弹窗，配备所见即所得实时模拟沙盒。
        </p>
      </div>

      <!-- Right Action Controls -->
      <div class="flex items-center gap-3">
        <!-- AI Generator Trigger -->
        <button
          type="button"
          @click="$emit('open-ai')"
          class="px-3.5 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <span>✨</span>
          <span>AI 灵感润色</span>
        </button>

        <!-- Toggle Switch -->
        <label class="inline-flex items-center gap-2.5 cursor-pointer select-none px-3.5 py-2 rounded-xl bg-black/[0.03] hover:bg-black/[0.05] border border-black/[0.08] transition-all">
          <span class="text-xs font-bold text-slate-700">启用全站广播</span>
          <div class="relative">
            <input
              type="checkbox"
              v-model="announcement.enabled"
              class="sr-only peer"
            />
            <div class="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
          </div>
        </label>
      </div>
    </div>

    <!-- 1. Realtime WYSIWYG Sandbox Preview (实时所见即所得模拟器) -->
    <div class="rounded-2xl p-5 border border-amber-600/15 bg-gradient-to-b from-amber-500/[0.03] to-amber-500/[0.08] space-y-3.5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span class="text-xs font-mono font-bold tracking-wider uppercase text-amber-900">
            沙盒实时仿真预览 (LIVE SIMULATOR)
          </span>
        </div>
        <!-- Preview Mode Tabs -->
        <div class="flex items-center gap-1 p-1 rounded-xl bg-black/[0.04] border border-black/[0.06] text-[10px] font-mono">
          <button
            type="button"
            @click="previewMode = 'top-bar'"
            :class="['px-2.5 py-1 rounded-lg transition-all font-semibold cursor-pointer', previewMode === 'top-bar' ? 'bg-white text-amber-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800']"
          >
            置顶条 (Top Bar)
          </button>
          <button
            type="button"
            @click="previewMode = 'capsule'"
            :class="['px-2.5 py-1 rounded-lg transition-all font-semibold cursor-pointer', previewMode === 'capsule' ? 'bg-white text-amber-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800']"
          >
            浮动胶囊 (Capsule)
          </button>
          <button
            type="button"
            @click="previewMode = 'modal'"
            :class="['px-2.5 py-1 rounded-lg transition-all font-semibold cursor-pointer', previewMode === 'modal' ? 'bg-white text-amber-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800']"
          >
            居中弹窗 (Modal)
          </button>
        </div>
      </div>

      <!-- Preview Canvas -->
      <div class="relative min-h-[110px] rounded-xl border border-black/10 bg-slate-900/90 overflow-hidden flex items-center justify-center p-4 backdrop-blur-md shadow-inner">
        <!-- Background Mock Content Lines -->
        <div class="absolute inset-0 opacity-10 flex flex-col justify-around p-3 pointer-events-none select-none">
          <div class="h-2 w-1/3 bg-white rounded" />
          <div class="h-2 w-2/3 bg-white rounded" />
          <div class="h-2 w-1/2 bg-white rounded" />
        </div>

        <!-- Condition: Disabled -->
        <div v-if="!announcement.enabled" class="text-xs text-slate-400 font-mono flex items-center gap-1.5 z-10">
          <span>⚠️ 广播公告当前处于停用状态，开启后即可生效展示</span>
        </div>

        <!-- PREVIEW A: Top Bar -->
        <div
          v-else-if="previewMode === 'top-bar'"
          class="w-full py-2 px-3.5 rounded-lg border flex items-center justify-between text-xs font-sans shadow-md backdrop-blur-xl transition-all z-10"
          :class="getTopBarBgClass(announcement.badgeColor)"
        >
          <div class="flex items-center gap-2.5 overflow-hidden flex-1 px-1">
            <span
              class="text-[9px] font-bold font-mono uppercase px-2.5 py-0.5 rounded-full tracking-wider border flex items-center gap-1 flex-shrink-0"
              :class="getBadgeClass(announcement.badgeColor)"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {{ announcement.badge || 'NOTICE' }}
            </span>
            <div class="overflow-hidden flex-1 relative">
              <p
                :class="announcement.animation === 'marquee' ? 'animate-marquee whitespace-nowrap' : 'line-clamp-1'"
                class="font-medium text-xs leading-normal"
              >
                {{ announcement.text || '请在下方配置广播通知内容...' }}
              </p>
            </div>
            <span class="text-[11px] font-bold hover:underline flex items-center gap-1 flex-shrink-0 opacity-90">
              {{ announcement.ctaText || '查看详情 →' }}
            </span>
          </div>
          <button type="button" class="opacity-60 hover:opacity-100 p-1 ml-2 text-xs">✕</button>
        </div>

        <!-- PREVIEW B: Capsule -->
        <div
          v-else-if="previewMode === 'capsule'"
          class="w-full max-w-md rounded-2xl p-4 shadow-xl border flex items-start gap-3 backdrop-blur-2xl transition-all z-10"
          style="background: rgba(254, 252, 248, 0.95); border-color: rgba(200, 185, 160, 0.4);"
        >
          <span class="flex h-2.5 w-2.5 mt-1.5 relative flex-shrink-0">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" :class="getPingColor(announcement.badgeColor)" />
            <span class="relative inline-flex rounded-full h-2.5 w-2.5" :class="getDotColor(announcement.badgeColor)" />
          </span>
          <div class="flex-1 space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-[9px] font-bold tracking-widest font-mono uppercase px-2 py-0.5 rounded-full border" :class="getBadgeClass(announcement.badgeColor)">
                {{ announcement.badge || 'NOTICE' }}
              </span>
              <span v-if="announcement.subtitle" class="text-[10px] text-slate-400 font-mono">{{ announcement.subtitle }}</span>
            </div>
            <p class="text-xs font-semibold text-slate-900 leading-relaxed">
              {{ announcement.text || '请在下方配置广播通知内容...' }}
            </p>
            <div class="pt-0.5">
              <span class="text-[10px] font-bold text-amber-700 hover:underline">
                {{ announcement.ctaText || '查看详情 →' }}
              </span>
            </div>
          </div>
          <button type="button" class="text-slate-400 hover:text-slate-700 text-xs">✕</button>
        </div>

        <!-- PREVIEW C: Modal -->
        <div
          v-else-if="previewMode === 'modal'"
          class="w-full max-w-sm rounded-2xl p-5 shadow-2xl border flex flex-col gap-3 bg-white text-slate-900 z-10 text-center"
        >
          <div class="flex justify-between items-center border-b pb-2 border-slate-100">
            <span class="text-[9px] font-bold font-mono uppercase px-2.5 py-0.5 rounded-full border" :class="getBadgeClass(announcement.badgeColor)">
              {{ announcement.badge || 'NOTICE' }}
            </span>
            <span class="text-xs text-slate-400">✕</span>
          </div>
          <div class="space-y-1.5 py-1">
            <h4 class="font-bold text-sm text-slate-900">
              {{ announcement.subtitle || '重要通知与活动发布' }}
            </h4>
            <p class="text-xs text-slate-600 leading-relaxed">
              {{ announcement.text || '请在下方配置广播通知内容...' }}
            </p>
          </div>
          <div class="flex gap-2 justify-center pt-2">
            <button type="button" class="btn-primary text-xs py-1.5 px-4">
              {{ announcement.ctaText || '立即前往 →' }}
            </button>
            <button type="button" class="px-3 py-1.5 text-xs text-slate-500 rounded-lg border border-slate-200">
              知道了
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. One-click Template Presets (一键灵感模板库) -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <span>💡</span>
          <span>常用公告模板预设 (点击一键套用)</span>
        </label>
        <span class="text-[10px] font-mono text-slate-400">一键填充文案、配色与徽章</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        <button
          v-for="tpl in presets"
          :key="tpl.id"
          type="button"
          @click="applyPreset(tpl)"
          class="p-2.5 rounded-xl border border-black/[0.08] bg-black/[0.02] hover:bg-black/[0.06] hover:border-amber-600/30 text-left transition-all active:scale-95 group cursor-pointer"
        >
          <div class="flex items-center gap-1.5 mb-1">
            <span class="text-sm group-hover:scale-110 transition-transform">{{ tpl.icon }}</span>
            <span class="text-xs font-bold text-slate-800 line-clamp-1">{{ tpl.title }}</span>
          </div>
          <p class="text-[10px] text-slate-500 line-clamp-2 leading-tight">
            {{ tpl.text }}
          </p>
        </button>
      </div>
    </div>

    <!-- 3. Configuration Form (精细表单配置区) -->
    <div class="space-y-5 pt-2" :class="{ 'opacity-50 pointer-events-none': !announcement.enabled }">
      <!-- Row 1: Position, Animation, Badge Color -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="space-y-1.5">
          <label class="form-label text-xs font-bold">展示形态与位置 (Position)</label>
          <select v-model="announcement.position" class="form-input text-xs">
            <option value="capsule">左下角极奢悬浮胶囊 (Bottom Capsule)</option>
            <option value="top-bar">全站顶部置顶通告条 (Top Sticky Bar)</option>
            <option value="modal">进站居中震撼弹窗 (Popup Modal)</option>
          </select>
        </div>

        <div class="space-y-1.5">
          <label class="form-label text-xs font-bold">动效形态 (Animation)</label>
          <select v-model="announcement.animation" class="form-input text-xs">
            <option value="marquee">无缝跑马灯流动 (Marquee)</option>
            <option value="pulse">优雅呼吸微动 (Pulse)</option>
            <option value="fade">柔和渐隐微光 (Fade)</option>
          </select>
        </div>

        <div class="space-y-1.5">
          <label class="form-label text-xs font-bold">主题色系 (Color Preset)</label>
          <select v-model="announcement.badgeColor" class="form-input text-xs">
            <option value="amber">琥珀香槟金 (Amber - 经典奢华)</option>
            <option value="emerald">极光冷翠绿 (Emerald - 科技清透)</option>
            <option value="rose">晚霞炽焰红 (Rose - 醒目焦点)</option>
            <option value="indigo">深邃夜空蓝 (Indigo - 沉稳专业)</option>
            <option value="violet">霓虹幻影紫 (Violet - 创意先锋)</option>
            <option value="dark">纯粹黑白灰 (Monochrome - 现代极简)</option>
          </select>
        </div>
      </div>

      <!-- Row 2: Badge Text, Subtitle, Message Text -->
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div class="space-y-1.5 sm:col-span-3">
          <label class="form-label text-xs font-bold">徽章标语 (Badge)</label>
          <input
            v-model="announcement.badge"
            type="text"
            class="form-input font-mono uppercase text-xs"
            placeholder="NOTICE / HOT / OPEN"
          />
        </div>

        <div class="space-y-1.5 sm:col-span-3">
          <label class="form-label text-xs font-bold">副标题 (Subtitle / Optional)</label>
          <input
            v-model="announcement.subtitle"
            type="text"
            class="form-input text-xs"
            placeholder="例如：2026 档期同步开启"
          />
        </div>

        <div class="space-y-1.5 sm:col-span-6">
          <label class="form-label text-xs font-bold">正文文案 (Message Text)</label>
          <input
            v-model="announcement.text"
            type="text"
            class="form-input text-xs"
            placeholder="例如：🎬 2026 下半年商业 TVC 档期与电影 DI 调色开放预订中"
          />
        </div>
      </div>

      <!-- Row 3: Link URL, CTA Button, Dismiss Behavior -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="space-y-1.5">
          <label class="form-label text-xs font-bold">跳转链接 (Link URL)</label>
          <input
            v-model="announcement.link"
            type="text"
            class="form-input font-mono text-xs"
            placeholder="mailto:hello@xo.dev 或 /booking 或 https://..."
          />
        </div>

        <div class="space-y-1.5">
          <label class="form-label text-xs font-bold">CTA 按钮文案 (Action Label)</label>
          <input
            v-model="announcement.ctaText"
            type="text"
            class="form-input text-xs"
            placeholder="查看详情 → 或 立即预约"
          />
        </div>

        <div class="space-y-1.5">
          <label class="form-label text-xs font-bold">记忆策略 (Dismiss Behavior)</label>
          <select v-model="announcement.dismissDuration" class="form-input text-xs">
            <option :value="24">关闭后 24 小时内不再主动弹出</option>
            <option :value="72">关闭后 3 天内不再主动弹出</option>
            <option :value="0">每次访问页面均展示</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Bottom Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-black/[0.08]">
      <span class="text-[11px] text-slate-400 font-mono">
        💡 提示：修改后可点击【保存广播配置】，前台将即时生效并自动清除历史关闭限制。
      </span>
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="resetDismissal"
          class="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold text-slate-600 hover:text-amber-800 bg-black/[0.03] hover:bg-amber-500/10 border border-black/10 hover:border-amber-600/30 transition-all cursor-pointer active:scale-95"
          title="清除当前浏览器中记录的关闭状态，确保前台立刻弹出"
        >
          🔄 重置前台关闭记录
        </button>
        <button
          type="button"
          @click="$emit('save')"
          class="btn-primary py-2 px-6 text-xs font-bold flex items-center gap-1.5 rounded-xl shadow-md cursor-pointer active:scale-95"
        >
          <span>💾 保存广播配置</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  siteConfig: any
}>()

const emit = defineEmits(['save', 'open-ai', 'toast'])

// Ensure announcement object exists with defaults
const announcement = computed(() => {
  if (!props.siteConfig.announcement) {
    props.siteConfig.announcement = {
      enabled: true,
      position: 'capsule',
      animation: 'pulse',
      badge: 'NOTICE',
      badgeColor: 'amber',
      text: '🎬 2026 年下半年商业 TVC 档期与电影 DI 调色开放预订中',
      subtitle: '影视后期全流程服务',
      link: 'mailto:hello@xo.dev',
      ctaText: '查看详情 →',
      dismissDuration: 24
    }
  }
  return props.siteConfig.announcement
})

// Local preview mode switch
const previewMode = ref<'top-bar' | 'capsule' | 'modal'>('top-bar')

watch(() => announcement.value.position, (newPos) => {
  if (newPos) previewMode.value = newPos
}, { immediate: true })

// Template presets for quick application
const presets = [
  {
    id: 'booking',
    icon: '🎬',
    title: '商业 TVC 档期预订',
    badge: 'BOOKING',
    badgeColor: 'amber',
    position: 'capsule',
    animation: 'pulse',
    subtitle: '开放预订中',
    text: '🎬 2026 年下半年商业 TVC 档期与电影 DI 调色开放预订中，名额有限先到先得。',
    ctaText: '立即预约 →',
    link: '/booking'
  },
  {
    id: 'film-launch',
    icon: '✨',
    title: '4K HDR 新片上线',
    badge: 'NEW WORK',
    badgeColor: 'emerald',
    position: 'top-bar',
    animation: 'marquee',
    subtitle: '达芬奇色彩科学规范',
    text: '✨ 全新高端数码新品 TVC 商业主视觉大片全网首发，支持在线 4K HDR 深度审片。',
    ctaText: '在线展映 →',
    link: '/projects'
  },
  {
    id: 'discount',
    icon: '🔥',
    title: '限时合作优惠活动',
    badge: 'PROMO',
    badgeColor: 'rose',
    position: 'top-bar',
    animation: 'marquee',
    subtitle: '限时专属福利',
    text: '🔥 季度限定回馈：新老客户预订 TVC 全套剪辑与调色，即享首单 85 折及电影级 LUTs 赠送。',
    ctaText: '获取优惠 →',
    link: 'mailto:hello@xo.dev'
  },
  {
    id: 'delivery',
    icon: '💎',
    title: '专属加密交付系统',
    badge: 'VIP SYSTEM',
    badgeColor: 'indigo',
    position: 'capsule',
    animation: 'pulse',
    subtitle: '端到端高保真分发',
    text: '💎 个人与机构客户专属加密交付系统上线，支持直链极速下载与隐形防盗水印核验。',
    ctaText: '进入交付中心 →',
    link: '/delivery'
  },
  {
    id: 'holiday',
    icon: '📢',
    title: '外出采风与值守说明',
    badge: 'NOTICE',
    badgeColor: 'dark',
    position: 'top-bar',
    animation: 'pulse',
    subtitle: '服务周期提示',
    text: '📢 工作室将于下周赴川西进行电影实景采风拍摄，加急剪辑与调色需求请提前微信预约。',
    ctaText: '联系方式 →',
    link: 'mailto:hello@xo.dev'
  }
]

const applyPreset = (tpl: any) => {
  announcement.value.badge = tpl.badge
  announcement.value.badgeColor = tpl.badgeColor
  announcement.value.position = tpl.position
  announcement.value.animation = tpl.animation
  announcement.value.subtitle = tpl.subtitle
  announcement.value.text = tpl.text
  announcement.value.ctaText = tpl.ctaText
  announcement.value.link = tpl.link
  previewMode.value = tpl.position
  emit('toast', `✨ 已成功应用【${tpl.title}】公告模板！`)
}

const resetDismissal = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('xo_announcement_dismissed')
      localStorage.removeItem('xo_announcement_dismissed_hash')
      emit('toast', '✨ 已成功重置浏览器关闭记录，前台将立刻展示公告！')
    } catch (e) {}
  }
}

// Color class helpers for preview
const getBadgeClass = (color?: string) => {
  switch (color) {
    case 'emerald': return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
    case 'rose': return 'bg-rose-500/15 text-rose-700 border-rose-500/30'
    case 'indigo': return 'bg-indigo-500/15 text-indigo-700 border-indigo-500/30'
    case 'violet': return 'bg-purple-500/15 text-purple-700 border-purple-500/30'
    case 'dark': return 'bg-slate-900/10 text-slate-800 border-slate-900/20'
    default: return 'bg-amber-600/15 text-amber-800 border-amber-600/30'
  }
}

const getTopBarBgClass = (color?: string) => {
  switch (color) {
    case 'emerald': return 'bg-emerald-950/95 border-emerald-700/40 text-emerald-100'
    case 'rose': return 'bg-rose-950/95 border-rose-700/40 text-rose-100'
    case 'indigo': return 'bg-indigo-950/95 border-indigo-700/40 text-indigo-100'
    case 'violet': return 'bg-purple-950/95 border-purple-700/40 text-purple-100'
    case 'dark': return 'bg-[#121316]/98 border-slate-700/40 text-slate-100'
    default: return 'bg-[#1a1612]/98 border-amber-800/40 text-amber-100'
  }
}

const getDotColor = (color?: string) => {
  switch (color) {
    case 'emerald': return 'bg-emerald-500'
    case 'rose': return 'bg-rose-500'
    case 'indigo': return 'bg-indigo-500'
    case 'violet': return 'bg-purple-500'
    case 'dark': return 'bg-slate-700'
    default: return 'bg-amber-500'
  }
}

const getPingColor = (color?: string) => {
  switch (color) {
    case 'emerald': return 'bg-emerald-400'
    case 'rose': return 'bg-rose-400'
    case 'indigo': return 'bg-indigo-400'
    case 'violet': return 'bg-purple-400'
    case 'dark': return 'bg-slate-400'
    default: return 'bg-amber-400'
  }
}
</script>

<style scoped>
@keyframes marquee {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
.animate-marquee {
  display: inline-block;
  animation: marquee 16s linear infinite;
}
</style>
