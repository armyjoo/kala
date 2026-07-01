import React, { useState, useEffect } from 'react';
import { noticesData } from '../data/noticesData';
import { Notices } from '../types';
import { 
  Megaphone, Search, ChevronDown, ChevronUp, Calendar, User, 
  Eye, Info, Edit, Plus, FileSpreadsheet, Check, ShieldCheck, Trash2
} from 'lucide-react';

interface NoticeSectionProps {
  currentUser: { name: string; role: '일반회원' | '강사' | '관리자' | '부관리자' } | null;
}

export default function NoticeSection({ currentUser }: NoticeSectionProps) {
  const [notices, setNotices] = useState<Notices[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>('notice_1');
  
  // Notice writing form state (for Admin/Sub-Admin only)
  const [isWriteFormOpen, setIsWriteFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [writeSuccess, setWriteSuccess] = useState(false);

  // Load and parse notices from localStorage, fallback to default notices list
  useEffect(() => {
    const saved = localStorage.getItem('gonggam_notices_v2');
    if (saved) {
      try {
        setNotices(JSON.parse(saved));
      } catch (err) {
        setNotices(noticesData);
      }
    } else {
      setNotices(noticesData);
      localStorage.setItem('gonggam_notices_v2', JSON.stringify(noticesData));
    }
  }, []);

  // Filter Notices based on search term
  const filteredNotices = notices.filter((not) =>
    not.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    not.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleNotice = (id: string) => {
    setExpandedNoticeId((prev) => (prev === id ? null : id));
    
    // Simulate updating view count
    setNotices((prevNotices) => {
      const updated = prevNotices.map((not) => {
        if (not.id === id) {
          return { ...not, viewCount: not.viewCount + 1 };
        }
        return not;
      });
      localStorage.setItem('gonggam_notices_v2', JSON.stringify(updated));
      return updated;
    });
  };

  // Check if current user has notice writing/posting permissions
  const canPublishNotice = currentUser && (
    currentUser.role === '관리자' || 
    currentUser.role === '부관리자'
  );

  const handleSubmitNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newNotice: Notices = {
      id: `notice_${Date.now()}`,
      title: `${isImportant ? '[중요] ' : ''}${newTitle}`,
      content: newContent,
      date: new Date().toISOString().split('T')[0],
      author: currentUser ? `${currentUser.name} (${currentUser.role})` : '관리본부',
      isImportant: isImportant,
      viewCount: 1,
    };

    const updated = [newNotice, ...notices];
    setNotices(updated);
    localStorage.setItem('gonggam_notices_v2', JSON.stringify(updated));

    // Reset Form
    setNewTitle('');
    setNewContent('');
    setIsImportant(false);
    setWriteSuccess(true);
    setIsWriteFormOpen(false);

    // Default expand the newly created notice
    setExpandedNoticeId(newNotice.id);

    setTimeout(() => {
      setWriteSuccess(false);
    }, 4000);
  };

  const handleDeleteNotice = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('선택하신 공지 사항을 전파망에서 영구 전면 삭제처리 하시겠습니까?')) {
      const updated = notices.filter((not) => not.id !== id);
      setNotices(updated);
      localStorage.setItem('gonggam_notices_v2', JSON.stringify(updated));
      if (expandedNoticeId === id) {
        setExpandedNoticeId(null);
      }
    }
  };

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        
        {/* Notice header block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-slate-100 pb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-sky-600 bg-sky-50 font-sans tracking-wide">
              <Megaphone className="h-3.5 w-3.5 animate-bounce-slow" />
              협회 공지사항 &middot; BULLETIN NOTICE
            </span>
            <h2 className="mt-3 text-3xl font-black text-slate-800 tracking-tight">
              소중하게 소망해 전하는 공지 한마당
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-xl">
              2기 전문강상 양성과정 공고, 무상 마음언어 AAC 키통 배급 정보 등 협직원 및 회원을 연결하는 공청 창구입니다.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 font-sans text-xs">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="공지 사항 제목/내용 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-60 rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-10 text-slate-705 outline-none focus:border-sky-300 focus:bg-white transition-all font-sans"
              />
            </div>

            {canPublishNotice && (
              <button
                onClick={() => setIsWriteFormOpen(!isWriteFormOpen)}
                className="rounded-xl px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold tracking-tight inline-flex items-center gap-1.5 cursor-pointer shadow-3xs hover:shadow-2xs transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                {isWriteFormOpen ? '작성창 닫기' : '새공지작성'}
              </button>
            )}
          </div>
        </div>

        {/* Flashed publishing success modal notice */}
        {writeSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-sans text-xs flex items-center gap-2 animate-fade-in">
            <span className="text-base">🎉</span>
            <div>
              <strong>새 공지사항이 전임 가습망에 온전히 등록되었습니다!</strong> 
              <span> 임직원 및 모든 회원들이 즉시 조회 가능하도록 최적화 배치되었습니다.</span>
            </div>
          </div>
        )}

        {/* Administrator Publishing Notice Form */}
        {canPublishNotice && isWriteFormOpen && (
          <div className="mb-8 p-6 rounded-3xl bg-slate-50 border border-slate-200/60 shadow-inner relative animate-fade-in">
            <div className="absolute top-3 right-4 flex items-center gap-1.5 text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-sans uppercase">
              <ShieldCheck className="h-3.5 w-3.5" />
              {currentUser?.role} 전용 신규 발행단
            </div>

            <h3 className="text-xs font-black text-slate-550 text-slate-600 tracking-wider mb-4 uppercase font-sans flex items-center gap-1">
              🖊️ 공식 공지사항 작성 (권한: {currentUser?.name} {currentUser?.role})
            </h3>

            <form onSubmit={handleSubmitNotice} className="space-y-4 font-sans">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">공지사항 제목 *</label>
                  <input
                    type="text"
                    required
                    placeholder="공지의 핵심 문구를 일목요연하고 깊게 작성해 주세요."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-slate-700 outline-none focus:border-sky-300"
                  />
                </div>

                <div className="md:col-span-4 flex items-end">
                  <button
                    type="button"
                    onClick={() => setIsImportant(!isImportant)}
                    className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isImportant
                        ? 'bg-rose-50 border-rose-300 text-rose-700 font-black'
                        : 'bg-white border-slate-200 text-slate-450 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`inline-block h-2 w-2 rounded-full ${isImportant ? 'bg-rose-500 animate-ping' : 'bg-slate-350'}`} />
                    중요 공지로 분류 (빨간 중요태그 부착)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">상세 고지 내용 설명 *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="공지 사항 본문을 구체적이고 단정하게 써 전파 하실 수 있습니다."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 bg-white p-4 text-slate-700 outline-none focus:border-sky-300 leading-relaxed font-sans"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="rounded-xl px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md cursor-pointer transition-all flex items-center gap-1 font-sans"
                >
                  <Check className="h-4 w-4" />
                  새 공식 공지글 발행 게시
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Notices collapsible Feed Table */}
        <div className="border border-slate-100 rounded-3xl overflow-hidden bg-slate-50 shadow-xs">
          
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-50 px-6 py-4 border-b border-slate-100 text-xs font-black text-slate-500 tracking-wider font-sans uppercase">
            <div className="col-span-1 text-center">출도</div>
            <div className="col-span-7 pl-4">공지 분류 및 내용</div>
            <div className="col-span-2 text-center">조회수</div>
            <div className="col-span-2 text-center">행정업무</div>
          </div>

          {/* List Content */}
          {filteredNotices.length === 0 ? (
            <div className="p-16 text-center text-slate-400 font-sans bg-white">
              <Info className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs">찾으시는 검색어와 부합되는 공지 사항을 발견하지 못했습니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredNotices.map((not, idx) => {
                const isExpanded = expandedNoticeId === not.id;
                return (
                  <div
                    key={not.id}
                    className={`transition-all bg-white hover:bg-slate-50/30 ${
                      isExpanded ? 'bg-sky-50/10' : ''
                    }`}
                  >
                    
                    {/* Row Item Anchor */}
                    <div
                      onClick={() => handleToggleNotice(not.id)}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-4.5 sm:py-5 cursor-pointer text-xs sm:text-sm font-medium"
                    >
                      {/* Badge / Number block */}
                      <div className="md:col-span-1 text-center font-sans font-bold text-slate-400">
                        {not.isImportant ? (
                          <span className="inline-block bg-rose-50 border border-rose-150 text-rose-600 font-extrabold px-1.5 py-0.5 rounded-md text-[9px] animate-pulse">
                            중요
                          </span>
                        ) : (
                          <span>{filteredNotices.length - idx}</span>
                        )}
                      </div>

                      {/* Main Title heading */}
                      <div className="md:col-span-7 flex items-center justify-between pl-0 md:pl-4">
                        <div className="flex flex-col gap-1 pr-4">
                          <h4 className={`text-slate-800 tracking-tight transition-colors ${
                            isExpanded ? 'text-sky-600 font-extrabold' : 'group-hover:text-slate-900 font-semibold'
                          }`}>
                            {not.title}
                          </h4>
                          
                          {/* Mini detail log underneath (visible on tablets or screens) */}
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-sans mt-0.5">
                            <span className="bg-slate-50 px-1 rounded border font-medium text-slate-500">작성: {not.author}</span>
                            <span>&middot;</span>
                            <span>날짜: {not.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* View count details of notice */}
                      <div className="md:col-span-2 text-center font-sans text-slate-400 text-xs hidden md:block">
                        {not.viewCount}회 조회됨
                      </div>

                      {/* Specific administrative controls for admin (such as notice deletion) */}
                      <div className="md:col-span-2 flex items-center justify-center gap-2">
                        {canPublishNotice ? (
                          <button
                            onClick={(e) => handleDeleteNotice(not.id, e)}
                            className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-650 border border-transparent hover:border-red-100 text-slate-300 transition-all cursor-pointer"
                            title="공지 글 영구 파기 철수"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-350 select-none font-sans">조회전용</span>
                        )}
                        <div className="text-slate-400 pl-2">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>

                    </div>

                    {/* Collapsible detail panel body */}
                    {isExpanded && (
                      <div className="px-6 md:px-16 pt-2 pb-6 border-t border-slate-50 bg-slate-50/50 animate-fade-in">
                        <div className="p-4 sm:p-6 bg-white border border-slate-100 rounded-2xl shadow-3xs">
                          <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-sans mb-4 border-b border-slate-50 pb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              공청일자: {not.date}
                            </span>
                            <span>|</span>
                            <span>전달기구: {not.author}</span>
                            <span>|</span>
                            <span>통계조회: {not.viewCount}회</span>
                          </div>

                          <div className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans">
                            {not.content}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Explaining notice rights bottom label */}
        <p className="mt-5 text-center text-[11px] text-slate-400 font-sans leading-relaxed">
          * 공지사항 게시/수정/삭제 권한은 <strong>대표 관리자 및 부관리자</strong> 등급 회원에게만 승인되어 귀속되어 있습니다.<br />
          일반회원 및 강사는 권한 규칙에 의해 조회 및 탐독만 지원되며 보안 위반 없이 투명하게 공시됩니다.
        </p>

      </div>
    </section>
  );
}
