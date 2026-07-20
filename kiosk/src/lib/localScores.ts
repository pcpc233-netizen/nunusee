export interface ScoreRecord {
  score: number;
  ts: number;
}

interface KioskBridge {
  getScores: () => Promise<ScoreRecord[]>;
  addScore: (score: number) => Promise<ScoreRecord[]>;
  isElectron: true;
}

declare global {
  interface Window {
    kiosk?: KioskBridge;
  }
}

const LS_KEY = 'nunusee_kiosk_scores';
const MAX_SCORES = 10;

// localStorage 폴백 (Electron 없이 브라우저에서 `npm run dev`로 확인할 때만 사용)
function readLocalStorage(): ScoreRecord[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeLocalStorage(list: ScoreRecord[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export async function getTopScores(): Promise<ScoreRecord[]> {
  if (window.kiosk) return window.kiosk.getScores();
  return readLocalStorage();
}

export async function addScore(score: number): Promise<ScoreRecord[]> {
  if (window.kiosk) return window.kiosk.addScore(score);
  const list = readLocalStorage();
  list.push({ score: Math.floor(score), ts: Date.now() });
  list.sort((a, b) => b.score - a.score);
  const top = list.slice(0, MAX_SCORES);
  writeLocalStorage(top);
  return top;
}
