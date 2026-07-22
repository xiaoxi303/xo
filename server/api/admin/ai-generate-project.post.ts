import { defineEventHandler, readBody, createError, getCookie } from 'h3'
import { validateSession, SESSION_COOKIE } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // Authentication check (admin session only)
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) {
    throw createError({ statusCode: 401, statusMessage: '未经授权的请求。' })
  }

  const body = await readBody(event)
  const prompt = (body?.prompt || '').trim()

  if (!prompt) {
    throw createError({ statusCode: 400, statusMessage: '请输入影片名称或灵感描述。' })
  }

  const pLower = prompt.toLowerCase()

  // Clean prompt for naming
  let cleanName = prompt
    .replace(/(商业广告|概念片|宣传片|短片|MV|视频|生成|AI|纪录片|TVC|大片|作品|剪辑|调色)/gi, '')
    .trim()
  if (!cleanName) cleanName = prompt

  // Pinyin/English slug conversion helper
  let slug = prompt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  if (!slug || slug.length < 3) {
    slug = `project-${Date.now().toString(36)}`
  }

  // Detect specific software mentioned in prompt
  const detectedSoftware: string[] = []
  if (pLower.includes('即梦')) detectedSoftware.push('即梦 AI')
  if (pLower.includes('runway')) detectedSoftware.push('Runway Gen-3')
  if (pLower.includes('luma')) detectedSoftware.push('Luma Dream Machine')
  if (pLower.includes('可灵')) detectedSoftware.push('可灵 AI')
  if (pLower.includes('comfyui')) detectedSoftware.push('ComfyUI')
  if (pLower.includes('midjourney')) detectedSoftware.push('Midjourney')
  if (pLower.includes('sora')) detectedSoftware.push('Sora')
  if (pLower.includes('c4d') || pLower.includes('cinema 4d')) detectedSoftware.push('Cinema 4D')
  if (pLower.includes('ae') || pLower.includes('after effects')) detectedSoftware.push('After Effects')
  if (pLower.includes('pr') || pLower.includes('premiere')) detectedSoftware.push('Premiere Pro')
  if (pLower.includes('davinci') || pLower.includes('达芬奇')) detectedSoftware.push('DaVinci Resolve')
  if (pLower.includes('fcp') || pLower.includes('final cut')) detectedSoftware.push('FCPX')

  // Determine category & dynamic preset attributes
  let category = 'general'
  if (pLower.includes('ai') || pLower.includes('aigc') || pLower.includes('sora') || pLower.includes('runway') || pLower.includes('comfyui') || pLower.includes('即梦') || pLower.includes('生成') || pLower.includes('扩散')) {
    category = 'ai_video'
  } else if (pLower.includes('车') || pLower.includes('保时捷') || pLower.includes('奔驰') || pLower.includes('宝马') || pLower.includes('奥迪') || pLower.includes('法拉利') || pLower.includes('高奢') || pLower.includes('汽车')) {
    category = 'automotive'
  } else if (pLower.includes('广告') || pLower.includes('tvc') || pLower.includes('商业') || pLower.includes('品牌') || pLower.includes('宣传片')) {
    category = 'commercial'
  } else if (pLower.includes('电影') || pLower.includes('短片') || pLower.includes('剧情') || pLower.includes('故事') || pLower.includes('微电影')) {
    category = 'film'
  } else if (pLower.includes('mv') || pLower.includes('时尚') || pLower.includes('音乐录影带') || pLower.includes('秀场') || pLower.includes('美妆')) {
    category = 'fashion_mv'
  } else if (pLower.includes('科技') || pLower.includes('手机') || pLower.includes('数码') || pLower.includes('发布会') || pLower.includes('硬件')) {
    category = 'tech'
  } else if (pLower.includes('特效') || pLower.includes('赛博') || pLower.includes('vfx') || pLower.includes('三维') || pLower.includes('cg') || pLower.includes('科幻')) {
    category = 'cyberpunk_vfx'
  } else if (pLower.includes('纪录片') || pLower.includes('人文') || pLower.includes('纪实') || pLower.includes('旅行') || pLower.includes('风光')) {
    category = 'documentary'
  } else if (pLower.includes('live') || pLower.includes('现场') || pLower.includes('演唱会') || pLower.includes('音乐节') || pLower.includes('快剪')) {
    category = 'live_concert'
  }

  let title = `${cleanName} · 概念作品`
  let description = ''
  let longDescription = ''
  let postSpecs = ''
  let deliverFormat = ''
  let audioFormat = ''
  let software: string[] = []
  let tags: string[] = []
  let workflow: { phase: string; title: string; desc: string }[] = []

  switch (category) {
    case 'ai_video':
      title = `${cleanName} · AIGC 神经生成视觉大片`
      description = `融合 ${prompt} 核心灵感与神经网络 Latent 潜空间扩散，以 Quiet Luxury 美学重构 ${cleanName} 的先锋光影景象。`
      postSpecs = '4K 60FPS AI Upscaled'
      deliverFormat = 'ProRes 4444 / Neural Latent Color'
      audioFormat = '24-bit 96kHz Spatial Audio'
      software = Array.from(new Set([...detectedSoftware, '即梦 AI', 'Runway Gen-3', 'ComfyUI', 'DaVinci Resolve', 'After Effects']))
      tags = ['AIGC', 'AI生成视频', '扩散模型', cleanName, '神经渲染', '未来科技']
      longDescription = `### 01. AIGC 提示词蒸馏与 Latent 潜空间生成 (${cleanName})
针对《${cleanName}》的视觉内核，运用神经网络视频扩散模型（包含 ComfyUI / Runway Gen-3 / 即梦 AI），蒸馏高维意向提示词。通过运动矢量控制与种子节点锁定，生成具有微妙光影脉冲与流体质感的元素材。

### 02. DI 达芬奇超分重构与电影级调色 (Color Science & Refinement)
将 AI 生成的数字动态视频引入 DaVinci Resolve 19 达芬奇 Neural Engine 执行 4K AI 降噪与超分重构。匹配 ACES 1.3 工业级色彩管理，将 AIGC 的数字冷感转化为古典胶片般细腻肉感的高光与透亮肤色。

### 03. 空间音效设计与三维沉浸声场 (Spatial Audio Engineering)
采用 24-bit 96kHz 无损立体声与低频脉冲音效，将合成器音流与镜头跳切精准交织，赋予《${cleanName}》前所未有的科幻沉浸感与情绪张力。`
      workflow = [
        { phase: 'Phase 01', title: 'Multi-Model Prompt 提示词分镜卡位', desc: `蒸馏《${cleanName}》核心视觉提示词，建立种子节点与控制网络，生成高质感动态源素材。` },
        { phase: 'Phase 02', title: 'Neural Latent Motion 神经扩散与插帧', desc: `结合 Runway 与 Topaz Video AI 执行神经插帧与无损放大，消除 AI 画面抖动与伪影。` },
        { phase: 'Phase 03', title: 'DI 达芬奇超分重构与 4K Master 交付', desc: `引入 DaVinci ACES 色彩空间压制高光，注入真实胶片颗粒，导出 ProRes 4444 商业级母带。` }
      ]
      break

    case 'automotive':
      title = `${cleanName} · 高奢汽车概念大片`
      description = `基于 ${cleanName} 车身力学与暗金光影，以变形宽银幕镜头结合达芬奇 DI 色彩科学，锤炼极致速度与奢华美学。`
      postSpecs = '4K 60FPS Anamorphic'
      deliverFormat = 'ARRI LogC4 to Rec.709'
      audioFormat = '24-bit 96kHz 5.1 Surround'
      software = Array.from(new Set([...detectedSoftware, 'DaVinci Resolve', 'Premiere Pro', 'Cinema 4D', 'Redshift']))
      tags = ['汽车商业片', cleanName, '变形宽银幕', '暗金调色', '高光细节', '机械力学']
      longDescription = `### 01. 光影与金属车漆质感 (${cleanName})
基于 ARRI LogC4 广色域宽容度曲线，在 DaVinci DI 色彩实验室中构建专属《${cleanName}》的“玄武暗金”色调。针对车身哑光金属漆与流线型高光执行单色相精细分离，呈现沉稳奢华的视觉光彩。

### 02. 速度感卡点与镜剪节奏 (Editing Mechanics)
利用气缸爆震与引擎轰鸣的真实声轨峰值，进行毫秒级精准卡点剪辑。结合追车镜头摇移与微距镜头切割，展现《${cleanName}》车身极速跃进时的律动美感。

### 03. 三维高精光效与 CGI 合成 (3D & VFX Motion)
结合 Cinema 4D 与 Redshift 渲染器合成高质感粒子烟尘与空气动力学流线，赋予影片顶尖车企公映大片的震撼质感。`
      workflow = [
        { phase: 'Phase 01', title: 'Offline 粗剪与引擎声轨精准卡点', desc: `根据《${cleanName}》发动机震浪与音效波形卡位，奠定震撼利落的剪辑基调。` },
        { phase: 'Phase 02', title: 'DI 达芬奇暗金色调与漆面光泽重构', desc: `压制高光反射，分离车漆单色相，打造极致暗奢的玄武金质感。` },
        { phase: 'Phase 03', title: '5.1 环绕声混音与 4K ProRes 4444 交付', desc: `整合引擎原声采样与母带压限，完成全球公映级 Master 导出。` }
      ]
      break

    case 'commercial':
      title = `${cleanName} · TVC 商业概念广告`
      description = `融合 ${cleanName} 大刊级静物拍摄、极致卡点节奏与色彩科学，为品牌塑造高奢 Quiet Luxury 现代美学。`
      postSpecs = '4K 60FPS HDR'
      deliverFormat = 'ProRes 4444 XQ / Rec.709'
      audioFormat = '24-bit 48kHz Uncompressed'
      software = Array.from(new Set([...detectedSoftware, 'DaVinci Resolve', 'Premiere Pro', 'After Effects']))
      tags = ['商业广告', 'TVC', cleanName, '卡点剪辑', '高光细节', '品牌大片']
      longDescription = `### 01. 商业级品牌调性塑造 (${cleanName})
遵循现代极奢设计理念，在《${cleanName}》镜头编排上融合高帧率慢动作与快节奏镜头拼接。以静衬动，打造具有呼吸感的大刊封面视觉体验。

### 02. DI 达芬奇色彩管理 (DI Color Management)
在 Rec.709 与 HDR 两种规范间精细校准，针对产品材质、肤色透亮感进行高精度 Mask 蒙版分离，使《${cleanName}》画面高光柔润而不暴晒，暗部沉静而不失细节。

### 03. 动效包装与声音强化 (Motion & SFX)
嵌入无缝光影过渡与极简三维文字包装，配合沉浸式音效层次强化《${cleanName}》核心卖点，打造顶尖商业标杆。`
      workflow = [
        { phase: 'Phase 01', title: 'Offline 粗剪与品牌叙事搭骨架', desc: `梳理《${cleanName}》核心卖点，按商业 TVC 黄金节奏搭建镜头框架。` },
        { phase: 'Phase 02', title: 'DI 达芬奇高精肤色与产品色彩分离', desc: `精细校准产品固有色与人物肤色，呈现富贵自然的 Quiet Luxury 质感。` },
        { phase: 'Phase 03', title: '4K ProRes 4444 XQ 商业全套交付', desc: `输出包含广电级 Rec.709 与网页高清晰度版本的商业 Master 文件。` }
      ]
      break

    case 'film':
      title = `${cleanName} · 电影故事短片`
      description = `使用 DCI 4K 胶片质感与 ACES 1.3 工业色彩空间，通过《${cleanName}》镜头调度与暗部解调雕琢叙事张力。`
      postSpecs = 'DCI 4K 24FPS'
      deliverFormat = 'ProRes RAW / ACES 1.3'
      audioFormat = '24-bit 96kHz 5.1 Surround'
      software = Array.from(new Set([...detectedSoftware, 'DaVinci Resolve', 'Premiere Pro', 'Logic Pro']))
      tags = ['电影短片', cleanName, '胶片复古', 'ACES1.3', '暗部细节', '剧情叙事']
      longDescription = `### 01. 胶片模拟与 ACES 1.3 流程 (${cleanName})
采用 ACES 1.3 工业级色彩架构，精准印片模拟 Kodak 2383 胶片曲线。在保留《${cleanName}》影调肉感的同时，注入自然润泽的胶片银盐颗粒。

### 02. 叙事剪辑与情感呼吸感 (Narrative Pacing)
拒绝堆砌无意义特效，强调视线引导与角色心理状态的镜像剪辑。以留白与呼吸停顿展现《${cleanName}》沉稳而深刻的电影感。

### 03. 原声管弦配乐与声场设计 (Orchestral Score & Foley)
结合低音大提琴沉压与实录 Foley 声音，构建空间维度极其深邃的环境声场，增强戏剧沉浸感。`
      workflow = [
        { phase: 'Phase 01', title: 'Offline 叙事剪辑与戏剧张力梳理', desc: `专注于《${cleanName}》角色心理与动作线剪辑，剔除赘余镜头，奠定电影语感。` },
        { phase: 'Phase 02', title: 'ACES 1.3 色彩管理与 Kodak 胶片印片', desc: `在 ACES 空间映射 Kodak 2383 胶片发色，雕琢沉静暗部与暖调高光。` },
        { phase: 'Phase 03', title: 'DCI 4K DCP 影院级母带打包', desc: `导出符合 DCI 标准的 24FPS 影院级 DCP 压片与 5.1 环绕声母带。` }
      ]
      break

    case 'fashion_mv':
      title = `${cleanName} · 时尚主视觉 MV`
      description = `以极简冷调与富贵高光塑造 ${cleanName} 前卫视觉体验，结合激进剪辑跳切与先锋音乐卡点。`
      postSpecs = '4K 30FPS / Arri LogC4'
      deliverFormat = 'ProRes 422 HQ / DCI-P3'
      audioFormat = '24-bit 48kHz Stereo'
      software = Array.from(new Set([...detectedSoftware, 'Premiere Pro', 'DaVinci Resolve', 'After Effects']))
      tags = ['时尚MV', cleanName, '极简冷调', '跳切卡点', '先锋美学', '高光透亮']
      longDescription = `### 01. 时尚冷调美学 (${cleanName})
运用 ARRI LogC4 广色域，打磨具有冷冽高贵感的中性灰调。重点提升《${cleanName}》肤色透明感与发丝高光，呈现高定秀场般的高级沉静感。

### 02. 视听跳切与声画异步 (Match Cut & Jump Cut)
结合前卫音乐节奏采用大幅度跳切与色彩突变，通过画面错位与声画异步营造强烈的时尚视觉冲击。

### 03. 动态视觉符号与质感滤镜 (Optical Motion)
叠加变形镜头光斑、晕化高光滤镜与微粒子光效，赋予《${cleanName}》浓郁的现代艺术气息。`
      workflow = [
        { phase: 'Phase 01', title: 'Offline 快节奏跳切与先锋卡位', desc: `破坏常规叙事，以《${cleanName}》音乐强弱拍与色彩闪烁进行前卫片段堆叠。` },
        { phase: 'Phase 02', title: 'DI 达芬奇极简冷调与高光晕化', desc: `打造清冷通透的高定皮肤质感，针对服饰进行高饱和单色相调校。` },
        { phase: 'Phase 03', title: 'DCI-P3 广色域 4K HQ 交付', desc: `导出适应全网高清流媒体与时尚大屏展演的 4K ProRes 文件。` }
      ]
      break

    case 'tech':
      title = `${cleanName} · 旗舰科技发布大片`
      description = `渲染 ${cleanName} 极致工业设计之美，结合 8K 60FPS 超清规格与微米级 CGI 三维解构。`
      postSpecs = '8K 60FPS Ultra HD'
      deliverFormat = 'ProRes 4444 XQ / Rec.2020 HDR10'
      audioFormat = '24-bit 96kHz Uncompressed'
      software = Array.from(new Set([...detectedSoftware, 'Cinema 4D', 'Redshift', 'After Effects', 'DaVinci Resolve']))
      tags = ['科技发布会', cleanName, '8K超清', 'CGI三维', '工业设计', 'HDR10']
      longDescription = `### 01. 8K 超清细节与极致材质 (${cleanName})
在 8K Rec.2020 广色域下呈现《${cleanName}》微米级玻璃、阳极氧化铝与精密电路板。画质清晰锐利，光影过渡绵密真实。

### 02. 三维爆炸拆解与科技光影 (3D Explosion & VFX)
通过 Cinema 4D 动态粒子与 Raytracing 光线追踪，生动演绎内部架构与芯片计算能效。

### 03. 未来感声效与发布会大屏优化 (Tech SFX & Large Screen)
定制机械转动、高频脉冲与沉浸式低音，确保《${cleanName}》在大型发布会公映大屏上展现强悍的视听震撼。`
      workflow = [
        { phase: 'Phase 01', title: '3D 分镜预演与镜头轨迹匹配', desc: `建立《${cleanName}》CAD 模型，搭建精确摄像机运动轨道与推拉光影。` },
        { phase: 'Phase 02', title: 'Redshift 8K 渲染与 AE 复合合成', desc: `渲染光线追踪材质层与深度通道，合成辉光与科技粒子流。` },
        { phase: 'Phase 03', title: 'Rec.2020 HDR10 8K ProRes 全套输出', desc: `导出符合苹果/三星发布会及顶级电视终端展示的 8K HDR10 商业母带。` }
      ]
      break

    case 'cyberpunk_vfx':
      title = `${cleanName} · 赛博朋克 VFX 科幻短片`
      description = `高帧率慢动作与 CG 特效合成，打造 ${cleanName} 霓虹雨夜、暗影光芒与未来赛博美学。`
      postSpecs = 'DCI 4K 120FPS High-Frame'
      deliverFormat = 'OpenEXR / ACES 1.3 CG'
      audioFormat = '24-bit 96kHz 7.1 Surround'
      software = Array.from(new Set([...detectedSoftware, 'Cinema 4D', 'Octane', 'After Effects', 'DaVinci Resolve']))
      tags = ['赛博朋克', cleanName, 'VFX特效', '120FPS', 'OpenEXR', '科幻视觉']
      longDescription = `### 01. 霓虹暗影与 ACES CG 色彩 (${cleanName})
以紫青冷暖色相对比为核心，在 ACES CG 空间中混炼《${cleanName}》高动态范围霓虹辉光。湿滑路面反射与粒子全息投影错落有致。

### 02. 120FPS 升格画面与 VFX 抠像合成 (120FPS & Compositing)
运用绿幕抠像、3D 空间追踪与 OpenEXR 多通道合成，将实拍人物无缝融入赛博高空楼宇与科幻机械场景中。

### 03. 重低音重金属与环境电波 sound (Heavy Bass & Electro)
融合工业重金属与合成器浪潮，搭配电波干扰声，构建宏大而冰冷的科幻世界观。`
      workflow = [
        { phase: 'Phase 01', title: 'Matchmove 3D 空间追踪与粗剪', desc: `执行实拍镜头反求运动轨迹，对齐三维场景与机械元件。` },
        { phase: 'Phase 02', title: 'OpenEXR 多通道合成与霓虹调色', desc: `合成深度通道、漫反射与全息光斑，调校强烈冷暖色相碰撞。` },
        { phase: 'Phase 03', title: 'DCI 4K 120FPS 高帧率 Master 交付', desc: `导出极度流畅的无损科幻 Master 影视文件。` }
      ]
      break

    case 'documentary':
      title = `${cleanName} · 人文叙事纪录片`
      description = `真实自然色彩与柯达胶片发色，用温暖克制的光影记录 ${cleanName} 最打动人心的人文温度。`
      postSpecs = '4K 24FPS Film-Grain'
      deliverFormat = 'Kodak 2383 Print Emulation'
      audioFormat = '24-bit 48kHz Stereo'
      software = Array.from(new Set([...detectedSoftware, 'DaVinci Resolve', 'Premiere Pro']))
      tags = ['人文纪录片', cleanName, '自然色彩', '柯达胶片', '情绪叙事', '真实质感']
      longDescription = `### 01. 真实自然的胶片色彩 (${cleanName})
拒绝过度包饰，模拟 Kodak 自然暖质曲线。保留《${cleanName}》真实自然日光与室内温润烛光的影调层次，凸显人文温度。

### 02. 长镜头叙事与呼吸感剪辑 (Long Take & Pacing)
以长镜头捕捉人物面部微妙表情与环境细节，保留现场真实环境声，让观者在沉静中产生强烈共鸣。

### 03. 原声吉他与真实环境声混音 (Acoustic Score & Ambience)
融入木吉他弹拨与自然风声、雨声，呈现极具真实质感的人文纪录片沉浸感受。`
      workflow = [
        { phase: 'Phase 01', title: '故事线梳理与生活化镜头留白', desc: `遵循真实素材逻辑，剪辑《${cleanName}》人物对话与环境镜头，营造留白情绪。` },
        { phase: 'Phase 02', title: 'DI 达芬奇自然柯达印片模拟', desc: `调校温暖自然的自然肤色，保留环境天然影调与微细颗粒。` },
        { phase: 'Phase 03', title: '4K 24FPS 无损广播级 Master 导出', desc: `导出符合纪录片频道与国际电影节参展标准的高清文件。` }
      ]
      break

    case 'live_concert':
      title = `${cleanName} · 音乐节 Live 现场快剪`
      description = `多机位精准同步，配合灯光强频闪与台下咆哮声轨，呈现 ${cleanName} 荷尔蒙爆棚的 Live 现场。`
      postSpecs = '4K 60FPS Multi-Cam'
      deliverFormat = 'ProRes 422 HQ / Live Master'
      audioFormat = '24-bit 96kHz Multi-Track Audio'
      software = Array.from(new Set([...detectedSoftware, 'Premiere Pro', 'DaVinci Resolve', 'Logic Pro']))
      tags = ['Live现场', cleanName, '音乐节', '多机位', '强律动', '爆棚荷尔蒙']
      longDescription = `### 01. 多机位时间码同步 (${cleanName})
通过声音波形与时间码同步《${cleanName}》多路实拍机位，涵盖舞台全景、乐手特写与观众席人浪。

### 02. 爆印闪烁与强节奏剪辑 (High Rhythm & Flash)
按贝斯低音与鼓点击打毫秒级快剪，配合舞台灯光暴闪与镜头快速晃动，瞬间点燃观众肾上腺素。

### 03. 多轨现场音频母带处理 (Live Multi-Track Mix)
混响现场歌迷合唱与主唱声音，消除现场噪音，呈现媲美现场亲临感的高保真音质。`
      workflow = [
        { phase: 'Phase 01', title: '多机位同步与重音快剪', desc: `对齐《${cleanName}》所有机位时间码，配合音乐强拍进行毫秒级镜头对切。` },
        { phase: 'Phase 02', title: 'DI 达芬奇舞台灯光高光压制', desc: `压制舞台高频强光溢出，强化现场炫彩光斑与摇滚氛围。` },
        { phase: 'Phase 03', title: '24-bit 96kHz 多轨 Live Master 输出', desc: `导出具有爆棚现场还原度的 4K 60FPS 现场大片。` }
      ]
      break

    default:
      title = `${cleanName} · 概念视听作品`
      description = `针对《${cleanName}》打造的 Quiet Luxury 高奢剪辑与达芬奇 DI 色彩解构作品。`
      postSpecs = '4K 60FPS HDR'
      deliverFormat = 'ProRes 4444 XQ / Rec.709'
      audioFormat = '24-bit 48kHz Uncompressed'
      software = Array.from(new Set([...detectedSoftware, 'DaVinci Resolve', 'Premiere Pro', 'After Effects']))
      tags = ['剪辑节奏', cleanName, '达芬奇调色', '高光细节', '商业级交付']
      longDescription = `### 01. 镜头语言与节奏编排 (${cleanName})
基于《${cleanName}》的核心表达，梳理高帧率镜头与故事主线的切分卡位。

### 02. DI 达芬奇色彩科学 (Color Science)
采用工业级色彩管理，呈现通透自然的暗部细节与柔润高光。

### 03. 声音设计与交付规格 (Sound & Master)
匹配无损声轨与 ProRes 商业公映级文件，确保全平台展现顶级视听质感。`
      workflow = [
        { phase: 'Phase 01', title: 'Offline 粗剪与节奏搭建', desc: `根据《${cleanName}》背景声轨与击鼓声的峰值波形进行精确画面切割与卡位。` },
        { phase: 'Phase 02', title: 'DI 达芬奇 Log 灰片调色与匹配', desc: `运用工业色彩管理规范，完成高光压制、暗部解调与肤色分离。` },
        { phase: 'Phase 03', title: '4K Master 商业级交付与分发', desc: `合成三维包装与母带声音压限，导出 ProRes 商业公映级文件。` }
      ]
      break
  }

  return {
    success: true,
    data: {
      title,
      slug,
      description,
      longDescription,
      postSpecs,
      deliverFormat,
      audioFormat,
      software,
      tags,
      workflow
    }
  }
})
