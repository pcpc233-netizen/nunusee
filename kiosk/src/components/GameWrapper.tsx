import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '../game/config';
import { addScore, type ScoreRecord } from '../lib/localScores';
import type { CharacterDef } from '../game/characters';
import LocalRankBoard from './LocalRankBoard';

interface Props {
  character: CharacterDef;
  onExitToAttract: () => void;
  onReselect: () => void;
}

const IDLE_MS = 25000; // 게임오버 후 이 시간 동안 조작 없으면 대기화면으로 복귀

export default function GameWrapper({ character, onExitToAttract, onReselect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onExitRef = useRef(onExitToAttract);
  onExitRef.current = onExitToAttract;
  const onReselectRef = useRef(onReselect);
  onReselectRef.current = onReselect;

  const [result, setResult] = useState<{ score: number; isTop10: boolean; rank: number | null } | null>(null);
  const [showRank, setShowRank] = useState(false);

  const clearIdleTimer = () => {
    if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
  };
  const armIdleTimer = () => {
    clearIdleTimer();
    idleTimerRef.current = setTimeout(() => onExitRef.current(), IDLE_MS);
  };

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const game = new Phaser.Game({ ...gameConfig, parent: containerRef.current });
    gameRef.current = game;

    game.registry.set('characterKey', character.key);

    const handleGameOver = async (score: number) => {
      const list: ScoreRecord[] = await addScore(score);
      const idx = list.findIndex((r) => r.score === score);
      setResult({ score, isTop10: idx !== -1, rank: idx !== -1 ? idx + 1 : null });
      armIdleTimer();
    };

    const handleRestart = () => {
      setResult(null);
      setShowRank(false);
      clearIdleTimer();
    };

    // 게임오버에서 탭/스페이스 → 캐릭터 선택 화면으로 복귀(다시 고르기)
    const handleReselect = () => {
      clearIdleTimer();
      onReselectRef.current();
    };

    const handleShowRank = () => {
      setShowRank(true);
      armIdleTimer();
    };

    game.events.on('gameover', handleGameOver);
    game.events.on('restart', handleRestart);
    game.events.on('reselect', handleReselect);
    game.events.on('showlocalrank', handleShowRank);

    return () => {
      game.events.off('gameover', handleGameOver);
      game.events.off('restart', handleRestart);
      game.events.off('reselect', handleReselect);
      game.events.off('showlocalrank', handleShowRank);
      clearIdleTimer();
      game.destroy(true);
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 게임오버 화면에서 아무 조작이나 있으면 대기 타이머 리셋
  useEffect(() => {
    if (!result) return;
    const reset = () => armIdleTimer();
    window.addEventListener('pointerdown', reset);
    window.addEventListener('keydown', reset);
    return () => {
      window.removeEventListener('pointerdown', reset);
      window.removeEventListener('keydown', reset);
    };
  }, [result]);

  return (
    <div className="relative w-screen h-screen bg-[#0d0a2e] flex items-center justify-center">
      <div ref={containerRef} className="w-full h-full" />

      {result?.isTop10 && (
        <div className="absolute top-[6%] left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 font-black text-lg sm:text-2xl px-6 py-2 rounded-full shadow-xl anim-fade-in-up">
          🎉 오늘의 TOP10 {result.rank}위 달성!
        </div>
      )}

      {showRank && <LocalRankBoard onClose={() => setShowRank(false)} />}
    </div>
  );
}
