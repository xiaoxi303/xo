<template>
  <div class="min-h-screen pt-28 pb-24 px-6">
    <div class="max-w-4xl mx-auto space-y-12">

      <!-- Back button — always visible -->
      <div class="reveal">
        <NuxtLink
          to="/projects"
          class="btn-ghost inline-flex items-center gap-2 text-sm py-2 px-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"/>
          </svg>
          返回作品集
        </NuxtLink>
      </div>

      <!-- Password Protection Lock Screen -->
      <Transition name="fade">
        <div v-if="project && project.hasPassword && !isUnlocked" class="max-w-md mx-auto py-16 text-center space-y-6">
          <div class="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto shadow-sm"
               style="background: var(--color-bg-2); border: 1px solid var(--color-border)">
            &#x1f512;
          </div>
          <div class="space-y-2">
            <h1 class="font-display text-2xl font-bold" style="color: var(--color-ink-3)">&#x1f512; 访问保护</h1>
            <p class="text-xs leading-relaxed" style="color: var(--color-ink-3)">
              本作品受到访问保护，请输入密码解锁<br>
              &#x1f4a1; 密码每24小时（每天凌晨 00:00）自动更新一次
            </p>
          </div>

          <!-- 每日密码更新提示 -->
          <div class="p-4 rounded-xl text-left space-y-2" style="background: var(--color-bg-2); border: 1px solid var(--color-border)">
            <div class="flex items-start gap-2">
              <span class="text-lg">&#x1f4a1;</span>
              <div class="space-y-1">
                <p class="text-xs font-semibold" style="color: var(--color-ink-3)">访问说明</p>
                <p class="text-xs leading-relaxed" style="color: var(--color-ink-3)">
                  本作品设置了访问保护，密码每 24 小时（每天凌晨 00:00）会自动更新一次。旧密码失效后需重新获取最新密码。
                </p>
              </div>
            </div>
          </div>

          <form @submit.prevent="verifyPassword" class="space-y-4 pt-4">
            <input
              v-model="inputPassword"
              type="text"
              class="form-input text-center font-mono tracking-widest py-3 rounded-xl w-full"
              placeholder="请输入 6 位访问密码"
              required
              autofocus
              :disabled="passwordLoading"
              maxlength="6"
              style="text-transform: uppercase"
            />
            <button type="submit" class="btn-primary w-full justify-center py-3 text-xs font-semibold flex items-center gap-2" :disabled="passwordLoading">
              <span v-if="passwordLoading" class="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style="border-color: currentColor; border-top-color: transparent;" />
              {{ passwordLoading ? '正在验证...' : '验证密码并解锁' }}
            </button>
          </form>

          <p v-if="passwordError" class="text-xs text-rose-500 font-semibold">
            &#x274c; {{ passwordError }}
          </p>

          <!-- 获取密码按钮 -->
          <div class="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-semibold">
            <NuxtLink
              :to="`/projects/${slug}/get`"
              class="hover:opacity-80 transition-opacity underline flex items-center gap-1"
              style="color: var(--color-bronze)"
            >
              <span>&#x1f511;</span>
              <span>在线直接获取密码</span>
            </NuxtLink>
            <span class="hidden sm:inline" style="color: var(--color-ink-3)">|</span>
            <NuxtLink
              :to="`/projects/${slug}/request`"
              class="hover:opacity-80 transition-opacity underline flex items-center gap-1"
              style="color: var(--color-ink-3)"
            >
              <span>&#x1f4dd;</span>
              <span>填写表单手动申请</span>
            </NuxtLink>
          </div>

          <div class="pt-4 border-t border-black/[0.05]">
            <NuxtLink to="/projects" class="text-xs hover:underline" style="color: var(--color-ink-3)">
              &larr; 返回作品集
            </NuxtLink>
          </div>
        </div>
      </Transition>

      <!-- Project detail — show when public (no password) or unlocked -->
      <Transition name="fade">
        <div v-if="project && (!project.hasPassword || isUnlocked)" class="space-y-10">

          <!-- Title block -->
          <div class="space-y-4 reveal">
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in project.tags" :key="tag" class="badge">{{ tag }}</span>
            </div>

            <h1 class="font-display text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-slate-900">
              {{ project.title }}
            </h1>

            <div class="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 pt-1">
              <span>发布日期：{{ project.releaseYear || '2026' }} 年</span>
              <span class="text-slate-300">·</span>
              <span>后期规格：{{ project.postSpecs || (siteConfig?.home?.colorSpecText ? siteConfig.home.colorSpecText : '4K 60FPS HDR / ACEScct') }}</span>
                    <span v-if="project.isColorGraded" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold" style="background: rgba(5, 150, 105, 0.1); color: #059669; border: 1px solid rgba(5, 150, 105, 0.2);">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      已调色
                    </span>
                    <span v-else class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold" style="background: rgba(107, 114, 128, 0.1); color: #6b7280; border: 1px solid rgba(107, 114, 128, 0.2);">
                      <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                      未调色
                    </span>
            </div>
          </div>

          <!-- Media block: video player OR cover image fallback -->
          <div class="reveal">
            <!-- If has videoUrl: show custom premium player with ambilight -->
            <div v-if="activeVideoUrl" class="space-y-3">
              <div class="ambilight-container">
                <!-- Ambient backdrop blur video -->
                <video
                  ref="blurVideoRef"
                  :key="`blur-${activeVideoUrl}`"
                  :src="activeVideoUrl"
                  preload="none"
                  muted loop playsinline
                  class="ambilight-shadow"
                />
                
                <!-- Custom Premium Player Container -->
                <div 
                  ref="playerContainerRef" 
                  class="relative w-full rounded-2xl overflow-hidden bg-black select-none z-10 max-h-[700px]" style="border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05); aspect-ratio: auto;"
                  @mousemove="resetControlsTimer"
                  @mouseleave="showControls = false"
                  @contextmenu.prevent
                >
                  <!-- Top-Right Status Badges (GPU Decoder Badge & Filter Status) -->
                  <div class="absolute top-3 right-3 z-30 flex items-center gap-2">
                    <!-- Active Video Enhancement Badge -->
                    <span
                      v-if="enhancementMode !== 'normal'"
                      class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-md flex items-center gap-1"
                    >
                      <span>✨</span>
                      <span>{{ enhancementLabels[enhancementMode] }}</span>
                    </span>

                    <!-- Stats Toggle Button -->
                    <button
                      type="button"
                      @click="showStatsPanel = !showStatsPanel"
                      class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all backdrop-blur-md shadow-md flex items-center gap-1.5 cursor-pointer"
                      :class="showStatsPanel
                        ? 'bg-emerald-500 text-black border border-emerald-400'
                        : 'bg-black/50 text-emerald-400 hover:bg-black/70 border border-emerald-500/40'"
                      title="切换 GPU 硬件解码极客面板 (Stats for Nerds)"
                    >
                      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>⚡ GPU解码</span>
                    </button>
                  </div>

                  <!-- 1. Visible Site Logo Watermark (Only Logo, Semi-Transparent, Larger Size) -->
                  <div
                    v-if="logoWatermarkEnabled"
                    class="absolute z-30 pointer-events-none flex items-center justify-center p-2 rounded-2xl bg-black/35 backdrop-blur-md border border-white/15 select-none shadow-md opacity-85 transition-all duration-300"
                    :style="{ top: `${watermarkTopPx}px`, left: `${watermarkLeftPx}px` }"
                  >
                    <img v-if="siteLogo" :src="siteLogo" alt="Logo" class="object-contain" style="width: 28px; height: 28px;" />
                    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" class="text-white/90" style="width: 28px; height: 28px; flex-shrink: 0;">
                      <path d="M10 30L30 10M10 10L30 30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
                      <circle cx="20" cy="20" r="8" stroke="currentColor" stroke-width="2.2" />
                    </svg>
                  </div>

                  <!-- 2. Invisible Steganographic Watermark Layer (Canvas Overlay over Video Frame) -->
                  <canvas
                    v-if="invisibleWatermarkEnabled"
                    ref="watermarkCanvasRef"
                    class="absolute inset-0 w-full h-full pointer-events-none z-20 select-none opacity-80"
                  />

                  <!-- Stats for Nerds Overlay Panel -->
                  <Transition name="fade">
                    <div
                      v-if="showStatsPanel"
                      class="absolute top-12 right-3 z-40 p-3.5 rounded-2xl bg-black/90 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] backdrop-blur-xl shadow-2xl space-y-2 min-w-[290px] select-text"
                    >
                      <div class="flex items-center justify-between border-b border-emerald-500/30 pb-1.5">
                        <span class="font-bold text-white flex items-center gap-1">
                          <span>⚡ 顶级 GPU 解码极客面板</span>
                        </span>
                        <button @click="showStatsPanel = false" class="text-emerald-400 hover:text-white cursor-pointer">✕</button>
                      </div>
                      <div class="space-y-1">
                        <div class="flex justify-between">
                          <span class="text-slate-400">解码架构:</span>
                          <span class="font-bold text-emerald-400">{{ activeDecoderEngine }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-slate-400">解码延迟:</span>
                          <span class="font-bold text-cyan-300">{{ decodeLatencyMs.toFixed(1) }} ms / 帧</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-slate-400">实时 FPS:</span>
                          <span class="font-bold" :class="currentFps >= 50 ? 'text-emerald-400' : 'text-amber-400'">
                            {{ currentFps }} FPS
                          </span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-slate-400">丢帧统计:</span>
                          <span class="font-bold" :class="droppedFrames > 0 ? 'text-amber-400' : 'text-emerald-400'">
                            {{ droppedFrames }} / {{ totalFrames }}
                          </span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-slate-400">视频分辨率:</span>
                          <span class="text-white">{{ videoResolution }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-slate-400">编码规格:</span>
                          <span class="text-cyan-300">{{ detectedCodec }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-slate-400">色彩深度:</span>
                          <span class="text-indigo-300">{{ colorSpaceStr }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-slate-400">Buffer 水位:</span>
                          <span class="text-emerald-300">{{ bufferLength.toFixed(1) }}s</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-slate-400">画质复原引擎:</span>
                          <span class="text-amber-300">{{ enhancementLabels[enhancementMode] }}</span>
                        </div>
                        <div v-if="pointA !== null || pointB !== null" class="flex justify-between border-t border-emerald-500/20 pt-1">
                          <span class="text-amber-400">A-B 循环区间:</span>
                          <span class="text-amber-300 font-bold">
                            {{ pointA !== null ? formatTime(pointA) : '0:00' }} - {{ pointB !== null ? formatTime(pointB) : 'END' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Transition>

                  <!-- SVG GPU Hardware Convolution Matrix Filters (Zero-Color-Distortion Engine) -->
                  <svg class="hidden" width="0" height="0" style="position: absolute; width: 0; height: 0; overflow: hidden;">
                    <defs>
                      <!-- 1. 4K CAS 自适应超分锐化 (Sub-pixel High-Pass Edge Contrast Sharpening) -->
                      <filter id="svg-cas-filter-detail" x="-20%" y="-20%" width="140%" height="140%">
                        <feConvolveMatrix 
                          order="3" 
                          kernelMatrix="
                             0.0  -0.35   0.0
                            -0.35  2.40  -0.35
                             0.0  -0.35   0.0"
                          divisor="1.0"
                          bias="0"
                          preserveAlpha="true"
                        />
                      </filter>

                      <!-- 2. 电影级暗部细节提亮 (Pure Shadow Lift, 100% Color & Skin Protection) -->
                      <filter id="svg-shadow-filter-detail" x="-20%" y="-20%" width="140%" height="140%">
                        <feComponentTransfer>
                          <feFuncR type="gamma" amplitude="1.0" exponent="0.94" offset="0"/>
                          <feFuncG type="gamma" amplitude="1.0" exponent="0.94" offset="0"/>
                          <feFuncB type="gamma" amplitude="1.0" exponent="0.94" offset="0"/>
                        </feComponentTransfer>
                      </filter>

                      <!-- 3. 数字降噪与画面修复 (Clean Spatial Bilateral Denoise) -->
                      <filter id="svg-denoise-filter-detail" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="0.4" result="clean"/>
                        <feConvolveMatrix 
                          in="clean"
                          order="3" 
                          kernelMatrix="
                             0.0  -0.12   0.0
                            -0.12  1.48  -0.12
                             0.0  -0.12   0.0"
                          divisor="1.0"
                          bias="0"
                          preserveAlpha="true"
                        />
                      </filter>
                    </defs>
                  </svg>

                  <!-- Main Video Element -->
                  <video
                    ref="mainVideoRef"
                    :key="`main-${activeVideoUrl}`"
                    :src="activeVideoUrl"
                    :poster="project?.image || ''"
                    preload="metadata"
                    :muted="isMuted"
                    playsinline
                    class="w-full h-full block cursor-pointer transition-all duration-300"
                    :style="{
                      maxHeight: isFullscreen ? 'none' : '700px',
                      height: isFullscreen ? '100%' : '100%',
                      objectFit: 'contain',
                      background: '#000',
                      opacity: enhancementMode === 'normal' || !webglAvailable ? 1 : 0,
                      filter: 'none',
                      imageRendering: '-webkit-optimize-contrast',
                      transform: 'translateZ(0)'
                    }"
                    @loadedmetadata="onVideoLoaded"
                    @durationchange="updateDuration"
                    @loadeddata="updateDuration"
                    @timeupdate="onTimeUpdate"
                    @play="onPlay"
                    @pause="onPause"
                    @click="togglePlay"
                  />

                  <!-- WebGL output for the selected real-time enhancement. -->
                  <canvas
                    v-if="enhancementMode !== 'normal' && webglAvailable"
                    ref="webglCanvasRef"
                    class="absolute inset-0 z-[12] w-full h-full object-contain pointer-events-none"
                    aria-hidden="true"
                  />

                  <!-- Centered Big Play Button Indicator -->
                  <div 
                    class="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 z-20"
                    :class="{ 'opacity-0 scale-95': isPlaying, 'opacity-100 scale-100': !isPlaying }"
                  >
                    <button 
                      type="button"
                      class="play-btn-main pointer-events-auto cursor-pointer"
                      @click="togglePlay"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 ml-1">
                        <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  <!-- Custom Bottom Controls (Glassmorphism Overlay) -->
                  <div 
                    class="absolute bottom-0 inset-x-0 px-5 pb-4 pt-16 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-all duration-500 transform flex flex-col justify-end pointer-events-auto z-20"
                    :class="{ 'opacity-100 translate-y-0': showControls, 'opacity-0 translate-y-2 pointer-events-none': !showControls }"
                  >
                    <!-- Scrub Progress Bar -->
                    <div 
                      class="progress-bar-container group/progress relative"
                      @mousedown="startScrub"
                      @mousemove="onProgressHover"
                      @mouseleave="onProgressLeave"
                      ref="progressTrackRef"
                    >
                      <!-- Buffered Progress -->
                      <div 
                        class="progress-buffered"
                        :style="{ width: (bufferedEnd / (duration || 1)) * 100 + '%' }"
                      />
                      <!-- Progress Fill -->
                      <div 
                        class="progress-filled"
                        :style="{ width: (currentTime / (duration || 1)) * 100 + '%' }"
                      />
                      <!-- A-B Loop Markers -->
                      <div
                        v-if="pointA !== null && duration > 0"
                        class="absolute top-0 bottom-0 w-1 bg-emerald-400 z-10 shadow-sm"
                        :style="{ left: (pointA / duration) * 100 + '%' }"
                        title="A 点"
                      />
                      <div
                        v-if="pointB !== null && duration > 0"
                        class="absolute top-0 bottom-0 w-1 bg-rose-400 z-10 shadow-sm"
                        :style="{ left: (pointB / duration) * 100 + '%' }"
                        title="B 点"
                      />
                      <!-- Hover Time Tooltip -->
                      <div 
                        v-if="hoverTime !== null"
                        class="progress-tooltip"
                        :style="{ left: hoverPercent + '%' }"
                      >
                        {{ formatTime(hoverTime) }}
                      </div>
                      <!-- Progress Thumb Knob -->
                      <div 
                        class="progress-thumb"
                        :style="{ left: 'calc(' + (currentTime / (duration || 1)) * 100 + '% - 6px)' }"
                      />
                    </div>

                    <!-- Bottom Controls Buttons row -->
                    <div class="flex items-center justify-between text-white text-xs select-none">
                      <div class="flex items-center gap-4">
                        <!-- Play/Pause toggle -->
                        <button type="button" @click="togglePlay" class="video-ctrl-btn cursor-pointer" aria-label="Play/Pause">
                          <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-white">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-white">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 7.75a.75.75 0 01.75-.75h.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-.5a.75.75 0 01-.75-.75v-4.5zm5 0a.75.75 0 01.75-.75h.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-.5a.75.75 0 01-.75-.75v-4.5z" clip-rule="evenodd" />
                          </svg>
                        </button>

                        <!-- Frame Stepping Controls (< 逐帧 / 逐帧 >) -->
                        <div class="flex items-center gap-1 bg-white/10 rounded-lg p-0.5 border border-white/10">
                          <button
                            type="button"
                            @click="stepFrame(-1)"
                            class="px-1.5 py-0.5 text-[10px] font-mono hover:bg-white/20 rounded transition-colors text-slate-300 hover:text-white cursor-pointer"
                            title="退回 1 帧"
                          >
                            ⏮ -1帧
                          </button>
                          <button
                            type="button"
                            @click="stepFrame(1)"
                            class="px-1.5 py-0.5 text-[10px] font-mono hover:bg-white/20 rounded transition-colors text-slate-300 hover:text-white cursor-pointer"
                            title="前进 1 帧"
                          >
                            +1帧 ⏭
                          </button>
                        </div>

                        <!-- Timeline Time counter -->
                        <span class="time-display font-mono">
                          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
                        </span>

                        <!-- Volume with Slider -->
                        <div class="flex items-center gap-1.5 group/volume ml-1">
                          <button type="button" @click="toggleMute" class="video-ctrl-btn cursor-pointer">
                            <svg v-if="isMuted || volume === 0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                              <path d="M9.547 3.062A.75.75 0 0110 3.75v12.5a.75.75 0 01-1.264.546L5.203 13H3.25A1.25 1.25 0 012 11.75v-3.5A1.25 1.25 0 013.25 7h1.953l3.533-3.296a.75.75 0 01.811-.064zM16.28 7.22a.75.75 0 10-1.06 1.06L16.44 9.5l-1.22 1.22a.75.75 0 101.06 1.06l1.22-1.22 1.22 1.22a.75.75 0 101.06-1.06L18.56 9.5l1.22-1.22a.75.75 0 00-1.06-1.06l-1.22 1.22-1.22-1.22z" />
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                              <path d="M10 3.75a.75.75 0 00-1.264-.546L5.203 6.5H3.25A1.25 1.25 0 002 7.75v4.5A1.25 1.25 0 003.25 13.5h1.953l3.533 3.296A.75.75 0 0010 16.25V3.75zM13 10a2.5 2.5 0 00-1.5-2.288v4.576A2.5 2.5 0 0013 10zM15.5 10a5 5 0 00-3-4.578v9.156A5 5 0 0015.5 10z" />
                            </svg>
                          </button>
                          <input 
                            type="range" 
                            min="0" max="1" step="0.05" 
                            :value="isMuted ? 0 : volume"
                            @input="e => setVolume(Number((e.target as HTMLInputElement).value))"
                            class="volume-slider w-0 opacity-0 pointer-events-none group-hover/volume:w-16 group-hover/volume:opacity-100 group-hover/volume:pointer-events-auto cursor-pointer transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div class="flex items-center gap-4">
                        <!-- A-B Loop Button -->
                        <div class="relative group/ab">
                          <button
                            type="button"
                            @click="toggleABLoop"
                            class="px-2 py-1 rounded text-[10px] font-mono transition-colors border cursor-pointer"
                            :class="pointA !== null || pointB !== null
                              ? 'bg-amber-500 text-black font-bold border-amber-400'
                              : 'bg-white/10 text-slate-300 hover:bg-white/20 border-white/10'"
                          >
                            A-B 循环
                          </button>
                          <div class="absolute bottom-full right-0 mb-1.5 bg-black/95 border border-white/15 rounded-xl p-2 shadow-2xl min-w-[140px] opacity-0 translate-y-1 pointer-events-none group-hover/ab:opacity-100 group-hover/ab:translate-y-0 group-hover/ab:pointer-events-auto transition-all duration-200 text-center space-y-1.5 before:content-[''] before:absolute before:top-full before:left-0 before:right-0 before:h-4 before:bg-transparent">
                            <div class="text-[10px] text-slate-400 font-mono">A-B 复播切断器</div>
                            <div class="flex gap-1 justify-center">
                              <button type="button" @click="setPointA" class="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 rounded text-[10px] font-mono border border-emerald-500/30 cursor-pointer">
                                设 A 点
                              </button>
                              <button type="button" @click="setPointB" class="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 rounded text-[10px] font-mono border border-rose-500/30 cursor-pointer">
                                设 B 点
                              </button>
                            </div>
                            <button v-if="pointA !== null || pointB !== null" type="button" @click="clearABLoop" class="w-full py-0.5 text-rose-400 hover:text-rose-300 text-[10px] font-mono cursor-pointer">
                              清除循环区间
                            </button>
                          </div>
                        </div>

                        <!-- Enhancement Filter Selector -->
                        <div class="relative group/enh">
                          <button
                            type="button"
                            class="px-2 py-1 rounded text-[10px] font-mono transition-colors border flex items-center gap-1 cursor-pointer"
                            :class="enhancementMode !== 'normal'
                              ? 'bg-amber-500 text-black font-bold border-amber-400'
                              : 'bg-white/10 text-slate-300 hover:bg-white/20 border-white/10'"
                          >
                            <span>画质增强:</span>
                            <span>{{ enhancementLabels[enhancementMode] }}</span>
                          </button>
                          <div class="absolute bottom-full right-0 mb-1.5 bg-black/95 border border-white/15 rounded-xl py-1 shadow-2xl min-w-[120px] opacity-0 translate-y-1 pointer-events-none group-hover/enh:opacity-100 group-hover/enh:translate-y-0 group-hover/enh:pointer-events-auto transition-all duration-200 before:content-[''] before:absolute before:top-full before:left-0 before:right-0 before:h-4 before:bg-transparent">
                            <button
                              v-for="(label, key) in enhancementLabels"
                              :key="key"
                              type="button"
                              @click="enhancementMode = key as any"
                              class="w-full text-left px-3 py-1.5 hover:bg-white/10 transition-colors text-[10px] font-mono flex items-center justify-between cursor-pointer"
                              :class="enhancementMode === key ? 'text-amber-400 font-bold' : 'text-slate-300'"
                            >
                              <span>{{ label }}</span>
                              <span v-if="enhancementMode === key">
                                <IconSax name="tick" :size="12" class="text-amber-400" />
                              </span>
                            </button>
                          </div>
                        </div>

                        <!-- Speed selector popover cycle -->
                        <div class="relative group/speed">
                          <button type="button" class="speed-btn cursor-pointer">
                            {{ playbackRate.toFixed(2) }}x
                          </button>
                          <div class="absolute bottom-full right-0 mb-1.5 bg-black/90 border border-white/10 rounded-xl py-1 shadow-2xl min-w-[70px] opacity-0 translate-y-1 pointer-events-none group-hover/speed:opacity-100 group-hover/speed:translate-y-0 group-hover/speed:pointer-events-auto transition-all duration-200 before:content-[''] before:absolute before:top-full before:left-0 before:right-0 before:h-4 before:bg-transparent">
                            <button 
                              v-for="r in [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0]" :key="r" 
                              type="button" 
                              @click="setPlaybackRate(r)"
                              class="w-full text-center py-1.5 hover:bg-white/10 transition-colors text-[10px] font-mono cursor-pointer"
                              :class="{ 'text-amber-500 font-bold': playbackRate === r }"
                            >
                              {{ r.toFixed(2) }}x
                            </button>
                          </div>
                        </div>

                        <!-- Picture in Picture (PiP) -->
                        <button type="button" @click="togglePiP" class="video-ctrl-btn cursor-pointer" title="画中画">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                            <path fill-rule="evenodd" d="M2 3.75A1.75 1.75 0 013.75 2h12.5A1.75 1.75 0 0118 3.75v12.5A1.75 1.75 0 0116.25 18H3.75A1.75 1.75 0 012 16.25V3.75zM3.5 8v8.25c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25V8h-13zm11 2.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z" clip-rule="evenodd" />
                          </svg>
                        </button>

                        <!-- Fullscreen Toggle -->
                        <button type="button" @click="toggleFullscreen" class="video-ctrl-btn cursor-pointer">
                          <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                            <path d="M3.25 4A.75.75 0 014 3.25h3.5a.75.75 0 010 1.5H5v2.5a.75.75 0 01-1.5 0v-3.5zM12.5 3.25a.75.75 0 01.75-.75h3.5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0V5h-2.75a.75.75 0 01-.75-.75zM3.25 12.5a.75.75 0 01.75.75V15h2.75a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75v-3.5a.75.75 0 01.75-.75zM16.75 12.5a.75.75 0 01.75.75v3.5a.75.75 0 01-.75.75h-3.5a.75.75 0 010-1.5H15v-2.5a.75.75 0 01.75-.75z" />
                          </svg>
                          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                            <path d="M5.5 3.5a.75.75 0 01.75.75v2.25H8.5a.75.75 0 010 1.5H5.5a.75.75 0 01-.75-.75v-3.5a.75.75 0 01.75-.75zM14.5 3.5a.75.75 0 01.75.75v3.5a.75.75 0 01-.75.75h-3a.75.75 0 010-1.5h2.25V4.25a.75.75 0 01.75-.75zM5.5 11.5a.75.75 0 01.75.75v2.25H8.5a.75.75 0 010 1.5H5.5a.75.75 0 01-.75-.75v-3.5a.75.75 0 01.75-.75zM14.5 11.5a.75.75 0 01.75.75v3.5a.75.75 0 01-.75.75h-3a.75.75 0 010-1.5h2.25V12.25a.75.75 0 01.75-.75z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="projectVideoUrls.length > 1"
                class="flex flex-wrap gap-2 rounded-2xl p-2"
                style="background: rgba(140,115,80,0.08); border: 1px solid rgba(160,130,90,0.18);"
              >
                <button
                  v-for="(url, idx) in projectVideoUrls"
                  :key="url"
                  type="button"
                  @click="activeVideoIndex = idx"
                  :class="[
                    'px-3 py-2 rounded-xl text-[10px] font-mono font-semibold transition-all cursor-pointer',
                    activeVideoIndex === idx ? 'shadow-sm' : 'hover:opacity-80'
                  ]"
                  :style="activeVideoIndex === idx
                    ? { background: 'rgba(252,248,242,0.95)', color: 'var(--color-ink-1)', border: '1px solid rgba(180,150,110,0.25)' }
                    : { color: 'var(--color-ink-4)', border: '1px solid transparent' }"
                >
                  视频版本 {{ String(idx + 1).padStart(2, '0') }}
                </button>
              </div>
            </div>

            <!-- If no videoUrl but has image: show cover image -->
            <div v-else-if="project.image" class="relative rounded-2xl overflow-hidden glass-card" style="max-height: 520px;">
              <img
                :src="project.image"
                :alt="project.title"
                class="w-full h-auto object-cover"
                style="max-height: 520px; display: block;"
              />
              <!-- No-video badge -->
              <div class="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-black/40 text-white backdrop-blur-sm">
                🖼️ 静帧作品
              </div>
            </div>

            <div v-else class="relative rounded-2xl overflow-hidden glass-card" style="height: min(520px, 56vw); min-height: 260px;">
              <DefaultArtPoster
                :title="project.title"
                index="01"
                :category="project.tags?.[0] || ''"
                :description="project.description"
                class="w-full h-full"
              />
            </div>
          </div>

          <!-- Interactive LUT Grade Comparison Slider (only if imageBefore is set) -->
          <div v-if="project.imageBefore && project.imageBefore.trim()" class="space-y-4 reveal">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-3">
                <span class="w-1 h-5 rounded-full" style="background: var(--color-bronze);" />
                <h2 class="font-display text-xl font-semibold" style="color: var(--color-ink-3)">🎥 影视调色前后对比</h2>
              </div>
              <span class="text-[10px] font-mono" style="color: var(--color-ink-3)">← 左右拖动对比调色前后 →</span>
            </div>

            <div
              class="relative w-full overflow-hidden rounded-2xl glass-card select-none cursor-ew-resize"
              style="aspect-ratio: 16/9;"
              @mousedown="sliderDragging = true"
              @mouseup="sliderDragging = false"
              @mouseleave="sliderDragging = false"
              @mousemove="handleSliderMove"
              @touchstart.prevent="sliderDragging = true"
              @touchend="sliderDragging = false"
              @touchmove.prevent="handleSliderMove"
              ref="sliderContainerRef"
            >
              <!-- Before Image (Log / Raw) -->
              <img
                :src="project.imageBefore"
                alt="Before grading"
                class="absolute inset-0 w-full h-full object-cover"
                draggable="false"
              />
              <div class="absolute bottom-4 left-4 z-20 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-black/60 text-white backdrop-blur-sm border border-white/10 uppercase tracking-widest">
                LOG 原片
              </div>

              <!-- After Image Container (Graded / Final) -->
              <div
                class="absolute inset-y-0 left-0 overflow-hidden"
                :style="{ width: sliderPosition + '%' }"
              >
                <img
                  :src="project.image"
                  alt="After grading"
                  class="absolute inset-0 h-full object-cover"
                  :style="{ width: containerWidth + 'px', maxWidth: 'none' }"
                  draggable="false"
                />
                <div class="absolute bottom-4 right-4 z-20 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#b45309]/80 text-white backdrop-blur-sm border border-amber-500/20 uppercase tracking-widest">
                  调色后
                </div>
              </div>

              <!-- Slider Handle -->
              <div
                class="absolute inset-y-0 z-30 flex items-center justify-center pointer-events-none"
                :style="{ left: 'calc(' + sliderPosition + '% - 1px)' }"
              >
                <div class="w-[2px] h-full bg-white shadow-[0_0_10px_rgba(0,0,0,0.6)]" />
                <div class="absolute w-9 h-9 rounded-full bg-white text-black shadow-lg flex items-center justify-center border border-black/10 text-sm font-bold">↔</div>
              </div>
            </div>
          </div>

          <!-- Content grid -->
          <div class="grid md:grid-cols-3 gap-8 items-start reveal">

            <!-- Left: About + Workflow -->
            <div class="md:col-span-2 space-y-6">

              <!-- Project overview card -->
              <div class="glass-card p-8 sm:p-9 space-y-5 rounded-3xl border-2 border-black/10 shadow-2xl bg-white/90 backdrop-blur-xl hover:border-amber-500/40 transition-all duration-300">
                <div class="flex items-center gap-3 border-b border-black/10 pb-4">
                  <span class="w-1.5 h-6 rounded-full bg-amber-600" />
                  <h2 class="font-display text-2xl font-bold text-slate-900">项目概述</h2>
                </div>
                <p class="leading-relaxed text-slate-700 text-sm sm:text-base font-sans font-medium">
                  {{ project.description }}
                </p>
                <div v-if="project.longDescription" class="leading-relaxed text-sm text-slate-600 whitespace-pre-wrap space-y-3 pt-4 border-t border-black/10 font-sans">
                  {{ project.longDescription }}
                </div>
              </div>

              <!-- Workflow pipeline card -->
              <div v-if="project.workflow && project.workflow.length" class="glass-card p-8 sm:p-9 space-y-6 rounded-3xl border-2 border-black/10 shadow-2xl bg-white/90 backdrop-blur-xl hover:border-amber-500/40 transition-all duration-300">
                <div class="flex items-center gap-3 border-b border-black/10 pb-4">
                  <span class="w-1.5 h-6 rounded-full bg-amber-600" />
                  <h2 class="font-display text-2xl font-bold text-slate-900">幕后制作工作流 (Pipeline)</h2>
                </div>

                <div class="space-y-4">
                  <div
                    v-for="(flow, fIdx) in project.workflow"
                    :key="flow.title"
                    class="p-5 rounded-2xl space-y-2 transition-all hover:bg-black/[0.02]"
                    style="background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.08);"
                  >
                    <div class="flex items-center gap-3">
                      <div class="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xs font-mono font-bold text-amber-800 flex-shrink-0">
                        0{{ fIdx + 1 }}
                      </div>
                      <span class="text-lg flex-shrink-0">{{ flow.icon }}</span>
                      <h3 class="font-bold text-base text-slate-900">{{ flow.title }}</h3>
                    </div>
                    <p class="text-sm leading-relaxed pl-10 text-slate-600 font-sans">{{ flow.desc }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Specs + CTA -->
            <div class="space-y-6">

              <!-- DI Console Specs card -->
              <div class="glass-card p-7 space-y-6 relative overflow-hidden rounded-3xl border-2 border-black/10 shadow-2xl bg-white/90 backdrop-blur-xl">
                <!-- Top luxury gold accent bar -->
                <div class="absolute top-0 inset-x-0 h-1.5 rounded-t-[inherit]"
                     style="background: linear-gradient(90deg, #d97706 0%, #b45309 50%, #f59e0b 100%);" />

                <div class="flex items-center justify-between pt-2">
                  <h2 class="font-display text-base font-bold uppercase tracking-wider text-slate-900">后期制作技术参数</h2>
                  <div class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full"
                       :class="project.isGraded !== false ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-500/10 border border-slate-500/20'">
                    <span class="w-2 h-2 rounded-full" :class="project.isColorGraded ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'" />
                    <span class="text-[10px] uppercase font-mono font-bold" :class="project.isColorGraded ? 'text-emerald-800' : 'text-slate-500'">
                      {{ project.isColorGraded ? '已调色' : '未调色' }}
                    </span>
                  </div>
                </div>

                <div class="space-y-0 font-mono text-xs border-t border-black/10">
                  <div class="flex justify-between items-center py-3 border-b border-black/10">
                    <span class="text-slate-600 font-sans font-medium">后期导演 (Director)</span>
                    <span class="font-bold text-slate-900 bg-black/5 px-2 py-0.5 rounded">{{ project.director || 'Xo' }}</span>
                  </div>
                  <div v-if="project.software?.[0]" class="flex justify-between items-center py-3 border-b border-black/10">
                    <span class="text-slate-600 font-sans font-medium">剪辑与包装软件</span>
                    <span class="font-bold text-slate-900 bg-black/5 px-2 py-0.5 rounded">{{ project.software[0] }}</span>
                  </div>
                  <div v-if="project.software?.[1]" class="flex justify-between items-center py-3 border-b border-black/10">
                    <span class="text-slate-600 font-sans font-medium">色彩分级调色</span>
                    <span class="font-bold text-amber-800 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{{ project.software[1] }}</span>
                  </div>
                  <div class="flex justify-between items-center py-3 border-b border-black/10">
                    <span class="text-slate-600 font-sans font-medium">交付格式</span>
                    <span class="font-bold text-slate-900 bg-black/5 px-2 py-0.5 rounded">{{ project.deliverFormat || 'ProRes 422 HQ' }}</span>
                  </div>
                  <div class="flex justify-between items-center py-3">
                    <span class="text-slate-600 font-sans font-medium">声音编码</span>
                    <span class="font-bold text-slate-900 bg-black/5 px-2 py-0.5 rounded">{{ project.audioFormat || '24-bit 48kHz' }}</span>
                  </div>
                </div>
              </div>

              <!-- CTA card -->
              <div class="glass-card p-7 space-y-4 overflow-hidden relative rounded-3xl border-2 border-amber-500/30 shadow-2xl bg-gradient-to-br from-white via-amber-500/5 to-white backdrop-blur-xl">
                <div class="space-y-1.5 relative z-10">
                  <h3 class="font-display text-lg font-bold text-slate-900">
                    需要同类视频制作？
                  </h3>
                  <p class="text-xs text-slate-600 leading-relaxed font-sans font-medium">
                    支持从视频分镜、后期精剪、调色降噪到动效合成的全流程定制服务。
                  </p>
                </div>
                <a :href="'mailto:' + (siteConfig?.siteInfo?.contactEmail || 'hello@xo.dev')" class="btn-primary w-full justify-center text-xs py-3 relative z-10 shadow-lg hover:shadow-amber-600/30">
                  发起项目咨询
                </a>
              </div>

            </div>
          </div>
        </div>
      </Transition>

      <!-- Loading state -->
      <div v-if="isLoadingProjects" class="text-center py-20 space-y-4">
        <div class="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
        <p style="color: var(--color-ink-3)" class="text-xs font-semibold">正在载入作品数据...</p>
      </div>

      <!-- Not found state -->
      <div v-else-if="!project" class="text-center py-20 space-y-4">
        <p class="text-5xl">🎞️</p>
        <h1 class="font-display text-2xl font-bold" style="color: var(--color-ink-3)">未找到该作品</h1>
        <p style="color: var(--color-ink-3)">请返回作品集重新选择。</p>
        <NuxtLink to="/projects" class="btn-primary inline-flex">返回作品集</NuxtLink>
      </div>

    </div>

    <!-- Request Password Modal -->
    <Transition name="fade">
      <div v-if="isRequestModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeRequestModal" />
        <div
          class="relative w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-4"
          style="background: var(--color-bg); border: 1px solid var(--color-border); max-width: 400px;"
        >
          <div class="flex items-center justify-between border-b pb-3" style="border-color: var(--color-border)">
            <h3 class="font-display font-bold text-base" style="color: var(--color-ink-3)">申请专属授权密码</h3>
            <button @click="closeRequestModal" class="text-slate-400 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="requestSuccess" class="text-center py-6 space-y-3">
            <span class="text-3xl block">📨</span>
            <h4 class="font-bold text-sm text-emerald-600">申请提交成功！</h4>
            <p class="text-xs leading-relaxed" style="color: var(--color-ink-3)">
              您的申请已成功发送至后台。主理人收到后会通过您的联系方式与您联系并提供密码。
            </p>
            <button @click="closeRequestModal" class="btn-ghost text-xs py-2 px-4 mt-2">关闭窗口</button>
          </div>

          <form v-else @submit.prevent="submitRequest" class="space-y-4">
            <p class="text-xs leading-relaxed" style="color: var(--color-ink-3)">
              请填写您的基本信息，主理人审核后将通过您留下的联系方式（微信/邮箱）发送该作品的解锁密码。
            </p>

            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-wider block" style="color: var(--color-ink-3)">您的姓名 / 机构名称</label>
              <input
                v-model="requestForm.clientName"
                required
                class="form-input text-xs w-full py-2.5 px-3 rounded-xl"
                placeholder="例如: 某某导演 / 某某广告公司"
              />
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-wider block" style="color: var(--color-ink-3)">您的联系方式 (微信 / 邮箱)</label>
              <input
                v-model="requestForm.contact"
                required
                class="form-input text-xs w-full py-2.5 px-3 rounded-xl"
                placeholder="例如: 微信号: xx_123 或 xx@email.com"
              />
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-wider block" style="color: var(--color-ink-3)">申请原因 / 观摩用途</label>
              <textarea
                v-model="requestForm.reason"
                required
                rows="3"
                class="form-input text-xs w-full py-2 px-3 rounded-xl resize-none"
                placeholder="例如：观摩调色流程学习、商业项目提案参考等..."
              />
            </div>

            <div class="pt-2">
              <button
                type="submit"
                class="btn-primary w-full justify-center py-2.5 text-xs font-semibold"
                :disabled="requestSubmitting"
              >
                {{ requestSubmitting ? '正在提交...' : '提交授权申请' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const currentSlug = computed(() => {
  let raw = String(route.params.slug || '').trim()
  try { raw = decodeURIComponent(raw) } catch {}
  return raw.replace(/^\/+|\/+$/g, '').split('/')[0].toLowerCase()
})
const slug = computed(() => currentSlug.value)

// Fetch project list (passwords are NEVER returned — only hasPassword:boolean)
const { data: projects, status: projectsStatus } = useFetch<any[]>('/api/projects')
const isLoadingProjects = computed(() => projectsStatus.value === 'pending' || (projects.value === null && projectsStatus.value !== 'error'))
const project = computed(() => {
  const list = projects.value || []
  const target = currentSlug.value
  return list.find((p: any) => {
    if (!p || !p.slug) return false
    const s = String(p.slug).trim().toLowerCase()
    return s === target || encodeURIComponent(s).toLowerCase() === target
  })
})
const activeVideoIndex = ref(0)
const parseVideoUrls = (input: any) => {
  if (Array.isArray(input)) return input
  if (typeof input !== 'string') return []

  const trimmed = input.trim()
  if (!trimmed) return []

  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) return parsed
  } catch (e) {}

  return trimmed.split(/[\n,，]+/g)
}
const projectVideoUrls = computed(() => {
  const urls = parseVideoUrls(project.value?.videoUrls)
  const normalized = urls.map((url: string) => url?.trim()).filter(Boolean)
  const legacyUrl = project.value?.videoUrl?.trim()
  if (legacyUrl && !normalized.includes(legacyUrl)) normalized.unshift(legacyUrl)
  return normalized.slice(0, 10)
})
const activeVideoUrl = computed(() => {
  const url = projectVideoUrls.value[activeVideoIndex.value] || ''
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) {
    return `/api/video-stream?url=${encodeURIComponent(url)}&slug=${encodeURIComponent(currentSlug.value)}`
  }
  return url
})

watch(projectVideoUrls, (urls) => {
  if (activeVideoIndex.value >= urls.length) activeVideoIndex.value = 0
})

// Check unlock status from server (uses HTTP-only cookie)
const { data: siteConfigData } = useFetch('/api/site-config', { lazy: true })
const siteConfig = useState<any>('site-config', () => siteConfigData.value || {})

const logoWatermarkEnabled = computed(() => siteConfig.value?.watermark?.logoEnabled ?? true)
const invisibleWatermarkEnabled = computed(() => siteConfig.value?.watermark?.invisibleEnabled ?? true)
const siteLogo = computed(() => siteConfig.value?.siteInfo?.avatar || '/logo.png')
const siteBrandName = computed(() => siteConfig.value?.siteInfo?.brandName || 'Xo')

const invisibleText = computed(() => siteConfig.value?.watermark?.invisibleText || '© Xo Studio 2026')
const invisibleOpacity = computed(() => Math.min(0.004, (siteConfig.value?.watermark?.invisibleOpacity ?? 3) / 1000))
const watermarkCanvasRef = ref<HTMLCanvasElement | null>(null)

const drawInvisibleWatermark = () => {
  if (!watermarkCanvasRef.value || !playerContainerRef.value) return
  const canvas = watermarkCanvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const rect = playerContainerRef.value.getBoundingClientRect()
  canvas.width = rect.width || 600
  canvas.height = rect.height || 400

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.save()

  ctx.rotate((-20 * Math.PI) / 180)
  ctx.font = 'bold 13px sans-serif'
  const text = invisibleText.value
  const textWidth = ctx.measureText(text).width + 85
  const textHeight = 65

  // Primary Sub-visual LSB Layer (No Stroke to prevent visible outlines on black background)
  ctx.fillStyle = `rgba(255, 255, 255, ${invisibleOpacity.value})`
  for (let x = -canvas.width; x < canvas.width * 2; x += textWidth) {
    for (let y = -canvas.height; y < canvas.height * 2; y += textHeight) {
      ctx.fillText(text, x, y)
    }
  }

  ctx.restore()
}

const watermarkLeftPx = ref(16)
const watermarkTopPx = ref(16)

const updateVideoContentBounds = () => {
  const video = mainVideoRef.value
  const container = playerContainerRef.value
  if (!video || !container) {
    watermarkLeftPx.value = 16
    watermarkTopPx.value = 16
    return
  }

  const containerRect = container.getBoundingClientRect()
  const vWidth = video.videoWidth
  const vHeight = video.videoHeight

  if (!vWidth || !vHeight || !containerRect.width || !containerRect.height) {
    watermarkLeftPx.value = 16
    watermarkTopPx.value = 16
    return
  }

  const containerAR = containerRect.width / containerRect.height
  const videoAR = vWidth / vHeight

  if (videoAR < containerAR) {
    // Vertical video (pillarboxed on left and right)
    const renderedWidth = containerRect.height * videoAR
    const paddingLeft = (containerRect.width - renderedWidth) / 2
    watermarkLeftPx.value = Math.max(12, Math.round(paddingLeft + 16))
    watermarkTopPx.value = 16
  } else {
    // Horizontal video (letterboxed on top and bottom)
    const renderedHeight = containerRect.width / videoAR
    const paddingTop = (containerRect.height - renderedHeight) / 2
    watermarkLeftPx.value = 16
    watermarkTopPx.value = Math.max(12, Math.round(paddingTop + 16))
  }
}

const isExportingVideo = ref(false)
const exportProgress = ref(0)

const downloadWatermarkedVideo = async () => {
  const video = mainVideoRef.value
  if (!video || !activeVideoUrl.value) return

  isExportingVideo.value = true
  exportProgress.value = 0

  try {
    const canvas = document.createElement('canvas')
    const width = video.videoWidth || 1280
    const height = video.videoHeight || 720
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas context not available')

    const stream = canvas.captureStream(30)
    let mimeType = 'video/webm;codecs=vp9'
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm'
    }

    const recorder = new MediaRecorder(stream, { mimeType })
    const chunks: Blob[] = []

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `xo-watermarked-${slug || 'video'}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      isExportingVideo.value = false
    }

    const originalTime = video.currentTime
    const wasPlaying = !video.paused
    video.currentTime = 0
    await video.play()
    recorder.start(100)

    const renderFrame = () => {
      if (!isExportingVideo.value || video.ended || video.paused) {
        if (recorder.state === 'recording') recorder.stop()
        if (!wasPlaying) video.pause()
        video.currentTime = originalTime
        return
      }

      // 1. Draw raw video frame
      ctx.drawImage(video, 0, 0, width, height)

      // 2. Bake invisible steganographic watermark DIRECTLY INTO VIDEO PIXELS
      if (invisibleWatermarkEnabled.value) {
        ctx.save()
        ctx.rotate((-20 * Math.PI) / 180)
        ctx.font = 'bold 16px monospace'
        ctx.fillStyle = `rgba(255, 255, 255, ${invisibleOpacity.value})`
        ctx.strokeStyle = `rgba(251, 191, 36, ${Math.max(0.02, invisibleOpacity.value * 0.8)})`
        ctx.lineWidth = 1.5

        const text = invisibleText.value
        const textWidth = ctx.measureText(text).width + 90
        const textHeight = 75

        for (let x = -width; x < width * 2; x += textWidth) {
          for (let y = -height; y < height * 2; y += textHeight) {
            ctx.strokeText(text, x, y)
            ctx.fillText(text, x, y)
          }
        }
        ctx.restore()
      }

      // 3. Bake visible top-left Logo badge DIRECTLY INTO VIDEO PIXELS
      if (logoWatermarkEnabled.value) {
        ctx.save()
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
        ctx.beginPath()
        ctx.roundRect(20, 20, 44, 44, 12)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.stroke()
        ctx.restore()
      }

      if (video.duration > 0) {
        exportProgress.value = Math.min(99, Math.round((video.currentTime / video.duration) * 100))
      }
      requestAnimationFrame(renderFrame)
    }

    renderFrame()
  } catch (e) {
    console.error('Export failed:', e)
    isExportingVideo.value = false
  }
}

watch([invisibleText, invisibleOpacity, activeVideoUrl], () => {
  nextTick(() => {
    drawInvisibleWatermark()
    updateVideoContentBounds()
  })
})

const { data: unlockStatus } = useFetch<any>(() => `/api/projects/${currentSlug.value}/check`)

const isUnlocked = ref(!!(unlockStatus.value?.unlocked))
const inputPassword = ref('')
const passwordError = ref<string>('')
const passwordLoading = ref(false)

// When project data loads, sync unlock state from server check result
watch(unlockStatus, async (val) => {
  if (val?.unlocked) {
    isUnlocked.value = true
    await nextTick()
    triggerReveal()
  } else {
    // Check URL query parameter ?pwd=... for auto-unlocking from client center
    const pwdParam = route.query.pwd as string
    if (pwdParam && !isUnlocked.value) {
      inputPassword.value = String(pwdParam).trim()
      await verifyPassword()
    }
  }
}, { immediate: true })

const verifyPassword = async () => {
  if (!inputPassword.value.trim()) return
  passwordLoading.value = true
  passwordError.value = ''
  try {
    const res = await $fetch<any>(`/api/projects/${currentSlug.value}/unlock`, {
      method: 'POST',
      body: { password: inputPassword.value }
    })
    if (res.success) {
      isUnlocked.value = true
      inputPassword.value = ''
      await nextTick()
      initReveal()
    }
  } catch (err: any) {
    passwordError.value = err.data?.statusMessage || '密码错误，请联系作者获取授权密码。'
    setTimeout(() => { passwordError.value = '' }, 2500)
  } finally {
    passwordLoading.value = false
  }
}

const isRequestModalOpen = ref(false)
const requestSubmitting = ref(false)
const requestSuccess = ref(false)
const requestForm = ref({
  clientName: '',
  contact: '',
  reason: ''
})

const openRequestModal = async () => {
  isRequestModalOpen.value = true
  requestSuccess.value = false
  requestForm.value.clientName = ''
  requestForm.value.contact = ''
  requestForm.value.reason = ''

  // Auto-fill client details if logged in
  try {
    const sessionRes = await $fetch<any>('/api/auth/client-me')
    if (sessionRes?.loggedIn) {
      const dashboard = await $fetch<any>('/api/client/dashboard?t=' + Date.now())
      if (dashboard?.profile) {
        requestForm.value.clientName = dashboard.profile.nickname || dashboard.profile.username || ''
        const contactInfoList = []
        if (dashboard.profile.wechat) contactInfoList.push(`微信: ${dashboard.profile.wechat}`)
        if (dashboard.profile.email) contactInfoList.push(`邮箱: ${dashboard.profile.email}`)
        requestForm.value.contact = contactInfoList.join(' | ') || ''
      }
    }
  } catch (e) {
    console.warn('Failed to auto-fill client details, falling back to empty form:', e)
  }
}

const closeRequestModal = () => {
  isRequestModalOpen.value = false
}

const submitRequest = async () => {
  requestSubmitting.value = true
  try {
    await $fetch('/api/password-requests', {
      method: 'POST',
      body: {
        clientName: requestForm.value.clientName,
        contact: requestForm.value.contact,
        reason: requestForm.value.reason,
        projectSlug: slug,
        projectTitle: project.value?.title || slug
      }
    })
    requestSuccess.value = true
  } catch (err: any) {
    alert(err.data?.statusMessage || '提交申请失败，请稍后重试。')
  } finally {
    requestSubmitting.value = false
  }
}

// Image LUT slider logic
const sliderContainerRef = ref<HTMLElement | null>(null)
const sliderPosition = ref(50)
const containerWidth = ref(800)
const sliderDragging = ref(false)

const handleSliderMove = (e: MouseEvent | TouchEvent) => {
  if (!sliderContainerRef.value) return
  // Only drag on mousedown held or touch
  if (e instanceof MouseEvent && !sliderDragging.value) return
  const rect = sliderContainerRef.value.getBoundingClientRect()
  containerWidth.value = rect.width
  let clientX = 0
  if (e instanceof MouseEvent) {
    clientX = e.clientX
  } else if (e instanceof TouchEvent && e.touches?.[0]) {
    clientX = e.touches[0].clientX
  }
  const x = clientX - rect.left
  let pct = (x / rect.width) * 100
  sliderPosition.value = Math.max(0, Math.min(100, pct))
}

if (import.meta.client) {
  window.addEventListener('mouseup', () => { sliderDragging.value = false })
  window.addEventListener('resize', () => {
    if (sliderContainerRef.value) {
      containerWidth.value = sliderContainerRef.value.getBoundingClientRect().width
    }
  })
}

const syncBlurVideo = () => {
  if (!mainVideoRef.value || !blurVideoRef.value) return
  const main = mainVideoRef.value
  const blur = blurVideoRef.value
  blur.currentTime = main.currentTime
  main.addEventListener('play', () => { blur.play().catch(() => {}) })
  main.addEventListener('pause', () => blur.pause())
  main.addEventListener('seeking', () => { blur.currentTime = main.currentTime })
  main.addEventListener('timeupdate', () => {
    if (Math.abs(blur.currentTime - main.currentTime) > 0.35) {
      blur.currentTime = main.currentTime
    }
  })
}

// --- Premium Custom Video Player Controls State & Logic ---
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1.0)
const isMuted = ref(false)
const playbackRate = ref(1.0)
const isFullscreen = ref(false)
const showControls = ref(true)
const isDraggingScrub = ref(false)
const bufferedEnd = ref(0)
const hoverTime = ref<number | null>(null)
const hoverPercent = ref(0)
let lastClickTime = 0

// Top-Tier Stats & Hardware Decoding Inspector State
const showStatsPanel = ref(false)
const currentFps = ref(60)
const droppedFrames = ref(0)
const totalFrames = ref(0)
const detectedCodec = ref('H.264 High Profile (AVC1)')
const videoResolution = ref('1920x1080')
const bufferLength = ref(0)
const activeDecoderEngine = ref('GPU 硬件加速 (MSE)')
const targetFps = ref(30)

// Enhancement Filters
type EnhancementMode = 'normal' | 'cas' | 'shadow' | 'denoise'
const enhancementMode = ref<EnhancementMode>('normal')

const enhancementLabels: Record<EnhancementMode, string> = {
  normal: '原画',
  cas: 'CAS 自适应锐化',
  shadow: '电影级暗部提亮',
  denoise: '数字降噪与画面修复',
}

const enhancementSvgFilters: Record<EnhancementMode, string> = {
  normal: 'none',
  cas: 'url(#svg-cas-filter-detail)',
  shadow: 'url(#svg-shadow-filter-detail)',
  denoise: 'url(#svg-denoise-filter-detail)',
}

// A-B Loop State
const pointA = ref<number | null>(null)
const pointB = ref<number | null>(null)

// Step frame function (-1 / +1 frame)
const stepFrame = (delta: number) => {
  if (!mainVideoRef.value) return
  if (isPlaying.value) {
    mainVideoRef.value.pause()
    isPlaying.value = false
  }
  const frameTime = 1 / targetFps.value
  mainVideoRef.value.currentTime = Math.max(0, Math.min(duration.value, mainVideoRef.value.currentTime + delta * frameTime))
  currentTime.value = mainVideoRef.value.currentTime
}

// A-B Loop controls
const setPointA = () => {
  pointA.value = currentTime.value
  if (pointB.value !== null && pointB.value <= pointA.value) {
    pointB.value = null
  }
}

const setPointB = () => {
  if (pointA.value === null) pointA.value = 0
  if (currentTime.value > pointA.value) {
    pointB.value = currentTime.value
  }
}

const clearABLoop = () => {
  pointA.value = null
  pointB.value = null
}

const toggleABLoop = () => {
  if (pointA.value !== null || pointB.value !== null) {
    clearABLoop()
  } else {
    setPointA()
  }
}

const progressTrackRef = ref<HTMLElement | null>(null)
const mainVideoRef = ref<HTMLVideoElement | null>(null)
const blurVideoRef = ref<HTMLVideoElement | null>(null)
const playerContainerRef = ref<HTMLElement | null>(null)

const updateDuration = () => {
  if (mainVideoRef.value && isFinite(mainVideoRef.value.duration) && mainVideoRef.value.duration > 0) {
    duration.value = mainVideoRef.value.duration
  }
}

const onVideoLoaded = () => {
  if (mainVideoRef.value) {
    updateDuration()
    mainVideoRef.value.volume = volume.value
    mainVideoRef.value.muted = isMuted.value
  }
  syncBlurVideo()
  updateVideoContentBounds()
}

const onTimeUpdate = () => {
  if (mainVideoRef.value && !isDraggingScrub.value) {
    currentTime.value = mainVideoRef.value.currentTime
    if (!duration.value || isNaN(duration.value) || duration.value === 0) {
      updateDuration()
    }
    // A-B Loop Check
    if (pointB.value !== null && currentTime.value >= pointB.value) {
      mainVideoRef.value.currentTime = pointA.value || 0
    }
  }
}

let hlsInstance: any = null
let lastFrameTime = performance.now()
let frameCount = 0
let fpsFrameCallbackId: number | null = null
let statsInterval: ReturnType<typeof setInterval> | null = null

const supportsWebCodecs = ref(false)
const decodeLatencyMs = ref(1.2)
const colorSpaceStr = ref('BT.709 (8-bit SDR)')

const checkWebCodecsHardwareSupport = async () => {
  if (!import.meta.client) return
  if ('VideoDecoder' in window) {
    supportsWebCodecs.value = true
    try {
      const h264Config = { codec: 'avc1.64002a', width: 1920, height: 1080 }
      const res = await (window as any).VideoDecoder.isConfigSupported(h264Config)
      if (res.supported) {
        activeDecoderEngine.value = '⚡ WebCodecs GPU 硬件直解码 (Zero-Copy)'
      }
    } catch (e) {}
  }
}

const initDetailHlsDecoder = async () => {
  if (!import.meta.client || !activeVideoUrl.value || !mainVideoRef.value) return
  const srcUrl = activeVideoUrl.value.trim()

  await checkWebCodecsHardwareSupport()

  if (hlsInstance) {
    hlsInstance.destroy()
    hlsInstance = null
  }

  const isHlsStream = srcUrl.endsWith('.m3u8') || srcUrl.includes('m3u8')
  if (isHlsStream) {
    try {
      const HlsModule = await import('hls.js')
      const Hls = HlsModule.default || HlsModule
      if (Hls.isSupported()) {
        activeDecoderEngine.value = '⚡ WebCodecs/MSE GPU 硬件解复用 (HLS.js)'
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 120,
          maxBufferLength: 60,
          maxMaxBufferLength: 120,
          maxBufferHole: 0.5,
          highBufferWatchdogPeriod: 2,
        })
        hlsInstance.loadSource(srcUrl)
        hlsInstance.attachMedia(mainVideoRef.value)
        return
      }
    } catch (e) {
      console.warn('Detail HLS fallback:', e)
    }
  }

  if (supportsWebCodecs.value) {
    activeDecoderEngine.value = '⚡ WebCodecs GPU 硬件直解码 (Zero-Copy)'
  } else {
    activeDecoderEngine.value = '⚡ GPU 硬件加速 (Native WebCodecs/MSE)'
  }
}

watch(activeVideoUrl, () => {
  initDetailHlsDecoder()
})

const updateStats = () => {
  if (!mainVideoRef.value) return
  try {
    const buf = mainVideoRef.value.buffered
    if (buf.length > 0) {
      const end = buf.end(buf.length - 1)
      bufferLength.value = Math.max(0, end - mainVideoRef.value.currentTime)
    }
  } catch (e) {}

  if (mainVideoRef.value.videoWidth && mainVideoRef.value.videoHeight) {
    videoResolution.value = `${mainVideoRef.value.videoWidth}x${mainVideoRef.value.videoHeight}`
  }

  if (typeof (mainVideoRef.value as any).getVideoPlaybackQuality === 'function') {
    const q = (mainVideoRef.value as any).getVideoPlaybackQuality()
    droppedFrames.value = q.droppedVideoFrames || 0
    totalFrames.value = q.totalVideoFrames || 0
  }
}

const webglCanvasRef = ref<HTMLCanvasElement | null>(null)
const webglAvailable = ref(true)
let glCtx: WebGLRenderingContext | null = null
let glProgram: WebGLProgram | null = null
let glTexture: WebGLTexture | null = null
let animationFrameId: number | null = null
let uModeLocation: WebGLUniformLocation | null = null
let uTextureSizeLocation: WebGLUniformLocation | null = null

const initWebGLShaderEngine = () => {
  if (!import.meta.client || !webglCanvasRef.value) return
  const canvas = webglCanvasRef.value
  const gl = canvas.getContext('webgl', { preserveDrawingBuffer: false, alpha: false })
  if (!gl) {
    webglAvailable.value = false
    return
  }
  webglAvailable.value = true
  glCtx = gl

  const vsSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
    }
  `

  const fsSource = `
    precision highp float;
    varying vec2 v_texCoord;
    uniform sampler2D u_image;
    uniform vec2 u_textureSize;
    uniform int u_mode;

    // 1. AMD CAS (Contrast Adaptive Sharpening) + Anti-Ringing
    vec3 applyCas(sampler2D tex, vec2 uv, vec2 size) {
      vec2 step = 1.0 / size;
      vec3 a = texture2D(tex, uv + vec2(0.0, -step.y)).rgb;
      vec3 b = texture2D(tex, uv + vec2(-step.x, 0.0)).rgb;
      vec3 e = texture2D(tex, uv).rgb;
      vec3 c = texture2D(tex, uv + vec2(step.x, 0.0)).rgb;
      vec3 d = texture2D(tex, uv + vec2(0.0, step.y)).rgb;

      vec3 f = texture2D(tex, uv + vec2(-step.x, -step.y)).rgb;
      vec3 g = texture2D(tex, uv + vec2(step.x, -step.y)).rgb;
      vec3 h = texture2D(tex, uv + vec2(-step.x, step.y)).rgb;
      vec3 i = texture2D(tex, uv + vec2(step.x, step.y)).rgb;

      vec3 minColor = min(min(min(a, b), min(c, d)), e);
      vec3 maxColor = max(max(max(a, b), max(c, d)), e);
      minColor += min(min(f, g), min(h, i));
      maxColor += max(max(f, g), max(h, i));
      minColor *= 0.5;
      maxColor *= 0.5;

      vec3 amp = clamp(sqrt(min(minColor, 1.0 - maxColor) / max(maxColor, 0.0001)), 0.0, 1.0);
      vec3 w = amp * -0.16;
      return clamp((a * w + b * w + c * w + d * w + e) / (1.0 + 4.0 * w), 0.0, 1.0);
    }

    // 2. Smart Vibrance with Skin Tone Protection (Hue around 0.07)
    vec3 applySmartVibrance(vec3 color, float boost) {
      float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
      float maxC = max(color.r, max(color.g, color.b));
      float minC = min(color.r, min(color.g, color.b));
      float sat = maxC - minC;

      float hue = 0.0;
      if (sat > 0.001) {
        if (maxC == color.r) hue = (color.g - color.b) / sat;
        else if (maxC == color.g) hue = 2.0 + (color.b - color.r) / sat;
        else hue = 4.0 + (color.r - color.g) / sat;
        hue /= 6.0;
        if (hue < 0.0) hue += 1.0;
      }

      float skinDist = abs(hue - 0.07);
      float skinMask = smoothstep(0.0, 0.06, skinDist);
      float satMask = 1.0 - pow(sat, 0.75);
      float effectiveBoost = boost * satMask * mix(0.12, 1.0, skinMask);

      return clamp(mix(vec3(luma), color, 1.0 + effectiveBoost), 0.0, 1.0);
    }

    // 3. Bilateral De-noising Filter
    vec3 applyBilateral(sampler2D tex, vec2 uv, vec2 size) {
      vec2 step = 1.0 / size;
      vec3 center = texture2D(tex, uv).rgb;
      vec3 sum = vec3(0.0);
      float totalWeight = 0.0;

      for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
          vec2 offset = vec2(float(x), float(y)) * step;
          vec3 sampleColor = texture2D(tex, uv + offset).rgb;
          float spatialDistSq = float(x*x + y*y);
          float spatialWeight = exp(-spatialDistSq / 2.0);
          vec3 colorDiff = sampleColor - center;
          float colorDistSq = dot(colorDiff, colorDiff);
          float rangeWeight = exp(-colorDistSq / 0.03);
          float weight = spatialWeight * rangeWeight;
          sum += sampleColor * weight;
          totalWeight += weight;
        }
      }
      return sum / max(totalWeight, 0.0001);
    }

    // 4. ACES Filmic Tone Mapping
    vec3 ACESFilm(vec3 x) {
      float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
      return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
    }

    // 5. Pseudo-HDR & Local Contrast
    vec3 applyPseudoHDR(sampler2D tex, vec2 uv, vec2 size) {
      vec3 color = texture2D(tex, uv).rgb;
      vec2 step = 2.0 / size;
      vec3 blur = (
        texture2D(tex, uv + vec2(-step.x, 0.0)).rgb +
        texture2D(tex, uv + vec2(step.x, 0.0)).rgb +
        texture2D(tex, uv + vec2(0.0, -step.y)).rgb +
        texture2D(tex, uv + vec2(0.0, step.y)).rgb
      ) * 0.25;

      float lumaCenter = dot(color, vec3(0.2126, 0.7152, 0.0722));
      float lumaBlur = dot(blur, vec3(0.2126, 0.7152, 0.0722));
      float localContrast = lumaCenter - lumaBlur;

      vec3 hdrColor = color * (1.1 + localContrast * 0.35);
      vec3 aces = ACESFilm(hdrColor);

      float shadowWeight = 1.0 - smoothstep(0.0, 0.5, lumaCenter);
      vec3 shadowBoost = pow(aces, vec3(0.75));
      return clamp(mix(aces, shadowBoost, shadowWeight * 0.6), 0.0, 1.0);
    }

    void main() {
      vec4 color = texture2D(u_image, v_texCoord);
      if (u_mode == 1) {
        // AMD CAS Contrast Adaptive Sharpening
        gl_FragColor = vec4(applyCas(u_image, v_texCoord, u_textureSize), color.a);
      } else if (u_mode == 2) {
        // Smart Vibrance with Skin Tone Protection
        gl_FragColor = vec4(applySmartVibrance(color.rgb, 0.45), color.a);
      } else if (u_mode == 3) {
        // Bilateral De-noise + CAS Super Resolution
        vec3 clean = applyBilateral(u_image, v_texCoord, u_textureSize);
        vec3 sharp = applyCas(u_image, v_texCoord, u_textureSize);
        gl_FragColor = vec4(clamp(mix(clean, sharp, 0.65), 0.0, 1.0), color.a);
      } else if (u_mode == 4) {
        // Pseudo-HDR Local Contrast & ACES Filmic Tone Mapping
        gl_FragColor = vec4(applyPseudoHDR(u_image, v_texCoord, u_textureSize), color.a);
      } else {
        gl_FragColor = color;
      }
    }
  `

  const vs = gl.createShader(gl.VERTEX_SHADER)!
  gl.shaderSource(vs, vsSource)
  gl.compileShader(vs)

  const fs = gl.createShader(gl.FRAGMENT_SHADER)!
  gl.shaderSource(fs, fsSource)
  gl.compileShader(fs)

  const prog = gl.createProgram()!
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  glProgram = prog
  gl.useProgram(prog)

  const posBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1.0, -1.0,  1.0, -1.0,  -1.0,  1.0,  1.0,  1.0
  ]), gl.STATIC_DRAW)

  const aPos = gl.getAttribLocation(prog, 'a_position')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const texBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0, 0.0,  1.0, 0.0,  0.0, 1.0,  1.0, 1.0
  ]), gl.STATIC_DRAW)

  const aTex = gl.getAttribLocation(prog, 'a_texCoord')
  gl.enableVertexAttribArray(aTex)
  gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, 0, 0)

  glTexture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, glTexture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

  uModeLocation = gl.getUniformLocation(prog, 'u_mode')
  uTextureSizeLocation = gl.getUniformLocation(prog, 'u_textureSize')
}

