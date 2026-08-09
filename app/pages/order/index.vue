<template>
  <main class="catalog-page">
    <div class="catalog-light catalog-light-one" aria-hidden="true" />
    <div class="catalog-light catalog-light-two" aria-hidden="true" />

    <section class="catalog-shell">
      <header class="catalog-header">
        <div>
          <p class="eyebrow">XO STUDIO / ORDER CATALOG</p>
          <h1>选择服务</h1>
          <p class="intro">请选择要购买的服务，商品名称和金额由后台统一维护。</p>
        </div>
        <span class="catalog-status"><i /> 安全订单</span>
      </header>

      <div v-if="loading" class="empty">正在加载商品…</div>
      <div v-else-if="error" class="empty error">{{ error }}</div>
      <div v-else-if="items.length" class="catalog-grid">
        <NuxtLink
          v-for="(item, index) in items"
          :key="item.suffix"
          :to="`/order/${encodeURIComponent(item.suffix)}`"
          class="product-card"
        >
          <span class="card-shine" aria-hidden="true" />
          <div class="card-top">
            <span class="product-code">/order/{{ item.suffix }}</span>
            <strong><i>¥</i>{{ item.amount }}</strong>
          </div>
          <div class="card-main">
            <span class="product-icon" aria-hidden="true">✦</span>
            <div>
              <h2>{{ item.subject }}</h2>
              <p v-if="item.clientName" class="client">{{ item.clientName }}</p>
              <p v-if="item.description" class="description">{{ item.description }}</p>
            </div>
          </div>
          <span class="select-link">查看详情并付款 <b aria-hidden="true">→</b></span>
        </NuxtLink>
      </div>
      <div v-else class="empty">暂无可购买商品，请联系管理员。</div>

      <p class="catalog-footer">XO STUDIO <span>·</span> SECURE CHECKOUT</p>
    </section>
  </main>
</template>

