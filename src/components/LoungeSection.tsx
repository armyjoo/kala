import React, { useState, useEffect } from 'react';
import { LoungeMessage } from '../types';
import { 
  Users, Heart, MessageSquare, Send, Award, ShieldCheck, 
  Lock, ArrowUpRight, FileText, Download, UploadCloud, 
  Trash2, HelpCircle, RefreshCw, CheckCircle2, ChevronRight, FileDown, BookOpen
} from 'lucide-react';

interface LoungeSectionProps {
  currentUser: { name: string; role: '일반회원' | '강사' | '관리자' | '부관리자' } | null;
  onOpenAuth: () => void;
}

interface LibraryFile {
  id: string;
  title: string;
  description: string;
  uploader: string;
  date: string;
  fileSize: string;
  downloadsCount: number;
  isOfficial?: boolean;
}

export default function LoungeSection({ currentUser, onOpenAuth }: LoungeSectionProps) {
  // Current active view within Lounge: "board" (소통채널 게시판) vs "library" (자료실 업로드/다운로드)
  const [activeSubTab, setActiveSubTab] = useState<'board' | 'library'>('board');
  
  // Board states
  const [messages, setMessages] = useState<LoungeMessage[]>([]);
  const [newContent, setNewContent] = useState('');
  
  // Library states
  const [libraryFiles, setLibraryFiles] = useState<LibraryFile[]>([]);
  const [newFileTitle, setNewFileTitle] = useState('');
  const [newFileDesc, setNewFileDesc] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newFileSize, setNewFileSize] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [fileUploadSuccess, setFileUploadSuccess] = useState(false);

  // Default initial feed messages
  const defaultMessages: LoungeMessage[] = [
    {
      id: 'msg_1',
      author: '주명훈 (대표)',
      role: '강사',
      content: '교실 한구석 칠판 뒤에서 두 손 모아 무심히 지켜봐 주시던 발달장애 학습자 어머님의 눈물 범벅이 된 미소를 결코 잊을 수 없습니다. 마음언어 AAC 카드를 힘주어 터치하며 자신의 기쁨을 꾹꾹 눌러 담던 그 기적 같은 영광의 날을 가슴 깊이 사명감으로 간직하며, 더욱 성심성의껏 평생 교육의 문턱을 넓혀 나가겠습니다. 모든 강사님들 자랑스럽습니다.',
      date: '2026-06-20',
      likes: 49,
      replies: [
        { id: 'rep_1', author: '김옥순 (1기강사)', content: '대표님 글을 읽고 큰 울림을 받았습니다. 연천군의 등불이 되어 함께 걷겠습니다!', date: '2026-06-20' },
      ],
    },
    {
      id: 'msg_2',
      author: '최영길 (수석강사)',
      role: '강사',
      content: '이번 주 청산면 보건지소 교실에서 진행한 ‘색으로 표현하는 나의 이야기’ 가을 프로그램 수기 보고드립니다. 처음에 색연필 쥐는 것조차 머뭇거리시던 학습자님들께서 단풍잎과 야생화를 칠해가며 “선생님, 세상이 참 울긋불긋 따뜻하네요!”라고 마음언어로 말해주셨을 때 큰 가치를 느꼈습니다. 학습이 치유가 되는 현장을 기록으로 나눕니다.',
      date: '2026-06-19',
      likes: 32,
    },
    {
      id: 'msg_3',
      author: '박정희 (1기강사)',
      role: '강사',
      content: '이번에 목장에 방문했을 때, 온순한 젖소를 쓰다듬고 지긋이 눈을 맞추며 아이와 교감했습니다. 그 후 직접 구석기 모양으로 비누 조각을 빚는 촉각 미술을 하는데, 그동안 손 근육이 긴장되어 있던 친구들이 스폰지를 쥐듯 부드럽게 움직이는 것을 발견하고 다들 기쁜 눈물을 흘렸습니다. 융합형 교육과정의 큰 교육적 의미를 다시금 느낀 주차였습니다.',
      date: '2026-06-18',
      likes: 27,
    }
  ];

  // Default library downloadable files list
  const defaultFiles: LibraryFile[] = [
    {
      id: 'file_official_1',
      title: '장애인 평생학습 마음언어 AAC 교제 카드 선명 정밀 인쇄용 PDF 자료',
      description: '인쇄소에서 고품질 출력 및 코팅할 수 있도록 요청/도움, 감사/표현, 몸상태 기호들이 해상도 손실 없이 배포된 전면 디자인 자재입니다.',
      uploader: '협회 사무처',
      date: '2026-06-15',
      fileSize: '42.8 MB',
      downloadsCount: 142,
      isOfficial: true,
    },
    {
      id: 'file_official_2',
      title: '제1기 수업 출강 강사 - 주차별 종합 강의지도안 & 교육계획서 표준 서식',
      description: '연천군 세부 교육사업 제출에 필요한 수강생 반응, 활용 교구 및 오감 치료 일지를 포함한 교재 설계의 기본 표준 서식 양식입니다.',
      uploader: '운영 총괄처',
      date: '2026-06-14',
      fileSize: '1.2 MB',
      downloadsCount: 89,
      isOfficial: true,
    },
    {
      id: 'file_official_3',
      title: '연천 지 명물 주먹도끼 모양 비누 공예 - 오감 클레이 조형 촉각 특화 시트',
      description: '선사 유산 주먹도끼의 역사 배경 스토리텔링 포인트와 발달 장애인들이 따라 빚을 수 있도록 단계별 도상으로 정렬된 슬라이드 이미지입니다.',
      uploader: '수석 연구위원',
      date: '2026-06-10',
      fileSize: '8.4 MB',
      downloadsCount: 64,
      isOfficial: true,
    },
    {
      id: 'file_official_4',
      title: '생성형 AI 음성 소통 도구 및 음성비서 스마트 기사 활용 매뉴얼 북',
      description: '태블릿이나 스마트 기기의 안구 조절 장치, 보완 대체 스피커 및 음성 인식 기제를 평생 학습에 연동할 때 보조 교사 임무를 돕는 간편 가이드입니다.',
      uploader: 'AI 융합 기획실',
      date: '2026-06-08',
      fileSize: '5.1 MB',
      downloadsCount: 51,
      isOfficial: true,
    }
  ];

  // Load and parse Board & Library from localStorage on mount
  useEffect(() => {
    // 1. Board Messages
    const savedLounge = localStorage.getItem('gonggam_lounge_v2');
    if (savedLounge) {
      try {
        setMessages(JSON.parse(savedLounge));
      } catch (err) {
        setMessages(defaultMessages);
      }
    } else {
      setMessages(defaultMessages);
      localStorage.setItem('gonggam_lounge_v2', JSON.stringify(defaultMessages));
    }

    // 2. Library Files
    const savedFiles = localStorage.getItem('gonggam_library_files');
    if (savedFiles) {
      try {
        setLibraryFiles(JSON.parse(savedFiles));
      } catch (err) {
        setLibraryFiles(defaultFiles);
      }
    } else {
      setLibraryFiles(defaultFiles);
      localStorage.setItem('gonggam_library_files', JSON.stringify(defaultFiles));
    }
  }, []);

  // Check overall access permission: only logged-in users with role '강사', '관리자', '부관리자' can access
  const hasAccessRole = currentUser && (
    currentUser.role === '강사' || 
    currentUser.role === '관리자' || 
    currentUser.role === '부관리자'
  );

  // Access check condition rendering: If not allowed, show restricted protective layout
  if (!hasAccessRole) {
    return (
      <section className="py-12 md:py-24 bg-slate-50 flex items-center justify-center">
        <div className="mx-auto max-w-xl px-4 text-center">
          
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-500 border border-orange-100 shadow-xl mb-6">
            <Lock className="h-7 w-7" />
          </div>

          <span className="block text-xs font-black text-orange-600 tracking-widest font-sans uppercase">
            MEMBERSHIP RESTRICTED AREA
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            강사방 출입 권한 안내
          </h2>
          
          <div className="mt-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-550 text-xs sm:text-sm leading-relaxed text-slate-500 space-y-3">
            <p>
              이곳은 경기도 연천군 장애인 평생학습 <strong>제1기 전문 강사진 및 협회 임직원</strong>만을 위해 마련된 독립된 보안 통제 구역입니다.
            </p>
            <p>
              현장의 강의계획서 수립, 주차별 수업 성과 및 AAC 교구 자료실 다운로드 기능과 소통 비밀 게시판을 제공합니다.
            </p>
            <p className="text-orange-600 font-bold bg-orange-50/50 p-2.5 rounded-xl border border-orange-100 mt-2 font-sans text-xs">
              ⚠️ 권한 상태: {currentUser ? `일반회원 (등급 미충족)` : `로그인하지 않음 (비회원)`}
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
            {currentUser && currentUser.role === '일반회원' ? (
              <div className="space-y-4 w-full">
                <p className="text-[11px] text-slate-400">
                  현재 회원 등급은 <strong>일반회원</strong>입니다. 위 로그인 창 또는 아래 테스트 로그인 단축키를 눌러 "협회 강사" 권한으로 다 시 접근해 보실 수 있습니다.
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={onOpenAuth}
                    className="rounded-xl px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md active:scale-95 transition-all text-center cursor-pointer"
                  >
                    🔐 다른 계정으로 로그인 (역할 전환)
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">수월한 테스트를 위해 우측 상단 메뉴 또는 아래 원터치 로그인을 이용해 보세요!</p>
                <button
                  onClick={onOpenAuth}
                  className="rounded-xl px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
                >
                  <ShieldCheck className="h-4 w-4" />
                  강사 권한으로 즉시 로그인하여 입장하기
                </button>
              </div>
            )}
          </div>

        </div>
      </section>
    );
  }

  // ----------------------------------------------------
  // MESSAGE BOARD SUBMIT
  // ----------------------------------------------------
  const handlePostMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const newMessage: LoungeMessage = {
      id: `msg_${Date.now()}`,
      author: `${currentUser.name} (${currentUser.role})`,
      role: currentUser.role === '일반회원' ? '회원' : '강사',
      content: newContent,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
    };

    const updated = [newMessage, ...messages];
    setMessages(updated);
    localStorage.setItem('gonggam_lounge_v2', JSON.stringify(updated));
    setNewContent('');
  };

  const handleLike = (id: string) => {
    const updated = messages.map((msg) => {
      if (msg.id === id) {
        return { ...msg, likes: msg.likes + 1 };
      }
      return msg;
    });
    setMessages(updated);
    localStorage.setItem('gonggam_lounge_v2', JSON.stringify(updated));
  };

  // ----------------------------------------------------
  // LIBRARY FILE OPERATIONS
  // ----------------------------------------------------
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setNewFileName(droppedFile.name);
      
      // Calculate human readable file size
      const sizeInMB = (droppedFile.size / (1024 * 1024)).toFixed(1);
      setNewFileSize(`${sizeInMB} MB`);
      
      // Default auto-fill fields if empty
      if (!newFileTitle) {
        const titleWithoutExtension = droppedFile.name.substring(0, droppedFile.name.lastIndexOf('.')) || droppedFile.name;
        setNewFileTitle(titleWithoutExtension);
      }
    }
  };

  const handleCustomFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileTitle.trim()) return;

    const finalFileName = newFileName || `${newFileTitle.replace(/\s+/g, '_')}_첨부.pdf`;
    const finalFileSize = newFileSize || '2.4 MB';

    const newFile: LibraryFile = {
      id: `file_${Date.now()}`,
      title: newFileTitle,
      description: newFileDesc || '강사진들이 자유롭게 공유하고 다운받는 실무용 참고자료입니다.',
      uploader: currentUser ? `${currentUser.name} (${currentUser.role})` : '협회 강사',
      date: new Date().toISOString().split('T')[0],
      fileSize: finalFileSize,
      downloadsCount: 0,
      isOfficial: false,
    };

    const updated = [newFile, ...libraryFiles];
    setLibraryFiles(updated);
    localStorage.setItem('gonggam_library_files', JSON.stringify(updated));

    // Reset Form
    setNewFileTitle('');
    setNewFileDesc('');
    setNewFileName('');
    setNewFileSize('');
    setFileUploadSuccess(true);

    setTimeout(() => {
      setFileUploadSuccess(false);
    }, 3000);
  };

  const handleDownloadFile = (id: string) => {
    const updated = libraryFiles.map((file) => {
      if (file.id === id) {
        return { ...file, downloadsCount: file.downloadsCount + 1 };
      }
      return file;
    });
    setLibraryFiles(updated);
    localStorage.setItem('gonggam_library_files', JSON.stringify(updated));
    
    // Friendly alert mock down trigger
    alert(`[파일 다운로드 성공] \n"${libraryFiles.find(f => f.id === id)?.title}" 기제의 파일(웹캐시)이 오정 없이 정상 다운로드 되었습니다.`);
  };

  const handleDeleteFile = (id: string) => {
    if (window.confirm('선택하신 파일을 위 강사 자료실에서 영구 정밀 삭제하시겠습니까?')) {
      const updated = libraryFiles.filter((file) => file.id !== id);
      setLibraryFiles(updated);
      localStorage.setItem('gonggam_library_files', JSON.stringify(updated));
    }
  };

  return (
    <section className="py-12 md:py-20 bg-slate-50/40">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        
        {/* Header summary of Instructor lounge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100 mb-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-sky-600 bg-sky-50 font-sans tracking-wide">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-500 animate-pulse" />
              보안 인증됨 &middot; 강사 전용 허브 사랑방
            </span>
            <h2 className="mt-3 text-3xl font-black text-slate-800 tracking-tight">
              연천 전문 강사진 교육실습 아고라
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-xl">
              실무 교육계획서, 연구 일지 교류 및 마음언어 AAC 최신 인쇄 보충자재를 한곳에서 통제하는 전임 강사진 행정 연대망입니다.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-2 border border-slate-150 rounded-xl shadow-3xs shrink-0 self-start md:self-auto text-xs font-sans">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-600 font-bold">인증 접속자: </span>
            <span className="text-sky-600 font-black">{currentUser?.name} <span className="text-slate-400 font-medium font-sans">({currentUser?.role})</span></span>
          </div>
        </div>

        {/* Double Navigation tabs for Board vs Library */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-8 font-sans">
          <button
            onClick={() => setActiveSubTab('board')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'board'
                ? 'bg-white text-slate-800 shadow-sm font-extrabold'
                : 'text-slate-550 text-slate-550 hover:bg-slate-50/50 text-slate-500'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            1. 강사소통채널 게시판
          </button>
          <button
            onClick={() => setActiveSubTab('library')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'library'
                ? 'bg-white text-slate-800 shadow-sm font-extrabold'
                : 'text-slate-550 text-slate-550 hover:bg-slate-50/50 text-slate-500'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            2. 교수교안 및 자료실 (업로드/다운로드)
          </button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* SUB TAB: BOARD (소통채널 게시판) */}
        {/* ---------------------------------------------------- */}
        {activeSubTab === 'board' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Thread post entry form */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-300 to-sky-400" />
              
              <h3 className="text-xs font-bold text-slate-400 tracking-wider mb-3 uppercase font-sans">
                ✍️ 강사 실무 이야기 및 현장 소감 나누기
              </h3>

              <form onSubmit={handlePostMessage} className="space-y-4">
                <textarea
                  required
                  rows={3}
                  placeholder="오늘의 수업 분위기는 어땠나요? 마음언어 AAC 카드를 처음 꾹 누르던 수강생의 감촉, 야외 목장이나 숲 체험에서 발굴한 교육적 시도 등 애정 어린 교육 소감을 자유롭게 게시해 주십시오."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs sm:text-sm outline-none focus:border-sky-300 focus:bg-white transition-all font-sans leading-relaxed"
                />

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="rounded-xl px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white text-xs font-bold shadow-3xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 font-sans"
                  >
                    <Send className="h-3.5 w-3.5" />
                    사랑방에 소통글 게시
                  </button>
                </div>
              </form>
            </div>

            {/* Collapsed/List Message Feed */}
            {messages.length === 0 ? (
              <div className="p-16 text-center text-slate-400 font-sans bg-white border border-slate-100 rounded-3xl">
                게시된 대화가 없습니다. 첫 대화를 나누어 보셔요!
              </div>
            ) : (
              <div className="space-y-5">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-3xs hover:shadow-2xs transition-all relative"
                  >
                    
                    {/* Header block with avatar details */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-50 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center text-xs font-bold uppercase font-sans">
                          {msg.author.charAt(0)}
                        </div>
                        <div>
                          <span className="block text-xs sm:text-sm font-black text-slate-800 leading-none">
                            {msg.author}
                          </span>
                          <span className="inline-block text-[9px] font-black mt-1 text-sky-600 bg-sky-50 px-1.5 py-0.2 rounded-md border border-sky-100 font-sans leading-none">
                            협회 공인 강사진
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 font-sans">
                        작성날짜: {msg.date}
                      </span>
                    </div>

                    {/* Content text */}
                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-sans whitespace-pre-wrap">
                      {msg.content}
                    </p>

                    {/* Footer interactive bar */}
                    <div className="mt-4 pt-3.5 border-t border-slate-50 flex items-center gap-3">
                      <button
                        onClick={() => handleLike(msg.id)}
                        className="flex items-center gap-1 text-slate-500 hover:text-red-500 font-bold bg-slate-50 hover:bg-red-50/40 py-1 px-3 rounded-lg border border-slate-100 font-sans text-[11px] cursor-pointer transition-colors"
                      >
                        <Heart className="h-3.5 w-3.5 fill-red-400 text-red-400" />
                        수업 공감 ({msg.likes})
                      </button>

                      {msg.replies && msg.replies.length > 0 && (
                        <span className="text-slate-400 text-[10px] flex items-center gap-1 select-none font-sans">
                          <MessageSquare className="h-3 w-3" />
                          답글 {msg.replies.length}개
                        </span>
                      )}
                    </div>

                    {/* Sub comments rendering */}
                    {msg.replies && msg.replies.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-sky-200 bg-slate-50/50 p-4 rounded-xl space-y-3">
                        {msg.replies.map((rep) => (
                          <div key={rep.id} className="text-xs">
                            <span className="font-bold text-slate-700 font-sans">💬 {rep.author}</span>
                            <span className="text-[9px] text-slate-400 pl-2 font-sans">{rep.date}</span>
                            <p className="text-slate-600 mt-1 pl-4 leading-relaxed font-sans">{rep.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SUB TAB: LIBRARY (자료실 업로드/다운로드) */}
        {/* ---------------------------------------------------- */}
        {activeSubTab === 'library' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Standard file submission form */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-sky-400" />
              
              <h3 className="text-xs font-bold text-slate-400 tracking-wider mb-4 uppercase font-sans flex items-center gap-1.5">
                <UploadCloud className="h-4 w-4 text-slate-400" />
                협회 교수교안 & 강의보고서 신규 업로드 공유
              </h3>

              {fileUploadSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-sans text-xs flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  신규 수업 자료 교안이 강사 정보 보관실에 온전히 정상 기록 되었습니다! 다른 강사진에게 즉시 오픈됩니다.
                </div>
              )}

              <form onSubmit={handleCustomFileUpload} className="space-y-4">
                
                {/* Drag and Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    dragActive 
                      ? 'border-sky-500 bg-sky-50/30' 
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <UploadCloud className="h-10 w-10 text-slate-450 text-slate-400 mx-auto mb-2" />
                  
                  {newFileName ? (
                    <div className="space-y-1 font-sans">
                      <span className="block text-xs font-bold text-sky-600">{newFileName} ({newFileSize})</span>
                      <p className="text-[10px] text-slate-450 text-slate-400">교실 배포 자재가 장전되었습니다. 아래 세부 정보를 적고 업로드 버튼을 눌러주셔요.</p>
                    </div>
                  ) : (
                    <div className="font-sans">
                      <p className="text-xs font-bold text-slate-700">공유할 교안 보고서 파일을 드래그하여 여기에 놓아주세요</p>
                      <p className="text-[10px] text-slate-400 mt-1">또는 모의 가상 PDF, PPTX, HWP 출강 서식 수동 업로드 (아래 양식 직접 기입도 무관)</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-1 font-sans">자료명 / 교수계안 제목 *</label>
                    <input
                      type="text"
                      required
                      placeholder="예: '숲이 들려주는 행복 이야기 3주차 실외 실습지'"
                      value={newFileTitle}
                      onChange={(e) => setNewFileTitle(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-slate-700 outline-none focus:border-sky-300 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-1 font-sans">간략 설명 *</label>
                    <input
                      type="text"
                      required
                      placeholder="예: '숲 산책에서 활용할 수 있는 야생화 촉각 채색 프린트'"
                      value={newFileDesc}
                      onChange={(e) => setNewFileDesc(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-slate-700 outline-none focus:border-sky-300 font-sans"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="rounded-xl px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-3xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 font-sans"
                  >
                    <FileDown className="h-4 w-4" />
                    새 수업 자료 업로드 등록
                  </button>
                </div>

              </form>
            </div>

            {/* File lists table layout */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              
              <div className="p-4 bg-slate-50 border-b border-slate-150 border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 font-sans flex items-center gap-1.5">
                  📁 강사 학적 연구실 자재 다운로드 아카이브 ({libraryFiles.length})
                </span>
                <span className="text-[10px] text-slate-400">교사용 비공개 전용</span>
              </div>

              <div className="divide-y divide-slate-100">
                {libraryFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-5 md:p-6 hover:bg-slate-50/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    
                    <div className="flex items-start gap-3.5">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        file.isOfficial 
                          ? 'bg-sky-50 border-sky-200 text-sky-500' 
                          : 'bg-orange-50 border-orange-100 text-orange-500'
                      }`}>
                        <FileText className="h-5 w-5" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                            {file.title}
                          </h4>
                          {file.isOfficial && (
                            <span className="text-[9px] font-black text-sky-600 bg-sky-50 border border-sky-100 px-1.5 py-0.2 rounded font-sans uppercase">
                              협회 공식교재
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">{file.description}</p>
                        
                        {/* Meta lines */}
                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-sans pt-1">
                          <span>작성자: <strong className="text-slate-600 font-medium">{file.uploader}</strong></span>
                          <span>&middot;</span>
                          <span>날짜: {file.date}</span>
                          <span>&middot;</span>
                          <span>크기: {file.fileSize}</span>
                          <span>&middot;</span>
                          <span>다운로드: {file.downloadsCount}회</span>
                        </div>
                      </div>
                    </div>

                    {/* Download/Trash Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                      <button
                        onClick={() => handleDownloadFile(file.id)}
                        className="rounded-xl px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600 font-bold text-xs font-sans transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Download className="h-3.5 w-3.5" />
                        받기 (Download)
                      </button>

                      {!file.isOfficial && (
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          title="삭제"
                          className="rounded-xl p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 cursor-pointer transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
}
