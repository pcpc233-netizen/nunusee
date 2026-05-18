import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y } from '../config';
import { CHARACTERS } from '../characters';

export class BootScene extends Phaser.Scene {
  private loadErrors = new Set<string>();

  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // ── 누누씨 캐릭터 PNG 로드 (public/characters/ 에 파일 필요) ──
    CHARACTERS.forEach(char => {
      this.load.image(`char_${char.key}`, `/characters/${char.key}.png`);
    });

    // 로드 실패 시 플래그 저장 → 프로그래매틱 폴백 사용
    this.load.on('loaderror', (file: { key: string }) => {
      this.loadErrors.add(file.key);
    });
  }

  create() {
    // ── 공통 배경 텍스처 ──
    const bgGfx = this.make.graphics({ x: 0, y: 0 });
    bgGfx.fillGradientStyle(0xfef9c3, 0xfef9c3, 0xfde68a, 0xfde68a, 1);
    bgGfx.fillRect(0, 0, GAME_WIDTH, GROUND_Y);
    bgGfx.generateTexture('sky', GAME_WIDTH, GROUND_Y);
    bgGfx.destroy();

    // 지면 (따뜻한 베이지 톤)
    const groundGfx = this.make.graphics({ x: 0, y: 0 });
    groundGfx.fillStyle(0xe8d5b7);
    groundGfx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);
    groundGfx.fillStyle(0xd4b896, 1);
    groundGfx.fillRect(0, 0, GAME_WIDTH, 2);
    groundGfx.fillStyle(0xfdf6e3, 0.5);
    groundGfx.fillRect(0, 5, GAME_WIDTH, 2);
    groundGfx.generateTexture('ground', GAME_WIDTH, GAME_HEIGHT - GROUND_Y);
    groundGfx.destroy();

    // 건물 실루엣 (누누씨 파스텔 팔레트)
    const buildGfx = this.make.graphics({ x: 0, y: 0 });
    // 라벤더 빌딩
    buildGfx.fillStyle(0xddd6fe, 0.55);
    buildGfx.fillRect(0, 40, 28, 60); buildGfx.fillRect(2, 32, 10, 8);
    // 복숭아 빌딩
    buildGfx.fillStyle(0xfed7aa, 0.5);
    buildGfx.fillRect(34, 52, 24, 48); buildGfx.fillRect(38, 44, 8, 8);
    // 민트 빌딩 (제일 큰)
    buildGfx.fillStyle(0xd1fae5, 0.55);
    buildGfx.fillRect(64, 18, 38, 82); buildGfx.fillRect(68, 10, 12, 8);
    // 라벤더 작은 빌딩
    buildGfx.fillStyle(0xe0e7ff, 0.5);
    buildGfx.fillRect(108, 33, 20, 67); buildGfx.fillRect(110, 26, 6, 7);
    // 복숭아 끝 빌딩
    buildGfx.fillStyle(0xfce7f3, 0.5);
    buildGfx.fillRect(134, 45, 26, 55);
    // 창문 포인트
    buildGfx.fillStyle(0xffffff, 0.3);
    [[4,50,6,5],[4,62,6,5],[38,56,6,4],[68,28,8,5],[68,42,8,5],[110,40,5,4],[137,55,6,4]].forEach(([x,y,w,h]) =>
      buildGfx.fillRect(x, y, w, h)
    );
    buildGfx.generateTexture('buildings', 160, 100);
    buildGfx.destroy();

    // 구름 (따뜻한 크림 화이트)
    const cloudGfx = this.make.graphics({ x: 0, y: 0 });
    cloudGfx.fillStyle(0xfef9c3, 0.6);  // 아래 레이어 (노란 기운)
    [[28,30,22],[52,24,24],[74,30,18],[40,36,20]].forEach(([x,y,r]) => cloudGfx.fillCircle(x,y,r));
    cloudGfx.fillStyle(0xfffbeb, 0.95); // 위 레이어 (크림 화이트)
    [[28,26,22],[50,20,24],[72,26,20],[40,32,18]].forEach(([x,y,r]) => cloudGfx.fillCircle(x,y,r));
    cloudGfx.generateTexture('cloud', 104, 52);
    cloudGfx.destroy();

    // ── 장애물: 야근 서류 더미 (누누씨 버전) ──
    const obs1 = this.make.graphics({ x: 0, y: 0 });
    // 서류 더미 (3장, 살짝 어긋나게)
    obs1.fillStyle(0xfde68a); obs1.fillRoundedRect(8, 20, 34, 26, 3);  // 뒤 서류
    obs1.fillStyle(0xfef9c3); obs1.fillRoundedRect(4, 14, 34, 26, 3);  // 중간 서류
    obs1.fillStyle(0xfffbeb); obs1.fillRoundedRect(0, 8, 34, 26, 3);   // 앞 서류
    // 텍스트 줄
    obs1.fillStyle(0xd1d5db);
    obs1.fillRect(5, 14, 20, 2); obs1.fillRect(5, 19, 16, 2);
    obs1.fillRect(5, 24, 18, 2); obs1.fillRect(5, 29, 12, 2);
    // 빨간 도장 (야근 확정!)
    obs1.fillStyle(0xef4444, 0.85); obs1.fillRoundedRect(16, 10, 16, 14, 2);
    obs1.fillStyle(0xffffff, 0.9);
    obs1.fillRect(18, 13, 12, 2); obs1.fillRect(18, 17, 12, 2); obs1.fillRect(18, 21, 12, 2);
    // 상단 폭발 파티클 (작은 별)
    obs1.fillStyle(0xfb923c);
    obs1.fillCircle(36, 5, 5);
    obs1.fillStyle(0xfbbf24);
    obs1.fillRect(33, 2, 6, 2); obs1.fillRect(39, 4, 4, 5);
    obs1.fillRect(32, 5, 4, 5); obs1.fillRect(36, 9, 2, 5);
    obs1.generateTexture('obstacle_bomb', 44, 48); obs1.destroy();

    // ── 장애물: 꼰대상사 (누누씨 스타일) ──
    const obs2 = this.make.graphics({ x: 0, y: 0 });
    // 정장 몸통 (네이비)
    obs2.fillStyle(0x1e3a5f); obs2.fillRoundedRect(4, 26, 32, 50, 4);
    // 흰 셔츠/넥라인
    obs2.fillStyle(0xf8fafc); obs2.fillTriangle(16, 26, 24, 26, 20, 48);
    // 빨간 넥타이
    obs2.fillStyle(0xdc2626); obs2.fillTriangle(18, 26, 22, 26, 20, 46);
    // 넥타이 매듭
    obs2.fillStyle(0xb91c1c); obs2.fillRect(18, 26, 4, 4);
    // 머리 (동글동글, 누누씨 느낌)
    obs2.fillStyle(0xfde68a); obs2.fillCircle(20, 17, 14);
    // 머리카락 (짙은 갈색, 7:3 가르마)
    obs2.fillStyle(0x292524); obs2.fillEllipse(20, 8, 28, 14);
    obs2.fillRect(6, 6, 28, 6);
    // 가르마
    obs2.fillStyle(0xfde68a); obs2.fillRect(22, 5, 3, 8);
    // 눈썹 (찌푸린)
    obs2.fillStyle(0x292524);
    obs2.fillRoundedRect(11, 14, 7, 2.5, 1); obs2.fillRoundedRect(22, 14, 7, 2.5, 1);
    // 눈 (가늘게)
    obs2.fillStyle(0x111827);
    obs2.fillRect(12, 17, 5, 2.5); obs2.fillRect(23, 17, 5, 2.5);
    // 입 (굳은 표정)
    obs2.fillStyle(0xb45309); obs2.fillRoundedRect(15, 22, 10, 2, 1);
    // 명찰
    obs2.fillStyle(0xfbbf24, 0.9); obs2.fillRoundedRect(10, 42, 12, 8, 1);
    obs2.fillStyle(0x1e3a5f);
    obs2.fillRect(12, 44, 8, 1.5); obs2.fillRect(12, 47, 6, 1.5);
    obs2.generateTexture('obstacle_boss', 40, 78); obs2.destroy();

    // ── 장애물: 카톡 단톡알림 (누누씨 버전, 공중) ──
    const obs3 = this.make.graphics({ x: 0, y: 0 });
    // 말풍선 (카톡 그린)
    obs3.fillStyle(0x3ac35a); obs3.fillRoundedRect(0, 0, 62, 44, 10);
    obs3.fillTriangle(6, 44, 22, 44, 14, 56);
    // 배지 느낌 inner highlight
    obs3.fillStyle(0x4ade80, 0.3); obs3.fillRoundedRect(3, 3, 56, 20, 7);
    // 채팅 아이콘 3개
    obs3.fillStyle(0xffffff);
    obs3.fillCircle(15, 22, 7); obs3.fillCircle(31, 22, 7); obs3.fillCircle(47, 22, 7);
    // 점 (…)
    obs3.fillStyle(0x3ac35a);
    obs3.fillCircle(15, 22, 2.5); obs3.fillCircle(31, 22, 2.5); obs3.fillCircle(47, 22, 2.5);
    // 빨간 알림 뱃지
    obs3.fillStyle(0xef4444); obs3.fillCircle(54, 7, 8);
    obs3.fillStyle(0xffffff); obs3.fillRect(51, 5, 6, 2); obs3.fillRect(53, 3, 2, 6);
    obs3.generateTexture('obstacle_notif', 62, 56); obs3.destroy();

    // ── 아이템: 아이스 아메리카노 (누누씨 감성) ──
    const item1 = this.make.graphics({ x: 0, y: 0 });
    // 컵 몸통
    item1.fillStyle(0xfef3c7); item1.fillRoundedRect(3, 8, 26, 28, 5);
    // 커피 색
    item1.fillStyle(0x92400e, 0.85); item1.fillRoundedRect(3, 20, 26, 16, { tl:0, tr:0, bl:5, br:5 });
    // 얼음 조각
    item1.fillStyle(0xbae6fd, 0.7);
    item1.fillRoundedRect(6, 10, 8, 8, 2); item1.fillRoundedRect(16, 12, 7, 7, 2);
    // 뚜껑 (돔형)
    item1.fillStyle(0xe5e7eb); item1.fillRoundedRect(1, 4, 30, 7, 3);
    item1.fillStyle(0xd1d5db); item1.fillRoundedRect(1, 4, 30, 3, { tl:3, tr:3, bl:0, br:0 });
    // 빨대 (누누씨 오렌지)
    item1.fillStyle(0xfb923c); item1.fillRoundedRect(18, 0, 4, 22, 2);
    // 하이라이트
    item1.fillStyle(0xffffff, 0.4); item1.fillRoundedRect(5, 10, 5, 18, 2);
    // 하트 로고
    item1.fillStyle(0xfb923c, 0.9);
    item1.fillCircle(9, 25, 2.5); item1.fillCircle(13, 25, 2.5);
    item1.fillTriangle(6, 26, 16, 26, 11, 31);
    item1.generateTexture('item_coffee', 32, 38); item1.destroy();

    // ── 아이템: 마이웨이 배지 (누누씨 오렌지 별) ──
    const item2 = this.make.graphics({ x: 0, y: 0 });
    // 별 외곽 (누누씨 오렌지)
    item2.fillStyle(0xfb923c);
    const outerVerts: {x:number;y:number}[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 17 : 7;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      outerVerts.push({ x: 18 + r * Math.cos(a), y: 18 + r * Math.sin(a) });
    }
    item2.fillPoints(outerVerts, true);
    // 별 내부 하이라이트 (밝은 오렌지)
    item2.fillStyle(0xfdba74);
    const innerVerts: {x:number;y:number}[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 12 : 5;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      innerVerts.push({ x: 18 + r * Math.cos(a), y: 18 + r * Math.sin(a) });
    }
    item2.fillPoints(innerVerts, true);
    // 중앙 (흰색 반짝임)
    item2.fillStyle(0xffffff, 0.9); item2.fillCircle(18, 18, 4);
    item2.fillStyle(0xfef3c7); item2.fillCircle(18, 18, 2.5);
    item2.generateTexture('item_badge', 36, 36); item2.destroy();

    // ── 먼지 파티클 텍스처 ──
    const dustGfx = this.make.graphics({ x: 0, y: 0 });
    dustGfx.fillStyle(0xd1d5db, 1);
    dustGfx.fillCircle(6, 6, 6);
    dustGfx.generateTexture('dust', 12, 12); dustGfx.destroy();

    // ── 속도선 텍스처 ──
    const speedGfx = this.make.graphics({ x: 0, y: 0 });
    speedGfx.fillStyle(0xffffff, 0.7);
    speedGfx.fillRect(0, 0, 40, 3);
    speedGfx.generateTexture('speedline', 40, 3); speedGfx.destroy();

    // ── PNG 로드 실패 캐릭터 → 프로그래매틱 폴백 생성 ──
    CHARACTERS.forEach((char) => {
      if (this.loadErrors.has(`char_${char.key}`)) {
        this.generateFallbackChar(char.key, char.bodyColor, char.earColor);
      }
    });

    const characterKey = this.registry.get('characterKey') ?? CHARACTERS[0].key;
    this.scene.start('GameScene', { characterKey });
  }

  private generateFallbackChar(key: string, bodyColor: number, earColor: number) {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(bodyColor);
    g.fillEllipse(50, 56, 60, 62);   // 몸
    g.fillCircle(50, 26, 26);         // 머리
    g.fillStyle(earColor);
    g.fillRoundedRect(28, 2, 14, 28, 6);  // 왼쪽 귀
    g.fillRoundedRect(58, 2, 14, 28, 6);  // 오른쪽 귀
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
