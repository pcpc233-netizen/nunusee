// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { supabase } from './supabase';

// Cast to any to bypass typed schema (game tables not in existing Database type)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export interface ScoreEntry {
  id: string;
  user_id: string;
  nickname: string;
  score: number;
  played_at: string;
}

export interface InvitationData {
  id: string;
  nickname: string;
  score: number;
  issued_at: string;
}

// 점수 제출 + 상위 20% 여부 반환
export async function submitScore(
  userId: string,
  nickname: string,
  score: number
): Promise<{ isTop20: boolean; percentile: number; invitationId: string | null }> {
  const { error: insertError } = await db
    .from('game_scores')
    .insert({ user_id: userId, nickname, score });

  if (insertError) throw insertError;

  // 상위 % = 내 점수보다 높은 사람 수 / 전체 * 100
  const { count: totalCount } = await db
    .from('game_scores')
    .select('*', { count: 'exact', head: true });

  const { count: higherCount } = await db
    .from('game_scores')
    .select('*', { count: 'exact', head: true })
    .gt('score', score);

  const total = totalCount ?? 1;
  const higher = higherCount ?? 0;
  const percentile = (higher / total) * 100;
  const isTop20 = percentile <= 20;

  let invitationId: string | null = null;

  if (isTop20) {
    const { data: inv } = await db
      .from('game_invitations')
      .insert({ user_id: userId, nickname, score })
      .select('id')
      .single();

    invitationId = inv?.id ?? null;
  }

  return { isTop20, percentile: Math.round(percentile), invitationId };
}

// 리더보드 Top 100 (유저당 최고점만)
export async function fetchLeaderboard(): Promise<ScoreEntry[]> {
  const { data, error } = await db
    .from('game_best_scores')
    .select('id, user_id, nickname, score, played_at')
    .order('score', { ascending: false })
    .limit(100);

  if (error) throw error;
  return (data ?? []) as ScoreEntry[];
}

// 전체 고유 플레이어 수
export async function fetchPlayerCount(): Promise<number> {
  const { count } = await db
    .from('game_best_scores')
    .select('user_id', { count: 'exact', head: true });

  return count ?? 0;
}

// 내 초대장 목록
export async function fetchMyInvitations(userId: string): Promise<InvitationData[]> {
  const { data, error } = await db
    .from('game_invitations')
    .select('id, nickname, score, issued_at')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as InvitationData[];
}