const renderWebGLFrame = () => {
  if (!import.meta.client) return
  if (enhancementMode.value !== 'normal' && mainVideoRef.value && glCtx && glProgram && glTexture && webglCanvasRef.value) {
    const video = mainVideoRef.value
    const canvas = webglCanvasRef.value
    const gl = glCtx

    if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      }

      gl.useProgram(glProgram)
      gl.bindTexture(gl.TEXTURE_2D, glTexture)

      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
      } catch (e) {}

      let modeInt = 0
      if (enhancementMode.value === 'cas') modeInt = 1
      else if (enhancementMode.value === 'vibrance') modeInt = 2
      else if (enhancementMode.value === 'bilateral_cas') modeInt = 3
      else if (enhancementMode.value === 'pseudo_hdr') modeInt = 4

      gl.uniform1i(uModeLocation, modeInt)
      gl.uniform2f(uTextureSizeLocation, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
  }

  animationFrameId = requestAnimationFrame(renderWebGLFrame)
}

watch(enhancementMode, async (mode) => {
  if (mode === 'normal') return
  await nextTick()
  initWebGLShaderEngine()
})

const measureFps = () => {
  if (!import.meta.client) return
  const now = performance.now()
  frameCount++

  if (now - lastFrameTime >= 1000) {
    currentFps.value = Math.round((frameCount * 1000) / (now - lastFrameTime))
    frameCount = 0
    lastFrameTime = now
    updateStats()
  }

  if ('requestVideoFrameCallback' in HTMLVideoElement.prototype && mainVideoRef.value) {
    fpsFrameCallbackId = (mainVideoRef.value as any).requestVideoFrameCallback(measureFps)
  } else {
    fpsFrameCallbackId = requestAnimationFrame(measureFps)
  }
}

