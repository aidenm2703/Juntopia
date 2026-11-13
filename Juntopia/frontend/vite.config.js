import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: 3000, strictPort: true, proxy: { '/api': { target: process.env.JUNTOPIA_API_PROXY_TARGET || 'http://127.0.0.1:4000', changeOrigin: true } } },
})
