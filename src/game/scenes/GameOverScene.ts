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

    // 배경 오버레이 (따뜻한 어두움)
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1c1917, 0.7);

    // 캐릭터 이미지 (쓰러진 느낌)
    const charImg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, `char_${this.characterKey}`);
    charImg.setScale(0.38).setAngle(90).setAlpha(0.85);
    // 통통 튀는 입장 연출
    this.tweens.add({
      targets: charImg,
      alpha: { from: 0, to: 0.85 },
      scaleX: { from: 0.1, to: 0.38 },
      scaleY: { from: 0.1, to: 0.38 },
      duration: 400,
      ease: 'Back.easeOut',
    });

    // 게임오버 텍스트
    this.add.text(GAME_WIDTH / 2, 60, '아이고 ㅠㅠ', {
      fontSize: '20px', color: '#fde68a',
      fontFamily: '"Nanum Gothic", sans-serif',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 95, '게임 오버', {
      fontSize: '44px', color: '#ffffff',
      fontFamily: '"Nanum Gothic", sans-serif',
      fontStyle: 'bold',
      stroke: '#fb923c', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 110, `🏃 ${score}m 달렸어요!`, {
      fontSize: '26px', color: '#fde68a',
      fontFamily: '"Nanum Gothic", sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 재시작 버튼 스타일
    const restartBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 68, 220, 40, 0xfb923c, 1).setInteractive();
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 68, '다시 도전하기 🏃', {
      fontSize: '16px', color: '#ffffff',
      fontFamily: '"Nanum Gothic", sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    restartBg.on('pointerover', () => restartBg.setFillStyle(0xf97316));
    restartBg.on('pointerout',  () => restartBg.setFillStyle(0xfb923c));

    // 힌트 텍스트
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30, '스페이스 / 화면 탭으로도 재시작', {
      fontSize: '13px', color: '#a8a29e',
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
