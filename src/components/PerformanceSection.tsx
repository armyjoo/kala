import React, { useState } from 'react';
import { Award, TrendingUp, Users, BookOpen, Clock, Calendar, CheckCircle2, ChevronRight, Pencil, Trash2, Plus, X, Settings2, Sparkles, CheckCircle } from 'lucide-react';

interface PerformanceSectionProps {
  currentUser?: { name: string; role: '일반회원' | '강사' | '관리자' | '부관리자' } | null;
}

interface StatItem {
  label: string;
  value: string;
  desc: string;
  iconName: 'Users' | 'BookOpen' | 'Clock' | 'Award';
  color: string;
}

interface Milestone {
  date: string;
  title: string;
  desc: string;
}

export default function PerformanceSection({ currentUser }: PerformanceSectionProps) {
  const [activeMetricTab, setActiveMetricTab] = useState<'growth' | 'programs'>('growth');

  // Stats Database
  const [stats, setStats] = useState<StatItem[]>(() => {
    const saved = localStorage.getItem('gonggam_performance_stats_db');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse stats from localStorage', err);
      }
    }
    const defaultStats: StatItem[] = [
      { label: '누적 참여 교육생', value: '1,240명', desc: '연천군 내 재가 장애인 및 지역 아동', iconName: 'Users', color: 'text-sky-500 bg-sky-50' },
      { label: '‘마음언어’ 무상 지원', value: '850세트', desc: '관내 가정 및 협력 보건복지센터', iconName: 'BookOpen', color: 'text-orange-500 bg-orange-50' },
      { label: '총 누적 교육 공급', value: '4,825시간', desc: '출강 및 찾아가는 일대일 돌봄 교과', iconName: 'Clock', color: 'text-green-500 bg-green-50' },
      { label: '소속 공식 활성 강사진', value: '24명', desc: '1기 정규 양성 과정을 통과한 전문가', iconName: 'Award', color: 'text-indigo-500 bg-indigo-50' },
    ];
    localStorage.setItem('gonggam_performance_stats_db', JSON.stringify(defaultStats));
    return defaultStats;
  });

  // Milestones Database
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const saved = localStorage.getItem('gonggam_performance_milestones_db');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse milestones from localStorage', err);
      }
    }
    const defaultMilestones = [
      { date: '2026년 06월', title: '온라인 ‘공감 네트워크’ 정보 허브 공용 사이트 구축', desc: '지역민들의 소통 접근 편의를 돕고, 마음언어 AAC 도구 시뮬레이터를 온라인 전면 공개하였습니다.' },
      { date: '2026년 03월', title: '연천 전곡, 군남, 청산 등 ‘찾아가는 생활 자립교실’ 12개소 확대', desc: '교실 방문이 고되신 재가 지체 장애 어르신 가정을 위해, 수급처를 확대 파견하였습니다.' },
      { date: '2025년 10월', title: '경기도 장애인 평생배움 박람회 우수 혁신 교구 선정', desc: '자체 설계안인 ‘마음언어 AAC Ver 1.2’가 높은 수용성과 직관성 부문에서 우수히 평가받았습니다.' },
      { date: '2025년 04월', title: '‘마음언어 AAC 카드’ Ver 1.0 전격 공표 및 관내 기부 개시', desc: '기획, 인쇄 및 무상 보급을 일괄 완수하여 전곡읍 요양지원센터에 340세트를 무상 배포하였습니다.' },
      { date: '2024년 11월', title: '연천군 주관 제1기 장애인 평생학습 전문강사 수료식 완료', desc: '협회 창립 대표 주명훈을 비롯한 열의 가득한 12인의 소통 복지 선도 강사진이 화려하게 발돋움했습니다.' },
    ];
    localStorage.setItem('gonggam_performance_milestones_db', JSON.stringify(defaultMilestones));
    return defaultMilestones;
  });

  // Editor Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editorTab, setEditorTab] = useState<'stats' | 'milestones'>('stats');

  // Stats form values
  const [formStats, setFormStats] = useState<StatItem[]>([]);
  
  // Milestones form values
  const [formMilestones, setFormMilestones] = useState<Milestone[]>([]);
  const [newDate, setNewDate] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const isAdmin = currentUser && (currentUser.role === '관리자' || currentUser.role === '부관리자');

  const getIcon = (name: string) => {
    switch (name) {
      case 'Users': return Users;
      case 'BookOpen': return BookOpen;
      case 'Clock': return Clock;
      case 'Award': return Award;
      default: return TrendingUp;
    }
  };

  // Open Performance Editor Panel
  const handleOpenEditor = () => {
    setFormStats(JSON.parse(JSON.stringify(stats)));
    setFormMilestones(JSON.parse(JSON.stringify(milestones)));
    setNewDate('');
    setNewTitle('');
    setNewDesc('');
    setIsModalOpen(true);
  };

  // Save changes
  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save Stats
    setStats(formStats);
    localStorage.setItem('gonggam_performance_stats_db', JSON.stringify(formStats));

    // Save Milestones
    let finalMilestones = [...formMilestones];
    if (newDate.trim() && newTitle.trim()) {
      finalMilestones.unshift({
        date: newDate,
        title: newTitle,
        desc: newDesc,
      });
    }
    setMilestones(finalMilestones);
    localStorage.setItem('gonggam_performance_milestones_db', JSON.stringify(finalMilestones));

    setIsModalOpen(false);
  };

  const handleUpdateStatField = (idx: number, field: keyof StatItem, val: string) => {
    const list = [...formStats];
    list[idx] = { ...list[idx], [field]: val };
    setFormStats(list);
  };

  const handleDeleteMilestoneRow = (idx: number) => {
    const list = [...formMilestones];
    list.splice(idx, 1);
    setFormMilestones(list);
  };

  const handleUpdateMilestoneField = (idx: number, field: keyof Milestone, val: string) => {
    const list = [...formMilestones];
    list[idx] = { ...list[idx], [field]: val };
    setFormMilestones(list);
  };

  const handleAddNewMilestoneDirectly = () => {
    if (!newDate.trim() || !newTitle.trim()) {
      alert('연혁 시기(예: 2026년 08월)와 교육 성과 연혁명을 먼저 기재해 주세요.');
      return;
    }
    const newRow: Milestone = {
      date: newDate,
      title: newTitle,
      desc: newDesc,
    };
    setFormMilestones([newRow, ...formMilestones]);
    setNewDate('');
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title Header */}
        <div className="text-center mb-16 relative">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-sky-600 bg-sky-50 font-sans tracking-wide">
            <TrendingUp className="h-3.5 w-3.5" />
            교육실적 · PERFORMANCE & HISTORY
          </span>
          <h2 className="mt-3 text-3xl font-black text-slate-800 tracking-tight">
            사랑으로 쌓인 투명한 평생교육 발자취
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto">
            경기도 연천군의 아낌없는 연계 복지 기금과 강사단의 땀방울이 자아낸 정직하고 고결한 지표들입니다.
          </p>

          {/* Admin Management Trigger */}
          {isAdmin && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleOpenEditor}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-xs font-black shadow-md transition-all cursor-pointer hover:scale-103 active:scale-97"
              >
                <Settings2 className="h-4 w-4" />
                실적지표 및 연혁 편집기 가동
              </button>
            </div>
          )}
        </div>

        {/* Stats Grid Widget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((st, i) => {
            const Icon = getIcon(st.iconName);
            return (
              <div key={i} className="bg-slate-50 border border-slate-100 p-6 rounded-2xl shadow-3xs flex items-start gap-4 hover:shadow-md transition-all duration-300">
                <div className={`p-3 rounded-xl ${st.color} shrink-0`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400 font-sans">{st.label}</span>
                  <span className="block text-2xl font-black text-slate-800 tracking-tight mt-0.5">{st.value}</span>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">{st.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Analytics Diagrams & Milestones Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column */}
          <div className="lg:col-span-6 bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200/60 shadow-3xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  📈 데이터 브리핑: 장애 교육 성과 트렌드
                </h3>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">탭을 클릭해서 연도별 추세를 바로 변환해 보세요.</p>
              </div>

              {/* Graphic switch button */}
              <div className="bg-white p-1 rounded-lg border border-slate-200 text-[10px] font-sans font-bold flex gap-1">
                <button
                  onClick={() => setActiveMetricTab('growth')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    activeMetricTab === 'growth' ? 'bg-sky-555 bg-sky-500 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  참여자 성장추이
                </button>
                <button
                  onClick={() => setActiveMetricTab('programs')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    activeMetricTab === 'programs' ? 'bg-sky-555 bg-sky-500 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  과목별 분포도
                </button>
              </div>
            </div>

            {/* Custom interactive Lightweight SVG Dynamic graph */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs h-64 flex flex-col justify-between">
              {activeMetricTab === 'growth' ? (
                <div className="h-full flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 font-sans tracking-wide">
                    CUMULATIVE STREAMS (단위: 명)
                  </span>
                  
                  <div className="w-full flex-1 flex items-end justify-between px-2 pt-4 pb-2 relative">
                    <div className="absolute inset-x-0 top-1/4 border-b border-dotted border-slate-100" />
                    <div className="absolute inset-x-0 top-2/4 border-b border-dotted border-slate-100" />
                    <div className="absolute inset-x-0 top-3/4 border-b border-dotted border-slate-100" />
                    
                    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 300 100">
                      <path
                        d="M 30 85 L 120 60 L 210 38 L 270 12"
                        fill="none"
                        stroke="#0ea5e9"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M 30 85 L 120 60 L 210 38 L 270 12 L 270 95 L 30 95 Z"
                        fill="url(#perf-gradient)"
                        opacity="0.12"
                      />
                      <defs>
                        <linearGradient id="perf-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#0ea5e9" />
                          <stop offset="100%" stopColor="#ffffff" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="flex flex-col items-center z-10" style={{ transform: 'translateY(-2px)' }}>
                      <span className="text-[9px] font-extrabold text-slate-400 font-sans">120</span>
                      <div className="h-3 w-3 rounded-full bg-sky-500 border-2 border-white shadow-3xs mt-1" />
                    </div>
                    <div className="flex flex-col items-center z-10" style={{ transform: 'translateY(-14px)' }}>
                      <span className="text-[9px] font-extrabold text-sky-505 text-sky-500 font-bold font-sans">420</span>
                      <div className="h-3 w-3 rounded-full bg-sky-500 border-2 border-white shadow-3xs mt-1" />
                    </div>
                    <div className="flex flex-col items-center z-10" style={{ transform: 'translateY(-30px)' }}>
                      <span className="text-[9px] font-extrabold text-sky-606 text-sky-605 text-sky-600 font-bold font-sans">890</span>
                      <div className="h-3 w-3 rounded-full bg-sky-500 border-2 border-white shadow-3xs mt-1" />
                    </div>
                    <div className="flex flex-col items-center z-10" style={{ transform: 'translateY(-50px)' }}>
                      <span className="text-[9px] font-extrabold text-sky-707 text-sky-700 font-black font-sans">1,240</span>
                      <div className="h-3 w-3 rounded-full bg-sky-500 border-2 border-white shadow-3xs mt-1" />
                    </div>
                  </div>

                  <div className="flex justify-between px-1 text-[9px] text-slate-400 font-sans font-bold border-t border-slate-150 pt-2 shrink-0">
                    <span>2024년 4분기</span>
                    <span>2025년 상반기</span>
                    <span>2025년 하반기</span>
                    <span>2026년 상반기 (현재)</span>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 font-sans tracking-wide">
                    PROGRAM ALLOCATIONS (%)
                  </span>

                  <div className="flex items-center gap-6 flex-1 py-1 px-3">
                    <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
                      <svg className="h-full w-full rotate-270" viewBox="0 0 36 36">
                        <path
                          className="text-sky-400"
                          strokeWidth="4.5"
                          stroke="currentColor"
                          fill="transparent"
                          strokeDasharray="45 100"
                          strokeDashoffset="0"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-orange-400"
                          strokeWidth="4.5"
                          stroke="currentColor"
                          fill="transparent"
                          strokeDasharray="30 100"
                          strokeDashoffset="-45"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-indigo-400"
                          strokeWidth="4.5"
                          stroke="currentColor"
                          fill="transparent"
                          strokeDasharray="25 100"
                          strokeDashoffset="-75"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-[11px] font-black text-slate-705 text-slate-700">3대 특화교과</span>
                        <span className="text-[8px] text-slate-400 font-semibold font-sans mt-0.5">총 점포화</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-2 text-left">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                        <span className="text-slate-500 flex-1 text-[11px]">마음언어 AAC 카드 프로그램</span>
                        <span className="font-extrabold text-slate-700 font-sans">45%</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                        <span className="text-slate-500 flex-1 text-[11px]">장애인 평생 강사 양성 과정</span>
                        <span className="font-extrabold text-slate-700 font-sans">30%</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
                        <span className="text-slate-500 flex-1 text-[11px]">찾아가는 자립 오감 치유 교실</span>
                        <span className="font-extrabold text-slate-700 font-sans">25%</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[9px] text-slate-400 font-sans text-center mt-3 block">
                    * 위 지표는 관내 장애 학습자 선호도 및 연천 교육 지원 협력 배정치를 성문화한 값입니다.
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 bg-white p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed font-sans text-left">
              <span className="font-bold text-slate-800">🎖️ 경기도 연천군과 함께하는 평생교육</span> <br />
              연천군 장애인 평생학습 교실과 협회가 추진하는 다양한 교육은 정부 및 경기도 지방자치단체의 엄정히 공인된 평생학습도시 포용 기금을 지원받아 투명하게 실행되고 있습니다.
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5 font-sans">
              📍 협회 연혁 및 주요 성과 마일스톤
            </h3>

            {milestones.length === 0 ? (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-400">
                기재된 연혁이 없습니다.
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-100 pl-6 space-y-8 ml-3">
                {milestones.map((mile, i) => (
                  <div key={i} className="relative group">
                    <span className="absolute -left-[31px] top-1 h-4.5 w-4.5 rounded-full border-2 border-sky-400 bg-white transition-all group-hover:bg-sky-500 flex items-center justify-center">
                      <span className="h-1.5 w-1.5 bg-sky-400 rounded-full group-hover:bg-white" />
                    </span>

                    <div>
                      <span className="inline-block text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md font-sans mb-1.5">
                        {mile.date}
                      </span>
                      
                      <h4 className="text-sm font-black text-slate-750 text-slate-800 group-hover:text-sky-500 transition-colors">
                        {mile.title}
                      </h4>
                      
                      <p className="text-xs text-slate-505 text-slate-500 leading-relaxed mt-1">
                        {mile.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Stats/Milestone Integration Editor overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Settings2 className="h-5 w-5 text-indigo-505 text-sky-500" />
              <span>실적 및 연혁 데이터 종합 관리자 통제실</span>
            </h3>

            {/* Tap selector */}
            <div className="flex border-b border-slate-200 mb-4 font-sans text-xs font-bold gap-2">
              <button
                type="button"
                onClick={() => setEditorTab('stats')}
                className={`pb-2 px-3 transition-colors border-b-2 cursor-pointer ${
                  editorTab === 'stats' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                📊 4대 특화 누적실적 수치 수정
              </button>
              <button
                type="button"
                onClick={() => setEditorTab('milestones')}
                className={`pb-2 px-3 transition-colors border-b-2 cursor-pointer ${
                  editorTab === 'milestones' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                📆 협회 주요 성과 연혁 관리
              </button>
            </div>

            <form onSubmit={handleSaveAll} className="space-y-4 text-xs">
              
              {editorTab === 'stats' ? (
                /* Stats sub-editor */
                <div className="space-y-4">
                  <p className="text-[11px] text-slate-400 mb-2">
                    메인 화면에 노출되는 4개 실적 카드의 타이틀, 수치값, 도움말을 수정합니다. 수치는 단위를 포함하여 적어주십시오.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formStats.map((st, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                        <span className="block font-black text-indigo-700 text-[10px] uppercase font-sans">지표 {idx + 1}</span>
                        <div>
                          <label className="block text-[9px] text-slate-400 mb-0.5">지표 타이틀</label>
                          <input
                            type="text"
                            required
                            value={st.label}
                            onChange={(e) => handleUpdateStatField(idx, 'label', e.target.value)}
                            className="w-full border border-slate-200 rounded px-2 py-1 bg-white text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400 mb-0.5">실적 상태 수치</label>
                          <input
                            type="text"
                            required
                            value={st.value}
                            onChange={(e) => handleUpdateStatField(idx, 'value', e.target.value)}
                            className="w-full border border-slate-200 rounded px-2 py-1 bg-white text-xs font-sans text-sky-600 font-extrabold"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400 mb-0.5">하단 상세 권장 세부 문장</label>
                          <input
                            type="text"
                            value={st.desc}
                            onChange={(e) => handleUpdateStatField(idx, 'desc', e.target.value)}
                            className="w-full border border-slate-200 rounded px-2 py-1 bg-white text-[10px]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Milestones sub-editor */
                <div className="space-y-4">
                  {/* Enter New item block */}
                  <div className="p-4 bg-sky-50/50 border border-sky-100 rounded-2xl space-y-2.5">
                    <span className="font-sans font-black text-sky-700 text-[11px] block flex items-center gap-1">
                      <Plus className="h-4 w-4" />
                      새로운 성과 연혁/마일스톤 즉시 추가
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <input
                          type="text"
                          placeholder="시기 (예: 2026년 08월)"
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-2 bg-white text-xs font-sans font-bold"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="새 연혁 성과 내용 타이틀"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-2 bg-white text-xs font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="이 연혁 성과에 대한 세부 설명을 한두 줄 적어보세요."
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2 bg-white text-xs"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddNewMilestoneDirectly}
                        className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all active:scale-95"
                      >
                        우선 임시 등록 (+ 목록 처마에 추가)
                      </button>
                    </div>
                  </div>

                  {/* List of existing with editing capability */}
                  <div className="space-y-2 max-h-[220px] overflow-y-auto border border-slate-100 p-2 rounded-xl bg-slate-50/30">
                    <span className="block text-[10px] text-slate-400 font-bold mb-1.5 font-sans">설치된 연혁 목록 리스트</span>
                    {formMilestones.map((mile, i) => (
                      <div key={i} className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-start gap-2 justify-between">
                        <div className="flex-1 space-y-1.5 scroll-none">
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              required
                              value={mile.date}
                              onChange={(e) => handleUpdateMilestoneField(i, 'date', e.target.value)}
                              className="w-1/4 max-w-[110px] border border-slate-200 rounded p-1 text-xs font-bold text-sky-700 text-center font-sans"
                            />
                            <input
                              type="text"
                              required
                              value={mile.title}
                              onChange={(e) => handleUpdateMilestoneField(i, 'title', e.target.value)}
                              className="w-3/4 border border-slate-200 rounded p-1 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={mile.desc}
                              onChange={(e) => handleUpdateMilestoneField(i, 'desc', e.target.value)}
                              className="w-full border border-slate-250 border-slate-200 rounded p-1 text-[11px]"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteMilestoneRow(i)}
                          className="p-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-105 border border-rose-200 ml-1"
                          title="삭제"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-505 text-slate-500 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle className="h-4 w-4" />
                  실적 데이터 저장 공개하기
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </section>
  );
}
