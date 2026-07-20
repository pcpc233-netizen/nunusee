import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 프로덕션에서는 Electron이 로컬 정적 서버(http://127.0.0.1)로 dist를 서빙하므로
// 절대경로(/characters/...) 에셋 참조가 그대로 동작함 (base는 기본값 '/' 유지)
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1800,
    outDir: 'dist',
  },
});
