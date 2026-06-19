import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '../../game/config';
import { submitScore } from '../../lib/game-api';
import { DEFAULT_CHARACTER, type CharacterDef } from '../../game/characters';
import { GAME_WIDTH, GAME_HEIGHT } from '../../game/config';
import CharacterSelect from './CharacterSelect';
import InvitationCard from './InvitationCard';

interface Props {
  userId: string;
  nickname: string;
  onGoRank?: () => void;
}

type Phase = 'select' | 'playing';

export default function GameWrapper({ userId, nickname, onGoRank }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [phase, setPhase] = useState<Phase>('select');
  const [character, setCharacter] = useState<CharacterDef>(DEFAULT_CHARACTER);
  const [result, setResult] = useState<{
    score: number;
    isTop20: boolean;
    percentile: number;
    invitationId: string | null;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 최신 onGoRank 참조 (effect 재실행 없이 콜백만 갱신)
  const onGoRankRef = useRef(onGoRank);
  onGoRankRef.current = onGoRank;

  // 전체화면 상태 추적 (캔버스가 화면을 채우도록)
  const [isFs, setIsFs] = useState(false);
  useEffect(() => {
    const onFsChange = () => {
      setIsFs(!!document.fullscreenElement);
      // 컨테이너 크기 변경 후 Phaser 캔버스 재맞춤
      setTimeout(() => gameRef.current?.scale.refresh(), 60);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange as EventListener);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange as EventListener);
      // 언마운트 시 전체화면 해제
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    };
  }, []);

  // Start game after character selected
  useEffect(() => {
    if (phase !== 'playing' || !containerRef.current) return;
    if (gameRef.current) return;

    const game = new Phaser.Game({
      ...gameConfig,
      parent: containerRef.current,
    });
    gameRef.current = game;

    // Pass character key to GameScene on first start
    game.events.once('ready', () => {
      // Phaser fires 'ready' after boot; scenes are already queued.
      // We override the BootScene → GameScene transition via registry.
      game.registry.set('characterKey', character.key);
    });

    const handleGameOver = async (score: number) => {
      if (submitting) return;
      // 게임오버 시 전체화면 해제 — 초대장/결과 카드가 보이도록
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      setSubmitting(true);
      try {
        const res = await submitScore(userId, nickname, score);
        setResult({ score, ...res });
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      } catch (e) {
        console.error('점수 저장 실패', e);
        setResult({ score, isTop20: false, percentile: 100, invitationId: null });
      } finally {
        setSubmitting(false);
      }
    };

    const handleRestart = () => setResult(null);
    const handleGoRank = () => onGoRankRef.current?.();

    game.events.on('gameover', handleGameOver);
    game.events.on('restart', handleRestart);
    game.events.on('gorank', handleGoRank);

    return () => {
      game.events.off('gameover', handleGameOver);
      game.events.off('restart', handleRestart);
      game.events.off('gorank', handleGoRank);
      game.destroy(true);
      gameRef.current = null;
    };
  }, [phase, character.key]);

  const handleCharacterSelect = (char: CharacterDef) => {
    setCharacter(char);
    setPhase('playing');
    // 인게임 진입 시 전체화면 (캐릭터 선택 클릭 = 사용자 제스처)
    requestFs();
  };

  const handleReselect = () => {
    exitFs();
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }
    setResult(null);
    setPhase('select');
  };

  const requestFs = () => {
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    };
    try {
      (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.())?.catch(() => {});
    } catch { /* 일부 브라우저 미지원 — 무시 */ }
  };

  const exitFs = () => {
    const d = document as Document & { webkitExitFullscreen?: () => Promise<void> };
    if (d.fullscreenElement || (d as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement) {
      try { (d.exitFullscreen?.() ?? d.webkitExitFullscreen?.())?.catch(() => {}); } catch { /* 무시 */ }
    }
  };

  if (phase === 'select') {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-4 sm:p-6">
        <CharacterSelect onSelect={handleCharacterSelect} />
      </div>
    );
  }

  return (
    <div className={isFs
      ? 'fixed inset-0 z-[100] bg-[#0d0a2e] flex items-center justify-center'
      : 'flex flex-col items-center gap-4 w-full'}>
      {/* Character badge (전체화면에선 상단 오버레이) */}
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-bold shadow ${
          isFs ? 'absolute top-2 left-1/2 -translate-x-1/2 z-10' : ''
        }`}
        style={{ backgroundColor: character.cssColor }}
      >
        <span>{character.emoji}</span>
        <span>{character.name} 달리는 중!</span>
        <button
          onClick={handleReselect}
          className="ml-2 text-white/70 hover:text-white underline text-xs"
        >
          {isFs ? '나가기' : '바꾸기'}
        </button>
      </div>

      {/* Phaser canvas — 전체화면이면 화면 채움, 아니면 모바일 맞춤 */}
      <div
        className={isFs ? 'overflow-hidden' : 'w-full rounded-2xl overflow-hidden shadow-2xl border-4'}
        style={isFs
          ? { width: '100vw', height: '100vh' }
          : {
              borderColor: character.cssColor + '88',
              maxWidth: GAME_WIDTH,
              aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}`,
            }}
      >
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {submitting && (
        <p className="text-amber-600 font-bold animate-pulse">점수 계산 중...</p>
      )}

      {result && (
        <div ref={resultRef} className="w-full flex flex-col items-center">
        <InvitationCard
          score={result.score}
          nickname={nickname}
          characterName={character.name}
          characterColor={character.cssColor}
          isTop20={result.isTop20}
          percentile={result.percentile}
          invitationId={result.invitationId}
        />
        </div>
      )}
    </div>
  );
}
