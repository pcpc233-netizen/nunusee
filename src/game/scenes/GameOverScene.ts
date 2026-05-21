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

    // 배경 오버레이 (납량 어두운 보라)
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0d0a2e, 0.82);

    // 유령 배경 장식 (큰 반투명 유령들)
    const ghostDeco = (x: number, y: number, scale: number, alpha: number) => {
      const g = this.add.graphics();
      g.fillStyle(0xc4b5fd, alpha);
      g.fillCircle(0, -10, 20 * scale);
      g.fillRect(-20 * scale, -10, 40 * scale, 24 * scale);
      g.fillCircle(-12 * scale, 14 * scale, 10 * scale);
      g.fillCircle(0, 14 * scale, 10 * scale);
      g.fillCircle(12 * scale, 14 * scale, 10 * scale);
      g.x = x; g.y = y;
    };
    ghostDeco(80, 80, 1.2, 0.08);
    ghostDeco(680, 60, 1.5, 0.06);
    ghostDeco(400, 320, 0.9, 0.07);

    // 캐릭터 이미지 (유령처럼 떠있는 느낌)
    const charImg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, `char_${this.characterKey}`);
    charImg.setScale(0.38).setAlpha(0.9);
    this.tweens.add({
      targets: charImg,
      alpha: { from: 0, to: 0.9 },
      y: { from: GAME_HEIGHT / 2 + 40, to: GAME_HEIGHT / 2 - 10 },
      duration: 500,
      ease: 'Back.easeOut',
    });
    // 유령처럼 위아래 둥실둥실
    this.tweens.add({
      targets: charImg,
      y: charImg.y - 12,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 600,
    });

    // 납량 텍스트
    this.add.text(GAME_WIDTH / 2, 52, '으악 ㅠㅠ 잡혔다!', {
      fontSize: '18px', color: '#c4b5fd',
      fontFamily: '"Nanum Gothic", sans-serif',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 88, '👻 GAME OVER 👻', {
      fontSize: '40px', color: '#ffffff',
      fontFamily: '"Nanum Gothic", sans-serif',
      fontStyle: 'bold',
      stroke: '#7c3aed', strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 110, `🌙 ${score}m 달렸어요!`, {
      fontSize: '26px', color: '#e9d5ff',
      fontFamily: '"Nanum Gothic", sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 재시작 버튼
    const restartBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 66, 230, 42, 0x7c3aed, 1)
      .setInteractive()
      .setStrokeStyle(2, 0xc4b5fd);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 66, '다시 도전하기 👻', {
      fontSize: '16px', color: '#ffffff',
      fontFamily: '"Nanum Gothic", sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    restartBg.on('pointerover', () => restartBg.setFillStyle(0x6d28d9));
    restartBg.on('pointerout',  () => restartBg.setFillStyle(0x7c3aed));

    // 힌트 텍스트
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 28, '스페이스 / 화면 탭으로도 재시작', {
      fontSize: '13px', color: '#6d28d9',
      fontFamily: '"Nanum Gothic", sans-serif',
    }).setOrigin(0.5);

    // Emit to React
    this.game.events.emit('gameover', score);

    // Restart
    this.input.keyboard?.once('keydown-SPACE', this.restart, this);
    restartBg.once('pointerdown', this.restart, this);
    // 배경 클릭도 재시작 (버튼 제외 영역)
    this.time.delayedCall(500, () => {
      this.input.once('pointerdown', this.restart, this);
    });
  }

  private restart() {
    this.game.events.emit('restart');
    this.scene.start('GameScene', { characterKey: this.characterKey });
  }
}
