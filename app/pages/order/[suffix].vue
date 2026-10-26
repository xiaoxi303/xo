<template>
  <main class="order-page">
    <!-- Ambient luxury lighting effects -->
    <div class="ambient ambient-one" aria-hidden="true" />
    <div class="ambient ambient-two" aria-hidden="true" />
    <div class="ambient ambient-three" aria-hidden="true" />

    <section class="order-shell">
      <!-- Top Navigation Bar -->
      <header class="order-topbar">
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="brand-mark" aria-label="返回 XO Studio 首页">
            XO
          </NuxtLink>
          <span class="text-[10px] font-mono tracking-widest uppercase text-amber-900/60 font-bold hidden sm:inline">
            CINEMA CHECKOUT
          </span>
        </div>

        <div class="flex items-center gap-2.5">
          <SecureSessionChip />
          <NuxtLink
            to="/client"
            class="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono font-bold px-3 py-1 rounded-xl bg-black/[0.04] hover:bg-black/[0.08] text-[#121316] transition-colors"
          >
            <span>👤 客户中心 ↗</span>
          </NuxtLink>
        </div>
      </header>

      <!-- Main Voucher Card -->
      <section class="order-card">
        <!-- Top subtle luxury gradient line -->
        <div class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700" />

        <!-- Loading State -->
        <div v-if="loadingPage" class="py-20 text-center space-y-3">
          <span class="w-8 h-8 rounded-full border-2 border-amber-700 border-t-transparent animate-spin inline-block" />
          <p class="text-xs font-mono text-[#82848c]">正在安全载入订单凭证…</p>
        </div>

        <!-- Order Content -->
        <template v-else-if="page">
          <!-- Eyebrow Meta Bar -->
          <div class="order-eyebrow">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="section-kicker">PRIVATE ORDER</span>
              <span class="suffix-badge">#{{ suffix }}</span>
              <span v-if="page.clientUsername" class="vip-client-pill">
                👑 客户专属: @{{ page.clientUsername }}
              </span>
            </div>
            <div class="flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 font-bold">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>官方直连安全网关</span>
            </div>
          </div>

          <!-- Product Heading & Price Banner -->
          <div class="order-heading">
            <div class="product-meta">
              <div class="product-icon-wrap" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M7 3h10v18H7z" />
                  <path d="M9.5 7h5M9.5 11h5M9.5 15h3" />
                </svg>
              </div>
              <div class="space-y-1 min-w-0">
                <p class="product-kicker">专属影视制作服务</p>
                <h1 class="product-title">{{ page.subject }}</h1>
                <p v-if="page.clientName" class="client-name">
                  <span>项目指定方：</span><strong>{{ page.clientName }}</strong>
                </p>
              </div>
            </div>

            <div class="price-block">
              <small>{{ isPaidState ? '实付结算金额' : '应付结算金额' }}</small>
              <strong class="price-val"><i>¥</i>{{ page.amount }}</strong>
            </div>
          </div>

          <!-- Product Description (if any) -->
          <div v-if="page.description" class="order-desc-box">
            <p>{{ page.description }}</p>
          </div>

          <div class="order-divider" />

          <!-- ================= STATE 1: PAYMENT SUCCESS CELEBRATION VOUCHER ================= -->
          <div v-if="isPaidState" class="success-voucher space-y-6">
            <!-- Animated Success Hero -->
            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-white to-emerald-500/5 border border-emerald-500/25 shadow-xs">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0">
                ✓
              </div>
              <div class="space-y-1.5 text-center sm:text-left">
                <div class="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span class="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-600/15 text-emerald-900">
                    PAYMENT COMPLETED
                  </span>
                  <span class="text-xs font-mono text-slate-400">
                    {{ new Date().toLocaleDateString() }}
                  </span>
                </div>
                <h2 class="font-display font-bold text-xl sm:text-2xl text-[#121316]">
                  款项已安全结清 · 交付流程已启动
                </h2>
                <p class="text-xs text-[#5e6066] leading-relaxed max-w-xl">
                  {{ page.successText || '感谢付款，我们会按约定完成制作交付。款项已由官方安全托管，项目负责人已收到通知。' }}
                </p>
              </div>
            </div>

            <!-- Detailed Luxury Receipt Statement (奢华电子对账清单) -->
            <div class="p-5 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-3">
              <div class="flex items-center justify-between pb-2 border-b border-black/[0.05]">
                <span class="text-xs font-bold font-mono tracking-wider text-[#121316] uppercase">
                  🧾 电子支付凭据明细
                </span>
                <span class="text-[10px] font-mono text-emerald-700 font-bold">
                  ● 已存证校验
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs font-mono text-[#5e6066]">
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">服务项目:</span>
                  <span class="font-bold text-[#121316] truncate">{{ page.subject }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">实付金额:</span>
                  <span class="font-bold text-amber-900 text-sm">¥{{ paidOrder?.amount || page.amount }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">订单后缀:</span>
                  <span class="font-bold text-[#121316]">/order/{{ suffix }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">商户单号:</span>
                  <span class="font-bold text-[#121316] select-all truncate">
                    {{ paidOrder?.outTradeNo || (route.query.out_trade_no as string) || `XO${suffix}` }}
                  </span>
                </div>
                <div v-if="paidOrder?.tradeNo || route.query.trade_no || route.query.session_id" class="flex items-center justify-between">
                  <span class="text-slate-400">Stripe 流水:</span>
                  <span class="font-bold text-[#121316] select-all truncate">
                    {{ paidOrder?.tradeNo || route.query.trade_no || route.query.session_id }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">支付渠道:</span>
                  <span class="font-bold text-slate-800">Stripe 全球即时结算</span>
                </div>
              </div>
            </div>

            <!-- Onboarding Actions Row -->
            <div class="space-y-3 pt-2">
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <!-- If has delivery suite: Highlight Link -->
                <NuxtLink
                  v-if="effectiveDeliverySuffix"
                  :to="`/delivery/${effectiveDeliverySuffix}`"
                  target="_blank"
                  class="btn-bronze text-xs py-3 px-5 rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer flex-1"
                >
                  <span>🎬 立即进入专属母带放映厅 ↗</span>
                </NuxtLink>

                <!-- Go to Client Center -->
                <NuxtLink
                  to="/client"
                  class="py-3 px-5 rounded-2xl text-xs font-bold border border-black/10 bg-white/80 hover:bg-white hover:border-amber-600/40 hover:shadow-md transition-all flex items-center justify-center gap-1.5 flex-1"
                >
                  <span>👤 查看我的购买记录与订单 ↗</span>
                </NuxtLink>
              </div>

              <!-- Secondary Actions -->
              <div class="flex items-center justify-center sm:justify-between gap-3 pt-2 text-xs">
                <button
                  type="button"
                  @click="copyReceipt"
                  class="text-[#82848c] hover:text-[#121316] underline cursor-pointer flex items-center gap-1"
                >
                  <span>📋 复制电子支付凭证文本</span>
                </button>
                <NuxtLink to="/" class="text-amber-800 hover:text-amber-900 hover:underline">
                  返回 XO Studio 首页 &rarr;
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- ================= STATE 2: STRIPE RETURN WARNING ================= -->
          <div v-else-if="isStripeReturn && returnError" class="return-warning">
            <div class="flex items-start gap-3">
              <span class="text-xl">⚠️</span>
              <div class="space-y-1">
                <strong>已返回订单页面，但验签出现疑问</strong>
                <p>{{ returnError }}</p>
                <p class="text-[11px] text-amber-800/80 mt-1">若您已在 Stripe 成功付款，请稍等数秒后刷新本页或前往客户中心查看最新订单状态。</p>
              </div>
            </div>
          </div>

          <!-- ================= STATE 3: ORDER CHECKOUT FORM ================= -->
          <form v-else @submit.prevent="submitOrder" class="space-y-5">
            <!-- Remark Input Box -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs font-bold text-[#121316]">
                <label for="order-note" class="flex items-center gap-1.5">
                  <span>项目备注与交付说明</span>
                  <em class="text-[10px] font-mono text-slate-400 font-normal">可选填写</em>
                </label>
                <span class="text-[10px] font-mono text-slate-400">{{ note.length }}/300</span>
              </div>
              <textarea
                id="order-note"
                v-model="note"
                maxlength="300"
                rows="3"
                placeholder="填写项目名称、联系人电话、审片微信或交付格式特殊说明…"
                class="form-textarea"
              />
            </div>

            <!-- VIP Account Binding Hint -->
            <div v-if="page.clientUsername" class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-950 flex items-center gap-2">
              <span class="text-base">👑</span>
              <span>本订单为 <strong>@{{ page.clientUsername }}</strong> 的专属定制通道。支付成功后，将自动归集至该账户的控制台与母带放映室。</span>
            </div>

            <!-- Security Guarantees Grid (3 Pills) -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div class="security-chip">
                <span class="security-icon">🔒</span>
                <div>
                  <strong>端到端防篡改</strong>
                  <span>高阶安全加密保护</span>
                </div>
              </div>
              <div class="security-chip">
                <span class="security-icon">⚡</span>
                <div>
                  <strong>即时安全结算</strong>
                  <span>Stripe 官方直连通道</span>
                </div>
              </div>
              <div class="security-chip">
                <span class="security-icon">🎬</span>
                <div>
                  <strong>数字母带关联</strong>
                  <span>支付完成自动归档</span>
                </div>
              </div>
            </div>

            <!-- Error message if payment disabled -->
            <div v-if="!page.paymentEnabled" class="muted-box">
              ⚠️ 当前订单服务暂未开启 Stripe 支付通道，请联系管理员开启支付配置。
            </div>

            <div v-if="error" class="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-xs text-rose-700 font-semibold">
              ⚠️ {{ error }}
            </div>

            <!-- Pay Button -->
            <button
              class="pay-btn group"
              :disabled="loading || !page.paymentEnabled"
              type="submit"
            >
              <div class="flex items-center gap-2">
                <span v-if="loading" class="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
                <span v-else class="text-lg">💳</span>
                <span class="font-bold text-sm tracking-wide">
                  {{ loading ? '正在建立安全加密支付通道…' : page.paymentEnabled ? `前往 Stripe 付款 · ¥${page.amount}` : '当前不可付款' }}
                </span>
              </div>
              <span class="pay-arrow group-hover:translate-x-1 transition-transform" aria-hidden="true">&rarr;</span>
            </button>
          </form>

          <!-- Card Footer -->
          <div class="order-footer">
            <span class="font-mono">订单后缀识别码：/order/{{ suffix }}</span>
            <span class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Stripe 全球在线支付 · 256-Bit SSL/TLS 官方存证</span>
            </span>
          </div>
        </template>

        <!-- Error State -->
        <div v-else class="py-20 text-center space-y-4">
          <span class="text-4xl">🏷️</span>
          <h2 class="font-display font-bold text-lg text-[#121316]">订单页面不存在或已关闭</h2>
          <p class="text-xs text-[#82848c] max-w-sm mx-auto">
            该订单后缀尚未配置或已被系统管理员关闭。如需定制付款，请联系项目负责人或前往客户中心。
          </p>
          <div class="pt-2">
            <NuxtLink to="/order" class="btn-bronze text-xs py-2.5 px-5 rounded-2xl shadow-sm inline-flex items-center gap-1">
              <span>查看公共服务目录 &rarr;</span>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Copyright & Bottom Tag -->
      <footer class="order-bottom-tag">
        <p>XO STUDIO <span>·</span> SECURE CINEMATIC CHECKOUT</p>
      </footer>
    </section>

    <!-- Global Toast notification -->
    <Transition name="toast">
      <div v-if="toastMessage" class="fixed top-8 left-1/2 -translate-x-1/2 z-[300] px-5 py-2.5 rounded-2xl bg-[#121316]/90 backdrop-blur-md text-white text-xs font-mono shadow-2xl border border-white/10 flex items-center gap-2">
        <span class="text-emerald-400">✓</span>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>
  </main>
</template>

<script setup lang="ts">
import { encryptRsaHybrid } from '../../utils/rsa-hybrid'

useHead({
  title: '安全订单付款 — XO Studio',
  meta: [{ name: 'description', content: 'XO Studio 电影级母带制作与数字后期专属订单结算' }]
})

const route = useRoute()
const suffix = computed(() => String(route.params.suffix || '').trim())
const page = ref<any>(null)
const note = ref('')
const loadingPage = ref(true)
const loading = ref(false)
const error = ref('')
const toastMessage = ref('')

const paid = computed(() => String(route.query.paid || '') === '1')
const isStripeReturn = computed(() => Boolean(route.query.session_id || (route.query.out_trade_no && route.query.trade_no) || route.query.paid === '1'))
const paidVerified = ref(false)
const paidOrder = ref<any>(null)
const returnError = ref('')
const previewPaid = computed(() => import.meta.dev && String(route.query.preview || '') === 'paid')
const isPaidState = computed(() => (paid.value && paidVerified.value) || previewPaid.value)

// Fetch logged-in user profile to discover delivery suite
const { data: clientMe } = await useFetch<any>('/api/auth/client-me')

const effectiveDeliverySuffix = computed(() => {
  return clientMe.value?.deliverySuffix || page.value?.clientUsername || suffix.value || ''
})

const showToast = (msg: string) => {
  toastMessage.value = msg
  setTimeout(() => { toastMessage.value = '' }, 2500)
}

onMounted(async () => {
  if (isStripeReturn.value && paid.value) {
    try {
      const res = await $fetch<any>(`/api/order/${encodeURIComponent(suffix.value)}/return`, { query: route.query })
      paidVerified.value = true
      paidOrder.value = res.order
    } catch (err: any) {
      returnError.value = err.data?.data?.statusMessage || err.data?.message || err.data?.statusMessage || '支付已返回，但服务器验证订单流水失败。'
    }
  }

  try {
    page.value = await $fetch(`/api/order/${encodeURIComponent(suffix.value)}`)
  } catch (err: any) {
    error.value = err.data?.data?.statusMessage || err.data?.message || err.data?.statusMessage || '订单信息加载失败。'
  } finally {
    loadingPage.value = false
  }
})

const submitOrder = async () => {
  if (!page.value?.paymentEnabled) return
  loading.value = true
  error.value = ''
  try {
    const result = await $fetch<any>(`/api/order/${encodeURIComponent(suffix.value)}/create`, {
      method: 'POST',
      body: await encryptRsaHybrid({ note: note.value })
    })
    if (result.url) {
      window.location.href = result.url
      return
    }
    if (result.gateway) {
      window.location.href = result.gateway
      return
    }
    throw new Error('未获取到有效的 Stripe 支付链接')
  } catch (err: any) {
    error.value = err.data?.data?.statusMessage || err.data?.message || err.data?.statusMessage || err.message || '订单创建失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

const copyReceipt = () => {
  if (!import.meta.client) return
  const text = `【XO Studio 支付电子凭证】
服务项目：${page.value?.subject}
结算金额：¥${paidOrder.value?.amount || page.value?.amount}
订单后缀：/order/${suffix.value}
商户单号：${paidOrder.value?.outTradeNo || (route.query.out_trade_no as string) || `XO${suffix.value}`}
交易流水：${paidOrder.value?.tradeNo || route.query.trade_no || route.query.session_id || 'Stripe 官方已存证'}
付款状态：已安全结清
（感谢您对 XO Studio 的信任与支持）`

  navigator.clipboard.writeText(text).then(() => {
    showToast('电子支付凭据已复制到剪贴板！')
  }).catch(() => {
    showToast('复制失败，请手动选择复制。')
  })
}
</script>

<style scoped>
.order-page {
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 48px 20px;
  position: relative;
  overflow: hidden;
  color: var(--color-ink-1, #121316);
  background: var(--color-bg, #fdfbf7);
  background-image:
    radial-gradient(circle at 10% 12%, rgba(217, 119, 6, 0.09), transparent 35%),
    radial-gradient(circle at 92% 16%, rgba(180, 83, 9, 0.08), transparent 32%),
    radial-gradient(circle at 75% 92%, rgba(245, 158, 11, 0.08), transparent 38%);
}

.order-page::before {
  content: "";
  position: absolute;
  inset: -20%;
  pointer-events: none;
  background: linear-gradient(115deg, transparent 28%, rgba(255, 255, 255, 0.5) 44%, transparent 60%);
  transform: rotate(-10deg);
  animation: order-ambient-sweep 14s ease-in-out infinite alternate;
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

.order-shell {
  width: min(100%, 720px);
  position: relative;
  z-index: 1;
}

.order-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px 16px;
}

.brand-mark {
  color: var(--color-ink-1, #121316);
  text-decoration: none;
  font: 800 22px/1 'Xo Display', Georgia, serif;
  letter-spacing: .16em;
  transition: opacity 0.2s;
}

.brand-mark:hover {
  opacity: 0.8;
}

.order-card {
  position: relative;
  overflow: hidden;
  padding: 40px 44px 32px;
  border: 1px solid rgba(217, 119, 6, 0.22);
  border-radius: 32px;
  background: var(--glass-bg, rgba(255, 254, 250, 0.86));
  box-shadow: var(--glass-shadow-lg, 0 28px 75px rgba(180, 120, 40, 0.08));
  backdrop-filter: blur(36px) saturate(1.6);
  -webkit-backdrop-filter: blur(36px) saturate(1.6);
}

.order-eyebrow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.section-kicker {
  color: var(--color-bronze, #b45309);
  font: 700 10px/1.2 'Xo Mono', monospace;
  letter-spacing: .2em;
}

.suffix-badge {
  font: 700 10px/1.2 'Xo Mono', monospace;
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--color-border, rgba(0, 0, 0, 0.04));
  color: var(--color-ink-4, #5e6066);
}

.vip-client-pill {
  font: 700 10px/1.2 'Xo Mono', monospace;
  padding: 2px 9px;
  border-radius: 9999px;
  background: rgba(217, 119, 6, 0.15);
  color: var(--color-bronze-dark, #92400e);
  border: 1px solid rgba(217, 119, 6, 0.25);
}

.order-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-top: 28px;
}

.product-meta {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  min-width: 0;
}

.product-icon-wrap {
  display: grid;
  place-items: center;
  flex: none;
  width: 52px;
  height: 52px;
  border-radius: 18px;
  color: var(--color-bronze, #b45309);
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(217, 119, 6, 0.12));
  border: 1px solid rgba(217, 119, 6, 0.3);
  box-shadow: 0 8px 20px rgba(180, 83, 9, 0.12);
}

.product-icon-wrap svg {
  width: 22px;
  height: 22px;
}

.product-kicker {
  margin: 0;
  color: var(--color-ink-4, #82848c);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.product-title {
  margin: 2px 0 0;
  color: var(--color-ink-1, #121316);
  font: 700 clamp(24px, 4vw, 36px)/1.15 'Xo Display', Georgia, serif;
}

.client-name {
  margin: 6px 0 0;
  color: var(--color-ink-3, #5e6066);
  font-size: 12px;
}

.client-name strong {
  color: var(--color-ink-1, #121316);
}

.price-block {
  text-align: right;
  white-space: nowrap;
}

.price-block small {
  display: block;
  margin-bottom: 6px;
  color: var(--color-ink-4, #82848c);
  font-size: 11px;
  font-family: 'Xo Mono', monospace;
  letter-spacing: 0.05em;
}

.price-val {
  color: var(--color-bronze-dark, #92400e);
  font: 700 clamp(28px, 4.5vw, 40px)/1 'Xo Mono', monospace;
  letter-spacing: -0.02em;
}

.price-val i {
  font-size: 0.55em;
  font-style: normal;
  margin-right: 3px;
  color: var(--color-bronze, #b45309);
}

.order-desc-box {
  margin-top: 22px;
  padding: 14px 18px;
  border-radius: 18px;
  background: var(--color-border, rgba(0, 0, 0, 0.02));
  border: 1px solid var(--color-border-2, rgba(0, 0, 0, 0.04));
  color: var(--color-ink-3, #5e6066);
  font-size: 13px;
  line-height: 1.7;
}

.order-divider {
  height: 1px;
  margin: 24px 0 26px;
  border-top: 1px dashed rgba(217, 119, 6, 0.25);
}

.form-textarea {
  width: 100%;
  resize: vertical;
  border: 1px solid var(--color-border-2, rgba(0, 0, 0, 0.09));
  border-radius: 16px;
  padding: 12px 16px;
  color: var(--color-ink-1, #121316);
  background: var(--color-surface, rgba(255, 255, 255, 0.9));
  outline: 0;
  font: 13px/1.6 'Xo Sans', sans-serif;
  transition: all 0.2s;
}

.form-textarea:focus {
  border-color: var(--color-bronze, #b45309);
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15);
}

.security-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 14px;
  background: var(--color-border, rgba(0, 0, 0, 0.02));
  border: 1px solid var(--color-border-2, rgba(0, 0, 0, 0.04));
}

.security-icon {
  font-size: 16px;
}

.security-chip strong {
  display: block;
  font-size: 11px;
  color: var(--color-ink-1, #121316);
}

.security-chip span {
  display: block;
  font-size: 10px;
  font-family: 'Xo Mono', monospace;
  color: var(--color-ink-4, #82848c);
}

.pay-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 56px;
  padding: 0 24px;
  border-radius: 18px;
  color: #fff;
  background: linear-gradient(135deg, #1c1917 0%, #292524 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18), 0 1px 0 rgba(255, 255, 255, 0.2) inset;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.pay-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #b45309 0%, #d97706 100%);
  transform: translateY(-2px);
  box-shadow: 0 16px 36px rgba(180, 83, 9, 0.3), 0 1px 0 rgba(255, 255, 255, 0.3) inset;
}

.pay-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.pay-arrow {
  font-size: 20px;
  font-weight: 300;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  color: #82848c;
  font-size: 11px;
}

.muted-box {
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 12px;
  line-height: 1.6;
  color: #92400e;
  background: rgba(254, 243, 199, 0.6);
  border: 1px solid rgba(252, 211, 77, 0.8);
}

.return-warning {
  border-radius: 18px;
  padding: 16px 18px;
  font-size: 12px;
  line-height: 1.6;
  color: #92400e;
  background: rgba(255, 247, 237, 0.9);
  border: 1px solid rgba(254, 215, 170, 0.8);
}

.return-warning strong {
  display: block;
  font-size: 13px;
  color: #9a3412;
}

.order-bottom-tag {
  margin: 22px 0 0;
  color: #82848c;
  text-align: center;
  font: 10px/1.2 'Xo Mono', monospace;
  letter-spacing: .16em;
}

.order-bottom-tag span {
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

@keyframes order-ambient-sweep {
  from { transform: translateX(-15%) rotate(-10deg); }
  to { transform: translateX(15%) rotate(-10deg); }
}

@media (max-width: 600px) {
  .order-page { padding: 24px 14px; }
  .order-card { padding: 30px 20px 24px; border-radius: 24px; }
  .order-heading { display: block; margin-top: 24px; }
  .price-block { margin-top: 18px; text-align: left; }
  .order-footer { display: block; }
  .order-footer span { display: block; margin-top: 4px; }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px) scale(0.95);
}
</style>
