import React from 'react';
import { Quote, Sparkles, HeartHandshake, Award } from 'lucide-react';

export default function GreetingsSection() {
  return (
    <section className="py-12 md:py-20 bg-slate-50/50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        
        {/* Editorial Greeting Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-orange-600 bg-orange-50 font-sans tracking-wide">
            <Sparkles className="h-3 w-3" />
            인사말 · GREETINGS
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
            다름을 잇는 공감플러스+
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            소통의 장벽을 낮추고 배움의 평평한 터전을 가꿉니다
          </p>
          <p className="mt-1.5 text-[10px] md:text-xs text-sky-600 font-sans tracking-wider uppercase font-extrabold bg-sky-50/70 inline-block px-3 py-1 rounded-full">
            KALA &middot; Accessible Learning, Inclusive Future (모두가 배우고, 함께 성장하는 미래)
          </p>
        </div>

        {/* Paper Letter Container */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-xl p-8 md:p-14">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-400 via-orange-400 to-sky-500" />
          
          <div className="absolute right-8 top-8 opacity-5 text-slate-400 pointer-events-none">
            <Quote className="h-28 w-28" />
          </div>

          {/* Letter Body */}
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-6">
            <p className="text-lg md:text-xl font-bold text-slate-800 leading-snug">
              안녕하십니까? <br />
              <span className="text-sky-600 bg-sky-50 px-1 rounded-lg">장애인 평생학습 강사 협회</span> 방문을 진심으로 따뜻하게 환영합니다.
            </p>

            <p className="indent-4">
              모든 인간은 태어남과 동시에 배울 수 있는 권리를 부여받으며, 일생의 지식을 체득하고 다듬는 
              공정은 결코 소수의 전유물이나 자비로운 시선 아래 제공되는 시혜적 특혜가 되어서는 안 됩니다. 
              평생학습은 인간으로서 누려야 할 가장 숭고하며 본질적인 권리이며, 다름을 인정받고 마땅히 
              배움의 기쁨 속에 머무르는 것에서 비로소 참다운 자립의 첫 단추가 놓입니다.
            </p>

            <p className="indent-4">
              우리 협회는 <strong>경기도 연천군</strong>이 개척한 선구적 기반인 ‘제1기 장애인 평생학습 전문강사 양성 과정’의 
              뜨거운 주춧돌 위에서 시작되었습니다. ‘다름’을 ‘배려’와 ‘이해’라는 든든한 돋움판으로 바꾸고, 
              평생 배움의 길목마다 깊은 동반자적 연대를 불어넣고자 발걸음을 이었습니다. 
              특히 의사소통 장벽으로 마음속에 고여 있던 소중한 이야기들을 꺼내지 못했던 학습자들을 위해, 
              가장 단순하면서도 따뜻한 의사소통 지원 체계인 <strong>‘마음언어 AAC 카드’</strong>를 제작했으며 
              서로 간 온기 가득한 가교를 놓는데 도움을 드리고자 합니다.
            </p>

            <p className="indent-4">
              장벽이 존재하지 않는 평등한 평생 배움터를 실현시키기 위해서는 한 사람 한 사람의 애틋한 
              눈빛과 지치지 않는 경청의 호흡이 필요합니다. 우리 협회 소속 강사진은 단순 지식 전수자를 넘어, 
              학습자의 손끝에 힘을 보태고 차분하게 기다려 주는 인생의 정겨운 지지자들입니다. 
              연천군이 포용적 장애 평생학습의 빛나는 허브이자 따스한 고향이 될 수 있도록, 
              공감플러스 정신을 아로새기며 늘 현장 한가운데를 마다치 않고 뜨겁게 머무르겠습니다.
            </p>

            <p className="indent-4 font-medium text-slate-800">
              다름이 장벽이 아니라 고유한 향기가 되고, 학습을 통해 서로에게 스며드는 날까지 
              저희는 멈추지 않고 신비롭고 벅찬 여정을 이어 가겠습니다. <br />
              감사합니다.
            </p>
          </div>

          {/* Letter Foot / Signature */}
          <div className="mt-16 pt-10 border-t border-slate-100/80 text-center">
            <span className="block text-sm text-sky-600 font-sans tracking-widest font-black mb-3">
              다름을 잇는 공감플러스
            </span>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
              장애인 평생학습 강사 협회 일동
            </h3>
            
            {/* 1st-Generation Instructors Board */}
            <div className="mt-10 max-w-3xl mx-auto border-t border-slate-100 pt-8">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-sky-600 bg-sky-50 px-3 py-1 rounded-full font-sans tracking-widest mb-4">
                1기 강사진
              </span>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {[
                  { name: '김수영', title: '전문강사', specialty: 'AAC 소통 및 예술융합' },
                  { name: '김수정', title: '전문강사', specialty: '공감 미술치료 양성' },
                  { name: '윤수정', title: '전문강사', specialty: '포용 평생교육 강사' },
                  { name: '왕선미', title: '전문강사', specialty: '마음언어 촉각 놀이지도' },
                  { name: '조희정', title: '전문강사', specialty: '인지 재활 및 감각치료' },
                  { name: '주명훈', title: '대표강사', specialty: '사회복지 & 평생학습 총괄', isLead: true },
                  { name: '주민철', title: '전문강사', specialty: '동반자적 자립 촉진' },
                  { name: '한미정', title: '전문강사', specialty: 'AAC 보완대체의사소통' }
                ].map((inst) => (
                  <div 
                    key={inst.name} 
                    className={`p-3.5 rounded-2xl border transition-all text-center relative overflow-hidden group ${
                      inst.isLead 
                        ? 'border-orange-200 bg-orange-50/20 shadow-xs' 
                        : 'border-slate-100 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    {inst.isLead && (
                      <div className="absolute top-0 right-0 bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg font-sans">
                        대표
                      </div>
                    )}
                    <h4 className="text-sm font-bold text-slate-800 font-sans">{inst.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium font-sans mt-0.5">{inst.title}</p>
                    <div className="mt-2 text-[9px] font-medium text-sky-600 bg-white/80 border border-sky-100/30 rounded-md py-0.5 px-1 inline-block max-w-full truncate font-sans">
                      {inst.specialty}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Highlight Representative's Hand Sign Seal */}
              <div className="mt-8 flex flex-col items-center justify-center">
                <div className="h-20 w-44 opacity-90 hover:opacity-100 transition-opacity">
                  <svg viewBox="0 0 380 150" className="w-full h-full text-slate-800" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M 65,72 C 55,75 48,82 48,93 C 48,106 60,110 75,98 C 88,88 102,64 108,52 C 110,47 111,44 109,44 C 106,44 101,52 95,65 C 89,78 84,90 81,96 C 77,103 74,106 77,106 C 82,106 93,94 105,82 C 117,70 122,63 125,70 C 127,75 120,87 116,92 C 114,95 117,95 122,89 C 128,83 134,76 138,78 C 140,79 135,87 133,90 C 131,94 133,94 138,87" />
                    <path d="M 148,92 C 152,80 160,60 168,52 C 172,48 174,50 172,57 C 168,69 161,85 156,96 C 154,100 157,96 163,87 C 170,75 180,58 184,54 C 186,51 189,54 187,61 C 183,72 176,89 171,100 C 169,104 172,100 178,91 C 185,80 196,65 200,68 C 204,71 198,82 195,86 C 192,91 190,96 193,100 C 195,102 199,99 202,94 C 208,84 216,72 219,76 C 221,78 215,86 213,90 C 211,94 213,94 217,88 C 223,80 230,72 233,76 C 235,78 229,87 226,91 C 223,96 220,102 222,105 C 224,107 228,104 231,100 C 237,90 244,78 247,82 C 249,84 243,92 241,95 C 239,99 241,99 245,93 C 251,84 259,76 262,80 C 264,82 258,91 256,94 C 254,98 256,98 260,92 C 266,84 274,75 277,79 M 277,79 C 281,73 286,71 288,76 C 289,78 283,86 280,91 C 277,96 279,96 283,90 C 289,82 296,75 299,79 C 301,81 295,89 292,94 M 292,94 C 289,99 292,99 296,92 M 296,92 C 302,83 310,75 313,79 C 315,81 309,89 306,94 C 303,99 306,99 310,92" />
                    <path d="M 110,123 C 145,115 225,104 285,101 C 315,99 355,98 390,101" strokeWidth="2.5" />
                  </svg>
                </div>
                <p className="text-[10px] text-slate-400 font-sans tracking-wide">
                  장애인 평생학습 1기 전문 강사진 대표 주명훈 친필 서명 위임 날인
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Association Core Pillars */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs">
            <div className="h-10 w-10 bg-sky-50 text-sky-500 rounded-lg flex items-center justify-center mb-3">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">1. 존중과 자립 지지</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              장애당사자가 학습의 능동적 주체가 되어 내 마음을 표현하고 지역사회 속에서 스스로 평범한 일상을 성취할 수 있도록 보조합니다.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs">
            <div className="h-10 w-10 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center mb-3">
              <Award className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">2. 현장 맞춤형 솔루션</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              다년간 현장에서 갈고닦은 ‘마음언어 AAC 카드’ 등의 차별적 교구를 사용하여 학습자 맞춤 최적화된 촉각 및 시지각 교습법을 이끕니다.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs">
            <div className="h-10 w-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center mb-3">
              <Sparkles className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">3. 연천군 공동체 유대</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              연천군 선사 유산 등의 로컬 요소와 예술 치료를 결합하여 학습 지평을 확장하고, 포용적 복지 가치를 전방위로 퍼뜨립니다.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
