import { useState, useEffect, useCallback } from 'react';

const GUEST_ID = 'guest-test-user';
const GUEST_NICKNAMES = ['테스트토끼', '익명덕춘', '게스트덕자', '임시덕희'];
const KAKAO_REST_KEY = '59cc028d28edb52a0ff9669873b10753';
const REDIRECT_URI = 'https://nunusee.vercel.app';

interface KakaoUser {
  id: string;
  nickname: string;
}

export function useGameAuth() {
  const [kakaoUser, setKakaoUser] = useState<KakaoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const handleKakaoCode = useCallback(async (code: string) => {
    try {
      const res = await fetch('/api/kakao-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!data.id) {
        console.error('Auth failed:', data);
        return;
      }

      const kakaoId = String(data.id);
      const nickname = data.nickname || '덕희팬';

      const storageKey = `kakao_uuid_${kakaoId}`;
      let localUuid = localStorage.getItem(storageKey);
      if (!localUuid) {
        localUuid = crypto.randomUUID();
        localStorage.setItem(storageKey, localUuid);
      }

      localStorage.setItem('kakaoNickname', nickname);
      localStorage.setItem('kakaoUserId', localUuid);
      setKakaoUser({ id: localUuid, nickname });
    } catch (err) {
      console.error('Kakao callback error', err);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      window.history.replaceState({}, '', window.location.pathname);
      handleKakaoCode(code).finally(() => setLoading(false));
      return;
    }

    const savedId = localStorage.getItem('kakaoUserId');
    const savedNickname = localStorage.getItem('kakaoNickname');
    if (savedId && savedNickname) {
      setKakaoUser({ id: savedId, nickname: savedNickname });
    }
    setLoading(false);
  }, [handleKakaoCode]);

  // Kakao JS SDK 없이 REST API로 직접 OAuth 리다이렉트
  const signInWithKakao = () => {
    const params = new URLSearchParams({
      client_id: KAKAO_REST_KEY,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'profile_nickname,profile_image',
    });
    window.location.href = `https://kauth.kakao.com/oauth/authorize?${params}`;
  };

  const signOut = () => {
    if (isGuest) {
      localStorage.removeItem('guestNickname');
      setIsGuest(false);
      return;
    }
    localStorage.removeItem('kakaoNickname');
    localStorage.removeItem('kakaoUserId');
    setKakaoUser(null);
  };

  const signInAsGuest = () => {
    const randomNick = GUEST_NICKNAMES[Math.floor(Math.random() * GUEST_NICKNAMES.length)];
    localStorage.setItem('guestNickname', randomNick);
    setIsGuest(true);
  };

  const isLoggedIn = !!kakaoUser || isGuest;

  const nickname = isGuest
    ? (localStorage.getItem('guestNickname') ?? '테스트토끼')
    : (kakaoUser?.nickname ?? '익명');

  const effectiveUserId = isGuest ? GUEST_ID : (kakaoUser?.id ?? '');

  return {
    user: kakaoUser ? { id: kakaoUser.id } : null,
    loading,
    isGuest,
    isLoggedIn,
    nickname,
    effectiveUserId,
    signInWithKakao,
    signOut,
    signInAsGuest,
  };
}
