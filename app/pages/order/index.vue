<template>
  <main class="catalog-page">
    <section class="catalog-shell">
      <p class="eyebrow">XO STUDIO / ORDER CATALOG</p>
      <h1>选择服务</h1>
      <p class="intro">请选择要购买的服务，商品名称和金额由后台统一维护。</p>
      <div v-if="loading" class="empty">正在加载商品…</div>
      <div v-else-if="error" class="empty error">{{ error }}</div>
      <div v-else-if="items.length" class="catalog-grid">
        <NuxtLink v-for="item in items" :key="item.suffix" :to="`/order/${encodeURIComponent(item.suffix)}`" class="product-card">
          <div class="card-top"><span class="product-code">/order/{{ item.suffix }}</span><strong>¥{{ item.amount }}</strong></div>
          <h2>{{ item.subject }}</h2>
          <p v-if="item.clientName" class="client">{{ item.clientName }}</p>
          <p v-if="item.description" class="description">{{ item.description }}</p>
          <span class="select-link">查看详情并付款 <span>→</span></span>
        </NuxtLink>
      </div>
      <div v-else class="empty">暂无可购买商品，请联系管理员。</div>
    </section>
  </main>
</template>
<script setup lang="ts">
const items = ref<any[]>([])
const loading = ref(true)
const error = ref('')
onMounted(async () => {
  try { items.value = await $fetch<any[]>('/api/order') }
  catch (err: any) { error.value = err.data?.statusMessage || '商品加载失败，请稍后重试。' }
  finally { loading.value = false }
})
</script>
<style scoped>
.catalog-page{min-height:100svh;padding:70px 24px;background:radial-gradient(circle at 15% 5%,#d9f4ee,transparent 38%),#f4f7f6}.catalog-shell{width:min(100%,980px);margin:0 auto}.eyebrow{color:#0f766e;font:700 10px/1.2 monospace;letter-spacing:.16em}h1{margin-top:18px;color:#17202b;font:700 48px/1.1 'Xo Display',serif}.intro{margin-top:10px;color:#667085;font-size:14px}.catalog-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-top:36px}.product-card{display:block;padding:26px;color:inherit;text-decoration:none;border:1px solid rgba(17,24,39,.12);background:rgba(255,255,255,.92);box-shadow:0 16px 40px rgba(17,24,39,.08)}.card-top{display:flex;justify-content:space-between;gap:14px}.product-code{color:#8b9696;font:700 10px monospace}.card-top strong{color:#0f766e;font:700 24px monospace}h2{margin-top:24px;color:#17202b;font:700 25px/1.2 'Xo Display',serif}.client{margin-top:8px;color:#82918e;font-size:11px}.description{margin-top:14px;color:#667085;font-size:12px;line-height:1.7}.select-link{display:flex;justify-content:space-between;margin-top:24px;color:#111827;font-size:12px;font-weight:700}.empty{margin-top:36px;padding:40px;color:#667085;text-align:center;border:1px dashed rgba(17,24,39,.18)}.error{color:#be123c}@media(max-width:640px){h1{font-size:38px}.catalog-grid{grid-template-columns:1fr}}
</style>
