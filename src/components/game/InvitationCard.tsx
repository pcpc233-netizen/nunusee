import { useRef } from 'react';

interface Props {
  score: number;
  nickname: string;
  characterName?: string;
  characterColor?: string;
  isTop20: boolean;
  percentile: number;
  invitationId: string | null;
}

const KAKAO_JS_KEY = 'db9ebf037297e945b576c801ffb12acf';
const SITE_URL = 'https://nunusee.vercel.app';
const OG_IMAGE = 'https://nunusee.vercel.app/characters/deokhee.png';

function initKakao() {
  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_JS_KEY);
  }
}

export default function InvitationCard({ score, nickname, characterName = '덕춘', characterColor = '#fb923c', isTop20, percentile, invitationId }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  const shareKakao = () => {
    const msg = isTop20
      ? `${nickname}님이 덕희의 마이웨이런에서 ${score}m를 달렸어요! 상위 ${Math.round(percentile)}%로 팝업 초대장을 받았습니다 🐰`
      : `${nickname}님이 덕희의 마이웨이런에서 ${score}m를 달렸어요! 도전해보세요 🏃`;

    initKakao();

    if (window.Kakao?.isInitialized?.()) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '덕희의 마이웨이런 🐰',
          description: msg,
          imageUrl: OG_IMAGE,
          link: { mobileWebUrl: SITE_URL, webUrl: SITE_URL },
        },
        buttons: [{ title: '나도 도전하기', link: { mobileWebUrl: SITE_URL, webUrl: SITE_URL } }],
      });
    } else {
      // fallback: 카카오톡 공유 URL 직접 열기
      const kakaoShareUrl = `https://sharer.kakao.com/talk/friends/picker/link?app_key=${KAKAO_JS_KEY}&validation_action=share&validation_params=${encodeURIComponent(JSON.stringify({
        link_ver: '4.0',
        template_object: {
          object_type: 'feed',
          content: {
            title: '덕희의 마이웨이런 🐰',
            description: msg,
            image_url: OG_IMAGE,
            link: { web_url: SITE_URL, mobile_web_url: SITE_URL },
          },
        },
      }))}`;
      window.open(kakaoShareUrl, '_blank', 'width=500,height=700');
    }
  };

  if (!isTop20) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center max-w-md w-full border border-amber-100">
        <p className="text-3xl mb-2">🏃</p>
        <p className="text-xl font-bold text-gray-800 mb-1">{score}m 달성!</p>
        <p className="text-gray-500 text-sm mb-1">
          상위 {Math.round(percentile)}% 구간이에요.
        </p>
        <p className="text-amber-600 font-semibold mb-4">
          상위 20% 돌파하면 팝업 초대장이 발급됩니다!
        </p>
        <button
          onClick={shareKakao}
          className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-xl transition-colors"
        >
          카카오로 친구에게 자랑하기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 max-w-md w-full">
      {/* 초대장 카드 */}
      <div
        ref={cardRef}
        className="w-full rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #f59e0b 100%)' }}
      >
        <div className="p-8 text-center">
          <div className="text-5xl mb-3">🐰</div>
          <p className="text-xs font-bold tracking-widest text-amber-700 mb-1">FILLUMINATE × 누누씨</p>
          <h2 className="text-2xl font-black text-gray-900 mb-1">팝업 초대장</h2>
          <p className="text-sm text-amber-800 mb-4">오프라인 팝업 스토어 입장 초대</p>

          <div className="bg-white bg-opacity-60 rounded-2xl p-4 mb-4">
            <p className="text-xs text-gray-500 mb-1">달성 기록</p>
            <p className="text-3xl font-black text-gray-900">{score}m</p>
            <p className="text-sm text-amber-700 font-bold">상위 {Math.round(percentile)}% 달성!</p>
          </div>

          <p className="text-xs font-bold mb-1" style={{ color: characterColor }}>{characterName}와 함께 달렸어요 🐰</p>
          <p className="text-sm font-bold text-gray-800">{nickname}님을 초대합니다</p>
          <p className="text-xs text-gray-500 mt-1">초대장 ID: {invitationId?.slice(0, 8).toUpperCase()}</p>
        </div>

        <div className="bg-amber-600 py-2 text-center">
          <p className="text-white text-xs font-bold tracking-wider">마이웨이로 살아남은 당신 · 잘했어요 🎉</p>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3 w-full">
        <button
          onClick={shareKakao}
          className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-xl transition-colors text-sm"
        >
          카카오로 공유하기
        </button>
        <button
          onClick={() => {
            const text = `덕희의 마이웨이런 ${score}m · 상위 ${Math.round(percentile)}% · 초대장 ID: ${invitationId?.slice(0, 8).toUpperCase()}`;
            navigator.clipboard.writeText(text).then(() => alert('초대장 정보 복사됨!'));
          }}
          className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-sm"
        >
          정보 복사
        </button>
      </div>
    </div>
  );
}
