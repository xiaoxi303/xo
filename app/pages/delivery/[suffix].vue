<template>
  <div class="delivery-page min-h-screen pt-24 pb-28 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden selection:bg-amber-500 selection:text-white" style="background: var(--color-bg);">
    <!-- Studio Ambient Luxury Glows -->
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-0 animate-pulse"
      style="width: 1100px; height: 500px; background: radial-gradient(circle, rgba(217,119,6,0.18) 0%, rgba(147,51,234,0.12) 45%, transparent 75%); filter: blur(75px);"
    />
    <div
      class="absolute bottom-12 right-12 pointer-events-none z-0"
      style="width: 550px; height: 550px; background: radial-gradient(circle, rgba(217,119,6,0.1) 0%, transparent 70%); filter: blur(80px);"
    />

    <div class="max-w-6xl mx-auto space-y-12 relative z-10">

      <!-- Header: Studio Brand & Security Navigation -->
      <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
        <NuxtLink to="/" class="inline-flex items-center gap-2.5 group cursor-pointer" aria-label="返回 Xo Studio 首页">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center text-white shadow-md border border-white/10 group-hover:scale-105 transition-transform">
            <IconSax name="video-play" :size="18" />
          </div>
          <div>
            <div class="font-display font-bold text-lg tracking-tight text-slate-900 group-hover:text-amber-800 transition-colors flex items-center gap-1.5">
              <span>XO / DELIVERY</span>
              <span class="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            </div>
            <div class="text-[9px] font-mono tracking-[0.15em] uppercase font-bold text-slate-600">
              PRIVATE CLIENT NODE
            </div>
          </div>
        </NuxtLink>

        <div class="flex items-center gap-3">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 text-[11px] font-mono font-bold shadow-xs">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>AES-256 E2EE 安全交付通道</span>
          </div>

          <NuxtLink to="/client" class="btn-ghost text-xs py-1.5 px-4 rounded-full border border-black/10 hover:border-amber-600/40 shadow-xs bg-white/70 flex items-center gap-1.5">
            <span>客户中心</span>
            <IconSax name="arrow-right" :size="13" />
          </NuxtLink>
        </div>
      </header>

      <!-- Main Stage Section: Dual Column for Gate / Showcase -->
      <main class="space-y-12">

        <!-- Hero & Access Gate Card (未验证 / 验证表单) -->
        <section class="grid lg:grid-cols-12 gap-8 items-center min-h-[500px]">
          
          <!-- Left Column: Master Delivery Slate Brief (7 cols) -->
          <div class="lg:col-span-7 space-y-6">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-amber-800 text-xs font-mono font-bold tracking-wider uppercase bg-amber-500/10 border border-amber-600/25 shadow-xs">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
              <span>EXCLUSIVE MASTER DELIVERY · PRIVATE NODE</span>
            </div>

            <h1 class="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
              专属母带交付，<br />
              <span class="text-amber-700">只属于您的作品放映厅。</span>
            </h1>

            <p class="text-sm sm:text-base text-slate-600 font-sans max-w-xl leading-relaxed">
              这是为当前项目定制建立的独立私密交付节点。输入专属查看密钥后，系统将为您呈现已授权的 4K/8K 工业级成片母带、分发画幅切片与高保真素材。
            </p>

            <!-- Route Row with One-Click Copy -->
            <div class="flex items-center gap-3 p-2 pl-4 rounded-2xl bg-white/90 border border-black/[0.08] shadow-sm max-w-lg">
              <span class="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider shrink-0">
                交付节点后缀:
              </span>
              <code class="text-xs font-mono font-bold text-amber-900 truncate flex-1">
                /delivery/{{ suffix || '—' }}
              </code>
              <button
                type="button"
                @click="copyEntryLink"
                class="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                :class="copied ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-black/[0.04] text-slate-700 hover:bg-amber-50 hover:text-amber-800 border-black/10'"
                :title="copied ? '已复制交付入口' : '复制完整交付地址'"
              >
                <IconSax :name="copied ? 'tick' : 'copy'" :size="13" />
                <span>{{ copied ? '已复制 ✓' : '复制链接' }}</span>
              </button>
            </div>

            <!-- 3 Core Security Badges -->
            <div class="grid grid-cols-3 gap-3 max-w-lg pt-2">
              <div class="p-3 rounded-xl bg-white/70 border border-black/[0.05] shadow-2xs space-y-1">
                <div class="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <IconSax name="shield-security" :size="14" class="text-amber-700" />
                  <span>客户级隔离</span>
                </div>
                <div class="text-[10px] text-slate-600 font-sans">独立沙箱安全存储</div>
              </div>
              <div class="p-3 rounded-xl bg-white/70 border border-black/[0.05] shadow-2xs space-y-1">
                <div class="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <IconSax name="security-safe" :size="14" class="text-amber-700" />
                  <span>动态密钥鉴权</span>
                </div>
                <div class="text-[10px] text-slate-600 font-sans">端到端会话加密</div>
              </div>
              <div class="p-3 rounded-xl bg-white/70 border border-black/[0.05] shadow-2xs space-y-1">
                <div class="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <IconSax name="lock" :size="14" class="text-amber-700" />
                  <span>无损母带直出</span>
                </div>
                <div class="text-[10px] text-slate-600 font-sans">4K ProRes 高清流</div>
              </div>
            </div>
          </div>

          <!-- Right Column: Verification Card (5 cols) -->
          <div class="lg:col-span-5">
            <div class="rounded-[32px] border-2 border-amber-500/25 bg-white/95 backdrop-blur-2xl shadow-[0_24px_80px_rgba(217,119,6,0.14)] p-8 sm:p-10 space-y-6 relative overflow-hidden">
              <!-- Top Gold Gradient Hairline -->
              <div class="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-600 via-amber-400 to-amber-700" />

              <!-- Card Header -->
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <div class="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-600">
                    NODE A / 01 · ACCESS CONTROL
                  </div>
                  <h2 class="font-display text-2xl font-bold text-slate-900 tracking-tight">
                    验证查看密钥
                  </h2>
                </div>
                <div class="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
                  <IconSax name="key" :size="20" />
                </div>
              </div>

              <!-- Node Target Info -->
              <div class="flex items-center justify-between p-3 rounded-xl bg-black/[0.03] border border-black/[0.05] text-xs font-mono">
                <span class="text-slate-500">{{ entry?.label || entry?.title || 'PRIVATE DELIVERY NODE' }}</span>
                <span class="font-bold text-amber-800">为 {{ ownerLabel }} 设定</span>
              </div>

              <!-- Loading State -->
              <div v-if="entryLoading" class="flex items-center justify-center gap-3 py-10 text-xs font-mono text-slate-500">
                <span class="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                <span>正在校验交付节点网络状态…</span>
              </div>

              <!-- Error State -->
              <div v-else-if="entryError && accessState !== 'success'" class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
                <div class="flex items-center gap-2 font-bold">
                  <IconSax name="close" :size="16" />
                  <span>入口暂不可用</span>
                </div>
                <p class="text-[11px] leading-relaxed">{{ entryError }}</p>
                <NuxtLink v-if="authRequired" to="/login" class="inline-block font-bold text-rose-900 underline">
                  登录客户账号后继续 →
                </NuxtLink>
              </div>

              <!-- Blacklisted State -->
              <div v-else-if="accessState === 'blacklisted'" class="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
                <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl shadow-xs">
                  <IconSax name="lock" :size="22" />
                </div>
                <h3 class="font-bold text-rose-900 text-base">此账号访问权限已受限</h3>
                <p class="text-xs text-rose-700 leading-relaxed">{{ blockedText }}</p>
                <NuxtLink to="/" class="btn-ghost text-xs py-2 px-5 rounded-full border border-rose-300">
                  返回首页
                </NuxtLink>
              </div>

              <!-- Success / Unlocked State Card -->
              <div v-else-if="accessState === 'success'" class="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-4">
                <div class="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto text-2xl shadow-sm border border-emerald-500/20 animate-bounce">
                  ✨
                </div>
                <div class="space-y-1">
                  <h3 class="font-display font-bold text-emerald-950 text-xl">交付内容已成功解锁！</h3>
                  <p class="text-xs text-emerald-800 font-sans">
                    {{ projects.length ? `已加载 ${projects.length} 项交付成片与母带` : '当前节点已认证，素材正在准备中' }}
                  </p>
                </div>
                <div class="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    @click="resetAccess"
                    class="btn-ghost text-xs py-2 px-4 rounded-xl border border-emerald-300 text-emerald-800 hover:bg-emerald-100/50"
                  >
                    🔒 锁定并退出
                  </button>
                  <button
                    type="button"
                    @click="scrollToProjects"
                    class="btn-primary text-xs py-2 px-5 rounded-xl shadow-md"
                  >
                    立即查看成片 ↓
                  </button>
                </div>
              </div>

              <!-- Input Form for Unlocking -->
              <form v-else @submit.prevent="unlockDelivery" class="space-y-4">
                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700">
                    <span class="text-amber-600">●</span> 专属查看密钥 (Delivery Key)
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-700">
                      <IconSax name="key" :size="16" />
                    </div>
                    <input
                      v-model="viewKey"
                      :type="showKey ? 'text' : 'password'"
                      required
                      autocomplete="current-password"
                      class="form-input text-xs pl-10 pr-10 font-mono tracking-wider w-full"
                      placeholder="请输入管理员或邮件提供的专属密钥"
                      :disabled="accessBusy"
                    />
                    <button
                      type="button"
                      @click="showKey = !showKey"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                      :title="showKey ? '隐藏密钥' : '显示密钥'"
                    >
                      <IconSax :name="showKey ? 'eye-slash' : 'eye'" :size="16" />
                    </button>
                  </div>
                  <p class="text-[10px] text-slate-600 font-sans">
                    🔒 密钥仅用于本次交付节点鉴权，不会显示在地址栏或任何公开页面。
                  </p>
                </div>

                <div v-if="accessState === 'warning'" class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <strong>⚠️ 访问警告:</strong> {{ warningText }}
                </div>

                <button
                  type="submit"
                  :disabled="accessBusy || !viewKey.trim()"
                  class="xo-kinetic-btn w-full py-3.5 text-xs font-bold text-white bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 hover:from-amber-600 hover:via-amber-500 hover:to-amber-700 border border-white/10 rounded-2xl shadow-xl hover:shadow-[0_12px_36px_rgba(217,119,6,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span v-if="accessBusy" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <IconSax v-else name="arrow-right" :size="15" />
                  <span>{{ accessBusy ? '正在安全鉴权…' : '进入专属交付放映室' }}</span>
                </button>
              </form>

              <!-- Node Status Footer -->
              <div class="flex items-center justify-between pt-3 border-t border-black/[0.05] text-[10px] font-mono text-slate-600">
                <span>节点运行状态:</span>
                <span class="font-bold flex items-center gap-1.5" :class="statusClass">
                  <span class="w-1.5 h-1.5 rounded-full" :class="accessState === 'success' ? 'bg-emerald-500' : 'bg-amber-600 animate-pulse'" />
                  <span>{{ statusLabel }}</span>
                </span>
              </div>

            </div>
          </div>

        </section>

        <!-- Authorized Deliverables Section (授权成片展示) -->
        <section id="deliverables-section" class="space-y-6 pt-6 border-t border-black/[0.06] scroll-mt-24">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div class="space-y-1">
              <div class="text-xs font-mono font-bold text-amber-700 tracking-wider uppercase">AUTHORIZED MASTER REEL</div>
              <h2 class="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                授权交付母带成果
              </h2>
            </div>
            
            <div v-if="accessState === 'success'" class="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span class="font-bold text-2xl font-display text-amber-800">{{ projects.length }}</span>
              <span>ITEMS AUTHORIZED</span>
            </div>
          </div>

          <!-- Unlocked Projects Grid -->
          <div v-if="accessState === 'success' && projects.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <article
              v-for="(project, index) in projects"
              :key="project.slug || index"
              class="glass-card rounded-3xl overflow-hidden border border-amber-600/15 bg-white/95 shadow-md hover:shadow-xl hover:border-amber-500/40 transition-all flex flex-col justify-between group"
            >
              <!-- Media Player / Poster -->
              <div class="relative aspect-video bg-black/90 overflow-hidden">
                <video
                  v-if="project.videoUrl"
                  :src="String(project.videoUrl)"
                  :poster="project.image || undefined"
                  controls
                  playsinline
                  preload="metadata"
                  class="w-full h-full object-contain"
                />
                <img
                  v-else-if="project.image"
                  :src="project.image"
                  :alt="project.title || '授权项目'"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-slate-500">
                  <IconSax name="video-play" :size="36" />
                </div>

                <span class="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white/80 font-mono text-[10px] font-bold">
                  REEL {{ String(index + 1).padStart(2, '0') }}
                </span>

                <span class="absolute top-3 right-3 px-2 py-0.5 rounded bg-emerald-500/90 text-white font-mono text-[10px] font-bold shadow-xs flex items-center gap-1">
                  <span>✓</span>
                  <span>已授权母带</span>
                </span>
              </div>

              <!-- Body Info -->
              <div class="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div class="space-y-2">
                  <div class="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider">
                    {{ project.slug || 'MASTER ASSET' }}
                  </div>
                  <h3 class="font-display text-xl font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                    {{ project.title || project.slug || '未命名交付成果' }}
                  </h3>
                  <p v-if="project.description" class="text-xs text-slate-600 leading-relaxed font-sans line-clamp-3">
                    {{ project.description }}
                  </p>
                </div>

                <!-- Deliverable Spec Badges -->
                <div class="pt-3 border-t border-black/[0.05] flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-600">
                  <span class="px-2 py-0.5 rounded bg-black/[0.04] border border-black/[0.05]">4K UHD</span>
                  <span class="px-2 py-0.5 rounded bg-black/[0.04] border border-black/[0.05]">ProRes 4444</span>
                  <span class="px-2 py-0.5 rounded bg-black/[0.04] border border-black/[0.05]">ACEScct</span>
                </div>

                <!-- Actions -->
                <div class="pt-2 flex items-center gap-2">
                  <NuxtLink
                    v-if="project.slug && !project.deliveryOnly"
                    :to="projectLink(project)"
                    class="btn-primary text-xs py-2 px-4 rounded-xl flex-1 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>进入全功能审片室</span>
                    <IconSax name="arrow-right" :size="13" />
                  </NuxtLink>

                  <a
                    v-if="project.videoUrl"
                    :href="String(project.videoUrl)"
                    download
                    target="_blank"
                    class="btn-ghost text-xs py-2 px-4 rounded-xl border flex items-center gap-1.5 hover:bg-black/5"
                    title="下载母带源文件"
                  >
                    <span>💾 下载源文件</span>
                  </a>
                </div>
              </div>
            </article>
          </div>

          <!-- Empty Deliverables State -->
          <div v-else-if="accessState === 'success'" class="glass-card p-12 text-center space-y-4 rounded-3xl border border-black/10">
            <div class="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-800 flex items-center justify-center mx-auto text-3xl shadow-xs">
              🎬
            </div>
            <div class="space-y-1">
              <h3 class="font-display font-bold text-slate-900 text-lg">当前节点暂未挂载视频素材</h3>
              <p class="text-xs text-slate-500 max-w-sm mx-auto font-sans leading-relaxed">
                制作团队正在进行最终母带渲染与调色质检，请稍候刷新或直接与项目总监取得联系。
              </p>
            </div>
          </div>

          <!-- Locked State Placeholder -->
          <div v-else class="glass-card p-12 text-center space-y-4 rounded-3xl border border-dashed border-amber-600/30 bg-white/60">
            <div class="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto text-3xl shadow-xs">
              🔒
            </div>
            <div class="space-y-1">
              <h3 class="font-display font-bold text-slate-900 text-lg">授权项目将在验证密钥后显示</h3>
              <p class="text-xs text-slate-500 max-w-sm mx-auto font-sans leading-relaxed">
                为保护客户商业机密与未宣发物料安全，请在上方输入查看密钥，系统将自动加载专属素材。
              </p>
            </div>
          </div>
        </section>

        <!-- Terms and Security Protocols -->
        <section class="space-y-4 pt-6 border-t border-black/[0.06]">
          <div class="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider">
            DELIVERY & SECURITY PROTOCOLS
          </div>

          <div class="grid sm:grid-cols-3 gap-4">
            <div class="p-5 rounded-2xl bg-white/80 border border-black/[0.06] shadow-2xs space-y-2">
              <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
                <span class="w-5 h-5 rounded-full bg-amber-500/15 text-amber-800 font-mono text-[10px] flex items-center justify-center font-bold">01</span>
                <span>仅限授权客户查看</span>
              </div>
              <p class="text-[11px] text-slate-600 leading-relaxed font-sans">
                每个独立交付后缀实行物理隔离，仅供被授权合作方与制片人审片与使用。
              </p>
            </div>

            <div class="p-5 rounded-2xl bg-white/80 border border-black/[0.06] shadow-2xs space-y-2">
              <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
                <span class="w-5 h-5 rounded-full bg-amber-500/15 text-amber-800 font-mono text-[10px] flex items-center justify-center font-bold">02</span>
                <span>隐形防盗链溯源水印</span>
              </div>
              <p class="text-[11px] text-slate-600 leading-relaxed font-sans">
                交付页面内置不可逆隐形 Canvas 频域水印与动态溯源标记，未经授权严禁二次倒卖与外泄。
              </p>
            </div>

            <div class="p-5 rounded-2xl bg-white/80 border border-black/[0.06] shadow-2xs space-y-2">
              <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
                <span class="w-5 h-5 rounded-full bg-amber-500/15 text-amber-800 font-mono text-[10px] flex items-center justify-center font-bold">03</span>
                <span>全格式母带工业归档</span>
              </div>
              <p class="text-[11px] text-slate-600 leading-relaxed font-sans">
                完成最终验收后，成片将自动进入 5 年冷备份离线母带库，保障长线商业版权安全。
              </p>
            </div>
          </div>
        </section>

      </main>

      <!-- Footer -->
      <footer class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-black/[0.06] text-xs font-mono text-slate-600">
        <div class="flex items-center gap-2">
          <span>XO STUDIO</span>
          <span>•</span>
          <span>PRIVATE MASTER DELIVERY SUITE</span>
        </div>
        <div>
          © {{ new Date().getFullYear() }} · ACCESS IS ACCOUNT-BOUND & PROTECTED
        </div>
      </footer>

    </div>
  </div>
