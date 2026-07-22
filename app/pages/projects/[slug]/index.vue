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

      <!-- Password Protection Lock Screen — only when server says hasPassword=true -->
      <Transition name="fade">
        <div v-if="project && project.hasPassword && !isUnlocked" class="max-w-md mx-auto py-16 text-center space-y-6">
          <div class="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto shadow-sm"
               style="background: var(--color-bg-2); border: 1px solid var(--color-border)">
            🔐
          </div>
          <div class="space-y-2">
            <h1 class="font-display text-2xl font-bold" style="color: var(--color-ink-1)">该作品受访问密码保护</h1>
            <p class="text-xs leading-relaxed" style="color: var(--color-ink-4)">
              此项目包含未公开内容、商业合作机密或受到 NDA 限制。<br>
              请输入客户专属授权密码以解锁并查看详情。
            </p>
          </div>

          <form @submit.prevent="verifyPassword" class="space-y-4 pt-4">
            <input
              v-model="inputPassword"
              type="password"
              class="form-input text-center font-mono tracking-widest py-3 rounded-xl w-full"
              placeholder="请输入密码"
              required
              autofocus
              :disabled="passwordLoading"
            />
            <button type="submit" class="btn-primary w-full justify-center py-3 text-xs font-semibold flex items-center gap-2" :disabled="passwordLoading">
              <span v-if="passwordLoading" class="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style="border-color: currentColor; border-top-color: transparent;" />
              {{ passwordLoading ? '正在验证...' : '验证密码并解锁' }}
            </button>
          </form>

          <p v-if="passwordError" class="text-xs text-rose-500 font-semibold">
            ❌ {{ passwordError }}
          </p>

          <div class="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-semibold">
            <NuxtLink
              :to="`/projects/${slug}/get`"
              class="hover:opacity-80 transition-opacity underline text-amber-700 flex items-center gap-1"
            >
              🔗 在线直接获取密码 (去获取密码)
            </NuxtLink>
            
            <span class="text-slate-300 hidden sm:inline">|</span>
            
            <button
              type="button"
              @click="openRequestModal"
              class="hover:opacity-80 transition-opacity underline"
              style="color: var(--color-ink-3)"
            >
              📨 填写表单手动申请
            </button>
          </div>

          <div class="pt-4 border-t border-black/[0.05]">
            <NuxtLink to="/projects" class="text-xs hover:underline" style="color: var(--color-ink-4)">
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
            <h1 class="font-display text-4xl lg:text-5xl font-bold tracking-tight leading-tight"
                style="color: var(--color-ink-1)">
              {{ project.title }}
            </h1>
            <p class="text-sm font-mono" style="color: var(--color-ink-5)">
              发布日期：{{ project.releaseYear || '2026' }} 年 · 后期规格：{{ project.postSpecs || '4K 60FPS HDR' }}
            </p>
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
                  muted loop playsinline
                  class="ambilight-shadow"
                />
                
                <!-- Custom Premium Player Container -->
                <div 
                  ref="playerContainerRef" 
                  class="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-black/10 select-none z-10 aspect-video max-h-[520px]"
                  @mousemove="resetControlsTimer"
                  @mouseleave="showControls = false"
                  @contextmenu.prevent
                >
                  <!-- Main Video Element -->
                  <video
                    ref="mainVideoRef"
                    :key="`main-${activeVideoUrl}`"
                    :src="activeVideoUrl"
                    :poster="project.image"
                    :muted="isMuted"
                    playsinline
                    class="w-full h-full block cursor-pointer"
                    :style="{ maxHeight: isFullscreen ? 'none' : '520px', height: isFullscreen ? '100%' : '100%', objectFit: 'cover', background: '#000' }"
                    @loadedmetadata="onVideoLoaded"
                    @timeupdate="onTimeUpdate"
                    @play="onPlay"
                    @pause="onPause"
                    @click="togglePlay"
                  />

                  <!-- Centered Big Play Button Indicator -->
                  <div 
                    class="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 z-20"
                    :class="{ 'opacity-0 scale-95': isPlaying, 'opacity-100 scale-100': !isPlaying }"
                  >
                    <button 
                      type="button"
                      class="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20 text-white shadow-2xl pointer-events-auto transform transition-transform hover:scale-105 active:scale-95"
                      @click="togglePlay"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 ml-1 text-amber-500">
                        <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  <!-- Custom Bottom Controls (Glassmorphism Overlay) -->
                  <div 
                    class="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/85 via-black/45 to-transparent transition-all duration-300 transform flex flex-col justify-end pointer-events-auto z-20"
                    :class="{ 'opacity-100 translate-y-0': showControls, 'opacity-0 translate-y-2 pointer-events-none': !showControls }"
                  >
                    <!-- Scrub Progress Bar -->
                    <div 
                      class="relative h-1 w-full bg-white/20 rounded-full cursor-pointer group/progress mb-3.5 transition-all hover:h-1.5"
                      @mousedown="startScrub"
                      ref="progressTrackRef"
                    >
                      <!-- Progress Fill -->
                      <div 
                        class="absolute top-0 left-0 h-full bg-amber-600 rounded-full"
                        :style="{ width: (currentTime / (duration || 1)) * 100 + '%' }"
                      />
                      <!-- Progress Thumb Knob -->
                      <div 
                        class="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border border-amber-600 shadow-md scale-0 group-hover/progress:scale-100 transition-transform"
                        :style="{ left: 'calc(' + (currentTime / (duration || 1)) * 100 + '% - 6px)' }"
                      />
                    </div>

                    <!-- Bottom Controls Buttons row -->
                    <div class="flex items-center justify-between text-white text-xs select-none">
                      <div class="flex items-center gap-4">
                        <!-- Play/Pause toggle -->
                        <button type="button" @click="togglePlay" class="hover:text-amber-500 transition-colors">
                          <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-white">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-white">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 7.75a.75.75 0 01.75-.75h.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-.5a.75.75 0 01-.75-.75v-4.5zm5 0a.75.75 0 01.75-.75h.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-.5a.75.75 0 01-.75-.75v-4.5z" clip-rule="evenodd" />
                          </svg>
                        </button>

                        <!-- Timeline Time counter -->
                        <span class="font-mono text-[11px] text-gray-300">
                          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
                        </span>

                        <!-- Volume with Slider -->
                        <div class="flex items-center gap-1.5 group/volume ml-1">
                          <button type="button" @click="toggleMute" class="hover:text-amber-500 transition-colors">
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
                        <!-- Speed selector popover cycle -->
                        <div class="relative group/speed">
                          <button type="button" class="font-mono text-[9px] font-bold border border-white/30 rounded px-1.5 py-0.5 hover:border-amber-500 hover:text-amber-500 transition-colors uppercase">
                            {{ playbackRate.toFixed(2) }}x
                          </button>
                          <div class="absolute bottom-full right-0 mb-2 bg-black/90 border border-white/10 rounded-xl py-1 shadow-2xl min-w-[70px] opacity-0 translate-y-1 pointer-events-none group-hover/speed:opacity-100 group-hover/speed:translate-y-0 group-hover/speed:pointer-events-auto transition-all duration-200">
                            <button 
                              v-for="r in [0.5, 1.0, 1.25, 1.5, 2.0]" :key="r" 
                              type="button" 
                              @click="setPlaybackRate(r)"
                              class="w-full text-center py-1.5 hover:bg-white/10 transition-colors text-[10px] font-mono"
                              :class="{ 'text-amber-500 font-bold': playbackRate === r }"
                            >
                              {{ r.toFixed(2) }}x
                            </button>
                          </div>
                        </div>

                        <!-- Picture in Picture (PiP) -->
                        <button type="button" @click="togglePiP" class="hover:text-amber-500 transition-colors" title="画中画">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                            <path fill-rule="evenodd" d="M2 3.75A1.75 1.75 0 013.75 2h12.5A1.75 1.75 0 0118 3.75v12.5A1.75 1.75 0 0116.25 18H3.75A1.75 1.75 0 012 16.25V3.75zM3.5 8v8.25c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25V8h-13zm11 2.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z" clip-rule="evenodd" />
                          </svg>
                        </button>

                        <!-- Fullscreen Toggle -->
                        <button type="button" @click="toggleFullscreen" class="hover:text-amber-500 transition-colors">
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
                    'px-3 py-2 rounded-xl text-[10px] font-mono font-semibold transition-all',
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
                <h2 class="font-display text-xl font-semibold" style="color: var(--color-ink-1)">🎥 影视调色前后对比</h2>
              </div>
              <span class="text-[10px] font-mono" style="color: var(--color-ink-5)">← 左右拖动对比调色前后 →</span>
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
              <div class="glass-card p-8 space-y-5">
                <div class="flex items-center gap-3">
                  <span class="w-1 h-5 rounded-full" style="background: var(--color-bronze);" />
                  <h2 class="font-display text-xl font-semibold" style="color: var(--color-ink-1)">项目概述</h2>
                </div>
                <p class="leading-relaxed text-[0.92rem]" style="color: var(--color-ink-2)">
                  {{ project.description }}
                </p>
                <p v-if="project.longDescription" class="leading-relaxed text-sm" style="color: var(--color-ink-4)">
                  {{ project.longDescription }}
                </p>
              </div>

              <!-- Workflow pipeline card -->
              <div v-if="project.workflow && project.workflow.length" class="glass-card p-8 space-y-6">
                <div class="flex items-center gap-3">
                  <span class="w-1 h-5 rounded-full" style="background: var(--color-bronze);" />
                  <h2 class="font-display text-xl font-semibold" style="color: var(--color-ink-1)">幕后制作工作流 (Pipeline)</h2>
                </div>

                <div class="space-y-0" style="border-top: 1px solid var(--color-border);">
                  <div
                    v-for="flow in project.workflow"
                    :key="flow.title"
                    class="py-5 space-y-2"
                    style="border-bottom: 1px solid var(--color-border);"
                  >
                    <div class="flex items-center gap-3">
                      <span class="text-xl flex-shrink-0">{{ flow.icon }}</span>
                      <h3 class="font-semibold text-sm" style="color: var(--color-ink-1)">{{ flow.title }}</h3>
                    </div>
                    <p class="text-sm leading-relaxed pl-9" style="color: var(--color-ink-4)">{{ flow.desc }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Specs + CTA -->
            <div class="space-y-6">

              <!-- DI Console Specs card -->
              <div class="glass-card p-6 space-y-5 relative overflow-hidden">
                <!-- Top accent line -->
                <div class="absolute top-0 inset-x-0 h-[2px] rounded-t-[inherit]"
                     style="background: linear-gradient(90deg, transparent, var(--color-bronze), transparent)" />

                <div class="flex items-center justify-between pt-1">
                  <h2 class="font-display text-sm font-bold uppercase tracking-wider"
                      style="color: var(--color-ink-1)">后期制作技术参数</h2>
                  <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full animate-pulse" style="background: #16a34a" />
                    <span class="text-[10px] uppercase font-mono" style="color: var(--color-ink-5)">已调色</span>
                  </div>
                </div>

                <div class="space-y-0 font-mono text-xs" style="border-top: 1px solid var(--color-border);">
                  <div class="flex justify-between py-3" style="border-bottom: 1px solid var(--color-border);">
                    <span style="color: var(--color-ink-4)">后期导演 (Director)</span>
                    <span class="font-semibold" style="color: var(--color-ink-1)">{{ project.director || 'Xo' }}</span>
                  </div>
                  <div v-if="project.software?.[0]" class="flex justify-between py-3" style="border-bottom: 1px solid var(--color-border);">
                    <span style="color: var(--color-ink-4)">剪辑与包装软件</span>
                    <span class="font-semibold" style="color: var(--color-ink-1)">{{ project.software[0] }}</span>
                  </div>
                  <div v-if="project.software?.[1]" class="flex justify-between py-3" style="border-bottom: 1px solid var(--color-border);">
                    <span style="color: var(--color-ink-4)">色彩分级调色</span>
                    <span class="font-semibold" style="color: var(--color-ink-1)">{{ project.software[1] }}</span>
                  </div>
                  <div class="flex justify-between py-3" style="border-bottom: 1px solid var(--color-border);">
                    <span style="color: var(--color-ink-4)">交付格式</span>
                    <span class="font-semibold" style="color: var(--color-ink-1)">{{ project.deliverFormat || 'ProRes 422 HQ' }}</span>
                  </div>
                  <div class="flex justify-between py-3">
                    <span style="color: var(--color-ink-4)">声音编码</span>
                    <span class="font-semibold" style="color: var(--color-ink-1)">{{ project.audioFormat || '24-bit 48kHz' }}</span>
                  </div>
                </div>
              </div>

              <!-- CTA card -->
              <div class="glass-card p-6 space-y-4 overflow-hidden relative">
                <div class="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                     style="background: radial-gradient(circle, rgba(180,83,9,0.12) 0%, transparent 70%)" />
                <div class="space-y-1 relative z-10">
                  <h3 class="font-display text-base font-semibold" style="color: var(--color-ink-1)">
                    需要同类视频制作？
                  </h3>
                  <p class="text-xs leading-relaxed" style="color: var(--color-ink-4)">
                    我支持从视频分镜、后期精剪、调色降噪到动效合成的全流程定制服务。
                  </p>
                </div>
                <a :href="'mailto:' + (siteConfig?.siteInfo?.contactEmail || 'hello@xo.dev')" class="btn-primary w-full justify-center text-xs py-2.5 relative z-10">
                  发起项目咨询
                </a>
              </div>

            </div>
          </div>
        </div>
      </Transition>

      <!-- Not found state -->
      <div v-if="!project" class="text-center py-20 space-y-4 reveal">
        <p class="text-5xl">🎞️</p>
        <h1 class="font-display text-2xl font-bold" style="color: var(--color-ink-1)">未找到该作品</h1>
        <p style="color: var(--color-ink-4)">请返回作品集重新选择。</p>
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
            <h3 class="font-display font-bold text-base" style="color: var(--color-ink-1)">申请专属授权密码</h3>
            <button @click="closeRequestModal" class="text-slate-400 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="requestSuccess" class="text-center py-6 space-y-3">
            <span class="text-3xl block">📨</span>
            <h4 class="font-bold text-sm text-emerald-600">申请提交成功！</h4>
            <p class="text-xs leading-relaxed" style="color: var(--color-ink-4)">
              您的申请已成功发送至后台。主理人收到后会通过您的联系方式与您联系并提供密码。
            </p>
            <button @click="closeRequestModal" class="btn-ghost text-xs py-2 px-4 mt-2">关闭窗口</button>
          </div>

          <form v-else @submit.prevent="submitRequest" class="space-y-4">
            <p class="text-xs leading-relaxed" style="color: var(--color-ink-4)">
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
const slug = route.params.slug as string

const mainVideoRef = ref<HTMLVideoElement | null>(null)
const blurVideoRef = ref<HTMLVideoElement | null>(null)

// Fetch project list (passwords are NEVER returned — only hasPassword:boolean)
const { data: projects } = await useFetch<any[]>('/api/projects')
const project = computed(() => (projects.value || []).find(p => p.slug === slug))
const { data: siteConfig } = await useFetch<any>('/api/site-config')
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
const activeVideoUrl = computed(() => projectVideoUrls.value[activeVideoIndex.value] || '')

watch(projectVideoUrls, (urls) => {
  if (activeVideoIndex.value >= urls.length) activeVideoIndex.value = 0
})

// Check unlock status from server (uses HTTP-only cookie)
const { data: unlockStatus } = await useFetch<any>(`/api/projects/${slug}/check`)

const isUnlocked = ref(!!(unlockStatus.value?.unlocked))
const inputPassword = ref('')
const passwordError = ref<string>('')
const passwordLoading = ref(false)

// When project data loads, sync unlock state from server check result
watch(unlockStatus, async (val) => {
  if (val?.unlocked) {
    isUnlocked.value = true
    await nextTick()
    initReveal()
  }
}, { immediate: true })

const verifyPassword = async () => {
  if (!inputPassword.value.trim()) return
  passwordLoading.value = true
  passwordError.value = ''
  try {
    const res = await $fetch<any>(`/api/projects/${slug}/unlock`, {
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

const progressTrackRef = ref<HTMLElement | null>(null)
const playerContainerRef = ref<HTMLElement | null>(null)

const onVideoLoaded = () => {
  if (mainVideoRef.value) {
    duration.value = mainVideoRef.value.duration
    mainVideoRef.value.volume = volume.value
    mainVideoRef.value.muted = isMuted.value
  }
  syncBlurVideo()
}

const onTimeUpdate = () => {
  if (mainVideoRef.value && !isDraggingScrub.value) {
    currentTime.value = mainVideoRef.value.currentTime
  }
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

useHead({
  title: () => project.value ? `${project.value.title} — Xo Studio` : '作品详情 — Xo Studio',
  meta: [{ name: 'description', content: () => project.value ? project.value.description : '作品详情页' }]
})

let observer: IntersectionObserver | null = null

const initReveal = () => {
  if (!import.meta.client) return
  if (observer) observer.disconnect()
  observer = new IntersectionObserver(
    (entries) => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view') }) },
    { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
  )
  document.querySelectorAll('.reveal').forEach(el => observer?.observe(el))
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

const recordProjectClick = (targetSlug?: string) => {
  if (!import.meta.client) return
  const currentSlug = targetSlug || (route.params.slug as string) || slug
  if (!currentSlug) return

  $fetch('/api/analytics/event', {
    method: 'POST',
    body: {
      event: 'project_click',
      meta: JSON.stringify({ slug: currentSlug, title: project.value?.title || currentSlug })
    }
  }).catch(err => {
    console.warn('Analytics event error:', err)
  })
}

onMounted(async () => {
  await nextTick()
  initReveal()

  if (import.meta.client) {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)

    // Automatically record project visit on client mount
    recordProjectClick()
  }
})

watch(
  () => route.params.slug,
  (newSlug, oldSlug) => {
    if (newSlug && newSlug !== oldSlug && import.meta.client) {
      recordProjectClick(newSlug as string)
    }
  }
)

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
  if (import.meta.client) {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  }
})
</script>

<style scoped>
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
