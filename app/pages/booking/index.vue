<template>
  <div class="booking-page min-h-screen pt-28 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden selection:bg-amber-500 selection:text-white" style="background: var(--color-bg);">
    <!-- Studio Ambient Luxury Glows -->
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-0 animate-pulse"
      style="width: 1100px; height: 520px; background: radial-gradient(circle, rgba(217,119,6,0.18) 0%, rgba(147,51,234,0.1) 45%, transparent 75%); filter: blur(70px);"
    />
    <div
      class="absolute top-1/3 -right-32 pointer-events-none z-0"
      style="width: 600px; height: 600px; background: radial-gradient(circle, rgba(217,119,6,0.12) 0%, transparent 70%); filter: blur(80px);"
    />
    <div
      class="absolute bottom-20 -left-32 pointer-events-none z-0"
      style="width: 600px; height: 600px; background: radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%); filter: blur(90px);"
    />

    <div class="max-w-6xl mx-auto space-y-16 relative z-10">

      <!-- Top Action Bar & Live Studio Status -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-black/[0.06] reveal">
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="btn-ghost inline-flex items-center gap-2 text-xs py-2 px-4 rounded-full border border-black/10 hover:border-amber-600/40 shadow-xs bg-white/70">
            <IconSax name="arrow-left" :size="14" />
            <span>返回首页</span>
          </NuxtLink>
          <NuxtLink to="/projects" class="btn-ghost inline-flex items-center gap-2 text-xs py-2 px-4 rounded-full border border-black/10 hover:border-amber-600/40 shadow-xs bg-white/70">
            <IconSax name="video-play" :size="14" />
            <span>浏览精选作品集</span>
          </NuxtLink>
        </div>

        <div class="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] font-mono">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 font-semibold shadow-xs">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>2026 商务制作排期开放中</span>
          </div>
          <span class="hidden md:inline-flex px-3 py-1.5 rounded-full bg-white/70 border border-black/[0.08] text-slate-600 font-medium">
            ACEScct · 100% DCI-P3 监看
          </span>
        </div>
      </div>

      <!-- Hero Header Section (Hollywood Cinema Slate Style) -->
      <div class="text-center space-y-6 max-w-3xl mx-auto reveal">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-amber-800 text-xs font-mono font-bold tracking-wider uppercase bg-amber-500/10 border border-amber-600/25 shadow-xs">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
          <span>{{ siteConfig?.booking?.heroBadge || 'XO POST-PRODUCTION · COMMERCIAL INQUIRY' }}</span>
        </div>

        <h1 class="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--color-ink-1)] leading-[1.15]">
          {{ siteConfig?.booking?.heroTitle || '商业合作与母带后期排期' }}
        </h1>

        <p class="text-base sm:text-lg text-[var(--color-ink-3)] font-sans leading-relaxed">
          {{ siteConfig?.booking?.heroSub || '专注商业 TVC、品牌形象宣传片、概念大片与院线级调色。24 小时内快速响应，评估制作周期与色彩科学方案。' }}
        </p>

        <!-- Quick Jump Buttons -->
        <div class="pt-2 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            @click="scrollToBookingForm()"
            class="xo-kinetic-btn group inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-sm font-bold text-white bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-white/10 shadow-xl hover:from-amber-600 hover:via-amber-500 hover:to-amber-700 hover:border-amber-400/40 hover:shadow-[0_12px_36px_rgba(217,119,6,0.35)] transition-all cursor-pointer"
          >
            <span>📝</span>
            <span>立即填写预约意向</span>
            <IconSax name="arrow-right" :size="15" class="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          
          <button
            type="button"
            @click="scrollToServices()"
            class="xo-kinetic-btn inline-flex items-center gap-2 px-7 py-4 rounded-full text-sm font-semibold text-slate-800 bg-white/90 border border-black/10 hover:border-amber-600/40 hover:bg-amber-50/50 shadow-md transition-all cursor-pointer"
          >
            <span>🎬</span>
            <span>浏览后期服务矩阵</span>
          </button>
        </div>

        <!-- 4 Key Cinema Value Badges -->
        <div class="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <div class="p-4 rounded-2xl bg-white/80 border border-black/[0.06] shadow-sm backdrop-blur-md space-y-1">
            <div class="text-xs font-mono font-bold text-amber-700">⏱ 24H 响应</div>
            <div class="text-[11px] text-slate-500 font-sans">快速评估排期与梯度预算</div>
          </div>
          <div class="p-4 rounded-2xl bg-white/80 border border-black/[0.06] shadow-sm backdrop-blur-md space-y-1">
            <div class="text-xs font-mono font-bold text-amber-700">🎬 DCI 院线级</div>
            <div class="text-[11px] text-slate-500 font-sans">ACEScct / 100% P3 监看</div>
          </div>
          <div class="p-4 rounded-2xl bg-white/80 border border-black/[0.06] shadow-sm backdrop-blur-md space-y-1">
            <div class="text-xs font-mono font-bold text-amber-700">🔒 严格保密</div>
            <div class="text-[11px] text-slate-500 font-sans">正规签署商业 NDA 协议</div>
          </div>
          <div class="p-4 rounded-2xl bg-white/80 border border-black/[0.06] shadow-sm backdrop-blur-md space-y-1">
            <div class="text-xs font-mono font-bold text-amber-700">💎 全规格母带</div>
            <div class="text-[11px] text-slate-500 font-sans">ProRes 4444 XQ / 8K RAW</div>
          </div>
        </div>
      </div>

      <!-- Services Grid Section -->
      <section id="services-section" class="space-y-8 reveal scroll-mt-28">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div class="space-y-1.5">
            <div class="text-xs font-mono font-bold text-amber-700 tracking-wider uppercase">SERVICE PORTFOLIO</div>
            <h2 class="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">精选后期服务矩阵</h2>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 max-w-md font-sans">
            针对商业品牌、影视宣发与新媒体场景量身定制，提供从初剪到母带交付的全流程工业级支持。
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="(service, idx) in services"
            :key="idx"
            class="group relative p-8 rounded-[30px] border border-amber-600/15 bg-white/90 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(217,119,6,0.12)] hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between"
          >
            <div class="space-y-5">
              <div class="flex items-center justify-between">
                <div class="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 group-hover:scale-105 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <IconSax :name="service.icon || 'video-play'" :size="28" />
                </div>
                <span class="text-[11px] font-mono font-bold text-slate-600 px-3 py-1 rounded-full bg-black/[0.04] border border-black/[0.05]">
                  TIER 0{{ idx + 1 }}
                </span>
              </div>

              <div class="space-y-2">
                <h3 class="font-display text-2xl font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                  {{ service.title }}
                </h3>
                <p class="text-sm text-slate-600 leading-relaxed font-sans">
                  {{ service.desc }}
                </p>
              </div>

              <!-- Deliverable Items -->
              <ul class="space-y-2.5 text-xs text-slate-700 font-sans pt-2 border-t border-black/[0.05]" v-if="getServiceItems(service).length > 0">
                <li
                  v-for="(item, itemIdx) in getServiceItems(service)"
                  :key="itemIdx"
                  class="flex items-center gap-2.5"
                >
                  <span class="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                  <span class="font-medium">{{ item }}</span>
                </li>
              </ul>
            </div>

            <div class="pt-6 mt-4 border-t border-black/[0.05]">
              <button
                type="button"
                @click="selectServiceAndScroll(service.title)"
                class="w-full py-3 px-4 rounded-xl text-xs font-bold text-amber-800 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:border-amber-500/40"
              >
                <span>选择此方案并预约</span>
                <IconSax name="arrow-right" :size="13" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Process Workflow Section -->
      <section class="space-y-8 reveal">
        <div class="text-center space-y-2 max-w-xl mx-auto">
          <div class="text-xs font-mono font-bold text-amber-700 tracking-wider uppercase">PRODUCTION PIPELINE</div>
          <h2 class="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">好莱坞工业化协作流程</h2>
          <p class="text-xs sm:text-sm text-slate-500 font-sans">明确四步法节点，全程透明可追溯，确保母带准时高标交付。</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div
            v-for="(step, idx) in processSteps"
            :key="idx"
            class="relative p-6 rounded-3xl bg-white/80 border border-black/[0.08] shadow-sm backdrop-blur-xl space-y-4 hover:border-amber-500/30 hover:shadow-lg transition-all"
          >
            <div class="flex items-center justify-between">
              <span class="font-mono text-2xl font-bold text-amber-700/80">
                {{ step.num || ('0' + (idx + 1)) }}
              </span>
              <span class="text-[10px] font-mono font-bold text-slate-600 px-2 py-0.5 rounded bg-black/[0.04]">
                PHASE {{ idx + 1 }}
              </span>
            </div>
            <div class="space-y-1.5">
              <h4 class="font-bold text-slate-900 text-base font-display">{{ step.title }}</h4>
              <p class="text-xs text-slate-500 font-sans leading-relaxed">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Direct VIP Booking Form Desk (Unified Master Inquiry Desk) -->
      <section id="booking-form" class="reveal scroll-mt-28">
        <div class="rounded-[36px] border-2 border-amber-500/25 bg-white/95 backdrop-blur-2xl shadow-[0_24px_80px_rgba(217,119,6,0.14)] overflow-hidden">
          
          <!-- Top Sleek Header Banner -->
          <div class="p-6 sm:p-8 bg-gradient-to-r from-[#171412] via-[#221c17] to-[#171412] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10">
            <div class="space-y-1">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>CONFIDENTIAL BOOKING DESK</span>
              </div>
              <h3 class="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                项目合作排期与需求受理台
              </h3>
            </div>
            
            <div class="flex items-center gap-3 text-xs font-mono text-slate-300">
              <span class="px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                🔒 RSA-4096 混合加密传输
              </span>
            </div>
          </div>

          <!-- Main Desk Layout: Left Info & Right Form -->
          <div class="grid lg:grid-cols-12 min-h-[580px]">
            
            <!-- Left Column: Studio Director Info & Guarantees (5 cols) -->
            <div class="lg:col-span-5 p-8 sm:p-10 bg-slate-50/70 border-b lg:border-b-0 lg:border-r border-black/[0.06] space-y-8 flex flex-col justify-between">
              <div class="space-y-6">
                <!-- Studio Leader Card -->
                <div class="p-5 rounded-2xl bg-white border border-black/[0.06] shadow-sm flex items-center gap-4">
                  <div class="relative w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-amber-900 font-display font-bold text-xl shadow-md border-2 border-white ring-2 ring-amber-500/20 shrink-0 bg-amber-100">
                    <img v-if="siteConfig?.siteInfo?.avatar" :src="siteConfig.siteInfo.avatar" class="w-full h-full object-cover" alt="" />
                    <span v-else>{{ siteConfig?.siteInfo?.ownerInitial || 'X' }}</span>
                  </div>
                  <div class="space-y-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <h4 class="font-display font-bold text-base text-slate-900 truncate">{{ siteConfig?.siteInfo?.brandName || 'Xo' }}</h4>
                      <span class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800">DIRECTOR</span>
                    </div>
                    <p class="text-xs text-slate-500 font-sans truncate">{{ siteConfig?.about?.role || '影视后期剪辑指导 / DI 调色总监' }}</p>
                  </div>
                </div>

                <!-- Three Core Guarantees -->
                <div class="space-y-4">
                  <div class="text-xs font-mono font-bold text-slate-600 tracking-wider uppercase">STUDIO COMMITMENT</div>

                  <div class="space-y-3">
                    <div class="flex items-start gap-3 p-3.5 rounded-xl bg-white/80 border border-black/[0.05]">
                      <span class="text-base">🛡️</span>
                      <div class="space-y-0.5">
                        <div class="text-xs font-bold text-slate-900">严格保密保障 (NDA)</div>
                        <div class="text-[11px] text-slate-500 leading-relaxed font-sans">正式立项签署正规商业保密协议，样片脱敏与隐形水印防御。</div>
                      </div>
                    </div>

                    <div class="flex items-start gap-3 p-3.5 rounded-xl bg-white/80 border border-black/[0.05]">
                      <span class="text-base">🎯</span>
                      <div class="space-y-0.5">
                        <div class="text-xs font-bold text-slate-900">私密母带审片厅</div>
                        <div class="text-[11px] text-slate-500 leading-relaxed font-sans">提供独立口令授权放映室，支持逐帧打点与在线意见批注。</div>
                      </div>
                    </div>

                    <div class="flex items-start gap-3 p-3.5 rounded-xl bg-white/80 border border-black/[0.05]">
                      <span class="text-base">🌐</span>
                      <div class="space-y-0.5">
                        <div class="text-xs font-bold text-slate-900">远程云端协同</div>
                        <div class="text-[11px] text-slate-500 leading-relaxed font-sans">支持全国及海外远程无缝协作，高速光纤与专线网盘直传。</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Direct Contact Fast Path -->
              <div class="pt-6 border-t border-black/[0.06] space-y-3">
                <div class="text-xs font-mono font-bold text-slate-600 tracking-wider uppercase">DIRECT CONTACT</div>
                <div class="space-y-2">
                  <div 
                    @click="copyEmail"
                    class="p-3 rounded-xl bg-white border border-black/[0.06] flex items-center justify-between text-xs cursor-pointer hover:border-amber-600/40 transition-all group"
                  >
                    <div class="flex items-center gap-2 text-slate-700 min-w-0 truncate">
                      <IconSax name="mail" :size="16" class="text-amber-700 shrink-0" />
                      <span class="truncate font-mono">{{ siteConfig?.siteInfo?.contactEmail || 'hello@xo.dev' }}</span>
                    </div>
                    <span class="text-[10px] font-mono text-amber-700 font-bold shrink-0 ml-2">
                      {{ copiedEmail ? '已复制 ✓' : '点击复制' }}
                    </span>
                  </div>

                  <div v-if="siteConfig?.siteInfo?.contactPhone" class="p-3 rounded-xl bg-white border border-black/[0.06] flex items-center justify-between text-xs text-slate-700">
                    <div class="flex items-center gap-2">
                      <IconSax name="call" :size="16" class="text-amber-700" />
                      <span class="font-mono">{{ siteConfig.siteInfo.contactPhone }}</span>
                    </div>
                    <span class="text-[10px] font-mono text-slate-600 font-semibold">服务专线</span>
                  </div>
                </div>
              </div>

            </div>

            <!-- Right Column: Interactive Form or Success Card (7 cols) -->
            <div class="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">

              <!-- Success Card -->
              <Transition name="fade" mode="out-in">
                <div v-if="submitted" class="text-center py-10 space-y-6">
                  <div class="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-600 flex items-center justify-center mx-auto text-4xl shadow-lg animate-bounce">
                    ✨
                  </div>
                  <div class="space-y-2">
                    <h3 class="font-display text-3xl font-bold text-slate-900 tracking-tight">预约意向已成功送达！</h3>
                    <p class="text-sm text-slate-600 max-w-md mx-auto font-sans leading-relaxed">
                      感谢您的信任。制作团队已记录您的项目需求，将在 <strong class="text-amber-800">24 小时内</strong> 与您取得联系，评估排期并出具技术与预算方案。
                    </p>
                  </div>

                  <div v-if="bookingRefId" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/[0.03] border border-black/[0.08] text-xs font-mono text-slate-600">
                    <span>意向档案编码:</span>
                    <strong class="text-slate-900 font-bold">{{ bookingRefId }}</strong>
                  </div>

                  <div class="flex flex-wrap items-center justify-center gap-3 pt-4">
                    <button
                      type="button"
                      @click="resetForm"
                      class="btn-ghost py-3 px-6 rounded-full text-xs font-bold border border-black/10 hover:bg-black/5"
                    >
                      填写新的意向
                    </button>
                    <NuxtLink
                      to="/projects"
                      class="btn-primary py-3 px-7 rounded-full text-xs font-bold shadow-lg"
                    >
                      浏览全部精选作品
                    </NuxtLink>
                  </div>
                </div>

                <!-- The Form -->
                <form v-else @submit.prevent="submitForm" class="space-y-6">
                  <!-- Logged-in auto-fill banner -->
                  <div v-if="clientMe?.loggedIn" class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-950 flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <span class="text-base">✨</span>
                      <span>已为您自动识别登录账户 <strong>@{{ clientMe.username }}</strong> 并填入邮箱与联系信息（称呼请按需求填写）</span>
                    </div>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-600 text-white font-bold shrink-0">AUTO-FILLED</span>
                  </div>

                  <!-- Name & Company -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-700">
                        <span class="text-rose-500">*</span> 您的称呼
                      </label>
                      <input
                        v-model="form.name"
                        type="text"
                        required
                        class="form-input text-xs"
                        placeholder="例如：张制片 / 李总监"
                      />
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-700">公司或品牌名称</label>
                      <input
                        v-model="form.company"
                        type="text"
                        class="form-input text-xs"
                        placeholder="选填（如：XX 影视 / 个人）"
                      />
                    </div>
                  </div>

                  <!-- Contact: Phone & Email -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-700">
                        <span class="text-rose-500">*</span> 手机号码
                      </label>
                      <input
                        v-model="form.phone"
                        type="tel"
                        required
                        class="form-input text-xs font-mono"
                        placeholder="用于接收意向确认与微信沟通"
                      />
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-700">
                        <span class="text-rose-500">*</span> 电子邮箱
                      </label>
                      <input
                        v-model="form.email"
                        type="email"
                        required
                        class="form-input text-xs font-mono"
                        placeholder="your@company.com"
                      />
                    </div>
                  </div>

                  <!-- Service Type Selection -->
                  <div class="space-y-2">
                    <label class="block text-xs font-bold text-slate-700">
                      <span class="text-rose-500">*</span> 意向服务类型
                    </label>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button
                        v-for="st in serviceTypeOptions"
                        :key="st.value"
                        type="button"
                        @click="form.serviceType = st.value"
                        :class="[
                          'p-2.5 rounded-xl text-xs font-medium border text-left transition-all flex items-center gap-2 cursor-pointer',
                          form.serviceType === st.value
                            ? 'bg-amber-700 text-white border-amber-800 shadow-sm font-bold'
                            : 'bg-white/80 border-black/10 text-slate-700 hover:border-amber-600/40 hover:bg-amber-50/30'
                        ]"
                      >
                        <span>{{ st.icon }}</span>
                        <span class="truncate">{{ st.label }}</span>
                      </button>
                    </div>
                  </div>

                  <!-- Budget & Timeline (Pill Selector Style) -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <!-- Budget -->
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-700">预估预算范围</label>
                      <select v-model="form.budget" class="form-input text-xs cursor-pointer">
                        <option value="">请选择预算区间</option>
                        <option value="under5k">5,000 元以下</option>
                        <option value="5k-10k">5,000 - 10,000 元</option>
                        <option value="10k-30k">10,000 - 30,000 元</option>
                        <option value="30k-50k">30,000 - 50,000 元</option>
                        <option value="over50k">50,000 元以上</option>
                        <option value="negotiable">面议 / 根据方案测算</option>
                      </select>
                    </div>

                    <!-- Timeline -->
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-700">期望交付周期</label>
                      <select v-model="form.timeline" class="form-input text-xs cursor-pointer">
                        <option value="">请选择期望交付节点</option>
                        <option value="urgent">⚡ 紧急加急（3天内）</option>
                        <option value="1week">1周内交付</option>
                        <option value="2weeks">2周内交付</option>
                        <option value="1month">1个月内交付</option>
                        <option value="flexible">时间充裕 / 长期排期</option>
                      </select>
                    </div>
                  </div>

                  <!-- Project Description -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-slate-700">
                      <span class="text-rose-500">*</span> 项目简述与制作诉求
                    </label>
                    <textarea
                      v-model="form.description"
                      required
                      rows="4"
                      class="form-input text-xs resize-none font-sans"
                      placeholder="请简要介绍项目类型、原片格式（如 ProRes / RAW / 4K）、预估时长、对标影片风格或具体交付诉求..."
                    />
                  </div>

                  <!-- Reference Links -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-slate-700">参考视频或网盘链接</label>
                    <input
                      v-model="form.referenceLinks"
                      type="text"
                      class="form-input text-xs font-mono"
                      placeholder="选填（如有成片对标样片、Moodboard 或分镜文档）"
                    />
                  </div>

                  <!-- Submit Action -->
                  <div class="pt-2 space-y-3">
                    <button
                      type="submit"
                      :disabled="submitting"
                      class="xo-kinetic-btn w-full py-4 text-sm font-bold text-white bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 hover:from-amber-600 hover:via-amber-500 hover:to-amber-700 border border-white/10 rounded-2xl shadow-xl hover:shadow-[0_12px_36px_rgba(217,119,6,0.35)] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                    >
                      <span v-if="submitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <IconSax v-else name="send-2" :size="16" class="opacity-90" />
                      <span>{{ submitting ? '正在加密提交意向...' : '提交商业合作预约意向' }}</span>
                    </button>

                    <div class="flex items-center justify-between text-[11px] text-slate-600 font-mono px-1">
                      <span>✓ 24小时内极速反馈</span>
                      <span>✓ 全程签署正规商业合同与发票</span>
                    </div>

                    <p v-if="error" class="text-xs font-semibold text-rose-500 text-center pt-1">
                      ❌ {{ error }}
                    </p>
                  </div>
                </form>
              </Transition>

            </div>

          </div>

        </div>
      </section>

      <!-- FAQ Section (Frequently Asked Questions) -->
      <section class="space-y-6 reveal">
        <div class="text-center space-y-1.5 max-w-xl mx-auto">
          <div class="text-xs font-mono font-bold text-amber-700 tracking-wider uppercase">COLLABORATION FAQ</div>
          <h2 class="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">合作常见疑问答疑</h2>
          <p class="text-xs sm:text-sm text-slate-500 font-sans">关于起订量、交付周期、远程协同与格式标准的说明。</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="(faq, idx) in faqs"
            :key="idx"
            class="p-6 rounded-2xl bg-white/90 border border-black/[0.07] shadow-sm space-y-2 hover:border-amber-500/30 transition-all"
          >
            <div class="flex items-start gap-3">
              <span class="w-6 h-6 rounded-full bg-amber-500/10 text-amber-800 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                Q
              </span>
              <div class="space-y-1.5">
                <h4 class="font-bold text-slate-900 text-sm font-sans">{{ formatFaqQ(faq.q) }}</h4>
                <p class="text-xs text-slate-600 leading-relaxed font-sans">{{ formatFaqA(faq.a) }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { encryptRsaHybrid } from '../../utils/rsa-hybrid'

useHead({
  title: '商业合作与后期排期 - XO Studio',
  meta: [
    { name: 'description', content: 'XO Studio 影视后期与调色商业合作排期中心。专注于商业 TVC、品牌宣传片与院线级调色。' }
  ]
})

const { data: siteConfig } = useFetch<any>('/api/site-config', { lazy: true })
const { data: clientMe } = await useFetch<any>('/api/auth/client-me')

const submitted = ref(false)
const submitting = ref(false)
const error = ref('')
const bookingRefId = ref('')
const copiedEmail = ref(false)

const form = ref({
  name: '',
  phone: '',
  email: '',
  company: '',
  serviceType: 'tvc',
  budget: '',
  timeline: '',
  description: '',
  referenceLinks: ''
})

const populateClientInfo = () => {
  if (clientMe.value?.loggedIn) {
    if (clientMe.value.email && !form.value.email) {
      form.value.email = clientMe.value.email
    }
    if (clientMe.value.phone && !form.value.phone) {
      form.value.phone = clientMe.value.phone
    }
    if (clientMe.value.company && !form.value.company) {
      form.value.company = clientMe.value.company
    }
    // Note: form.name remains empty as requested ("除了称呼 其他的都是自动帮他填写")
  }
}

watch(clientMe, () => {
  populateClientInfo()
}, { immediate: true })

const serviceTypeOptions = [
  { value: 'tvc', label: '商业TVC广告', icon: '🎬' },
  { value: 'color', label: '院线/短片调色', icon: '🎨' },
  { value: 'short', label: '品牌概念/短视频', icon: '📹' },
  { value: 'audio', label: '声场/配乐设计', icon: '🎵' },
  { value: 'vfx', label: '三维/后期视效', icon: '✨' },
  { value: 'other', label: '全案/其他定制', icon: '📁' }
]

const defaultServices = [
  {
    icon: 'video-play',
    title: '商业 TVC 与品牌大片',
    desc: '专注高端商业广告、数码硬件主视觉、汽车与时尚大片的剪辑与后期包装。掌控每一个切点的心理情绪与视觉张力。',
    items: ['4K/8K 超高清工程精修', '工业级节奏剪辑与视效转场', '全网全终端多画幅母带分发']
  },
  {
    icon: 'magic-star',
    title: '电影 / 纪录片院线级调色',
    desc: 'DaVinci Resolve 专业硬件控制台监看，严格执行 ACEScct 色彩科学与 100% DCI-P3 电影色域，赋予画面沉浸光影质感。',
    items: ['ACEScct 32位高动态色彩管理', 'HDR10+ / SDR 双版本交付', '电影菲林胶片颗粒与质感微雕']
  },
  {
    icon: 'security-safe',
    title: '高质感概念片与新媒体矩阵',
    desc: '适配 TikTok、小红书与微信视频号等全渠道平台。结合平台算法与快节奏完播率，打造极具穿透力的新视觉。',
    items: ['竖屏 9:16 / 16:9 全画幅定制', '快节奏视觉转场与动效包装', '高压缩率无损网络流媒体优化']
  },
  {
    icon: 'crown',
    title: '沉浸式声场与定制配乐设计',
    desc: '专业音频母带工程，包含空间环境音设计、商业版权音乐编配、拟音 Foley 与全景声混音，带来身临其境的听觉冲击。',
    items: ['24-bit / 96kHz 广播级母带', '独家商业授权版权音乐库', '全景声多音轨混音工程归档']
  }
]

const services = computed(() => {
  const custom = siteConfig.value?.booking?.services
  if (Array.isArray(custom) && custom.length > 0) return custom
  return defaultServices
})

const getServiceItems = (service: any): string[] => {
  if (Array.isArray(service.items)) return service.items
  if (typeof service.items === 'string') {
    return service.items.split(/[,，]/).map((s: string) => s.trim()).filter(Boolean)
  }
  return []
}

const defaultProcessSteps = [
  { num: '01', title: '需求接洽', desc: '梳理创意脚本、对标参考（Moodboard）与交付节点' },
  { num: '02', title: '技术测算', desc: '评估色彩科学方案、硬件算力支持与排期锁定' },
  { num: '03', title: '监看审片', desc: '私密受保护放映厅实时母带审片与精确打点' },
  { num: '04', title: '母带交付', desc: '全格式无损母带封包、商业授权书与工程归档' }
]

const processSteps = computed(() => {
  const custom = siteConfig.value?.booking?.processSteps
  if (Array.isArray(custom) && custom.length > 0) return custom
  return defaultProcessSteps
})

const defaultFaqs = [
  { q: '最低起订门槛是多少？', a: '我们接受单条精品商业广告或短片的后期委托，无强制定金门槛，按项目复杂度透明量化评估。' },
  { q: '标准制作周期一般多久？', a: '商业短片及 TVC 一般 3-10 个工作日；电影/纪录片调色视时长而定（通常 7-15 个工作日），支持加急特快通道。' },
  { q: '支持异地或海外远程协作吗？', a: '支持。我们采用专线网盘与受保护私密放映厅系统，支持在线帧级批注与低延迟色彩监看，跨地域沟通零障碍。' },
  { q: '原片素材交付与格式支持哪些？', a: '全面原生支持 ARRI RAW、RED R3D、Apple ProRes 4444 XQ、Sony XAVC 及各类 Log 曲线无损解码。' }
]

const faqs = computed(() => {
  const custom = siteConfig.value?.booking?.faqs
  if (Array.isArray(custom) && custom.length > 0) return custom
  return defaultFaqs
})

const formatFaqQ = (q: string) => {
  return q.replace(/^[Qq][:：]\s*/, '')
}

const formatFaqA = (a: string) => {
  return a.replace(/^[Aa][:：]\s*/, '')
}

const scrollToBookingForm = () => {
  const el = document.getElementById('booking-form')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const scrollToServices = () => {
  const el = document.getElementById('services-section')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const selectServiceAndScroll = (title: string) => {
  if (title.includes('TVC') || title.includes('广告')) form.value.serviceType = 'tvc'
  else if (title.includes('调色') || title.includes('色彩')) form.value.serviceType = 'color'
  else if (title.includes('短视频') || title.includes('概念')) form.value.serviceType = 'short'
  else if (title.includes('音效') || title.includes('配乐') || title.includes('声')) form.value.serviceType = 'audio'
  else form.value.serviceType = 'other'

  scrollToBookingForm()
}

const copyEmail = async () => {
  const email = siteConfig.value?.siteInfo?.contactEmail || 'hello@xo.dev'
  await copyToClipboard(email)
  copiedEmail.value = true
  setTimeout(() => {
    copiedEmail.value = false
  }, 2000)
}

const submitForm = async () => {
  submitting.value = true
  error.value = ''
  
  try {
    const res: any = await $fetch('/api/booking', {
      method: 'POST',
      body: await encryptRsaHybrid(form.value)
    })
    bookingRefId.value = res?.id || ''
    submitted.value = true
  } catch (e: any) {
    error.value = e.statusMessage || e.data?.message || '提交失败，请检查网络或稍后重试'
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    phone: '',
    email: '',
    company: '',
    serviceType: 'tvc',
    budget: '',
    timeline: '',
    description: '',
    referenceLinks: ''
  }
  populateClientInfo()
  submitted.value = false
  bookingRefId.value = ''
}

onMounted(() => {
  populateClientInfo()
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('in-view')
    })
  }, 100)
})
</script>

<style scoped>
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal.in-view {
  opacity: 1;
  transform: translateY(0);
}
</style>