</template>

<script setup lang="ts">
import { copyToClipboard, getNormalizedOrigin } from '~/utils/clipboard'

interface DeliveryProject {
  slug: string
  title?: string
  description?: string
  image?: string
  videoUrl?: string
  deliveryOnly?: boolean
  [key: string]: unknown
}

interface DeliveryEntry {
  suffix?: string
  title?: string
  label?: string
  ownerName?: string
  owner?: string | { username?: string; name?: string }
  projectCount?: number
  status?: string
  viewerStatus?: string
  authorized?: boolean
  isAuthorized?: boolean
  isBlacklisted?: boolean
  blacklisted?: boolean
  warningCount?: number
  rules?: string[]
  [key: string]: unknown
}

type AccessState = 'locked' | 'loading' | 'success' | 'warning' | 'blacklisted' | 'error'

const route = useRoute()
const suffix = computed(() => String(route.params.suffix || '').trim().replace(/^\/+|\/+$/g, ''))
const entry = ref<DeliveryEntry | null>(null)
const entryLoading = ref(true)
const entryError = ref('')
const authRequired = ref(false)
const viewKey = ref('')
const showKey = ref(false)
const accessBusy = ref(false)
const accessState = ref<AccessState>('loading')
const warningText = ref('该交付后缀不属于当前账号。请停止继续尝试，并联系项目负责人。')
const blockedText = ref('因重复越权访问，该账号已被系统限制继续查看交付内容。已支付费用不予退还。')
const projects = ref<DeliveryProject[]>([])
const accessTicket = ref('')
const copied = ref(false)

