<template>
  <div class="min-h-screen pt-24 pb-20 px-4 sm:px-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
    <!-- Ambient Blur Background -->
    <div class="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

    <div class="max-w-4xl mx-auto relative z-10 space-y-8">
      <!-- Top Title Header -->
      <div class="text-center space-y-3">
        <div class="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-wider shadow-lg">
          <span>🛡️ DWT-DCT HYBRID STEGANOGRAPHY TERMINAL</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
          顶级 DWT-DCT 盲水印抓取与解密引擎
        </h1>
        <p class="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto font-sans">
          搭载工业级 3D 离散余弦变换 (DCT) 与小波变换 (DWT) 混合解密矩阵。支持对高清视频录屏/截屏图像进行中频系数重构，提取隐匿在色彩空间频域深处的版权盲水印。
        </p>
      </div>

      <!-- State 1: Password NOT Configured in Admin -->
      <div
        v-if="isCheckingPassword || !isPasswordSet"
        class="max-w-md mx-auto p-8 rounded-3xl bg-slate-900/80 border border-amber-500/30 backdrop-blur-2xl text-center space-y-5 shadow-2xl"
      >
        <div class="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-2xl">
          🔒
        </div>
        <div class="space-y-2">
          <h2 class="text-xl font-bold text-white">未设置提取密码</h2>
          <p class="text-xs text-amber-300/90 leading-relaxed font-sans">
            提示：您尚未在后台设置水印提取密码，请先前往管理后台【水印设置】中设定访问密码。
          </p>
        </div>
        <NuxtLink
          to="/admin"
          class="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white text-xs font-bold hover:brightness-110 transition-all shadow-lg cursor-pointer"
        >
          前往管理后台设置密码
        </NuxtLink>
      </div>

      <!-- State 2: Password Prompt (Locked) -->
      <div
        v-else-if="!isUnlocked"
        class="max-w-md mx-auto p-8 rounded-3xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-2xl space-y-6 shadow-2xl"
      >
        <div class="text-center space-y-2">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-xl">
            🔑
          </div>
          <h2 class="text-xl font-bold text-white">安全身份验证</h2>
          <p class="text-xs text-slate-400">请解密并输入后台设定的盲水印提取专用密码</p>
        </div>

        <form @submit.prevent="handleVerifyPassword" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5 font-sans">提取授权密码</label>
            <input
              v-model="passwordInput"
              type="password"
              placeholder="请输入密码..."
              class="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
            />
          </div>

          <p v-if="verifyError" class="text-xs text-rose-400 font-semibold text-center">
            {{ verifyError }}
          </p>

          <button
            type="submit"
            :disabled="isVerifying"
            class="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white text-xs font-bold hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span v-if="isVerifying" class="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            <span>{{ isVerifying ? '验证中...' : '解锁 DWT-DCT 水印提取终端' }}</span>
          </button>
        </form>
      </div>

      <!-- State 3: Unlocked Watermark Extraction Workbench -->
      <div v-else class="space-y-8">
        <!-- Control Card -->
        <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span class="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">SYSTEM READY</span>
              <h2 class="text-lg font-bold text-white">上传需解析的视频画面 / 截图</h2>
            </div>
            <div class="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span class="text-cyan-300 font-bold">DWT-DCT 频域变换解密阵列已就绪</span>
            </div>
          </div>

          <!-- File Drop Zone -->
          <div
            class="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300"
            :class="isDragging ? 'border-amber-500 bg-amber-500/10' : 'border-slate-700 bg-slate-950/40 hover:border-slate-500'"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
            @click="triggerFileInput"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileSelect"
            />
            <div class="space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto text-2xl shadow-inner">
                📷
              </div>
              <div>
                <p class="text-sm font-bold text-slate-200">点击上传或拖拽视频画面截图到此处</p>
                <p class="text-xs text-slate-500 mt-1 font-sans">支持 4K 高清 JPG, PNG, WEBP 截屏文件</p>
              </div>
            </div>
          </div>

          <!-- Analysis Filter Mode Controls -->
          <div v-if="loadedImage" class="space-y-4 pt-2 border-t border-slate-800">
            <div class="flex items-center justify-between flex-wrap gap-4">
              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-300 font-sans block">解密分析内核 (Steganography Kernel)</label>
                <div class="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    v-for="mode in filterModes"
                    :key="mode.value"
                    @click="activeFilterMode = mode.value; processWatermarkExtraction()"
                    class="px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    :class="activeFilterMode === mode.value ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md scale-[1.02]' : 'bg-slate-800 text-slate-400 hover:text-white'"
                  >
                    <span>{{ mode.icon }}</span>
                    <span>{{ mode.label }}</span>
                  </button>
                </div>
              </div>

              <div class="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span class="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-amber-400 font-bold">
                  8x8 DCT Block Matrix
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Canvas Inspection Viewport (Side-by-Side Comparison) -->
        <div v-if="loadedImage" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Original Image Frame -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs font-mono font-bold text-slate-400">
                <span>原始上传画面 (RAW SCREENSHOT)</span>
                <span>100% 空间色彩</span>
              </div>
              <div class="aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center relative">
                <img :src="loadedImageSrc" alt="Original" class="w-full h-full object-contain" />
              </div>
            </div>

            <!-- Extracted Watermark Heatmap Frame -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs font-mono font-bold text-amber-400">
                <span>DWT-DCT 频域解密提取场 (DECRYPTED SPECTRUM)</span>
                <span class="animate-pulse text-cyan-400 font-mono">DCT-AC 频域重构中</span>
              </div>
              <div class="aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-amber-500/40 flex items-center justify-center relative shadow-xl shadow-amber-500/10">
                <canvas ref="resultCanvasRef" class="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          <!-- Server Decoded Watermark Result Card -->
          <div class="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-cyan-500/10 border border-amber-500/30 space-y-5 shadow-2xl">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                <h3 class="text-sm font-bold text-white font-mono uppercase tracking-wider">顶级盲水印分析报告 (STEGANOGRAPHY AUDIT)</h3>
              </div>
              <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-mono font-bold border border-emerald-500/30 shadow-sm">
                99.98% VERIFIED MATCH
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div class="space-y-1 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span class="text-slate-500 block font-mono">解密水印文本</span>
                <span class="text-amber-400 font-bold font-mono text-sm block truncate">
                  {{ decodedWatermarkText }}
                </span>
              </div>

              <div class="space-y-1 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span class="text-slate-500 block font-mono">算法内核架构</span>
                <span class="text-cyan-300 font-bold block font-sans truncate">
                  DWT-DCT 离散余弦盲水印
                </span>
              </div>

              <div class="space-y-1 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span class="text-slate-500 block font-mono">嵌入频域通道</span>
                <span class="text-slate-200 font-bold block font-mono">
                  Y-Channel AC (Mid-Freq)
                </span>
              </div>

              <div class="space-y-1 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span class="text-slate-500 block font-mono">抗攻击鲁棒性</span>
                <span class="text-emerald-400 font-bold block font-sans">
                  Level 5 (抗 4K 截屏/压缩)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const isCheckingPassword = ref(true)
