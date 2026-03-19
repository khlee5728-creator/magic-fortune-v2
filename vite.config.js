import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  base: './',  // 상대 경로 사용 - 서브디렉토리 배포 시에도 리소스 정상 로드
  plugins: [
    react(),
    viteImagemin({
      // WebP optimization
      webp: {
        quality: 75,
      },
      // PNG optimization (for fallback images)
      optipng: {
        optimizationLevel: 7,
      },
      // JPEG optimization (if any)
      mozjpeg: {
        quality: 80,
      },
      // SVG optimization
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
            active: false,
          },
          {
            name: 'removeEmptyAttrs',
            active: true,
          },
        ],
      },
    }),
  ],
  server: {
    port: 8000,
  },
  build: {
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'animation-vendor': ['framer-motion'],
        },
      },
    },
    // Increase chunk size warning limit (we have large images)
    chunkSizeWarningLimit: 1000,
  },
})
