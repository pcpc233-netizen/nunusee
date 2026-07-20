import { useState } from 'react';
import { CHARACTERS, type CharacterDef } from '../game/characters';

interface Props {
  onSelect: (character: CharacterDef) => void;
}

function korParticle(name: string, vowel: string, consonant: string): string {
  const code = name.charCodeAt(name.length - 1);
  if (code < 0xAC00 || code > 0xD7A3) return consonant;
  return (code - 0xAC00) % 28 === 0 ? vowel : consonant;
}

export default function CharacterSelect({ onSelect }: Props) {
  const [selected, setSelected] = useState<CharacterDef>(CHARACTERS[0]);

  return (
    <div
      className="w-screen h-screen flex flex-col items-center justify-center px-6 anim-fade-in"
      style={{ background: 'linear-gradient(180deg, #0d0a2e 0%, #1a0a4e 100%)' }}
    >
      <p className="text-purple-300 text-2xl sm:text-3xl font-black mb-1">캐릭터를 선택하세요</p>
      <p className="text-purple-400 text-sm sm:text-base mb-8">누누씨 토끼 삼자매 중 한 명을 골라주세요</p>

      <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-10 w-full max-w-4xl">
        {CHARACTERS.map((char) => {
          const isSelected = selected.key === char.key;
          return (
            <button
              key={char.key}
              onClick={() => setSelected(char)}
              className={`flex flex-col items-center rounded-3xl p-4 sm:p-6 transition-all border-4 ${
                isSelected
                  ? 'border-amber-400 bg-white/10 scale-105 shadow-2xl'
                  : 'border-transparent bg-white/5 opacity-70'
              }`}
            >
              <img src={char.imageUrl} alt={char.name} className="h-24 sm:h-40 object-contain drop-shadow-xl mb-2" />
              <p className="font-black text-white text-lg sm:text-2xl">{char.name}</p>
              <p className="text-xs sm:text-sm font-bold mt-0.5" style={{ color: char.cssColor }}>{char.trait}</p>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onSelect(selected)}
        className="px-14 py-5 sm:px-20 sm:py-6 rounded-2xl font-black text-amber-900 text-2xl sm:text-3xl shadow-2xl transition-transform active:scale-95 bg-gradient-to-b from-amber-300 to-amber-500 border-4 border-amber-800 anim-cta"
      >
        {selected.name}{korParticle(selected.name, '로', '으로')} 시작하기 🏃
      </button>
    </div>
  );
}
