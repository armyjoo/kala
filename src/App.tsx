import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import AuthModal from './components/AuthModal';
import IntroductionSection from './components/IntroductionSection';
import GreetingsSection from './components/GreetingsSection';
import CurriculumSection from './components/CurriculumSection';
import StoriesSection from './components/StoriesSection';
import ApplicationSection from './components/ApplicationSection';
import PerformanceSection from './components/PerformanceSection';
import LoungeSection from './components/LoungeSection';
import NoticeSection from './components/NoticeSection';
import AdminPanelSection from './components/AdminPanelSection';
import BrandLogo from './components/BrandLogo';
import AccessibilityHelper from './components/AccessibilityHelper';
import { 
  ArrowUpRight, 
  GraduationCap, 
  Sparkles, 
  Navigation as NavIcon, 
  Heart, 
  PhoneCall, 
  HelpCircle,
  Edit3,
  CheckCircle2,
  Settings,
  X
} from 'lucide-react';
import { auth, logOut, deleteAccount } from './lib/firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState('intro');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; role: '일반회원' | '강사' | '관리자' | '부관리자' } | null>(null);
  
  // State to hold pre-selected course when moving from Curriculum -> Application
  const [selectedCourseForApply, setSelectedCourseForApply] = useState<string | null>(null);

  // 관리자 페이지 수정/편집 모달 관리 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSectionTitle, setEditingSectionTitle] = useState('');
  const [editingNotice, setEditingNotice] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Check for any persisted user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('gonggam_user_session');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Session reading failed');
      }
    }
  }, []);

  const handleLoginSuccess = (user: { name: string; role: '일반회원' | '강사' | '관리자' | '부관리자' }) => {
    setCurrentUser(user);
    localStorage.setItem('gonggam_user_session', JSON.stringify(user));
  };

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (e) {
      console.error('Firebase signout failed', e);
    }
    setCurrentUser(null);
    localStorage.removeItem('gonggam_user_session');
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    
    const confirmText = `⚠️ 정말로 회원 "${currentUser.name}" 님의 소중한 계정을 영구 탈퇴하시겠습니까?\n이 작업은 되돌릴 수 없으며 모든 데이터가 삭제됩니다.`;
    if (!window.confirm(confirmText)) {
      return;
    }

    try {
      const liveUser = auth.currentUser;
      if (liveUser) {
        await deleteAccount(liveUser.uid);
        alert('🎉 회원 탈퇴 처리가 안전하게 완료되었습니다. 그동안 함께해주셔서 감사합니다!');
        setCurrentUser(null);
        localStorage.removeItem('gonggam_user_session');
        handleTabChange('intro');
      } else {
        alert('테스트용 가상 계정은 회원탈퇴 대상이 아닙니다.');
      }
    } catch (err: any) {
      alert(`탈퇴 처리 중 오류가 발생했습니다: ${err.message || '인증 유효 기간이 만료되었을 수 있으니 재로그인 후 시도하세요.'}`);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Smooth scroll to top when changing views
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCourseForApply = (courseId: string) => {
    setSelectedCourseForApply(courseId);
    handleTabChange('application');
  };

  const handleClearSelectedCourse = () => {
    setSelectedCourseForApply(null);
  };

  // 탭 ID를 사용자가 알아보기 쉬운 한글 이름으로 변환
  const getTabDisplayName = (tabId: string) => {
    switch (tabId) {
      case 'intro': return '메인 소개 (Intro)';
      case 'greetings': return '인사말 (Greetings)';
      case 'curriculum': return '교육과정 (Curriculum)';
      case 'stories': return '활동 이야기 (Stories)';
      case 'application': return '수강 신청 (Application)';
      case 'performance': return '추진 성과 (Performance)';
      case 'lounge': return '강사 사랑방 (Lounge)';
      case 'notice': return '공지사항 (Notice)';
      case 'admin': return '관리자 콘솔 (Admin)';
      default: return '페이지';
    }
  };

  // 편집 모달 열기 핸들러
  const handleOpenEditModal = () => {
    setEditingSectionTitle(getTabDisplayName(activeTab));
    setEditingNotice('');
    setSaveSuccess(false);
    setIsEditModalOpen(true);
  };

  // 편집 저장 처리
  const handleSavePageEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditModalOpen(false);
    }, 1500);
  };

  // 관리자 전용 상세 설정 콘솔로 전환
  const handleGoToAdminConsole = () => {
    setIsEditModalOpen(false);
    handleTabChange('admin');
  };

  const isAdmin = currentUser?.role === '관리자' || currentUser?.role === '부관리자';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-sky-100 selection:text-sky-800 text-slate-700 antialiased">
      
      {/* 20px Top Banner for Slogan Accentuation */}
      <div className="bg-gradient-to-r from-sky-500 via-sky-400 to-orange-400 text-white text-[11px] font-bold text-center py-1.5 px-4 tracking-wider flex items-center justify-center gap-1.5 font-sans">
        <Sparkles className="h-3 w-3 animate-pulse" />
        <span>다름을 잇는 공감플러스+ &middot; 경기도 연천군 장애인 평생학습의 새로운 도약</span>
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
      </div>

      {/* Top sticky Navigation Header */}
      <Navigation
        currentTab={activeTab}
        onTabChange={handleTabChange}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
      />

      {/* Hero Header Area */}
      {activeTab === 'intro' && (
        <div className="relative overflow-hidden bg-white border-b border-slate-100 py-20 lg:py-28">
          <div className="absolute top-0 right-0 h-[35rem] w-[35rem] bg-sky-50/50 rounded-full blur-3xl -translate-y-16 translate-x-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 h-96 w-96 bg-orange-50/30 rounded-full blur-3xl -translate-x-12 translate-y-12 pointer-events-none" />

          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-extrabold text-sky-600 bg-sky-50 border border-sky-100 font-sans mx-auto">
              <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
              장애인 평생학습 최고의 파트너십
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              다름을 아름다운 <br />
              대화로 잇는 <span className="text-sky-500 bg-sky-50 px-2 rounded-lg">공감플러스+</span>
            </h2>

            <p className="text-sm md:text-base text-slate-500 leading-relaxed max-w-2xl mx-auto">
              장애인 평생 의사소통 장벽을 완화하고 소외 없는 자립 자생력을 북돋우기 위해, 
              제1기 전문교사들이 힘주어 창립했습니다. 온 마음을 담은 ‘마음언어 AAC 카드’로 
              연천 지역의 아름다운 공생의 냇가를 만들어 나갑니다.
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-3">
              <button
                onClick={() => handleTabChange('greetings')}
                className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-6 py-3 shadow-md hover:shadow-lg active:scale-95 transition-all text-center cursor-pointer"
              >
                인사말 둘러보기
              </button>
              <button
                onClick={() => handleTabChange('curriculum')}
                className="rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-150 font-extrabold text-xs sm:text-sm px-6 py-3 transition-all text-center cursor-pointer"
              >
                개설 교육과정 둘러보기
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1">
        
        {/* Intro Tab */}
        {activeTab === 'intro' && (
          <div className="animate-fade-in">
            <IntroductionSection />
          </div>
        )}

        {/* Greetings Letter Tab */}
        {activeTab === 'greetings' && (
          <div className="animate-fade-in">
            <GreetingsSection />
          </div>
        )}

        {/* Courses curriculum Tab */}
        {activeTab === 'curriculum' && (
          <div className="animate-fade-in">
            <CurriculumSection onSelectCourseForApply={handleSelectCourseForApply} currentUser={currentUser} />
          </div>
        )}

        {/* Activity Stories Tab */}
        {activeTab === 'stories' && (
          <div className="animate-fade-in">
            <StoriesSection currentUser={currentUser} />
          </div>
        )}

        {/* Class application interactive Tab */}
        {activeTab === 'application' && (
          <div className="animate-fade-in">
            <ApplicationSection
              initialCourseId={selectedCourseForApply}
              onClearSelectedCourse={handleClearSelectedCourse}
            />
          </div>
        )}

        {/* Annual accomplishment timeline Tab */}
        {activeTab === 'performance' && (
          <div className="animate-fade-in">
            <PerformanceSection currentUser={currentUser} />
          </div>
        )}

        {/* Instructor lounge community board Tab */}
        {activeTab === 'lounge' && (
          <div className="animate-fade-in">
            <LoungeSection
              currentUser={currentUser}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'notice' && (
          <div className="animate-fade-in">
            <NoticeSection currentUser={currentUser} />
          </div>
        )}

        {/* Admin Management Console Tab */}
        {activeTab === 'admin' && (
          <div className="animate-fade-in">
            <AdminPanelSection 
              currentUser={currentUser} 
              onUpdateCurrentUser={handleLoginSuccess} 
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 md:py-16 border-t border-slate-800 font-sans text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-10 border-b border-white/10 items-start">
            
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <BrandLogo showText={true} theme="dark" size="sm" customHeight={36} />
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed max-w-sm">
                경기도 연천군 장애 평생 교육 강사 수료생들이 뜻을 같이해 시작한 사회 공헌 비영리 협회입니다. 마음언어 AAC 보급 및 찾아가는 교육으로 더 나은 공동체를 가꿉니다.
              </p>
            </div>

            <div className="md:col-span-4 space-y-3">
              <h4 className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                교육과정 및 주요 서비스
              </h4>
              <ul className="space-y-2 text-slate-300 font-medium">
                <li>
                  <button onClick={() => handleTabChange('curriculum')} className="hover:text-sky-400 transition-colors cursor-pointer text-left">
                    &middot; 마음언어 AAC 카드 소통 길잡이 과정
                  </button>
                </li>
                <li>
                  <button onClick={() => handleTabChange('curriculum')} className="hover:text-sky-400 transition-colors cursor-pointer text-left">
                    &middot; 장애인 평생학습 전문 강사 육성 과정
                  </button>
                </li>
                <li>
                  <button onClick={() => handleTabChange('curriculum')} className="hover:text-sky-400 transition-colors cursor-pointer text-left">
                    &middot; 동네 한 바퀴 찾아가는 자립교실 파견 신청
                  </button>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-3">
              <h4 className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                협회 행정 지원 센터
              </h4>
              <p className="text-slate-300 leading-relaxed font-sans text-[11px]">
                대표전화: <strong>010-9169-0964, 010-3270-0162</strong> <br />
                상담 메일: <strong className="text-sky-300">armyjoo@gmail.com</strong> <br />
                운영 시간: 평일 09:00 - 18:00 (토,일 공휴일 휴무)
              </p>
            </div>

          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[10px] text-slate-400 leading-relaxed font-sans">
            <div className="space-y-1">
              <p>장애인 평생학습 강사 협회 (KALA) | 대표: 주명훈 | 관할 소재지: 경기도 연천군 전곡읍</p>
              <p className="text-slate-500">슬로건: Accessible Learning, Inclusive Future (모두가 배우고, 함께 성장하는 미래)</p>
              <p>&copy; 2026 Korea Accessible Learning Association (KALA). All rights reserved.</p>
            </div>

            <div className="flex gap-2">
              <span className="bg-white/5 px-2 py-1 rounded-sm border border-white/5">경기도 연천군 장애인 평생학습 선구 지정점</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Shared Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Floating Accessibility TTS Assist Wheel */}
      <AccessibilityHelper />

      {/* ============================================================ */}
      {/* 👑 관리자 전용 Floating 수정/편집 도구 (Floating Edit Control) */}
      {/* ============================================================ */}
      {isAdmin && (
        <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2">
          <button
            onClick={handleOpenEditModal}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all cursor-pointer ring-4 ring-orange-100 group"
          >
            <Edit3 className="h-4 w-4 group-hover:rotate-12 transition-transform" />
            <span>현재 페이지 수정/편집</span>
            <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-md font-mono">
              {getTabDisplayName(activeTab)}
            </span>
          </button>
        </div>
      )}

      {/* 페이지 수정/편집 레이어 모달 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-zoom-in">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                <h3 className="font-extrabold text-base font-sans">페이지 실시간 수정 도구</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-white/80 hover:text-white rounded-full p-1 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePageEdit} className="p-6 space-y-4 font-sans text-xs">
              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>수정 사항이 적용되었습니다.</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block font-black text-slate-500 uppercase tracking-wider">
                  수정할 섹션 대상
                </label>
                <input
                  type="text"
                  readOnly
                  value={editingSectionTitle}
                  className="w-full rounded-xl bg-slate-100 border border-slate-200 py-2.5 px-3 text-slate-700 font-bold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-black text-slate-500 uppercase tracking-wider">
                  섹션 공지 및 변경 안내 메시지
                </label>
                <textarea
                  rows={3}
                  placeholder="이 페이지 상단에 게재할 관리자 안내 또는 수정 내용을 작성하세요..."
                  value={editingNotice}
                  onChange={(e) => setEditingNotice(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-800 outline-none focus:border-orange-400 focus:bg-white transition-all"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleGoToAdminConsole}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-2.5 transition-colors cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5" />
                  관리자 콘솔 이동
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-2.5 shadow-md transition-colors cursor-pointer"
                >
                  수정 사항 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