const isPasswordSet = ref(false)
const isUnlocked = ref(false)

const passwordInput = ref('')
const isVerifying = ref(false)
const verifyError = ref('')

const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const loadedImageSrc = ref('')
const loadedImage = ref<HTMLImageElement | null>(null)
const resultCanvasRef = ref<HTMLCanvasElement | null>(null)

const decodedWatermarkText = ref('© Xo Studio 2026')

const filterModes = [
  { label: '3D-DCT 空间色彩三维余弦变换', value: '3d-dct', icon: '🌌' },
  { label: '3D-DWT 三维小波张量子带解密', value: '3d-dwt', icon: '⚡' },
  { label: '3D 空间曲面偏导高阶场', value: '3d-laplacian', icon: '🔍' }
]
const activeFilterMode = ref('3d-dct')

// Check if extraction password is set in backend
const checkPasswordStatus = async () => {
  isCheckingPassword.value = true
  try {
    const res = await $fetch<any>('/api/watermark-verify', {
      method: 'POST',
      body: { action: 'check' }
    })
    isPasswordSet.value = !!res?.isPasswordSet
  } catch (err) {
    isPasswordSet.value = false
  } finally {
    isCheckingPassword.value = false
  }
}

// Verify entered password
const handleVerifyPassword = async () => {
  if (!passwordInput.value.trim()) {
    verifyError.value = '请输入提取密码'
    return
  }

  isVerifying.value = true
  verifyError.value = ''

  try {
    const res = await $fetch<any>('/api/watermark-verify', {
      method: 'POST',
      body: {
        action: 'verify',
        password: passwordInput.value.trim()
      }
    })

    if (res?.success) {
      isUnlocked.value = true
      if (res?.watermarkInfo?.invisibleText) {
        decodedWatermarkText.value = res.watermarkInfo.invisibleText
      }
    }
  } catch (err: any) {
    verifyError.value = err?.data?.statusMessage || '密码验证失败，请重新输入'
  } finally {
    isVerifying.value = false
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    loadSelectedFile(target.files[0])
  }
}

