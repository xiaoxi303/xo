<template>
  <NuxtPage v-if="suffix" />
  <main v-else class="catalog-page">
    <section class="catalog-shell">
      <header class="catalog-header">
        <div>
          <p class="eyebrow">XO STUDIO / ORDER CATALOG</p>
          <h1>选择服务</h1>
          <p class="intro">选择需要的服务，商品名称和金额由后台统一维护。</p>
        </div>
        <SecureSessionChip />
      </header>

      <div v-if="loading" class="empty">正在加载商品…</div>
      <div v-else-if="error" class="empty error">{{ error }}</div>
      <div v-else-if="items.length" class="catalog-grid">
        <NuxtLink
          v-for="item in items"
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
            <span class="product-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M7 3h10v18H7z" />
                <path d="M9.5 7h5M9.5 11h5M9.5 15h3" />
              </svg>
            </span>
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
const route = useRoute()
const suffix = computed(() => String(route.params.suffix || '').trim())
const items = ref<any[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  if (suffix.value) return
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
.catalog-page {
  min-height: 100svh;
  position: relative;
  overflow: hidden;
  padding: clamp(42px, 8vw, 92px) 24px 48px;
  color: #172235;
  background: #dbe8f6;
  background-image:
    radial-gradient(circle at 6% 12%, rgba(80, 214, 205, .7), transparent 30%),
    radial-gradient(circle at 94% 6%, rgba(152, 132, 255, .58), transparent 31%),
    radial-gradient(circle at 76% 94%, rgba(255, 184, 123, .62), transparent 35%),
    linear-gradient(135deg, #e9f8f2 0%, #d8e2f5 48%, #fae8de 100%);
}

.catalog-page::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .42;
  background-image:
    linear-gradient(rgba(255, 255, 255, .32) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, .32) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: linear-gradient(to bottom, black, transparent 82%);
}

.catalog-page::before {
  content: "";
  position: absolute;
  inset: -20%;
  pointer-events: none;
  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, .6) 44%, transparent 58%);
  transform: rotate(-10deg);
  animation: catalog-sweep 12s ease-in-out infinite alternate;
}

.catalog-shell {
  position: relative;
  z-index: 1;
  width: min(100%, 1040px);
  margin: 0 auto;
}

.catalog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 30px;
}

.eyebrow {
  color: #4969a0;
  font: 700 10px/1.2 var(--font-mono, ui-monospace), monospace;
  letter-spacing: .18em;
}

.catalog-header h1 {
  margin-top: 17px;
  color: #172235;
  font: 700 clamp(44px, 7vw, 76px)/1.02 var(--font-display, Georgia), serif;
}

.intro {
  max-width: 500px;
  margin-top: 14px;
  color: #52647c;
  font-size: 15px;
  line-height: 1.75;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
  margin-top: 48px;
}

.product-card {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  min-height: 300px;
  overflow: hidden;
  padding: 28px 30px 25px;
  color: inherit;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, .78);
  border-radius: 30px;
  background: linear-gradient(145deg, rgba(255, 255, 255, .58), rgba(255, 255, 255, .2));
  box-shadow: 0 24px 60px rgba(57, 83, 122, .18), 0 1px 0 rgba(255, 255, 255, .95) inset;
  backdrop-filter: blur(34px) saturate(1.6);
  -webkit-backdrop-filter: blur(34px) saturate(1.6);
  transition: transform .3s cubic-bezier(.16, 1, .3, 1), box-shadow .3s, border-color .3s;
}

.product-card:hover {
  transform: translateY(-7px) scale3d(1.01, 1.01, 1);
  border-color: rgba(255, 255, 255, .98);
  box-shadow: 0 34px 76px rgba(57, 83, 122, .24), 0 1px 0 rgba(255, 255, 255, .98) inset;
}

.product-card:active {
  transform: translateY(-2px) scale3d(0.985, 0.985, 1);
  transition-duration: 0.08s;
}