const unwrap = (value: any): any => {
  if (value?.data && typeof value.data === 'object' && !Array.isArray(value.data)) return value.data
  if (value?.result && typeof value.result === 'object' && !Array.isArray(value.result)) return value.result
  return value || {}
}

const normalizeProjects = (value: any): DeliveryProject[] => {
  if (!Array.isArray(value)) return []
  return value
    .filter(Boolean)
    .map((project: any) => ({
      ...project,
      slug: String(project.slug || project.projectSlug || project.id || '').trim()
    }))
    .filter(project => project.slug)
}

const extractError = (error: any) => {
  const payload = error?.data || error?.response?._data || {}
  const statusCode = Number(error?.statusCode || payload?.statusCode || error?.status || 0)
  const message = String(payload?.statusMessage || payload?.message || error?.statusMessage || error?.message || '').trim()
  const code = String(payload?.code || payload?.status || error?.code || '').toLowerCase()
  const blacklisted = Boolean(payload?.blacklisted || payload?.isBlacklisted || /blacklist|拉黑|封禁|revoked|blocked/.test(`${code} ${message}`) || statusCode === 423)
  const warning = Boolean(payload?.warning || payload?.firstWarning || code.includes('warning') || /越权|警告|unauthorized|not.*owner/.test(`${code} ${message}`))
  return { statusCode, message, blacklisted, warning }
}

