import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',  // 상대 경로 사용 - 서브디렉토리 배포 시에도 리소스 정상 로드
  plugins: [react()],
  server: {
    port: 8000,
  }
})
