/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_APP_ORIGIN?: string;
  readonly VITE_KAKAO_REST_KEY: string;
  readonly VITE_KAKAO_JS_KEY: string;
  readonly VITE_KAKAO_REDIRECT_URI?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
