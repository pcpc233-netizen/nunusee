import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y } from '../config';
import { CHARACTERS } from '../characters';

export class BootScene extends Phaser.Scene {
  private loadErrors = new Set<string>();

  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    CHARACTERS.forEach(char => {
      this.load.image(`char_${char.key}`, `/characters/${char.key}.png`);
    });
    this.load.on('loaderror', (file: { key: string }) => {
      this.loadErrors.add(file.key);
    });
  }

  create() {
    // ── 밤하늘 배경 ──
    const bgGfx = this.make.graphics({ x: 0, y: 0 });
    bgGfx.fillGradientStyle(0x0d0a2e, 0x0d0a2e, 0x1a0a4e, 0x1a0a4e, 1);
    bgGfx.fillRect(0, 0, GAME_WIDTH, GROUND_Y);
    // 별
    const stars = [
      [60,18],[140,8],[220,28],[310,12],[420,22],[500,6],[580,30],[670,14],[740,24],
      [100,50],[260,44],[380,55],[490,40],[620,48],[720,36],[160,70],[340,64],[560,72],
      [50,82],[450,78],[700,66],[250,90],[630,86],
    ];
    stars.forEach(([sx, sy]) => {
      const r = Math.random() > 0.5 ? 2 : 1.5;
      bgGfx.fillStyle(0xffffff, Math.random() * 0.5 + 0.4);
      bgGfx.fillCircle(sx, sy, r);
    });
    // 달
    bgGfx.fillStyle(0xfef9c3, 1);
    bgGfx.fillCircle(700, 55, 28);
    bgGfx.fillStyle(0x1a0a4e, 1);
    bgGfx.fillCircle(714, 47, 22);
    bgGfx.generateTexture('sky', GAME_WIDTH, GROUND_Y);
    bgGfx.destroy();

    // ── 지면 (밤 풀밭) ──
    const groundGfx = this.make.graphics({ x: 0, y: 0 });
    groundGfx.fillStyle(0x0a1f0a);
    groundGfx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);
    groundGfx.fillStyle(0x14420f, 1);
    groundGfx.fillRect(0, 0, GAME_WIDTH, 3);
    groundGfx.fillStyle(0x1a5c12, 0.4);
    groundGfx.fillRect(0, 5, GAME_WIDTH, 2);
    groundGfx.generateTexture('ground', GAME_WIDTH, GAME_HEIGHT - GROUND_Y);
    groundGfx.destroy();

    // ── 유령의 집 실루엣 ──
    const buildGfx = this.make.graphics({ x: 0, y: 0 });
    // 집 1 - 뾰족 지붕
    buildGfx.fillStyle(0x2d1b69, 0.85);
    buildGfx.fillRect(0, 45, 28, 55);
    buildGfx.fillTriangle(0, 45, 28, 45, 14, 18);
    // 창문 (노란 불빛)
    buildGfx.fillStyle(0xfbbf24, 0.7);
    buildGfx.fillRect(5, 52, 8, 8); buildGfx.fillRect(17, 52, 8, 8);
    buildGfx.fillRect(5, 68, 8, 8); buildGfx.fillRect(17, 68, 8, 8);
    // 집 2 - 작은 집
    buildGfx.fillStyle(0x1e1260, 0.8);
    buildGfx.fillRect(34, 55, 24, 45);
    buildGfx.fillTriangle(34, 55, 58, 55, 46, 33);
    buildGfx.fillStyle(0xfbbf24, 0.6);
    buildGfx.fillRect(39, 62, 7, 7); buildGfx.fillRect(50, 62, 7, 7);
    // 집 3 - 제일 큰 유령의 집
    buildGfx.fillStyle(0x3b1d8a, 0.9);
    buildGfx.fillRect(64, 18, 38, 82);
    buildGfx.fillTriangle(64, 18, 102, 18, 83, -6);
    // 굴뚝
    buildGfx.fillStyle(0x2d1b69);
    buildGfx.fillRect(90, 5, 8, 14);
    // 창문들
    buildGfx.fillStyle(0xfbbf24, 0.8);
    buildGfx.fillRect(69, 26, 10, 10); buildGfx.fillRect(85, 26, 10, 10);
    buildGfx.fillRect(69, 44, 10, 10); buildGfx.fillRect(85, 44, 10, 10);
    buildGfx.fillRect(69, 62, 10, 10); buildGfx.fillRect(85, 62, 10, 10);
    // 문 (아치형)
    buildGfx.fillStyle(0x0d0a2e, 0.9);
    buildGfx.fillRect(77, 78, 12, 22);
    buildGfx.fillCircle(83, 78, 6);
    // 집 4
    buildGfx.fillStyle(0x1e0e5a, 0.75);
    buildGfx.fillRect(108, 38, 22, 62);
    buildGfx.fillTriangle(108, 38, 130, 38, 119, 16);
    buildGfx.fillStyle(0xfbbf24, 0.5);
    buildGfx.fillRect(113, 46, 7, 7); buildGfx.fillRect(113, 60, 7, 7);
    // 집 5
    buildGfx.fillStyle(0x2a1566, 0.7);
    buildGfx.fillRect(136, 50, 24, 50);
    buildGfx.fillTriangle(136, 50, 160, 50, 148, 30);
    buildGfx.fillStyle(0xfbbf24, 0.4);
    buildGfx.fillRect(141, 58, 7, 7); buildGfx.fillRect(152, 58, 7, 7);
    buildGfx.generateTexture('buildings', 160, 100);
    buildGfx.destroy();

    // ── 박쥐 (구름 대체) ──
    const batGfx = this.make.graphics({ x: 0, y: 0 });
    batGfx.fillStyle(0x1e1b4b, 0.85);
    // 몸통
    batGfx.fillEllipse(52, 22, 18, 14);
    // 왼쪽 날개
    batGfx.fillTriangle(52, 18, 8, 8, 44, 28);
    batGfx.fillTriangle(8, 8, 20, 32, 44, 28);
    // 오른쪽 날개
    batGfx.fillTriangle(52, 18, 96, 8, 60, 28);
    batGfx.fillTriangle(96, 8, 84, 32, 60, 28);
    // 귀
    batGfx.fillTriangle(46, 14, 40, 2, 50, 12);
    batGfx.fillTriangle(58, 14, 64, 2, 54, 12);
    // 눈 (빨간)
    batGfx.fillStyle(0xef4444, 0.9);
    batGfx.fillCircle(48, 21, 2.5); batGfx.fillCircle(56, 21, 2.5);
    batGfx.generateTexture('cloud', 104, 40);
    batGfx.destroy();

    // ── 장애물1: 유령 👻 ──
    const ghost = this.make.graphics({ x: 0, y: 0 });
    // 몸 (반투명 흰색)
    ghost.fillStyle(0xe8e0ff, 0.92);
    ghost.fillCircle(22, 18, 18);
    ghost.fillRect(4, 18, 36, 22);
    // 물결 아랫부분
    ghost.fillCircle(10, 40, 8); ghost.fillCircle(22, 40, 8); ghost.fillCircle(34, 40, 8);
    // 구멍 파기 (배경색)
    ghost.fillStyle(0x0d0a2e, 1);
    ghost.fillCircle(16, 40, 5); ghost.fillCircle(28, 40, 5);
    // 눈
    ghost.fillStyle(0x1e1b4b, 1);
    ghost.fillEllipse(14, 17, 9, 11); ghost.fillEllipse(30, 17, 9, 11);
    // 눈 하이라이트
    ghost.fillStyle(0xffffff, 0.8);
    ghost.fillCircle(16, 15, 2.5); ghost.fillCircle(32, 15, 2.5);
    // 입 (작은 O)
    ghost.fillStyle(0x1e1b4b, 1);
    ghost.fillCircle(22, 26, 4);
    // 반짝임
    ghost.fillStyle(0xffffff, 0.5);
    ghost.fillCircle(8, 10, 3); ghost.fillCircle(36, 8, 2);
    ghost.generateTexture('obstacle_bomb', 44, 48);
    ghost.destroy();

    // ── 장애물2: 호박 🎃 ──
    const pumpkin = this.make.graphics({ x: 0, y: 0 });
    // 줄기
    pumpkin.fillStyle(0x166534);
    pumpkin.fillRoundedRect(15, 0, 8, 14, 3);
    // 잎사귀
    pumpkin.fillStyle(0x16a34a, 0.8);
    pumpkin.fillEllipse(26, 6, 16, 8);
    // 호박 몸통 (주황)
    pumpkin.fillStyle(0xea580c);
    pumpkin.fillEllipse(20, 44, 38, 48);
    // 호박 골 (어두운 선)
    pumpkin.fillStyle(0xc2410c, 0.5);
    pumpkin.fillEllipse(10, 44, 14, 48);
    pumpkin.fillEllipse(30, 44, 14, 48);
    // 눈 (삼각형 - 무서운)
    pumpkin.fillStyle(0x0d0a2e, 1);
    pumpkin.fillTriangle(9, 34, 17, 34, 13, 42);
    pumpkin.fillTriangle(23, 34, 31, 34, 27, 42);
    // 코
    pumpkin.fillTriangle(18, 44, 22, 44, 20, 48);
    // 입 (지그재그)
    pumpkin.fillRect(6, 52, 28, 4);
    pumpkin.fillStyle(0xea580c, 1);
    pumpkin.fillRect(10, 52, 4, 4); pumpkin.fillRect(18, 52, 4, 4); pumpkin.fillRect(26, 52, 4, 4);
    // 눈 불빛
    pumpkin.fillStyle(0xfbbf24, 0.6);
    pumpkin.fillTriangle(9, 34, 17, 34, 13, 42);
    pumpkin.fillTriangle(23, 34, 31, 34, 27, 42);
    pumpkin.generateTexture('obstacle_boss', 40, 78);
    pumpkin.destroy();

    // ── 장애물3: 거미집 🕸️ (공중) ──
    const web = this.make.graphics({ x: 0, y: 0 });
    // 거미줄 배경 원
    web.fillStyle(0x4c1d95, 0.15);
    web.fillCircle(31, 28, 30);
    // 거미줄 선 (방사형)
    web.lineStyle(1.5, 0xc4b5fd, 0.7);
    const cx = 31, cy = 28, wr = 29;
    for (let a = 0; a < 8; a++) {
      const angle = (a / 8) * Math.PI * 2;
      web.lineBetween(cx, cy, cx + Math.cos(angle) * wr, cy + Math.sin(angle) * wr);
    }
    // 동심원 줄
    [8, 16, 24].forEach(r => {
      web.strokeCircle(cx, cy, r);
    });
    // 거미 (중앙)
    web.fillStyle(0x1e1b4b, 0.95);
    web.fillCircle(cx, cy, 6);
    // 거미 다리
    web.lineStyle(1.5, 0x1e1b4b, 0.8);
    [[-1,-1],[-1.2,0],[-1,-1],[0.6,-1.2],[1.2,-0.6]].forEach(([dx, dy], i) => {
      const ax = cx + dx * 10, ay = cy + dy * 10;
      web.lineBetween(cx, cy, ax, ay);
    });
    // 눈
    web.fillStyle(0xef4444, 1);
    web.fillCircle(29, cy-1, 2); web.fillCircle(33, cy-1, 2);
    web.generateTexture('obstacle_notif', 62, 56);
    web.destroy();

    // ── 아이템1: 마법 물약 🧪 ──
    const potion = this.make.graphics({ x: 0, y: 0 });
    // 코르크
    potion.fillStyle(0x92400e);
    potion.fillRoundedRect(10, 0, 12, 8, 2);
    // 병 목
    potion.fillStyle(0xc4b5fd, 0.9);
    potion.fillRoundedRect(11, 7, 10, 8, 2);
    // 병 몸통 (보라 물약)
    potion.fillStyle(0x7c3aed, 0.95);
    potion.fillEllipse(16, 26, 26, 28);
    // 물약 색 레이어
    potion.fillStyle(0xa855f7, 0.6);
    potion.fillEllipse(16, 22, 24, 18);
    // 기포
    potion.fillStyle(0xffffff, 0.5);
    potion.fillCircle(10, 24, 3); potion.fillCircle(20, 20, 2); potion.fillCircle(14, 30, 2);
    // 반짝임
    potion.fillStyle(0xe9d5ff, 0.7);
    potion.fillEllipse(10, 20, 6, 10);
    // 별 반짝이
    potion.fillStyle(0xfbbf24, 0.9);
    potion.fillCircle(28, 8, 3);
    potion.fillRect(26, 5, 4, 2); potion.fillRect(27, 4, 2, 4);
    potion.generateTexture('item_coffee', 32, 38);
    potion.destroy();

    // ── 아이템2: 유령 배지 ──
    const badge = this.make.graphics({ x: 0, y: 0 });
    // 별 외곽 (보라)
    badge.fillStyle(0x7c3aed);
    const ov: {x:number;y:number}[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 17 : 7;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      ov.push({ x: 18 + r * Math.cos(a), y: 18 + r * Math.sin(a) });
    }
    badge.fillPoints(ov, true);
    // 별 내부 (연보라)
    badge.fillStyle(0xa855f7);
    const iv: {x:number;y:number}[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 12 : 5;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      iv.push({ x: 18 + r * Math.cos(a), y: 18 + r * Math.sin(a) });
    }
    badge.fillPoints(iv, true);
    // 유령 미니 아이콘
    badge.fillStyle(0xffffff, 0.9);
    badge.fillCircle(18, 16, 5);
    badge.fillRect(13, 16, 10, 6);
    badge.fillCircle(15, 22, 3); badge.fillCircle(21, 22, 3);
    badge.fillStyle(0x7c3aed, 1);
    badge.fillCircle(14, 22, 2); badge.fillCircle(22, 22, 2);
    badge.fillStyle(0x1e1b4b, 1);
    badge.fillCircle(16, 15, 1.5); badge.fillCircle(20, 15, 1.5);
    badge.generateTexture('item_badge', 36, 36);
    badge.destroy();

    // ── 먼지 파티클 (보라 계열) ──
    const dustGfx = this.make.graphics({ x: 0, y: 0 });
    dustGfx.fillStyle(0xa78bfa, 1);
    dustGfx.fillCircle(6, 6, 6);
    dustGfx.generateTexture('dust', 12, 12);
    dustGfx.destroy();

    // ── 속도선 (보라/라벤더) ──
    const speedGfx = this.make.graphics({ x: 0, y: 0 });
    speedGfx.fillStyle(0xc4b5fd, 0.6);
    speedGfx.fillRect(0, 0, 40, 3);
    speedGfx.generateTexture('speedline', 40, 3);
    speedGfx.destroy();

    // ── PNG 로드 실패 시 폴백 ──
    CHARACTERS.forEach((char) => {
      if (this.loadErrors.has(`char_${char.key}`)) {
        this.generateFallbackChar(char.key, char.bodyColor, char.earColor);
      }
    });

    const characterKey = this.registry.get('characterKey') ?? CHARACTERS[0].key;

    // 분필 폰트(Rock Salt) 로드 보장 후 게임 시작 — 캔버스 텍스트는 렌더 시점에 폰트가 있어야 함
    this.ensureFonts().finally(() => {
      this.scene.start('GameScene', { characterKey });
    });
  }

  private ensureFonts(): Promise<unknown> {
    const fontsApi = (document as Document & { fonts?: { load: (f: string) => Promise<unknown> } }).fonts;
    if (!fontsApi?.load) return Promise.resolve();
    // 최대 1.5초만 대기 (네트워크 지연 시 폴백 폰트로 진행)
    const timeout = new Promise((res) => setTimeout(res, 1500));
    return Promise.race([fontsApi.load("700 24px 'Rock Salt'"), timeout]);
  }

  private generateFallbackChar(key: string, bodyColor: number, earColor: number) {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(bodyColor);
    g.fillEllipse(50, 56, 60, 62);
    g.fillCircle(50, 26, 26);
    g.fillStyle(earColor);
    g.fillRoundedRect(28, 2, 14, 28, 6);
    g.fillRoundedRect(58, 2, 14, 28, 6);
    g.fillStyle(0xfce7f3);
    g.fillRoundedRect(32, 5, 7, 20, 4);
    g.fillRoundedRect(61, 5, 7, 20, 4);
    g.fillStyle(0x1f2937);
    g.fillCircle(41, 25, 5); g.fillCircle(59, 25, 5);
    g.fillStyle(0xffffff);
    g.fillCircle(43, 23, 2); g.fillCircle(61, 23, 2);
    g.fillStyle(0xff6b6b); g.fillEllipse(50, 32, 8, 5);
    g.fillStyle(earColor, 0.35);
    g.fillCircle(36, 29, 7); g.fillCircle(64, 29, 7);
    g.fillStyle(bodyColor);
    g.fillRoundedRect(28, 82, 20, 14, 4);
    g.fillRoundedRect(52, 82, 20, 14, 4);
    g.generateTexture(`char_${key}`, 100, 98);
    g.destroy();
  }
}