const updateBuffered = () => {
  if (!mainVideoRef.value) return
  const buff = mainVideoRef.value.buffered
  if (buff.length > 0) {
    bufferedEnd.value = buff.end(buff.length - 1)
  }
}

const onProgressHover = (e: MouseEvent) => {
  if (!duration.value) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  hoverPercent.value = percent * 100
  hoverTime.value = percent * duration.value
}

const onProgressLeave = () => {
  hoverTime.value = null
}

const onPlay = () => {
  isPlaying.value = true
  resetControlsTimer()
}

const onPause = () => {
  isPlaying.value = false
  showControls.value = true
  if (controlsTimeout) clearTimeout(controlsTimeout)
}

const togglePlay = () => {
  if (!mainVideoRef.value) return
  if (isPlaying.value) {
    mainVideoRef.value.pause()
  } else {
    // User interaction! Ensure sound is enabled
    isMuted.value = false
    mainVideoRef.value.muted = false
    if (volume.value === 0) volume.value = 0.8
    mainVideoRef.value.volume = volume.value

    mainVideoRef.value.play().then(() => {
      isPlaying.value = true
    }).catch((err) => {
      console.warn('Autoplay with audio blocked by browser policy, falling back to muted play:', err)
      if (mainVideoRef.value) {
        mainVideoRef.value.muted = true
        isMuted.value = true
        mainVideoRef.value.play().catch(() => {})
      }
    })
  }
}

