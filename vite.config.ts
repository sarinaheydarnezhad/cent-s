import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return {
  base: env.VITE_BASE_PATH || '/cent-s/',
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (/\/node_modules\/react-dom\//.test(id)) return 'react-dom'
          if (/\/node_modules\/(react|scheduler)\//.test(id)) return 'react'
          if (/\/node_modules\/(react-router|react-router-dom)\//.test(id)) return 'router'
        },
      },
    },
  },
  server: {
    fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/docs/**', '**/.preview-artifacts/**', '**/Backend/**', '**/Content/**', '**/*.zip', '**/*.db', '**/*.bak', '**/provenance/**'] },
    port: 5173,
    headers: { 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'no-store' },
    proxy: { '/api/cent': env.CENT_BACKEND_URL || 'http://127.0.0.1:5108' },
  },
  preview: { headers: { 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'no-store' }, proxy: { '/api/cent': env.CENT_BACKEND_URL || 'http://127.0.0.1:5108' } },
  }
})
