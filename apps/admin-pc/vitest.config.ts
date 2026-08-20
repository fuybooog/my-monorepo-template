import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true, // 使 describe/it/expect 等全局可用，无需导入
    setupFiles: './src/test/setup.ts', // 测试初始化文件
    css: false, // 忽略 CSS 导入（antd 需要，但测试中可关闭）
    // 如果需要处理 lodash-es 等，可以添加 alias
    alias: {
      'lodash-es': 'lodash',
    },
  },
})
