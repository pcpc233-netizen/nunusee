interface KakaoStatic {
  init: (key: string) => void;
  isInitialized: () => boolean;
  Auth: {
    login: (options: {
      scope?: string;
      success?: (authObj: unknown) => void;
      fail?: (err: unknown) => void;
    }) => void;
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
    profile?: {
      nickname?: string;
    };
  };
  properties?: {
    nickname?: string;
  };
}

interface Window {
  Kakao: KakaoStatic;
}
