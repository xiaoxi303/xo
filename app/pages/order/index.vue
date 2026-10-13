<template>
  <main class="catalog-page">
    <!-- Ambient Studio Lights -->
    <div class="ambient ambient-one" aria-hidden="true" />
    <div class="ambient ambient-two" aria-hidden="true" />
    <div class="ambient ambient-three" aria-hidden="true" />

    <section class="catalog-shell">
      <!-- Top Navigation Bar -->
      <header class="catalog-topbar">
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="brand-mark" aria-label="返回 XO Studio 首页">
            XO
          </NuxtLink>
          <div class="hidden sm:flex items-center gap-2 pl-3 border-l border-black/10">
            <span class="text-[10px] font-mono tracking-widest uppercase text-amber-900/70 font-bold">
              ORDER & CHECKOUT
            </span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <SecureSessionChip />
          <NuxtLink
            to="/client"
            class="text-xs font-mono font-bold px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600/10 via-amber-500/15 to-amber-600/10 hover:from-amber-600/20 hover:to-amber-600/20 text-amber-900 border border-amber-500/30 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>👤 客户中心 ↗</span>
          </NuxtLink>
        </div>
      </header>

      <!-- Main Hero Header -->
      <div class="catalog-hero space-y-6">
        <div class="space-y-3">
          <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-950 text-[10px] font-mono font-bold border border-amber-500/25 uppercase tracking-widest">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            <span>XO STUDIO · 甄选影视后期制作与专属服务</span>
          </div>

          <h1 class="font-display font-bold text-3xl sm:text-5xl text-[#121316] tracking-tight">
            商业服务与制作定金结算
          </h1>

          <p class="text-xs sm:text-sm text-[#5e6066] max-w-2xl leading-relaxed">
            商品名称与结算金额由数字工作室后台统一定制维护，客户不可自行篡改。支持商业 TVC、院线调色及剪辑排期付款，支付完成即时启动数字交付通道。
          </p>
        </div>

        <!-- VIP Private Quotations Callout Banner -->
        <NuxtLink
          to="/client"
          class="catalog-vip-box group"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/25 to-amber-600/15 border border-amber-500/30 flex items-center justify-center text-amber-900 font-bold text-lg shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              👑
            </div>
            <div class="min-w-0 space-y-0.5">
              <div class="flex items-center gap-2 flex-wrap">
                <strong class="text-xs sm:text-sm font-bold text-[#121316] group-hover:text-amber-900 transition-colors">
                  持有专属定向报价单 / 私密订单？
                </strong>
                <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 uppercase">
                  VIP 独立通道
                </span>
              </div>
              <p class="text-[11px] sm:text-xs text-[#5e6066] truncate">
                所有为指定客户绑定的专属定金与母带尾款已自动同步至客户控制台，不在公开目录展示。
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1.5 text-xs font-bold font-mono text-amber-800 shrink-0 group-hover:translate-x-1 transition-transform self-end sm:self-center">
            <span>前往客户中心查看 ↗</span>
          </div>
        </NuxtLink>
      </div>

      <!-- Cinema Service Guarantees Ribbon (4 Cards) -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 py-6">
        <div class="p-3.5 rounded-2xl bg-white/70 border border-black/[0.05] shadow-xs space-y-1">
          <div class="text-base">🛡️</div>
          <strong class="text-xs text-[#121316] block font-bold">官方直连清算</strong>
          <span class="text-[10px] font-mono text-[#82848c] block">支付宝安全即时到账</span>
        </div>
        <div class="p-3.5 rounded-2xl bg-white/70 border border-black/[0.05] shadow-xs space-y-1">
          <div class="text-base">🎬</div>
          <strong class="text-xs text-[#121316] block font-bold">DCI-P3 电影色彩</strong>
          <span class="text-[10px] font-mono text-[#82848c] block">4K 杜比视界高动态校色</span>
        </div>
        <div class="p-3.5 rounded-2xl bg-white/70 border border-black/[0.05] shadow-xs space-y-1">
          <div class="text-base">🔒</div>
          <strong class="text-xs text-[#121316] block font-bold">专属私密放映室</strong>
          <span class="text-[10px] font-mono text-[#82848c] block">双屏校审独立防泄密节点</span>
        </div>
        <div class="p-3.5 rounded-2xl bg-white/70 border border-black/[0.05] shadow-xs space-y-1">
          <div class="text-base">⚡</div>
          <strong class="text-xs text-[#121316] block font-bold">极速高码率提取</strong>
          <span class="text-[10px] font-mono text-[#82848c] block">云端母带光纤无损提取</span>
        </div>
      </div>

      <!-- Loading / Error States -->
      <div v-if="loading" class="py-24 text-center space-y-3">
        <span class="w-8 h-8 rounded-full border-2 border-amber-700 border-t-transparent animate-spin inline-block" />
        <p class="text-xs font-mono text-[#82848c]">正在载入公共服务目录…</p>
      </div>

      <div v-else-if="error" class="p-8 rounded-3xl bg-rose-50 border border-rose-100 text-center space-y-2">
        <p class="text-xs font-bold text-rose-700">⚠️ {{ error }}</p>
        <button
          @click="fetchItems"
          class="text-xs font-mono text-amber-800 underline cursor-pointer"
        >
          重试载入
        </button>
      </div>

      <!-- Public Catalog Grid -->
      <div v-else-if="items.length" class="space-y-4">
        <div class="flex items-center justify-between px-1">
          <span class="text-xs font-bold text-[#121316] flex items-center gap-1.5 font-mono">
            <span>● 公开服务项目</span>
            <span class="text-slate-400 font-normal">({{ items.length }} 项就绪)</span>
          </span>
          <span class="text-[11px] font-mono text-slate-400">点击进入专属订单结算</span>
        </div>

        <div class="catalog-grid">
          <div
            v-for="item in items"
            :key="item.suffix"
            class="glass-card product-card flex flex-col justify-between group"
          >
            <!-- Top Amber Line -->
            <div class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 opacity-60 group-hover:opacity-100 transition-opacity" />

            <!-- Card Top Section -->
            <div class="space-y-4">
              <div class="flex items-start justify-between gap-3">
                <span class="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-black/[0.04] text-[#5e6066] border border-black/[0.04]">
                  /order/{{ item.suffix }}
                </span>
                <div class="text-right">
                  <span class="text-[10px] font-mono text-slate-400 uppercase block">固定服务费</span>
                  <strong class="font-display font-bold text-2xl text-amber-900 tracking-tight">
                    <i class="text-base font-normal mr-0.5 not-italic">¥</i>{{ item.amount }}
                  </strong>
                </div>
              </div>

              <div class="space-y-2 pt-1">
                <h2 class="font-display font-bold text-xl text-[#121316] group-hover:text-amber-900 transition-colors line-clamp-1">
                  {{ item.subject }}
                </h2>
                <p v-if="item.clientName" class="text-xs font-mono text-amber-800">
                  适用对象：{{ item.clientName }}
                </p>
                <p v-if="item.description" class="text-xs text-[#5e6066] leading-relaxed line-clamp-3">
                  {{ item.description }}
                </p>
              </div>
            </div>

            <!-- Card Bottom Section -->
            <div class="pt-5 border-t border-black/[0.05] mt-6 flex items-center justify-between">
              <span class="text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>支持支付宝直付</span>
              </span>

              <NuxtLink
                :to="`/order/${encodeURIComponent(item.suffix)}`"
                class="btn-bronze text-xs py-2 px-4 rounded-xl shadow-xs flex items-center gap-1.5 group-hover:shadow-md transition-all cursor-pointer"
              >
                <span>立即付款 ↗</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="glass-card p-12 sm:p-16 rounded-[32px] text-center flex flex-col items-center justify-center space-y-4 border border-black/[0.06]">
        <div class="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 text-3xl">
          🎬
        </div>
        <div class="space-y-1.5 max-w-md">
          <h3 class="font-display font-bold text-lg text-[#121316]">当前暂无全站公开服务商品</h3>
          <p class="text-xs text-[#82848c] leading-relaxed">
            所有影视制作排期定金与母带尾款均实行一对一定向派单保护。若您已与工作室达成合作意向，请直接登录客户控制中心查看您的专属报价单。
          </p>
        </div>
        <div class="flex items-center gap-3 pt-2">
          <NuxtLink to="/client" class="btn-bronze text-xs py-2.5 px-5 rounded-2xl shadow-sm flex items-center gap-1.5">
            <span>进入客户中心 ↗</span>
          </NuxtLink>
          <NuxtLink to="/" class="text-xs font-bold text-[#82848c] hover:text-[#121316] underline px-3">
            返回工作室首页
          </NuxtLink>
        </div>
      </div>

      <!-- Questions & FAQ Strip -->
      <section class="mt-12 p-6 sm:p-8 rounded-[28px] bg-white/70 border border-black/[0.05] shadow-xs space-y-4">
        <h3 class="font-display font-bold text-sm text-[#121316]">
          常见支付与交付问题
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#5e6066] leading-relaxed">
          <div class="space-y-1">
            <strong class="text-[#121316] block font-bold">Q: 付款后如何查验母带制作进度？</strong>
            <p>A: 支付完成后系统会自动在您的客户中心生成付款电子凭证，并同时为您的账户关联独立交付放映厅（Suite URL），支持在线免密审片与高码率文件提取。</p>
          </div>
          <div class="space-y-1">
            <strong class="text-[#121316] block font-bold">Q: 如何获取我个人的专属项目报价单？</strong>
            <p>A: 项目负责人会在后台根据排期和制作要求创建带有专属标识的订单页面，并直接绑定到您的注册账号名下。该报价单仅在您的客户控制台专属可见。</p>
          </div>
        </div>
      </section>

      <!-- Footer Tag -->
      <footer class="catalog-footer">
        <p>XO STUDIO <span>·</span> SECURE CHECKOUT CATALOG</p>
      </footer>
    </section>
  </main>
