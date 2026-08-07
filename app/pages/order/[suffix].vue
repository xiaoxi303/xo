<template>
  <main class="order-page">
    <div class="ambient ambient-one" />
    <div class="ambient ambient-two" />
    <section class="order-shell">
      <header class="order-topbar">
        <span class="brand-mark">XO</span>
        <span class="secure-label"><span class="secure-dot" /> 安全订单</span>
      </header>
      <section class="order-card">
        <div v-if="loadingPage" class="state">正在加载订单信息…</div>
        <template v-else-if="page">
          <div class="order-eyebrow"><span>PRIVATE ORDER</span><b>#{{ suffix }}</b></div>
          <div class="order-heading">
            <div class="product-meta">
              <span class="product-icon">✦</span>
              <div><p class="product-kicker">专属商品</p><h1>{{ page.subject }}</h1><p v-if="page.clientName" class="client-name">{{ page.clientName }}</p></div>
            </div>
            <div class="price-block"><small>应付金额</small><strong><i>¥</i>{{ page.amount }}</strong></div>
          </div>
          <p v-if="page.description" class="order-copy">{{ page.description }}</p>
          <div class="order-divider" />
          <div v-if="paid && paidVerified" class="success-box"><span class="success-icon">✓</span><div><strong>付款已提交</strong><span>{{ page.successText || '感谢付款，我们会按约定完成交付。' }}</span></div></div>
          <div v-else-if="isAlipayReturn && returnError" class="return-warning"><strong>已返回订单页面</strong><span>{{ returnError }}</span></div>
          <form v-else @submit.prevent="submitOrder">
            <label>备注 <em>可选</em><textarea v-model="note" maxlength="300" rows="3" placeholder="填写项目名称、联系方式或交付说明…" /></label>
            <p v-if="!page.paymentEnabled" class="muted-box">当前订单暂未开启支付宝付款，请联系管理员。</p>
            <p v-if="error" class="order-error">{{ error }}</p>
            <button class="pay-button" :disabled="loading || !page.paymentEnabled" type="submit"><span>{{ loading ? '正在创建订单…' : page.paymentEnabled ? '前往支付宝付款' : '暂不可付款' }}</span><b>→</b></button>
          </form>
          <div class="order-footer"><span>订单后缀：{{ suffix }}</span><span>支付宝电脑网站支付</span></div>
        </template>
        <div v-else class="state error-state">订单页面不存在或已关闭。</div>
      </section>
      <p class="copyright">XO STUDIO · SECURE CHECKOUT</p>
    </section>
  </main>
</template>

<script setup lang="ts">
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

