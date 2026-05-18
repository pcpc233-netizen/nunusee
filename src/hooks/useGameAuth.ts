import { useState, useEffect } from 'react';

const GUEST_ID = 'guest-test-user';
const GUEST_NICKNAMES = ['테스트토끼', '익명덕춘', '게스트덕자', '임시덕희'];
const KAKAO_JS_KEY = '6a7527169a91306857186d8191a04558';

interface KakaoUser {
  id: string;
  nickname: string;
}

function initKakao() {
  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_JS_KEY);
  }
}

export function useGameAuth() {
  const [kakaoUser, setKakaoUser] = useState<KakaoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    initKakao();

    const savedId = localStorage.getItem('kakaoUserId');
    const savedNickname = localStorage.getItem('kakaoNickname');
    if (savedId && savedNickname) {
      setKakaoUser({ id: savedId, nickname: savedNickname });
    }
    setLoading(false);
  }, []);

  const signInWithKakao = () => {
    initKakao();
    window.Kakao.Auth.login({
      scope: 'profile_nickname,profile_image',
      success: () => {
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: (res) => {
            const kakaoId = String(res.id);
            const nickname =
              res.kakao_account?.profile?.nickname ||
              res.properties?.nickname ||
              '덕희팬';

            const storageKey = `kakao_uuid_${kakaoId}`;
            let localUuid = localStorage.getItem(storageKey);
            if (!localUuid) {
              localUuid = crypto.randomUUID();
              localStorage.setItem(storageKey, localUuid);
            }

            localStorage.setItem('kakaoNickname', nickname);
            localStorage.setItem('kakaoUserId', localUuid);
            setKakaoUser({ id: localUuid, nickname });
          },
          fail: (err) => console.error('Kakao user info failed', err),
        });
      },
      fail: (err) => console.error('Kakao login failed', err),
    });
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
    if (window.Kakao?.Auth) {
      window.Kakao.Auth.logout();
    }
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
