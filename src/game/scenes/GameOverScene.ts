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

    // 으악 텍스트 (전체를 화면 중앙에 맞춰 배치)
    this.add.text(GAME_WIDTH / 2, 48, '으악 ㅠㅠ 잡혔다!', {
      fontSize: '16px', color: '#c4b5fd',
      fontFamily: '"Nanum Gothic", sans-serif',
    }).setOrigin(0.5).setDepth(20);

    // 점수 (흰색, 목업처럼 깔끔하게)
    this.add.text(GAME_WIDTH / 2, 90, `${score}m`, {
      fontSize: '32px', color: '#ffffff',
      fontFamily: '"Nanum Gothic", sans-serif', fontStyle: 'bold',
      stroke: '#1e1b4b', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(20);

    // 빨간 분필 GAME OVER (2줄) — 동일 색 두꺼운 stroke로 둥글고 도톰한 글자
    // padding: 두꺼운 stroke/그림자가 텍스트 캔버스 밖으로 잘리지 않도록 여백 확보(가장자리 글자 둥글게)
    const gameOver = this.add.text(GAME_WIDTH / 2, 225, 'GAME\nOVER', {
      fontSize: '54px', color: '#ec0b30',
      fontFamily: "'Rock Salt', 'Nanum Gothic', cursive",
      align: 'center', stroke: '#ec0b30', strokeThickness: 11,
      lineSpacing: -8,
      shadow: { offsetX: 0, offsetY: 0, color: '#3b0a0a', blur: 6, stroke: true, fill: true },
      padding: { x: 22, y: 18 },
    }).setOrigin(0.5).setDepth(20);
    // 캔버스 폭을 넘으면 좌우가 잘리므로 여백 안에 맞게 자동 축소
    const maxWidth = GAME_WIDTH - 56;
    if (gameOver.width > maxWidth) gameOver.setScale(maxWidth / gameOver.width);

    // 안내 (탭/스페이스로 캐릭터 다시 고르기 — 같은 캐릭터 즉시 재시작 X)
    const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 42, '👆 화면을 탭하거나 스페이스를 눌러 캐릭터 다시 고르기', {
      fontSize: '17px', color: '#e9d5ff',
      fontFamily: '"Nanum Gothic", sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: hint, alpha: { from: 1, to: 0.45 }, duration: 900, yoyo: true, repeat: -1 });

    // Emit to React
    this.game.events.emit('gameover', score);

    // 탭/스페이스로 재시작 (사망 순간의 탭이 즉시 재시작되지 않도록 약간 지연)
    this.input.keyboard?.once('keydown-SPACE', this.restart, this);
    this.time.delayedCall(450, () => {
      this.input.once('pointerdown', this.restart, this);
    });
  }

  private restart() {
    // 같은 캐릭터로 즉시 재시작하지 않고, 캐릭터 선택 화면으로 돌아가 다시 고르게 함
    this.game.events.emit('reselect');
  }
}
