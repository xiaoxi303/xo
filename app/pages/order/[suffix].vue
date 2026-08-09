<template>
  <main class="order-page">
    <div class="ambient ambient-one" aria-hidden="true" />
    <div class="ambient ambient-two" aria-hidden="true" />
    <div class="ambient ambient-three" aria-hidden="true" />

    <section class="order-shell">
      <header class="order-topbar">
        <NuxtLink to="/" class="brand-mark" aria-label="返回 XO Studio">XO</NuxtLink>
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
              <span class="product-icon" aria-hidden="true">✦</span>
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
      returnError.value = err.data?.statusMessage || '支付已返回，但当前服务器没有找到对应订单记录。请确认支付和订单使用的是同一个域名。'
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
.order-page{min-height:100svh;display:grid;place-items:center;padding:42px 20px;position:relative;overflow:hidden;color:#19222d;background:#cfd8ec;background-image:radial-gradient(ellipse at 4% 4%,rgba(44,205,203,.82),transparent 36%),radial-gradient(ellipse at 96% 7%,rgba(255,142,164,.7),transparent 34%),radial-gradient(ellipse at 86% 96%,rgba(255,207,101,.7),transparent 38%),linear-gradient(135deg,#d8f2ef 0%,#cfd8ec 52%,#f3dfd8 100%)}
.order-page::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.7;background:linear-gradient(112deg,transparent 0 24%,rgba(255,255,255,.62) 39%,transparent 54%),linear-gradient(25deg,transparent 0 56%,rgba(255,255,255,.5) 70%,transparent 85%);mix-blend-mode:screen}
.ambient{display:none}
.order-shell{width:min(100%,680px);position:relative;z-index:1}.order-topbar{display:flex;justify-content:space-between;align-items:center;padding:0 8px 15px;color:#617388;font-size:12px}.brand-mark{color:#0b7d75;text-decoration:none;font:800 21px/1 Georgia,serif;letter-spacing:.18em}.secure-label{display:flex;align-items:center;gap:9px}.secure-dot{width:8px;height:8px;border-radius:50%;background:#18a957;box-shadow:0 0 0 5px rgba(24,169,87,.12)}
.order-card{position:relative;overflow:hidden;padding:41px 46px 27px;border:1px solid rgba(255,255,255,.78);border-radius:29px;background:linear-gradient(145deg,rgba(255,255,255,.3),rgba(255,255,255,.1));box-shadow:0 28px 70px rgba(55,82,89,.22),0 1px 0 rgba(255,255,255,.95) inset,0 -1px 0 rgba(111,150,161,.22) inset,0 0 0 1px rgba(255,255,255,.18);backdrop-filter:blur(38px) saturate(1.8) contrast(1.06);-webkit-backdrop-filter:blur(38px) saturate(1.8) contrast(1.06)}
.order-card::before{content:"";position:absolute;inset:1px;border-radius:28px;pointer-events:none;border:1px solid rgba(255,255,255,.46);box-shadow:0 0 0 1px rgba(255,255,255,.18) inset}.order-card::after{content:"";position:absolute;top:-35%;left:7%;width:64%;height:65%;pointer-events:none;background:linear-gradient(110deg,rgba(255,255,255,.45),rgba(255,255,255,0));filter:blur(20px);transform:rotate(-8deg);opacity:.65}
.order-eyebrow,.order-heading,.order-copy,.order-divider,.success-box,form,.order-footer{position:relative;z-index:1}.order-eyebrow{display:flex;justify-content:space-between;align-items:center;color:#0d7973;font:700 10px/1.2 ui-monospace,monospace;letter-spacing:.2em}.order-eyebrow b{font-weight:600;letter-spacing:.1em;color:#8ca0b5}.order-heading{display:flex;justify-content:space-between;gap:30px;align-items:flex-start;margin-top:31px}.product-meta{display:flex;gap:16px;min-width:0}.product-icon{display:grid;place-items:center;flex:none;width:52px;height:52px;border-radius:17px;color:#0d8179;background:rgba(179,239,230,.58);border:1px solid rgba(255,255,255,.62);box-shadow:0 8px 20px rgba(66,154,146,.12),0 1px 0 rgba(255,255,255,.9) inset;font-size:21px}.product-kicker{margin:2px 0 6px;color:#8da0b4;font-size:12px}.order-heading h1{margin:0;color:#19222d;font:700 clamp(32px,5vw,46px)/1.08 'Xo Display',Georgia,serif}.client-name{margin:10px 0 0;color:#637388;font-size:12px}.price-block{text-align:right;white-space:nowrap;padding-top:3px}.price-block small{display:block;margin-bottom:9px;color:#8da0b4;font-size:12px}.price-block strong{color:#0b8179;font:700 clamp(30px,4vw,39px)/1 'Xo Mono',ui-monospace,monospace}.price-block i{font-size:.52em;font-style:normal;margin-right:4px}
.order-copy{max-width:540px;margin:27px 0 0;color:#637388;font-size:14px;line-height:1.8}.order-divider{height:1px;margin:28px 0 35px;border-top:1px dashed rgba(120,153,159,.34)}form{display:grid;gap:17px}label{display:grid;gap:10px;color:#31434c;font-size:12px;font-weight:700}label em{margin-left:5px;color:#96a8b8;font-style:normal;font-weight:500}textarea{width:100%;resize:vertical;border:1px solid rgba(137,170,173,.35);border-radius:15px;padding:14px 15px;color:#19222d;background:rgba(255,255,255,.38);outline:0;font:13px/1.6 inherit;transition:border-color .2s,box-shadow .2s}textarea:focus{border-color:#0d7973;box-shadow:0 0 0 4px rgba(13,121,115,.1)}
.pay-button{display:flex;align-items:center;justify-content:space-between;width:100%;min-height:58px;padding:0 19px 0 22px;border:1px solid rgba(255,255,255,.18);border-radius:15px;color:#fff;background:rgba(25,35,45,.9);font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 11px 24px rgba(24,33,43,.18);transition:transform .2s,background .2s,box-shadow .2s}.pay-button:hover:not(:disabled){transform:translateY(-2px);background:rgba(12,125,116,.92);box-shadow:0 15px 28px rgba(13,121,115,.2)}.pay-button b{font-size:23px;font-weight:400}.pay-button:disabled{opacity:.55;cursor:not-allowed}.order-footer{display:flex;justify-content:space-between;gap:14px;margin-top:27px;color:#8da0b4;font-size:11px}
.muted-box,.success-box,.return-warning{border-radius:15px;padding:15px 16px;font-size:12px;line-height:1.6}.muted-box{color:#9a5a16;background:rgba(255,248,232,.42);border:1px solid rgba(245,227,189,.72);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)}.success-box{display:flex;gap:14px;align-items:center;min-height:82px;padding:15px 16px;color:#17653c;background:linear-gradient(110deg,rgba(206,255,225,.34),rgba(218,255,239,.14));border:1px solid rgba(107,205,145,.48);box-shadow:0 10px 24px rgba(45,160,93,.12),0 1px 0 rgba(255,255,255,.82) inset,0 0 0 1px rgba(255,255,255,.22);backdrop-filter:blur(28px) saturate(1.5);-webkit-backdrop-filter:blur(28px) saturate(1.5)}.return-warning{display:grid;gap:4px;color:#92400e;background:rgba(255,247,237,.5);border:1px solid rgba(254,215,170,.8);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)}.return-warning strong{color:#9a3412}.success-box strong,.success-box span{display:block}.success-box strong{font-size:14px}.success-box span{margin-top:4px;color:#438060}.success-icon{display:grid;place-items:center;flex:none;width:30px;height:30px;border-radius:50%;color:#fff;background:linear-gradient(145deg,#26b866,#0d9e52);font-size:17px;font-weight:800;box-shadow:0 4px 12px rgba(20,160,81,.24),0 1px 0 rgba(255,255,255,.45) inset}.order-error{color:#be123c;font-size:12px}.state{padding:34px 0;color:#667789;font-size:13px}.error-state{color:#be123c}.copyright{margin:20px 0 0;text-align:center;color:#8da0b4;font:10px/1.2 'Xo Mono',ui-monospace,monospace;letter-spacing:.16em}.copyright span{margin:0 7px;color:#0d7973}
@media(max-width:560px){.order-page{padding:28px 15px}.order-topbar{padding:0 5px 15px}.order-card{padding:31px 22px 24px;border-radius:23px}.order-heading{display:block;margin-top:28px}.price-block{margin-top:23px;text-align:left}.order-copy{margin-top:25px}.order-divider{margin:28px 0}.order-footer{display:block}.order-footer span{display:block;margin-top:6px}}
@media(prefers-reduced-motion:no-preference){.order-card{animation:glass-float 8s ease-in-out infinite alternate}.success-box{animation:success-glow 4s ease-in-out infinite alternate}}@keyframes glass-float{from{transform:translateY(0)}to{transform:translateY(-3px)}}@keyframes success-glow{from{box-shadow:0 10px 24px rgba(45,160,93,.08),0 1px 0 rgba(255,255,255,.72) inset}to{box-shadow:0 14px 30px rgba(45,160,93,.13),0 1px 0 rgba(255,255,255,.72) inset}}
</style>