const readEntry = async () => {
  if (!suffix.value) {
    entryLoading.value = false
    entryError.value = '交付后缀为空，请检查入口地址。'
    accessState.value = 'error'
    return
  }

  entryLoading.value = true
  entryError.value = ''
  authRequired.value = false
  try {
    const response = await $fetch<any>(`/api/delivery/${encodeURIComponent(suffix.value)}`)
    const payload = unwrap(response) as DeliveryEntry
    entry.value = payload
    const availableProjects = normalizeProjects(payload.projects || payload.authorizedProjects || payload.allowedProjects)
    if (availableProjects.length) projects.value = availableProjects

    if (payload.isBlacklisted || payload.blacklisted || /blacklist|blocked|revoked|拉黑|封禁/i.test(String(payload.status || payload.viewerStatus || ''))) {
      accessState.value = 'blacklisted'
    } else if (payload.authorized || payload.isAuthorized || availableProjects.length) {
      accessState.value = 'success'
    } else {
      accessState.value = 'locked'
    }
  } catch (error: any) {
    const info = extractError(error)
    if (info.blacklisted) {
      accessState.value = 'blacklisted'
      blockedText.value = info.message || blockedText.value
    } else {
      accessState.value = 'locked'
      entryError.value = info.message || '无法读取该交付入口，请稍后重试。'
      authRequired.value = info.statusCode === 401
    }
  } finally {
    entryLoading.value = false
  }
}