<script setup lang="ts">
const items = ref<any[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    items.value = await $fetch<any[]>('/api/order')
  } catch (err: any) {
    error.value = err.data?.statusMessage || '商品加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.catalog-page{min-height:100svh;position:relative;overflow:hidden;padding:72px 24px 40px;color:#19222d;background:#cfd8ec;background-image:radial-gradient(ellipse at 4% 4%,rgba(44,205,203,.82),transparent 36%),radial-gradient(ellipse at 96% 7%,rgba(255,142,164,.7),transparent 34%),radial-gradient(ellipse at 86% 96%,rgba(255,207,101,.7),transparent 38%),linear-gradient(135deg,#d8f2ef 0%,#cfd8ec 52%,#f3dfd8 100%)}
.catalog-page::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.7;background:linear-gradient(112deg,transparent 0 24%,rgba(255,255,255,.62) 39%,transparent 54%),linear-gradient(25deg,transparent 0 56%,rgba(255,255,255,.5) 70%,transparent 85%);mix-blend-mode:screen}.catalog-light{display:none}
.catalog-shell{position:relative;z-index:1;width:min(100%,980px);margin:0 auto}.catalog-header{display:flex;justify-content:space-between;align-items:flex-end;gap:30px}.eyebrow{color:#0d7973;font:700 10px/1.2 'Xo Mono',monospace;letter-spacing:.18em}.catalog-header h1{margin-top:18px;color:#19222d;font:700 clamp(42px,6vw,62px)/1.05 'Xo Display',Georgia,serif}.intro{margin-top:11px;color:#637388;font-size:14px;line-height:1.7}.catalog-status{display:flex;align-items:center;gap:9px;padding-bottom:8px;color:#637388;font-size:12px;white-space:nowrap}.catalog-status i{width:8px;height:8px;border-radius:50%;background:#18a957;box-shadow:0 0 0 5px rgba(24,169,87,.12)}
.catalog-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-top:42px}.product-card{position:relative;isolation:isolate;display:flex;flex-direction:column;min-height:278px;overflow:hidden;padding:27px 28px 23px;color:inherit;text-decoration:none;border:1px solid rgba(255,255,255,.78);border-radius:24px;background:linear-gradient(145deg,rgba(255,255,255,.28),rgba(255,255,255,.1));box-shadow:0 22px 50px rgba(55,82,89,.2),0 1px 0 rgba(255,255,255,.95) inset,0 -1px 0 rgba(111,150,161,.18) inset,0 0 0 1px rgba(255,255,255,.18);backdrop-filter:blur(38px) saturate(1.8) contrast(1.06);-webkit-backdrop-filter:blur(38px) saturate(1.8) contrast(1.06);transition:transform .28s cubic-bezier(.16,1,.3,1),box-shadow .28s,border-color .28s}.product-card:hover{transform:translateY(-6px);border-color:rgba(255,255,255,.96);box-shadow:0 30px 64px rgba(55,82,89,.26),0 1px 0 rgba(255,255,255,.98) inset,0 -1px 0 rgba(111,150,161,.2) inset}.product-card::before{content:"";position:absolute;inset:1px;z-index:-1;border:1px solid rgba(255,255,255,.56);border-radius:23px;box-shadow:0 0 0 1px rgba(255,255,255,.22) inset;pointer-events:none}.card-shine{position:absolute;z-index:-1;top:-42%;left:4%;width:68%;height:80%;background:linear-gradient(110deg,rgba(255,255,255,.64),rgba(255,255,255,0));filter:blur(18px);transform:rotate(-8deg);pointer-events:none;opacity:.82}.card-top{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.product-code{color:#8497aa;font:700 10px/1.2 'Xo Mono',monospace}.card-top strong{color:#0d8179;font:700 25px/1 'Xo Mono',monospace;white-space:nowrap}.card-top strong i{font-size:.55em;font-style:normal;margin-right:3px}.card-main{display:flex;gap:15px;align-items:flex-start;margin-top:46px}.product-icon{display:grid;place-items:center;flex:none;width:42px;height:42px;border-radius:14px;color:#0d8179;background:rgba(179,239,230,.42);border:1px solid rgba(255,255,255,.72);font-size:18px;box-shadow:0 7px 16px rgba(66,154,146,.16),0 1px 0 rgba(255,255,255,.9) inset}.product-card h2{margin:0;color:#19222d;font:700 29px/1.16 'Xo Display',Georgia,serif}.client{margin-top:8px;color:#718397;font-size:11px}.description{margin-top:13px;color:#637388;font-size:12px;line-height:1.7}.select-link{display:flex;justify-content:space-between;align-items:center;gap:14px;margin-top:auto;padding-top:25px;color:#19222d;font-size:12px;font-weight:700}.select-link b{font-size:20px;font-weight:400;color:#0d8179;transition:transform .25s}.product-card:hover .select-link b{transform:translateX(4px)}
.empty{margin-top:42px;padding:42px;color:#667789;text-align:center;border:1px dashed rgba(103,139,145,.34);border-radius:20px;background:rgba(255,255,255,.28);backdrop-filter:blur(18px)}.error{color:#be123c}.catalog-footer{margin:28px 0 0;text-align:center;color:#8da0b4;font:10px/1.2 'Xo Mono',monospace;letter-spacing:.16em}.catalog-footer span{margin:0 7px;color:#0d7973}
@media(max-width:700px){.catalog-page{padding:44px 16px 28px}.catalog-header{display:block}.catalog-status{margin-top:24px;padding-bottom:0}.catalog-grid{grid-template-columns:1fr;margin-top:30px}.product-card{min-height:250px}.card-main{margin-top:36px}}
@media(prefers-reduced-motion:no-preference){.product-card{animation:catalog-float 8s ease-in-out infinite alternate}.product-card:nth-child(2n){animation-delay:-3s}}@keyframes catalog-float{from{transform:translateY(0)}to{transform:translateY(-2px)}}
</style>
