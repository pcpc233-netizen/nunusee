import { useState } from 'react';
import { useGameAuth } from '../hooks/useGameAuth';
import GameWrapper from '../components/game/GameWrapper';
import KakaoLogin from '../components/auth/KakaoLogin';
import Leaderboard from '../components/game/Leaderboard';

const IS_DEV = import.meta.env.DEV;

type Tab = 'game' | 'leaderboard';

export default function GamePage() {
  const { user, loading, isGuest, isLoggedIn, nickname, effectiveUserId, signInWithKakao, signOut, signInAsGuest } = useGameAuth();
  const [tab, setTab] = useState<Tab>('game');

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-amber-600 animate-pulse text-xl font-bold">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-yellow-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/characters/deokhee.png" alt="누누씨" className="w-9 h-9 rounded-full object-cover border-2 border-amber-200 shadow-sm" />
            <div>
              <p className="font-black text-gray-900 text-sm leading-tight">덕희의 마이웨이런</p>
              <p className="text-xs text-amber-600">PHILUMINATE × 누누씨</p>
            </div>
          </div>
          {isLoggedIn && (
            <div className="flex items-center gap-3">
              {isGuest && (
                <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                  테스트 모드
                </span>
              )}
              <span className="text-sm text-gray-600 font-medium">{nickname}</span>
              <button
                onClick={signOut}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                {isGuest ? '게스트 종료' : '로그아웃'}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-amber-400 to-yellow-400 py-6 text-center">
        <p className="text-white font-black text-lg">🏃 마이웨이로 살아남아라!</p>
        <p className="text-amber-100 text-sm mt-1">상위 20% 달성 시 오프라인 팝업 초대장 발급</p>
      </div>

      {/* Tab navigation */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="flex bg-white rounded-2xl p-1 shadow-sm mb-6 max-w-xs mx-auto">
          {(['game', 'leaderboard'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                tab === t ? 'bg-amber-400 text-white shadow' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'game' ? '🎮 게임' : '🏆 랭킹'}
            </button>
          ))}
        </div>

        {tab === 'game' && (
          <div className="flex flex-col items-center gap-6 pb-12">
            {/* How to play */}
            <div className="bg-white rounded-2xl shadow p-4 w-full max-w-2xl">
              <h3 className="font-bold text-gray-700 mb-3 text-sm">게임 방법</h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">⌨️ <span>스페이스 / 화면 탭 → 점프</span></div>
                <div className="flex items-center gap-2">☕ <span>아아 GET → 더블점프 8초</span></div>
                <div className="flex items-center gap-2">⭐ <span>마이웨이배지 → 무적 5초</span></div>
                <div className="flex items-center gap-2">🏆 <span>상위 20% → 팝업 초대장!</span></div>
              </div>
            </div>

            {isLoggedIn ? (
              <GameWrapper userId={effectiveUserId} nickname={nickname} />
            ) : (
              <div className="bg-white rounded-3xl shadow-lg w-full max-w-md">
                <KakaoLogin onLogin={signInWithKakao} />

                {/* 개발/테스트 환경에서만 표시 */}
                {IS_DEV && (
                  <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                    <p className="text-xs text-center text-gray-400 mb-3">
                      개발 테스트 전용 (배포 시 자동 숨김)
                    </p>
                    <button
                      onClick={signInAsGuest}
                      className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-colors text-sm border-2 border-dashed border-gray-300"
                    >
                      🔧 카카오 없이 테스트하기
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'leaderboard' && (
          <div className="pb-12">
            <Leaderboard myUserId={user?.id} />
          </div>
        )}
      </div>
    </div>
  );
}
