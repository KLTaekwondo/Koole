import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 路径分隔符在 Windows 下可能是反斜杠，用 [\\/] 兼容两种写法
const at = pattern => new RegExp(`[\\\\/]${pattern}[\\\\/]`)

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    // 第三方库单独分包：体积大、更新少，命中缓存后不用跟着业务代码重下。
    // 阈值放宽到 1200 kB 是因为 ECharts 单独成块后本身就有 1.1 MB——它只在对比面板按需加载。
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          // 只手动切分「体积大 / 只在特定页面用」的库；其余交给 Rollup 按动态 import 边界自动分包，
          // 避免把按需库和首屏共享库塞进同一块，反而被首屏静态带入。
          if (at('three').test(id)) return 'vendor-three'
          if (at('echarts').test(id) || at('zrender').test(id)) return 'vendor-echarts'
          if (at('vue').test(id) || at('@vue').test(id) || at('vue-router').test(id)) return 'vendor-vue'
        },
      },
    },
  },
})
