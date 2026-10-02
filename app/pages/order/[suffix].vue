<template>
  <main class="order-page">
    <div class="ambient ambient-one" aria-hidden="true" />
    <div class="ambient ambient-two" aria-hidden="true" />
    <div class="ambient ambient-three" aria-hidden="true" />

    <section class="order-shell">
      <header class="order-topbar">
        <NuxtLink to="/order" class="brand-mark" aria-label="返回 XO Studio">XO</NuxtLink>
        <SecureSessionChip />
      </header>

      <section class="order-card">
        <div v-if="loadingPage" class="state">正在加载订单信息…</div>
        <template v-else-if="page">
          <div class="order-eyebrow">
            <span>PRIVATE ORDER</span>
            <b>#{{ suffix }}</b>
          </div>

          <div class="order-heading">
            <div class="product-meta">
              <span class="product-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M7 3h10v18H7z" />
                  <path d="M9.5 7h5M9.5 11h5M9.5 15h3" />
                </svg>
              </span>
              <div>
                <p class="product-kicker">专属商品</p>
                <h1>{{ page.subject }}</h1>
                <p v-if="page.clientName" class="client-name">{{ page.clientName }}</p>
              </div>
            </div>
            <div class="price-block">
              <small>应付金额</small>
              <strong><i>¥</i>{{ page.amount }}</strong>
            </div>
          </div>

          <p v-if="page.description" class="order-copy">{{ page.description }}</p>
          <div class="order-divider" />

          <div v-if="isPaidState" class="success-box">
            <span class="success-icon" aria-hidden="true">✓</span>
            <div>
              <strong>付款已提交</strong>
              <span>{{ page.successText || '感谢付款，我们会按约定完成交付。' }}</span>
            </div>
          </div>
          <div v-else-if="isAlipayReturn && returnError" class="return-warning">
            <strong>已返回订单页面</strong>
            <span>{{ returnError }}</span>
          </div>

          <form v-else @submit.prevent="submitOrder">
            <label>
              备注 <em>可选</em>
              <textarea v-model="note" maxlength="300" rows="3" placeholder="填写项目名称、联系方式或交付说明…" />
            </label>
            <p v-if="!page.paymentEnabled" class="muted-box">当前订单暂未开启支付宝付款，请联系管理员。</p>
            <p v-if="error" class="order-error">{{ error }}</p>
            <button class="pay-button" :disabled="loading || !page.paymentEnabled" type="submit">
              <span>{{ loading ? '正在创建订单…' : page.paymentEnabled ? '前往支付宝付款' : '暂不可付款' }}</span>
              <b aria-hidden="true">→</b>
            </button>
          </form>

          <div class="order-footer">
            <span>订单后缀：{{ suffix }}</span>
            <span>支付宝电脑网站支付</span>
          </div>
        </template>
        <div v-else class="state error-state">订单页面不存在或已关闭。</div>
      </section>

      <p class="copyright">XO STUDIO <span>·</span> SECURE CHECKOUT</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { encryptRsaHybrid } from '../../utils/rsa-hybrid'

const route = useRoute()
const suffix = computed(() => String(route.params.suffix || '').trim())
const page = ref<any>(null)
const note = ref('')
const loadingPage = ref(true)
const loading = ref(false)
const error = ref('')
const paid = computed(() => String(route.query.paid || '') === '1')
const isAlipayReturn = computed(() => Boolean(route.query.out_trade_no && route.query.trade_no && route.query.sign))
const paidVerified = ref(false)
const returnError = ref('')
const previewPaid = computed(() => import.meta.dev && String(route.query.preview || '') === 'paid')
const isPaidState = computed(() => (paid.value && paidVerified.value) || previewPaid.value)

onMounted(async () => {
  if (isAlipayReturn.value) {
    try {
      await $fetch(`/api/order/${encodeURIComponent(suffix.value)}/return`, { query: route.query })
      paidVerified.value = true
    } catch (err: any) {
      returnError.value = err.data?.statusMessage || '支付已返回，但服务器没有找到对应订单记录。'
    }
  }

  try {
    page.value = await $fetch(`/api/order/${encodeURIComponent(suffix.value)}`)
  } catch (err: any) {
    error.value = err.data?.statusMessage || '订单信息加载失败'
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
    const form = document.createElement('form')
    form.method = 'POST'
    form.acceptCharset = 'UTF-8'
    form.action = result.gateway
    for (const [key, value] of Object.entries({ ...result.params, sign: result.sign })) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = String(value)
      form.appendChild(input)
    }
    document.body.appendChild(form)
    form.submit()
  } catch (err: any) {
    error.value = err.data?.statusMessage || '订单创建失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.order-page {
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 42px 20px;
  position: relative;
  overflow: hidden;
  color: #172235;
  background: #dbe8f6;
  background-image:
    radial-gradient(circle at 8% 8%, rgba(80, 214, 205, .68), transparent 32%),
    radial-gradient(circle at 94% 12%, rgba(152, 132, 255, .58), transparent 30%),
    radial-gradient(circle at 74% 96%, rgba(255, 184, 123, .58), transparent 35%),
    linear-gradient(135deg, #e9f8f2 0%, #d8e2f5 48%, #fae8de 100%);
}

.order-page::before {
  content: "";
  position: absolute;
  inset: -20%;
  pointer-events: none;
  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, .58) 44%, transparent 58%);
  transform: rotate(-10deg);
  animation: order-sweep 12s ease-in-out infinite alternate;
}