const toggleMute = () => {
  if (!mainVideoRef.value) return
  isMuted.value = !isMuted.value
  mainVideoRef.value.muted = isMuted.value
}

const setVolume = (val: number) => {
  volume.value = val
  isMuted.value = val === 0
  if (mainVideoRef.value) {
    mainVideoRef.value.volume = val
    mainVideoRef.value.muted = val === 0
  }
}

const setPlaybackRate = (rate: number) => {
  playbackRate.value = rate
  if (mainVideoRef.value) mainVideoRef.value.playbackRate = rate
  if (blurVideoRef.value) blurVideoRef.value.playbackRate = rate
}

const toggleFullscreen = () => {
  if (!playerContainerRef.value) return
  if (!document.fullscreenElement) {
    playerContainerRef.value.requestFullscreen().catch(() => {})
    isFullscreen.value = true
  } else {
    document.exitFullscreen().catch(() => {})
    isFullscreen.value = false
  }
}

const togglePiP = async () => {
  if (!mainVideoRef.value) return
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture()
    } else {
      await mainVideoRef.value.requestPictureInPicture()
    }
  } catch (e) {
    console.error('PiP error:', e)
  }
}

const startScrub = (e: MouseEvent) => {
  isDraggingScrub.value = true
  scrub(e)
  if (import.meta.client) {
    window.addEventListener('mousemove', scrub)
    window.addEventListener('mouseup', stopScrub)
  }
}