</template>

<script setup lang="ts">
useHead({
  title: '服务订单目录 — XO Studio',
  meta: [{ name: 'description', content: 'XO Studio 电影级影视后期与定制调色服务订单目录' }]
})

const items = ref<any[]>([])
const loading = ref(true)
const error = ref('')

const fetchItems = async () => {
  loading.value = true
  error.value = ''
  try {
    items.value = await $fetch<any[]>('/api/order?t=' + Date.now())
  } catch (err: any) {
    error.value = err.data?.statusMessage || '服务商品加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

onMounted(fetchItems)
</script>

<style scoped>
.catalog-page {
  min-height: 100svh;
  position: relative;
  overflow: hidden;
  padding: 48px 24px 40px;
  color: #121316;
  background: #fdfbf7;
  background-image:
    radial-gradient(circle at 8% 10%, rgba(217, 119, 6, 0.09), transparent 35%),
    radial-gradient(circle at 94% 15%, rgba(180, 83, 9, 0.08), transparent 32%),
    radial-gradient(circle at 80% 90%, rgba(245, 158, 11, 0.08), transparent 36%),
    linear-gradient(135deg, #fdfcf9 0%, #f7f2ea 52%, #f5eee4 100%);
}

.ambient-one {
  position: absolute;
  top: -15%;
  left: -10%;
  width: 50vw;
  height: 50vw;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(217, 119, 6, 0.12), transparent 70%);
  filter: blur(80px);
  pointer-events: none;
}

.ambient-two {
  position: absolute;
  bottom: -15%;
  right: -10%;
  width: 50vw;
  height: 50vw;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(180, 83, 9, 0.10), transparent 70%);
  filter: blur(80px);
  pointer-events: none;
}

.ambient-three {
  position: absolute;
  top: 40%;
  right: 20%;
  width: 40vw;
  height: 40vw;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.06), transparent 70%);
  filter: blur(90px);
  pointer-events: none;
}

