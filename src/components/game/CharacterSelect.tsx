import { useState } from 'react';
import { CHARACTERS, type CharacterDef } from '../../game/characters';

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
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <p className="text-2xl font-black text-gray-900">캐릭터 선택</p>
        <p className="text-sm text-gray-500 mt-1">누누씨 토끼 삼자매 중 한 명을 골라주세요</p>
      </div>

      {/* Character cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
        {CHARACTERS.map((char) => {
          const isSelected = selected.key === char.key;
          const imgFailed = imgErrors[char.key];

          return (
            <button
              key={char.key}
              onClick={() => setSelected(char)}
              className={`relative flex flex-col items-center rounded-2xl p-2 sm:p-4 transition-all border-4 ${
                isSelected
                  ? 'border-amber-400 shadow-xl scale-105 bg-white'
                  : 'border-transparent bg-white/60 hover:bg-white hover:scale-102 hover:shadow-md'
              }`}
            >
              {isSelected && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow">
                  ✓
                </span>
              )}

              {/* Character image */}
              <div
                className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden mb-2 flex items-center justify-center shadow-inner"
                style={{ backgroundColor: char.cssColor + '33' }}
              >
                {!imgFailed ? (
                  <img
                    src={char.imageUrl}
                    alt={char.name}
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous"
                    onError={() => setImgErrors(prev => ({ ...prev, [char.key]: true }))}
                  />
                ) : (
                  <div
                    className="w-10 h-10 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl sm:text-4xl"
                    style={{ backgroundColor: char.cssColor }}
                  >
                    🐰
                  </div>
                )}
              </div>

              {/* Info */}
              <p className="font-black text-gray-900 text-sm sm:text-lg leading-tight">{char.name}</p>
              <p className="text-xs font-bold mt-0.5 hidden sm:block" style={{ color: char.cssColor }}>
                {char.trait}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 text-center leading-snug hidden sm:block">{char.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Selected preview strip */}
      <div
        className="rounded-2xl p-3 sm:p-4 mb-3 flex items-center gap-3"
        style={{ backgroundColor: selected.cssColor + '22', borderLeft: `4px solid ${selected.cssColor}` }}
      >
        <span className="text-2xl sm:text-3xl">{selected.emoji}</span>
        <div>
          <p className="font-black text-gray-900 text-sm sm:text-base">{selected.name}으로 달릴게요!</p>
          <p className="text-xs sm:text-sm text-gray-500">{selected.desc}</p>
        </div>
      </div>

      <button
        onClick={() => onSelect(selected)}
        className="w-full py-3 sm:py-4 rounded-2xl font-black text-white text-base sm:text-lg shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: selected.cssColor }}
      >
        {selected.name}{korParticle(selected.name, '로', '으로')} 시작하기 🏃
      </button>
    </div>
  );
}
