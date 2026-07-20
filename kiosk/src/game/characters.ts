export interface CharacterDef {
  key: string;
  name: string;
  trait: string;
  desc: string;
  emoji: string;
  bodyColor: number;   // Phaser hex
  earColor: number;
  cssColor: string;    // Tailwind-compatible hex
  imageUrl: string;    // 실제 누누씨 캐릭터 썸네일 (from ilovecharacter.com article)
}

export const CHARACTERS: CharacterDef[] = [
  {
    key: 'deokchun',
    name: '덕춘',
    trait: '첫째 · 평화주의자',
    desc: '눕기를 좋아하고 평화와 사랑을 추구해요',
    emoji: '😌',
    bodyColor: 0xfb923c,   // orange
    earColor: 0xea580c,
    cssColor: '#fb923c',
    imageUrl: '/characters/deokchun.png',
  },
  {
    key: 'deokja',
    name: '덕자',
    trait: '둘째 · 점쟁이',
    desc: '얼굴의 점이 매력포인트! 노는 게 최고예요',
    emoji: '😏',
    bodyColor: 0xc084fc,   // purple
    earColor: 0xa855f7,
    cssColor: '#c084fc',
    imageUrl: '/characters/deokja.png',
  },
  {
    key: 'deokhee',
    name: '덕희',
    trait: '막내 · 주먹파',
    desc: '말보다 주먹! 막내의 반란이 시작돼요',
    emoji: '😤',
    bodyColor: 0xf87171,   // red-pink
    earColor: 0xef4444,
    cssColor: '#f87171',
    imageUrl: '/characters/deokhee.png',
  },
];

export const DEFAULT_CHARACTER = CHARACTERS[0];
