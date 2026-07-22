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
    trait: '첫째 · INFP',
    desc: '눕기를 좋아하고 평화와 사랑을 추구해요',
    emoji: '😌',
    bodyColor: 0xfde68a,   // yellow
    earColor: 0xf59e0b,
    cssColor: '#d4a017',
    imageUrl: '/characters/deokchun.png',
  },
  {
    key: 'deokja',
    name: '덕자',
    trait: '둘째 · ENFP',
    desc: '얼굴의 점이 매력포인트! 노는 게 최고예요',
    emoji: '😏',
    bodyColor: 0xb5793f,   // brown
    earColor: 0x8a5a2b,
    cssColor: '#b5793f',
    imageUrl: '/characters/deokja.png',
  },
  {
    key: 'deokhee',
    name: '덕희',
    trait: '막내 · ESTJ',
    desc: '말보다 주먹! 막내의 반란이 시작돼요',
    emoji: '😤',
    bodyColor: 0xe5e7eb,   // white
    earColor: 0xcbd5e1,
    cssColor: '#64748b',
    imageUrl: '/characters/deokhee.png',
  },
];

export const DEFAULT_CHARACTER = CHARACTERS[0];
