const ALLOWED_ORIGIN = process.env.APP_ORIGIN || 'https://calcmoum.com';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // env 우선, 없으면 fallback (이미 git 히스토리/현재 main에 존재하는 값 — 키 재발급 시 env로 교체)
  const clientId = process.env.KAKAO_REST_API_KEY || '59cc028d28edb52a0ff9669873b10753';
  const clientSecret = process.env.KAKAO_CLIENT_SECRET || 'U7b60pKzM9zdOhPYWos9jAUwJt6P6Z2X';

  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'No code' });

  try {
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: process.env.KAKAO_REDIRECT_URI || 'https://calcmoum.com',
        code,
      }).toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.status(400).json({ error: 'Token failed', details: tokenData });
    }

    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();

    res.json({
      id: userData.id,
      nickname:
        userData.kakao_account?.profile?.nickname ||
        userData.properties?.nickname ||
        '덕희팬',
    });
  } catch (err) {
    console.error('Kakao token handler error', err);
    res.status(500).json({ error: 'Internal error' });
  }
}
