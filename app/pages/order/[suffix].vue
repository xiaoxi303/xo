<template>
  <main class="order-page">
    <section class="order-card">
      <p class="order-eyebrow">XO STUDIO / PRIVATE ORDER</p>
      <div v-if="loadingPage" class="state">正在加载订单信息…</div>
      <template v-else-if="page">
        <div class="order-heading">
          <div>
            <h1>{{ page.subject }}</h1>
            <p v-if="page.clientName" class="client-name">{{ page.clientName }}</p>
          </div>
          <strong class="amount">¥{{ page.amount }}</strong>
        </div>
        <p v-if="page.description" class="order-copy">{{ page.description }}</p>
        <div v-if="paid" class="success-box">
          <strong>支付结果已提交</strong>
          <span>{{ page.successText || '支付成功后，我们会按约定完成交付。' }}</span>
        </div>
        <form v-else @submit.prevent="submitOrder">
          <label>备注（可选）
            <textarea v-model="note" maxlength="300" rows="3" placeholder="填写项目名称、联系方式或交付说明" />
          </label>
          <p v-if="!page.paymentEnabled" class="muted-box">当前订单暂未开启支付宝支付，请联系管理员。</p>
          <p v-if="error" class="order-error">{{ error }}</p>
          <button :disabled="loading || !page.paymentEnabled" type="submit">
            {{ loading ? '正在创建订单…' : page.paymentEnabled ? '前往支付宝付款' : '暂不可付款' }}
          </button>
        </form>
        <p class="order-note">订单后缀：{{ suffix }}</p>
      </template>
      <div v-else class="state error-state">订单页面不存在或已关闭。</div>
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

onMounted(async () => {
  try {
    if (paid.value) {
      await $fetch(`/api/order/${encodeURIComponent(suffix.value)}/return`, { query: route.query })
    }
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
      body: { note: note.value }
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
.order-page { min-height: 100svh; display: grid; place-items: center; padding: 24px; background: radial-gradient(circle at 20% 10%, #d9f4ee, transparent 40%), #eef2f1; }
.order-card { width: min(100%, 580px); padding: 42px; border: 1px solid rgba(17,24,39,.12); background: rgba(255,255,255,.94); box-shadow: 0 24px 70px rgba(17,24,39,.14); }
.order-eyebrow { color: #0f766e; font: 700 10px/1.2 monospace; letter-spacing: .16em; }
.order-heading { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; margin-top: 20px; }
h1 { margin: 0; color: #17202b; font: 700 34px/1.15 'Xo Display', serif; }
.client-name { margin-top: 8px; color: #667085; font-size: 12px; }
.amount { color: #0f766e; font: 700 30px/1 monospace; white-space: nowrap; }
.order-copy, .order-note { margin-top: 14px; color: #667085; font-size: 13px; line-height: 1.75; }
form { display: grid; gap: 16px; margin-top: 28px; }
label { display: grid; gap: 8px; color: #34413f; font-size: 12px; font-weight: 700; }
textarea { resize: vertical; border: 1px solid rgba(17,24,39,.16); padding: 12px 13px; color: #17202b; background: #fbfdfc; outline: 0; font: 13px/1.5 'Xo Sans', sans-serif; }
textarea:focus { border-color: #0f766e; box-shadow: 0 0 0 4px rgba(15,118,110,.1); }
button { min-height: 50px; border: 0; color: #fff; background: #111827; font-size: 13px; font-weight: 700; cursor: pointer; }
button:disabled { opacity: .55; cursor: not-allowed; }
.order-error { color: #be123c; font-size: 12px; }.muted-box,.success-box { padding: 13px; font-size: 12px; line-height: 1.6; }.muted-box { color:#92400e; background:#fffbeb; }.success-box { display:grid; gap:4px; margin-top:24px; color:#166534; background:#f0fdf4; }.state { padding-top: 32px; color:#667085; font-size:13px; }.error-state { color:#be123c; }
@media (max-width: 480px) { .order-card { padding: 28px 22px; } .order-heading { display:block; } .amount { display:block; margin-top:18px; } h1 { font-size: 30px; } }
</style>