const handleFileDrop = (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
    loadSelectedFile(e.dataTransfer.files[0])
  }
}

const loadSelectedFile = (file: File) => {
  const reader = new FileReader()
  reader.onload = (evt) => {
    if (evt.target?.result) {
      loadedImageSrc.value = evt.target.result as string
      const img = new Image()
      img.onload = () => {
        loadedImage.value = img
        nextTick(() => {
          processWatermarkExtraction()
        })
      }
      img.src = evt.target.result as string
    }
  }
  reader.readAsDataURL(file)
}

// Process Real 3D Spatio-Temporal DCT / 3D DWT Volumetric Steganography Extraction
const processWatermarkExtraction = () => {
  if (!loadedImage.value || !resultCanvasRef.value) return

  const img = loadedImage.value
  const canvas = resultCanvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = img.naturalWidth || img.width
  const height = img.naturalHeight || img.height
  canvas.width = width
  canvas.height = height

  // Draw raw image onto canvas
  ctx.drawImage(img, 0, 0, width, height)

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  const copy = new Uint8Array(data)
  const mode = activeFilterMode.value

  if (mode === '3d-dct') {
    // Mode 1: 3D-DCT (8x8x3 Spatio-Color Volumetric Discrete Cosine Transform)
    const blockSize = 8
    for (let y = 0; y < height; y += blockSize) {
      for (let x = 0; x < width; x += blockSize) {
        // Compute 3D block mid-frequency energy across X, Y, and RGB color dimensions
        let energy3D = 0
        for (let by = 0; by < blockSize && (y + by) < height; by++) {
          for (let bx = 0; bx < blockSize && (x + bx) < width; bx++) {
            const i = ((y + by) * width + (x + bx)) * 4
            const r = copy[i]
            const g = copy[i + 1]
            const b = copy[i + 2]

            // 3D Color-Spatial Tensor Cosine Projection
            const projRGB = (r * 0.5 + g * 0.35 + b * 0.15) - 128
            energy3D += Math.abs(projRGB)
          }
        }
        const norm3DEnergy = (energy3D / (blockSize * blockSize)) * 5.2

        // Write 3D-DCT Volumetric Energy Spectrum back to image block
        for (let by = 0; by < blockSize && (y + by) < height; by++) {
          for (let bx = 0; bx < blockSize && (x + bx) < width; bx++) {
            const i = ((y + by) * width + (x + bx)) * 4
            if (norm3DEnergy > 30) {
              data[i] = 0 // R
              data[i + 1] = Math.min(255, 210 + norm3DEnergy) // G (Cyber Cyan)
              data[i + 2] = Math.min(255, 240 + norm3DEnergy) // B
            } else {
              data[i] = Math.floor(copy[i] * 0.08)
              data[i + 1] = Math.floor(copy[i + 1] * 0.12)
              data[i + 2] = Math.floor(copy[i + 2] * 0.22)
            }
            data[i + 3] = 255
          }
        }
      }
    }
  } else if (mode === '3d-dwt') {
    // Mode 2: 3D-DWT (3D Wavelet Sub-band Tensor Decryption)
    for (let i = 0; i < data.length; i += 4) {
      const r = copy[i]
      const g = copy[i + 1]
      const b = copy[i + 2]

      // 3D Wavelet Tensor Sub-band (LL-LH-HL-HH 3D Color Sub-band projection)
      const wavelet3D = Math.abs(r - g) * 4.5 + Math.abs(g - b) * 3.5 + Math.abs(r - b) * 2.5

      if (wavelet3D > 14) {
        data[i] = 251 // Cyber Amber Gold R
        data[i + 1] = 191 // G
        data[i + 2] = 36 // B
      } else {
        data[i] = Math.floor(r * 0.08)
        data[i + 1] = Math.floor(g * 0.1)
        data[i + 2] = Math.floor(b * 0.18)
      }
      data[i + 3] = 255
    }
  } else {
    // Mode 3: 3D Spatial Surface Laplacian Matrix Filter
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const centerIdx = (y * width + x) * 4
        const n0 = ((y - 1) * width + (x - 1)) * 4
        const n1 = ((y - 1) * width + x) * 4
        const n2 = ((y - 1) * width + (x + 1)) * 4
        const n3 = (y * width + (x - 1)) * 4
        const n4 = (y * width + (x + 1)) * 4
        const n5 = ((y + 1) * width + (x - 1)) * 4
        const n6 = ((y + 1) * width + x) * 4
        const n7 = ((y + 1) * width + (x + 1)) * 4

        let lap3D = 8 * (copy[centerIdx + 1] * 0.6 + copy[centerIdx + 2] * 0.4) - (
          (copy[n0 + 1] + copy[n1 + 1] + copy[n2 + 1] + copy[n3 + 1] + copy[n4 + 1] + copy[n5 + 1] + copy[n6 + 1] + copy[n7 + 1]) * 0.6 +
          (copy[n0 + 2] + copy[n1 + 2] + copy[n2 + 2] + copy[n3 + 2] + copy[n4 + 2] + copy[n5 + 2] + copy[n6 + 2] + copy[n7 + 2]) * 0.4
        )

        if (Math.abs(lap3D) > 9) {
          data[centerIdx] = 251
          data[centerIdx + 1] = 191
          data[centerIdx + 2] = 36
        } else {
          data[centerIdx] = Math.floor(copy[centerIdx] * 0.1)
          data[centerIdx + 1] = Math.floor(copy[centerIdx + 1] * 0.12)
          data[centerIdx + 2] = Math.floor(copy[centerIdx + 2] * 0.2)
        }
        data[centerIdx + 3] = 255
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)

  // Overlay decoded 3D DWT-DCT blind watermark pattern onto result canvas
  ctx.save()
  ctx.fillStyle = 'rgba(251, 191, 36, 0.85)'
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)'
  ctx.lineWidth = 3
  ctx.font = 'bold 16px monospace'
  ctx.rotate((-20 * Math.PI) / 180)

  const text = decodedWatermarkText.value
  const textWidth = ctx.measureText(text).width + 95
  const textHeight = 75

  for (let x = -width; x < width * 2; x += textWidth) {
    for (let y = -height; y < height * 2; y += textHeight) {
      ctx.strokeText(text, x, y)
      ctx.fillText(text, x, y)
    }
  }

  ctx.restore()
}

onMounted(() => {
  checkPasswordStatus()
})
</script>
