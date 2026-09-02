import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // 测试使用 localStorage，需要浏览器环境
    environment: 'jsdom',
  },
})
