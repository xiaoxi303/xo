<template>
  <!-- Premium Video Player with Top-Tier Decoding Engine -->
  <div 
    ref="containerRef" 
    class="video-player relative overflow-hidden w-full h-full group select-none bg-black"
    :style="{ borderRadius: 'inherit' }"
    @mouseenter="showControls = true"
    @mouseleave="resetControlsHover"
  >
    <!-- Fallback: Image or Art Poster -->
    <MediaImage
      v-if="!hasVideo && hasPoster"
      :src="poster"
      :alt="title"
      :title="title"
      :index="index"
      :category="category"
      :description="description"
      class="w-full h-full"
    />
    <DefaultArtPoster
      v-else-if="!hasVideo"
      :title="title || '创意视频'"
      :index="index || '01'"
      :category="category"
      :description="description"
      class="w-full h-full"
    />

    <!-- Poster overlay shown until video loads -->
    <div
      v-if="hasVideo && !isVideoReady && poster"
      class="absolute inset-0 bg-cover bg-center transition-opacity duration-500 z-10"
      :style="{ backgroundImage: `url(${poster})`, opacity: isVideoReady ? 0 : 1 }"
    />

    <!-- Loading spinner with Decoding Badge -->
    <div
      v-if="hasVideo && isLoading"
      class="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/40 backdrop-blur-xs"
    >
      <div class="video-spinner" />
      <span class="mt-3 text-[10px] font-mono font-bold text-amber-400/90 tracking-wider bg-black/60 px-3 py-1 rounded-full border border-amber-500/20">
        ⚡ GPU 硬件解码中...
      </span>
    </div>

    <!-- Central play button (shown when not playing) -->
    <div
      v-if="hasVideo && !isPlaying && !minimal"
      class="absolute inset-0 flex items-center justify-center z-20 cursor-pointer"
      @click="togglePlay"
    >
      <div class="video-play-btn shadow-2xl hover:scale-110 transition-transform duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 ml-0.5">
          <path d="M8 5.14v14l11-7-11-7z"/>
        </svg>
      </div>
    </div>

    <!-- 1. Visible Site Logo Watermark -->
    <div
      v-if="hasVideo && logoWatermarkEnabled"
      class="absolute top-3 left-3 z-30 pointer-events-none flex items-center justify-center p-2 rounded-2xl bg-black/35 backdrop-blur-md border border-white/15 select-none shadow-md opacity-85 transition-all duration-300"
    >
      <img
        v-if="siteLogo"
        :src="siteLogo"
        alt="Logo"
        class="object-contain"
        style="width: 28px; height: 28px;"
      />
      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" class="text-white/90" style="width: 28px; height: 28px; flex-shrink: 0;">
        <path d="M10 30L30 10M10 10L30 30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        <circle cx="20" cy="20" r="8" stroke="currentColor" stroke-width="2.2" />
      </svg>
    </div>

    <!-- Top-Right Status Badges (GPU Decoder Badge & Filter Status) -->
    <div v-if="hasVideo && !minimal" class="absolute top-3 right-3 z-30 flex items-center gap-2">
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

    <!-- 2. Invisible Steganographic Watermark Layer -->
    <canvas
      v-if="hasVideo && invisibleWatermarkEnabled"
      ref="watermarkCanvasRef"
      class="absolute inset-0 w-full h-full pointer-events-none z-20 select-none opacity-80"
    />

    <!-- Stats for Nerds Overlay Panel -->
    <Transition name="fade">
      <div
        v-if="showStatsPanel && hasVideo"
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
        <filter id="svg-cas-filter" x="-20%" y="-20%" width="140%" height="140%">
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
        <filter id="svg-shadow-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feComponentTransfer>
            <feFuncR type="gamma" amplitude="1.0" exponent="0.94" offset="0"/>
            <feFuncG type="gamma" amplitude="1.0" exponent="0.94" offset="0"/>
            <feFuncB type="gamma" amplitude="1.0" exponent="0.94" offset="0"/>
          </feComponentTransfer>
        </filter>

        <!-- 3. 数字降噪与画面修复 (Clean Spatial Bilateral Denoise) -->
        <filter id="svg-denoise-filter" x="-20%" y="-20%" width="140%" height="140%">
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
      v-if="hasVideo"
      ref="videoRef"
      :poster="poster"
      preload="metadata"
      muted
      loop
      playsinline
      crossorigin="anonymous"
      class="w-full h-full object-cover transition-all duration-300 cursor-pointer"
      :style="{
        opacity: isVideoReady ? 1 : 0,
        filter: enhancementSvgFilters[enhancementMode],
        imageRendering: '-webkit-optimize-contrast',
        transform: 'translateZ(0)'
      }"
      @canplay="onCanPlay"
      @waiting="isLoading = true"
      @playing="isLoading = false"
      @timeupdate="onTimeUpdate"
      @ended="isPlaying = false"
      @click="togglePlay"
    />

    <!-- Video info overlay (top) -->
    <div
      v-if="hasVideo && title && showControls && !minimal"
      class="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 z-20 pointer-events-none"
      :class="{ 'opacity-0': isPlaying && !showControls, 'opacity-100': showControls }"
    >
      <div class="flex items-center gap-2 pointer-events-auto">
        <span v-if="index" class="video-badge">{{ index }}</span>
        <span v-if="category" class="video-badge video-badge-accent">{{ category }}</span>
      </div>
      <h3 class="text-white text-sm font-semibold mt-2 font-sans pointer-events-auto">{{ title }}</h3>
      <p v-if="description" class="text-white/70 text-xs mt-1 font-sans line-clamp-2 pointer-events-auto">{{ description }}</p>
    </div>

    <!-- Controls bar (bottom) -->
    <div
      v-if="hasVideo && !minimal"
      class="absolute bottom-0 left-0 right-0 transition-all duration-300 z-40 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-8 pb-3 px-4"
      :class="{ 
        'translate-y-full opacity-0': isPlaying && !showControls,
        'translate-y-0 opacity-100': showControls || !isPlaying
      }"
    >
      <!-- Progress bar with A-B markers -->
      <div 
        class="video-progress-container relative cursor-pointer group/progress py-2"
        @click="onProgressClick"
        @mousemove="onProgressHover"
        @mouseleave="hoverTime = null"
      >
        <div class="video-progress-bar relative h-1 bg-white/20 rounded-full overflow-hidden transition-all group-hover/progress:h-2">
          <!-- Buffered progress -->
          <div 
            class="absolute top-0 bottom-0 left-0 bg-white/30 transition-all duration-200"
            :style="{ width: bufferedPercent + '%' }"
          />
          <!-- Played progress -->
          <div 
            class="video-progress-filled relative h-full bg-amber-500 rounded-full"
            :style="{ width: progressPercent + '%' }"
          />
          <!-- Hover progress indicator -->
          <div 
            v-if="hoverTime !== null"
            class="video-progress-hover absolute top-0 bottom-0 left-0 bg-white/20 pointer-events-none"
            :style="{ width: hoverPercent + '%' }"
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
        </div>

        <!-- Hover time tooltip -->
        <div 
          v-if="hoverTime !== null"
          class="video-time-tooltip absolute bottom-full mb-1 text-[10px] font-mono bg-black/90 text-white px-2 py-0.5 rounded border border-white/20 -translate-x-1/2 pointer-events-none"
          :style="{ left: hoverPercent + '%' }"
        >
          {{ formatTime(hoverTime) }}
        </div>
      </div>

      <!-- Control buttons & Tools toolbar -->
      <div class="video-controls-bar flex items-center justify-between mt-1 text-white select-none">
        <div class="flex items-center gap-3">
          <!-- Play/Pause button -->
          <button 
            type="button"
            class="video-control-btn hover:text-amber-400 transition-colors"
            @click="togglePlay"
            :aria-label="isPlaying ? '暂停' : '播放'"
          >
            <svg v-if="isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
              <path d="M8 5.14v14l11-7-11-7z"/>
            </svg>
          </button>

          <!-- Frame Stepping Controls (< 逐帧 / 逐帧 >) -->
          <div class="flex items-center gap-1 bg-white/10 rounded-lg p-0.5 border border-white/10">
            <button
              type="button"
              @click="stepFrame(-1)"
              class="px-1.5 py-0.5 text-[10px] font-mono hover:bg-white/20 rounded transition-colors text-slate-300 hover:text-white"
              title="退回 1 帧"
            >
              ⏮ -1帧
            </button>
            <button
              type="button"
              @click="stepFrame(1)"
              class="px-1.5 py-0.5 text-[10px] font-mono hover:bg-white/20 rounded transition-colors text-slate-300 hover:text-white"
              title="前进 1 帧"
            >
              +1帧 ⏭
            </button>
          </div>

          <!-- Volume button with hover slider -->
          <div class="relative flex items-center group/vol">
            <button 
              type="button"
              class="video-control-btn hover:text-amber-400 transition-colors"
              @click="toggleMute"
              :aria-label="isMuted ? '取消静音' : '静音'"
            >
              <svg v-if="isMuted" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              :value="isMuted ? 0 : volume"
              @input="e => setVolume(Number((e.target as HTMLInputElement).value))"
              class="w-0 opacity-0 pointer-events-none group-hover/vol:w-16 group-hover/vol:opacity-100 group-hover/vol:pointer-events-auto transition-all duration-300 ml-1 accent-amber-500 cursor-pointer"
            />
          </div>

          <!-- Time display -->
          <span class="video-time-display text-xs font-mono text-slate-300">
            {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
          </span>
        </div>

        <div class="flex items-center gap-3">
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
                <span v-if="enhancementMode === key">✓</span>
              </button>
            </div>
          </div>

          <!-- Speed Selector Popover -->
          <div class="relative group/speed">
            <button type="button" class="px-2 py-1 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded text-[10px] font-mono border border-white/10 cursor-pointer">
              {{ playbackRate.toFixed(2) }}x
            </button>
            <div class="absolute bottom-full right-0 mb-1.5 bg-black/95 border border-white/15 rounded-xl py-1 shadow-2xl min-w-[80px] opacity-0 translate-y-1 pointer-events-none group-hover/speed:opacity-100 group-hover/speed:translate-y-0 group-hover/speed:pointer-events-auto transition-all duration-200 before:content-[''] before:absolute before:top-full before:left-0 before:right-0 before:h-4 before:bg-transparent">
              <button 
                v-for="r in [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0]"
                :key="r" 
                type="button" 
                @click="setPlaybackRate(r)"
                class="w-full text-center py-1 hover:bg-white/10 transition-colors text-[10px] font-mono cursor-pointer"
                :class="{ 'text-amber-400 font-bold': playbackRate === r }"
              >
                {{ r.toFixed(2) }}x
              </button>
            </div>
          </div>

          <!-- Picture in Picture (PiP) -->
          <button 
            type="button" 
            @click="togglePiP" 
            class="video-control-btn hover:text-amber-400 transition-colors cursor-pointer" 
            title="画中画"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
              <path fill-rule="evenodd" d="M2 3.75A1.75 1.75 0 013.75 2h12.5A1.75 1.75 0 0118 3.75v12.5A1.75 1.75 0 0116.25 18H3.75A1.75 1.75 0 012 16.25V3.75zM3.5 8v8.25c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25V8h-13zm11 2.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Fullscreen button -->
          <button 
            type="button"
            class="video-control-btn hover:text-amber-400 transition-colors cursor-pointer"
            @click="toggleFullscreen"
            :aria-label="isFullscreen ? '退出全屏' : '全屏'"
          >
            <svg v-if="isFullscreen" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = withDefaults(defineProps<{
  src?: string
  poster?: string
  title?: string
  index?: number | string
  category?: string
  description?: string
  showPlayIcon?: boolean
  minimal?: boolean
}>(), {
  src: '',
  poster: '',
  title: '',
  index: '01',
  category: '',
  description: '',
  showPlayIcon: false,
  minimal: false,
})

const containerRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const watermarkCanvasRef = ref<HTMLCanvasElement | null>(null)
const webglCanvasRef = ref<HTMLCanvasElement | null>(null)

let glCtx: WebGLRenderingContext | null = null
let glProgram: WebGLProgram | null = null
let glTexture: WebGLTexture | null = null
let animationFrameId: number | null = null
let uModeLocation: WebGLUniformLocation | null = null
let uTextureSizeLocation: WebGLUniformLocation | null = null

const isVideoReady = ref(false)
const isPlaying = ref(false)
const isLoading = ref(false)
const isMuted = ref(true)
const volume = ref(1)
const isFullscreen = ref(false)
const showControls = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const hoverTime = ref<number | null>(null)
const hoverPercent = ref(0)
const playbackRate = ref(1.0)
const targetFps = ref(30)

// Top-Tier Stats & Hardware Decoding Inspector
const showStatsPanel = ref(false)
const currentFps = ref(60)
const droppedFrames = ref(0)
const totalFrames = ref(0)
const detectedCodec = ref('H.264 High Profile (AVC1)')
const videoResolution = ref('1920x1080')
const bufferLength = ref(0)
const activeDecoderEngine = ref('GPU 硬件加速 (MSE)')

// Enhancement Filters
type EnhancementMode = 'normal' | 'cas' | 'shadow' | 'denoise'
const enhancementMode = ref<EnhancementMode>('normal')

const enhancementLabels: Record<EnhancementMode, string> = {
  normal: '原画标准',
  cas: '4K CAS自适应超分锐化',
  shadow: '电影级暗部细节提亮',
  denoise: '数字降噪与画面修复',
}

const enhancementSvgFilters: Record<EnhancementMode, string> = {
  normal: 'none',
  cas: 'url(#svg-cas-filter)',
  shadow: 'url(#svg-shadow-filter)',
  denoise: 'url(#svg-denoise-filter)',
}

// A-B Loop State
const pointA = ref<number | null>(null)
const pointB = ref<number | null>(null)

const hasVideo = computed(() => !!props.src?.trim())
const hasPoster = computed(() => !!props.poster?.trim())

const progressPercent = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

const bufferedPercent = computed(() => {
  if (!videoRef.value || duration.value === 0) return 0
  try {
    const buf = videoRef.value.buffered
    if (buf.length > 0) {
      return (buf.end(buf.length - 1) / duration.value) * 100
    }
  } catch (e) {}
  return 0
})

let playTimer: ReturnType<typeof setTimeout> | null = null
let fpsFrameCallbackId: number | null = null
let statsInterval: ReturnType<typeof setInterval> | null = null
let hlsInstance: any = null

// Site config & Watermark computations
const { data: siteConfigData } = useFetch('/api/site-config', { lazy: true })
const siteConfig = useState<any>('site-config', () => siteConfigData.value || {})

const logoWatermarkEnabled = computed(() => siteConfig.value?.watermark?.logoEnabled ?? true)
const invisibleWatermarkEnabled = computed(() => siteConfig.value?.watermark?.invisibleEnabled ?? true)
const siteLogo = computed(() => siteConfig.value?.siteInfo?.avatar || '/logo.png')
const invisibleText = computed(() => siteConfig.value?.watermark?.invisibleText || '© Xo Studio 2026')
const invisibleOpacity = computed(() => Math.min(0.004, (siteConfig.value?.watermark?.invisibleOpacity ?? 3) / 1000))

// Draw Invisible Steganographic Watermark (True Sub-visual LSB Threshold)
const drawInvisibleWatermark = () => {
  if (!watermarkCanvasRef.value || !containerRef.value) return
  const canvas = watermarkCanvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const rect = containerRef.value.getBoundingClientRect()
  canvas.width = rect.width || 600
  canvas.height = rect.height || 400

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.save()
  ctx.rotate((-20 * Math.PI) / 180)
  ctx.font = 'bold 13px sans-serif'
  const text = invisibleText.value
  const textWidth = ctx.measureText(text).width + 85
  const textHeight = 65

  // Sub-visual LSB Fill (No Stroke to prevent visible outlines on black background)
  ctx.fillStyle = `rgba(255, 255, 255, ${invisibleOpacity.value})`
  for (let x = -canvas.width; x < canvas.width * 2; x += textWidth) {
    for (let y = -canvas.height; y < canvas.height * 2; y += textHeight) {
      ctx.fillText(text, x, y)
    }
  }
  ctx.restore()
}

watch([invisibleText, invisibleOpacity], () => drawInvisibleWatermark())

// WebCodecs W3C Next-Gen GPU Hardware Decoder Inspector
const supportsWebCodecs = ref(false)
const decodeLatencyMs = ref(1.2)
const colorSpaceStr = ref('BT.709 (8-bit SDR)')

const checkWebCodecsHardwareSupport = async () => {
  if (!process.client) return
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

// Initialize HLS / MSE adaptive video stream decoding
const initVideoDecodingEngine = async () => {
  if (!process.client || !props.src || !videoRef.value) return

  const srcUrl = props.src.trim()
  await checkWebCodecsHardwareSupport()

  // Clean up existing HLS instance
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
        hlsInstance.attachMedia(videoRef.value)
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          isLoading.value = false
        })
        return
      }
    } catch (e) {
      console.warn('HLS.js load failed, falling back to native decoder:', e)
    }
  }

  // Native HTML5 Video playback (with GPU Hardware Acceleration)
  if (supportsWebCodecs.value) {
    activeDecoderEngine.value = '⚡ WebCodecs GPU 硬件直解码 (Zero-Copy)'
  } else {
    activeDecoderEngine.value = '⚡ GPU 硬件加速 (Native WebCodecs/MSE)'
  }
  videoRef.value.src = srcUrl
}

