import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // host: '0.0.0.0' —— 监听所有网卡，允许局域网/手机通过 http://<本机IP>:5173 访问
  server: { port: 5173, host: '0.0.0.0' },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.spec.js'],
    css: false
  }
})