onMounted(async () => {
  if (isAlipayReturn.value) {
    try {
      await $fetch(`/api/order/${encodeURIComponent(suffix.value)}/return`, { query: route.query })
      paidVerified.value = true
    } catch (err: any) {
      returnError.value = err.data?.statusMessage || '支付返回已到达，但当前服务器没有找到对应订单记录。请确认支付和订单使用的是同一个域名。'
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
    const result = await $fetch<any>(`/api/order/${encodeURIComponent(suffix.value)}/create`, { method: 'POST', body: { note: note.value } })
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
.order-page{min-height:100svh;display:grid;place-items:center;padding:34px 18px;background:#edf3f2;position:relative;overflow:hidden;color:#17202b}.ambient{position:absolute;border-radius:999px;filter:blur(2px);pointer-events:none}.ambient-one{width:520px;height:520px;left:-220px;top:-180px;background:radial-gradient(circle,#c6ece2,transparent 68%)}.ambient-two{width:460px;height:460px;right:-180px;bottom:-200px;background:radial-gradient(circle,#d8d3f3,transparent 68%)}.order-shell{width:min(100%,680px);position:relative;z-index:1}.order-topbar{display:flex;justify-content:space-between;align-items:center;padding:0 6px 16px;color:#64748b;font-size:11px;letter-spacing:.08em}.brand-mark{font:800 18px/1 Georgia,serif;letter-spacing:.18em;color:#0f766e}.secure-label{display:flex;align-items:center;gap:7px}.secure-dot{width:7px;height:7px;border-radius:50%;background:#16a34a;box-shadow:0 0 0 4px rgba(22,163,74,.12)}.order-card{padding:40px 46px 28px;border:1px solid rgba(15,23,42,.09);border-radius:24px;background:rgba(255,255,255,.9);box-shadow:0 28px 80px rgba(15,23,42,.14);backdrop-filter:blur(18px)}.order-eyebrow{display:flex;justify-content:space-between;align-items:center;color:#0f766e;font:700 10px/1.2 ui-monospace,monospace;letter-spacing:.18em}.order-eyebrow b{font-weight:600;letter-spacing:.08em;color:#94a3b8}.order-heading{display:flex;justify-content:space-between;gap:28px;align-items:flex-start;margin-top:30px}.product-meta{display:flex;gap:15px;min-width:0}.product-icon{display:grid;place-items:center;flex:none;width:42px;height:42px;border-radius:14px;color:#0f766e;background:#dff5ef;font-size:20px}.product-kicker{margin:0 0 7px;color:#94a3b8;font-size:11px}.order-heading h1{margin:0;color:#17202b;font:700 clamp(28px,5vw,40px)/1.12 Georgia,serif;letter-spacing:-.03em}.client-name{margin:9px 0 0;color:#64748b;font-size:12px}.price-block{text-align:right;white-space:nowrap}.price-block small{display:block;margin-bottom:8px;color:#94a3b8;font-size:11px}.price-block strong{color:#0f766e;font:700 clamp(26px,4vw,34px)/1 ui-monospace,monospace}.price-block i{font-size:.55em;font-style:normal;margin-right:3px}.order-copy{max-width:500px;margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.8}.order-divider{height:1px;margin:28px 0;border-top:1px dashed #d7e1df}form{display:grid;gap:16px}label{display:grid;gap:9px;color:#334155;font-size:12px;font-weight:700}label em{margin-left:5px;color:#94a3b8;font-style:normal;font-weight:500}textarea{width:100%;resize:vertical;border:1px solid #d8e1df;border-radius:13px;padding:13px 14px;color:#17202b;background:#fbfdfc;outline:0;font:13px/1.6 inherit;transition:.2s}textarea:focus{border-color:#0f766e;box-shadow:0 0 0 4px rgba(15,118,110,.1)}.pay-button{display:flex;align-items:center;justify-content:space-between;width:100%;min-height:54px;padding:0 18px 0 20px;border:0;border-radius:13px;color:#fff;background:#17202b;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 10px 24px rgba(23,32,43,.18);transition:.2s}.pay-button:hover:not(:disabled){transform:translateY(-1px);background:#0f766e}.pay-button b{font-size:22px;font-weight:400}.pay-button:disabled{opacity:.55;cursor:not-allowed}.order-footer{display:flex;justify-content:space-between;gap:14px;margin-top:25px;color:#94a3b8;font-size:11px}.muted-box,.success-box,.return-warning{border-radius:13px;padding:13px;font-size:12px;line-height:1.6}.muted-box{color:#92400e;background:#fffbeb}.success-box{display:flex;gap:12px;align-items:flex-start;color:#166534;background:#f0fdf4}.return-warning{display:grid;gap:4px;color:#92400e;background:#fff7ed;border:1px solid #fed7aa}.return-warning strong{color:#9a3412}.success-box strong,.success-box span{display:block}.success-box span{margin-top:3px}.success-icon{display:grid;place-items:center;flex:none;width:24px;height:24px;border-radius:50%;color:#fff;background:#16a34a;font-weight:800}.order-error{color:#be123c;font-size:12px}.state{padding:28px 0;color:#64748b;font-size:13px}.error-state{color:#be123c}.copyright{margin:17px 0 0;text-align:center;color:#94a3b8;font:10px/1.2 ui-monospace,monospace;letter-spacing:.14em}@media(max-width:560px){.order-card{padding:30px 22px 24px;border-radius:20px}.order-heading{display:block}.price-block{margin-top:22px;text-align:left}.order-footer{display:block}.order-footer span{display:block;margin-top:5px}}
</style>