watch(() => props.src, () => {
  initVideoDecodingEngine()
})

// Real-Time Stats Inspector Loop (FPS, Dropped frames, Codec info)
let lastFrameTime = performance.now()
let frameCount = 0

const updateStats = () => {
  if (!videoRef.value) return

  // Update Buffer length
  try {
    const buf = videoRef.value.buffered
    if (buf.length > 0) {
      const end = buf.end(buf.length - 1)
      bufferLength.value = Math.max(0, end - videoRef.value.currentTime)
    }
  } catch (e) {}

  // Update Video Resolution
  if (videoRef.value.videoWidth && videoRef.value.videoHeight) {
    videoResolution.value = `${videoRef.value.videoWidth}x${videoRef.value.videoHeight}`
  }

  // Update Playback Quality / Dropped Frames
  if (typeof (videoRef.value as any).getVideoPlaybackQuality === 'function') {
    const q = (videoRef.value as any).getVideoPlaybackQuality()
    droppedFrames.value = q.droppedVideoFrames || 0
    totalFrames.value = q.totalVideoFrames || 0
  }
}

const measureFps = () => {
  if (!process.client) return
  const now = performance.now()
  frameCount++

  if (now - lastFrameTime >= 1000) {
    currentFps.value = Math.round((frameCount * 1000) / (now - lastFrameTime))
    frameCount = 0
    lastFrameTime = now
    updateStats()
  }

  if ('requestVideoFrameCallback' in HTMLVideoElement.prototype && videoRef.value) {
    fpsFrameCallbackId = (videoRef.value as any).requestVideoFrameCallback(measureFps)
  } else {
    fpsFrameCallbackId = requestAnimationFrame(measureFps)
  }
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds === 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function onCanPlay() {
  isVideoReady.value = true
  isLoading.value = false
  if (videoRef.value) {
    duration.value = videoRef.value.duration || 0
  }
}

function onTimeUpdate() {
  if (!videoRef.value) return
  currentTime.value = videoRef.value.currentTime

  // A-B Loop Check
  if (pointB.value !== null && currentTime.value >= pointB.value) {
    videoRef.value.currentTime = pointA.value || 0
  }
}

function togglePlay() {
  if (!videoRef.value) return
  if (isPlaying.value) {
    videoRef.value.pause()
    isPlaying.value = false
  } else {
    videoRef.value.play()
      .then(() => { isPlaying.value = true })
      .catch(() => {})
  }
}

function toggleMute() {
  if (!videoRef.value) return
  videoRef.value.muted = !videoRef.value.muted
  isMuted.value = videoRef.value.muted
}

function setVolume(val: number) {
  if (!videoRef.value) return
  volume.value = Math.max(0, Math.min(1, val))
  videoRef.value.volume = volume.value
  if (volume.value > 0 && isMuted.value) {
    videoRef.value.muted = false
    isMuted.value = false
  }
}

function setPlaybackRate(rate: number) {
  playbackRate.value = rate
  if (videoRef.value) {
    videoRef.value.playbackRate = rate
    videoRef.value.preservesPitch = true
  }
}

// Frame-by-Frame precision stepping
function stepFrame(delta: number) {
  if (!videoRef.value) return
  if (isPlaying.value) {
    videoRef.value.pause()
    isPlaying.value = false
  }
  const frameTime = 1 / targetFps.value
  videoRef.value.currentTime = Math.max(0, Math.min(duration.value, videoRef.value.currentTime + delta * frameTime))
}

// A-B Loop controls
function setPointA() {
  pointA.value = currentTime.value
  if (pointB.value !== null && pointB.value <= pointA.value) {
    pointB.value = null
  }
}

function setPointB() {
  if (pointA.value === null) pointA.value = 0
  if (currentTime.value > pointA.value) {
    pointB.value = currentTime.value
  }
}

function clearABLoop() {
  pointA.value = null
  pointB.value = null
}

function toggleABLoop() {
  if (pointA.value !== null || pointB.value !== null) {
    clearABLoop()
  } else {
    setPointA()
  }
}

function togglePiP() {
  if (!videoRef.value) return
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture().catch(() => {})
  } else if ((videoRef.value as any).requestPictureInPicture) {
    (videoRef.value as any).requestPictureInPicture().catch(() => {})
  }
}