.product-card:focus-visible {
  outline: 3px solid rgba(55, 101, 183, .55);
  outline-offset: 5px;
}

.product-card::before {
  content: "";
  position: absolute;
  inset: 1px;
  z-index: -1;
  border: 1px solid rgba(255, 255, 255, .5);
  border-radius: 29px;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, .25) inset;
  pointer-events: none;
}

.card-shine {
  position: absolute;
  z-index: -1;
  top: -48%;
  left: 2%;
  width: 72%;
  height: 88%;
  background: linear-gradient(110deg, rgba(255, 255, 255, .74), rgba(255, 255, 255, 0));
  filter: blur(20px);
  transform: rotate(-8deg);
  pointer-events: none;
  opacity: .85;
}

.card-top, .select-link {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
}

.product-code {
  color: #7185a2;
  font: 700 10px/1.2 var(--font-mono, ui-monospace), monospace;
}

.card-top strong {
  color: #256c88;
  font: 700 27px/1 var(--font-mono, ui-monospace), monospace;
  white-space: nowrap;
}

.card-top strong i {
  margin-right: 3px;
  font-size: .55em;
  font-style: normal;
}

.card-main {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-top: 54px;
}

.product-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 48px;
  height: 48px;
  color: #226b8d;
  border: 1px solid rgba(255, 255, 255, .84);
  border-radius: 17px;
  background: linear-gradient(145deg, rgba(204, 255, 247, .8), rgba(176, 218, 255, .42));
  box-shadow: 0 9px 22px rgba(45, 122, 147, .16), 0 1px 0 rgba(255, 255, 255, .95) inset;
}

.product-icon svg { width: 21px; height: 21px; }
.product-card h2 { margin: 0; color: #172235; font: 700 31px/1.14 var(--font-display, Georgia), serif; }
.client { margin-top: 8px; color: #526b88; font-size: 12px; }
.description { margin-top: 13px; color: #52647c; font-size: 13px; line-height: 1.7; }

.select-link {
  align-items: center;
  margin-top: auto;
  padding-top: 28px;
  color: #20324a;
  font-size: 13px;
  font-weight: 700;
}

.select-link b { color: #226b8d; font-size: 23px; font-weight: 400; transition: transform .25s; }
.product-card:hover .select-link b { transform: translateX(5px); }

.empty {
  margin-top: 48px;
  padding: 46px;
  color: #52647c;
  text-align: center;
  border: 1px dashed rgba(87, 120, 163, .38);
  border-radius: 24px;
  background: rgba(255, 255, 255, .3);
  backdrop-filter: blur(18px);
}

.error { color: #ad3153; }
.catalog-footer { margin: 32px 0 0; color: #7185a2; text-align: center; font: 10px/1.2 var(--font-mono, ui-monospace), monospace; letter-spacing: .16em; }
.catalog-footer span { margin: 0 7px; color: #256c88; }

@media (max-width: 700px) {
  .catalog-page { padding: 40px 16px 28px; }
  .catalog-header { display: block; }
  .catalog-grid { grid-template-columns: 1fr; margin-top: 30px; }
  .product-card { min-height: 270px; padding: 24px; }
  .card-main { margin-top: 40px; }
  .catalog-header h1 { font-size: clamp(42px, 15vw, 64px); }
}

@media (prefers-reduced-motion: no-preference) {
  .product-card { animation: catalog-float 8s ease-in-out infinite alternate; }
  .product-card:nth-child(2n) { animation-delay: -3s; }
}

@keyframes catalog-float { from { transform: translateY(0); } to { transform: translateY(-3px); } }
@keyframes catalog-sweep { from { transform: translateX(-18%) rotate(-10deg); } to { transform: translateX(18%) rotate(-10deg); } }
@media (prefers-reduced-motion: reduce) { .catalog-page::before, .product-card { animation: none; } }
</style>