.order-shell { width: min(100%, 720px); position: relative; z-index: 1; }
.order-topbar { display: flex; justify-content: space-between; align-items: center; padding: 0 8px 15px; color: #52647c; font-size: 12px; }
.brand-mark { color: #226b8d; text-decoration: none; font: 800 21px/1 Georgia, serif; letter-spacing: .18em; }
.brand-mark:focus-visible { outline: 3px solid rgba(55, 101, 183, .55); outline-offset: 6px; border-radius: 8px; }

.order-card {
  position: relative;
  overflow: hidden;
  padding: 42px 48px 28px;
  border: 1px solid rgba(255, 255, 255, .82);
  border-radius: 32px;
  background: linear-gradient(145deg, rgba(255, 255, 255, .62), rgba(255, 255, 255, .22));
  box-shadow: 0 28px 70px rgba(57, 83, 122, .2), 0 1px 0 rgba(255, 255, 255, .96) inset;
  backdrop-filter: blur(38px) saturate(1.65);
  -webkit-backdrop-filter: blur(38px) saturate(1.65);
}

.order-card::before {
  content: "";
  position: absolute;
  inset: 1px;
  border: 1px solid rgba(255, 255, 255, .52);
  border-radius: 31px;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, .24) inset;
  pointer-events: none;
}

.order-card::after {
  content: "";
  position: absolute;
  top: -35%;
  left: 7%;
  width: 64%;
  height: 65%;
  pointer-events: none;
  background: linear-gradient(110deg, rgba(255, 255, 255, .64), rgba(255, 255, 255, 0));
  filter: blur(22px);
  transform: rotate(-8deg);
}

.order-eyebrow, .order-heading, .order-copy, .order-divider, .success-box, form, .order-footer { position: relative; z-index: 1; }
.order-eyebrow { display: flex; justify-content: space-between; align-items: center; color: #4969a0; font: 700 10px/1.2 var(--font-mono, ui-monospace), monospace; letter-spacing: .2em; }
.order-eyebrow b { color: #7185a2; font-weight: 600; letter-spacing: .1em; }
.order-heading { display: flex; justify-content: space-between; gap: 30px; align-items: flex-start; margin-top: 31px; }
.product-meta { display: flex; gap: 16px; min-width: 0; }
.product-icon { display: grid; place-items: center; flex: none; width: 54px; height: 54px; color: #226b8d; border: 1px solid rgba(255, 255, 255, .84); border-radius: 18px; background: linear-gradient(145deg, rgba(204, 255, 247, .8), rgba(176, 218, 255, .42)); box-shadow: 0 9px 22px rgba(45, 122, 147, .16), 0 1px 0 rgba(255, 255, 255, .95) inset; }
.product-icon svg { width: 23px; height: 23px; }
.product-kicker { margin: 2px 0 6px; color: #7185a2; font-size: 12px; }
.order-heading h1 { margin: 0; color: #172235; font: 700 clamp(32px, 5vw, 48px)/1.08 var(--font-display, Georgia), serif; }
.client-name { margin: 10px 0 0; color: #526b88; font-size: 12px; }
.price-block { padding-top: 3px; text-align: right; white-space: nowrap; }
.price-block small { display: block; margin-bottom: 9px; color: #7185a2; font-size: 12px; }
.price-block strong { color: #256c88; font: 700 clamp(30px, 4vw, 41px)/1 var(--font-mono, ui-monospace), monospace; }
.price-block i { margin-right: 4px; font-size: .52em; font-style: normal; }
.order-copy { max-width: 540px; margin: 27px 0 0; color: #52647c; font-size: 14px; line-height: 1.8; }
.order-divider { height: 1px; margin: 28px 0 35px; border-top: 1px dashed rgba(87, 120, 163, .38); }
form { display: grid; gap: 17px; }
label { display: grid; gap: 10px; color: #31445e; font-size: 12px; font-weight: 700; }
label em { margin-left: 5px; color: #7d91aa; font-style: normal; font-weight: 500; }
textarea { width: 100%; resize: vertical; border: 1px solid rgba(112, 149, 180, .38); border-radius: 16px; padding: 14px 15px; color: #172235; background: rgba(255, 255, 255, .42); outline: 0; font: 13px/1.6 inherit; transition: border-color .2s, box-shadow .2s, background .2s; }
textarea:focus { border-color: #3b78a3; background: rgba(255, 255, 255, .64); box-shadow: 0 0 0 4px rgba(59, 120, 163, .13); }
.pay-button { display: flex; align-items: center; justify-content: space-between; width: 100%; min-height: 60px; padding: 0 20px 0 23px; border: 1px solid rgba(255, 255, 255, .24); border-radius: 17px; color: #fff; background: linear-gradient(135deg, #243b5a, #236f8b); font-size: 13px; font-weight: 700; cursor: pointer; box-shadow: 0 13px 28px rgba(35, 81, 112, .2), 0 1px 0 rgba(255, 255, 255, .26) inset; transition: transform .2s, box-shadow .2s, filter .2s; }
.pay-button:hover:not(:disabled) { transform: translateY(-2px); filter: saturate(1.12); box-shadow: 0 17px 34px rgba(35, 81, 112, .28), 0 1px 0 rgba(255, 255, 255, .3) inset; }
.pay-button:focus-visible { outline: 3px solid rgba(55, 101, 183, .5); outline-offset: 4px; }
.pay-button b { font-size: 23px; font-weight: 400; }
.pay-button:disabled { opacity: .55; cursor: not-allowed; }
.order-footer { display: flex; justify-content: space-between; gap: 14px; margin-top: 27px; color: #7185a2; font-size: 11px; }
.muted-box, .success-box, .return-warning { border-radius: 16px; padding: 15px 16px; font-size: 12px; line-height: 1.6; backdrop-filter: blur(24px); }
.muted-box { color: #82591d; background: rgba(255, 248, 232, .52); border: 1px solid rgba(245, 227, 189, .8); }
.success-box { display: flex; gap: 14px; align-items: center; min-height: 86px; color: #17653c; background: linear-gradient(110deg, rgba(206, 255, 225, .5), rgba(218, 255, 239, .18)); border: 1px solid rgba(107, 205, 145, .52); box-shadow: 0 12px 28px rgba(45, 160, 93, .13), 0 1px 0 rgba(255, 255, 255, .86) inset; }
.return-warning { display: grid; gap: 4px; color: #92400e; background: rgba(255, 247, 237, .58); border: 1px solid rgba(254, 215, 170, .84); }
.return-warning strong { color: #9a3412; }
.success-box strong, .success-box span { display: block; }
.success-box strong { font-size: 14px; }
.success-box span { margin-top: 4px; color: #438060; }
.success-icon { display: grid; place-items: center; flex: none; width: 32px; height: 32px; color: #fff; border-radius: 50%; background: linear-gradient(145deg, #26b866, #0d9e52); font-size: 17px; font-weight: 800; box-shadow: 0 4px 12px rgba(20, 160, 81, .24), 0 1px 0 rgba(255, 255, 255, .45) inset; }
.order-error, .error-state { color: #ad3153; font-size: 12px; }
.state { padding: 34px 0; color: #52647c; font-size: 13px; }
.copyright { margin: 20px 0 0; color: #7185a2; text-align: center; font: 10px/1.2 var(--font-mono, ui-monospace), monospace; letter-spacing: .16em; }
.copyright span { margin: 0 7px; color: #256c88; }

@media (max-width: 560px) {
  .order-page { padding: 28px 15px; }
  .order-topbar { padding: 0 5px 15px; }
  .order-card { padding: 31px 22px 24px; border-radius: 25px; }
  .order-heading { display: block; margin-top: 28px; }
  .price-block { margin-top: 23px; text-align: left; }
  .order-copy { margin-top: 25px; }
  .order-divider { margin: 28px 0; }
  .order-footer { display: block; }
  .order-footer span { display: block; margin-top: 6px; }
}

@media (prefers-reduced-motion: no-preference) {
  .order-card { animation: glass-float 8s ease-in-out infinite alternate; }
  .success-box { animation: success-glow 4s ease-in-out infinite alternate; }
}

@keyframes glass-float { from { transform: translateY(0); } to { transform: translateY(-3px); } }
@keyframes order-sweep { from { transform: translateX(-18%) rotate(-10deg); } to { transform: translateX(18%) rotate(-10deg); } }
@keyframes success-glow { from { box-shadow: 0 10px 24px rgba(45, 160, 93, .08), 0 1px 0 rgba(255, 255, 255, .72) inset; } to { box-shadow: 0 14px 30px rgba(45, 160, 93, .13), 0 1px 0 rgba(255, 255, 255, .72) inset; } }
@media (prefers-reduced-motion: reduce) { .order-page::before, .order-card, .success-box { animation: none; } }
</style>