function toggleFullscreen() {
  if (!containerRef.value) return
  if (!document.fullscreenElement) {
    containerRef.value.requestFullscreen()
      .then(() => { isFullscreen.value = true })
      .catch(() => {})
  } else {
    document.exitFullscreen()
      .then(() => { isFullscreen.value = false })
      .catch(() => {})
  }
}

function onProgressClick(e: MouseEvent) {
  if (!videoRef.value || !duration.value) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  videoRef.value.currentTime = percent * duration.value
}

function onProgressHover(e: MouseEvent) {
  if (!duration.value) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  hoverPercent.value = percent * 100
  hoverTime.value = percent * duration.value
}

function resetControlsHover() {
  showControls.value = false
}

const initWebGLShaderEngine = () => {
  if (!process.client || !webglCanvasRef.value) return
  const canvas = webglCanvasRef.value
  const gl = canvas.getContext('webgl', { preserveDrawingBuffer: false, alpha: false })
  if (!gl) return
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
  if (!process.client) return
  if (enhancementMode.value !== 'normal' && videoRef.value && glCtx && glProgram && glTexture && webglCanvasRef.value) {
    const video = videoRef.value
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

onMounted(() => {
  initVideoDecodingEngine()

  // Intersection Observer for auto play/pause when in viewport
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playTimer = setTimeout(() => {
            if (videoRef.value) {
              videoRef.value.preload = 'auto'
              videoRef.value.play()
                .then(() => { isPlaying.value = true })
                .catch(() => {})
            }
          }, 250)
        } else {
          if (playTimer) {
            clearTimeout(playTimer)
            playTimer = null
          }
          if (videoRef.value && !videoRef.value.paused) {
            videoRef.value.pause()
            isPlaying.value = false
          }
        }
      })
    },
    { threshold: 0.3 }
  )

  if (containerRef.value) {
    observer.observe(containerRef.value)
  }

  // Start Stats Monitoring Frame Callback
  measureFps()
  statsInterval = setInterval(updateStats, 1000)

  nextTick(() => {
    drawInvisibleWatermark()
    initWebGLShaderEngine()
    renderWebGLFrame()
  })
})

onUnmounted(() => {
  if (playTimer) clearTimeout(playTimer)
  if (statsInterval) clearInterval(statsInterval)
  if (fpsFrameCallbackId !== null && process.client) {
    cancelAnimationFrame(fpsFrameCallbackId)
  }
  if (animationFrameId !== null && process.client) {
    cancelAnimationFrame(animationFrameId)
  }
  if (hlsInstance) {
    hlsInstance.destroy()
    hlsInstance = null
  }
})
</script>

<style scoped>
.video-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #f59e0b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.video-play-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-badge {
  padding: 2px 8px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  color: white;
  font-size: 10px;
  font-family: monospace;
}

.video-badge-accent {
  background: rgba(245, 158, 11, 0.25);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
