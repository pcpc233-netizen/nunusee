import { useEffect, useState } from 'react';
import { fetchLeaderboard, fetchPlayerCount, type ScoreEntry } from '../../lib/game-api';

export default function Leaderboard({ myUserId }: { myUserId?: string }) {
  const [board, setBoard] = useState<ScoreEntry[]>([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchLeaderboard(), fetchPlayerCount()])
      .then(([entries, count]) => {
        setBoard(entries);
        setPlayerCount(count);
      })
      .catch((err) => {
        console.error('Leaderboard fetch error:', err);
        setError('랭킹을 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
      })
      .finally(() => setLoading(false));
  }, []);

  const rankColors = ['🥇', '🥈', '🥉'];

  if (loading) {
    return <div className="text-center py-12 text-amber-600 animate-pulse">랭킹 불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={() => { setError(null); setLoading(true); }}
          className="mt-3 text-xs text-amber-600 underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-gray-900">전체 랭킹 TOP 100</h2>
        <span className="text-sm text-gray-500">총 {playerCount}명 참여</span>
      </div>

      <div className="bg-amber-50 rounded-2xl overflow-hidden shadow-lg border border-amber-100">
        {board.length === 0 && (
          <p className="text-center py-8 text-gray-400">아직 플레이한 사람이 없어요. 첫 번째가 되세요!</p>
        )}
        {board.map((entry, idx) => (
          <div
            key={entry.id}
            className={`flex items-center gap-3 px-4 py-3 border-b border-amber-100 last:border-0 transition-colors ${
              entry.user_id === myUserId ? 'bg-yellow-100' : idx % 2 === 0 ? 'bg-white' : 'bg-amber-50'
            }`}
          >
            <span className="w-8 text-center font-bold text-gray-600 text-sm">
              {idx < 3 ? rankColors[idx] : `${idx + 1}`}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`font-bold truncate text-sm ${entry.user_id === myUserId ? 'text-amber-700' : 'text-gray-800'}`}>
                {entry.nickname}
                {entry.user_id === myUserId && ' (나)'}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(entry.played_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
            <span className="font-black text-gray-900 text-lg">{entry.score}m</span>
          </div>
        ))}
      </div>
    </div>
  );
}
