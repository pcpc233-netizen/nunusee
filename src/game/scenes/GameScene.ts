import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y } from '../config';
import { CHARACTERS } from '../characters';

const CHAR_SCALE = 0.26;          // PNG 이미지 → 게임 크기
const CHAR_BODY_W = 58;           // 히트박스 너비 (px, 스케일 후)
const CHAR_BODY_H = 70;           // 히트박스 높이

const OBSTACLE_TYPES = [
  { key: 'obstacle_bomb', w: 44, h: 48, yOff: 0 },
  { key: 'obstacle_boss', w: 40, h: 78, yOff: 0 },
  { key: 'obstacle_notif', w: 62, h: 56, yOff: -110 }, // 공중 장애물
] as const;

const ITEM_TYPES = ['item_coffee', 'item_badge'] as const;

const EVENT_MESSAGES = [
  '귀신이 나타났다! 👻',
  '으스스한 밤... 😱',
  '저기 뭔가 있어! 👁️',
  '도망쳐어어어!!!',
  '귀신의 집이 깨어났다! 🎃',
];

export class GameScene extends Phaser.Scene {
  private characterKey = CHARACTERS[0].key;

  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private items!: Phaser.Physics.Arcade.Group;
  private dustEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  // Running tweens (paused during jump)
  private runWobble!: Phaser.Tweens.Tween;
  private runBounce!: Phaser.Tweens.Tween;
  private jumpStretchTween: Phaser.Tweens.Tween | null = null;

  private score = 0;
  private speed = 290;
  private isGameOver = false;
  private jumpCount = 0;
  private maxJumps = 1;
  private isInvincible = false;
  private baseScale = CHAR_SCALE;
  private coffeeTimer: Phaser.Time.TimerEvent | null = null;
  private badgeTimer: Phaser.Time.TimerEvent | null = null;

  private scoreText!: Phaser.GameObjects.Text;
  private eventText!: Phaser.GameObjects.Text;
  private clouds: Phaser.GameObjects.Image[] = [];
  private buildings: Phaser.GameObjects.Image[] = [];
  private speedLines: Phaser.GameObjects.Image[] = [];
  private decor: Phaser.GameObjects.Image[] = [];

  private obstacleTimer!: Phaser.Time.TimerEvent;
  private itemTimer!: Phaser.Time.TimerEvent;
  private nextEventScore = 800;
  private lastScoreForSpeed = 0;
  private hardMode = false;

  constructor() { super({ key: 'GameScene' }); }

  create(data?: { characterKey?: string }) {
    if (data?.characterKey) this.characterKey = data.characterKey;

    // Reset
    this.score = 0;
    this.speed = 290;
    this.isGameOver = false;
    this.jumpCount = 0;
    this.maxJumps = 1;
    this.isInvincible = false;
    this.baseScale = CHAR_SCALE;
    this.nextEventScore = 800;
    this.lastScoreForSpeed = 0;
    this.hardMode = false;

    // ── 배경 레이어 ──
    this.add.image(GAME_WIDTH / 2, GROUND_Y / 2, 'sky').setDisplaySize(GAME_WIDTH, GROUND_Y);

    // 건물 실루엣 (parallax 느린 레이어)
    this.buildings = [
      this.add.image(80, GROUND_Y - 50, 'buildings').setAlpha(0.6),
      this.add.image(350, GROUND_Y - 50, 'buildings').setAlpha(0.5),
      this.add.image(620, GROUND_Y - 50, 'buildings').setAlpha(0.55),
    ];

    // 구름 (parallax 빠른 레이어)
    this.clouds = [
      this.add.image(150, 55, 'cloud').setAlpha(0.75),
      this.add.image(480, 35, 'cloud').setAlpha(0.6),
      this.add.image(730, 70, 'cloud').setAlpha(0.5),
    ];

    // 지면
    this.add.tileSprite(GAME_WIDTH / 2, GROUND_Y + (GAME_HEIGHT - GROUND_Y) / 2,
      GAME_WIDTH, GAME_HEIGHT - GROUND_Y, 'ground');

    // 바닥 장식 (촛불/덤불) — 지나가는 배경처럼 스크롤
    const decoDefs: { key: string; h: number }[] = [
      { key: 'deco_candle2', h: 46 }, { key: 'deco_bush2', h: 60 },
      { key: 'deco_candle', h: 42 }, { key: 'deco_bush1', h: 54 },
    ];
    this.decor = decoDefs.map((d, i) => {
      const img = this.add.image(220 + i * 200, GROUND_Y - 2, d.key).setOrigin(0.5, 1).setDepth(6);
      const r = img.width / img.height || 1;
      img.setDisplaySize(d.h * r, d.h);
      return img;
    });

    // 속도선 (공중에 뜨는 흰 선)
    this.speedLines = Array.from({ length: 6 }, (_) =>
      this.add.image(
        Phaser.Math.Between(50, GAME_WIDTH - 100),
        Phaser.Math.Between(40, GROUND_Y - 60),
        'speedline'
      ).setAlpha(0)
    );

    // ── 캐릭터 ──
    const playerY = GROUND_Y - CHAR_BODY_H / 2 - 4;
    this.player = this.physics.add.sprite(120, playerY, `char_${this.characterKey}`);
    this.player.setScale(CHAR_SCALE);
    // 히트박스를 스프라이트 중심 하단에 맞춤
    const sprW = this.player.width;
    const sprH = this.player.height;
    this.player.body.setSize(CHAR_BODY_W / CHAR_SCALE, CHAR_BODY_H / CHAR_SCALE);
    this.player.body.setOffset(
      (sprW - CHAR_BODY_W / CHAR_SCALE) / 2,
      sprH - CHAR_BODY_H / CHAR_SCALE - 4
    );
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);

