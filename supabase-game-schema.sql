-- 누누씨 귀신의 집?! — Supabase 스키마
-- Supabase SQL Editor에서 실행하세요

-- 점수 테이블
create table if not exists game_scores (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete cascade,
  nickname    text not null,
  score       integer not null,
  played_at   timestamptz default now()
);

create index if not exists game_scores_score_desc on game_scores (score desc);
create index if not exists game_scores_user_id    on game_scores (user_id);

-- 초대장 테이블 (상위 20% 달성 시 발급)
create table if not exists game_invitations (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete cascade,
  nickname    text not null,
  score       integer not null,
  issued_at   timestamptz default now()
);

create index if not exists game_invitations_user_id on game_invitations (user_id);

-- RLS 활성화
alter table game_scores      enable row level security;
alter table game_invitations enable row level security;

-- 점수: 누구나 읽기, 본인만 쓰기
create policy "scores_read_all"  on game_scores for select using (true);
create policy "scores_insert_own" on game_scores for insert with check (auth.uid() = user_id);

-- 초대장: 본인만 읽기/쓰기
create policy "inv_read_own"   on game_invitations for select using (auth.uid() = user_id);
create policy "inv_insert_own" on game_invitations for insert with check (auth.uid() = user_id);

-- 상위 20% 퍼센타일 계산 함수
create or replace function get_score_percentile(p_score integer)
returns float
language sql
security definer
as $$
  select
    case
      when (select count(*) from game_scores) = 0 then 100.0
      else
        (select count(*)::float from game_scores where score > p_score)
        / (select count(*)::float from game_scores) * 100.0
    end;
$$;
