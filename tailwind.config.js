/** @type {import('tailwindcss').Config} */
export default {
  // 启用 class 模式的暗黑模式，便于根据用户喜好或系统设置手动切换
  darkMode: 'class',
  
  // 指定 Tailwind 扫描类名的文件范围
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],

  // 保证动态拼接的 grid span 类不会被 Tree-shaking 过滤掉
  safelist: [
    {
      pattern: /^(md:|lg:)?col-span-\d+$/,
    }
  ],
  
  theme: {
    extend: {
      // 12 列 Bento Grid 自适应屏幕断点微调
      screens: {
        'xs': '475px',    // 针对超小屏手机优化布局
        '3xl': '1920px',  // 针对 2K/4K 超大带看屏设计
      },
      
      colors: {
        // “液态玻璃（Liquid Glass）”半透明主题色板
        glass: {
          light: {
            bg: 'rgba(255, 255, 255, 0.45)',     // 高透白
            border: 'rgba(255, 255, 255, 0.25)', // 亮白微边框
            text: '#0f172a',                     // slate-900 亮色主文本
          },
          dark: {
            bg: 'rgba(15, 23, 42, 0.55)',         // 磨砂暗灰（基于 slate-900）
            border: 'rgba(255, 255, 255, 0.08)',  // 暗色低调微边框
            text: '#f8fafc',                      // slate-50 暗色主文本
          }
        },
        
        // 极简科幻风格主题色
        brand: {
          bg: {
            light: '#f8fafc',  // 全站亮色底色 (slate-50)
            dark: '#020617',   // 全站暗黑底色 (slate-950)
          },
          primary: '#6366f1',  // 靛蓝 (Indigo 500)
          accent: '#14b8a6',   // 湖蓝 (Teal 500)
        }
      },
      
      // 增强玻璃磨砂感（模糊半径微调）
      backdropBlur: {
        'xs': '2px',
        'glass': '20px'
      },
      
      // 液态玻璃特有的弥散投影效果
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      
      // 支持高精细度的 0.5px 超细边框
      borderWidth: {
        '0.5': '0.5px',
      }
    },
  },
  
  plugins: [],
}