    // ── 지면 정적 바디 ──
    const groundBlock = this.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 5, GAME_WIDTH, 10);
    this.physics.add.existing(groundBlock, true);
    this.physics.add.collider(this.player, groundBlock, this.onLand, undefined, this);

    // ── 그룹 ──
    this.obstacles = this.physics.add.group();
    this.items = this.physics.add.group();
    this.physics.add.overlap(this.player, this.obstacles, this.handleHit, undefined, this);
    this.physics.add.overlap(this.player, this.items,
      this.handleItem as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);

    // ── 먼지 파티클 ──
    this.dustEmitter = this.add.particles(0, 0, 'dust', {
      lifespan: 380,
      scale: { start: 0.7, end: 0 },
      alpha: { start: 0.55, end: 0 },
      speed: { min: 30, max: 80 },
      angle: { min: 155, max: 205 },
      frequency: 55,
      gravityY: 120,
    });
    this.dustEmitter.startFollow(this.player, -28, CHAR_BODY_H / 2 - 4);
    this.dustEmitter.setDepth(5);

    // ── 달리기 애니메이션 트윈 ──
    this.runWobble = this.tweens.add({
      targets: this.player,
      angle: { from: -5, to: 5 },
      duration: 190,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.runBounce = this.tweens.add({
      targets: this.player,
      scaleX: this.baseScale * 1.07,
      scaleY: this.baseScale * 0.93,
      duration: 190,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // ── 타이머 ──
    this.obstacleTimer = this.time.addEvent({
      delay: 1700, callback: this.spawnObstacle, callbackScope: this, loop: true,
    });
    this.itemTimer = this.time.addEvent({
      delay: 4200, callback: this.spawnItem, callbackScope: this, loop: true,
    });

    // ── UI ──
    // 점수: 목업처럼 상단 중앙 흰색 표시
    this.scoreText = this.add.text(GAME_WIDTH / 2, 28, '0m', {
      fontSize: '34px', color: '#ffffff',
      fontFamily: '"Nanum Gothic", sans-serif', fontStyle: 'bold',
      stroke: '#1e1b4b', strokeThickness: 5,
    }).setOrigin(0.5, 0).setDepth(20);

    this.eventText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 70, '', {
      fontSize: '30px', color: '#f0abfc',
      fontFamily: '"Nanum Gothic", sans-serif', fontStyle: 'bold',
      stroke: '#1e1b4b', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(30).setAlpha(0);

    // ── 입력 ──
    this.input.keyboard?.on('keydown-SPACE', this.doJump, this);
    this.input.keyboard?.on('keyup-SPACE', this.cutJump, this);
    this.input.on('pointerdown', this.doJump, this);
    this.input.on('pointerup', this.cutJump, this);
  }

  // ─── 점프 (누르는 시간에 따라 높낮이 조절) ───
  private doJump() {
    if (this.isGameOver) return;
    if (this.jumpCount < this.maxJumps) {
      this.player.setVelocityY(-760);
      this.jumpCount++;

      // 달리기 트윈 일시정지
      this.runWobble.pause();
      this.runBounce.pause();
      this.dustEmitter.stop();

      // 점프 → 세로 늘어나기 (stretch)
      this.jumpStretchTween = this.tweens.add({
        targets: this.player,
        scaleX: this.baseScale * 0.76,
        scaleY: this.baseScale * 1.38,
        angle: 0,
        duration: 90,
        yoyo: true,
        onComplete: () => { this.jumpStretchTween = null; },
      });
    }
  }

  // ─── 점프 컷 (버튼 떼면 상승 속도 줄여 낮은 점프 구현) ───
  private cutJump() {
    if (this.isGameOver) return;
    if (this.player.body.velocity.y < -300) {
      this.player.setVelocityY(-300);
    }
  }

  // ─── 착지 콜백 ───
  private onLand() {
    if (this.isGameOver) return;
    if (this.jumpCount === 0) return;  // 이미 착지 처리됨

    this.jumpCount = 0;

    // 착지 스쿼시 (stretch 트윈만 정리 — runWobble/runBounce는 paused 상태 유지)
    if (this.jumpStretchTween) {
      this.jumpStretchTween.stop();
      this.jumpStretchTween = null;
    }
    this.tweens.add({
      targets: this.player,
      scaleX: this.baseScale * 1.22,
      scaleY: this.baseScale * 0.74,
      angle: 0,
      duration: 80,
      yoyo: true,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.player.setScale(this.baseScale);
        this.player.setAngle(0);
        this.runWobble.resume();
        this.runBounce.resume();
        this.dustEmitter.start();
      },
    });
  }

  // ─── 장애물 스폰 ───
  private spawnObstacle() {
    if (this.isGameOver) return;
    const type = OBSTACLE_TYPES[Phaser.Math.Between(0, OBSTACLE_TYPES.length - 1)];
    const y = GROUND_Y - type.h / 2 + type.yOff;
    const obs = this.obstacles.create(GAME_WIDTH + type.w / 2, y, type.key) as Phaser.Physics.Arcade.Image;
    this.fitByHeight(obs, type.h);
    obs.setVelocityX(-this.speed);
    if (obs.body) (obs.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    obs.setDepth(8);

    // 하드모드: 30% 확률로 연속 장애물 (다른 타입)
    if (this.hardMode && Phaser.Math.Between(1, 10) <= 3) {
      const gap = Phaser.Math.Between(320, 440);
      this.time.delayedCall(Math.round(gap / this.speed * 1000), () => {
        if (this.isGameOver) return;
        const type2 = OBSTACLE_TYPES[Phaser.Math.Between(0, OBSTACLE_TYPES.length - 1)];
        const y2 = GROUND_Y - type2.h / 2 + type2.yOff;
        const obs2 = this.obstacles.create(GAME_WIDTH + type2.w / 2, y2, type2.key) as Phaser.Physics.Arcade.Image;
        this.fitByHeight(obs2, type2.h);
        obs2.setVelocityX(-this.speed);
        if (obs2.body) (obs2.body as Phaser.Physics.Arcade.Body).allowGravity = false;
        obs2.setDepth(8);
      });
    }
  }

  // ─── 아이템 스폰 ───
  private spawnItem() {
    if (this.isGameOver) return;
    const key = ITEM_TYPES[Phaser.Math.Between(0, ITEM_TYPES.length - 1)];
    const y = GROUND_Y - 90 - Phaser.Math.Between(0, 50);
    const item = this.items.create(GAME_WIDTH + 30, y, key) as Phaser.Physics.Arcade.Image;
    this.fitByHeight(item, 50);
    item.setVelocityX(-this.speed);
    if (item.body) (item.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    item.setData('type', key);
    item.setDepth(8);
    this.tweens.add({ targets: item, y: y - 14, duration: 550, yoyo: true, repeat: -1 });
  }

  // 텍스처를 비율 유지하며 목표 높이로 표시 (히트박스 = 보이는 크기)
  private fitByHeight(img: Phaser.Physics.Arcade.Image, targetH: number) {
    const r = img.width / img.height || 1;
    img.setDisplaySize(targetH * r, targetH);
  }

  // ─── 충돌 ───
  private handleHit() {
    if (this.isInvincible || this.isGameOver) return;
    this.isGameOver = true;
    this.runWobble.stop();
    this.runBounce.stop();
    this.dustEmitter.stop();
    this.obstacleTimer.remove();
    this.itemTimer.remove();

    // 회전하며 날아가는 사망 연출
    this.tweens.add({
      targets: this.player,
      angle: 360, scaleX: 0.1, scaleY: 0.1,
      y: this.player.y - 60,
      alpha: 0,
      duration: 600,
      ease: 'Cubic.easeIn',
    });
    this.cameras.main.shake(300, 0.012);

    this.time.delayedCall(650, () => {
      this.scene.start('GameOverScene', { score: Math.floor(this.score), characterKey: this.characterKey });
    });
  }

  // ─── 아이템 획득 ───
  private handleItem(_player: unknown, item: unknown) {
    const gameItem = item as Phaser.Physics.Arcade.Image;
    const type = gameItem.getData('type') as string;
    gameItem.destroy();

    if (type === 'item_coffee') {
      this.maxJumps = 2;
      this.showFloatingText('부적 GET! 🧧 더블점프!', 0xfbbf24);
      // 기존 타이머 취소 후 새로 시작
      if (this.coffeeTimer) { this.coffeeTimer.remove(); this.coffeeTimer = null; }
      this.coffeeTimer = this.time.delayedCall(8000, () => {
        this.maxJumps = 1;
        this.coffeeTimer = null;
      });
    } else {
      this.isInvincible = true;
      this.player.setTint(0x60a5fa);
      this.showFloatingText('도깨비불! 🔥 무적 5초!', 0x93c5fd);
      // 기존 타이머 취소 후 새로 시작
      if (this.badgeTimer) { this.badgeTimer.remove(); this.badgeTimer = null; }
      // 무적 중 반짝임
      this.tweens.add({
        targets: this.player, alpha: 0.4, duration: 120,
        yoyo: true, repeat: 20,
        onComplete: () => { this.player.setAlpha(1); this.player.clearTint(); },
      });
      this.badgeTimer = this.time.delayedCall(5000, () => {
        this.isInvincible = false;
        this.badgeTimer = null;
      });
    }
  }

  private showFloatingText(msg: string, color: number) {
    const hex = '#' + color.toString(16).padStart(6, '0');
    const txt = this.add.text(GAME_WIDTH / 2, GROUND_Y - 100, msg, {
      fontSize: '20px', color: hex,
      fontFamily: '"Nanum Gothic", sans-serif', fontStyle: 'bold',
      stroke: '#ffffff', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(25);
    this.tweens.add({ targets: txt, y: txt.y - 65, alpha: 0, duration: 1600, onComplete: () => txt.destroy() });
  }

  private activateHardMode() {
    this.hardMode = true;

    // 카메라 흔들림 + 오렌지 플래시
    this.cameras.main.shake(500, 0.02);
    this.cameras.main.flash(600, 76, 29, 149);

    // 🔥 하드모드 알림 텍스트
    const lines = ['💀 1000m 돌파!', '공포 모드 시작!'];
    lines.forEach((line, i) => {
      const txt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60 + i * 44, line, {
        fontSize: i === 0 ? '32px' : '26px',
        color: i === 0 ? '#f0abfc' : '#c4b5fd',
        fontFamily: '"Nanum Gothic", sans-serif',
        fontStyle: 'bold',
        stroke: '#1e1b4b',
        strokeThickness: 6,
      }).setOrigin(0.5).setDepth(35).setAlpha(0);
      this.tweens.add({
        targets: txt,
        alpha: { from: 0, to: 1 },
        scaleX: { from: 0.5, to: 1 },
        scaleY: { from: 0.5, to: 1 },
        duration: 300,
        delay: i * 150,
        ease: 'Back.easeOut',
      });
      this.tweens.add({
        targets: txt,
        alpha: 0,
        duration: 600,
        delay: 1800 + i * 150,
        onComplete: () => txt.destroy(),
      });
    });

    // 즉시 속도 대폭 상승
    this.speed = Math.min(this.speed + 80, 900);
    this.updateGroupSpeeds();
  }

  private triggerEvent() {
    const msg = EVENT_MESSAGES[Phaser.Math.Between(0, EVENT_MESSAGES.length - 1)];
    this.eventText.setText(msg).setAlpha(1);
    this.tweens.add({ targets: this.eventText, alpha: 0, duration: 1400, delay: 900 });
    const boost = this.hardMode ? 65 : 45;
    const cap   = this.hardMode ? 900 : 680;
    this.speed = Math.min(this.speed + boost, cap);
    this.nextEventScore += this.hardMode
      ? 500 + Math.floor(this.score / 500) * 50
      : 800 + Math.floor(this.score / 500) * 80;

    // 속도선 플래시
    this.speedLines.forEach((line, i) => {
      line.setAlpha(0.7).setX(Phaser.Math.Between(80, GAME_WIDTH - 120));
      line.setY(Phaser.Math.Between(30, GROUND_Y - 40));
      this.time.delayedCall(i * 40, () => {
        this.tweens.add({ targets: line, alpha: 0, duration: 300 });
      });
    });
  }

  // ─── 매 프레임 ───
  update(_time: number, delta: number) {
    if (this.isGameOver) return;

    this.score += (delta / 1000) * (this.speed / 9);
    const displayScore = Math.floor(this.score);
    this.scoreText.setText(`${displayScore}m`);
    this.scoreText.setColor(this.hardMode ? '#f87171' : '#ffffff');

    // 1000m 하드모드 진입
    if (displayScore >= 1000 && !this.hardMode) this.activateHardMode();

    // 속도 점진적 증가 (하드모드: 100m마다 +14 / 일반: 200m마다 +8)
    const speedInterval = this.hardMode ? 100 : 200;
    const speedGain    = this.hardMode ? 14 : 8;
    const speedCap     = this.hardMode ? 900 : 680;
    if (displayScore - this.lastScoreForSpeed >= speedInterval) {
      this.speed = Math.min(this.speed + speedGain, speedCap);
      this.lastScoreForSpeed = displayScore;
      this.updateGroupSpeeds();
      // 달리기 트윈도 빠르게
      const newDur = Math.max(70, 190 - Math.floor(displayScore / 400) * 12);
      if (this.runWobble.duration !== newDur) {
        this.runWobble.updateTo('duration', newDur);
        this.runBounce.updateTo('duration', newDur);
      }
    }

    // 이벤트 트리거
    if (displayScore >= this.nextEventScore) this.triggerEvent();

    // 파라랙스
    this.clouds.forEach((c, i) => {
      c.x -= (this.speed * 0.04 * (i * 0.3 + 0.4)) * (delta / 1000);
      if (c.x < -60) c.x = GAME_WIDTH + 60;
    });
    this.buildings.forEach((b, i) => {
      b.x -= (this.speed * 0.015 * (i * 0.2 + 0.5)) * (delta / 1000);
      if (b.x < -90) b.x = GAME_WIDTH + 90;
    });
    this.decor.forEach((d) => {
      d.x -= this.speed * (delta / 1000);
      if (d.x < -60) d.x = GAME_WIDTH + Phaser.Math.Between(60, 260);
    });

    // 화면 밖 오브젝트 제거
    [this.obstacles, this.items].forEach(group =>
      group.getChildren().forEach(o => {
        if ((o as Phaser.Physics.Arcade.Image).x < -120)
          (o as Phaser.Physics.Arcade.Image).destroy();
      })
    );

    this.registry.set('score', displayScore);
  }

  private updateGroupSpeeds() {
    [this.obstacles, this.items].forEach(group =>
      group.getChildren().forEach(o =>
        (o as Phaser.Physics.Arcade.Image).setVelocityX(-this.speed)
      )
    );
    const minDelay  = this.hardMode ? 650 : 950;
    const reduction = this.hardMode ? 40 : 25;
    if (this.obstacleTimer.delay > minDelay) {
      const newDelay = Math.max(minDelay, this.obstacleTimer.delay - reduction);
      this.obstacleTimer.reset({ delay: newDelay, callback: this.spawnObstacle, callbackScope: this, loop: true });
    }
  }
}