const unlockDelivery = async () => {
  const key = viewKey.value.trim()
  if (!key || accessBusy.value || !suffix.value) return

  accessBusy.value = true
  entryError.value = ''
  authRequired.value = false
  warningText.value = '该交付后缀不属于当前账号。请停止继续尝试，并联系项目负责人。'
  try {
    const response = await $fetch<any>(`/api/delivery/${encodeURIComponent(suffix.value)}/access`, {
      method: 'POST',
      body: { key, viewKey: key }
    })
    const payload = unwrap(response)
    const grantedProjects = normalizeProjects(payload.projects || payload.authorizedProjects || payload.allowedProjects)
    projects.value = grantedProjects
    accessTicket.value = String(payload.accessTicket || payload.deliveryTicket || payload.ticket || payload.token || '')
    accessState.value = 'success'
    viewKey.value = ''
  } catch (error: any) {
    const info = extractError(error)
    if (info.blacklisted) {
      accessState.value = 'blacklisted'
      blockedText.value = info.message || blockedText.value
    } else if (info.warning) {
      accessState.value = 'warning'
      warningText.value = info.message || warningText.value
    } else {
      accessState.value = 'error'
      entryError.value = info.message || '密钥无效或已过期，请检查后重试。'
      authRequired.value = info.statusCode === 401
    }
  } finally {
    accessBusy.value = false
  }
}

