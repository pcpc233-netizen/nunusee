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

    // 재시작 안내 (RETRY/RANK 버튼 제거 — 피드백 반영, 탭/스페이스로 재시작)
    const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 50, '👆 화면을 탭하거나 스페이스를 눌러 다시 시작', {
      fontSize: '17px', color: '#e9d5ff',
      fontFamily: '"Nanum Gothic", sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: hint, alpha: { from: 1, to: 0.45 }, duration: 900, yoyo: true, repeat: -1 });

    // Emit to React (로컬 저장 트리거)
    this.game.events.emit('gameover', score);

    // 탭/스페이스로 재시작 (사망 순간의 탭이 즉시 재시작되지 않도록 약간 지연)
    this.input.keyboard?.once('keydown-SPACE', this.restart, this);
    this.time.delayedCall(450, () => {
      this.input.once('pointerdown', this.restart, this);
    });
  }

  // ── 나무 간판 스타일 버튼 (글로우 + 코너 브래킷 + 분필 텍스트) ──
  private restart() {
    this.game.events.emit('restart');
    this.scene.start('GameScene', { characterKey: this.characterKey });
  }
}
