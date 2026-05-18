import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

const GUEST_ID = 'guest-test-user';
const GUEST_NICKNAMES = ['테스트토끼', '익명덕춘', '게스트덕자', '임시덕희'];

export function useGameAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setIsGuest(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signInWithKakao = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: window.location.origin,
        scopes: 'profile_nickname profile_image',
      },
    });
  };

  const signOut = async () => {
    setIsGuest(false);
    await supabase.auth.signOut();
  };

  // 개발/테스트 환경 전용 게스트 로그인
  const signInAsGuest = () => {
    const randomNick = GUEST_NICKNAMES[Math.floor(Math.random() * GUEST_NICKNAMES.length)];
    localStorage.setItem('guestNickname', randomNick);
    setIsGuest(true);
  };

  const signOutGuest = () => {
    localStorage.removeItem('guestNickname');
    setIsGuest(false);
  };

  const isLoggedIn = !!user || isGuest;

  const nickname = isGuest
    ? (localStorage.getItem('guestNickname') ?? '테스트토끼')
    : (user?.user_metadata?.name ||
       user?.user_metadata?.full_name ||
       user?.email?.split('@')[0] ||
       '익명');

  // 게스트는 점수 저장 시 더미 userId 사용
  const effectiveUserId = isGuest ? GUEST_ID : (user?.id ?? '');

  return {
    user,
    loading,
    isGuest,
    isLoggedIn,
    nickname,
    effectiveUserId,
    signInWithKakao,
    signOut: isGuest ? signOutGuest : signOut,
    signInAsGuest,
  };
}
