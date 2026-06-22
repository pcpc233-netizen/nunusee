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
  };

  const handleReselect = () => {
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }
    setResult(null);
    setPhase('select');
  };

  if (phase === 'select') {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-4 sm:p-6">
        <CharacterSelect onSelect={handleCharacterSelect} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Character badge */}
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-bold shadow z-10"
        style={{ backgroundColor: character.cssColor }}
      >
        <span>{character.emoji}</span>
        <span>{character.name} 달리는 중!</span>
        <button
          onClick={handleReselect}
          className="ml-2 text-white/70 hover:text-white underline text-xs"
        >
          바꾸기
        </button>
      </div>

      {/* Phaser canvas — 화면 폭의 대부분을 쓰되 적당한 최대치(1040px)로 확대 (full-bleed) */}
      <div className="relative left-1/2 -translate-x-1/2 w-screen flex justify-center px-2">
        <div
          className="rounded-2xl overflow-hidden shadow-2xl border-4"
          style={{
            borderColor: character.cssColor + '88',
            width: 'min(96vw, 1040px)',
            aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}`,
          }}
        >
          <div ref={containerRef} className="w-full h-full" />
        </div>
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