const resetAccess = () => {
  accessState.value = 'locked'
  viewKey.value = ''
  accessTicket.value = ''
  entryError.value = ''
  authRequired.value = false
}

const copyEntryLink = async () => {
  if (!suffix.value) return
  const origin = getNormalizedOrigin()
  const link = `${origin}/delivery/${encodeURIComponent(suffix.value)}`
  const ok = await copyToClipboard(link)
  if (ok) {
    copied.value = true
    window.setTimeout(() => { copied.value = false }, 2000)
  }
}

const projectLink = (project: DeliveryProject) => {
  return `/projects/${encodeURIComponent(project.slug)}`
}

const scrollToProjects = () => {
  const el = document.getElementById('deliverables-section')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const ownerLabel = computed(() => {
  const owner = entry.value?.owner
  if (typeof owner === 'string') return owner
  return entry.value?.ownerName || (owner && (owner.name || owner.username)) || '专属客户'
})

const statusLabel = computed(() => {
  if (accessState.value === 'blacklisted') return 'ACCESS REVOKED'
  if (accessState.value === 'success') return 'VERIFIED / UNLOCKED'
  if (accessState.value === 'warning') return 'WARNING LOGGED'
  if (accessState.value === 'error') return 'CHECK REQUIRED'
  if (entryLoading.value) return 'CONNECTING'
  return 'ENCRYPTED / LOCKED'
})

const statusClass = computed(() => {
  if (accessState.value === 'blacklisted') return 'text-rose-600'
  if (accessState.value === 'success') return 'text-emerald-600'
  if (accessState.value === 'warning') return 'text-amber-600'
  return 'text-slate-500'
})

useHead(() => ({
  title: `专属母带交付 / ${suffix.value || '放映室'} · XO Studio`
}))

onMounted(readEntry)
watch(suffix, () => {
  if (import.meta.client) readEntry()
})
</script>
