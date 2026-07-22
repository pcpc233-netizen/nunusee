import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 브라우저 키오스크 모드: calcmoum.com/kiosk/ 경로로 서빙.
// JS/CSS는 /kiosk/assets/로 나가고, 런타임 에셋(/characters, /assets, /fonts, /copyright_white.png)은
// 웹앱과 동일한 파일을 루트에서 공유하므로 절대경로 그대로 사용한다.
export default defineConfig({
  base: '/kiosk/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1800,
    outDir: 'dist',
  },
});
