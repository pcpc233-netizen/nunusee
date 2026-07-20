const { app, BrowserWindow, Menu, ipcMain, globalShortcut, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

const isDev = !app.isPackaged;
const MAX_SCORES = 10;
const scoresFile = path.join(app.getPath('userData'), 'scores.json');

// ── 로컬 점수 저장 (JSON 파일, TOP10) ──
function readScores() {
  try {
    const raw = fs.readFileSync(scoresFile, 'utf-8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeScores(list) {
  const tmp = scoresFile + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(list, null, 2), 'utf-8');
  fs.renameSync(tmp, scoresFile);
}

ipcMain.handle('scores:get', () => readScores());

ipcMain.handle('scores:add', (_evt, score) => {
  const n = Math.floor(Number(score));
  if (!Number.isFinite(n) || n < 0) return readScores();
  const list = readScores();
  list.push({ score: n, ts: Date.now() });
  list.sort((a, b) => b.score - a.score);
  const top = list.slice(0, MAX_SCORES);
  writeScores(top);
  return top;
});

// ── 프로덕션용 로컬 정적 서버 (dist/ 서빙 — /characters/... 절대경로 유지) ──
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.json': 'application/json; charset=utf-8',
};

function startStaticServer(rootDir) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = decodeURIComponent((req.url || '/').split('?')[0]);
      if (reqPath === '/') reqPath = '/index.html';
      let filePath = path.join(rootDir, reqPath);
      if (!filePath.startsWith(rootDir)) {
        res.writeHead(403); res.end(); return;
      }
      fs.readFile(filePath, (err, data) => {
        if (err) {
          // SPA 폴백
          fs.readFile(path.join(rootDir, 'index.html'), (err2, data2) => {
            if (err2) { res.writeHead(404); res.end('Not found'); return; }
            res.writeHead(200, { 'Content-Type': MIME['.html'] });
            res.end(data2);
          });
          return;
        }
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve(port);
    });
  });
}

// ── 메인 윈도우 ──
async function createWindow() {
  const win = new BrowserWindow({
    fullscreen: !isDev,
    kiosk: !isDev,
    frame: isDev,
    autoHideMenuBar: true,
    backgroundColor: '#0d0a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDev,
    },
  });

  Menu.setApplicationMenu(null);

  // 새 창/외부 네비게이션 차단 (키오스크 이탈 방지)
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url).catch(() => {});
    return { action: 'deny' };
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    await win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    const distDir = path.join(__dirname, '..', 'dist');
    const port = await startStaticServer(distDir);
    await win.loadURL(`http://127.0.0.1:${port}/`);
  }

  const allowedOrigin = isDev && process.env.VITE_DEV_SERVER_URL
    ? new URL(process.env.VITE_DEV_SERVER_URL).origin
    : null;
  win.webContents.on('will-navigate', (e, url) => {
    const origin = new URL(url).origin;
    const currentOrigin = new URL(win.webContents.getURL()).origin;
    if (origin !== currentOrigin && origin !== allowedOrigin) e.preventDefault();
  });

  return win;
}

app.whenReady().then(async () => {
  await createWindow();

  // 스태프 전용 종료 단축키 (현장 운영자만 알고 있어야 함)
  globalShortcut.register('Control+Alt+Shift+Q', () => app.quit());

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
