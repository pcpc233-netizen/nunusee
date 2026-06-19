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
    <div className="min-h-screen bg-gradient-to-b from-[#0d0a2e] to-[#1a0a4e]">
      {/* Header */}
      <header className="bg-[#0d0a2e]/90 backdrop-blur border-b border-purple-900/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/characters/deokhee.png" alt="누누씨" className="w-9 h-9 rounded-full object-cover border-2 border-purple-500/50 shadow-sm shadow-purple-500/30" />
            <div>
              <p className="font-black text-purple-100 text-sm leading-tight">🎃 누누씨 귀신의 집?!</p>
              <p className="text-xs text-purple-400">F.ILLUMINATE® × 누누씨</p>
            </div>
          </div>
          {isLoggedIn && (
            <div className="flex items-center gap-3">
              {isGuest && (
                <span className="text-xs bg-purple-900/60 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-700/50">
                  테스트 모드
                </span>
              )}
              <span className="text-sm text-purple-300 font-medium">{nickname}</span>
              <button
                onClick={signOut}
                className="text-xs text-purple-500 hover:text-purple-300 underline"
              >
                {isGuest ? '게스트 종료' : '로그아웃'}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-purple-900 to-violet-900 py-4 sm:py-6 text-center border-b border-purple-700/30">
        <p className="text-purple-100 font-black text-base sm:text-lg">👻 귀신의 집에서 살아남아라!</p>
        <p className="text-purple-400 text-xs sm:text-sm mt-1">🎃 상위 20% 달성 시 오프라인 팝업 초대장 발급</p>
      </div>

      {/* Tab navigation */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 mt-4 sm:mt-6">
        <div className="flex bg-purple-950/60 border border-purple-800/40 rounded-2xl p-1 shadow-sm mb-4 sm:mb-6 max-w-xs mx-auto">
          {(['game', 'leaderboard'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                tab === t ? 'bg-purple-600 text-white shadow' : 'text-purple-400 hover:text-purple-200'
              }`}
            >
              {t === 'game' ? '🎮 게임' : '🏆 랭킹'}
            </button>
          ))}
        </div>

        {tab === 'game' && (
          <div className="flex flex-col items-center gap-4 sm:gap-6 pb-12">
            {/* How to play */}
            <div className="bg-purple-950/50 border border-purple-800/40 rounded-2xl shadow p-3 sm:p-4 w-full max-w-2xl">
              <h3 className="font-bold text-purple-300 mb-2 text-sm">🎃 게임 방법</h3>
              <div className="grid grid-cols-2 gap-1.5 text-xs text-purple-400">
                <div className="flex items-center gap-1.5">⌨️ <span>스페이스 / 화면 탭 → 점프</span></div>
                <div className="flex items-center gap-1.5">🧪 <span>물약 GET → 더블점프 8초</span></div>
                <div className="flex items-center gap-1.5">👻 <span>유령배지 → 무적 5초</span></div>
                <div className="flex items-center gap-1.5">🏆 <span>상위 20% → 팝업 초대장!</span></div>
              </div>
            </div>

            {isLoggedIn ? (
              <GameWrapper userId={effectiveUserId} nickname={nickname} onGoRank={() => setTab('leaderboard')} />
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
