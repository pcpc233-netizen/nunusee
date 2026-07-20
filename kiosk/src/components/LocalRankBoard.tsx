import { useEffect, useState } from 'react';
import { getTopScores, type ScoreRecord } from '../lib/localScores';

interface Props {
  onClose: () => void;
}

const RANK_ICON = ['🥇', '🥈', '🥉'];

export default function LocalRankBoard({ onClose }: Props) {
  const [scores, setScores] = useState<ScoreRecord[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTopScores().then((list) => { if (!cancelled) setScores(list); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 anim-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#1a0a4e] border-2 border-purple-700/50 rounded-3xl shadow-2xl w-[92vw] max-w-md p-6 sm:p-8 anim-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center text-2xl sm:text-3xl font-black text-amber-300 mb-1">🏆 오늘의 TOP10</p>
        <p className="text-center text-purple-400 text-xs sm:text-sm mb-5">이 기기에서 기록된 최고 기록이에요</p>

        <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
          {scores === null && (
            <p className="text-center text-purple-400 py-6">불러오는 중...</p>
          )}
          {scores?.length === 0 && (
            <p className="text-center text-purple-400 py-6">아직 기록이 없어요. 첫 주자가 되어보세요!</p>
          )}
          {scores?.map((s, i) => (
            <div
              key={s.ts}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-purple-950/50 border border-purple-800/30"
            >
              <span className="w-8 text-center font-black text-lg">{i < 3 ? RANK_ICON[i] : i + 1}</span>
              <span className="flex-1 text-purple-200 font-bold">{s.score}m</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-lg"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
