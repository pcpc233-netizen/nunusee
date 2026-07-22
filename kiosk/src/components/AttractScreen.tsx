import { useEffect, useMemo, useState } from 'react';
import { CHARACTERS } from '../game/characters';
import { getTopScores } from '../lib/localScores';

interface Props {
  onStart: () => void;
}

const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  top: Math.random() * 62,
  left: Math.random() * 100,
  size: Math.random() > 0.7 ? 3 : 2,
  delay: Math.random() * 3,
}));

const SPARKLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: 4 + Math.random() * 92,
  delay: Math.random() * 8,
  duration: 5 + Math.random() * 4,
  color: i % 2 === 0 ? '#fbbf24' : '#c4b5fd',
}));

export default function AttractScreen({ onStart }: Props) {
  const [topScore, setTopScore] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTopScores().then((list) => {
      if (!cancelled && list.length > 0) setTopScore(list[0].score);
    });
    return () => { cancelled = true; };
  }, []);

  const bats = useMemo(
    () => [
      { top: '14%', delay: 0, duration: 13 },
      { top: '24%', delay: 6, duration: 16 },
    ],
    []
  );

  return (
    <div
      onClick={onStart}
      className="relative w-screen h-screen overflow-hidden cursor-pointer select-none"
      style={{ background: 'linear-gradient(180deg, #0d0a2e 0%, #1a0a4e 62%, #150a3d 100%)' }}
    >
      {/* 별 */}
      {STARS.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white anim-twinkle"
          style={{
            top: `${s.top}%`, left: `${s.left}%`,
            width: s.size, height: s.size,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* 달 */}
      <div className="absolute top-[6%] right-[8%]">
        <div
          className="absolute inset-0 rounded-full anim-glow"
          style={{ width: 140, height: 140, left: -20, top: -20, background: 'radial-gradient(circle, rgba(254,249,195,0.35) 0%, transparent 70%)' }}
        />
        <div className="relative rounded-full" style={{ width: 100, height: 100, background: '#fef9c3', boxShadow: '0 0 40px rgba(254,249,195,0.5)' }}>
          <div className="absolute rounded-full" style={{ width: 78, height: 78, background: '#1a0a4e', top: -6, left: 30 }} />
        </div>
      </div>

      {/* 박쥐 (배경 장식, 흐릿하게) */}
      {bats.map((b, i) => (
        <img
          key={i}
          src="/assets/bat.png"
          alt=""
          className="absolute w-10 opacity-40 anim-bat"
          style={{ top: b.top, animationDelay: `${b.delay}s`, animationDuration: `${b.duration}s` }}
        />
      ))}

      {/* 반짝이는 파티클 */}
      {SPARKLES.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full anim-sparkle"
          style={{
            left: `${s.left}%`, bottom: '22%',
            width: 5, height: 5, background: s.color,
            boxShadow: `0 0 6px ${s.color}`,
            animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s`,
          }}
        />
      ))}

      {/* 지면 */}
      <div className="absolute bottom-0 left-0 right-0 h-[16%]" style={{ background: 'linear-gradient(180deg, #14420f 0%, #0a1f0a 100%)' }} />
      <img src="/assets/bush2.png" alt="" className="absolute bottom-[13%] left-[4%] h-20 sm:h-28 opacity-90" />
      <img src="/assets/bush1.png" alt="" className="absolute bottom-[13%] right-[6%] h-16 sm:h-24 opacity-90" />
      <img src="/assets/candle_lit.png" alt="" className="absolute bottom-[14%] left-[26%] h-12 sm:h-16 anim-flicker" />
      <img src="/assets/candle.png" alt="" className="absolute bottom-[14%] right-[22%] h-11 sm:h-14 anim-flicker" style={{ animationDelay: '1.1s' }} />

      {/* 상단 브랜드 + 타이틀 간판 */}
      <div className="absolute top-[3%] left-1/2 -translate-x-1/2 flex flex-col items-center">
        <p className="mb-1.5 text-base sm:text-2xl font-black tracking-wide">
          <span className="text-[#f2c14e]">누누씨</span>
          <span className="text-purple-200 font-serif"> × FILLUMINATE<span className="text-[10px] align-super">®</span></span>
        </p>
        <div className="relative">
          <div className="absolute inset-0 anim-glow" style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.35) 0%, transparent 70%)', filter: 'blur(16px)' }} />
          <img src="/assets/sign_haunted.png" alt="누누씨 귀신의 집?!" className="relative w-[70vw] max-w-3xl anim-float-soft drop-shadow-2xl" />
        </div>
      </div>

      {/* 캐릭터 라인업 — 크게, 중앙, 달리는 방향(우측) 보도록 미러 */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 flex items-end justify-center gap-3 sm:gap-8">
        {CHARACTERS.map((c, i) => (
          <div key={c.key} className="anim-bounce" style={{ animationDelay: `${i * 0.25}s` }}>
            <img
              src={c.imageUrl}
              alt={c.name}
              className="drop-shadow-2xl -scale-x-100"
              style={{ height: i === 1 ? '30vh' : '25vh' }}
            />
          </div>
        ))}
      </div>

      {/* ©nunussi 카피라이트 (좌하단) */}
      <img src="/copyright_white.png" alt="©nunussi" className="absolute bottom-[3.5%] left-[3%] h-4 sm:h-5 opacity-70" />

      {/* 오늘의 최고 기록 */}
      {topScore !== null && (
        <div className="absolute top-[4%] left-[4%] bg-purple-950/60 border border-purple-700/40 rounded-full px-4 py-2 anim-fade-in">
          <p className="text-amber-300 font-bold text-sm sm:text-base">🏆 오늘의 최고 기록 {topScore}m</p>
        </div>
      )}

      {/* CTA — 위치잡이(translate-x)와 펄스 애니메이션(scale)을 다른 요소에 분리해 transform 충돌 방지 */}
      <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 w-full text-center">
        <div className="inline-block anim-cta">
          <p className="text-white font-black text-2xl sm:text-4xl drop-shadow-[0_2px_8px_rgba(124,58,237,0.8)] whitespace-nowrap">
            👆 화면을 터치해서 시작하세요
          </p>
          <p className="text-purple-300 text-sm sm:text-base mt-1">귀신을 피해 최대한 멀리 달려보세요!</p>
        </div>
      </div>
    </div>
  );
}