const scrub = (e: MouseEvent) => {
  if (!mainVideoRef.value || !progressTrackRef.value) return
  const rect = progressTrackRef.value.getBoundingClientRect()
  const pos = (e.clientX - rect.left) / rect.width
  const clamped = Math.max(0, Math.min(1, pos))
  currentTime.value = clamped * duration.value
  mainVideoRef.value.currentTime = currentTime.value
}

const stopScrub = () => {
  isDraggingScrub.value = false
  if (import.meta.client) {
    window.removeEventListener('mousemove', scrub)
    window.removeEventListener('mouseup', stopScrub)
  }
  resetControlsTimer()
}

let controlsTimeout: NodeJS.Timeout | null = null
const resetControlsTimer = () => {
  showControls.value = true
  if (controlsTimeout) clearTimeout(controlsTimeout)
  if (isPlaying.value && !isDraggingScrub.value) {
    controlsTimeout = setTimeout(() => {
      showControls.value = false
    }, 2500)
  }
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds === Infinity) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const handleKeydown = (e: KeyboardEvent) => {
  if (!mainVideoRef.value) return
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

  switch (e.key) {
    case ' ':
    case 'k':
    case 'K':
      e.preventDefault()
      togglePlay()
      break
    case 'm':
    case 'M':
      e.preventDefault()
      toggleMute()
      break
    case 'f':
    case 'F':
      e.preventDefault()
      toggleFullscreen()
      break
    case 'ArrowLeft':
      e.preventDefault()
      mainVideoRef.value.currentTime = Math.max(0, mainVideoRef.value.currentTime - 5)
      break
    case 'ArrowRight':
      e.preventDefault()
      mainVideoRef.value.currentTime = Math.min(duration.value, mainVideoRef.value.currentTime + 5)
      break
    case 'ArrowUp':
      e.preventDefault()
      setVolume(Math.min(1, volume.value + 0.1))
      break
    case 'ArrowDown':
      e.preventDefault()
      setVolume(Math.max(0, volume.value - 0.1))
      break
    case 'j':
    case 'J':
      e.preventDefault()
      mainVideoRef.value.currentTime = Math.max(0, mainVideoRef.value.currentTime - 10)
      break
    case 'l':
    case 'L':
      e.preventDefault()
      mainVideoRef.value.currentTime = Math.min(duration.value, mainVideoRef.value.currentTime + 10)
      break
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
      e.preventDefault()
      mainVideoRef.value.currentTime = (Number(e.key) / 10) * duration.value
      break
  }
}

