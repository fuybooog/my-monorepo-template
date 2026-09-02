import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true, // 使 describe/it/expect 等全局可用，无需导入
    setupFiles: './src/test/setup.ts', // 测试初始化文件
    css: false, // 忽略 CSS 导入（antd 需要，但测试中可关闭）
    // 与 vite.config.ts 保持一致的别名，确保测试中可解析 @ 与 workspace 包源码
    alias: {
      '@': resolve(__dirname, './src'),
      '@repo/shared': resolve(__dirname, '../../packages/shared/src/index.ts'),
      // 如果需要处理 lodash-es 等，可以添加 alias
      'lodash-es': 'lodash',
    },
    // 同时运行共享包 @repo/api 的测试
    include: ['src/**/*.{test,spec}.{ts,tsx}', '../../packages/api/src/**/*.{test,spec}.{ts,tsx}'],
  },
})
