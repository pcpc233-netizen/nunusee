interface Props {
  onLogin: () => void;
}

const CHARS = [
  { key: 'deokchun', name: '덕춘', border: 'border-orange-300', label: 'text-orange-400', size: 'w-14 h-14' },
  { key: 'deokja',   name: '덕자', border: 'border-purple-300', label: 'text-purple-400', size: 'w-16 h-16' },
  { key: 'deokhee',  name: '덕희', border: 'border-pink-300',   label: 'text-pink-400',   size: 'w-14 h-14' },
];

export default function KakaoLogin({ onLogin }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 py-10 px-4">
      {/* F.ILLUMINATE 브랜드 */}
      <p className="font-serif font-black tracking-tight text-[#a01b2e] text-xl leading-none">
        F.ILLUMINATE<span className="text-[10px] align-super">®</span>
      </p>

      {/* 누누씨 삼자매 */}
      <div className="flex items-end justify-center gap-3">
        {CHARS.map((c, i) => (
          <div key={c.key} className="flex flex-col items-center gap-1">
            <img
              src={`/characters/${c.key}.png`}
              alt={c.name}
              className={`${c.size} object-contain drop-shadow-md ${i === 1 ? '-mb-1 scale-110' : ''}`}
            />
            <span className={`text-[11px] font-bold ${c.label}`}>{c.name}</span>
          </div>
        ))}
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center gap-1 mb-2">
          <img src="/assets/tag_nunusee.png" alt="누누씨" className="h-14 object-contain drop-shadow" />
          <img src="/assets/sign_haunted.png" alt="귀신의 집?!" className="h-12 object-contain drop-shadow" />
        </div>
        <p className="text-gray-500 text-sm leading-relaxed">랭킹 등록 및 초대장 발급을 위해<br />카카오 로그인이 필요합니다</p>
      </div>

      <button
        onClick={onLogin}
        className="flex items-center gap-3 px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 w-full max-w-xs justify-center"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3C7.03 3 3 6.36 3 10.5c0 2.64 1.66 4.96 4.17 6.28L6.1 20.1a.38.38 0 0 0 .54.43l4.1-2.72c.41.05.83.07 1.26.07 4.97 0 9-3.36 9-7.5S16.97 3 12 3z"
            fill="#3C1E1E"
          />
        </svg>
        카카오로 시작하기
      </button>

      <p className="text-xs text-gray-400">로그인 없이는 점수가 저장되지 않습니다</p>
    </div>
  );
}