const handleVideoClick = (e: MouseEvent) => {
  const now = Date.now()
  if (now - lastClickTime < 300) {
    e.preventDefault()
    toggleFullscreen()
    lastClickTime = 0
    return
  }
  lastClickTime = now
  togglePlay()
}

useHead({
  title: () => project.value ? `${project.value.title} \u2014 Xo Studio` : '\u4f5c\u54c1\u8be6\u60c5 \u2014 Xo Studio',
  meta: [{ name: 'description', content: () => project.value ? project.value.description : '\u4f5c\u54c1\u8be6\u60c5\u9875' }]
})

let observer: IntersectionObserver | null = null

const triggerReveal = () => {
  if (!import.meta.client) return
  initReveal()
  // Multi-stage fallback timers ensure elements are revealed even during transition / hydration delays
  ;[50, 150, 300, 600, 1000].forEach(delay => {
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'))
    }, delay)
  })
}

const initReveal = () => {
  if (!import.meta.client) return
  if (observer) observer.disconnect()
  observer = new IntersectionObserver(
    (entries) => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view') }) },
    { threshold: 0.01, rootMargin: '50px 0px 50px 0px' }
  )
  document.querySelectorAll('.reveal').forEach(el => observer?.observe(el))
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

const viewedProjectSlugs = new Set<string>()

const recordProjectView = async (targetSlug?: string) => {
  if (!import.meta.client) return
  const activeSlug = targetSlug || currentSlug.value
  if (!activeSlug || viewedProjectSlugs.has(activeSlug)) return
  viewedProjectSlugs.add(activeSlug)

  try {
    await $fetch(`/api/projects/${activeSlug}/view`, { method: 'POST' })
  } catch (e) {
    viewedProjectSlugs.delete(activeSlug)
  }
}

watch(
  project,
  async (val) => {
    if (val && import.meta.client) {
      recordProjectView()
      await nextTick()
      triggerReveal()
    }
  },
  { immediate: true }
)

onMounted(async () => {
  await nextTick()
  triggerReveal()

  if (import.meta.client) {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('keydown', handleKeydown)
    window.addEventListener('resize', updateVideoContentBounds)

    recordProjectView()
    initDetailHlsDecoder()
    measureFps()
    statsInterval = setInterval(updateStats, 1000)

    initWebGLShaderEngine()
    renderWebGLFrame()
  }

  watch(mainVideoRef, (el) => {
    if (el) {
      el.addEventListener('progress', updateBuffered)
    }
  }, { immediate: true })
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
  if (statsInterval) clearInterval(statsInterval)
  if (fpsFrameCallbackId !== null && import.meta.client) {
    cancelAnimationFrame(fpsFrameCallbackId)
  }
  if (animationFrameId !== null && import.meta.client) {
    cancelAnimationFrame(animationFrameId)
  }
  if (hlsInstance) {
    hlsInstance.destroy()
    hlsInstance = null
  }
  if (import.meta.client) {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('resize', updateVideoContentBounds)
  }
})
</script>

<style scoped>

/* ===== Premium Video Player UI ===== */

/* Main play button */
.play-btn-main {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 2px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
.play-btn-main:hover {
  background: var(--color-bronze, #b45309);
  border-color: var(--color-bronze-light, #d97706);
  transform: scale(1.1);
  box-shadow: 0 0 40px rgba(180, 83, 9, 0.5), 0 8px 32px rgba(0, 0, 0, 0.4);
}
.play-btn-main:active {
  transform: scale(0.95);
}

/* Video control buttons */
.video-ctrl-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: rgba(255,255,255,0.8);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  border: none;
  background: transparent;
  cursor: pointer;
}
.video-ctrl-btn:hover {
  color: #f59e0b;
  background: rgba(255,255,255,0.1);
  transform: scale(1.08);
}
.video-ctrl-btn:active {
  transform: scale(0.92);
  background: rgba(255,255,255,0.15);
}

/* Progress bar */
.progress-bar-container {
  position: relative;
  height: 4px;
  width: 100%;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 14px;
  transition: height 0.2s ease;
}
.progress-bar-container:hover {
  height: 6px;
}
.progress-buffered {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}
.progress-filled {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, var(--color-bronze, #b45309), var(--color-bronze-light, #d97706));
  border-radius: 4px;
  transition: width 0.1s linear;
}
.progress-tooltip {
  position: absolute;
  top: -36px;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: white;
  padding: 4px 10px;
  border-radius: 8px;
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translateY(-50%) scale(0);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: white;
  border: 2px solid var(--color-bronze, #b45309);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.progress-bar-container:hover .progress-thumb {
  transform: translateY(-50%) scale(1);
}

/* Time display */
.time-display {
  font-family: var(--font-mono, monospace);
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.05em;
}

/* Speed button */
.speed-btn {
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
}
.speed-btn:hover {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.5);
  background: rgba(245, 158, 11, 0.1);
}


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.ambilight-container {
  position: relative;
  border-radius: 1rem;
  overflow: visible;
}

.ambilight-shadow {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 1rem;
  filter: blur(40px) saturate(1.5) brightness(0.7);
  transform: translateY(12px) scale(1.04);
  z-index: 0;
  opacity: 0.65;
  pointer-events: none;
}

/* Custom range slider styling */
.volume-slider {
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.25) !important;
  height: 4px !important;
  border-radius: 2px !important;
  outline: none !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 10px !important;
  height: 10px !important;
  border-radius: 50% !important;
  background: #f59e0b !important; /* amber-500 */
  cursor: pointer;
  border: none !important;
  transition: transform 0.15s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.3);
}

.volume-slider::-moz-range-thumb {
  width: 10px !important;
  height: 10px !important;
  border-radius: 50% !important;
  background: #f59e0b !important;
  cursor: pointer;
  border: none !important;
  transition: transform 0.15s ease;
}

.volume-slider::-moz-range-thumb:hover {
  transform: scale(1.3);
}
</style>
