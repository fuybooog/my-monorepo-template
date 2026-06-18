import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  optimizeDeps: {
    include: ['react-is'],
    disabled: false,
  },
  build: {
    commonjsOptions: {
      include: [/react-is/, /node_modules/],
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
