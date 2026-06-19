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

    // 으악 텍스트
    this.add.text(GAME_WIDTH / 2, 40, '으악 ㅠㅠ 잡혔다!', {
      fontSize: '18px', color: '#c4b5fd',
      fontFamily: '"Nanum Gothic", sans-serif',
    }).setOrigin(0.5);

    // 빨간 호러 GAME OVER (살짝 기울여 손글씨 느낌)
    this.add.text(GAME_WIDTH / 2, 92, 'GAME OVER', {
      fontSize: '52px', color: '#e11d48',
      fontFamily: '"Nanum Gothic", sans-serif',
      fontStyle: 'bold',
      stroke: '#3b0a0a', strokeThickness: 9,
    }).setOrigin(0.5).setAngle(-3).setDepth(20);

    // 점수
    this.add.text(GAME_WIDTH / 2, 150, `🌙 ${score}m 달렸어요!`, {
      fontSize: '24px', color: '#e9d5ff',
      fontFamily: '"Nanum Gothic", sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(20);

    // ── 나무 간판 버튼 (RETRY / RANK) ──
    const retry = this.makeWoodSign(GAME_WIDTH / 2 - 120, GAME_HEIGHT - 64, 210, 52, 'RETRY');
    const rank = this.makeWoodSign(GAME_WIDTH / 2 + 120, GAME_HEIGHT - 64, 210, 52, 'RANK');

    retry.on('pointerdown', this.restart, this);
    rank.on('pointerdown', () => this.game.events.emit('gorank'), this);

    // 힌트 텍스트
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 22, '스페이스 / 화면 탭으로도 재시작', {
      fontSize: '12px', color: '#7c6aad',
      fontFamily: '"Nanum Gothic", sans-serif',
    }).setOrigin(0.5).setDepth(20);

    // Emit to React
    this.game.events.emit('gameover', score);

    // 스페이스로 재시작
    this.input.keyboard?.once('keydown-SPACE', this.restart, this);
  }

  // ── 나무 간판 스타일 버튼 ──
  private makeWoodSign(x: number, y: number, w: number, h: number, label: string) {
    const g = this.add.graphics().setDepth(20);
    const draw = (fill: number) => {
      g.clear();
      g.fillStyle(0x5b3413, 1);                       // 나무 테두리(어두운 갈색)
      g.fillRoundedRect(x - w / 2 - 4, y - h / 2 - 4, w + 8, h + 8, 12);
      g.fillStyle(fill, 1);                           // 간판 본체(노란 나무)
      g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
      g.fillStyle(0xffffff, 0.18);                    // 윗면 하이라이트
      g.fillRoundedRect(x - w / 2 + 6, y - h / 2 + 5, w - 12, h / 2 - 6, 8);
    };
    draw(0xf2b705);

    this.add.text(x, y, label, {
      fontSize: '26px', color: '#7c2d12',
      fontFamily: '"Nanum Gothic", sans-serif', fontStyle: 'bold',
      stroke: '#fde68a', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(21);

    const zone = this.add.zone(x, y, w + 8, h + 8)
      .setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => draw(0xfcd34d));
    zone.on('pointerout', () => draw(0xf2b705));
    return zone;
  }

  private restart() {
    this.game.events.emit('restart');
    this.scene.start('GameScene', { characterKey: this.characterKey });
  }
}
