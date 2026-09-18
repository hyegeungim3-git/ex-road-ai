import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // 배포 대상별 base: GitHub Pages는 '/ex-road-ai/', 루트 배포는 '/'.
  // 빌드 시 VITE_BASE 로 덮어쓴다 (예: VITE_BASE=/ npm run build)
  base: process.env.VITE_BASE || '/ex-road-ai/',
  plugins: [react({ include: /\.(jsx?|tsx?)$/ }), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 5174,
    allowedHosts: true,
  },
  build: {
    cssMinify: 'esbuild',
    minify: 'esbuild',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'icons': ['lucide-react'],
          'charts': ['recharts'],
        },
      },
    },
  },
})
