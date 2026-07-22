import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// 오프라인 지원: 서비스워커 등록 (한 번 온라인 실행 후엔 인터넷 없이도 동작)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch(() => { /* 로컬 file:// 등 미지원 환경에서는 무시 */ });
  });
}
