/* 누누씨 귀신의 집?! 키오스크 — 오프라인 지원 서비스워커
 *
 * 전략
 *  - HTML(내비게이션): 네트워크 우선 → 실패 시 캐시  (온라인이면 최신 버전 자동 반영)
 *  - 그 외 정적 자산  : 캐시 우선 → 없으면 네트워크 후 캐시  (오프라인 동작 + 빠른 로딩)
 *
 * 주의: 스코프는 /kiosk/ 지만, 이 스코프의 페이지가 요청하는 모든 URL(루트의 /characters, /assets 포함)을
 *       가로챌 수 있으므로 게임 자산 전체가 캐시된다.
 */
const CACHE = 'nunusee-kiosk-v1';

// 설치 시 미리 받아둘 필수 자산 (이걸로 첫 오프라인 실행이 보장됨)
const PRECACHE = [
  '/kiosk/',
  '/kiosk/index.html',
  '/kiosk/fonts/fonts.css',
  '/characters/deokchun.png',
  '/characters/deokja.png',
  '/characters/deokhee.png',
  '/copyright_white.png',
  '/assets/ghost.png',
  '/assets/monster.png',
  '/assets/bat.png',
  '/assets/skull.png',
  '/assets/talisman.png',
  '/assets/flame.png',
  '/assets/bush1.png',
  '/assets/bush2.png',
  '/assets/candle.png',
  '/assets/candle_lit.png',
  '/assets/sign_haunted.png',
  '/assets/tag_nunusee.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // 일부 파일이 실패해도 설치는 계속되도록 개별 처리
      .then((cache) => Promise.all(
        PRECACHE.map((url) => cache.add(url).catch(() => null))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch { return; }
  if (url.origin !== self.location.origin) return;

  const isHTML = req.mode === 'navigate'
    || (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    // 온라인이면 최신 HTML, 오프라인이면 캐시된 HTML
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('/kiosk/index.html')))
    );
    return;
  }

  // 정적 자산: 캐시 우선
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      });
    })
  );
});
