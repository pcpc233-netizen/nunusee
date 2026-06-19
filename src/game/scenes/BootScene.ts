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
    // 실제 누누씨 자산 (장애물 / 아이템 / 장식)
    this.load.image('obstacle_bomb', '/assets/ghost.png');     // 유령
    this.load.image('obstacle_boss', '/assets/skull.png');     // 해골
    this.load.image('obstacle_notif', '/assets/bat.png');      // 박쥐(공중)
    this.load.image('item_coffee', '/assets/talisman.png');    // 부적(더블점프)
    this.load.image('item_badge', '/assets/flame.png');        // 도깨비불(무적)
    this.load.image('deco_bush1', '/assets/bush1.png');
    this.load.image('deco_bush2', '/assets/bush2.png');
    this.load.image('deco_candle', '/assets/candle.png');
    this.load.image('deco_candle2', '/assets/candle_lit.png');
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
