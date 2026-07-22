import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  private characterKey = 'deokchun';

  create(data: { score: number; characterKey?: string }) {
    const score = data?.score ?? 0;
    this.characterKey = data?.characterKey ?? 'deokchun';

    // 배경 오버레이 (불투명 — 뒤 게임 장식이 비치지 않도록, 피드백 반영)
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0d0a2e, 1);

    // 으악 텍스트 (상단)
    this.add.text(GAME_WIDTH / 2, 26, '으악 ㅠㅠ 잡혔다!', {
      fontSize: '16px', color: '#c4b5fd',
      fontFamily: '"Nanum Gothic", sans-serif',
    }).setOrigin(0.5).setDepth(20);

    // 점수 (흰색, 깔끔하게)
    this.add.text(GAME_WIDTH / 2, 58, `${score}m`, {
      fontSize: '32px', color: '#ffffff',
      fontFamily: '"Nanum Gothic", sans-serif', fontStyle: 'bold',
      stroke: '#1e1b4b', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(20);

    // 빨간 분필 GAME OVER (2줄) — 폰트 더 굵게 (동일 색 두꺼운 stroke로 글자 두께 증가)
    this.add.text(GAME_WIDTH / 2, 158, 'GAME\nOVER', {
      fontSize: '54px', color: '#ec0b30',
      fontFamily: "'Rock Salt', 'Nanum Gothic', cursive",
      align: 'center', stroke: '#ec0b30', strokeThickness: 11,
      lineSpacing: -8,
      shadow: { offsetX: 0, offsetY: 0, color: '#3b0a0a', blur: 6, stroke: true, fill: true },
    }).setOrigin(0.5).setDepth(20);

    // ── 나무 간판 버튼 (RETRY / RANK — 로컬 TOP10) ──
    const retry = this.makeWoodSign(GAME_WIDTH / 2 - 125, GAME_HEIGHT - 56, 220, 56, 'RETRY');
    const rank = this.makeWoodSign(GAME_WIDTH / 2 + 125, GAME_HEIGHT - 56, 220, 56, 'RANK');

    retry.on('pointerdown', this.restart, this);
    rank.on('pointerdown', () => this.game.events.emit('showlocalrank'), this);

    // 힌트 텍스트
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 16, '스페이스 / 화면 탭으로도 재시작', {
      fontSize: '11px', color: '#7c6aad',
      fontFamily: '"Nanum Gothic", sans-serif',
    }).setOrigin(0.5).setDepth(20);

    // Emit to React (로컬 저장 트리거)
    this.game.events.emit('gameover', score);

    // 스페이스로 재시작
    this.input.keyboard?.once('keydown-SPACE', this.restart, this);
  }

  // ── 나무 간판 스타일 버튼 (글로우 + 코너 브래킷 + 분필 텍스트) ──
  private makeWoodSign(x: number, y: number, w: number, h: number, label: string) {
    const left = x - w / 2;
    const top = y - h / 2;
    const g = this.add.graphics().setDepth(20);

    const draw = (fill: number) => {
      g.clear();
      // 글로우 (라벤더 소프트)
      g.fillStyle(0xe9d5ff, 0.12);
      g.fillRoundedRect(left - 10, top - 10, w + 20, h + 20, 18);
      // 간판 본체 (노란 나무)
      g.fillStyle(fill, 1);
      g.fillRoundedRect(left, top, w, h, 12);
      // 아래쪽 음영 (입체감)
      g.fillStyle(0xd99a06, 0.45);
      g.fillRoundedRect(left, top + h * 0.62, w, h * 0.38, 12);
      // 윗면 하이라이트
      g.fillStyle(0xffffff, 0.22);
      g.fillRoundedRect(left + 6, top + 5, w - 12, h * 0.34, 8);
      // 마룬 코너 브래킷 (못/장식 느낌)
      g.lineStyle(3, 0x8a2b1a, 0.9);
      const m = 12, len = 15;
      const bracket = (cx: number, cy: number, dx: number, dy: number) => {
        g.beginPath();
        g.moveTo(cx, cy + dy * len);
        g.lineTo(cx, cy);
        g.lineTo(cx + dx * len, cy);
        g.strokePath();
      };
      bracket(left + m, top + m, 1, 1);             // TL
      bracket(left + w - m, top + m, -1, 1);        // TR
      bracket(left + m, top + h - m, 1, -1);        // BL
      bracket(left + w - m, top + h - m, -1, -1);   // BR
    };
    draw(0xf5c518);

    const txt = this.add.text(x, y - 2, label, {
      fontSize: '24px', color: '#8a2b1a',
      fontFamily: "'Rock Salt', 'Nanum Gothic', cursive",
    }).setOrigin(0.5).setDepth(21);

    const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => { draw(0xfcd34d); txt.setScale(1.06); });
    zone.on('pointerout', () => { draw(0xf5c518); txt.setScale(1); });
    return zone;
  }

  private restart() {
    this.game.events.emit('restart');
    this.scene.start('GameScene', { characterKey: this.characterKey });
  }
}
