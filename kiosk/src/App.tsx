import { useEffect, useRef, useState } from 'react';
import AttractScreen from './components/AttractScreen';
import CharacterSelect from './components/CharacterSelect';
import GameWrapper from './components/GameWrapper';
import { CHARACTERS, type CharacterDef } from './game/characters';

type Phase = 'attract' | 'select' | 'playing';

const SELECT_IDLE_MS = 20000; // 캐릭터 선택 화면에서 이 시간 동안 조작 없으면 대기화면 복귀

export default function App() {
  const [phase, setPhase] = useState<Phase>('attract');
  const [character, setCharacter] = useState<CharacterDef>(CHARACTERS[0]);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goToAttract = () => setPhase('attract');

  // 캐릭터 선택 화면 무입력 타임아웃
  useEffect(() => {
    if (phase !== 'select') {
      if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
      return;
    }
    const arm = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(goToAttract, SELECT_IDLE_MS);
    };
    arm();
    window.addEventListener('pointerdown', arm);
    window.addEventListener('keydown', arm);
    return () => {
      window.removeEventListener('pointerdown', arm);
      window.removeEventListener('keydown', arm);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [phase]);

  if (phase === 'attract') {
    return <AttractScreen onStart={() => setPhase('select')} />;
  }

  if (phase === 'select') {
    return (
      <CharacterSelect
        onSelect={(char) => {
          setCharacter(char);
          setPhase('playing');
        }}
      />
    );
  }

  return (
    <GameWrapper
      character={character}
      onExitToAttract={goToAttract}
      onReselect={() => setPhase('select')}
    />
  );
}