.catalog-shell {
  width: min(100%, 980px);
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.catalog-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 28px;
}

.brand-mark {
  color: #121316;
  text-decoration: none;
  font: 800 22px/1 'Xo Display', Georgia, serif;
  letter-spacing: .16em;
  transition: opacity 0.2s;
}

.brand-mark:hover {
  opacity: 0.8;
}

.catalog-vip-box {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 24px;
  background: rgba(255, 254, 250, 0.88);
  border: 1px solid rgba(217, 119, 6, 0.28);
  box-shadow: 0 10px 30px rgba(180, 120, 40, 0.06);
  text-decoration: none;
  transition: all 0.25s ease;
}

@media (min-width: 640px) {
  .catalog-vip-box {
    flex-direction: row;
    align-items: center;
  }
}

.catalog-vip-box:hover {
  border-color: rgba(217, 119, 6, 0.5);
  box-shadow: 0 14px 40px rgba(180, 120, 40, 0.12);
  transform: translateY(-2px);
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

@media (max-width: 720px) {
  .catalog-grid {
    grid-template-columns: 1fr;
  }
}

.product-card {
  position: relative;
  overflow: hidden;
  padding: 28px;
  border-radius: 28px;
  background: rgba(255, 254, 250, 0.88);
  border: 1px solid rgba(217, 119, 6, 0.20);
  box-shadow: 0 20px 60px rgba(180, 120, 40, 0.06);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.product-card:hover {
  transform: translateY(-4px);
  border-color: rgba(217, 119, 6, 0.4);
  box-shadow: 0 24px 70px rgba(180, 120, 40, 0.12);
}

.catalog-footer {
  margin: 36px 0 0;
  text-align: center;
  color: #82848c;
  font: 10px/1.2 'Xo Mono', monospace;
  letter-spacing: .16em;
}

.catalog-footer span {
  margin: 0 7px;
  color: #b45309;
}

.btn-bronze {
  background: linear-gradient(135deg, #c27a3d, #b45309);
  color: #fff;
  font-weight: 700;
  transition: all 0.25s ease;
}

.btn-bronze:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}
</style>
