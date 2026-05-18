interface KakaoStatic {
  init: (key: string) => void;
  isInitialized: () => boolean;
  Auth: {
    authorize: (options: { redirectUri: string; scope?: string }) => void;
    logout: (callback?: () => void) => void;
  };
  API: {
    request: (options: {
      url: string;
      success?: (res: KakaoUserMeResponse) => void;
      fail?: (err: unknown) => void;
    }) => void;
  };
}

interface KakaoUserMeResponse {
  id: number;
  kakao_account?: {
    profile?: { nickname?: string };
  };
  properties?: { nickname?: string };
}

interface Window {
  Kakao: KakaoStatic;
}
