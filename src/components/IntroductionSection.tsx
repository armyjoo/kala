import React, { useState, useEffect } from 'react';
import { Sparkles, MessageCircle, Volume2, HelpCircle, Heart, RefreshCw, Send, Layers } from 'lucide-react';
import { aacCards } from '../data/aacData';
import { AACCard } from '../types';

export default function IntroductionSection() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'request' | 'expression' | 'condition'>('all');
  const [sentenceList, setSentenceList] = useState<AACCard[]>([]);
  const [activeSpeech, setActiveSpeech] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Filter cards based on tab
  const filteredCards = aacCards.filter(
    (card) => selectedCategory === 'all' || card.category === selectedCategory
  );

  // Fallback visual sound effect
  useEffect(() => {
    if (activeSpeech) {
      setIsSpeaking(true);
      const timer = setTimeout(() => {
        setIsSpeaking(false);
        setActiveSpeech(null);
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [activeSpeech]);

  const handleSpeakCard = (card: AACCard) => {
    setActiveSpeech(card.soundText);
    
    // Web Speech API execution
    if ('speechSynthesis' in window) {
      // Cancel previous utterances
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(card.soundText);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9; // speak slightly slower for high accessibility
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }

    // Add to compound sentence builder
    if (!sentenceList.some((item) => item.id === card.id)) {
      setSentenceList((prev) => [...prev, card]);
    }
  };

  const handleClearSentence = () => {
    setSentenceList([]);
  };

  const handleSpeakCombinedSentence = () => {
    if (sentenceList.length === 0) return;
    
    const combinedText = sentenceList.map((card) => card.soundText).join(' ');
    setActiveSpeech(combinedText);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(combinedText);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Intro Grid: Association History, Mission & AAC highlight */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-16">
          
          {/* Left Text Detail Column */}
          <div className="lg:col-span-5 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-sky-600 bg-sky-50 font-sans tracking-wide">
              <Layers className="h-3.5 w-3.5 animate-spin-slow" />
              협회 소개 · ABOUT US
            </span>

            <h2 className="text-3xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
              연천의 선구자들이 써내려가는 <br />
              <span className="text-sky-500">배움과 동행의 따뜻한 혁명</span>
            </h2>

            <div className="text-sm text-slate-600 leading-relaxed space-y-4">
              <p>
                경기도 연천군은 대한민국 포용 교육의 등대를 밝히기 위해 지대한 결단력으로 
                <strong> ‘제1기 장애인 평생학습 강사 양성 교실’</strong>을 출범시켰습니다. 
                그 숭고한 배움의 끈을 이어나가 평생학습의 보편적 혜택을 연천군 전역에 고르게 뿌리내리고자 
                뜻을 같이한 수강 전문가들이 한자리에 모여 본 협회를 정식 출범시켰습니다.
              </p>
              <p>
                우리의 본질적 목적은 단순히 지식의 단편을 이식해주는 것에 그치지 않습니다. 
                중증 인지 및 신체 불편을 안고 교실 안에서 평생 소외받았던 개별 학습자가, 
                진정한 <strong>자립의 의지</strong>를 고추세우고, 한 명의 존엄한 사회 구성원으로서 
                자랑스레 자신의 소망과 고마움을 소리 내어 말할 수 있도록 밀착하여 손을 붙잡는 것입니다.
              </p>
              <p>
                이 소중한 마주함에 장벽을 무너뜨리기 위해, 본 협회는 3대 영역에 달하는 
                <strong>‘마음언어 AAC 카드’ (요청/도움, 감사/표현, 몸 상태)</strong> 전형을 제작하여 무상 보급하고 있습니다. 
                다름을 이해하고, 소통의 틈바구니에 온기 어린 찬란한 공감을 불어넣는 사회, 
                우리가 그리며 일구고 있는 공감플러스 세상의 미래입니다.
              </p>
            </div>

            {/* Elegant KALA Branding Banner */}
            <div className="bg-sky-50/40 border border-sky-100 rounded-2xl p-4.5 flex items-start gap-4 shadow-3xs relative overflow-hidden">
              <div className="absolute -right-2 -bottom-2 opacity-10 font-sans text-5xl text-sky-600 select-none pointer-events-none font-black tracking-tighter">
                KALA
              </div>
              <div className="bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-xl p-3 font-sans font-black text-center text-sm tracking-tighter shrink-0 shadow-2xs">
                KALA
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-sky-600 font-sans uppercase tracking-wider leading-none">
                  Korea Accessible Learning Association
                </span>
                <span className="block text-xs font-black text-slate-800 leading-tight">
                  모두가 배우고, 함께 성장하는 미래
                </span>
                <span className="block text-[10px] text-slate-500 font-medium font-sans leading-none">
                  Accessible Learning, Inclusive Future
                </span>
              </div>
            </div>

            {/* Core Values Stats widget */}
            <div className="grid grid-cols-3 gap-4 border-2 border-slate-50 p-4 rounded-2xl bg-slate-50/50">
              <div className="text-center p-2 rounded-xl bg-white shadow-3xs">
                <span className="block text-2xl font-black text-sky-500">1기</span>
                <span className="text-[10px] text-slate-400 font-semibold font-sans mt-0.5">양성 과정 출신</span>
              </div>
              <div className="text-center p-2 rounded-xl bg-white shadow-3xs">
                <span className="block text-2xl font-black text-orange-400">24종</span>
                <span className="text-[10px] text-slate-400 font-semibold font-sans mt-0.5">AAC 특화 제작</span>
              </div>
              <div className="text-center p-2 rounded-xl bg-white shadow-3xs">
                <span className="block text-2xl font-black text-slate-700">100%</span>
                <span className="text-[10px] text-slate-400 font-semibold font-sans mt-0.5">연천군 소통 밀착</span>
              </div>
            </div>
          </div>

          {/* Right Column: AAC Deck Simulator Card */}
          <div className="lg:col-span-7 bg-slate-50 rounded-3xl border border-slate-200/60 p-5 md:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                  <Volume2 className="h-5 w-5 text-sky-500 animate-pulse" />
                  체험존: 마음언어 AAC 카드 시뮬레이터
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  카드를 터치(클릭)해보세요! 컴퓨터가 감동어린 문장으로 또박또박 낭독해 줍니다.
                </p>
              </div>
              
              {/* Category Filters */}
              <div className="flex flex-wrap gap-1.5 font-sans bg-white p-1 rounded-xl border border-slate-200 shadow-3xs">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    selectedCategory === 'all' ? 'bg-slate-750 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  기본 전체
                </button>
                <button
                  onClick={() => setSelectedCategory('request')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    selectedCategory === 'request' ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  요청 / 도움 🤝
                </button>
                <button
                  onClick={() => setSelectedCategory('expression')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    selectedCategory === 'expression' ? 'bg-orange-400 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  감사 / 표현 ❤️
                </button>
                <button
                  onClick={() => setSelectedCategory('condition')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    selectedCategory === 'condition' ? 'bg-slate-505 bg-slate-400 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  몸 상태 🤕
                </button>
              </div>
            </div>

            {/* Composite Sentence Output Builder Ribbon */}
            <div className="mb-6 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm relative overflow-hidden min-h-[90px] flex flex-col justify-between">
              
              {/* Top info label */}
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-dashed border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-1 font-sans">
                  <Heart className="h-3.5 w-3.5 text-orange-400" />
                  마음 문장 표현창 (선택한 기호 연동)
                </span>
                
                {sentenceList.length > 0 && (
                  <button
                    onClick={handleClearSentence}
                    className="text-[10px] text-slate-500 hover:text-red-500 font-bold flex items-center gap-1 cursor-pointer bg-slate-50 hover:bg-red-50 px-2 py-0.5 rounded-md transition-all"
                  >
                    <RefreshCw className="h-3 w-3" />
                    새로 채우기
                  </button>
                )}
              </div>

              {/* Aggregated Sentence list */}
              <div className="flex flex-wrap gap-1.5 items-center">
                {sentenceList.length === 0 ? (
                  <span className="text-xs text-slate-400 pl-1 font-sans italic">
                    아래 AAC 카드 묶음을 클릭하여 전달할 문장을 조립해 보세요.
                  </span>
                ) : (
                  sentenceList.map((card, idx) => (
                    <span
                      key={`${card.id}-combined-${idx}`}
                      onClick={() => setSentenceList((p) => p.filter((_, i) => i !== idx))}
                      className={`inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1.5 rounded-xl cursor-help shadow-2xs border transition-transform hover:scale-95 ${
                        card.category === 'request'
                          ? 'bg-sky-50 border-sky-100 text-sky-700'
                          : card.category === 'expression'
                          ? 'bg-orange-50 border-orange-100 text-orange-700'
                          : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{card.icon}</span>
                      <span>{card.label}</span>
                      <span className="text-[9px] text-slate-400 ml-0.5">×</span>
                    </span>
                  ))
                )}
              </div>

              {/* Synthesis Reading Action footer */}
              {sentenceList.length > 0 && (
                <div className="mt-3 pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={handleSpeakCombinedSentence}
                    className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 shadow-xs hover:shadow-md cursor-pointer transition-all"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    마음의 목소리 연속 듣기
                  </button>
                </div>
              )}
            </div>

            {/* Sound Triggering Animation Subtitle box */}
            {activeSpeech && (
              <div className="mb-5 p-3 rounded-2xl bg-sky-50/50 border border-sky-100/50 flex items-center justify-center gap-2.5 animate-pulse">
                <div className="flex items-center gap-1 bg-sky-100 px-2.5 py-1 rounded-full">
                  <span className="inline-block h-2 w-2 rounded-full bg-sky-500 animate-ping" />
                  <span className="text-[10px] font-black text-sky-700 font-sans">TTS 작동 중</span>
                </div>
                <span className="text-xs md:text-sm font-black text-slate-700 font-sans">
                  &ldquo;{activeSpeech}&rdquo;
                </span>
              </div>
            )}

            {/* Interactive Grid matching categories themes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {filteredCards.map((card) => {
                const categoryClasses =
                  card.category === 'request'
                    ? 'border-sky-100 hover:border-sky-300 hover:bg-sky-50/60 text-sky-900 group-hover:bg-sky-100/55'
                    : card.category === 'expression'
                    ? 'border-orange-150 hover:border-orange-300 hover:bg-orange-50/50 text-orange-950 group-hover:bg-orange-100/50'
                    : 'border-slate-200 hover:border-slate-350 hover:bg-slate-100/55 text-slate-900 group-hover:bg-slate-200/50';

                const badgeClasses =
                  card.category === 'request'
                    ? 'bg-sky-100 text-sky-700'
                    : card.category === 'expression'
                    ? 'bg-orange-105 bg-orange-100 text-orange-700'
                    : 'bg-slate-200 text-slate-600';

                return (
                  <button
                    key={card.id}
                    onClick={() => handleSpeakCard(card)}
                    className={`group relative flex flex-col items-center justify-center p-4 rounded-2xl bg-white border-2 text-center transition-all duration-300 cursor-pointer shadow-3xs hover:-translate-y-1 hover:shadow-md ${categoryClasses}`}
                  >
                    {/* Card Category Marker */}
                    <span className="absolute top-2 left-2 text-[8px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded-md text-slate-400">
                      {card.id}
                    </span>

                    {/* Card Emoji Asset */}
                    <span className="text-3xl md:text-4xl filter drop-shadow-sm mb-2 transition-transform duration-300 group-hover:scale-115">
                      {card.icon}
                    </span>

                    {/* Korean Text Heading */}
                    <span className="block text-xs font-extrabold tracking-tight mt-1 line-clamp-1">
                      {card.label}
                    </span>

                    {/* English Sub Description */}
                    <span className="block text-[8px] text-slate-400 font-sans mt-0.5 font-medium tracking-tight uppercase line-clamp-1">
                      {card.englishLabel || 'AAC'}
                    </span>

                    {/* Tooltip detail and Speech Indicator hover element */}
                    <div className="absolute inset-0 bg-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="sr-only">{card.description}</span>
                    </div>

                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Volume2 className="h-3 w-3 text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Note on Speech accessibility */}
            <div className="mt-6 flex items-start gap-2 bg-white/70 p-3 rounded-xl border border-slate-100 text-[10px] text-slate-500 font-sans">
              <span className="text-base">💡</span>
              <p className="leading-relaxed">
                마음언어 AAC 카드 시뮬레이터는 한국어 음성 낭독 기술(Web Speech API)을 기반으로 소통 음성을 생성합니다. 지원되지 않는 구형 휴대폰 환경 또는 사운드 차단 환경에서도 문장 표현 창을 가리켜 서로의 눈을 맞추며 원활한 보완 대체의사소통 놀이로 활용하실 수 있습니다.
              </p>
            </div>

          </div>
        </div>

        {/* Sponsors and Cooperating Partners block */}
        <div className="mt-20 pt-10 border-t border-slate-100 animate-fade-in text-center md:text-left">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-sky-655 text-sky-600 bg-sky-50 font-sans tracking-wide">
              🤝 상생 협력 · PARTNERS
            </span>
            <h3 className="mt-3 text-2xl font-black text-slate-805 text-slate-800 tracking-tight">
              행복한 장애인 평생 배움을 함께 일구는 동반자
            </h3>
            <p className="mt-2 text-xs text-slate-400">
              다름을 잇고 공감을 더하는 가치에 동참하여 물심양면 지원과 연대를 이어주는 협력 단체 및 공공기관입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto text-left">
            
            {/* Group 1: 주요 협력 단체 */}
            <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6 space-y-4">
              <h4 className="text-xs font-black text-slate-400 font-sans tracking-wide uppercase border-b border-slate-200/50 pb-2 flex items-center gap-1.5">
                <span className="text-sky-500">■</span> 주요 협력 단체
              </h4>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Partner 1: 한국디지털문해교육협회(협) */}
                <a
                  href="https://kdlea.co.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center gap-3.5 bg-white border border-slate-150 hover:border-sky-305 hover:border-sky-300 p-4 rounded-xl group transition-all shadow-3xs cursor-pointer"
                  title="한국디지털문해교육협회 홈페이지로 연결됩니다"
                >
                  {/* Inline DLE Smiley Blue Circle logo */}
                  <svg className="h-10 w-10 shrink-0 group-hover:scale-108 transition-transform" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="45" fill="#0066FF" />
                    <text x="25" y="46" fill="white" fontSize="18" fontWeight="800" fontFamily='"Inter", sans-serif' textAnchor="middle">D</text>
                    <text x="75" y="46" fill="white" fontSize="18" fontWeight="800" fontFamily='"Inter", sans-serif' textAnchor="middle">E</text>
                    <text x="50" y="60" fill="white" fontSize="18" fontWeight="800" fontFamily='"Inter", sans-serif' textAnchor="middle">L</text>
                    <path d="M 32 68 Q 50 82 68 68" stroke="white" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                  </svg>
                  <div className="text-left">
                    <span className="block text-[11px] text-slate-400 font-bold font-sans">협회 지정 핵심 파트너</span>
                    <span className="text-xs font-black text-slate-800 group-hover:text-sky-600 transition-colors">
                      한국디지털문해교육협회(협)
                    </span>
                  </div>
                </a>

                {/* Partner 2: AIPLE연구소 */}
                <div
                  className="flex-1 flex items-center gap-3.5 bg-white border border-slate-150 p-4 rounded-xl group transition-all shadow-3xs cursor-not-allowed"
                  title="AIPLE연구소는 준비 중이며, 아직 별도 홈페이지가 존재하지 않습니다."
                >
                  {/* Inline high-fidelity AIPLE Custom Logo with leaf-e, child & stars */}
                  <svg className="h-10 w-10 shrink-0 group-hover:scale-108 transition-all" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="aipleLeafGrad" x1="15" y1="85" x2="65" y2="15" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#144253" /> {/* Deep teal base */}
                        <stop offset="45%" stopColor="#238C5B" /> {/* Rich forest green */}
                        <stop offset="85%" stopColor="#6BC235" /> {/* Vivid leaf green */}
                        <stop offset="100%" stopColor="#A4E022" /> {/* Bright lime/yellow tip */}
                      </linearGradient>
                    </defs>
                    
                    {/* Left leaf sprout */}
                    <path d="M 28 46 C 20 44, 8 49, 12 37 C 14 32, 23 37, 28 42 Z" fill="#144253" />
                    <path d="M 28 42 C 24 39, 14 39, 16 33 C 17 31, 23 33, 28 38 Z" fill="#238C5B" />

                    {/* Main dynamic stylized leaf 'e' body */}
                    <path d="M 45 15 
                             C 28 15, 14 30, 14 52 
                             C 14 74, 30 84, 52 84 
                             C 62 84, 69 77, 65 67 
                             C 61 58, 51 52, 42 52
                             C 34 52, 26 56, 26 62
                             C 26 68, 32 72, 40 72
                             C 48 72, 54 66, 55 60
                             C 52 64, 44 64, 38 64
                             C 30 64, 26 60, 26 54
                             C 26 44, 36 34, 48 34
                             C 58 34, 64 42, 62 52
                             C 64 42, 68 28, 54 22
                             Z" 
                          fill="url(#aipleLeafGrad)" />
                    
                    {/* Stylized Upper leaf-tip flare */}
                    <path d="M 45 15 C 56 12, 64 16, 64 22 C 60 22, 52 20, 45 25 Z" fill="#6BC235" />

                    {/* Child/Human figure in deep navy-blue (#132F4C) */}
                    {/* Head */}
                    <circle cx="72" cy="48" r="5" fill="#132F4C" />
                    {/* Torso & REACHING up Arm */}
                    <path d="M 64 74 
                             C 64 68, 67 62, 72 62 
                             C 74 62, 75 64, 76 66 
                             C 78 63, 81 58, 85 45 
                             C 86.2 41, 87.5 42, 86.5 45
                             C 83.5 56, 79 64, 76 67 
                             L 76 74 
                             Z" 
                          fill="#132F4C" />

                    {/* Stars of Empowerment (Touched Star, Background Stars) */}
                    <polygon points="87,30 88.5,33.5 92,33.5 89,35.5 90.5,39 87,37 83.5,39 85,35.5 82,33.5 85.5,33.5" fill="#86E21D" />
                    <polygon points="79,35 80,37.5 82.5,37.5 80.5,39 81.5,41.5 79,40 76.5,41.5 77.5,39 75.5,37.5 78,37.5" fill="#86E21D" opacity="0.8" />
                    <polygon points="86,43 86.6,44.5 88,44.5 87,45.3 87.5,46.8 86,46 84.5,46.8 85,45.3 84,44.5 85.4,44.5" fill="#86E21D" opacity="0.72" />
                  </svg>
                  <div className="text-left">
                    <span className="block text-[11px] text-slate-400 font-bold font-sans">AIPLE 연구소 · 에듀테크</span>
                    <span className="text-xs font-black text-slate-800">
                      AIPLE 연구소 <span className="text-[10px] text-slate-400 font-normal font-sans block mt-0.5">AI & Info for People's Empowerment</span>
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Group 2: 공공기관 */}
            <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6 space-y-4">
              <h4 className="text-xs font-black text-slate-400 font-sans tracking-wide uppercase border-b border-slate-200/50 pb-2 flex items-center gap-1.5">
                <span className="text-orange-500">■</span> 공공기관
              </h4>
              
              {/* Partner 3: 연천군 통일평생교육원 */}
              <a
                href="https://yclll.gseek.kr/user/main"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 bg-white border border-slate-150 hover:border-orange-305 hover:border-orange-300 p-4 rounded-xl group transition-all shadow-3xs cursor-pointer"
                title="연천군 통일평생교육원 홈페이지로 연결됩니다"
              >
                {/* Inline "구석구석" orange and slate logo */}
                <svg className="h-10 w-24 shrink-0 group-hover:scale-103 transition-all" viewBox="0 0 240 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="15" width="40" height="12" fill="#F07C22" rx="2" />
                  <rect x="10" y="15" width="12" height="35" fill="#2E4057" rx="2" />
                  <rect x="10" y="38" width="40" height="12" fill="#F07C22" rx="2" />
                  
                  <rect x="60" y="15" width="40" height="12" fill="#2E4057" rx="2" />
                  <rect x="88" y="15" width="12" height="35" fill="#2E4057" rx="2" />
                  <rect x="60" y="38" width="40" height="12" fill="#F07C22" rx="2" />
                  
                  <rect x="115" y="15" width="40" height="12" fill="#2E4057" rx="2" />
                  <rect x="115" y="15" width="12" height="35" fill="#2E4057" rx="2" />
                  <rect x="115" y="38" width="40" height="12" fill="#F07C22" rx="2" />
                  
                  <rect x="165" y="15" width="40" height="12" fill="#F07C22" rx="2" />
                  <rect x="193" y="15" width="12" height="35" fill="#2E4057" rx="2" />
                  <rect x="165" y="38" width="40" height="12" fill="#2E4057" rx="2" />
                  
                  <line x1="10" y1="65" x2="230" y2="65" stroke="#2E4057" strokeWidth="2.5" />
                  <text x="230" y="85" fill="#2E4057" fontSize="14" fontWeight="800" fontFamily='"Inter", sans-serif' textAnchor="end">연천군 교육종합포털</text>
                </svg>
                <div className="text-left ml-2">
                  <span className="block text-[11px] text-slate-400 font-bold font-sans">연천 평생교육 지원 거점</span>
                  <span className="text-xs font-black text-slate-800 group-hover:text-orange-500 transition-colors">
                    연천군 통일평생교육원 (교육포털)
                  </span>
                </div>
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
